import graphene
from graphene_django import DjangoObjectType
from .models import Dataset, Resource

class ResourceType(DjangoObjectType):
    class Meta:
        model = Resource
        fields = ('id', 'name', 'description', 'format', 'url', 'created', 'last_modified')

class DatasetType(DjangoObjectType):
    class Meta:
        model = Dataset
        fields = (
            'ckan_id', 'name', 'title', 'notes', 'author',
            'author_email', 'organization_title', 'license_title',
            'metadata_created', 'metadata_modified', 'state', 'private',
            'tags', 'groups'
        )

class Query(graphene.ObjectType):
    all_datasets = graphene.List(DatasetType)
    dataset_by_id = graphene.Field(DatasetType, ckan_id=graphene.String(required=True))
    search_datasets = graphene.List(DatasetType, keyword=graphene.String(required=True))

    # Obtenir tous les datasets
    def resolve_all_datasets(root, info):
        return Dataset.objects.all()

    # Rechercher un dataset précis par ckan_id
    def resolve_dataset_by_id(root, info, ckan_id):
        try:
            return Dataset.objects.get(ckan_id=ckan_id)
        except Dataset.DoesNotExist:
            return None

    # Recherche par mot-clé dans le titre ou la description
    def resolve_search_datasets(root, info, keyword):
        return Dataset.objects.filter(title__icontains=keyword) | Dataset.objects.filter(notes__icontains=keyword)

schema = graphene.Schema(query=Query)