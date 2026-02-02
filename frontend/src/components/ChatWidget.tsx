import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Loader2 } from 'lucide-react';
import { aiService } from '../services/api';

// 👇 Adicionamos uma interface para receber o ID dinâmico
interface ChatWidgetProps {
  guidanceId: number;
}

export function ChatWidget({ guidanceId }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  // Mensagem inicial neutra
  const [messages, setMessages] = useState<any[]>([
    { id: '1', text: 'Olá! Sou o assistente do projeto. Analisei os dados deste aluno. Como posso ajudar?', sender: 'bot' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    "Quais tarefas estão pendentes?",
    "Resuma o progresso atual",
    "O que foi concluído?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, isOpen]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userText = inputText;
    setInputText('');

    // Adiciona msg do usuário
    setMessages(prev => [...prev, { id: Date.now().toString(), text: userText, sender: 'user' }]);
    setIsLoading(true);

    try {
      // 👇 AGORA SIM: Usa o ID que veio via props, não o fixo '1'
      const data = await aiService.askConsultant(guidanceId, userText);
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: data.response, // Lembre-se que o backend retorna { response: "Texto" }
        sender: 'bot'
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: "Desculpe, não consegui analisar os dados agora.",
        sender: 'bot'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col h-[500px]" data-testid="chat-window">
          {/* Header */}
          <div className="bg-blue-600 p-4 flex justify-between items-center text-white shadow-md">
            <div className="flex items-center gap-2">
              <Bot size={20} />
              <div>
                <span className="font-bold text-sm block">Assistente PGO</span>
                <span className="text-[10px] opacity-90 block">Conectado ao Projeto</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-blue-700 p-1 rounded transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm shadow-sm ${
                  msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none'
                  }`}>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}
            {/* Loading Indicator */}
            {isLoading && (
               <div className="flex justify-start">
                 <div className="bg-white px-4 py-2 rounded-2xl text-xs border border-gray-100 flex items-center gap-2 text-gray-500">
                   <Loader2 className="animate-spin" size={12} /> Consultando banco de dados...
                 </div>
               </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {messages.length < 3 && (
            <div className="px-4 pb-2 flex gap-2 overflow-x-auto bg-gray-50">
              {suggestions.map(sug => (
                <button
                  key={sug}
                  onClick={() => setInputText(sug)}
                  className="whitespace-nowrap text-xs bg-white text-blue-600 px-3 py-1 rounded-full border border-blue-100 hover:bg-blue-50 transition-colors shadow-sm"
                >
                  {sug}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-gray-100">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Pergunte sobre tarefas ou arquivos..."
                className="flex-1 bg-gray-100 border-0 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                onKeyDown={handleKeyPress}
                disabled={isLoading}
              />
              <button onClick={handleSend} disabled={isLoading || !inputText.trim()} className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-2xl transition-transform hover:scale-110 flex items-center justify-center"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={28} />}
      </button>
    </div>
  );
}