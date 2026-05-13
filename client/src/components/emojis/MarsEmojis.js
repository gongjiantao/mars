import React from 'react';

// 火星主题表情包组件
const MarsEmojis = {
  // 开心表情 - 火星人笑脸
  happy: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="#FF6B35" stroke="#D4380D" strokeWidth="2"/>
      <circle cx="8.5" cy="9.5" r="1.5" fill="#000"/>
      <circle cx="15.5" cy="9.5" r="1.5" fill="#000"/>
      <path d="M7 14.5C7 14.5 9.5 17 12 17C14.5 17 17 14.5 17 14.5" stroke="#000" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // 难过表情 - 火星人哭脸
  sad: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="#FF6B35" stroke="#D4380D" strokeWidth="2"/>
      <circle cx="8.5" cy="9.5" r="1.5" fill="#000"/>
      <circle cx="15.5" cy="9.5" r="1.5" fill="#000"/>
      <path d="M17 16.5C17 16.5 14.5 14 12 14C9.5 14 7 16.5 7 16.5" stroke="#000" strokeWidth="2" strokeLinecap="round"/>
      <path d="M8 8L8 6" stroke="#1890FF" strokeWidth="2" strokeLinecap="round"/>
      <path d="M16 8L16 6" stroke="#1890FF" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // 惊讶表情 - 火星人惊讶
  surprised: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="#FF6B35" stroke="#D4380D" strokeWidth="2"/>
      <circle cx="8.5" cy="9.5" r="2" fill="#000"/>
      <circle cx="15.5" cy="9.5" r="2" fill="#000"/>
      <ellipse cx="12" cy="15" rx="2" ry="3" fill="#000"/>
      <path d="M6 4L8 6" stroke="#FFE58F" strokeWidth="2" strokeLinecap="round"/>
      <path d="M18 4L16 6" stroke="#FFE58F" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // 愤怒表情 - 火星人生气
  angry: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="#FF4D4F" stroke="#A8071A" strokeWidth="2"/>
      <circle cx="8.5" cy="9.5" r="1.5" fill="#000"/>
      <circle cx="15.5" cy="9.5" r="1.5" fill="#000"/>
      <path d="M8 15L16 15" stroke="#000" strokeWidth="3" strokeLinecap="round"/>
      <path d="M6 7L9 9" stroke="#000" strokeWidth="2" strokeLinecap="round"/>
      <path d="M18 7L15 9" stroke="#000" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // 爱心表情 - 火星人恋爱
  love: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="#FF6B35" stroke="#D4380D" strokeWidth="2"/>
      <path d="M8 9C8 9 8 8 9 8C10 8 10 9 10 9C10 9 10 8 11 8C12 8 12 9 12 9" fill="#FF1744"/>
      <path d="M14 9C14 9 14 8 15 8C16 8 16 9 16 9C16 9 16 8 17 8C18 8 18 9 18 9" fill="#FF1744"/>
      <path d="M7 14.5C7 14.5 9.5 17 12 17C14.5 17 17 14.5 17 14.5" stroke="#000" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // 思考表情 - 火星人思考
  thinking: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="#FF6B35" stroke="#D4380D" strokeWidth="2"/>
      <circle cx="8.5" cy="9.5" r="1.5" fill="#000"/>
      <circle cx="15.5" cy="9.5" r="1.5" fill="#000"/>
      <path d="M9 15L15 15" stroke="#000" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="16" cy="4" r="1" fill="#FFE58F"/>
      <circle cx="18" cy="6" r="0.5" fill="#FFE58F"/>
      <circle cx="19" cy="8" r="0.3" fill="#FFE58F"/>
    </svg>
  ),

  // 酷表情 - 火星人戴墨镜
  cool: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="#FF6B35" stroke="#D4380D" strokeWidth="2"/>
      <rect x="6" y="8" width="4" height="3" rx="1.5" fill="#000"/>
      <rect x="14" y="8" width="4" height="3" rx="1.5" fill="#000"/>
      <rect x="10" y="9" width="4" height="1" fill="#000"/>
      <path d="M8 15C8 15 10 16 12 16C14 16 16 15 16 15" stroke="#000" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // 困惑表情 - 火星人困惑
  confused: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="#FF6B35" stroke="#D4380D" strokeWidth="2"/>
      <circle cx="8.5" cy="9.5" r="1.5" fill="#000"/>
      <circle cx="15.5" cy="9.5" r="1.5" fill="#000"/>
      <path d="M9 15C9 15 10 14 11 15C12 16 13 14 14 15C15 16 16 15 16 15" stroke="#000" strokeWidth="2" strokeLinecap="round"/>
      <path d="M12 4C12 4 11 3 12 2C13 3 12 4 12 4" stroke="#FFE58F" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  ),

  // 睡觉表情 - 火星人睡觉
  sleeping: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="#FF6B35" stroke="#D4380D" strokeWidth="2"/>
      <path d="M7 9.5C7 9.5 8.5 8.5 10 9.5" stroke="#000" strokeWidth="2" strokeLinecap="round"/>
      <path d="M14 9.5C14 9.5 15.5 8.5 17 9.5" stroke="#000" strokeWidth="2" strokeLinecap="round"/>
      <ellipse cx="12" cy="15" rx="3" ry="1" fill="#000"/>
      <text x="16" y="6" fontSize="8" fill="#1890FF">Z</text>
      <text x="18" y="4" fontSize="6" fill="#1890FF">Z</text>
      <text x="19" y="2" fontSize="4" fill="#1890FF">Z</text>
    </svg>
  ),

  // 眨眼表情 - 火星人眨眼
  winking: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="#FF6B35" stroke="#D4380D" strokeWidth="2"/>
      <path d="M7 9.5C7 9.5 8.5 8.5 10 9.5" stroke="#000" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="15.5" cy="9.5" r="1.5" fill="#000"/>
      <path d="M7 14.5C7 14.5 9.5 17 12 17C14.5 17 17 14.5 17 14.5" stroke="#000" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // 大笑表情 - 火星人大笑
  laughing: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="#FF6B35" stroke="#D4380D" strokeWidth="2"/>
      <path d="M7 9.5C7 9.5 8.5 8.5 10 9.5" stroke="#000" strokeWidth="2" strokeLinecap="round"/>
      <path d="M14 9.5C14 9.5 15.5 8.5 17 9.5" stroke="#000" strokeWidth="2" strokeLinecap="round"/>
      <path d="M6 13C6 13 8 18 12 18C16 18 18 13 18 13" stroke="#000" strokeWidth="2" strokeLinecap="round"/>
      <rect x="9" y="14" width="6" height="2" fill="#000" rx="1"/>
    </svg>
  ),

  // 害羞表情 - 火星人害羞
  shy: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="shyGradient" cx="0.3" cy="0.3" r="0.8">
          <stop offset="0%" stopColor="#FFB3BA"/>
          <stop offset="100%" stopColor="#FF6B35"/>
        </radialGradient>
      </defs>
      <circle cx="12" cy="12" r="10" fill="url(#shyGradient)" stroke="#D4380D" strokeWidth="1.5"/>
      <circle cx="8.5" cy="9.5" r="1.8" fill="#2C1810"/>
      <circle cx="15.5" cy="9.5" r="1.8" fill="#2C1810"/>
      <circle cx="8.8" cy="9.2" r="0.5" fill="#FFF" opacity="0.8"/>
      <circle cx="15.8" cy="9.2" r="0.5" fill="#FFF" opacity="0.8"/>
      <ellipse cx="12" cy="15.5" rx="2" ry="1.5" fill="#2C1810"/>
      <circle cx="6" cy="11" r="2.5" fill="#FF85C0" opacity="0.7"/>
      <circle cx="18" cy="11" r="2.5" fill="#FF85C0" opacity="0.7"/>
    </svg>
  ),

  devil: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="devilGradient" cx="0.3" cy="0.3" r="0.8">
          <stop offset="0%" stopColor="#FF6B6B"/>
          <stop offset="100%" stopColor="#CF1322"/>
        </radialGradient>
      </defs>
      <circle cx="12" cy="12" r="10" fill="url(#devilGradient)" stroke="#A8071A" strokeWidth="1.5"/>
      <circle cx="8.5" cy="9.5" r="1.8" fill="#2C1810"/>
      <circle cx="15.5" cy="9.5" r="1.8" fill="#2C1810"/>
      <circle cx="8.8" cy="9.2" r="0.5" fill="#FF4D4F"/>
      <circle cx="15.8" cy="9.2" r="0.5" fill="#FF4D4F"/>
      <path d="M8 15C8 15 10 17 12 17C14 17 16 15 16 15" stroke="#2C1810" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M8 4L10 2L9 6Z" fill="#8B0000"/>
      <path d="M16 4L14 2L15 6Z" fill="#8B0000"/>
      <path d="M11 6L13 6" stroke="#8B0000" strokeWidth="1"/>
    </svg>
  ),

  angel: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="angelGradient" cx="0.3" cy="0.3" r="0.8">
          <stop offset="0%" stopColor="#FFF7E6"/>
          <stop offset="100%" stopColor="#FFD666"/>
        </radialGradient>
      </defs>
      <circle cx="12" cy="12" r="10" fill="url(#angelGradient)" stroke="#FAAD14" strokeWidth="1.5"/>
      <circle cx="8.5" cy="9.5" r="1.8" fill="#2C1810"/>
      <circle cx="15.5" cy="9.5" r="1.8" fill="#2C1810"/>
      <circle cx="8.8" cy="9.2" r="0.5" fill="#FFF" opacity="0.8"/>
      <circle cx="15.8" cy="9.2" r="0.5" fill="#FFF" opacity="0.8"/>
      <path d="M7 14.5C7 14.5 9.5 17 12 17C14.5 17 17 14.5 17 14.5" stroke="#2C1810" strokeWidth="2.5" strokeLinecap="round"/>
      <ellipse cx="12" cy="3" rx="6" ry="2" fill="#FFD700" opacity="0.8"/>
      <ellipse cx="12" cy="2.5" rx="5" ry="1.5" fill="#FFF" opacity="0.6"/>
    </svg>
  ),

  crying: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="cryingGradient" cx="0.3" cy="0.3" r="0.8">
          <stop offset="0%" stopColor="#FF7A40"/>
          <stop offset="100%" stopColor="#D4380D"/>
        </radialGradient>
      </defs>
      <circle cx="12" cy="12" r="10" fill="url(#cryingGradient)" stroke="#B7410E" strokeWidth="1.5"/>
      <circle cx="8.5" cy="9.5" r="1.8" fill="#2C1810"/>
      <circle cx="15.5" cy="9.5" r="1.8" fill="#2C1810"/>
      <circle cx="8.8" cy="9.2" r="0.5" fill="#FFF" opacity="0.8"/>
      <circle cx="15.8" cy="9.2" r="0.5" fill="#FFF" opacity="0.8"/>
      <path d="M17 17C17 17 14.5 15 12 15C9.5 15 7 17 7 17" stroke="#2C1810" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M7 8L7 12" stroke="#4096FF" strokeWidth="3.5" strokeLinecap="round" opacity="0.8"/>
      <path d="M17 8L17 12" stroke="#4096FF" strokeWidth="3.5" strokeLinecap="round" opacity="0.8"/>
      <path d="M5 10L5 14" stroke="#4096FF" strokeWidth="2.5" strokeLinecap="round" opacity="0.6"/>
      <path d="M19 10L19 14" stroke="#4096FF" strokeWidth="2.5" strokeLinecap="round" opacity="0.6"/>
      <circle cx="7" cy="13" r="1" fill="#4096FF" opacity="0.6"/>
      <circle cx="17" cy="13" r="1" fill="#4096FF" opacity="0.6"/>
    </svg>
  ),

  crazy: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="crazyGradient" cx="0.3" cy="0.3" r="0.8">
          <stop offset="0%" stopColor="#FF8A50"/>
          <stop offset="100%" stopColor="#E8440D"/>
        </radialGradient>
      </defs>
      <circle cx="12" cy="12" r="10" fill="url(#crazyGradient)" stroke="#B7410E" strokeWidth="1.5"/>
      <circle cx="7" cy="8" r="2" fill="#2C1810"/>
      <circle cx="17" cy="11" r="2" fill="#2C1810"/>
      <circle cx="7.3" cy="7.7" r="0.6" fill="#FFF" opacity="0.8"/>
      <circle cx="17.3" cy="10.7" r="0.6" fill="#FFF" opacity="0.8"/>
      <path d="M6 15C6 15 8 18.5 10 16.5C12 14.5 14 18.5 16 16.5C18 14.5 18 15 18 15" stroke="#2C1810" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M10 2L12 4L14 2" stroke="#FFE58F" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M8 1L10 3" stroke="#FFE58F" strokeWidth="2" strokeLinecap="round"/>
      <path d="M16 1L14 3" stroke="#FFE58F" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  starry: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="starryGradient" cx="0.3" cy="0.3" r="0.8">
          <stop offset="0%" stopColor="#FF8A50"/>
          <stop offset="100%" stopColor="#E8440D"/>
        </radialGradient>
      </defs>
      <circle cx="12" cy="12" r="10" fill="url(#starryGradient)" stroke="#B7410E" strokeWidth="1.5"/>
      <path d="M8.5 9.5L9.5 7.5L10.5 9.5L12 9L10.5 10.5L9.5 12L8.5 10.5L7 9L8.5 9.5Z" fill="#FFD700" stroke="#FA8C16" strokeWidth="0.5"/>
      <path d="M15.5 9.5L16.5 7.5L17.5 9.5L19 9L17.5 10.5L16.5 12L15.5 10.5L14 9L15.5 9.5Z" fill="#FFD700" stroke="#FA8C16" strokeWidth="0.5"/>
      <path d="M7 14.5C7 14.5 9.5 17.5 12 17.5C14.5 17.5 17 14.5 17 14.5" stroke="#2C1810" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M8.5 15.5C8.5 15.5 10 16.5 12 16.5C14 16.5 15.5 15.5 15.5 15.5" stroke="#FF4D4F" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),

  rocket: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="rocketGradient" cx="0.3" cy="0.3" r="0.8">
          <stop offset="0%" stopColor="#FF8A50"/>
          <stop offset="100%" stopColor="#E8440D"/>
        </radialGradient>
      </defs>
      <circle cx="12" cy="12" r="10" fill="url(#rocketGradient)" stroke="#B7410E" strokeWidth="1.5"/>
      <circle cx="8.5" cy="9.5" r="1.8" fill="#2C1810"/>
      <circle cx="15.5" cy="9.5" r="1.8" fill="#2C1810"/>
      <circle cx="8.8" cy="9.2" r="0.5" fill="#FFF" opacity="0.8"/>
      <circle cx="15.8" cy="9.2" r="0.5" fill="#FFF" opacity="0.8"/>
      <ellipse cx="12" cy="15.5" rx="2.5" ry="1.5" fill="#2C1810"/>
      <path d="M12 1L14.5 5L12 7L9.5 5L12 1Z" fill="#FFE58F" stroke="#FFC53D" strokeWidth="1"/>
      <path d="M11 3L13 3" stroke="#FF6B35" strokeWidth="1.5"/>
      <circle cx="12" cy="4" r="0.8" fill="#FF4D4F"/>
      <path d="M8 6L10 8" stroke="#FFD666" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M16 6L14 8" stroke="#FFD666" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),

  alien: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="alienGradient" cx="0.3" cy="0.3" r="0.8">
          <stop offset="0%" stopColor="#73D13D"/>
          <stop offset="100%" stopColor="#389E0D"/>
        </radialGradient>
      </defs>
      <ellipse cx="12" cy="13" rx="10" ry="9" fill="url(#alienGradient)" stroke="#237804" strokeWidth="1.5"/>
      <ellipse cx="9" cy="8" rx="2.5" ry="3.5" fill="#2C1810"/>
      <ellipse cx="15" cy="8" rx="2.5" ry="3.5" fill="#2C1810"/>
      <ellipse cx="12" cy="16.5" rx="2" ry="1" fill="#2C1810"/>
      <ellipse cx="12" cy="4" rx="4" ry="2.5" fill="url(#alienGradient)" stroke="#237804" strokeWidth="1"/>
      <circle cx="8" cy="6.5" r="0.8" fill="#FFF" opacity="0.9"/>
      <circle cx="16" cy="6.5" r="0.8" fill="#FFF" opacity="0.9"/>
      <circle cx="9.2" cy="7.5" r="0.5" fill="#73D13D"/>
      <circle cx="14.8" cy="7.5" r="0.5" fill="#73D13D"/>
    </svg>
  ),

  excited: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="excitedGradient" cx="0.3" cy="0.3" r="0.8">
          <stop offset="0%" stopColor="#FFD666"/>
          <stop offset="100" stopColor="#FF6B35"/>
        </radialGradient>
      </defs>
      <circle cx="12" cy="12" r="10" fill="url(#excitedGradient)" stroke="#D4380D" strokeWidth="1.5"/>
      <circle cx="8.5" cy="9.5" r="2.2" fill="#2C1810"/>
      <circle cx="15.5" cy="9.5" r="2.2" fill="#2C1810"/>
      <circle cx="9" cy="9" r="0.8" fill="#FFF" opacity="0.9"/>
      <circle cx="16" cy="9" r="0.8" fill="#FFF" opacity="0.9"/>
      <path d="M6 14C6 14 8 19.5 12 19.5C16 19.5 18 14 18 14" stroke="#2C1810" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M5 5L7 7" stroke="#FFD700" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M19 5L17 7" stroke="#FFD700" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M12 2L12 4" stroke="#FFD700" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M3 12L5 12" stroke="#FFD700" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M21 12L19 12" stroke="#FFD700" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="5" cy="5" r="0.8" fill="#FFD700"/>
      <circle cx="19" cy="5" r="0.8" fill="#FFD700"/>
    </svg>
  ),

  party: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="partyGradient" cx="0.3" cy="0.3" r="0.8">
          <stop offset="0%" stopColor="#FF8A50"/>
          <stop offset="100%" stopColor="#E8440D"/>
        </radialGradient>
      </defs>
      <circle cx="12" cy="12" r="10" fill="url(#partyGradient)" stroke="#B7410E" strokeWidth="1.5"/>
      <circle cx="8.5" cy="9.5" r="1.8" fill="#2C1810"/>
      <circle cx="15.5" cy="9.5" r="1.8" fill="#2C1810"/>
      <circle cx="8.8" cy="9.2" r="0.5" fill="#FFF" opacity="0.8"/>
      <circle cx="15.8" cy="9.2" r="0.5" fill="#FFF" opacity="0.8"/>
      <path d="M7 14.5C7 14.5 9.5 17.5 12 17.5C14.5 17.5 17 14.5 17 14.5" stroke="#2C1810" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M8 3L10 1L12 3L14 1L16 3" stroke="#FF1744" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <circle cx="6" cy="5" r="1.2" fill="#FFD700"/>
      <circle cx="18" cy="5" r="1.2" fill="#1890FF"/>
      <circle cx="4" cy="9" r="0.8" fill="#52C41A"/>
      <circle cx="20" cy="9" r="0.8" fill="#FF1744"/>
      <circle cx="3" cy="15" r="0.6" fill="#FF85C0"/>
      <circle cx="21" cy="15" r="0.6" fill="#FFD666"/>
    </svg>
  ),

  funny: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="funnyGradient" cx="0.3" cy="0.3" r="0.8">
          <stop offset="0%" stopColor="#FF8A50"/>
          <stop offset="100%" stopColor="#E8440D"/>
        </radialGradient>
      </defs>
      <circle cx="12" cy="12" r="10" fill="url(#funnyGradient)" stroke="#B7410E" strokeWidth="1.5"/>
      <circle cx="8.5" cy="9.5" r="1.8" fill="#2C1810"/>
      <circle cx="15.5" cy="9.5" r="1.8" fill="#2C1810"/>
      <circle cx="8.8" cy="9.2" r="0.5" fill="#FFF" opacity="0.8"/>
      <circle cx="15.8" cy="9.2" r="0.5" fill="#FFF" opacity="0.8"/>
      <path d="M8 14C8 14 9 16.5 10 15.5C11 14.5 11 16.5 12 15.5C13 14.5 13 16.5 14 15.5C15 14.5 16 16.5 16 14" stroke="#2C1810" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M10 5L11 6L12 5L13 6L14 5" stroke="#2C1810" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    </svg>
  ),

  smug: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="smugGradient" cx="0.3" cy="0.3" r="0.8">
          <stop offset="0%" stopColor="#FF8A50"/>
          <stop offset="100%" stopColor="#E8440D"/>
        </radialGradient>
      </defs>
      <circle cx="12" cy="12" r="10" fill="url(#smugGradient)" stroke="#B7410E" strokeWidth="1.5"/>
      <path d="M7 9.5C7 9.5 8.5 8.5 10 9.5" stroke="#2C1810" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M14 9.5C14 9.5 15.5 8.5 17 9.5" stroke="#2C1810" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M8 14C8 14 10 15.8 12 15.8C14 15.8 16 14 16 14" stroke="#2C1810" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  ),

  mischievous: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="mischievousGradient" cx="0.3" cy="0.3" r="0.8">
          <stop offset="0%" stopColor="#FF8A50"/>
          <stop offset="100%" stopColor="#E8440D"/>
        </radialGradient>
      </defs>
      <circle cx="12" cy="12" r="10" fill="url(#mischievousGradient)" stroke="#B7410E" strokeWidth="1.5"/>
      <circle cx="8.5" cy="9.5" r="1.8" fill="#2C1810"/>
      <path d="M14 9.5C14 9.5 15.5 8.5 17 9.5" stroke="#2C1810" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="8.8" cy="9.2" r="0.5" fill="#FFF" opacity="0.8"/>
      <path d="M8 14C8 14 10 16.5 12 16.5C14 16.5 16 14 16 14" stroke="#2C1810" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M9 6L10 7" stroke="#2C1810" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),

  rofl: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="roflGradient" cx="0.3" cy="0.3" r="0.8">
          <stop offset="0%" stopColor="#FFD666"/>
          <stop offset="100%" stopColor="#FF6B35"/>
        </radialGradient>
      </defs>
      <circle cx="12" cy="12" r="10" fill="url(#roflGradient)" stroke="#D4380D" strokeWidth="1.5"/>
      <path d="M6 7C6 7 7.5 6 9 8" stroke="#2C1810" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M15 7C15 7 16.5 6 18 8" stroke="#2C1810" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M5 12C5 12 7 20 12 20C17 20 19 12 19 12" stroke="#2C1810" strokeWidth="2.5" strokeLinecap="round"/>
      <rect x="8" y="13" width="8" height="3" fill="#2C1810" rx="1.5"/>
      <rect x="8.5" y="14" width="7" height="2.5" fill="#FF4D4F" rx="1.25"/>
      <path d="M6 9L6 11" stroke="#4096FF" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M18 9L18 11" stroke="#4096FF" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  ),

  ecstatic: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="ecstaticGradient" cx="0.3" cy="0.3" r="0.8">
          <stop offset="0%" stopColor="#FFD666"/>
          <stop offset="100%" stopColor="#FF6B35"/>
        </radialGradient>
      </defs>
      <circle cx="12" cy="12" r="10" fill="url(#ecstaticGradient)" stroke="#D4380D" strokeWidth="1.5"/>
      <path d="M8.5 9.5L9.5 7.5L10.5 9.5L12 9L10.5 10.5L9.5 12L8.5 10.5L7 9L8.5 9.5Z" fill="#FFD700" stroke="#FA8C16" strokeWidth="0.5"/>
      <path d="M15.5 9.5L16.5 7.5L17.5 9.5L19 9L17.5 10.5L16.5 12L15.5 10.5L14 9L15.5 9.5Z" fill="#FFD700" stroke="#FA8C16" strokeWidth="0.5"/>
      <path d="M5 13C5 13 7 19.5 12 19.5C17 19.5 19 13 19 13" stroke="#2C1810" strokeWidth="2.5" strokeLinecap="round"/>
      <rect x="8" y="14" width="8" height="2" fill="#2C1810" rx="1"/>
      <rect x="8.5" y="15" width="7" height="1.5" fill="#FF4D4F" rx="0.75"/>
      <circle cx="4" cy="7" r="1.2" fill="#FFD700"/>
      <circle cx="20" cy="7" r="1.2" fill="#FFD700"/>
      <circle cx="6" cy="3" r="0.8" fill="#FF1744"/>
      <circle cx="18" cy="3" r="0.8" fill="#FF1744"/>
      <circle cx="2" cy="12" r="0.6" fill="#52C41A"/>
      <circle cx="22" cy="12" r="0.6" fill="#52C41A"/>
    </svg>
  ),

  // 新增的火星表情
  explorer: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="explorerGrad" cx="0.3" cy="0.3" r="0.7">
          <stop offset="0%" stopColor="#ff8c42"/>
          <stop offset="100%" stopColor="#ff6b35"/>
        </radialGradient>
      </defs>
      <circle cx="12" cy="12" r="10" fill="url(#explorerGrad)" stroke="#D4380D" strokeWidth="1.5"/>
      <circle cx="9" cy="9" r="1.5" fill="#2c1810"/>
      <circle cx="15" cy="9" r="1.5" fill="#2c1810"/>
      <path d="M8 15 Q12 18 16 15" stroke="#2c1810" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <rect x="10" y="6" width="4" height="2" rx="1" fill="#8b4513"/>
      <circle cx="12" cy="5" r="1" fill="#ffd700"/>
    </svg>
  ),

  scientist: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="scientistGrad" cx="0.3" cy="0.3" r="0.7">
          <stop offset="0%" stopColor="#ff8c42"/>
          <stop offset="100%" stopColor="#ff6b35"/>
        </radialGradient>
      </defs>
      <circle cx="12" cy="12" r="10" fill="url(#scientistGrad)" stroke="#D4380D" strokeWidth="1.5"/>
      <circle cx="9" cy="9" r="1.5" fill="#2c1810"/>
      <circle cx="15" cy="9" r="1.5" fill="#2c1810"/>
      <path d="M8 15 Q12 17 16 15" stroke="#2c1810" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <rect x="7" y="7" width="10" height="3" rx="1.5" fill="none" stroke="#333" strokeWidth="1"/>
      <circle cx="12" cy="6" r="0.5" fill="#00ff00"/>
    </svg>
  ),

  musician: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="musicianGrad" cx="0.3" cy="0.3" r="0.7">
          <stop offset="0%" stopColor="#ff8c42"/>
          <stop offset="100%" stopColor="#ff6b35"/>
        </radialGradient>
      </defs>
      <circle cx="12" cy="12" r="10" fill="url(#musicianGrad)" stroke="#D4380D" strokeWidth="1.5"/>
      <circle cx="9" cy="9" r="1.5" fill="#2c1810"/>
      <circle cx="15" cy="9" r="1.5" fill="#2c1810"/>
      <ellipse cx="12" cy="15" rx="3" ry="2" fill="#2c1810"/>
      <path d="M16 8 Q18 6 20 8" stroke="#ff1493" strokeWidth="2" fill="none"/>
      <circle cx="19" cy="7" r="1" fill="#ff1493"/>
    </svg>
  )
};

// 表情名称映射 - 更新版本
export const emojiNames = {
  happy: '开心',
  sad: '难过',
  surprised: '惊讶',
  angry: '愤怒',
  love: '爱心',
  thinking: '思考',
  cool: '酷',
  confused: '困惑',
  sleeping: '睡觉',
  winking: '眨眼',
  laughing: '大笑',
  shy: '害羞',
  devil: '恶魔',
  angel: '天使',
  crying: '哭泣',
  crazy: '疯狂',
  starry: '星星眼',
  rocket: '火箭',
  alien: '外星人',
  excited: '兴奋',
  party: '狂欢',
  funny: '滑稽',
  smug: '得意',
  mischievous: '调皮',
  rofl: '开怀大笑',
  ecstatic: '超级开心',
  explorer: '探险家',
  scientist: '科学家',
  musician: '音乐家',
  chef: '厨师',
  pilot: '飞行员',
  artist: '艺术家',
  gamer: '游戏玩家',
  superhero: '超级英雄',
  ninja: '忍者'
};

// 获取所有表情键名
export const getEmojiKeys = () => Object.keys(MarsEmojis);

// 根据键名获取表情组件
export const getEmojiComponent = (key) => MarsEmojis[key];

// 获取表情分类
export const getEmojiCategories = () => ({
  emotions: ['happy', 'sad', 'surprised', 'angry', 'love', 'thinking', 'confused', 'shy', 'excited'],
  expressions: ['cool', 'winking', 'laughing', 'crying', 'crazy', 'starry', 'funny', 'smug', 'mischievous', 'rofl', 'ecstatic'],
  characters: ['devil', 'angel', 'alien', 'explorer', 'scientist', 'musician', 'chef', 'pilot', 'artist', 'gamer', 'superhero', 'ninja'],
  activities: ['sleeping', 'party', 'rocket']
})

export default MarsEmojis;