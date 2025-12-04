import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiChatbotChat, ChatMessage, SuggestedRecipe } from '../api';

interface ChatbotProps {
  onClose?: () => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Xin chào! Tôi là trợ lý AI của BepViet. Tôi có thể giúp bạn tìm kiếm công thức nấu ăn. Bạn muốn tìm món gì hôm nay?',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestedRecipesByMessage, setSuggestedRecipesByMessage] = useState<Record<number, SuggestedRecipe[]>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    
    // Thêm message của user vào conversation
    const newUserMessage: ChatMessage = { role: 'user', content: userMessage };
    setMessages((prev) => [...prev, newUserMessage]);
    setLoading(true);

    try {
      const response = await apiChatbotChat(userMessage, messages);
      
      // Thêm response của AI
      const aiMessage: ChatMessage = { role: 'assistant', content: response.message };
      setMessages((prev) => {
        const newMessages = [...prev, aiMessage];
        // Lưu suggested recipes theo index của message
        if (response.suggestedRecipes && response.suggestedRecipes.length > 0) {
          setSuggestedRecipesByMessage((prevRecipes) => ({
            ...prevRecipes,
            [newMessages.length - 1]: response.suggestedRecipes,
          }));
        }
        return newMessages;
      });
    } catch (err: any) {
      console.error(err);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Xin lỗi, tôi gặp lỗi khi xử lý câu hỏi của bạn. Vui lòng thử lại sau.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    return difficulty === 'easy' ? 'Dễ' : difficulty === 'medium' ? 'Trung bình' : 'Khó';
  };

  const getDifficultyBadge = (difficulty: string) => {
    return (
      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
        difficulty === 'easy'
          ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
          : difficulty === 'medium'
          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
          : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
      }`}>
        {getDifficultyLabel(difficulty)}
      </span>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-card-dark">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border-light dark:border-border-dark">
        <div className="flex items-center gap-3">
          <img
            src="https://global-web-assets.cpcdn.com/assets/logo_circle-d106f02123de882fffdd2c06593eb2fd33f0ddf20418dd75ed72225bdb0e0ff7.png"
            alt="BepViet Logo"
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <h3 className="font-bold text-text-light dark:text-text-dark">Trợ lý AI BepViet</h3>
            <p className="text-xs text-text-muted-light dark:text-text-muted-dark">Sẵn sàng giúp bạn tìm công thức</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-text-muted-light dark:text-text-muted-dark"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => {
          const suggestedRecipes = suggestedRecipesByMessage[index] || [];
          return (
            <div key={index}>
              <div
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    msg.role === 'user'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-text-light dark:text-text-dark'
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                </div>
              </div>
              
              {/* Suggested Recipes - hiển thị ngay sau message của AI */}
              {msg.role === 'assistant' && suggestedRecipes.length > 0 && (
                <div className="mt-3 ml-0">
                  <p className="text-sm font-medium text-text-light dark:text-text-dark mb-2">
                    📋 Công thức đề xuất (click để xem chi tiết):
                  </p>
                  <div className="space-y-2">
                    {suggestedRecipes.map((recipe) => (
                      <Link
                        key={recipe.id}
                        to={`/recipe/${recipe.slug || recipe.id}`}
                        className="block p-3 rounded-lg border-2 border-primary/30 dark:border-primary/50 bg-primary/5 dark:bg-primary/10 hover:bg-primary/10 dark:hover:bg-primary/20 hover:border-primary/50 dark:hover:border-primary/70 transition-all"
                        onClick={onClose}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-primary dark:text-primary-light">{recipe.title}</h4>
                      <div className="flex items-center gap-3 mt-1 text-xs text-text-muted-light dark:text-text-muted-dark">
                        <span className="px-2 py-0.5 rounded bg-white/50 dark:bg-gray-800/50">{recipe.category}</span>
                        <span>•</span>
                        {getDifficultyBadge(recipe.difficulty)}
                        <span>•</span>
                        <span>⏱️ {recipe.cookingTimeMinutes} phút</span>
                      </div>
                          </div>
                          <span className="material-symbols-outlined text-primary dark:text-primary-light">
                            arrow_forward
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border-light dark:border-border-dark">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Nhập câu hỏi của bạn..."
            disabled={loading}
            className="flex-1 px-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-card-dark text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-60"
          />
          <button
            onClick={handleSend}
            disabled={loading || !inputMessage.trim()}
            className="px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <span className="material-symbols-outlined">send</span>
          </button>
        </div>
        <p className="mt-2 text-xs text-text-muted-light dark:text-text-muted-dark">
          Ví dụ: "Tìm món ăn miền Bắc", "Công thức nấu phở", "Món gì dễ nấu trong 30 phút?"
        </p>
      </div>
    </div>
  );
};

export default Chatbot;

