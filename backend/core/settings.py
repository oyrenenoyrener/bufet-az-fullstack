import os
import dj_database_url # <--- BU VACİBDİR
from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv 

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-test-key')
DEBUG = True
ALLOWED_HOSTS = ['*']

# --- 1. TƏTBİQLƏR (SIRALAMA ÇOX VACİBDİR) ---
INSTALLED_APPS = [
    'daphne', # <--- 1. ƏN BİRİNCİ (Asinxron Server)
    
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # 3-cü tərəf
    'rest_framework',       # API
    'corsheaders',          # İcazələr (CORS)
    'channels',             # WebSocket (Çat)

    # Bizimkilər
    'users',                # Qeydiyyat/Profil
    'chat',                 # Mesajlaşma
]

# --- 2. MIDDLEWARE (SIRALAMA ÇOX VACİBDİR) ---
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware', # <--- ⚠️ ƏN YUXARIDA OLMALIDIR!
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
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

# --- SERVER AYARLARI ---
WSGI_APPLICATION = 'core.wsgi.application'
ASGI_APPLICATION = 'core.asgi.application' # <--- Çat üçün vacibdir

# --- BAZA (SQLite qalsın, problemsizdir) ---
# --- VERİLƏNLƏR BAZASI (Ağıllı Seçim) ---
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

# --- İSTİFADƏÇİ ---
AUTH_USER_MODEL = 'users.User' 

# --- ŞİFRƏ ---
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
]

# --- DİL ---
LANGUAGE_CODE = 'az' 
TIME_ZONE = 'Asia/Baku'
USE_I18N = True
USE_TZ = True

# --- FAYLLAR ---
STATIC_URL = 'static/'
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# --- TOKEN AYARLARI ---
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=5),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# --- CORS İCAZƏLƏRİ (HƏR ŞEYİ AÇIRIQ) ---
CORS_ALLOW_ALL_ORIGINS = True   
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_METHODS = [
    "DELETE",
    "GET",
    "OPTIONS",
    "PATCH",
    "POST",
    "PUT",
]
# --- TƏHLÜKƏSİZLİK (Railway Domeninə İcazə) ---
# Railway sənə "up.railway.app" ilə bitən domen verir.
CSRF_TRUSTED_ORIGINS = [
    'https://*.railway.app',
    'https://bufet-frontend.railway.app', # Sənin frontend linkin (təxmini)
]
