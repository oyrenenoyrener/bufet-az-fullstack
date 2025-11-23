from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from django.db.models import Q
import os
from django.shortcuts import get_object_or_404 # Qrup tapmaq üçün

# OCR funksiyasını çağırırıq
try:
    from utils.ocr import extract_id_data
except ImportError:
    def extract_id_data(path): return {"first_name": "Pending", "last_name": "Pending"}

from .models import (News, University, Faculty, Specialty, StudentGroup, MarketItem, FeedPost, FeedComment)
from .serializers import (
    UserRegistrationSerializer, UserProfileSerializer, NewsSerializer, UniversitySerializer, 
    FacultySerializer, SpecialtySerializer, StudentGroupSerializer, MarketItemSerializer,
    FeedPostSerializer, FeedCommentSerializer, UserSettingsSerializer
)

# --- FILTER KÖMƏKÇİSİ (Bütün ListView-lar üçün) ---
def apply_academic_filters(queryset, request):
    uni_id = request.query_params.get('university_id')
    fac_id = request.query_params.get('faculty_id')
    spec_id = request.query_params.get('specialty_id')

    if uni_id:
        queryset = queryset.filter(author__kyc__university_id=uni_id)
    if fac_id:
        queryset = queryset.filter(author__kyc__group__specialty__faculty_id=fac_id)
    if spec_id:
        queryset = queryset.filter(author__kyc__group__specialty_id=spec_id)
    return queryset

# --- 1. AUTH (Qeydiyyat + OCR) ---
class RegisterView(generics.CreateAPIView):
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]
    parser_classes = (MultiPartParser, FormParser)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # OCR SİSTEMİ İŞƏ DÜŞÜR
            try:
                kyc = user.kyc
                if kyc.id_card_front:
                    image_path = kyc.id_card_front.path
                    extracted_data = extract_id_data(image_path)
                    
                    if extracted_data.get('first_name') != "Pending":
                        kyc.first_name = extracted_data['first_name']
                        kyc.last_name = extracted_data['last_name']
                        kyc.verification_status = 'approved' 
                        kyc.save()
            except Exception as e:
                print(f"⚠️ OCR işləmədi: {e}")

            return Response({"message": "Uğurlu", "user_id": user.id}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# --- 2. PROFİL VƏ SETTINGS ---
class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)

class UserSettingsView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSettingsSerializer
    def get_object(self):
        return self.request.user

# --- 3. XƏBƏRLƏR (FILTERLİ) ---
class NewsListView(generics.ListAPIView):
    serializer_class = NewsSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        user_uni = user.kyc.university if hasattr(user, 'kyc') else None
            
        queryset = News.objects.filter(Q(university__isnull=True)).order_by('-created_at')
        if user_uni:
            queryset = queryset | News.objects.filter(university=user_uni)
            
        filter_uni_id = self.request.query_params.get('university_id')
        if filter_uni_id:
            queryset = News.objects.filter(university_id=filter_uni_id)
        
        return queryset.distinct()

# --- 4. SETUP (WIZARD) ---
class UniversityListView(generics.ListAPIView):
    queryset = University.objects.filter(parent_university__isnull=True)
    serializer_class = UniversitySerializer
    permission_classes = [AllowAny]

class FacultyListView(generics.ListAPIView):
    serializer_class = FacultySerializer
    permission_classes = [AllowAny]
    def get_queryset(self):
        uni_id = self.request.query_params.get('university_id')
        return Faculty.objects.filter(university_id=uni_id)

class SpecialtyListView(generics.ListAPIView):
    serializer_class = SpecialtySerializer
    permission_classes = [AllowAny]
    def get_queryset(self):
        faculty_id = self.request.query_params.get('faculty_id')
        return Specialty.objects.filter(faculty_id=faculty_id)

class GroupListView(generics.ListAPIView):
    serializer_class = StudentGroupSerializer
    permission_classes = [AllowAny]
    def get_queryset(self):
        spec_id = self.request.query_params.get('specialty_id')
        return StudentGroup.objects.filter(specialty_id=spec_id)

class AssignGroupView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        university_id = request.data.get('university_id')
        specialty_id = request.data.get('specialty_id')
        group_number = request.data.get('group_number')

        if not all([university_id, specialty_id, group_number]):
            return Response({"error": "Bütün sahələri doldurun!"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            university = University.objects.get(id=university_id)
            specialty = Specialty.objects.get(id=specialty_id)
            clean_number = str(group_number).strip().upper()
            
            group, created = StudentGroup.objects.get_or_create(
                group_number=clean_number, specialty=specialty
            )
            
            kyc = request.user.kyc
            kyc.group = group
            kyc.university = university
            kyc.save()

            return Response({"message": "Uğurlu!"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

# --- 5. BAZAR VƏ AXIS (FİLTERLİ) ---
class MarketListCreateView(generics.ListCreateAPIView):
    serializer_class = MarketItemSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def get_queryset(self):
        queryset = MarketItem.objects.all().order_by('-created_at')
        return apply_academic_filters(queryset, self.request) # <--- FILTER

    def perform_create(self, serializer):
        serializer.save(seller=self.request.user)

class FeedListCreateView(generics.ListCreateAPIView):
    serializer_class = FeedPostSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = FeedPost.objects.all().order_by('-created_at')
        return apply_academic_filters(queryset, self.request) # <--- FILTER

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class FeedCommentCreateView(generics.CreateAPIView):
    serializer_class = FeedCommentSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        post_id = self.request.data.get('post_id')
        post = get_object_or_404(FeedPost, id=post_id) # Təhlükəsizlik üçün
        serializer.save(author=self.request.user, post=post)