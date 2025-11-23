import uuid
from django.db import models
# 👇 DÜZƏLİŞ: Group və Permission import olunur
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager, Group, Permission
from django.conf import settings # Qeyd: settings-ə ehtiyac qalmadı, amma qalsın

# --- 1. UNIVERSITET STRUKTURU ---
class University(models.Model):
    name = models.CharField(max_length=200, verbose_name="Universitet Adı")
    slug = models.SlugField(unique=True, null=True, blank=True, verbose_name="Qısa Ad (Slug)")
    is_branch = models.BooleanField(default=False, verbose_name="Filialdır?")
    parent_university = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='branches', verbose_name="Ana Universitet")
    logo = models.ImageField(upload_to='uni_logos/', null=True, blank=True, verbose_name="Logo")
    
    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Universitet"
        verbose_name_plural = "🏫 Universitetlər"

class Faculty(models.Model):
    university = models.ForeignKey(University, on_delete=models.CASCADE, related_name='faculties', verbose_name="Universitet")
    name = models.CharField(max_length=200, verbose_name="Fakültə Adı")

    def __str__(self): return f"{self.name} ({self.university.name})"
    class Meta:
        verbose_name = "Fakültə"
        verbose_name_plural = "📚 Fakültələr"

class Specialty(models.Model):
    faculty = models.ForeignKey(Faculty, on_delete=models.CASCADE, related_name='specialties', verbose_name="Fakültə")
    name = models.CharField(max_length=200, verbose_name="İxtisas Adı")
    code = models.CharField(max_length=50, null=True, blank=True, verbose_name="İxtisas Kodu")

    def __str__(self): return self.name
    class Meta:
        verbose_name = "İxtisas"
        verbose_name_plural = "🎓 İxtisaslar"

class StudentGroup(models.Model):
    specialty = models.ForeignKey(Specialty, on_delete=models.CASCADE, related_name='groups', null=True, blank=True, verbose_name="İxtisas")
    group_number = models.CharField(max_length=20, verbose_name="Qrup Nömrəsi")
    
    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)
        if is_new:
            Collective.objects.create(group=self, name=f"{self.group_number} Kollektivi")

    def __str__(self): return self.group_number
    class Meta:
        verbose_name = "Tələbə Qrupu"
        verbose_name_plural = "👥 Tələbə Qrupları"

# --- 2. KOLLEKTİV (CHAT) SİSTEMİ ---

class Collective(models.Model):
    group = models.OneToOneField(StudentGroup, on_delete=models.CASCADE, related_name='collective', verbose_name="Aid Olduğu Qrup")
    name = models.CharField(max_length=200, verbose_name="Otaq Adı")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Yaranma Tarixi")

    def __str__(self): return self.name
    class Meta:
        verbose_name = "Çat Otağı"
        verbose_name_plural = "💬 Çat Otaqları"

class Message(models.Model):
    MESSAGE_TYPES = (('text', 'Mətn'), ('image', 'Şəkil'), ('audio', 'Səs'), ('video', 'Video'))

    collective = models.ForeignKey(Collective, on_delete=models.CASCADE, related_name='messages', verbose_name="Kollektiv")
    sender = models.ForeignKey('User', on_delete=models.CASCADE, related_name='sent_messages', verbose_name="Göndərən")
    message_type = models.CharField(max_length=10, choices=MESSAGE_TYPES, default='text', verbose_name="Növ")
    text = models.TextField(null=True, blank=True, verbose_name="Məzmun")
    file = models.FileField(upload_to='chat_files/', null=True, blank=True, verbose_name="Fayl")
    timestamp = models.DateTimeField(auto_now_add=True, verbose_name="Vaxt")

    class Meta:
        ordering = ['timestamp']
        verbose_name = "Mesaj"
        verbose_name_plural = "📨 Mesajlar"

# --- 3. XƏBƏRLƏR ---

class News(models.Model):
    university = models.ForeignKey(University, on_delete=models.CASCADE, related_name='news', null=True, blank=True, verbose_name="Universitet (Boşsa Hamı Görür)")
    title = models.CharField(max_length=200, verbose_name="Başlıq")
    content = models.TextField(verbose_name="Məzmun")
    image = models.ImageField(upload_to='news_images/', null=True, blank=True, verbose_name="Şəkil")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Tarix")
    
    def __str__(self): return self.title
    class Meta:
        ordering = ['-created_at']
        verbose_name = "Xəbər"
        verbose_name_plural = "📰 Xəbərlər"

# --- 4. USER & KYC (ƏSAS DÜZƏLİŞ BURADADIR) ---

class CustomUserManager(BaseUserManager):
    def create_user(self, phone_number, password=None, **extra_fields):
        if not phone_number: raise ValueError('Telefon nömrəsi mütləqdir!')
        user = self.model(phone_number=phone_number, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, phone_number, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(phone_number, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = (('student', 'Tələbə'), ('teacher', 'Müəllim'), ('staff', 'İşçi'), ('admin', 'Admin'))
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    phone_number = models.CharField(max_length=20, unique=True, verbose_name="Telefon")
    is_active = models.BooleanField(default=True, verbose_name="Aktivdir?")
    is_staff = models.BooleanField(default=False, verbose_name="Personal?")
    is_verified = models.BooleanField(default=False, verbose_name="Təsdiqlənib?")
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student', verbose_name="Rol")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Qeydiyyat Tarixi")
    
    # 🔥 FIX 1: RELATED_NAME ƏLAVƏSİ (E304 xətasını həll edir)
    groups = models.ManyToManyField(
        Group,
        verbose_name=('groups'),
        blank=True,
        help_text=('The groups this user belongs to.'),
        related_name="user_custom_groups", 
    )
    # 🔥 FIX 2: RELATED_NAME ƏLAVƏSİ
    user_permissions = models.ManyToManyField(
        Permission,
        verbose_name=('user permissions'),
        blank=True,
        help_text=('Specific permissions for this user.'),
        related_name="user_custom_permissions", 
    )
    
    objects = CustomUserManager()
    USERNAME_FIELD = 'phone_number'

    class Meta:
        verbose_name = "İstifadəçi"
        verbose_name_plural = "👤 İstifadəçilər"

class UserKYC(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='kyc', verbose_name="İstifadəçi")
    fin_code = models.CharField(max_length=7, unique=True, null=True, blank=True, verbose_name="FİN Kod")
    first_name = models.CharField(max_length=50, default="Pending", verbose_name="Ad")
    last_name = models.CharField(max_length=50, default="Pending", verbose_name="Soyad")
    id_card_front = models.ImageField(upload_to='kyc/front/', verbose_name="Vəsiqə (Ön)")
    id_card_back = models.ImageField(upload_to='kyc/back/', verbose_name="Vəsiqə (Arxa)")
    student_card = models.ImageField(upload_to='kyc/student/', verbose_name="Tələbə Bileti")
    
    university = models.ForeignKey(University, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Universitet")
    group = models.ForeignKey(StudentGroup, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Qrup")
    
    STATUS_CHOICES = (('pending', 'Gözlənilir'), ('approved', 'Təsdiqləndi'), ('rejected', 'İmtina'))
    verification_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name="Status")

    class Meta:
        verbose_name = "Sənəd (KYC)"
        verbose_name_plural = "📂 Sənədlər (KYC)"

# --- 5. MARKET ---
class MarketItem(models.Model):
    CATEGORY_CHOICES = (('book', 'Kitab'), ('supply', 'Ləvazimat'), ('roommate', 'Otaq Yoldaşı'), ('electronics', 'Elektronika'), ('other', 'Digər'))
    CURRENCY_CHOICES = (('AZN', 'AZN ₼'), ('USD', 'USD $'), ('EUR', 'EUR €'), ('RUB', 'RUB ₽'))

    seller = models.ForeignKey(User, on_delete=models.CASCADE, related_name='market_items', verbose_name="Satıcı")
    title = models.CharField(max_length=200, verbose_name="Elan Başlığı")
    description = models.TextField(verbose_name="Təsvir")
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Qiymət")
    currency = models.CharField(max_length=3, choices=CURRENCY_CHOICES, default='AZN', verbose_name="Valyuta")
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, verbose_name="Kateqoriya")
    image = models.ImageField(upload_to='market_images/', null=True, blank=True, verbose_name="Şəkil")
    contact_info = models.CharField(max_length=100, verbose_name="Əlaqə")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Tarix")

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Elan"
        verbose_name_plural = "🛒 Bazar Elanları"

# --- 6. FEED ---
class FeedPost(models.Model):
    TYPE_CHOICES = (('confession', 'Etiraf'), ('debate', 'Debat'), ('question', 'Sual'))
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts', verbose_name="Müəllif")
    content = models.TextField(verbose_name="Məzmun")
    post_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='confession', verbose_name="Tip")
    is_anonymous = models.BooleanField(default=False, verbose_name="Anonimdir?")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Paylaşım Tarixi")
    likes_count = models.IntegerField(default=0, verbose_name="Bəyənmə Sayı")

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Post"
        verbose_name_plural = "⚡ Axış Postları"

class FeedComment(models.Model):
    post = models.ForeignKey(FeedPost, on_delete=models.CASCADE, related_name='comments', verbose_name="Post")
    author = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="Yazan")
    content = models.TextField(verbose_name="Rəy")
    is_anonymous = models.BooleanField(default=False, verbose_name="Anonimdir?")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Tarix")

    class Meta:
        verbose_name = "Rəy"
        verbose_name_plural = "💬 Rəylər"