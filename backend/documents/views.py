from django.shortcuts import render
from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import Document, DocumentVersion, Annotation
from .serializers import DocumentSerializer, DocumentVersionSerializer, AnnotationSerializer, UserSerializer
import PyPDF2
import io
import re

# Create your views here.

class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.owner == request.user

def extract_text_from_pdf(file_content):
    """Extract text from a PDF file using PyPDF2"""
    try:
        # Create a file-like object from the bytes
        pdf_file = io.BytesIO(file_content)
        
        # Create a PDF reader
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        
        # Extract text from each page
        text_content = ""
        page_texts = []
        
        for page_num, page in enumerate(pdf_reader.pages):
            page_text = page.extract_text()
            if page_text:
                text_content += f"\n\n--- PAGE {page_num + 1} ---\n\n"
                text_content += page_text
                page_texts.append({"page": page_num + 1, "text": page_text})
        
        return text_content, page_texts
    except Exception as e:
        print(f"Error extracting text from PDF: {e}")
        return "", []

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = User.objects.create_user(
            username=serializer.validated_data['username'],
            email=serializer.validated_data['email'],
            password=request.data['password']
        )
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'username': user.username,
            'email': user.email
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    username = request.data.get('username', '')
    password = request.data.get('password', '')
    
    if not username or not password:
        return Response(
            {'error': 'Please provide both username and password'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        user = authenticate(username=username, password=password)
        
        if user:
            token, created = Token.objects.get_or_create(user=user)
            response_data = {
                'token': token.key,
                'user_id': user.pk,
                'username': user.username,
                'email': user.email
            }
            print(f"User {username} logged in successfully")
            return Response(response_data, status=status.HTTP_200_OK)
        else:
            print(f"Failed login attempt for user {username}")
            return Response(
                {'error': 'Invalid credentials - username or password incorrect'},
                status=status.HTTP_401_UNAUTHORIZED
            )
    except Exception as e:
        print(f"Login error: {str(e)}")
        return Response(
            {'error': 'An error occurred during login'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'text_content']
    
    def get_queryset(self):
        user = self.request.user
        # Show documents owned by the user
        return Document.objects.filter(owner=user)
    
    def perform_create(self, serializer):
        document = serializer.save(owner=self.request.user)
        
        # If this is a new document, create the first version
        if 'file' in serializer.validated_data:
            version = DocumentVersion.objects.create(
                document=document,
                version_number=1,
                file=document.file,
                created_by=self.request.user
            )
            # Set this as the current version
            document.current_version = version
            document.save()
            
            # Process PDF extraction if it's a PDF
            if document.file_type.lower() == 'pdf':
                try:
                    # Read the file content
                    document.file.seek(0)
                    file_content = document.file.read()
                    
                    # Extract text from PDF
                    text_content, _ = extract_text_from_pdf(file_content)
                    
                    # Update document with extracted text
                    document.text_content = text_content
                    document.is_ocr_processed = True
                    document.save()
                    
                except Exception as e:
                    print(f"Error processing PDF document: {e}")
    
    @action(detail=True, methods=['get'], url_path='version-list')
    def list_versions(self, request, pk=None):
        document = self.get_object()
        versions = document.versions.all()
        serializer = DocumentVersionSerializer(versions, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], url_path='version-create')
    def create_version(self, request, pk=None):
        document = self.get_object()
        
        # Handle file upload
        if 'file' not in request.FILES:
            return Response({"error": "No file provided"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create a new version
        version_number = 1
        latest_version = document.versions.order_by('-version_number').first()
        if latest_version:
            version_number = latest_version.version_number + 1
        
        version = DocumentVersion.objects.create(
            document=document,
            version_number=version_number,
            file=request.FILES['file'],
            created_by=request.user
        )
        
        # Set this as the current version
        document.current_version = version
        document.save()
        
        serializer = DocumentVersionSerializer(version)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['get'], url_path='annotations')
    def get_annotations(self, request, pk=None):
        document = self.get_object()
        annotations = document.annotations.all()
        serializer = AnnotationSerializer(annotations, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], url_path='create-annotation')
    def create_annotation(self, request, pk=None):
        document = self.get_object()
        
        # Extract data from request
        content = request.data.get('content')
        annotation_type = request.data.get('type', 'comment')
        page = request.data.get('page', 1)
        position_x = request.data.get('position_x')
        position_y = request.data.get('position_y')
        
        # Validate required fields
        if not content:
            return Response({"error": "Content is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create annotation
        annotation = Annotation.objects.create(
            document=document,
            user=request.user,
            type=annotation_type,
            content=content,
            page=page,
            position_x=position_x,
            position_y=position_y
        )
        
        serializer = AnnotationSerializer(annotation)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['get'])
    def search(self, request, pk=None):
        document = self.get_object()
        query = request.query_params.get('query', '')
        
        if not query:
            return Response({
                "matches": []
            })
        
        # Check if text content is available
        if not document.text_content:
            # If no text content and it's a PDF, try to extract it now
            if document.file_type.lower() == 'pdf':
                try:
                    # Read the file content
                    file_content = document.file.read()
                    
                    # Extract text from PDF
                    text_content, _ = extract_text_from_pdf(file_content)
                    
                    # Update document with extracted text
                    document.text_content = text_content
                    document.is_ocr_processed = True
                    document.save()
                except Exception as e:
                    print(f"Error processing PDF document during search: {e}")
                    return Response({
                        "matches": [],
                        "error": "Could not extract text from document"
                    })
            else:
                return Response({
                    "matches": [],
                    "error": "Document doesn't have searchable text content"
                })
        
        # Improved search implementation
        matches = []
        query_lower = query.lower()
        
        # Split text content by page markers
        page_pattern = r"--- PAGE (\d+) ---\n\n"
        page_splits = re.split(page_pattern, document.text_content)
        
        # The split results in [text_before_first_marker, page1, text1, page2, text2, ...]
        # So we need to process it accordingly
        for i in range(1, len(page_splits), 2):
            if i + 1 < len(page_splits):
                page_num = int(page_splits[i])
                page_text = page_splits[i + 1]
                
                # Check if the query exists in this page
                if query_lower in page_text.lower():
                    # Find all occurrences
                    text_lower = page_text.lower()
                    start_idx = 0
                    while start_idx < len(text_lower):
                        match_idx = text_lower.find(query_lower, start_idx)
                        if match_idx == -1:
                            break
                        
                        # Extract context around the match (100 chars)
                        context_start = max(0, match_idx - 50)
                        context_end = min(len(page_text), match_idx + len(query) + 50)
                        preview = page_text[context_start:context_end]
                        
                        # Add ellipsis if needed
                        if context_start > 0:
                            preview = "..." + preview
                        if context_end < len(page_text):
                            preview = preview + "..."
                        
                        # Add match information
                        matches.append({
                            "page": page_num,
                            "text": query,
                            "preview": preview
                        })
                        
                        # Move to next potential match
                        start_idx = match_idx + len(query)
        
        return Response({
            "matches": matches
        })

class DocumentVersionViewSet(viewsets.ModelViewSet):
    serializer_class = DocumentVersionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        document_id = self.kwargs.get('document_id')
        if document_id:
            # Handle nested route
            return DocumentVersion.objects.filter(
                document_id=document_id,
                document__owner=self.request.user
            )
        # Handle standard route
        return DocumentVersion.objects.filter(document__owner=self.request.user)
    
    def create(self, request, *args, **kwargs):
        document_id = self.kwargs.get('document_id')
        if not document_id:
            document_id = request.data.get('document')
            
        document = get_object_or_404(Document, id=document_id)
        
        # Handle file upload
        if 'file' not in request.FILES:
            return Response({"error": "No file provided"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create a new version
        version_number = 1
        latest_version = document.versions.order_by('-version_number').first()
        if latest_version:
            version_number = latest_version.version_number + 1
        
        version = DocumentVersion.objects.create(
            document=document,
            version_number=version_number,
            file=request.FILES['file'],
            created_by=request.user
        )
        
        # Set this as the current version
        document.current_version = version
        document.save()
        
        serializer = self.get_serializer(version)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    def destroy(self, request, *args, **kwargs):
        version = self.get_object()
        document = version.document
        
        # Don't allow deleting the only version
        if document.versions.count() <= 1:
            return Response(
                {"error": "Cannot delete the only version of a document"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # If this is the current version, set the latest remaining version as current
        if document.current_version == version:
            latest_version = document.versions.exclude(id=version.id).order_by('-version_number').first()
            if latest_version:
                document.current_version = latest_version
                document.save()
        
        return super().destroy(request, *args, **kwargs)

class AnnotationViewSet(viewsets.ModelViewSet):
    serializer_class = AnnotationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        document_id = self.kwargs.get('document_id')
        if document_id:
            # Handle nested route - get annotations for specific document
            return Annotation.objects.filter(
                document_id=document_id
            ).filter(
                Q(user=self.request.user) | Q(document__owner=self.request.user)
            )
        # Handle standard route - get all annotations
        return Annotation.objects.filter(
            Q(user=self.request.user) | Q(document__owner=self.request.user)
        )
    
    def create(self, request, *args, **kwargs):
        document_id = self.kwargs.get('document_id')
        if not document_id:
            document_id = request.data.get('document')
            
        document = get_object_or_404(Document, id=document_id)
        
        # Extract data from request
        content = request.data.get('content')
        annotation_type = request.data.get('type', 'comment')
        page = request.data.get('page', 1)
        position_x = request.data.get('position_x')
        position_y = request.data.get('position_y')
        
        # Validate required fields
        if not content:
            return Response({"error": "Content is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create annotation
        annotation = Annotation.objects.create(
            document=document,
            user=request.user,
            type=annotation_type,
            content=content,
            page=page,
            position_x=position_x,
            position_y=position_y
        )
        
        serializer = self.get_serializer(annotation)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
