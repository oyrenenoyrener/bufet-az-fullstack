from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # 👇 BU ƏSAS YOLLARDAN BİRİDİR! YOX IDI!
    path('admin/', admin.site.urls), 
    
    path('api/users/', include('users.urls')),
]

# Media və Static faylların deployment üçün saxlanması
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)