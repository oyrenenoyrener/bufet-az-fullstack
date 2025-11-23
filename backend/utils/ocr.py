# backend/utils/ocr.py

import re
import pytesseract
from PIL import Image
import cv2
import numpy as np

# Windows istifadə edirsənsə Tesseract yolunu göstər (Quraşdırmamısansa bu sətri şərhə al)
# pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

def extract_id_data(image_path):
    """
    Şəxsiyyət vəsiqəsindən Ad və Soyadı çıxarır.
    """
    try:
        # 1. Şəkli oxu və rəngsizləşdir (daha yaxşı oxunması üçün)
        img = cv2.imread(image_path)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # 2. Mətni çıxar (pytesseract kitabxanası)
        text = pytesseract.image_to_string(gray, lang='aze+eng')
        
        # Debug üçün terminala yazaq
        print("🔍 OCR OXUNAN MƏTN:", text)

        # 3. Məlumatları təmizlə və tap
        data = {
            "first_name": "Pending",
            "last_name": "Pending"
        }

        # Sadə Regex Məntiqi (Vəsiqə strukturuna görə dəyişə bilər)
        # Məsələn: SOYADI sözündən sonrakı böyük hərfləri axtarır
        
        # Soyad axtarışı
        surname_match = re.search(r'SOYADI\s*[:\/]?\s*([A-ZƏÖĞIŞÇÜ]+)', text, re.IGNORECASE)
        if surname_match:
            data['last_name'] = surname_match.group(1).capitalize()

        # Ad axtarışı
        name_match = re.search(r'ADI\s*[:\/]?\s*([A-ZƏÖĞIŞÇÜ]+)', text, re.IGNORECASE)
        if name_match:
            data['first_name'] = name_match.group(1).capitalize()

        return data

    except Exception as e:
        print(f"❌ OCR Xətası: {e}")
        return {"first_name": "Manual_Yoxlama", "last_name": "Manual_Yoxlama"}