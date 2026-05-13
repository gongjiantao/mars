import React, { useState } from 'react';
import styled, { keyframes, css } from 'styled-components';

// 动画定义
const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
`;

const shake = keyframes`
  0%, 100% {
    transform: translateX(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-2px);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(2px);
  }
`;

const rotate = keyframes`
  0% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(-5deg);
  }
  75% {
    transform: rotate(5deg);
  }
  100% {
    transform: rotate(0deg);
  }
`;

const glow = keyframes`
  0%, 100% {
    filter: drop-shadow(0 0 5px rgba(255, 139, 80, 0.5));
  }
  50% {
    filter: drop-shadow(0 0 15px rgba(255, 139, 80, 0.8));
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-8px);
  }
`;

const sparkle = keyframes`
  0%, 100% {
    opacity: 0;
    transform: scale(0);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
`;

// 动画容器组件
const AnimatedEmojiContainer = styled.div`
  display: inline-block;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    transform: scale(1.2);
  }
  
  ${props => props.animation && css`
    animation: ${props.animation} ${props.duration || '1s'} ${props.timing || 'ease-in-out'} ${props.infinite ? 'infinite' : ''};
  `}
  
  &:active {
    transform: scale(0.95);
  }
`;

// 闪烁效果组件
const SparkleEffect = styled.div`
  position: absolute;
  top: -5px;
  right: -5px;
  width: 8px;
  height: 8px;
  background: #FFD700;
  border-radius: 50%;
  animation: ${sparkle} 2s ease-in-out infinite;
  animation-delay: ${props => props.delay || '0s'};
`;

// 动画火星表情包组件
const AnimatedMarsEmojis = {
  // 开心表情 - 带弹跳动画
  happy: ({ animated = true, onClick }) => {
    const [isClicked, setIsClicked] = useState(false);
    
    const handleClick = () => {
      setIsClicked(true);
      setTimeout(() => setIsClicked(false), 600);
      if (onClick) onClick();
    };
    
    return (
      <AnimatedEmojiContainer 
        animation={animated ? (isClicked ? bounce : pulse) : null}
        duration={isClicked ? '0.6s' : '2s'}
        infinite={!isClicked}
        onClick={handleClick}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="happyGradient" cx="0.3" cy="0.3" r="0.8">
              <stop offset="0%" stopColor="#FF8A50"/>
              <stop offset="100%" stopColor="#E8440D"/>
            </radialGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <circle cx="12" cy="12" r="10" fill="url(#happyGradient)" stroke="#B7410E" strokeWidth="1.5" filter="url(#glow)"/>
          <circle cx="8.5" cy="9.5" r="1.8" fill="#2C1810"/>
          <circle cx="15.5" cy="9.5" r="1.8" fill="#2C1810"/>
          <circle cx="8.8" cy="9.2" r="0.5" fill="#FFF" opacity="0.8"/>
          <circle cx="15.8" cy="9.2" r="0.5" fill="#FFF" opacity="0.8"/>
          <path d="M7 14.5C7 14.5 9.5 17.5 12 17.5C14.5 17.5 17 14.5 17 14.5" stroke="#2C1810" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M8.5 15.5C8.5 15.5 10 16.5 12 16.5C14 16.5 15.5 15.5 15.5 15.5" stroke="#FF4D4F" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        {animated && <SparkleEffect delay="0s" />}
        {animated && <SparkleEffect delay="1s" style={{top: '-3px', left: '-3px'}} />}
      </AnimatedEmojiContainer>
    );
  },

  // 愤怒表情 - 带震动动画
  angry: ({ animated = true, onClick }) => {
    const [isClicked, setIsClicked] = useState(false);
    
    const handleClick = () => {
      setIsClicked(true);
      setTimeout(() => setIsClicked(false), 1000);
      if (onClick) onClick();
    };
    
    return (
      <AnimatedEmojiContainer 
        animation={animated ? (isClicked ? shake : rotate) : null}
        duration={isClicked ? '1s' : '3s'}
        infinite={true}
        onClick={handleClick}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="angryGradient" cx="0.3" cy="0.3" r="0.8">
              <stop offset="0%" stopColor="#FF6B6B"/>
              <stop offset="100%" stopColor="#CF1322"/>
            </radialGradient>
          </defs>
          <circle cx="12" cy="12" r="10" fill="url(#angryGradient)" stroke="#A8071A" strokeWidth="1.5"/>
          <circle cx="8.5" cy="10" r="1.8" fill="#2C1810"/>
          <circle cx="15.5" cy="10" r="1.8" fill="#2C1810"/>
          <circle cx="8.8" cy="9.7" r="0.4" fill="#FF4D4F"/>
          <circle cx="15.8" cy="9.7" r="0.4" fill="#FF4D4F"/>
          <rect x="8" y="14.5" width="8" height="2" fill="#2C1810" rx="1"/>
          <path d="M6 6L9 9" stroke="#2C1810" strokeWidth="3" strokeLinecap="round"/>
          <path d="M18 6L15 9" stroke="#2C1810" strokeWidth="3" strokeLinecap="round"/>
          <path d="M5 4L7 6" stroke="#FF4D4F" strokeWidth="2" strokeLinecap="round"/>
          <path d="M19 4L17 6" stroke="#FF4D4F" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </AnimatedEmojiContainer>
    );
  },

  // 爱心表情 - 带发光动画
  love: ({ animated = true, onClick }) => {
    const [isClicked, setIsClicked] = useState(false);
    
    const handleClick = () => {
      setIsClicked(true);
      setTimeout(() => setIsClicked(false), 2000);
      if (onClick) onClick();
    };
    
    return (
      <AnimatedEmojiContainer 
        animation={animated ? glow : null}
        duration="2s"
        infinite={true}
        onClick={handleClick}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="loveGradient" cx="0.3" cy="0.3" r="0.8">
              <stop offset="0%" stopColor="#FFB3BA"/>
              <stop offset="100%" stopColor="#FF6B35"/>
            </radialGradient>
          </defs>
          <circle cx="12" cy="12" r="10" fill="url(#loveGradient)" stroke="#D4380D" strokeWidth="1.5"/>
          <path d="M7.5 8.5C7.5 7.5 8.5 6.5 9.5 6.5C10.5 6.5 11 7.5 11 8.5C11 7.5 11.5 6.5 12.5 6.5C13.5 6.5 14.5 7.5 14.5 8.5C14.5 9.5 13 11 11 11C9 11 7.5 9.5 7.5 8.5Z" fill="#FF1744"/>
          <path d="M13.5 8.5C13.5 7.5 14.5 6.5 15.5 6.5C16.5 6.5 17 7.5 17 8.5C17 7.5 17.5 6.5 18.5 6.5C19.5 6.5 20.5 7.5 20.5 8.5C20.5 9.5 19 11 17 11C15 11 13.5 9.5 13.5 8.5Z" fill="#FF1744"/>
          <path d="M7 14.5C7 14.5 9.5 17.5 12 17.5C14.5 17.5 17 14.5 17 14.5" stroke="#2C1810" strokeWidth="2.5" strokeLinecap="round"/>
          <circle cx="4" cy="8" r="1" fill="#FF85C0" opacity="0.8"/>
          <circle cx="20" cy="8" r="1" fill="#FF85C0" opacity="0.8"/>
          <circle cx="6" cy="5" r="0.5" fill="#FF85C0" opacity="0.6"/>
          <circle cx="18" cy="5" r="0.5" fill="#FF85C0" opacity="0.6"/>
        </svg>
        {animated && isClicked && (
          <>
            <SparkleEffect delay="0s" style={{background: '#FF1744'}} />
            <SparkleEffect delay="0.5s" style={{top: '20px', right: '20px', background: '#FF85C0'}} />
            <SparkleEffect delay="1s" style={{top: '5px', left: '20px', background: '#FF1744'}} />
          </>
        )}
      </AnimatedEmojiContainer>
    );
  },

  // 兴奋表情 - 带浮动动画
  excited: ({ animated = true, onClick }) => {
    return (
      <AnimatedEmojiContainer 
        animation={animated ? float : null}
        duration="1.5s"
        infinite={true}
        onClick={onClick}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="excitedGradient" cx="0.3" cy="0.3" r="0.8">
              <stop offset="0%" stopColor="#FFD666"/>
              <stop offset="100%" stopColor="#FF6B35"/>
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
        {animated && (
          <>
            <SparkleEffect delay="0s" style={{background: '#FFD700'}} />
            <SparkleEffect delay="0.7s" style={{top: '20px', left: '20px', background: '#FFD700'}} />
            <SparkleEffect delay="1.4s" style={{top: '5px', left: '5px', background: '#FFD700'}} />
          </>
        )}
      </AnimatedEmojiContainer>
    );
  },

  // 思考表情 - 带旋转思考泡泡
  thinking: ({ animated = true, onClick }) => {
    return (
      <AnimatedEmojiContainer onClick={onClick}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="thinkingGradient" cx="0.3" cy="0.3" r="0.8">
              <stop offset="0%" stopColor="#FFD666"/>
              <stop offset="100%" stopColor="#FF6B35"/>
            </radialGradient>
          </defs>
          <circle cx="12" cy="12" r="10" fill="url(#thinkingGradient)" stroke="#D4380D" strokeWidth="1.5"/>
          <circle cx="8.5" cy="9.5" r="1.8" fill="#2C1810"/>
          <circle cx="15.5" cy="9.5" r="1.8" fill="#2C1810"/>
          <circle cx="8.8" cy="9.2" r="0.5" fill="#FFF" opacity="0.8"/>
          <circle cx="15.8" cy="9.2" r="0.5" fill="#FFF" opacity="0.8"/>
          <path d="M9 15L15 15" stroke="#2C1810" strokeWidth="2.5" strokeLinecap="round"/>
          {animated && (
            <g>
              <circle cx="17" cy="4" r="1.5" fill="#FFE58F" opacity="0.9">
                <animate attributeName="opacity" values="0.3;0.9;0.3" dur="2s" repeatCount="indefinite"/>
              </circle>
              <circle cx="19" cy="6" r="1" fill="#FFE58F" opacity="0.7">
                <animate attributeName="opacity" values="0.2;0.7;0.2" dur="2s" repeatCount="indefinite" begin="0.5s"/>
              </circle>
              <circle cx="20" cy="8" r="0.6" fill="#FFE58F" opacity="0.5">
                <animate attributeName="opacity" values="0.1;0.5;0.1" dur="2s" repeatCount="indefinite" begin="1s"/>
              </circle>
              <text x="16.5" y="5" fontSize="6" fill="#FA8C16" fontWeight="bold">
                ?
                <animateTransform attributeName="transform" type="rotate" values="0 16.5 5;10 16.5 5;-10 16.5 5;0 16.5 5" dur="3s" repeatCount="indefinite"/>
              </text>
            </g>
          )}
          {!animated && (
            <g>
              <circle cx="17" cy="4" r="1.5" fill="#FFE58F" opacity="0.9"/>
              <circle cx="19" cy="6" r="1" fill="#FFE58F" opacity="0.7"/>
              <circle cx="20" cy="8" r="0.6" fill="#FFE58F" opacity="0.5"/>
              <text x="16.5" y="5" fontSize="6" fill="#FA8C16" fontWeight="bold">?</text>
            </g>
          )}
        </svg>
      </AnimatedEmojiContainer>
    );
  },

  // 睡觉表情 - 带Z字母动画
  sleeping: ({ animated = true, onClick }) => {
    return (
      <AnimatedEmojiContainer onClick={onClick}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="sleepingGradient" cx="0.3" cy="0.3" r="0.8">
              <stop offset="0%" stopColor="#B3B3FF"/>
              <stop offset="100%" stopColor="#7A7AFF"/>
            </radialGradient>
          </defs>
          <circle cx="12" cy="12" r="10" fill="url(#sleepingGradient)" stroke="#5A5AFF" strokeWidth="1.5"/>
          <path d="M7 9.5C7 9.5 8.5 8.5 10 9.5" stroke="#2C1810" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M14 9.5C14 9.5 15.5 8.5 17 9.5" stroke="#2C1810" strokeWidth="2.5" strokeLinecap="round"/>
          <ellipse cx="12" cy="15.5" rx="3" ry="1.5" fill="#2C1810"/>
          {animated && (
            <g>
              <text x="16" y="7" fontSize="10" fill="#4096FF" opacity="0.8">
                Z
                <animate attributeName="opacity" values="0;0.8;0" dur="3s" repeatCount="indefinite"/>
                <animateTransform attributeName="transform" type="translate" values="0 0;2 -2;4 -4" dur="3s" repeatCount="indefinite"/>
              </text>
              <text x="18" y="5" fontSize="8" fill="#4096FF" opacity="0.6">
                Z
                <animate attributeName="opacity" values="0;0.6;0" dur="3s" repeatCount="indefinite" begin="1s"/>
                <animateTransform attributeName="transform" type="translate" values="0 0;2 -2;4 -4" dur="3s" repeatCount="indefinite" begin="1s"/>
              </text>
              <text x="19.5" y="3" fontSize="6" fill="#4096FF" opacity="0.4">
                Z
                <animate attributeName="opacity" values="0;0.4;0" dur="3s" repeatCount="indefinite" begin="2s"/>
                <animateTransform attributeName="transform" type="translate" values="0 0;2 -2;4 -4" dur="3s" repeatCount="indefinite" begin="2s"/>
              </text>
            </g>
          )}
          {!animated && (
            <g>
              <text x="16" y="7" fontSize="10" fill="#4096FF" opacity="0.8">Z</text>
              <text x="18" y="5" fontSize="8" fill="#4096FF" opacity="0.6">Z</text>
              <text x="19.5" y="3" fontSize="6" fill="#4096FF" opacity="0.4">Z</text>
            </g>
          )}
          <circle cx="17" cy="8" r="0.5" fill="#4096FF" opacity="0.3"/>
          <circle cx="19" cy="6" r="0.3" fill="#4096FF" opacity="0.2"/>
        </svg>
      </AnimatedEmojiContainer>
    );
  },

  // 星星眼表情 - 带闪烁星星
  starry: ({ animated = true, onClick }) => {
    return (
      <AnimatedEmojiContainer onClick={onClick}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="starryGradient" cx="0.3" cy="0.3" r="0.8">
              <stop offset="0%" stopColor="#FF8A50"/>
              <stop offset="100%" stopColor="#E8440D"/>
            </radialGradient>
          </defs>
          <circle cx="12" cy="12" r="10" fill="url(#starryGradient)" stroke="#B7410E" strokeWidth="1.5"/>
          <path d="M8.5 9.5L9.5 7.5L10.5 9.5L12 9L10.5 10.5L9.5 12L8.5 10.5L7 9L8.5 9.5Z" fill="#FFD700" stroke="#FA8C16" strokeWidth="0.5">
            {animated && <animate attributeName="fill" values="#FFD700;#FFF700;#FFD700" dur="1.5s" repeatCount="indefinite"/>}
          </path>
          <path d="M15.5 9.5L16.5 7.5L17.5 9.5L19 9L17.5 10.5L16.5 12L15.5 10.5L14 9L15.5 9.5Z" fill="#FFD700" stroke="#FA8C16" strokeWidth="0.5">
            {animated && <animate attributeName="fill" values="#FFD700;#FFF700;#FFD700" dur="1.5s" repeatCount="indefinite" begin="0.75s"/>}
          </path>
          <path d="M7 14.5C7 14.5 9.5 17.5 12 17.5C14.5 17.5 17 14.5 17 14.5" stroke="#2C1810" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M8.5 15.5C8.5 15.5 10 16.5 12 16.5C14 16.5 15.5 15.5 15.5 15.5" stroke="#FF4D4F" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </AnimatedEmojiContainer>
    );
  },

  // 火箭表情 - 带火焰动画
  rocket: ({ animated = true, onClick }) => {
    return (
      <AnimatedEmojiContainer 
        animation={animated ? float : null}
        duration="2s"
        infinite={true}
        onClick={onClick}
      >
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
          <path d="M8 6L10 8" stroke="#FFD666" strokeWidth="1.5" strokeLinecap="round">
            {animated && <animate attributeName="stroke" values="#FFD666;#FF4D4F;#FFD666" dur="1s" repeatCount="indefinite"/>}
          </path>
          <path d="M16 6L14 8" stroke="#FFD666" strokeWidth="1.5" strokeLinecap="round">
            {animated && <animate attributeName="stroke" values="#FFD666;#FF4D4F;#FFD666" dur="1s" repeatCount="indefinite"/>}
          </path>
        </svg>
      </AnimatedEmojiContainer>
    );
  }
};

// 动画表情名称映射
export const animatedEmojiNames = {
  happy: '开心 (动画)',
  angry: '愤怒 (动画)',
  love: '爱心 (动画)',
  excited: '兴奋 (动画)',
  thinking: '思考 (动画)',
  sleeping: '睡觉 (动画)',
  starry: '星星眼 (动画)',
  rocket: '火箭 (动画)'
};

// 获取动画表情组件
export const getAnimatedEmojiComponent = (key) => AnimatedMarsEmojis[key];

// 获取所有动画表情键名
export const getAnimatedEmojiKeys = () => Object.keys(AnimatedMarsEmojis);

export default AnimatedMarsEmojis;