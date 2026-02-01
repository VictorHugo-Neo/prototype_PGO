from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from groq import Groq
import json
from .. import models, schemas, deps
from ..database import get_db
from ..config import settings

router = APIRouter(prefix="/ai", tags=["ai"])

# Inicializa o cliente com a chave do config
client = Groq(api_key=settings.GROQ_API_KEY)

@router.post("/generate-tasks/{guidance_id}")
def generate_tasks_with_ai(
    guidance_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    # 1. Busca a orientação para saber o TEMA
    guidance = db.query(models.Guidance).filter(models.Guidance.id == guidance_id).first()
    if not guidance:
        raise HTTPException(status_code=404, detail="Orientação não encontrada")
    
    # 2. Cria o Prompt para a IA
    theme = guidance.theme
    prompt = f"""
    Atue como um orientador experiente de TCC.
    O tema do trabalho é: "{theme}".
    Gere 5 tarefas iniciais essenciais para este projeto.
    
    IMPORTANTE: Responda APENAS com um JSON puro, sem textos antes ou depois.
    Formato obrigatório:
    [
        {{"title": "Título curto", "description": "Descrição detalhada..."}},
        {{"title": "Título curto", "description": "Descrição detalhada..."}}
    ]
    """

    try:
        # 3. Chama a Groq
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            temperature=0.5, # Criatividade equilibrada
        )
        
        ai_content = chat_completion.choices[0].message.content
        
        # Limpeza básica caso a IA mande algo fora do JSON
        start_index = ai_content.find('[')
        end_index = ai_content.rfind(']') + 1
        json_str = ai_content[start_index:end_index]
        
        tasks_data = json.loads(json_str)

        # 4. Salva as tarefas no Banco
        created_tasks = []
        for t in tasks_data:
            new_task = models.Task(
                title=t['title'],
                description=t['description'],
                guidance_id=guidance_id,
                status="pending"
            )
            db.add(new_task)
            created_tasks.append(new_task)
        
        db.commit()
        return {"message": "Tarefas geradas com sucesso", "count": len(created_tasks)}

    except Exception as e:
        print(f"Erro na IA: {e}")
        raise HTTPException(status_code=500, detail="Erro ao gerar tarefas com IA. Tente novamente.")