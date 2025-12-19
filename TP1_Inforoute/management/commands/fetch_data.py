import requests
from django.core.management.base import BaseCommand
from django.utils.dateparse import parse_datetime
from TP1_Inforoute.models import Dataset, Resource

CKAN_BASE_URL = "https://www.donneesquebec.ca/recherche/api/3/action"

class Command(BaseCommand):

    def handle(self, *args, **options):
        self.stdout.write("Début du moissonnage CKAN...")

        start = 0
        rows = 100  # nombre de datasets par page
        total_fetched = 0
        #max_datasets = 100 # Limite max de datasets

        while True: # changer 'True' pour  while total_fetched < max_datasets

            #remaining = max_datasets - total_fetched
            #batch_size = min(rows, remaining)

            search_url = f"{CKAN_BASE_URL}/package_search?start={start}&rows={rows}"
            response = requests.get(search_url)
            if not response.ok:
                self.stdout.write(self.style.ERROR("Erreur lors de la récupération des datasets"))
                break

            results = response.json().get("result", {})
            datasets_list = results.get("results", [])

            if not datasets_list:
                break

            for data in datasets_list:
                dataset, created = Dataset.objects.update_or_create(
                    ckan_id=data.get("id"),
                    defaults={
                        "name": data.get("name"),
                        "title": data.get("title"),
                        "notes": data.get("notes"),
                        "author": data.get("author"),
                        "author_email": data.get("author_email"),
                        "organization_id": (data.get("organization") or {}).get("id"),
                        "organization_title": (data.get("organization") or {}).get("title"),
                        "license_id": data.get("license_id"),
                        "license_title": data.get("license_title"),
                        "license_url": data.get("license_url"),
                        "metadata_created": parse_datetime(data.get("metadata_created")),
                        "metadata_modified": parse_datetime(data.get("metadata_modified")),
                        "state": data.get("state"),
                        "private": data.get("private", False),
                        "tags": [t["display_name"] for t in data.get("tags", [])],
                        "groups": [g["display_name"] for g in data.get("groups", [])],
                    },
                )

                resources_data = data.get("resources", [])
                resources_count = 0

                for res in resources_data:
                    Resource.objects.update_or_create(
                        url=res.get("url"),
                        dataset=dataset,
                        defaults={
                            "name": res.get("name"),
                            "description": res.get("description"),
                            "format": res.get("format"),
                            "resource_type": res.get("resource_type"),
                        },
                    )
                    resources_count += 1

                action = "Créé" if created else "Mis à jour"
                self.stdout.write(f"-- {action} : {dataset.title} ({resources_count} ressources)")

            total_fetched += len(datasets_list)
            start += rows
            self.stdout.write(f"**Total moissonnés : {total_fetched}")

        self.stdout.write(self.style.SUCCESS("$$ Moissonnage terminé avec succès ! $$"))