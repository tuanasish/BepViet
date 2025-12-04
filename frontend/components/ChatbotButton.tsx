import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Chatbot from './Chatbot';

const ChatbotButton: React.FC = () => {
  const location = useLocation();
  const [showChatbot, setShowChatbot] = useState(false);

  // Ẩn chatbot trên các trang admin
  const isAdminPage = location.pathname.startsWith('/admin');
  if (isAdminPage) {
    return null;
  }

  return (
    <>
      {/* Chatbot Floating Button */}
      {!showChatbot && (
        <button
          onClick={() => setShowChatbot(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-white dark:bg-card-dark shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center z-50 border-2 border-primary"
          title="Trợ lý AI"
        >
          <img
            src="https://global-web-assets.cpcdn.com/assets/logo_circle-d106f02123de882fffdd2c06593eb2fd33f0ddf20418dd75ed72225bdb0e0ff7.png"
            alt="Chatbot"
            className="w-full h-full rounded-full object-cover"
          />
        </button>
      )}

      {/* Chatbot Modal - Hiển thị ở góc dưới bên phải */}
      {showChatbot && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-4 pb-20 bg-black/50" onClick={() => setShowChatbot(false)}>
          <div className="w-full max-w-md h-[600px] max-h-[calc(100vh-6rem)] rounded-t-xl overflow-hidden shadow-2xl bg-white dark:bg-card-dark border border-border-light dark:border-border-dark" onClick={(e) => e.stopPropagation()}>
            <Chatbot onClose={() => setShowChatbot(false)} />
          </div>
        </div>
      )}
    </>
  );
};

export default ChatbotButton;

