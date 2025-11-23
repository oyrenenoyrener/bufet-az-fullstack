from django.urls import path
from .views import (
    # Auth (Giriş/Qeydiyyat/Profil)
    RegisterView, UserProfileView, 
    
    # Xəbərlər
    NewsListView,
    
    # Setup (Seçim)
    UniversityListView, FacultyListView, SpecialtyListView, GroupListView, AssignGroupView,

    # Market & Feed
    MarketListCreateView, FeedListCreateView, FeedCommentCreateView
)
from rest_framework_simplejwt.views import (
    TokenObtainPairView, TokenRefreshView,
)

urlpatterns = [
    # --- AUTH (ƏSAS HİSSƏ) ---
    path('register/', RegisterView.as_view(), name='register'), # <--- BU SƏTR ÇATIŞMIRDI!
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', UserProfileView.as_view(), name='profile'),

    # --- DASHBOARD ---
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
    path('feed/comment/', FeedCommentCreateView.as_view(), name='feed_comment'),
]