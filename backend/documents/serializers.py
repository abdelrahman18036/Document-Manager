from rest_framework import serializers
from .models import Document, DocumentVersion, Annotation
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class AnnotationSerializer(serializers.ModelSerializer):
    created_by = serializers.ReadOnlyField()
    
    class Meta:
        model = Annotation
        fields = ['id', 'document', 'user', 'type', 'content', 'page', 
                 'position_x', 'position_y', 'created_at', 'created_by']
        read_only_fields = ['document', 'user', 'created_at', 'created_by']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class DocumentVersionSerializer(serializers.ModelSerializer):
    created_by = serializers.ReadOnlyField(source='created_by.username')
    file_url = serializers.ReadOnlyField()
    
    class Meta:
        model = DocumentVersion
        fields = ['id', 'document', 'version_number', 'file', 'file_url', 
                 'created_at', 'created_by']
        read_only_fields = ['document', 'version_number', 'created_by', 'created_at']
    
    def create(self, validated_data):
        # Auto-increment version number
        validated_data['version_number'] = 1
        document = validated_data.get('document')
        if document:
            latest_version = document.versions.order_by('-version_number').first()
            if latest_version:
                validated_data['version_number'] = latest_version.version_number + 1
        
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

class DocumentSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    versions = DocumentVersionSerializer(many=True, read_only=True)
    annotations = AnnotationSerializer(many=True, read_only=True)
    url = serializers.ReadOnlyField()
    current_version_id = serializers.ReadOnlyField()
    
    class Meta:
        model = Document
        fields = ['id', 'name', 'file', 'file_type', 'created_at', 'updated_at', 
                 'owner', 'is_ocr_processed', 'text_content', 'versions', 
                 'annotations', 'url', 'current_version', 'current_version_id']
        read_only_fields = ['owner', 'created_at', 'updated_at', 'is_ocr_processed', 
                           'current_version_id', 'url']
    
    def create(self, validated_data):
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data) 