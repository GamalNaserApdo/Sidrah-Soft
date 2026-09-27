"""Certificate PDF generation service.

Generates a print-ready PDF certificate using ReportLab.

DESIGN NOTE:
The approved certificate template/asset was NOT found in the project
(see audit finding: Missing Certificate Template Asset). This service
generates a clean, professional certificate layout as a placeholder
until the approved design asset is provided. The layout is:

- A4 landscape
- Gold border (brand color #c9a96e)
- Recipient name (large, centered)
- Certificate title / program name
- Training period dates
- Issue date
- Certificate reference
- QR code (bottom-right) linking to verification URL
- Signature line: "Alaa Alnahaal — CEO" (text only, no signature image asset exists)

When the approved template asset is provided, replace the _draw_layout
method to render the template image as background and overlay text fields.
"""
import io
import qrcode
from datetime import datetime

from django.conf import settings
from django.utils import timezone

from apps.training.models import Certificate


# Brand colors
GOLD = '#c9a96e'
DARK = '#0a0a14'
LIGHT_GRAY = '#666666'

# A4 landscape in points (1pt = 1/72 inch)
PAGE_WIDTH = 842
PAGE_HEIGHT = 595


def generate_certificate_pdf(certificate):
    """Generate a PDF certificate for the given Certificate instance.

    Args:
        certificate: Certificate model instance (must be issued or revoked).

    Returns:
        bytes: PDF file content.

    Raises:
        ValueError: If certificate is a draft (drafts are not printable).
    """
    if certificate.status == Certificate.STATUS_DRAFT:
        raise ValueError('Draft certificates cannot be printed.')

    from reportlab.lib.colors import HexColor
    from reportlab.lib.units import mm
    from reportlab.pdfgen import canvas

    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=(PAGE_WIDTH, PAGE_HEIGHT))

    # ─── Border ───
    border_margin = 15 * mm
    c.setStrokeColor(HexColor(GOLD))
    c.setLineWidth(3)
    c.rect(border_margin, border_margin,
           PAGE_WIDTH - 2 * border_margin,
           PAGE_HEIGHT - 2 * border_margin, stroke=1, fill=0)

    # Inner border (thinner)
    c.setLineWidth(1)
    c.rect(border_margin + 4, border_margin + 4,
           PAGE_WIDTH - 2 * border_margin - 8,
           PAGE_HEIGHT - 2 * border_margin - 8, stroke=1, fill=0)

    # ─── Header ───
    c.setFillColor(HexColor(DARK))
    c.setFont('Helvetica-Bold', 28)
    c.drawCentredString(PAGE_WIDTH / 2, PAGE_HEIGHT - 80, 'SIDRAH SOFT')

    c.setFillColor(HexColor(GOLD))
    c.setFont('Helvetica', 12)
    c.drawCentredString(PAGE_WIDTH / 2, PAGE_HEIGHT - 100, 'Certificate of Completion' if certificate.certificate_type == 'completion' else 'Certificate of Recognition')

    # Decorative line
    c.setStrokeColor(HexColor(GOLD))
    c.setLineWidth(0.5)
    c.line(PAGE_WIDTH / 2 - 100, PAGE_HEIGHT - 110, PAGE_WIDTH / 2 + 100, PAGE_HEIGHT - 110)

    # ─── Recipient Name ───
    recipient = certificate.effective_recipient_name or ''
    c.setFillColor(HexColor(DARK))
    c.setFont('Helvetica-Bold', 36)
    c.drawCentredString(PAGE_WIDTH / 2, PAGE_HEIGHT - 180, recipient)

    # ─── Body Text ───
    c.setFillColor(HexColor(LIGHT_GRAY))
    c.setFont('Helvetica', 14)

    cert_title = certificate.effective_certificate_title or ''
    if certificate.certificate_type == 'completion':
        body_lines = [
            'has successfully completed the training program',
            cert_title,
        ]
    else:
        reason = certificate.recognition_reason or ''
        body_lines = [
            'is hereby recognized for outstanding contribution',
            cert_title or reason or 'Excellence in Training',
        ]

    y = PAGE_HEIGHT - 220
    for line in body_lines:
        c.drawCentredString(PAGE_WIDTH / 2, y, line)
        y -= 24

    # ─── Training Period ───
    start_date = certificate.training_start_date
    end_date = certificate.training_end_date
    if start_date and end_date:
        date_str = f'Training Period: {start_date.strftime("%B %d, %Y")} — {end_date.strftime("%B %d, %Y")}'
    elif start_date:
        date_str = f'Start Date: {start_date.strftime("%B %d, %Y")}'
    else:
        date_str = ''

    if date_str:
        c.setFont('Helvetica', 12)
        c.drawCentredString(PAGE_WIDTH / 2, y - 20, date_str)
        y -= 44

    # ─── Issue Date ───
    issue_date = certificate.issued_at
    if issue_date:
        issue_str = f'Issued on {issue_date.strftime("%B %d, %Y")}'
    else:
        issue_str = ''

    if issue_str:
        c.setFont('Helvetica', 12)
        c.drawCentredString(PAGE_WIDTH / 2, y - 20, issue_str)
        y -= 44

    # ─── Certificate Reference ───
    c.setFillColor(HexColor(DARK))
    c.setFont('Helvetica-Bold', 11)
    c.drawCentredString(PAGE_WIDTH / 2, y - 20, f'Reference: {certificate.reference}')
    y -= 40

    # ─── Verification URL ───
    public_url = getattr(settings, 'PUBLIC_SITE_URL', '').rstrip('/')
    verification_url = f'{public_url}/certificates/verify/{certificate.reference}'
    c.setFillColor(HexColor(LIGHT_GRAY))
    c.setFont('Helvetica', 9)
    c.drawCentredString(PAGE_WIDTH / 2, y - 10, f'Verify at: {verification_url}')

    # ─── Signature (bottom-left) ───
    sig_y = border_margin + 40
    sig_x = border_margin + 30

    c.setStrokeColor(HexColor(DARK))
    c.setLineWidth(0.5)
    c.line(sig_x, sig_y, sig_x + 160, sig_y)

    c.setFillColor(HexColor(DARK))
    c.setFont('Helvetica-Bold', 11)
    c.drawString(sig_x, sig_y - 16, 'Alaa Alnahaal')
    c.setFont('Helvetica', 9)
    c.setFillColor(HexColor(LIGHT_GRAY))
    c.drawString(sig_x, sig_y - 28, 'CEO, Sidrah Soft')

    # ─── QR Code (bottom-right) ───
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=6,
        border=2,
    )
    qr.add_data(verification_url)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color='black', back_color='white')

    qr_buffer = io.BytesIO()
    qr_img.save(qr_buffer, format='PNG')
    qr_buffer.seek(0)

    qr_size = 80
    qr_x = PAGE_WIDTH - border_margin - 30 - qr_size
    qr_y = sig_y - 20

    from reportlab.lib.utils import ImageReader
    c.drawImage(ImageReader(qr_buffer), qr_x, qr_y, width=qr_size, height=qr_size, mask='auto')

    c.setFillColor(HexColor(LIGHT_GRAY))
    c.setFont('Helvetica', 7)
    c.drawCentredString(qr_x + qr_size / 2, qr_y - 10, 'Scan to verify')

    # ─── Revoked Watermark (if revoked) ───
    if certificate.status == Certificate.STATUS_REVOKED:
        c.saveState()
        c.translate(PAGE_WIDTH / 2, PAGE_HEIGHT / 2)
        c.rotate(45)
        c.setFillColor(HexColor('#ff0000'))
        c.setFillAlpha(0.15)
        c.setFont('Helvetica-Bold', 72)
        c.drawCentredString(0, 0, 'REVOKED')
        c.restoreState()

    c.showPage()
    c.save()
    buffer.seek(0)
    return buffer.getvalue()
