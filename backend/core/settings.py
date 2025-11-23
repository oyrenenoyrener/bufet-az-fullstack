import os
from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv 
import dj_database_url
from django.core.exceptions import ImproperlyConfigured # Təhlükəsizlik üçün

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

# --- GİZLİ AÇARLAR VƏ STATUS ---
SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-TEST-KEY-CHANGE-ME-FOR-PROD')
DEBUG = os.getenv('DEBUG', 'True') == 'True' 

# backend/core/settings.py daxilində:

# --- ALLOWED_HOSTS HİSSƏSİ ---
# BACKEND HOST-u dəqiq təyin edirik
BACKEND_HOST = 'bufet-az-fullstack-production.up.railway.app' 
# FRONTEND HOST-u environment variable-dan götürürük
RAILWAY_FRONTEND_DOMAIN = os.getenv('FRONTEND_DOMAIN_RAILWAY', 'frontend-production-xxxxx.up.railway.app') 

# Default localhost və Backend domenlərini daxil edirik
ALLOWED_HOSTS = ['127.0.0.1', 'localhost', BACKEND_HOST]

# Əgər Frontend linki mövcuddursa, onu və wildcardı əlavə edirik.
if RAILWAY_FRONTEND_DOMAIN:
    ALLOWED_HOSTS.append(RAILWAY_FRONTEND_DOMAIN)
    ALLOWED_HOSTS.append('*.up.railway.app') # <--- BÜTÜN RAILWAY DOMENLƏRİ
# --- ALLOWED_HOSTS HİSSƏSİ BİTTİ ---

# ... Qalan ayarlar olduğu kimi qalır ...

# CSRF-i də yeniləyirik, çünki BACKEND_HOST dəyişib
CSRF_TRUSTED_ORIGINS = [
    'https://*.up.railway.app', 
    'http://localhost:3000', 
    'https://' + RAILWAY_FRONTEND_DOMAIN,
    'https://' + BACKEND_HOST # <--- BURANI DA ƏLAVƏ ET
]
# --- QURAŞDIRILMIŞ TƏTBİQLƏR ---
INSTALLED_APPS = [
    'daphne', 
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',       
    'corsheaders',          
    'channels',             
    'users',                
    'chat',                 
]

# --- MIDDLEWARE ---
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware', 
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware', # STATIC FAYLLAR ÜÇÜN
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'core.urls'

# --- ⚠️ DÜZƏLİŞ: TEMPLATES (ADMIN FIX) ---
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates', # <--- BU VACİBDİR
        'DIRS': [],
        'APP_DIRS': True, 
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]
# --- DÜZƏLİŞ BİTDİ ---

WSGI_APPLICATION = 'core.wsgi.application'
ASGI_APPLICATION = 'core.asgi.application'

# --- VERİLƏNLƏR BAZASI (PostgreSQL dəstəyi) ---
DATABASES = {
    'default': dj_database_url.config(
        default='sqlite:///' + str(BASE_DIR / 'db.sqlite3'),
        conn_max_age=600
    )
}

# --- ÇAT YADDAŞI ---
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels.layers.InMemoryChannelLayer"
    }
}

# --- STATİK FAYLLAR ---
STATIC_URL = 'static/'
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'
STATIC_ROOT = BASE_DIR / 'staticfiles' 

# --- TOKEN & TƏHLÜKƏSİZLİK ---
REST_FRAMEWORK = {'DEFAULT_AUTHENTICATION_CLASSES': ('rest_framework_simplejwt.authentication.JWTAuthentication',),}
SIMPLE_JWT = {'ACCESS_TOKEN_LIFETIME': timedelta(days=1), 'REFRESH_TOKEN_LIFETIME': timedelta(days=5), 'ROTATE_REFRESH_TOKENS': True, 'BLACKLIST_AFTER_ROTATION': True, 'AUTH_HEADER_TYPES': ('Bearer',),}

# --- CORS & CSRF ---
CSRF_TRUSTED_ORIGINS = [
    'https://*.up.railway.app', 
    'http://localhost:3000', 
    'https://' + RAILWAY_FRONTEND_DOMAIN
]
CORS_ALLOW_ALL_ORIGINS = True 
CORS_ALLOW_CREDENTIALS = True

# --- DİL ---
LANGUAGE_CODE = 'az' 
TIME_ZONE = 'Asia/Baku'
USE_I18N = True
USE_TZ = True