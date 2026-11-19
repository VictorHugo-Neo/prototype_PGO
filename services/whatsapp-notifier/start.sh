#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if [ -f "$SCRIPT_DIR/../../backend/venv/bin/uvicorn" ]; then
    UVICORN_BIN="$SCRIPT_DIR/../../backend/venv/bin/uvicorn"
elif [ -f "$SCRIPT_DIR/venv/bin/uvicorn" ]; then
    UVICORN_BIN="$SCRIPT_DIR/venv/bin/uvicorn"
elif command -v uvicorn &> /dev/null; then
    UVICORN_BIN="uvicorn"
else
    echo "❌ Erro: uvicorn não foi encontrado no PATH nem no venv."
    echo "💡 Ative o ambiente virtual com: source ../../backend/venv/bin/activate"
    exit 1
fi

echo "🚀 Iniciando PGO WhatsApp Notifier Microservice na porta 8001..."
exec "$UVICORN_BIN" app.main:app --host 0.0.0.0 --port 8001 --reload
