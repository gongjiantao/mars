import React, { useState, useEffect, useRef } from 'react';
import { Box, IconButton } from '@mui/material';
import { Favorite as FavoriteIcon } from '@mui/icons-material';
import { keyframes } from '@mui/system';

// 心形粒子动画
const heartParticle = keyframes`
  0% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  50% {
    transform: translateY(-20px) scale(1.2);
    opacity: 0.8;
  }
  100% {
    transform: translateY(-40px) scale(0.5);
    opacity: 0;
  }
`;

// 点赞按钮缩放动画
const likeButtonScale = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.3);
  }
  100% {
    transform: scale(1);
  }
`;

// 心形波纹扩散动画
const rippleEffect = keyframes`
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(4);
    opacity: 0;
  }
`;

// 火星主题颜色渐变动画
const marsColorShift = keyframes`
  0% {
    color: #ff4081;
    filter: drop-shadow(0 0 5px rgba(255, 64, 129, 0.5));
  }
  25% {
    color: #ff6b35;
    filter: drop-shadow(0 0 8px rgba(255, 107, 53, 0.6));
  }
  50% {
    color: #f7931e;
    filter: drop-shadow(0 0 10px rgba(247, 147, 30, 0.7));
  }
  75% {
    color: #ff5722;
    filter: drop-shadow(0 0 8px rgba(255, 87, 34, 0.6));
  }
  100% {
    color: #ff4081;
    filter: drop-shadow(0 0 5px rgba(255, 64, 129, 0.5));
  }
`;

const LikeEffect = ({ 
  isLiked, 
  onLike, 
  size = 'small',
  disabled = false,
  likesCount = 0,
  showCount = true 
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [particles, setParticles] = useState([]);
  const buttonRef = useRef(null);
  const particleIdRef = useRef(0);

  // 创建心形粒子
  const createParticles = () => {
    const newParticles = [];
    const particleCount = 6;
    
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: particleIdRef.current++,
        x: Math.random() * 40 - 20, // -20px 到 20px
        y: Math.random() * 10 - 5,  // -5px 到 5px
        delay: i * 0.1, // 错开动画时间
        color: `hsl(${Math.random() * 60 + 320}, 80%, 60%)` // 火星主题色系
      });
    }
    
    setParticles(newParticles);
    
    // 清理粒子
    setTimeout(() => {
      setParticles([]);
    }, 1000);
  };

  const handleClick = () => {
    if (disabled) return;
    
    setIsAnimating(true);
    
    // 如果是点赞操作，创建粒子特效
    if (!isLiked) {
      createParticles();
    }
    
    // 调用父组件的点赞函数
    onLike();
    
    // 重置动画状态
    setTimeout(() => {
      setIsAnimating(false);
    }, 600);
  };

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5
      }}
    >
      {/* 点赞按钮 */}
      <Box
        ref={buttonRef}
        sx={{
          position: 'relative',
          display: 'inline-flex'
        }}
      >
        <IconButton
          size={size}
          onClick={handleClick}
          disabled={disabled}
          sx={{
            color: isLiked ? 'error.main' : 'text.secondary',
            position: 'relative',
            zIndex: 2,
            animation: isAnimating ? `${likeButtonScale} 0.6s ease-out` : 'none',
            ...(isLiked && {
              animation: `${marsColorShift} 2s ease-in-out infinite`,
            }),
            '&:hover': {
              backgroundColor: 'rgba(255, 64, 129, 0.1)',
              transform: 'scale(1.1)',
            },
            '&:active': {
              transform: 'scale(0.95)',
            },
            transition: 'all 0.2s ease-in-out',
          }}
        >
          <FavoriteIcon fontSize={size} />
        </IconButton>

        {/* 波纹效果 */}
        {isAnimating && !isLiked && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              border: '2px solid #ff4081',
              transform: 'translate(-50%, -50%)',
              animation: `${rippleEffect} 0.6s ease-out`,
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />
        )}

        {/* 心形粒子容器 */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex: 3,
          }}
        >
          {particles.map((particle) => (
            <Box
              key={particle.id}
              sx={{
                position: 'absolute',
                left: `${particle.x}px`,
                top: `${particle.y}px`,
                fontSize: '12px',
                color: particle.color,
                animation: `${heartParticle} 1s ease-out ${particle.delay}s forwards`,
                pointerEvents: 'none',
              }}
            >
              ❤️
            </Box>
          ))}
        </Box>
      </Box>

      {/* 点赞数显示 */}
      {showCount && (
        <Box
          sx={{
            fontSize: size === 'small' ? '0.875rem' : '1rem',
            color: isLiked ? 'error.main' : 'text.secondary',
            fontWeight: isLiked ? 600 : 400,
            transition: 'all 0.3s ease-in-out',
            ...(isAnimating && {
              animation: `${likeButtonScale} 0.6s ease-out`,
            }),
          }}
        >
          {likesCount}
        </Box>
      )}
    </Box>
  );
};

export default LikeEffect;