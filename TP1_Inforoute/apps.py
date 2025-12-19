from django.apps import AppConfig
from django.db.utils import OperationalError
from django.core.management import call_command

class TP1InforouteConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'TP1_Inforoute'

    def ready(self):
        try:
            from .models import Dataset

            if not Dataset.objects.exists():
                print("Base vide — lancement automatique du fetch des jeux de données...")
                call_command('fetch_data')
        except OperationalError:
            pass
        except Exception as e:
            print(f"Erreur pendant l'initialisation : {e}")