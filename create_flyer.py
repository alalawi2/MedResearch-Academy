from PIL import Image, ImageDraw, ImageFont

# Create flyer canvas (portrait: 1200x1600px)
width, height = 1200, 1600
flyer = Image.new('RGB', (width, height), 'white')
draw = ImageDraw.Draw(flyer)

# Create gradient background (navy to teal)
for y in range(height):
    r = int(20 + (64 - 20) * (y / height))
    g = int(40 + (128 - 40) * (y / height))
    b = int(80 + (128 - 80) * (y / height))
    draw.line([(0, y), (width, y)], fill=(r, g, b))

# Load and place logo (MedResearch Academy)
try:
    logo = Image.open('client/public/images/logo_final_v2.png')
    logo = logo.resize((150, 150), Image.Resampling.LANCZOS)
    # Create white background for logo
    logo_bg = Image.new('RGB', (160, 160), 'white')
    logo_bg.paste(logo, (5, 5), logo if logo.mode == 'RGBA' else None)
    flyer.paste(logo_bg, (40, 40))
    print('MedResearch Academy logo added successfully!')
except Exception as e:
    print(f'Logo error: {e}')

# Load fonts
try:
    font_title = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf', 48)
    font_subtitle = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 32)
    font_body = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 24)
    font_small = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 20)
except:
    font_title = ImageFont.load_default()
    font_subtitle = font_body = font_small = font_title

# Virtual Research Series text
draw.text((270, 80), 'Virtual Research Series', fill='white', font=font_subtitle)

# Main title
draw.text((100, 240), 'Beyond PubMed:', fill='white', font=font_title)
draw.text((100, 300), 'AI-Powered Literature Search', fill='white', font=font_title)
draw.text((100, 360), 'Applications and Ethics', fill='#5DD9C1', font=font_subtitle)

# Load actual Dr. Rawahi photo from website
try:
    dr_photo = Image.open('client/public/images/dr-rawahi.jpg')
    dr_photo = dr_photo.resize((280, 280), Image.Resampling.LANCZOS)
    # Add teal border
    bordered = Image.new('RGB', (290, 290), '#5DD9C1')
    bordered.paste(dr_photo, (5, 5))
    flyer.paste(bordered, (100, 450))
    print('Dr. Rawahi photo added successfully!')
except Exception as e:
    print(f'Photo error: {e}')

# Date & Time box
box_x, box_y = 450, 450
box_w, box_h = 650, 280
draw.rounded_rectangle([(box_x, box_y), (box_x + box_w, box_y + box_h)], 
                       radius=20, fill='#2C5F7F', outline='#5DD9C1', width=4)
draw.text((box_x + 30, box_y + 20), '📅 Date & Time', fill='white', font=font_subtitle)
draw.text((box_x + 30, box_y + 80), 'Date:', fill='white', font=font_body)
draw.text((box_x + 30, box_y + 110), 'Tuesday, January', fill='white', font=font_body)
draw.text((box_x + 30, box_y + 140), '13, 2026', fill='white', font=font_body)
draw.text((box_x + 30, box_y + 180), 'Time: 8:00 PM - 9:00 PM', fill='white', font=font_small)
draw.text((box_x + 30, box_y + 210), '(Muscat Time)', fill='white', font=font_small)
draw.text((box_x + 30, box_y + 240), 'Platform: Zoom (Virtual)', fill='white', font=font_small)

# Speaker info below photo
draw.text((100, 760), 'Dr. Mohamed Al Rawahi', fill='white', font=font_subtitle)
draw.text((100, 800), 'MD, MSc, FRCPC, ABIM', fill='#5DD9C1', font=font_small)
draw.text((100, 830), 'Senior Consultant in Cardiac', fill='white', font=font_small)
draw.text((100, 860), 'Electrophysiology & Clinical Microbiology', fill='white', font=font_small)

# Learning Objectives
draw.text((100, 920), 'Learning Objectives:', fill='white', font=font_subtitle)
objectives = [
    '• Understand capabilities and limitations of AI-powered',
    '  literature search tools beyond traditional databases',
    '• Learn practical applications of AI for efficient evidence',
    '  synthesis and systematic reviews',
    '• Explore ethical considerations when using AI in medical',
    '  research and publication',
    '• Discover strategies to integrate AI tools into your research',
    '  workflow while maintaining academic integrity'
]
y_pos = 970
for obj in objectives:
    draw.text((100, y_pos), obj, fill='white', font=font_small)
    y_pos += 30

# QR Code - load actual generated QR code
try:
    qr_img = Image.open('client/public/images/qr-code.png')
    qr_img = qr_img.resize((180, 180), Image.Resampling.LANCZOS)
    flyer.paste(qr_img, (950, 1350))
    print('QR code added successfully!')
except Exception as e:
    print(f'QR code error: {e}')
    # Fallback placeholder
    draw.rounded_rectangle([(950, 1350), (1130, 1530)], radius=10, fill='white')
    draw.text((970, 1440), 'QR CODE', fill='black', font=font_body)
draw.text((920, 1540), 'Scan to Register', fill='white', font=font_small)

# Footer
draw.text((100, 1520), 'Empowering the Next Generation of Medical Researchers', 
         fill='white', font=font_small)
draw.text((100, 1550), '@Medresearch_om on social media', fill='#5DD9C1', font=font_small)

# Save
flyer.save('client/public/images/beyond-pubmed-flyer.png')
print('Flyer created successfully with actual Dr. Rawahi photo!')
