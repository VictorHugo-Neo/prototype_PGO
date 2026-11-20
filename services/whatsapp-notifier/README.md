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
   - `GET /health/ready`: Readiness probe verificando disponibilidade do provedor e da instância do WhatsApp.
4. **Provedores Plugáveis (Adapter Pattern)**:
   - `evolution`: Suporte nativo à [Evolution API v2](https://github.com/EvolutionAPI/evolution-api) com verificação de estado (`open`), auto-prefixação de DDI Brasil (55) e envio autenticado.
   - `webhook`: Gateway HTTP genérico para Z-API ou Meta Cloud API.
   - `mock`: Simulação de envio com logs estruturados (padrão em testes).

---

## ⚡ Guia Rápido: Configuração com Evolution API

### Passo 1: Subir a Evolution API com Docker Compose
O arquivo `docker-compose.evolution.yml` já está pronto com PostgreSQL e Redis:

```bash
cd services/whatsapp-notifier
docker compose -f docker-compose.evolution.yml up -d
```

A API estará disponível em: `http://localhost:8080`.

### Passo 2: Criar e Parear a Instância do WhatsApp
Utilize o assistente CLI incluído:

```bash
python manage_evolution.py status
python manage_evolution.py create
python manage_evolution.py pair 11999998888
```

Abra o WhatsApp no seu smartphone em **Aparelhos Conectados > Conectar um Aparelho** e aponte a câmera para a imagem gerada `services/whatsapp-notifier/qrcode.png`.

### Passo 3: Testar o Envio de Mensagem
```bash
python manage_evolution.py send 11999998888 "Teste de envio via Evolution API no PGO!"
```

### Passo 4: Iniciar o Microserviço Notifier do PGO
```bash
./start.sh
```

---

## 🚀 Como Executar o Microserviço

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

---

## 📬 Endpoints da API

- `POST /notify/deadline`: Envio de notificação de prazo com validação de idempotência.
- `POST /notify/custom`: Envio de mensagem personalizada enviada por orientadores.
- `GET /health/live`: Verificação de processo vivo (200 OK).
- `GET /health/ready`: Verificação de canal pronto (testa se o WhatsApp da instância está `open`).
- `GET /metrics`: Métricas de mensagens processadas, enviadas, duplicatas prevenidas e falhas.
