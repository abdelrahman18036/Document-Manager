from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DocumentViewSet, DocumentVersionViewSet, AnnotationViewSet, login_user, register_user

router = DefaultRouter()
router.register(r'documents', DocumentViewSet)
router.register(r'versions', DocumentVersionViewSet, basename='version')
router.register(r'annotations', AnnotationViewSet, basename='annotation')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/login/', login_user, name='login'),
    path('auth/register/', register_user, name='register'),
    
    # Explicit document-related paths
    path('documents/<int:document_id>/versions/', DocumentVersionViewSet.as_view({'get': 'list', 'post': 'create'}), name='document-versions'),
    
    path('documents/<int:document_id>/versions/<int:pk>/', DocumentVersionViewSet.as_view({'get': 'retrieve', 'delete': 'destroy'}), name='document-version-detail'),
    
    path('documents/<int:document_id>/annotations/', AnnotationViewSet.as_view({'get': 'list', 'post': 'create'}), name='document-annotations'),
    
    path('documents/<int:document_id>/annotations/<int:pk>/', AnnotationViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='document-annotation-detail'),
    
    path('documents/<int:pk>/search/', DocumentViewSet.as_view({'get': 'search'}), name='document-search'),
] 