from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI, HTTPException, status
from .config import settings
from .schemas import (
    NotificationRequest,
    CustomNotificationRequest,
    NotificationResponse,
    HealthResponse,
    MetricsResponse,
)
from .providers import (
    WhatsAppProvider,
    MockWhatsAppProvider,
    WebhookWhatsAppProvider,
    EvolutionWhatsAppProvider,
)
from .services import NotificationService

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [%(name)s] %(message)s"
)
logger = logging.getLogger(settings.SERVICE_NAME)

def resolve_provider() -> WhatsAppProvider:
    provider_name = settings.WHATSAPP_PROVIDER.lower().strip()
    if provider_name == "evolution" and settings.WHATSAPP_API_URL:
        return EvolutionWhatsAppProvider(
            api_url=settings.WHATSAPP_API_URL,
            api_key=settings.WHATSAPP_API_KEY,
            instance_id=settings.WHATSAPP_INSTANCE_ID or "pgo",
            timeout=settings.REQUEST_TIMEOUT_SECONDS,
        )
    elif provider_name == "webhook" and settings.WHATSAPP_API_URL:
        return WebhookWhatsAppProvider(
            api_url=settings.WHATSAPP_API_URL,
            api_key=settings.WHATSAPP_API_KEY,
            instance_id=settings.WHATSAPP_INSTANCE_ID,
            timeout=settings.REQUEST_TIMEOUT_SECONDS,
        )
    return MockWhatsAppProvider()

provider: WhatsAppProvider = resolve_provider()
notifier_service: NotificationService = NotificationService(
    provider=provider,
    idempotency_ttl_seconds=settings.IDEMPOTENCY_TTL_HOURS * 3600
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    global provider, notifier_service
    logger.info("Iniciando %s na porta %s...", settings.SERVICE_NAME, settings.SERVICE_PORT)
    provider = resolve_provider()
    notifier_service = NotificationService(
        provider=provider,
        idempotency_ttl_seconds=settings.IDEMPOTENCY_TTL_HOURS * 3600
    )
    yield
    logger.info("Encerrando %s graciosamente...", settings.SERVICE_NAME)

app = FastAPI(
    title="PGO WhatsApp Notifier Microservice",
    version="1.0.0",
    description="Microserviço resiliente e desacoplado para notificações de prazos de TCC via WhatsApp",
    lifespan=lifespan,
)

@app.get("/health/live", response_model=HealthResponse, tags=["Health"])
def health_live():
    return HealthResponse(
        status="live",
        service=settings.SERVICE_NAME,
        provider=settings.WHATSAPP_PROVIDER,
    )

@app.get("/health/ready", response_model=HealthResponse, tags=["Health"])
async def health_ready():
    is_ready = await provider.check_health()
    if not is_ready:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Canal de mensageria WhatsApp indisponível",
        )
    return HealthResponse(
        status="ready",
        service=settings.SERVICE_NAME,
        provider=settings.WHATSAPP_PROVIDER,
    )

@app.post("/notify/deadline", response_model=NotificationResponse, tags=["Notifications"])
async def notify_task_deadline(request: NotificationRequest):
    if not request.student_phone or not request.student_phone.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Número de telefone do aluno é obrigatório para envio de WhatsApp.",
        )
    return await notifier_service.notify_deadline(request)

@app.post("/notify/custom", response_model=NotificationResponse, tags=["Notifications"])
async def notify_custom_message(request: CustomNotificationRequest):
    if not request.student_phone or not request.student_phone.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Número de telefone do aluno é obrigatório para envio de WhatsApp.",
        )
    if not request.message or not request.message.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Conteúdo da mensagem é obrigatório.",
        )
    return await notifier_service.notify_custom(request)

@app.get("/metrics", response_model=MetricsResponse, tags=["Metrics"])
def get_metrics():
    return MetricsResponse(
        total_processed=notifier_service.total_processed,
        total_sent=notifier_service.total_sent,
        total_skipped_duplicates=notifier_service.total_skipped,
        total_failed=notifier_service.total_failed,
    )
