from PIL import Image, ImageDraw, ImageFont

# Email signature banner: 600x150 (compact horizontal)
width, height = 600, 150
banner = Image.new('RGB', (width, height), 'white')
draw = ImageDraw.Draw(banner)

# Gradient background
for y in range(height):
    r = int(20 + (64 - 20) * (y / height))
    g = int(40 + (128 - 40) * (y / height))
    b = int(80 + (128 - 80) * (y / height))
    draw.line([(0, y), (width, y)], fill=(r, g, b))

# Load fonts
try:
    font_title = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 18)
    font_body = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 14)
    font_small = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 12)
except:
    font_title = font_body = font_small = ImageFont.load_default()

# Left section - Logo
try:
    logo = Image.open('client/public/images/logo.png')
    logo = logo.resize((80, 80), Image.Resampling.LANCZOS)
    banner.paste(logo, (15, 35), logo if logo.mode == 'RGBA' else None)
except:
    pass

# Middle section - Event info
x_start = 110
draw.text((x_start, 20), 'Join Our Next Session:', fill='white', font=font_title)
draw.text((x_start, 45), 'Beyond PubMed: AI-Powered Literature Search', fill='#5DD9C1', font=font_body)
draw.text((x_start, 70), '📅 Wed, Jan 14, 2026 | 🕐 8:00 PM', fill='white', font=font_small)
draw.text((x_start, 90), '💻 Zoom (Virtual) | Free Registration', fill='white', font=font_small)
draw.text((x_start, 115), '🔗 medresearch-academy.om/programs', fill='#5DD9C1', font=font_small)

# Save
banner.save('client/public/images/email-signature-banner.png')
print('Email signature banner created!')

# Also create a square version for social media (600x600)
square = Image.new('RGB', (600, 600), 'white')
draw_sq = ImageDraw.Draw(square)

# Gradient background
for y in range(600):
    r = int(20 + (64 - 20) * (y / 600))
    g = int(40 + (128 - 40) * (y / 600))
    b = int(80 + (128 - 80) * (y / 600))
    draw_sq.line([(0, y), (600, y)], fill=(r, g, b))

# Logo centered
try:
    logo = Image.open('client/public/images/logo.png')
    logo = logo.resize((120, 120), Image.Resampling.LANCZOS)
    square.paste(logo, (240, 40), logo if logo.mode == 'RGBA' else None)
except:
    pass

# Title
try:
    font_sq_title = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf', 32)
    font_sq_body = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 24)
    font_sq_small = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 20)
except:
    font_sq_title = font_sq_body = font_sq_small = ImageFont.load_default()

draw_sq.text((300, 180), 'Virtual Research Series', fill='white', font=font_sq_body, anchor='mm')
draw_sq.text((300, 240), 'Beyond PubMed:', fill='white', font=font_sq_title, anchor='mm')
draw_sq.text((300, 280), 'AI-Powered Literature Search', fill='white', font=font_sq_title, anchor='mm')
draw_sq.text((300, 330), 'Applications and Ethics', fill='#5DD9C1', font=font_sq_body, anchor='mm')

# Date box
draw_sq.rounded_rectangle([(50, 380), (550, 480)], radius=15, fill='#2C5F7F', outline='#5DD9C1', width=3)
draw_sq.text((300, 410), '📅 Wednesday, January 14, 2026', fill='white', font=font_sq_small, anchor='mm')
draw_sq.text((300, 445), '🕐 8:00 PM - 9:00 PM (Muscat Time)', fill='white', font=font_sq_small, anchor='mm')

# QR code
try:
    qr_img = Image.open('client/public/images/qr-code.png')
    qr_img = qr_img.resize((100, 100), Image.Resampling.LANCZOS)
    square.paste(qr_img, (250, 500))
except:
    pass

# Footer
draw_sq.text((300, 540), '@Medresearch_om', fill='#5DD9C1', font=font_sq_body, anchor='mm')
draw_sq.text((300, 570), 'Scan to Register', fill='white', font=font_sq_small, anchor='mm')

square.save('client/public/images/social-media-square-beyond-pubmed.png')
print('Social media square version created!')
