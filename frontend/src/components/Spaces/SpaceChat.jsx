import React, { useState } from 'react';

const SpaceChat = ({ space }) => {
  const [messages, setMessages] = useState([
    { id: 1, user: 'Alice', text: 'Hello everyone!' },
    { id: 2, user: 'Bob', text: 'Hey there!' },
  ]);
  const [input, setInput] = useState('');

  const sendMessage = (e) => {
    e.preventDefault();
    if (input.trim()) {
      setMessages([...messages, { id: Date.now(), user: 'You', text: input.trim() }]);
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-96">
      <div className="flex-1 overflow-y-auto space-y-2 mb-4">
        {messages.map((msg) => (
          <div key={msg.id} className="p-3 bg-white/5 rounded-xl">
            <span className="text-[#f97316] font-semibold">{msg.user}</span>
            <span className="text-white ml-2">{msg.text}</span>
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#f97316] transition-all"
        />
        <button type="submit" className="btn-orange px-4 py-2">
          Send
        </button>
      </form>
    </div>
  );
};

export default SpaceChat;