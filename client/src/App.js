import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import ScrollToTop from './components/common/ScrollToTop';

// 布局组件
import Layout from './components/layout/Layout';
// 页面组件
import HomePage from './pages/HomePage';
import PostsPage from './pages/posts/PostsPage';
import ChallengesPage from './pages/challenges/ChallengesPage';
import AntiViolencePage from './pages/anti-violence/AntiViolencePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ProfilePage from './pages/profile/ProfilePage';
import MessagesPage from './pages/messages/MessagesPage';
import NotFoundPage from './pages/NotFoundPage';
import CoalBallMapPage from './pages/events/CoalBallMapPage';
import PreLoginPage from './pages/auth/PreLoginPage';
import ProtectedRoute from './components/auth/ProtectedRoute';

// 创建主题
const theme = createTheme({
  palette: {
    primary: {
      main: '#ff4081', // 火星粉红色
    },
    secondary: {
      main: '#3f51b5',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ScrollToTop />
      <Routes>
        {/* 验证页面 */}
        <Route path="/verify" element={<PreLoginPage />} />
        
        {/* 正常的登录注册页面 */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* 受保护的路由 */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<HomePage />} />
          <Route path="home" element={<HomePage />} />
          <Route path="posts" element={<PostsPage />} />
          <Route path="events" element={<CoalBallMapPage />} />
          <Route path="challenges" element={<ChallengesPage />} />
          <Route path="anti-violence" element={<AntiViolencePage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="messages" element={<MessagesPage />} />
        </Route>
        
        {/* 404页面 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;