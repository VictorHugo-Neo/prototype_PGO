from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from io import BytesIO
from datetime import datetime
from .. import models, deps
from ..database import get_db

router = APIRouter(prefix="/report", tags=["report"])

@router.get("/{guidance_id}")
def generate_pdf_report(
    guidance_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    # 1. Busca os dados
    guidance = db.query(models.Guidance).filter(models.Guidance.id == guidance_id).first()
    if not guidance:
        raise HTTPException(status_code=404, detail="Orientação não encontrada")
        
    tasks = db.query(models.Task).filter(models.Task.guidance_id == guidance_id).all()
    meetings = db.query(models.Meeting).filter(models.Meeting.guidance_id == guidance_id).all()
    
    # 2. Configura o Buffer (arquivo na memória)
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    elements = []
    styles = getSampleStyleSheet()
    
    # 3. Cabeçalho
    title_style = styles['Title']
    elements.append(Paragraph(f"Relatório de Orientação - PGO", title_style))
    elements.append(Spacer(1, 12))
    
    # Informações Gerais
    info_text = f"""
    <b>Aluno:</b> {guidance.student.name}<br/>
    <b>Orientador:</b> {guidance.advisor.name}<br/>
    <b>Tema:</b> {guidance.theme}<br/>
    <b>Data do Relatório:</b> {datetime.now().strftime('%d/%m/%Y')}
    """
    elements.append(Paragraph(info_text, styles['Normal']))
    elements.append(Spacer(1, 24))
    
    # 4. Tabela de Tarefas
    elements.append(Paragraph("Histórico de Tarefas", styles['Heading2']))
    
    if not tasks:
        elements.append(Paragraph("Nenhuma tarefa registrada.", styles['Normal']))
    else:
        # Cabeçalho da Tabela
        data = [['Título', 'Status', 'Prazo']]
        for t in tasks:
            status_map = {'pending': 'Pendente', 'in_progress': 'Em Andamento', 'completed': 'Concluído'}
            prazo = t.time_estimate.strftime('%d/%m/%Y') if t.time_estimate else '-'
            data.append([t.title[:40], status_map.get(t.status, t.status), prazo])
            
        t = Table(data, colWidths=[300, 100, 100])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        elements.append(t)
    
    elements.append(Spacer(1, 24))

    # 5. Tabela de Reuniões
    elements.append(Paragraph("Registro de Reuniões", styles['Heading2']))
    
    if not meetings:
        elements.append(Paragraph("Nenhuma reunião registrada.", styles['Normal']))
    else:
        data_meet = [['Data', 'Assunto', 'Status']]
        for m in meetings:
            status_meet = {'pending': 'Pendente', 'confirmed': 'Confirmada', 'rejected': 'Cancelada'}
            data_meet.append([
                m.date.strftime('%d/%m/%Y %H:%M'), 
                m.topic, 
                status_meet.get(m.status, m.status)
            ])
            
        tm = Table(data_meet, colWidths=[120, 280, 100])
        tm.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        elements.append(tm)

    # 6. Gera o PDF
    doc.build(elements)
    buffer.seek(0)
    
    filename = f"Relatorio_{guidance.student.name.replace(' ', '_')}.pdf"
    
    return StreamingResponse(
        buffer, 
        media_type="application/pdf", 
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )