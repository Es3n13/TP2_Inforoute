from django.db import models
from django.contrib.auth.models import User

class Dataset(models.Model):
    # Identifiants
    ckan_id = models.CharField(max_length=36, primary_key=True)  # UUID CKAN
    name = models.CharField(max_length=255)
    title = models.CharField(max_length=500)
    
    # Description et informations générales
    notes = models.TextField(blank=True, null=True)
    author = models.CharField(max_length=1000, blank=True, null=True)
    author_email = models.EmailField(blank=True, null=True)
    
    # Organisation
    organization_id = models.CharField(max_length=36, blank=True, null=True)
    organization_title = models.CharField(max_length=255, blank=True, null=True)
    
    # Informations complémentaires
    license_id = models.CharField(max_length=50, blank=True, null=True)
    license_title = models.CharField(max_length=255, blank=True, null=True)
    license_url = models.URLField(blank=True, null=True)
    
    # Dates
    metadata_created = models.DateTimeField(blank=True, null=True)
    metadata_modified = models.DateTimeField(blank=True, null=True)
    
    # Statut et confidentialité
    state = models.CharField(max_length=50, blank=True, null=True)
    private = models.BooleanField(default=False)
    
    # Tags et groupes stockés en JSON
    tags = models.JSONField(blank=True, null=True)
    groups = models.JSONField(blank=True, null=True)

    def __str__(self):
        return f"{self.title} ({self.name})"
    
class Resource(models.Model):
    dataset = models.ForeignKey(Dataset, related_name='resources', on_delete=models.CASCADE)
    name = models.CharField(max_length=200, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    format = models.CharField(max_length=50, blank=True, null=True)
    url = models.URLField(blank=True, null=True)
    resource_type = models.CharField(max_length=50, blank=True, null=True)

    def __str__(self):
        return f"{self.name} ({self.format})"
    
class Profile(models.Model):
    ROLE_CHOICES = [
        ("user", "Utilisateur"),
        ("admin", "Administrateur"),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    phone_number = models.CharField(max_length=20, blank=True)
    avatar = models.ImageField(upload_to="avatars/", null=True, blank=True)
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, default="user")

    def __str__(self):
        return self.user.username