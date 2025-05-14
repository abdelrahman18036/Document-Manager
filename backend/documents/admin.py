from django.contrib import admin
from .models import Document, DocumentVersion, Annotation

@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ('name', 'file_type', 'owner', 'created_at', 'is_ocr_processed')
    list_filter = ('file_type', 'is_ocr_processed', 'created_at')
    search_fields = ('name', 'owner__username', 'text_content')
    readonly_fields = ('created_at', 'updated_at')
    date_hierarchy = 'created_at'
    
    fieldsets = (
        (None, {
            'fields': ('name', 'file', 'file_type', 'owner')
        }),
        ('Content Information', {
            'fields': ('is_ocr_processed', 'text_content'),
            'classes': ('collapse',),
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )

@admin.register(DocumentVersion)
class DocumentVersionAdmin(admin.ModelAdmin):
    list_display = ('document', 'version_number', 'created_by', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('document__name', 'created_by__username')
    raw_id_fields = ('document', 'created_by')
    
    fieldsets = (
        (None, {
            'fields': ('document', 'version_number', 'file', 'created_by')
        }),
        ('Metadata', {
            'fields': ('created_at',),
            'classes': ('collapse',),
        }),
    )
    
    readonly_fields = ('created_at',)

@admin.register(Annotation)
class AnnotationAdmin(admin.ModelAdmin):
    list_display = ('type', 'document', 'user', 'page', 'created_at')
    list_filter = ('type', 'created_at')
    search_fields = ('document__name', 'user__username', 'content')
    raw_id_fields = ('document', 'user')
    
    fieldsets = (
        (None, {
            'fields': ('document', 'user', 'type', 'content')
        }),
        ('Position', {
            'fields': ('page', 'position_x', 'position_y'),
        }),
        ('Metadata', {
            'fields': ('created_at',),
            'classes': ('collapse',),
        }),
    )
    
    readonly_fields = ('created_at',)
