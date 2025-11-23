# backend/users/management/commands/scrape_edu.py

import requests
from bs4 import BeautifulSoup
from django.core.management.base import BaseCommand
from users.models import News

class Command(BaseCommand):
    help = 'Təhsil Nazirliyindən xəbərləri çəkir'

    def handle(self, *args, **kwargs):
        url = "https://edu.gov.az/az/news"
        self.stdout.write(f"Sayta bağlanılır: {url}...")

        try:
            response = requests.get(url, timeout=10)
            if response.status_code != 200:
                self.stdout.write(self.style.ERROR(f"Xəta: Sayt açılmadı. Status: {response.status_code}"))
                return

            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Edu.gov.az strukturuna uyğun (HTML klaslarını yoxlayıb tapdım)
            # Qeyd: Saytın dizaynı dəyişsə, bu klaslar da dəyişməlidir.
            news_list = soup.find_all('div', class_='news-card') 

            count = 0
            for item in news_list:
                # Başlıq
                title_tag = item.find('h5', class_='card-title')
                if not title_tag: continue
                title = title_tag.get_text(strip=True)

                # Link
                link_tag = item.find('a')
                if not link_tag: continue
                full_link = link_tag['href']
                
                # Məzmun (Qısa)
                desc_tag = item.find('p', class_='card-text')
                content = desc_tag.get_text(strip=True) if desc_tag else "Ətraflı məlumat rəsmi saytda."
                
                # Təkrarlanmanın qarşısını almaq
                if News.objects.filter(title=title).exists():
                    continue

                # Bazaya yazmaq (University NULL olur, yəni "Ümumi Xəbər")
                News.objects.create(
                    title=title,
                    content=f"{content} \n\nMənbə: {full_link}",
                    university=None 
                )
                count += 1

            self.stdout.write(self.style.SUCCESS(f"Uğurlu! {count} yeni xəbər əlavə edildi."))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Gözlənilməz xəta: {str(e)}"))