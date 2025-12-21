from langchain_ollama import ChatOllama
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser


llm = ChatOllama(model="llama3.2") 


system_template = """
Você é o Assistente Virtual do PGO (Plataforma de Gestão de Orientação).
Seu objetivo é ajudar alunos com dúvidas sobre TCC, ABNT e prazos.

Contexto do Aluno: {contexto_aluno}

Responda de forma curta, encorajadora e direta.
Se não souber, diga que o aluno deve consultar o orientador.
"""

prompt = ChatPromptTemplate.from_messages([
    ("system", system_template),
    ("user", "{pergunta}")
])


chain = prompt | llm | StrOutputParser()

def generate_response(question: str, context: str = "Aluno de Graduação") -> str:
    try:
        return chain.invoke({"pergunta": question, "contexto_aluno": context})
    except Exception as e:
        print(f"Erro ao chamar Ollama: {e}")
        return "Desculpe, estou tendo dificuldades para pensar agora. Verifique se o Ollama está rodando."