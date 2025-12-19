from django.contrib import admin
from .models import Dataset, Resource

@admin.register(Dataset)
class DatasetAdmin(admin.ModelAdmin):
    list_display = ("title", "organization_title", "metadata_modified", "state")
    list_filter = ("organization_title", "metadata_modified", "state")
    search_fields = ("title", "notes", "organization_title", "tags")
    ordering = ("-metadata_modified",)
    readonly_fields = ("ckan_id", "metadata_created", "metadata_modified")

    fieldsets = (
        ("Informations principales", {
            "fields": ("title", "name", "notes", "organization_title", "state"),
        }),
        ("Métadonnées", {
            "fields": ("ckan_id", "metadata_created", "metadata_modified"),
        }),
        ("Autres informations", {
            "fields": ("tags",),
        }),
    )

@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = ("name", "format", "dataset")
    list_filter = ("format",)
    search_fields = ("name", "description")
    ordering = ("-name",)