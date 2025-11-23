from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from .models import (
    User, UserKYC, University, Faculty, Specialty, StudentGroup, 
    Collective, Message, News, 
    MarketItem, FeedPost, FeedComment
)

# --- 1. İSTİFADƏÇİ VƏ KYC ---
class UserKYCInline(admin.StackedInline):
    model = UserKYC
    can_delete = False
    verbose_name_plural = 'Şəxsi Məlumatlar (KYC)'
    readonly_fields = ('image_preview_front', 'image_preview_back', 'image_preview_student')

    def image_preview_front(self, obj):
        return format_html('<img src="{}" style="max-height: 150px; border-radius: 10px;" />', obj.id_card_front.url) if obj.id_card_front else "-"
    
    def image_preview_back(self, obj):
        return format_html('<img src="{}" style="max-height: 150px; border-radius: 10px;" />', obj.id_card_back.url) if obj.id_card_back else "-"

    def image_preview_student(self, obj):
        return format_html('<img src="{}" style="max-height: 150px; border-radius: 10px;" />', obj.student_card.url) if obj.student_card else "-"

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    inlines = (UserKYCInline,)
    list_display = ('phone_number', 'get_full_name', 'role', 'is_active', 'created_at')
    list_filter = ('role', 'is_active')
    search_fields = ('phone_number',)
    ordering = ('-created_at',)
    
    fieldsets = (
        (None, {'fields': ('phone_number', 'password')}),
        ('Status', {'fields': ('role', 'is_active', 'is_staff')}),
        ('İcazələr', {'fields': ('is_superuser', 'groups', 'user_permissions')}),
    )

    def get_full_name(self, obj):
        try: return f"{obj.kyc.first_name} {obj.kyc.last_name}"
        except: return "-"
    get_full_name.short_description = "Ad Soyad"

# --- 2. UNİVERSİTET SİSTEMİ ---
class FacultyInline(admin.TabularInline):
    model = Faculty
    extra = 1

@admin.register(University)
class UniversityAdmin(admin.ModelAdmin):
    inlines = [FacultyInline]
    list_display = ('name', 'slug')
    search_fields = ('name',)

@admin.register(Faculty)
class FacultyAdmin(admin.ModelAdmin):
    list_display = ('name', 'university')
    list_filter = ('university',)

@admin.register(Specialty)
class SpecialtyAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'faculty')
    list_filter = ('faculty__university',)
    search_fields = ('name',)

@admin.register(StudentGroup)
class StudentGroupAdmin(admin.ModelAdmin):
    list_display = ('group_number', 'specialty')
    search_fields = ('group_number',)

# --- 3. MARKET (TƏLƏBƏ BAZARI) ---
@admin.register(MarketItem)
class MarketItemAdmin(admin.ModelAdmin):
    list_display = ('title', 'price', 'currency', 'category', 'seller', 'created_at')
    list_filter = ('category', 'currency')
    search_fields = ('title', 'description')

# --- 4. FEED (AXIŞ) ---
class FeedCommentInline(admin.TabularInline):
    model = FeedComment
    extra = 0

@admin.register(FeedPost)
class FeedPostAdmin(admin.ModelAdmin):
    inlines = [FeedCommentInline]
    list_display = ('content_short', 'author', 'post_type', 'is_anonymous', 'created_at')
    list_filter = ('post_type', 'is_anonymous')
    
    def content_short(self, obj):
        return obj.content[:50] + "..."
    content_short.short_description = "Məzmun"

@admin.register(FeedComment)
class FeedCommentAdmin(admin.ModelAdmin):
    list_display = ('author', 'content', 'created_at')

# --- 5. DİGƏRLƏRİ ---
@admin.register(News)
class NewsAdmin(admin.ModelAdmin):
    list_display = ('title', 'university', 'created_at')

@admin.register(Collective)
class CollectiveAdmin(admin.ModelAdmin):
    list_display = ('name', 'group')

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('sender', 'collective', 'timestamp')