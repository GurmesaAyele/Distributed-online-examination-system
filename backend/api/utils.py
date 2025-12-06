from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from django.conf import settings
import os
from datetime import datetime

def generate_certificate_pdf(attempt):
    """Generate a PDF certificate for exam results"""
    filename = f"certificate_{attempt.student.username}_{attempt.exam.id}_{datetime.now().strftime('%Y%m%d')}.pdf"
    filepath = os.path.join(settings.MEDIA_ROOT, 'certificates', filename)
    
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    
    doc = SimpleDocTemplate(filepath, pagesize=A4)
    story = []
    styles = getSampleStyleSheet()
    
    # Title style
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#1a237e'),
        spaceAfter=30,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    
    # Add profile picture if available
    if attempt.student.profile_picture:
        try:
            # Get the full path to the profile picture
            if hasattr(attempt.student.profile_picture, 'path'):
                img_path = attempt.student.profile_picture.path
            else:
                img_path = os.path.join(settings.MEDIA_ROOT, str(attempt.student.profile_picture))
            
            if os.path.exists(img_path):
                img = Image(img_path, width=1.5*inch, height=1.5*inch)
                story.append(img)
                story.append(Spacer(1, 12))
            else:
                print(f"Profile picture not found at: {img_path}")
        except Exception as e:
            print(f"Error adding profile picture to certificate: {e}")
            pass
    
    # Certificate title
    story.append(Paragraph("EXAM CERTIFICATE", title_style))
    story.append(Spacer(1, 12))
    
    # Student info
    info_style = ParagraphStyle(
        'Info',
        parent=styles['Normal'],
        fontSize=12,
        alignment=TA_CENTER,
        spaceAfter=6
    )
    
    story.append(Paragraph(f"This is to certify that", info_style))
    story.append(Spacer(1, 6))
    
    name_style = ParagraphStyle(
        'Name',
        parent=styles['Normal'],
        fontSize=18,
        fontName='Helvetica-Bold',
        alignment=TA_CENTER,
        spaceAfter=12
    )
    story.append(Paragraph(f"{attempt.student.get_full_name()}", name_style))
    story.append(Spacer(1, 12))
    
    story.append(Paragraph(f"has successfully completed the examination", info_style))
    story.append(Spacer(1, 6))
    story.append(Paragraph(f"<b>{attempt.exam.title}</b>", info_style))
    story.append(Spacer(1, 24))
    
    # Results table
    data = [
        ['Exam Details', ''],
        ['Subject', attempt.exam.subject.name],
        ['Date', attempt.end_time.strftime('%B %d, %Y')],
        ['Total Marks', str(attempt.total_marks)],
        ['Marks Obtained', f"{attempt.obtained_marks:.2f}"],
        ['Percentage', f"{attempt.percentage:.2f}%"],
        ['Status', 'PASSED' if attempt.percentage >= (attempt.exam.passing_marks / attempt.exam.total_marks * 100) else 'FAILED'],
    ]
    
    table = Table(data, colWidths=[3*inch, 3*inch])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1a237e')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 14),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
    ]))
    
    story.append(table)
    story.append(Spacer(1, 36))
    
    # Footer
    footer_style = ParagraphStyle(
        'Footer',
        parent=styles['Normal'],
        fontSize=10,
        alignment=TA_CENTER,
        textColor=colors.grey
    )
    story.append(Paragraph(f"Generated on {datetime.now().strftime('%B %d, %Y at %I:%M %p')}", footer_style))
    
    doc.build(story)
    
    return f"/media/certificates/{filename}"
