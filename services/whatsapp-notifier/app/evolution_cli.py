# -*- coding: utf-8 -*-
import sys
import os
import argparse
import base64
import httpx
from pathlib import Path

CURRENT_DIR = Path(__file__).resolve().parent.parent
ENV_PATH = CURRENT_DIR / ".env"

API_URL = "http://localhost:8080"
API_KEY = "pgo_evolution_secret_key_123"
INSTANCE_NAME = "pgo"

if ENV_PATH.exists():
    with open(ENV_PATH, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            k = k.strip()
            v = v.strip().strip('"').strip("'")
            if k == "WHATSAPP_API_URL" and v:
                API_URL = v
            elif k == "WHATSAPP_API_KEY" and v:
                API_KEY = v
            elif k == "WHATSAPP_INSTANCE_ID" and v:
                INSTANCE_NAME = v

def get_headers():
    return {
        "Content-Type": "application/json",
        "apikey": API_KEY,
    }

def check_status():
    print(f"🔍 Verificando Evolution API em: {API_URL}")
    print(f"🔑 Chave API: {API_KEY[:6]}... ({len(API_KEY)} chars)")
    print(f"📱 Instância Alvo: '{INSTANCE_NAME}'\n")

    try:
        with httpx.Client(timeout=4.0) as client:
            res_root = client.get(f"{API_URL}/", headers=get_headers())
            print(f"🟢 Servidor Evolution API: Online (HTTP {res_root.status_code})")
    except Exception as exc:
        print(f"🔴 Erro ao conectar ao servidor Evolution API: {exc}")
        print("💡 Verifique se o container docker está rodando com: docker compose -f docker-compose.evolution.yml ps")
        return False

    try:
        with httpx.Client(timeout=4.0) as client:
            res_instance = client.get(
                f"{API_URL}/instance/connectionState/{INSTANCE_NAME}",
                headers=get_headers(),
            )
            if res_instance.status_code == 200:
                data = res_instance.json()
                state = data.get("instance", {}).get("state") or data.get("state") or "unknown"
                if state == "open":
                    print(f"✅ Instância '{INSTANCE_NAME}': CONECTADA E PRONTA! (state: open)")
                elif state == "connecting":
                    print(f"⏳ Instância '{INSTANCE_NAME}': Conectando... (state: connecting)")
                else:
                    print(f"⚠️  Instância '{INSTANCE_NAME}': Não conectada (state: {state}).")
                    print(f"💡 Gere o QR Code com: python manage_evolution.py qrcode")
                return True
            elif res_instance.status_code == 404:
                print(f"⚠️  Instância '{INSTANCE_NAME}' não encontrada na Evolution API.")
                print(f"💡 Crie a instância com: python manage_evolution.py create")
                return False
            else:
                print(f"⚠️  Resposta inesperada da instância: HTTP {res_instance.status_code} - {res_instance.text}")
                return False
    except Exception as exc:
        print(f"🔴 Erro ao consultar instância: {exc}")
        return False

def create_instance():
    print(f"🚀 Criando instância '{INSTANCE_NAME}' na Evolution API...")
    payload = {
        "instanceName": INSTANCE_NAME,
        "token": API_KEY,
        "qrcode": True,
        "integration": "WHATSAPP-BAILEYS",
    }
    try:
        with httpx.Client(timeout=10.0) as client:
            res = client.post(
                f"{API_URL}/instance/create",
                json=payload,
                headers=get_headers(),
            )
            if res.status_code in (200, 201):
                print(f"✅ Instância '{INSTANCE_NAME}' criada com sucesso!")
                data = res.json()
                if "qrcode" in data and isinstance(data["qrcode"], dict):
                    base64_data = data["qrcode"].get("base64")
                    if base64_data:
                        save_qrcode_image(base64_data)
                print(f"👉 Agora execute: python manage_evolution.py qrcode")
                return True
            else:
                print(f"⚠️  Falha ao criar instância: HTTP {res.status_code} - {res.text}")
                return False
    except Exception as exc:
        print(f"🔴 Erro de requisição: {exc}")
        return False

def save_qrcode_image(base64_str: str):
    if "," in base64_str:
        base64_str = base64_str.split(",", 1)[1]
    img_data = base64.b64decode(base64_str)
    output_path = CURRENT_DIR / "qrcode.png"
    with open(output_path, "wb") as f:
        f.write(img_data)
    print(f"📸 Imagem do QR Code salva com sucesso em: {output_path}")

def get_qrcode():
    print(f"📲 Solicitando QR Code de pareamento para '{INSTANCE_NAME}'...")
    try:
        with httpx.Client(timeout=8.0) as client:
            res = client.get(
                f"{API_URL}/instance/connect/{INSTANCE_NAME}",
                headers=get_headers(),
            )
            if res.status_code == 200:
                data = res.json()
                base64_data = data.get("base64")
                pairing_code = data.get("pairingCode") or data.get("code")
                
                if base64_data:
                    save_qrcode_image(base64_data)
                    print("\n📲 Abra o WhatsApp no seu smartphone:")
                    print("   1. Toque em Configurações (ou 3 pontinhos) > Aparelhos conectados")
                    print("   2. Toque em 'Conectar um aparelho'")
                    print(f"   3. Abra a imagem '{CURRENT_DIR / 'qrcode.png'}' e aponte a câmera!")
                
                if pairing_code:
                    print(f"\n🔢 Código de Pareamento alternativo: {pairing_code}")
                return True
            else:
                print(f"⚠️  Não foi possível obter o QR Code: HTTP {res.status_code} - {res.text}")
                return False
    except Exception as exc:
        print(f"🔴 Erro ao obter QR Code: {exc}")
        return False

def pair_with_phone(phone: str):
    import time
    cleaned = "".join(filter(str.isdigit, phone))
    if len(cleaned) in (10, 11) and not cleaned.startswith("55"):
        cleaned = f"55{cleaned}"

    print(f"📲 Iniciando pareamento por número de telefone: {cleaned}")

    try:
        with httpx.Client(timeout=8.0) as client:
            client.delete(f"{API_URL}/instance/delete/{INSTANCE_NAME}", headers=get_headers())
    except Exception:
        pass

    payload = {
        "instanceName": INSTANCE_NAME,
        "token": API_KEY,
        "number": cleaned,
        "qrcode": False,
        "integration": "WHATSAPP-BAILEYS",
    }

    print("⏳ Registrando instância e requisitando código de pareamento à Meta...")
    try:
        with httpx.Client(timeout=15.0) as client:
            res_create = client.post(f"{API_URL}/instance/create", json=payload, headers=get_headers())
            pairing_code = None
            if res_create.status_code in (200, 201):
                data = res_create.json()
                pairing_code = data.get("qrcode", {}).get("pairingCode") if data.get("qrcode") else None

            if not pairing_code:
                for attempt in range(1, 4):
                    time.sleep(2)
                    res_conn = client.get(f"{API_URL}/instance/connect/{INSTANCE_NAME}?number={cleaned}", headers=get_headers())
                    if res_conn.status_code == 200:
                        conn_data = res_conn.json()
                        pairing_code = conn_data.get("pairingCode")
                        if pairing_code:
                            break

            if pairing_code:
                print("\n" + "=" * 52)
                print(f"🔑 CÓDIGO DE PAREAMENTO WHATSAPP:  {pairing_code}")
                print("=" * 52)
                print("\n📱 Passo a passo no seu celular:")
                print("   1. Abra o WhatsApp no seu smartphone")
                print("   2. Vá em Configurações > Aparelhos Conectados > Conectar Aparelho")
                print("   3. Toque em 'Conectar com número de telefone' (abaixo da câmera)")
                print(f"   4. Digite o código de 8 dígitos: {pairing_code}")
                print("=" * 52 + "\n")
                return True
            else:
                print("\n⚠️  A API não retornou o código de pareamento de imediato.")
                print(f"💡 Você também pode abrir o painel em http://localhost:8080/manager para parear com o número {cleaned}.")
                return False
    except Exception as exc:
        print(f"🔴 Erro ao parear com número: {exc}")
        return False

def send_test_message(phone: str, message: str):
    cleaned = "".join(filter(str.isdigit, phone))
    if len(cleaned) in (10, 11) and not cleaned.startswith("55"):
        cleaned = f"55{cleaned}"

    print(f"📤 Enviando mensagem de teste para: {cleaned}")
    payload = {
        "number": cleaned,
        "text": message,
    }
    try:
        with httpx.Client(timeout=10.0) as client:
            res = client.post(
                f"{API_URL}/message/sendText/{INSTANCE_NAME}",
                json=payload,
                headers=get_headers(),
            )
            if res.status_code in (200, 201):
                print(f"✅ Mensagem enviada com sucesso! Resposta: {res.json()}")
                return True
            else:
                print(f"❌ Falha no envio: HTTP {res.status_code} - {res.text}")
                return False
    except Exception as exc:
        print(f"🔴 Erro de envio: {exc}")
        return False

def main():
    parser = argparse.ArgumentParser(description="CLI de gerenciamento Evolution API do PGO")
    subparsers = parser.add_subparsers(dest="command", help="Comandos disponíveis")

    subparsers.add_parser("status", help="Verifica a saúde da API e o status da instância")
    subparsers.add_parser("create", help="Cria a instância pgo na Evolution API")
    subparsers.add_parser("qrcode", help="Obtém o QR Code de pareamento do WhatsApp")

    pair_parser = subparsers.add_parser("pair", help="Gera código de pareamento para conectar por número de telefone")
    pair_parser.add_argument("phone", help="Número do WhatsApp com DDD (ex: 11999998888)")

    send_parser = subparsers.add_parser("send", help="Dispara uma mensagem de teste")
    send_parser.add_argument("phone", help="Número de telefone (ex: 11999998888)")
    send_parser.add_argument("message", help="Texto da mensagem a ser enviada")

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        sys.exit(0)

    if args.command == "status":
        check_status()
    elif args.command == "create":
        create_instance()
    elif args.command == "qrcode":
        get_qrcode()
    elif args.command == "pair":
        pair_with_phone(args.phone)
    elif args.command == "send":
        send_test_message(args.phone, args.message)
