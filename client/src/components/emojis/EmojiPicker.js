import React, { useState, useEffect, useRef } from 'react';
import MarsEmojis, { getEmojiKeys, getEmojiComponent, getEmojiCategories, emojiNames } from './MarsEmojis';
import './EmojiPicker.css';

// 表情选择器组件
const EmojiPicker = ({ onEmojiSelect, onClose }) => {
  const pickerRef = useRef(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEmojis, setFilteredEmojis] = useState(getEmojiKeys());

  // 处理点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // 处理ESC键关闭
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [onClose]);

  // 过滤表情
  useEffect(() => {
    let emojis = getEmojiKeys();
    const categories = getEmojiCategories();

    // 按分类过滤
    if (activeCategory !== 'all') {
      emojis = categories[activeCategory] || [];
    }

    // 按搜索词过滤
    if (searchTerm) {
      emojis = emojis.filter(emojiKey => {
        const name = emojiNames[emojiKey] || emojiKey;
        return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               emojiKey.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    setFilteredEmojis(emojis);
  }, [activeCategory, searchTerm]);

  const handleEmojiClick = (emojiKey) => {
    onEmojiSelect(emojiKey);
    onClose();
  };

  const categories = [
    { key: 'all', name: '全部', icon: '🌟' },
    { key: 'emotions', name: '情感', icon: '😊' },
    { key: 'expressions', name: '表情', icon: '😄' },
    { key: 'characters', name: '角色', icon: '👨‍🚀' },
    { key: 'activities', name: '活动', icon: '🚀' }
  ];

  return (
    <div className="emoji-picker-overlay">
      <div className="emoji-picker" ref={pickerRef}>
        <div className="emoji-picker-header">
          <h3 className="emoji-picker-title">选择火星表情</h3>
          <button className="emoji-picker-close" onClick={onClose}>
            ×
          </button>
        </div>
        
        {/* 搜索框 */}
        <div className="emoji-search">
          <input
            type="text"
            placeholder="搜索表情..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="emoji-search-input"
          />
        </div>

        {/* 分类标签 */}
        <div className="emoji-categories">
          {categories.map(category => (
            <button
              key={category.key}
              className={`category-btn ${activeCategory === category.key ? 'active' : ''}`}
              onClick={() => setActiveCategory(category.key)}
            >
              <span className="category-icon">{category.icon}</span>
              <span className="category-name">{category.name}</span>
            </button>
          ))}
        </div>

        <div className="emoji-grid">
          {filteredEmojis.length > 0 ? (
            filteredEmojis.map((emojiKey) => {
              const EmojiComponent = getEmojiComponent(emojiKey);
              if (!EmojiComponent || typeof EmojiComponent !== 'function') {
                console.warn(`Invalid emoji component for key: ${emojiKey}`);
                return null;
              }
              
              return (
                <div
                  key={emojiKey}
                  className="emoji-item"
                  onClick={() => handleEmojiClick(emojiKey)}
                  title={`火星${emojiNames[emojiKey] || emojiKey}表情`}
                >
                  <EmojiComponent />
                  <div className="emoji-name">{emojiNames[emojiKey] || emojiKey}</div>
                </div>
              );
            })
          ) : (
            <div className="no-emojis">
              <div className="no-emojis-icon">🔍</div>
              <div className="no-emojis-text">没有找到匹配的表情</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 表情显示组件
const EmojiDisplay = ({ emojiKey, size = 24, className = '' }) => {
  if (!emojiKey || !MarsEmojis[emojiKey]) {
    return null;
  }

  const EmojiComponent = getEmojiComponent(emojiKey);
  
  // 确保组件存在且有效
  if (!EmojiComponent || typeof EmojiComponent !== 'function') {
    console.warn(`Invalid emoji component for key: ${emojiKey}`);
    return null;
  }
  
  return (
    <span 
      className={`emoji-display ${className}`}
      style={{ 
        width: size, 
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      title={`火星${emojiKey}表情`}
    >
      <EmojiComponent style={{ width: size, height: size }} />
    </span>
  );
};

// 表情按钮组件
const EmojiButton = ({ onEmojiSelect, className = '' }) => {
  const [showPicker, setShowPicker] = useState(false);

  const handleEmojiSelect = (emojiKey) => {
    onEmojiSelect(emojiKey);
    setShowPicker(false);
  };

  return (
    <>
      <button
        className={`emoji-button ${className}`}
        onClick={() => setShowPicker(true)}
        type="button"
        title="添加火星表情"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10" fill="#ff6b35" opacity="0.1"/>
          <circle cx="8" cy="10" r="1.5" fill="#ff6b35"/>
          <circle cx="16" cy="10" r="1.5" fill="#ff6b35"/>
          <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="#ff6b35" strokeWidth="2" strokeLinecap="round" fill="none"/>
        </svg>
        表情
      </button>
      {showPicker && (
        <EmojiPicker
          onEmojiSelect={handleEmojiSelect}
          onClose={() => setShowPicker(false)}
        />
      )}
    </>
  );
};

export { EmojiPicker, EmojiDisplay, EmojiButton };