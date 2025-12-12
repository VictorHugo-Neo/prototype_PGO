from sqlalchemy import Column, Integer, String, Text, Bolean, ForeignKey, DataTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from .database import Base

class TipoUsuario(str, enum.Enum):
    ORIENTADOR = 'orientador'
    ALUNO = 'aluno'

class StatusTarefa(str, enum.Enum):
    PENDENTE = 'pendente'
    EM_ANDAMENTO = 'em_andamento'
    CONCLUIDO = 'concluido'
    ATRASADO = 'atrasado'

    