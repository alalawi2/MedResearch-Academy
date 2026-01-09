from PIL import Image, ImageDraw, ImageFont
import qrcode
import os

# Paths
base_dir = "/home/ubuntu/dr_alawi_website"
images_dir = f"{base_dir}/client/public/images"
dr_rawahi_photo = f"{images_dir}/dr-rawahi.jpg"
logo_path = f"{images_dir}/logo_final_v2.png"

# Session details - UPDATED TO TUESDAY
session_title = "Beyond PubMed: AI-Powered Literature Search"
session_subtitle = "Applications and Ethics"
date_text = "Tuesday, January 13, 2026"
time_text = "8:00 PM - 9:00 PM (Muscat Time)"
speaker_name = "Dr. Mohamed Al Rawahi"
speaker_credentials = "MD, MSc, FRCPC, ABIM"
speaker_title = "Senior Consultant in Cardiac Electrophysiology"
contact_email = "info@research-academy.om"  # UPDATED EMAIL
social_handle = "@Medresearch_om"
registration_url = "https://medresearch-academy.om/programs"

# Learning objectives
objectives = [
    "Master AI-powered literature search tools",
    "Evaluate evidence synthesis techniques",
    "Navigate ethical considerations in AI research",
    "Apply practical search strategies"
]

# Colors
navy = (26, 35, 126)
teal = (13, 148, 136)
white = (255, 255, 255)
light_gray = (240, 240, 240)

# Generate QR code
qr = qrcode.QRCode(version=1, box_size=10, border=2)
qr.add_data(registration_url)
qr.make(fit=True)
qr_img = qr.make_image(fill_color="black", back_color="white")

# Load images
try:
    dr_photo = Image.open(dr_rawahi_photo).convert("RGB")
    logo = Image.open(logo_path).convert("RGBA")
except Exception as e:
    print(f"Error loading images: {e}")
    exit(1)

print("Generating promotional materials with Tuesday date and new contact email...")

# ===== 1. MAIN FLYER (1200x1600) =====
print("1. Creating main flyer...")
flyer = Image.new("RGB", (1200, 1600), white)
draw = ImageDraw.Draw(flyer)

# Gradient background
for y in range(800):
    ratio = y / 800
    r = int(navy[0] + (teal[0] - navy[0]) * ratio)
    g = int(navy[1] + (teal[1] - navy[1]) * ratio)
    b = int(navy[2] + (teal[2] - navy[2]) * ratio)
    draw.rectangle([(0, y), (1200, y+1)], fill=(r, g, b))

# Logo
logo_resized = logo.resize((150, 150))
logo_bg = Image.new("RGBA", (190, 190), (*white, 255))
logo_bg.paste(logo_resized, (20, 20), logo_resized)
flyer.paste(logo_bg, (30, 30), logo_bg)

# Fonts
try:
    title_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 52)
    subtitle_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 36)
    body_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 28)
    small_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 24)
except:
    title_font = subtitle_font = body_font = small_font = ImageFont.load_default()

# Title
draw.text((600, 250), session_title, fill=white, font=title_font, anchor="mm")
draw.text((600, 320), session_subtitle, fill=white, font=subtitle_font, anchor="mm")

# Virtual Research Series badge
draw.rectangle([(400, 380), (800, 430)], fill=teal)
draw.text((600, 405), "Virtual Research Series", fill=white, font=body_font, anchor="mm")

# Speaker photo
photo_size = 280
dr_photo_resized = dr_photo.resize((photo_size, photo_size))
mask = Image.new("L", (photo_size, photo_size), 0)
mask_draw = ImageDraw.Draw(mask)
mask_draw.ellipse((0, 0, photo_size, photo_size), fill=255)
photo_bg = Image.new("RGB", (photo_size + 20, photo_size + 20), teal)
photo_bg_mask = Image.new("L", (photo_size + 20, photo_size + 20), 0)
photo_bg_mask_draw = ImageDraw.Draw(photo_bg_mask)
photo_bg_mask_draw.ellipse((0, 0, photo_size + 20, photo_size + 20), fill=255)
flyer.paste(photo_bg, (450, 480), photo_bg_mask)
flyer.paste(dr_photo_resized, (460, 490), mask)

# Speaker info
draw.text((600, 800), speaker_name, fill=white, font=title_font, anchor="mm")
draw.text((600, 850), speaker_credentials, fill=white, font=body_font, anchor="mm")
draw.text((600, 895), speaker_title, fill=white, font=small_font, anchor="mm")

# White section
draw.rectangle([(0, 950), (1200, 1600)], fill=white)

# Date & Time - TUESDAY HIGHLIGHTED
draw.text((100, 1000), "📅 Date & Time", fill=navy, font=body_font)
draw.text((100, 1050), date_text, fill=navy, font=title_font)
draw.text((100, 1110), time_text, fill=teal, font=body_font)

# Learning Objectives
draw.text((100, 1200), "🎯 What You'll Learn", fill=navy, font=body_font)
y_pos = 1250
for obj in objectives:
    draw.text((120, y_pos), f"✓ {obj}", fill=(60, 60, 60), font=small_font)
    y_pos += 50

# QR Code
qr_resized = qr_img.resize((150, 150))
flyer.paste(qr_resized, (950, 1000))
draw.text((1025, 1170), "Scan to", fill=(100, 100, 100), font=small_font, anchor="mm")
draw.text((1025, 1200), "Register", fill=(100, 100, 100), font=small_font, anchor="mm")

# Contact - UPDATED EMAIL
draw.text((100, 1480), f"📧 {contact_email}", fill=teal, font=body_font)
draw.text((100, 1530), f"🐦 {social_handle}", fill=teal, font=body_font)

flyer.save(f"{images_dir}/beyond-pubmed-flyer.png")
print("   ✓ Main flyer saved")

# ===== 2. INSTAGRAM STORY (1080x1920) =====
print("2. Creating Instagram Story...")
story = Image.new("RGB", (1080, 1920), white)
draw = ImageDraw.Draw(story)

# Gradient
for y in range(1920):
    ratio = y / 1920
    r = int(navy[0] + (teal[0] - navy[0]) * ratio)
    g = int(navy[1] + (teal[1] - navy[1]) * ratio)
    b = int(navy[2] + (teal[2] - navy[2]) * ratio)
    draw.rectangle([(0, y), (1080, y+1)], fill=(r, g, b))

# Logo at top
logo_resized = logo.resize((150, 150))
logo_bg = Image.new("RGBA", (190, 190), (*white, 255))
logo_bg.paste(logo_resized, (20, 20), logo_resized)
story.paste(logo_bg, (445, 80), logo_bg)

# Title
draw.text((540, 320), session_title, fill=white, font=title_font, anchor="mm")
draw.text((540, 390), session_subtitle, fill=white, font=subtitle_font, anchor="mm")

# Speaker photo
photo_size = 350
dr_photo_resized = dr_photo.resize((photo_size, photo_size))
mask = Image.new("L", (photo_size, photo_size), 0)
mask_draw = ImageDraw.Draw(mask)
mask_draw.ellipse((0, 0, photo_size, photo_size), fill=255)
photo_bg = Image.new("RGB", (photo_size + 20, photo_size + 20), teal)
photo_bg_mask = Image.new("L", (photo_size + 20, photo_size + 20), 0)
photo_bg_mask_draw = ImageDraw.Draw(photo_bg_mask)
photo_bg_mask_draw.ellipse((0, 0, photo_size + 20, photo_size + 20), fill=255)
story.paste(photo_bg, (355, 500), photo_bg_mask)
story.paste(dr_photo_resized, (365, 510), mask)

# Speaker name
draw.text((540, 900), speaker_name, fill=white, font=title_font, anchor="mm")
draw.text((540, 960), speaker_credentials, fill=white, font=body_font, anchor="mm")

# Date box - TUESDAY
date_box_y = 1050
draw.rectangle([(140, date_box_y), (940, date_box_y + 200)], fill=white)
draw.text((540, date_box_y + 50), "📅 " + date_text, fill=navy, font=title_font, anchor="mm")
draw.text((540, date_box_y + 120), time_text, fill=teal, font=body_font, anchor="mm")
draw.text((540, date_box_y + 170), "Virtual Research Series", fill=(100, 100, 100), font=small_font, anchor="mm")

# QR Code
qr_resized = qr_img.resize((200, 200))
story.paste(qr_resized, (440, 1350))
draw.text((540, 1580), "Scan to Register", fill=white, font=body_font, anchor="mm")

# Contact - UPDATED EMAIL
draw.text((540, 1700), contact_email, fill=white, font=body_font, anchor="mm")
draw.text((540, 1750), social_handle, fill=white, font=body_font, anchor="mm")

story.save(f"{images_dir}/beyond-pubmed-story.png")
print("   ✓ Instagram Story saved")

# ===== 3. EMAIL SIGNATURE BANNER (600x150) =====
print("3. Creating email signature banner...")
banner = Image.new("RGB", (600, 150), white)
draw = ImageDraw.Draw(banner)

# Gradient background
for x in range(600):
    ratio = x / 600
    r = int(navy[0] + (teal[0] - navy[0]) * ratio)
    g = int(navy[1] + (teal[1] - navy[1]) * ratio)
    b = int(navy[2] + (teal[2] - navy[2]) * ratio)
    draw.rectangle([(x, 0), (x+1, 150)], fill=(r, g, b))

# Logo
logo_resized = logo.resize((70, 70))
logo_bg = Image.new("RGBA", (90, 90), (*white, 255))
logo_bg.paste(logo_resized, (10, 10), logo_resized)
banner.paste(logo_bg, (20, 30), logo_bg)

# Text
try:
    banner_title_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 20)
    banner_body_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 14)
except:
    banner_title_font = banner_body_font = ImageFont.load_default()

draw.text((130, 25), "Beyond PubMed: AI Literature Search", fill=white, font=banner_title_font)
draw.text((130, 55), f"Tue, Jan 13, 2026 | 8-9 PM Muscat", fill=white, font=banner_body_font)
draw.text((130, 80), f"Dr. Mohamed Al Rawahi | {contact_email}", fill=white, font=banner_body_font)
draw.text((130, 105), f"Register: medresearch-academy.om/programs", fill=white, font=banner_body_font)

banner.save(f"{images_dir}/beyond-pubmed-email-signature.png")
print("   ✓ Email signature banner saved")

# ===== 4. SOCIAL MEDIA SQUARE (600x600) =====
print("4. Creating social media square...")
square = Image.new("RGB", (600, 600), white)
draw = ImageDraw.Draw(square)

# Gradient
for y in range(600):
    ratio = y / 600
    r = int(navy[0] + (teal[0] - navy[0]) * ratio)
    g = int(navy[1] + (teal[1] - navy[1]) * ratio)
    b = int(navy[2] + (teal[2] - navy[2]) * ratio)
    draw.rectangle([(0, y), (600, y+1)], fill=(r, g, b))

# Logo
logo_resized = logo.resize((100, 100))
logo_bg = Image.new("RGBA", (130, 130), (*white, 255))
logo_bg.paste(logo_resized, (15, 15), logo_resized)
square.paste(logo_bg, (235, 30), logo_bg)

# Title
try:
    sq_title_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 28)
    sq_body_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 20)
except:
    sq_title_font = sq_body_font = ImageFont.load_default()

draw.text((300, 190), "Beyond PubMed:", fill=white, font=sq_title_font, anchor="mm")
draw.text((300, 230), "AI Literature Search", fill=white, font=sq_title_font, anchor="mm")

# Date box - TUESDAY
draw.rectangle([(80, 280), (520, 380)], fill=white)
draw.text((300, 310), "📅 Tuesday, Jan 13", fill=navy, font=sq_title_font, anchor="mm")
draw.text((300, 350), "⏰ 8-9 PM Muscat Time", fill=teal, font=sq_body_font, anchor="mm")

# Speaker
draw.text((300, 420), "Dr. Mohamed Al Rawahi", fill=white, font=sq_body_font, anchor="mm")
draw.text((300, 450), speaker_credentials, fill=white, font=sq_body_font, anchor="mm")

# QR Code
qr_resized = qr_img.resize((100, 100))
square.paste(qr_resized, (250, 480))

# Contact - UPDATED EMAIL
draw.text((300, 590), contact_email, fill=white, font=sq_body_font, anchor="mm")

square.save(f"{images_dir}/beyond-pubmed-social-square.png")
print("   ✓ Social media square saved")

print("\n✅ All promotional materials regenerated successfully!")
print(f"   - Main flyer: {images_dir}/beyond-pubmed-flyer.png")
print(f"   - Instagram Story: {images_dir}/beyond-pubmed-story.png")
print(f"   - Email signature: {images_dir}/beyond-pubmed-email-signature.png")
print(f"   - Social square: {images_dir}/beyond-pubmed-social-square.png")
print(f"\n📅 Date: {date_text}")
print(f"📧 Contact: {contact_email}")
