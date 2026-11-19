# PGO - WhatsApp Notifier Microservice

Microserviço independente e desacoplado responsável por disparar lembretes de tarefas e prazos críticos para alunos via WhatsApp.

## 🛡️ Princípios de Arquitetura e Resiliência

1. **Padrão Bulkhead (Isolamento de Falhas)**:
   - Roda em processo e porta (`8001`) isolados do backend principal (`8000`).
   - Se este microserviço cair, reiniciar ou sofrer lentidão, o backend do PGO e o frontend continuam 100% operacionais.
2. **Idempotência (Anti-Spam)**:
   - Chave de idempotência baseada em `tarefa + telefone + data` para evitar disparos repetidos na mesma janela de 24 horas.
3. **Health Checks Padronizados**:
   - `GET /health/live`: Liveness probe instantâneo (200 OK).
   - `GET /health/ready`: Readiness probe verificando disponibilidade do provedor.
4. **Provedores Plugáveis (Adapter Pattern)**:
   - `mock`: Simulação de envio com logs estruturados (padrão em dev e testes).
   - `webhook`: Gateway HTTP para Evolution API, Z-API, Twilio ou Meta Cloud API.

## 🚀 Como Executar

### Opção 1: Via script utilitário (Automático)
```bash
cd services/whatsapp-notifier
./start.sh
```

### Opção 2: Ativando o ambiente virtual do projeto
```bash
cd services/whatsapp-notifier
source ../../backend/venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

### Opção 3: Invocando diretamente o uvicorn do venv
```bash
cd services/whatsapp-notifier
../../backend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

## 📬 Endpoints

- `POST /notify/deadline`: Envio de notificação com validação de idempotência.
- `GET /health/live`: Verificação de processo vivo.
- `GET /health/ready`: Verificação de canal pronto.
- `GET /metrics`: Métricas de mensagens processadas, enviadas e duplicatas prevenidas.
