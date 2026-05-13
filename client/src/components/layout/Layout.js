import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import Header from './Header';
import Footer from './Footer';
import AlertContainer from '../common/AlertContainer';
import BackToTop from '../common/BackToTop';

const Layout = () => {
  const location = useLocation();

  useEffect(() => {
    // 当路由变化时滚动到顶部
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [location]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1,
          pt: { xs: '64px', md: '72px' }, // 为固定导航栏留出空间
          minHeight: 'calc(100vh - 64px)', // 确保内容区域最小高度
          '@media (min-width: 900px)': {
            minHeight: 'calc(100vh - 72px)'
          }
        }}
      >
        <Outlet />
      </Box>
      <Footer />
      <AlertContainer />
      <BackToTop />
    </Box>
  );
};

export default Layout;