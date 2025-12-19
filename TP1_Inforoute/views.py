from rest_framework import viewsets
from .models import Dataset, Resource
from .serializers import DatasetSerializer, ResourceSerializer, RegisterSerializer
from rest_framework import filters
from django.shortcuts import render
from django.db.models import Count
from .models import Dataset
from django.db.models.functions import TruncMonth
from django.shortcuts import render, get_object_or_404
import json
import requests
from datetime import date
from django.utils import timezone
from django.core.paginator import Paginator
from django.db.models import Q
from django.utils.dateparse import parse_datetime
from rest_framework import generics


class DatasetViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Dataset.objects.all()
    serializer_class = DatasetSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'notes', 'tags', 'organization_title']
    ordering_fields = ['metadata_modified', 'title']

class ResourceViewSet(viewsets.ModelViewSet):
    queryset = Resource.objects.all()
    serializer_class = ResourceSerializer

def dataset_list(request):
    datasets = Dataset.objects.all()
    
    # Recherche
    search_query = request.GET.get('search', '')
    if search_query:
        datasets = datasets.filter(
            Q(title__icontains=search_query) |
            Q(notes__icontains=search_query) |
            Q(organization_title__icontains=search_query) |
            Q(tags__name__icontains=search_query)
        ).distinct()
    
    # Tri
    ordering = request.GET.get('ordering', '-metadata_modified')
    if ordering:
        datasets = datasets.order_by(ordering)
    
    return render(request, 'datasets_list.html', {'datasets': datasets})

def dataset_detail(request, ckan_id):
    response = requests.get(f"https://www.donneesquebec.ca/recherche/api/3/action/package_show?id={ckan_id}")
    data = response.json()

    dataset = data["result"]
    resources = dataset.get("resources", [])
    dataset["metadata_created"] = parse_datetime(dataset.get("metadata_created"))
    dataset["metadata_modified"] = parse_datetime(dataset.get("metadata_modified"))
    dataset["organization_title"] = dataset.get("organization_title") or dataset.get("organization", {}).get("title")
    dataset["organization_id"] = dataset.get("organization_id") or dataset.get("organization", {}).get("id")

    return render(request, "dataset_detail.html", {
        "dataset": dataset,
        "resources": resources
    })

def stats_view(request):
    # Nombre de jeux par organisation
    org_data = (
        Dataset.objects
        .values('organization_title')
        .annotate(total=Count('organization_title'))
        .order_by('-total')[:10]
    )

    # Répartition par état
    state_data = (
        Dataset.objects
        .values('state')
        .annotate(total=Count('state'))
        .order_by('-total')
    )

    # Nombre de jeux créés par mois
    temporal_data = (
        Dataset.objects
        .exclude(metadata_created__isnull=True)
        .annotate(month=TruncMonth('metadata_created'))
        .values('month')
        .annotate(total=Count('ckan_id'))
        .order_by('month')
    )

    # Fréquence depuis dernière mise à jour (en jours)
    datasets_with_update = Dataset.objects.exclude(metadata_modified__isnull=True)
    today = timezone.now().date()
    days_since_update = [(today - d.metadata_modified.date()).days for d in datasets_with_update]
    bins = [0, 30, 60, 90, 180, 365, 10000]  # en jours
    labels = ["0-30", "31-60", "61-90", "91-180", "181-365", "365+"]
    freq_values = [0] * (len(bins)-1)

    for days in days_since_update:
        for i in range(len(bins)-1):
            if bins[i] <= days < bins[i+1]:
                freq_values[i] += 1
                break

    # Répartition par licence
    license_data = (
        Dataset.objects
        .values('license_title')
        .annotate(total=Count('license_title'))
        .order_by('-total')
    )

    # Public vs Privé
    public_count = Dataset.objects.filter(private=False).count()
    private_count = Dataset.objects.filter(private=True).count()

    context = {
        'org_labels': [d['organization_title'] or "Inconnue" for d in org_data],
        'org_values': [d['total'] for d in org_data],
        'state_labels': [d['state'] or "Non spécifiée" for d in state_data],
        'state_values': [d['total'] for d in state_data],
        'temporal_labels': [d['month'].strftime('%Y-%m') for d in temporal_data if d['month'] is not None],
        'temporal_values': [d['total'] for d in temporal_data if d['month'] is not None],
        'freq_labels': labels,
        'freq_values': freq_values,
        'license_labels': [d['license_title'] or "Non spécifiée" for d in license_data],
        'license_values': [d['total'] for d in license_data],
        'public_count': public_count,
        'private_count': private_count,
        'total_datasets': Dataset.objects.count(),
        'total_orgs': Dataset.objects.values('organization_title').distinct().count(),
        'recent_updates': Dataset.objects.filter(metadata_modified__month=today.month).count()
    }

    return render(request, 'stats.html', context)

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer