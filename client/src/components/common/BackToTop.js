import React, { useState, useEffect } from 'react';
import { Fab, Zoom, Avatar, Box, Typography } from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';

const BackToTop = ({ threshold = 100 }) => {
  const [visible, setVisible] = useState(false);

  // 监听滚动事件
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > threshold;
      setVisible(scrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  // 滚动到顶部
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <Zoom in={visible}>
      <Box
        onClick={scrollToTop}
        sx={{
          position: 'fixed',
          bottom: { xs: 20, md: 30 },
          right: { xs: 20, md: 30 },
          zIndex: 1000,
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0.5
        }}
      >
        {/* 火星主题按钮 */}
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #ff4081 0%, #ff6b35 50%, #f7931e 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(255, 64, 129, 0.4)',
            position: 'relative',
            overflow: 'hidden',
            '&:hover': {
              background: 'linear-gradient(135deg, #e91e63 0%, #ff5722 50%, #ff9800 100%)',
              boxShadow: '0 6px 25px rgba(255, 64, 129, 0.6)',
              transform: 'scale(1.1) rotate(5deg)'
            },
            '&:active': {
              transform: 'scale(0.95)'
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3) 0%, transparent 50%)',
              borderRadius: '50%'
            }
          }}
        >
          {/* 华晨宇火字标志 */}
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: 'transparent',
              color: 'white',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              fontFamily: '"Microsoft YaHei", sans-serif',
              textShadow: '0 1px 3px rgba(0,0,0,0.3)'
            }}
          >
            火
          </Avatar>
          
          {/* 火箭图标作为装饰 */}
          <RocketLaunchIcon
            sx={{
              position: 'absolute',
              top: -2,
              right: -2,
              fontSize: '0.8rem',
              color: 'rgba(255,255,255,0.8)',
              transform: 'rotate(-45deg)'
            }}
          />
        </Box>
        
        {/* 小标签 */}
        <Typography
          variant="caption"
          sx={{
            color: 'rgba(255, 64, 129, 0.8)',
            fontSize: '0.65rem',
            fontWeight: 600,
            textShadow: '0 1px 2px rgba(255,255,255,0.8)',
            letterSpacing: '0.5px'
          }}
        >
          火星
        </Typography>
      </Box>
    </Zoom>
  );
};

export default BackToTop;