from rest_framework import serializers 
from django.contrib.auth import get_user_model
from .models import UserKYC, News, University, Faculty, Specialty, StudentGroup, MarketItem, FeedPost, FeedComment
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer # <--- Əlavə olundu

User = get_user_model()

# --- 1. SEÇİM EKRANI ---
class UniversitySerializer(serializers.ModelSerializer):
    class Meta:
        model = University
        fields = ('id', 'name', 'slug')

class FacultySerializer(serializers.ModelSerializer):
    class Meta:
        model = Faculty
        fields = ('id', 'name')

class SpecialtySerializer(serializers.ModelSerializer):
    class Meta:
        model = Specialty
        fields = ('id', 'name', 'code')

class StudentGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentGroup
        fields = ('id', 'group_number')

# --- 2. AYARLAR (YALNIZ TELEFON DƏYİŞİLİR) ---
class UserSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('phone_number',)
        extra_kwargs = {'phone_number': {'required': True}}

# --- 3. NEWS SERIALIZER ---
class NewsSerializer(serializers.ModelSerializer): 
    university_name = serializers.CharField(source='university.name', read_only=True, default="Ümumi Xəbər")
    class Meta:
        model = News
        fields = ('id', 'title', 'content', 'image', 'created_at', 'university_name')

# --- 4. GİRİŞ SERIALIZER-I (FINAL FIX) ---
class PhoneNumberTokenObtainPairSerializer(TokenObtainPairSerializer):
    # 🔥 FIX: phone_number sahəsini klassın içində eksplisit (açıq) şəkildə təyin edirik
    phone_number = serializers.CharField(write_only=True)
    
    # Authentikasiya üçün istifadə olunacaq sahə
    username_field = 'phone_number' 

    def validate(self, attrs):
        # Təhlükəsizlik üçün .get() istifadə edirik ki, KeyError verməsin
        phone_number = attrs.get('phone_number')
        
        if not phone_number:
            raise serializers.ValidationError({'phone_number': 'Telefon nömrəsi tələb olunur.'})
            
        # 1. phone_number dəyərini JWT-nin gözlədiyi 'username' açarına köçürürük
        attrs['username'] = phone_number
        
        # 2. Validasiya prosesini davam etdiririk
        return super().validate(attrs)

# --- 5. QEYDİYYAT ---
class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    fin_code = serializers.CharField(required=True, min_length=7, max_length=7)
    id_card_front = serializers.ImageField(required=True)
    id_card_back = serializers.ImageField(required=True)
    student_card = serializers.ImageField(required=True)

    class Meta:
        model = User
        fields = ('phone_number', 'password', 'fin_code', 'id_card_front', 'id_card_back', 'student_card')

    def validate(self, attrs):
        if User.objects.filter(phone_number=attrs['phone_number']).exists():
            raise serializers.ValidationError({"phone_number": "Bu nömrə artıq var."})
        fin = attrs['fin_code'].upper()
        if UserKYC.objects.filter(fin_code=fin).exists():
            raise serializers.ValidationError({"fin_code": "Bu FİN kod artıq var."})
        return attrs

    def create(self, validated_data):
        password = validated_data.pop('password')
        fin_code = validated_data.pop('fin_code')
        id_card_front = validated_data.pop('id_card_front')
        id_card_back = validated_data.pop('id_card_back')
        student_card = validated_data.pop('student_card')

        user = User.objects.create_user(
            phone_number=validated_data['phone_number'],
            password=password
        )

        UserKYC.objects.create(
            user=user,
            id_card_front=id_card_front,
            id_card_back=id_card_back,
            student_card=student_card,
            fin_code=fin_code.upper(),
            first_name="Pending",
            last_name="Pending"
        )
        return user

# --- 6. PROFIL ---
class UserProfileSerializer(serializers.ModelSerializer):
    fin_code = serializers.SerializerMethodField()
    first_name = serializers.SerializerMethodField()
    last_name = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    group_info = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'phone_number', 'role', 'fin_code', 'first_name', 'last_name', 'status', 'group_info')

    def get_kyc_data(self, obj, field_name):
        try:
            if hasattr(obj, 'kyc'): return getattr(obj.kyc, field_name)
        except Exception: return None
        return None

    def get_fin_code(self, obj): return self.get_kyc_data(obj, 'fin_code')
    def get_first_name(self, obj): return self.get_kyc_data(obj, 'first_name')
    def get_last_name(self, obj): return self.get_kyc_data(obj, 'last_name')
    def get_status(self, obj): return self.get_kyc_data(obj, 'verification_status')
    
    def get_group_info(self, obj):
        try:
            if hasattr(obj, 'kyc') and obj.kyc.group:
                group = obj.kyc.group
                specialty_name = group.specialty.name if group.specialty else "Qeyd olunmayıb"
                faculty_name = group.specialty.faculty.name if (group.specialty and group.specialty.faculty) else "Qeyd olunmayıb"
                uni_name = obj.kyc.university.name if obj.kyc.university else "Qeyd olunmayıb"

                return {
                    "id": group.id,
                    "name": group.group_number,
                    "specialty": specialty_name,
                    "faculty": faculty_name,
                    "university": uni_name
                }
        except Exception: return None
        return None

# --- 7. MARKETPLACE ---
class MarketItemSerializer(serializers.ModelSerializer):
    seller_name = serializers.SerializerMethodField()
    
    class Meta:
        model = MarketItem
        fields = '__all__'
        read_only_fields = ('seller',) 

    def get_seller_name(self, obj):
        try: return obj.seller.kyc.first_name
        except: return "İstifadəçi"

# --- 8. AXIŞ (FEED) ---
class FeedCommentSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
    author_uni = serializers.SerializerMethodField()

    class Meta:
        model = FeedComment
        fields = ('id', 'content', 'author_name', 'author_uni', 'is_anonymous', 'created_at')
        read_only_fields = ('author', 'post') 

    def get_author_name(self, obj):
        if obj.is_anonymous: return "Anonim Tələbə 🎭"
        try: return f"{obj.author.kyc.first_name} {obj.author.kyc.last_name}"
        except: return "İstifadəçi"

    def get_author_uni(self, obj):
        if obj.is_anonymous: return "Məxfi"
        try: return obj.author.kyc.university.name
        except: return ""

class FeedPostSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
    author_uni = serializers.SerializerMethodField()
    comments = FeedCommentSerializer(many=True, read_only=True)

    class Meta:
        model = FeedPost
        fields = ('id', 'content', 'post_type', 'is_anonymous', 'created_at', 'author_name', 'author_uni', 'likes_count', 'comments')
        read_only_fields = ('author', 'likes_count')

    def get_author_name(self, obj):
        if obj.is_anonymous: return "Anonim 🤫"
        try: return f"{obj.author.kyc.first_name} {obj.author.kyc.last_name}"
        except: return "İstifadəçi"

    def get_author_uni(self, obj):
        if obj.is_anonymous: return "Universitet Məxfidir"
        try: return obj.author.kyc.university.name
        except: return ""