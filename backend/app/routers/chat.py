from fastapi import APIRouter, HTTPException
from ..schemas import ChatRequest, ChatResponse
from ..services.ai_agent import generate_response

router = APIRouter(prefix="/chat", tags=["ia_assistant"])

@router.post("/", response_model=ChatResponse)
def chat_com_ia(request: ChatRequest):

    simulated_context = "Aluno cursando último semestre, TCC fase inicial."

    answer_ia = generate_response(request.message, simulated_context)

    return ChatResponse(response=answer_ia)