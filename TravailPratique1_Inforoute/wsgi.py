"""
WSGI config for TravailPratique1_Inforoute project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/wsgi/
"""


import os
import sys
from pathlib import Path

current_dir = Path(__file__).resolve().parent
project_root = current_dir.parent

sys.path.insert(0, str(project_root))
sys.path.insert(0, str(current_dir))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'TravailPratique1_Inforoute.settings')

for i, path in enumerate(sys.path[:5], 1):
    print(f"   {i}. {path}")
print("=" * 60)

settings_path = project_root / 'TravailPratique1_Inforoute' / 'settings.py'

init_path = project_root / 'TravailPratique1_Inforoute' / '__init__.py'

try:
    from django.conf import settings

except Exception as e:
    import traceback
    traceback.print_exc()

print("=" * 60)

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
