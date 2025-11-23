from django.urls import path
from .views import (
    RegisterView, UserProfileView, NewsListView,
    UniversityListView, FacultyListView, SpecialtyListView, GroupListView, AssignGroupView,
    MarketListCreateView, FeedListCreateView, FeedCommentCreateView # <-- Views
)
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)
from .serializers import PhoneNumberTokenObtainPairSerializer

# Yeni Login View-u yaradırıq ki, custom serializeri istifadə etsin
from rest_framework_simplejwt.views import TokenObtainPairView
CustomTokenObtainPairView = TokenObtainPairView.as_view(serializer_class=PhoneNumberTokenObtainPairSerializer)


urlpatterns = [
    # --- AUTH (Giriş/Qeydiyyat/Profil) ---
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView, name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', UserProfileView.as_view(), name='profile'),

    # --- DASHBOARD & NEWS ---
    path('news/', NewsListView.as_view(), name='news_list'),

    # --- SETUP (WIZARD) ---
    path('universities/', UniversityListView.as_view(), name='uni_list'),
    path('faculties/', FacultyListView.as_view(), name='faculty_list'),
    path('specialties/', SpecialtyListView.as_view(), name='specialty_list'),
    path('groups/', GroupListView.as_view(), name='group_list'),
    path('assign-group/', AssignGroupView.as_view(), name='assign_group'),

    # --- MARKET & FEED ---
    path('market/', MarketListCreateView.as_view(), name='market'),
    path('feed/', FeedListCreateView.as_view(), name='feed'),
    # 👇 DÜZƏLİŞ BURADADIR
    path('feed/comment/', FeedCommentCreateView.as_view(), name='feed_comment'), 
]