from django.db import models
from django.contrib.auth.models import User

class Document(models.Model):
    name = models.CharField(max_length=255)
    file = models.FileField(upload_to='documents/')
    file_type = models.CharField(max_length=50)  # PDF, DOCX, etc.
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='documents')
    is_ocr_processed = models.BooleanField(default=False)
    text_content = models.TextField(blank=True, null=True)  # Extracted text for search
    current_version = models.ForeignKey('DocumentVersion', on_delete=models.SET_NULL, null=True, blank=True, related_name='current_for')
    
    @property
    def url(self):
        """Return the URL of the current version's file or this document's file"""
        if self.current_version:
            return self.current_version.file.url
        return self.file.url
    
    @property
    def current_version_id(self):
        """Return the ID of the current version if it exists"""
        if self.current_version:
            return self.current_version.id
        return None
    
    def __str__(self):
        return self.name

class DocumentVersion(models.Model):
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='versions')
    version_number = models.PositiveIntegerField()
    file = models.FileField(upload_to='document_versions/')
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    
    class Meta:
        unique_together = ('document', 'version_number')
        ordering = ['-version_number']
    
    @property
    def file_url(self):
        """Return the URL of this version's file"""
        return self.file.url
    
    def __str__(self):
        return f"{self.document.name} - v{self.version_number}"

class Annotation(models.Model):
    ANNOTATION_TYPES = (
        ('highlight', 'Highlight'),
        ('comment', 'Comment'),
        ('drawing', 'Drawing'),
    )
    
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='annotations')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    type = models.CharField(max_length=20, choices=ANNOTATION_TYPES)
    content = models.TextField()
    page = models.PositiveIntegerField(default=1)
    position_x = models.FloatField(null=True, blank=True)
    position_y = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    @property
    def created_by(self):
        """Return the username of the annotation creator"""
        return self.user.username
    
    def __str__(self):
        return f"{self.type} by {self.user.username} on {self.document.name}" 