import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Loader2 } from 'lucide-react';
import { sendMessageToAI } from '../services/api';
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}



export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Olá! Sou o assistente PGO. Como posso ajudar no seu TCC hoje?', sender: 'bot' }
  ]);
  const [inputText, setInputText] = useState('');

  const suggestions = [
    "Como formatar citação?",
    "Estou atrasado, o que faço?",
    "Ideias para tema"
  ];
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userText = inputText;
    setInputText(''); // Limpa input

    // Adiciona msg do usuário
    const newMsgUser: Message = { id: Date.now().toString(), text: userText, sender: 'user' };
    setMessages(prev => [...prev, newMsgUser]);

    setIsLoading(true);

    // Chama API
    const aiResponseText = await sendMessageToAI(userText);

    setIsLoading(false);

    // Adiciona resposta da IA
    setMessages(prev => [...prev, {
      id: (Date.now() + 1).toString(),
      text: aiResponseText,
      sender: 'bot'
    }]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">

      {isOpen && (
        <div className="mb-4 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col h-[500px]" data-testid="chat-window">
          {/* Header */}
          <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <Bot size={20} />
              <span className="font-semibold">Assistente PGO</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-blue-700 p-1 rounded">
              <X size={18} />
            </button>
          </div>


          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                  }`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>


          {messages.length < 3 && (
            <div className="px-4 pb-2 flex gap-2 overflow-x-auto">
              {suggestions.map(sug => (
                <button
                  key={sug}
                  onClick={() => setInputText(sug)}
                  className="whitespace-nowrap text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100 hover:bg-blue-100 transition-colors"
                >
                  {sug}
                </button>
              ))}
            </div>
          )}


          <div className="p-3 bg-white border-t border-gray-100">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Digite sua dúvida..."
                className="flex-1 bg-gray-100 border-0 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                onKeyDown={handleKeyPress}
                disabled={isLoading}
              />
              <button onClick={handleSend} disabled={isLoading} className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors">
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
              </button>
            </div>
          </div>
        </div>
      )}


      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-105"
        data-testid="chat-fab"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
    </div>
  );
}