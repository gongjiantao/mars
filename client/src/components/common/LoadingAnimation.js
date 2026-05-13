import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { keyframes } from '@emotion/react';

// 定义动画关键帧
const logoColorChange = keyframes`
  0% {
    filter: brightness(1) hue-rotate(0deg);
  }
  25% {
    filter: brightness(1.2) hue-rotate(90deg);
  }
  50% {
    filter: brightness(1.4) hue-rotate(180deg);
  }
  75% {
    filter: brightness(1.2) hue-rotate(270deg);
  }
  100% {
    filter: brightness(1) hue-rotate(360deg);
  }
`;

const flowerBlossom = keyframes`
  0% {
    opacity: 0;
    transform: scale(0) rotate(0deg);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.2) rotate(180deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(360deg);
  }
`;

const floatingFlower = keyframes`
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
    opacity: 0.6;
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
    opacity: 1;
  }
`;

const fadeOut = keyframes`
  0% {
    opacity: 1;
    visibility: visible;
  }
  100% {
    opacity: 0;
    visibility: hidden;
  }
`;

const LoadingAnimation = ({ onComplete }) => {
  const [animationPhase, setAnimationPhase] = useState('initial'); // initial, colorChange, flowers, complete
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setAnimationPhase('colorChange');
    }, 500);

    const timer2 = setTimeout(() => {
      setAnimationPhase('flowers');
    }, 2000);

    const timer3 = setTimeout(() => {
      setAnimationPhase('complete');
      setIsVisible(false);
    }, 4000);

    const timer4 = setTimeout(() => {
      if (onComplete) {
        onComplete();
      }
    }, 4500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete]);

  if (!isVisible) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#000',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        animation: animationPhase === 'complete' ? `${fadeOut} 0.5s ease-out forwards` : 'none'
      }}
    >
      {/* 主Logo */}
      <Box
        sx={{
          position: 'relative',
          width: '200px',
          height: '200px',
          mb: 4
        }}
      >
        {/* 基于您图片的三角形Logo */}
        <Box
          sx={{
            width: '100%',
            height: '100%',
            position: 'relative',
            animation: animationPhase === 'colorChange' ? `${logoColorChange} 2s ease-in-out infinite` : 'none'
          }}
        >
          <svg
            width="200"
            height="200"
            viewBox="0 0 200 200"
            style={{
              filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.5))'
            }}
          >
            {/* 外层三角形 */}
            <path
              d="M100 20 L180 160 L20 160 Z"
              fill="none"
              stroke="white"
              strokeWidth="4"
            />
            
            {/* 内部几何图形 */}
            <path
              d="M100 50 L100 130 M70 90 L130 90"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
            />
            
            {/* 中心圆形 */}
            <circle
              cx="100"
              cy="90"
              r="15"
              fill="none"
              stroke="white"
              strokeWidth="2"
            />
            
            {/* 底部横线 */}
            <line
              x1="40"
              y1="140"
              x2="160"
              y2="140"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
            />
            
            {/* 底部垂直线 */}
            <line
              x1="100"
              y1="140"
              x2="100"
              y2="180"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </Box>

        {/* 花朵装饰 */}
        {animationPhase === 'flowers' && (
          <>
            {/* 围绕Logo的花朵 */}
            {[...Array(8)].map((_, index) => {
              const angle = (index * 45) * (Math.PI / 180);
              const radius = 120;
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;
              
              return (
                <Box
                  key={index}
                  sx={{
                    position: 'absolute',
                    left: `calc(50% + ${x}px)`,
                    top: `calc(50% + ${y}px)`,
                    transform: 'translate(-50%, -50%)',
                    animation: `${flowerBlossom} 1s ease-out ${index * 0.1}s forwards, ${floatingFlower} 3s ease-in-out infinite ${index * 0.2}s`,
                    opacity: 0
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24">
                    <path
                      d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9C21 10.1 20.1 11 19 11C17.9 11 17 10.1 17 9C17 7.9 17.9 7 19 7C20.1 7 21 7.9 21 9ZM7 9C7 10.1 6.1 11 5 11C3.9 11 3 10.1 3 9C3 7.9 3.9 7 5 7C6.1 7 7 7.9 7 9ZM14 18C14 19.1 13.1 20 12 20C10.9 20 10 19.1 10 18C10 16.9 10.9 16 12 16C13.1 16 14 16.9 14 18ZM12 12C13.1 12 14 11.1 14 10C14 8.9 13.1 8 12 8C10.9 8 10 8.9 10 10C10 11.1 10.9 12 12 12Z"
                      fill={`hsl(${index * 45}, 70%, 60%)`}
                    />
                  </svg>
                </Box>
              );
            })}
            
            {/* Logo上的花朵装饰 */}
            {[...Array(4)].map((_, index) => {
              const positions = [
                { top: '20%', left: '20%' },
                { top: '20%', right: '20%' },
                { bottom: '30%', left: '25%' },
                { bottom: '30%', right: '25%' }
              ];
              
              return (
                <Box
                  key={`logo-flower-${index}`}
                  sx={{
                    position: 'absolute',
                    ...positions[index],
                    animation: `${flowerBlossom} 0.8s ease-out ${0.5 + index * 0.15}s forwards`,
                    opacity: 0
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24">
                    <path
                      d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"
                      fill={`hsl(${index * 90 + 180}, 80%, 70%)`}
                    />
                  </svg>
                </Box>
              );
            })}
          </>
        )}
      </Box>

      {/* 加载文字 */}
      <Typography
        variant="h5"
        sx={{
          color: 'white',
          fontWeight: 'bold',
          textAlign: 'center',
          opacity: animationPhase === 'initial' ? 0.7 : 1,
          transition: 'opacity 0.5s ease'
        }}
      >
        {animationPhase === 'initial' && '欢迎来到火星基地'}
        {animationPhase === 'colorChange' && '正在启动...'}
        {animationPhase === 'flowers' && '绽放精彩'}
      </Typography>

      {/* 进度指示器 */}
      <Box
        sx={{
          mt: 3,
          width: '200px',
          height: '2px',
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '1px',
          overflow: 'hidden'
        }}
      >
        <Box
          sx={{
            height: '100%',
            backgroundColor: 'white',
            borderRadius: '1px',
            transition: 'width 4s ease-out',
            width: animationPhase === 'complete' ? '100%' : 
                   animationPhase === 'flowers' ? '80%' :
                   animationPhase === 'colorChange' ? '40%' : '10%'
          }}
        />
      </Box>
    </Box>
  );
};

export default LoadingAnimation;