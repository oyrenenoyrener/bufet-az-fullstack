from django.core.management.base import BaseCommand
from users.models import University, Faculty, Specialty
from django.db import transaction
from django.utils.text import slugify

class Command(BaseCommand):
    help = 'Bütün Azərbaycan Universitetləri ilə bazanı doldurur'

    def handle(self, *args, **kwargs):
        # --- MƏLUMAT BAZASI (Wikipedia Siyahısı - Aktiv Universitetlər) ---
        
        # 1. Ətraflı məlumatı olanlar (Bunların fakültələri dəqiqdir)
        detailed_universities = {
            "Bakı Dövlət Universiteti (BDU)": {
                "slug": "bdu",
                "faculties": {
                    "Tətbiqi riyaziyyat və kibernetika": ["Kompüter elmləri", "İnformatika müəllimliyi"],
                    "Mexanika-riyaziyyat": ["Riyaziyyat", "Mexanika"],
                    "Hüquq": ["Hüquqşünaslıq"],
                    "Beynəlxalq münasibətlər və iqtisadiyyat": ["Beynəlxalq münasibətlər", "İqtisadiyyat", "Menecment"],
                    "Jurnalistika": ["Jurnalistika"],
                    "Fizika": ["Fizika", "Fizika müəllimliyi"],
                    "Tarix": ["Tarix", "Tarix müəllimliyi"],
                    "Filologiya": ["Azərbaycan dili və ədəbiyyatı"],
                    "Şərqşünaslıq": ["Regionşünaslıq"],
                    "Biologiya": ["Biologiya"],
                    "Kimya": ["Kimya mühəndisliyi"],
                    "Sosial elmlər və psixologiya": ["Psixologiya", "Sosiologiya", "Sosial iş"]
                }
            },
            "Azərbaycan Dövlət Neft və Sənaye Universiteti (ADNSU)": {
                "slug": "adnsu",
                "faculties": {
                    "İnformasiya Texnologiyaları və İdarəetmə": ["İnformasiya təhlükəsizliyi", "Kompüter mühəndisliyi", "İT", "Sistem mühəndisliyi"],
                    "Neft-mexanika": ["Mexanika mühəndisliyi"],
                    "Geoloji-kəşfiyyat": ["Geofizika mühəndisliyi"],
                    "Kimya-texnologiya": ["Kimya mühəndisliyi"],
                    "Energetika": ["Elektrik mühəndisliyi"],
                    "İqtisadiyyat və Menecment": ["Menecment"]
                }
            },
            "Azərbaycan Dövlət İqtisad Universiteti (UNEC)": {
                "slug": "unec",
                "faculties": {
                    "Rəqəmsal İqtisadiyyat": ["İnformasiya texnologiyaları"],
                    "Maliyyə və Mühasibat": ["Maliyyə", "Mühasibat uçotu"],
                    "Biznes və Menecment": ["Biznesin idarə edilməsi", "Marketinq"],
                    "Türk Dünyası İqtisad": ["İqtisadiyyat", "Beynəlxalq münasibətlər"]
                }
            },
            "Azərbaycan Texniki Universiteti (AzTU)": {
                "slug": "aztu",
                "faculties": {
                    "İnformasiya və telekommunikasiya texnologiyaları": ["Kompüter mühəndisliyi", "Radioelektronika"],
                    "Nəqliyyat və logistika": ["Logistika"],
                    "Energetika və avtomatika": ["Elektrik mühəndisliyi"],
                    "Maşınqayırma və robototexnika": ["Mexatronika"]
                }
            },
            "ADA Universiteti": {
                "slug": "ada",
                "faculties": {
                    "İT və Mühəndislik": ["Kompüter elmləri", "Kompüter mühəndisliyi"],
                    "Biznes": ["Biznesin idarə edilməsi"],
                    "İctimai və Beynəlxalq Münasibətlər": ["Beynəlxalq münasibətlər", "Dövlət idarəçiliyi"]
                }
            },
            "Bakı Ali Neft Məktəbi (BANM)": {
                "slug": "banm",
                "faculties": {
                    "Mühəndislik": ["Neft-qaz mühəndisliyi", "Kimya mühəndisliyi", "İnformasiya təhlükəsizliyi"]
                }
            }
        }

        # 2. Digər Bütün Aktiv Universitetlər (Sadə siyahı - Default fakültə ilə yaranacaq)
        other_universities = [
            # Dövlət Universitetləri (Bakı)
            ("Azərbaycan Dövlət Pedaqoji Universiteti (ADPU)", "adpu"),
            ("Azərbaycan Tibb Universiteti (ATU)", "atu-tibb"),
            ("Azərbaycan Dövlət Mədəniyyət və İncəsənət Universiteti (ADMİU)", "admiu"),
            ("Azərbaycan Dövlət Rəssamlıq Akademiyası (ADRA)", "adra"),
            ("Bakı Musiqi Akademiyası (BMA)", "bma"),
            ("Azərbaycan Milli Konservatoriyası (AMK)", "amk"),
            ("Azərbaycan Dillər Universiteti (ADU)", "adu"),
            ("Bakı Slavyan Universiteti (BSU)", "bsu"),
            ("Azərbaycan Memarlıq və İnşaat Universiteti (AzMİU)", "azmiu"),
            ("Bakı Mühəndislik Universiteti (BMU)", "bmu"),
            ("Milli Aviasiya Akademiyası (MAA)", "maa"),
            ("Azərbaycan Dövlət Bədən Tərbiyəsi və İdman Akademiyası (ADBTİA)", "adbtia"),
            ("Azərbaycan İlahiyyat İnstitutu (Aİİ)", "aii"),
            
            # Dövlət Universitetləri (Regionlar)
            ("Naxçıvan Dövlət Universiteti (NDU)", "ndu"),
            ("Naxçıvan Müəllimlər İnstitutu (NMİ)", "nmi"),
            ("Azərbaycan Dövlət Aqrar Universiteti (ADAU)", "adau"),
            ("Azərbaycan Texnologiya Universiteti (ATU - Gəncə)", "atu-ganja"),
            ("Gəncə Dövlət Universiteti (GDU)", "gdu"),
            ("Sumqayıt Dövlət Universiteti (SDU)", "sdu"),
            ("Mingəçevir Dövlət Universiteti (MDU)", "mdu"),
            ("Lənkəran Dövlət Universiteti (LDU)", "ldu"),
            ("Qarabağ Universiteti", "karabakh"),

            # Özəl Universitetlər
            ("Xəzər Universiteti", "khazar"),
            ("Qərbi Kaspi Universiteti", "wcu"),
            ("Bakı Avrasiya Universiteti (BAAU)", "baau"),
            ("Bakı Biznes Universiteti (BBU)", "bbu"),
            ("Azərbaycan Universiteti (AU)", "au"),
            ("Odlar Yurdu Universiteti (OYU)", "oyu"),
            ("Azərbaycan Kooperasiya Universiteti (AKU)", "aku"),
            ("Azərbaycan Əmək və Sosial Münasibətlər Akademiyası", "aesma"),
            ("Naxçıvan Universiteti", "nu"),

            # Xüsusi Təyinatlı
            ("Azərbaycan Respublikasının Prezidenti yanında Dövlət İdarəçilik Akademiyası (DİA)", "dia"),
            ("DİN Polis Akademiyası", "pa"),
            ("FHN Akademiyası", "fhn"),
            ("Dövlət Gömrük Komitəsinin Akademiyası", "dgka"),
            ("Dövlət Təhlükəsizliyi Xidmətinin Heydər Əliyev adına Akademiyası", "dtx"),
            ("Dövlət Sərhəd Xidməti Akademiyası", "dsx")
        ]

        try:
            with transaction.atomic():
                self.stdout.write("🚀 Universitetlər bazaya yazılır...")

                # 1. Detallı Universitetləri əlavə et
                for uni_name, info in detailed_universities.items():
                    uni, created = University.objects.get_or_create(
                        name=uni_name,
                        defaults={'slug': info['slug']}
                    )
                    if created: self.stdout.write(f"➕ Yarandı: {uni_name}")

                    for fac_name, specialties in info['faculties'].items():
                        faculty, _ = Faculty.objects.get_or_create(university=uni, name=fac_name)
                        for spec_name in specialties:
                            Specialty.objects.get_or_create(faculty=faculty, name=spec_name)

                # 2. Digər Universitetləri əlavə et (Ümumi Fakültə ilə)
                for uni_name, slug in other_universities:
                    uni, created = University.objects.get_or_create(
                        name=uni_name,
                        defaults={'slug': slug}
                    )
                    if created: self.stdout.write(f"➕ Yarandı: {uni_name}")
                    
                    # Bu universitetlər üçün 'Ümumi' fakültə yaradaq ki, seçilə bilsin
                    if not uni.faculties.exists():
                        gen_fac = Faculty.objects.create(university=uni, name="Ümumi Fakültə")
                        Specialty.objects.create(faculty=gen_fac, name="Bütün İxtisaslar")

            self.stdout.write(self.style.SUCCESS("✅ Bütün universitetlər uğurla əlavə olundu!"))
        
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ Xəta baş verdi: {str(e)}"))