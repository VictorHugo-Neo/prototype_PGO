import os
from groq import Groq

# 👇 SUBSTITUA PELA SUA CHAVE QUE VOCÊ COPIOU (Mantenha as aspas)
API_KEY = ""

client = Groq(api_key=API_KEY)

print("Tentando conectar com a IA...")

try:
    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "user",
                "content": "Gere 3 tarefas curtas para um TCC sobre 'Inteligência Artificial na Medicina'. Responda apenas com a lista numerada.",
            }
        ],
        model="llama3-8b-8192", # Modelo rápido e grátis
    )

    print("\nRESPOSTA DA IA:")
    print(chat_completion.choices[0].message.content)
    print("\n✅ Sucesso! A API está funcionando.")

except Exception as e:
    print(f"\n❌ Erro: {e}")