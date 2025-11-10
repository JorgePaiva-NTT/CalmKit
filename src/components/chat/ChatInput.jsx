import React, { useState } from 'react';

const ChatInput = ({ onSendMessage, disabled }) => {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSendClick = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !disabled) {
      handleSendClick();
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Type your message..."
        value={inputValue}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        disabled={disabled}
      />
      <button onClick={handleSendClick} disabled={disabled}>
        Send
      </button>
    </div>
  );
};

export default ChatInput;
