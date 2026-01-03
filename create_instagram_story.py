from PIL import Image, ImageDraw, ImageFont

# Instagram Story dimensions: 1080x1920 (9:16)
width, height = 1080, 1920
story = Image.new('RGB', (width, height), 'white')
draw = ImageDraw.Draw(story)

# Create gradient background (navy to teal)
for y in range(height):
    r = int(20 + (64 - 20) * (y / height))
    g = int(40 + (128 - 40) * (y / height))
    b = int(80 + (128 - 80) * (y / height))
    draw.line([(0, y), (width, y)], fill=(r, g, b))

# Load fonts
try:
    font_huge = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf', 72)
    font_title = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf', 56)
    font_subtitle = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 40)
    font_body = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 32)
    font_small = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 28)
except:
    font_huge = font_title = font_subtitle = font_body = font_small = ImageFont.load_default()

# Top section - Logo and branding
try:
    logo = Image.open('client/public/images/logo.png')
    logo = logo.resize((180, 180), Image.Resampling.LANCZOS)
    story.paste(logo, (450, 80), logo if logo.mode == 'RGBA' else None)
except:
    pass

draw.text((540, 280), 'Virtual Research Series', fill='white', font=font_subtitle, anchor='mm')

# Main title
draw.text((540, 420), 'Beyond PubMed:', fill='white', font=font_title, anchor='mm')
draw.text((540, 500), 'AI-Powered', fill='white', font=font_title, anchor='mm')
draw.text((540, 580), 'Literature Search', fill='white', font=font_title, anchor='mm')
draw.text((540, 660), 'Applications and Ethics', fill='#5DD9C1', font=font_subtitle, anchor='mm')

# Speaker photo - centered and larger
try:
    dr_photo = Image.open('client/public/images/dr-rawahi.jpg')
    dr_photo = dr_photo.resize((350, 350), Image.Resampling.LANCZOS)
    # Add border
    bordered = Image.new('RGB', (360, 360), '#5DD9C1')
    bordered.paste(dr_photo, (5, 5))
    story.paste(bordered, (360, 750))
    print('Dr. Rawahi photo added to Instagram Story!')
except Exception as e:
    print(f'Photo error: {e}')

# Speaker info
draw.text((540, 1140), 'Dr. Mohamed Al Rawahi', fill='white', font=font_subtitle, anchor='mm')
draw.text((540, 1190), 'MD, MSc, FRCPC, ABIM', fill='#5DD9C1', font=font_small, anchor='mm')

# Date & Time - prominent box
box_y = 1260
draw.rounded_rectangle([(90, box_y), (990, box_y + 200)], radius=20, fill='#2C5F7F', outline='#5DD9C1', width=5)
draw.text((540, box_y + 40), '📅 Wednesday, January 14, 2026', fill='white', font=font_body, anchor='mm')
draw.text((540, box_y + 90), '🕐 8:00 PM - 9:00 PM', fill='white', font=font_body, anchor='mm')
draw.text((540, box_y + 140), '💻 Zoom (Virtual)', fill='white', font=font_body, anchor='mm')

# QR Code
try:
    qr_img = Image.open('client/public/images/qr-code.png')
    qr_img = qr_img.resize((220, 220), Image.Resampling.LANCZOS)
    story.paste(qr_img, (430, 1520))
    print('QR code added to Instagram Story!')
except:
    pass

draw.text((540, 1760), 'Scan to Register', fill='white', font=font_body, anchor='mm')

# Footer
draw.text((540, 1820), '@Medresearch_om', fill='#5DD9C1', font=font_subtitle, anchor='mm')
draw.text((540, 1870), 'Empowering Medical Researchers', fill='white', font=font_small, anchor='mm')

# Save
story.save('client/public/images/instagram-story-beyond-pubmed.png')
print('Instagram Story created successfully!')
