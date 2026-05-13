import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Divider,
  Chip,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Link,
  Fade,
  Slide,
  Zoom,
  Avatar,
  IconButton,
  Tooltip,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar
} from '@mui/material';
import {
  InfoOutlined,
  WarningAmber,
  Report,
  CheckCircleOutline,
  ArrowForward,
  Article,
  Phone,
  Lightbulb,
  Security,
  Psychology,
  Support,
  Visibility,
  VisibilityOff,
  ContentCopy,
  Share,
  ThumbUp,
  Close,
  AutoFixHigh,
  TrendingUp,
  Shield,
  Group,
  School,
  LocalPolice,
  Launch
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { keyframes } from '@mui/system';
import axios from 'axios';
import { createApiUrl, API_ENDPOINTS } from '../../config/api';

// 生成或获取sessionId
const getSessionId = () => {
  let sessionId = localStorage.getItem('detection_session_id');
  if (!sessionId) {
    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('detection_session_id', sessionId);
  }
  return sessionId;
};

// 动画定义
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -468px 0;
  }
  100% {
    background-position: 468px 0;
  }
`;

// 抱抱动画
const hugAnimation = keyframes`
  0% {
    transform: scale(0.8) rotate(-5deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.1) rotate(2deg);
    opacity: 1;
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
`;

const heartFloat = keyframes`
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  25% {
    transform: translateY(-10px) rotate(5deg);
  }
  75% {
    transform: translateY(-5px) rotate(-3deg);
  }
`;

// 模拟的Redux action
const detectViolenceContent = (content) => async (dispatch) => {
  try {
    dispatch({ type: 'DETECT_VIOLENCE_REQUEST' });
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'x-session-id': getSessionId()
      }
    };
    
    const { data } = await axios.post('/api/anti-violence/detect', { content }, config);
    
    dispatch({
      type: 'DETECT_VIOLENCE_SUCCESS',
      payload: data
    });
    
    return data;
  } catch (error) {
    dispatch({
      type: 'DETECT_VIOLENCE_FAIL',
      payload: error.response && error.response.data.error
        ? error.response.data.error
        : error.message
    });
    throw error;
  }
};

const getAntiViolenceResources = () => async (dispatch) => {
  try {
    dispatch({ type: 'GET_RESOURCES_REQUEST' });
    
    const { data } = await axios.get('/api/anti-violence/resources');
    
    dispatch({
      type: 'GET_RESOURCES_SUCCESS',
      payload: data.data
    });
    
    return data.data;
  } catch (error) {
    dispatch({
      type: 'GET_RESOURCES_FAIL',
      payload: error.response && error.response.data.error
        ? error.response.data.error
        : error.message
    });
    throw error;
  }
};

const reportViolenceContent = (reportData) => async (dispatch) => {
  try {
    dispatch({ type: 'REPORT_VIOLENCE_REQUEST' });
    
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('用户未登录，请先登录');
    }
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    };
    
    const { data } = await axios.post('/api/anti-violence/report', reportData, config);
    
    dispatch({
      type: 'REPORT_VIOLENCE_SUCCESS',
      payload: data
    });
    
    return data;
  } catch (error) {
    let errorMessage = '举报提交失败';
    
    if (error.response) {
      // 服务器响应错误
      if (error.response.status === 401) {
        errorMessage = '登录已过期，请重新登录';
      } else if (error.response.status === 500) {
        errorMessage = '服务器内部错误，请稍后重试';
      } else {
        errorMessage = error.response.data?.error || error.response.data?.message || errorMessage;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    dispatch({
      type: 'REPORT_VIOLENCE_FAIL',
      payload: errorMessage
    });
    
    throw error;
  }
};

const AntiViolencePage = () => {
  const dispatch = useDispatch();
  
  // 本地状态
  const [content, setContent] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [detectionResult, setDetectionResult] = useState(null);
  const [resources, setResources] = useState(null);
  const [showSanitized, setShowSanitized] = useState(false);
  const [detectionProgress, setDetectionProgress] = useState(0);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [showHugAnimation, setShowHugAnimation] = useState(false);
  const [detectionCount, setDetectionCount] = useState(0);
  const [reportForm, setReportForm] = useState({
    content: '',
    type: '网络霸凌',
    platform: '',
    url: '',
    description: ''
  });
  
  // 添加统计数据状态
  const [globalStats, setGlobalStats] = useState({
    detectionCount: 0,
    helpedUsers: 0,
    accuracyRate: 0,
    processedReports: 0
  });
  
  // 创建ref用于滑动到智能检测区域
  const detectionSectionRef = useRef(null);
  
  // Redux状态 - 添加认证状态
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { loading: detectLoading, error: detectError } = useSelector(
    (state) => state.violenceDetection || {}
  );
  
  const { loading: resourcesLoading, error: resourcesError } = useSelector(
    (state) => state.antiViolenceResources || {}
  );
  
  const { loading: reportLoading, error: reportError, success: reportSuccess } = useSelector(
    (state) => state.violenceReport || {}
  );
  
  // 获取全局统计数据
  const fetchGlobalStats = async () => {
    try {
      const url = createApiUrl('/api/anti-violence/stats');
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setGlobalStats(data.data);
      }
    } catch (error) {
      console.error('获取全局统计数据失败:', error);
    }
  };
  
  // 更新检测次数获取函数
  const fetchDetectionCount = async () => {
    try {
      // 获取全局统计数据（包含检测次数）
      await fetchGlobalStats();
    } catch (error) {
      console.error('获取检测次数失败:', error);
    }
  };

  // 页面加载时获取统计数据
  useEffect(() => {
    fetchGlobalStats();
  }, []);
  
  // 加载资源和检测次数
  useEffect(() => {
    const loadData = async () => {
      try {
        // 并行加载资源和检测次数
        const [resourcesData] = await Promise.all([
          dispatch(getAntiViolenceResources()),
          fetchDetectionCount()
        ]);
        setResources(resourcesData);
      } catch (error) {
        console.error('加载数据失败:', error);
      }
    };
    
    loadData();
  }, [dispatch]);

  // 检测进度模拟
  useEffect(() => {
    if (detectLoading) {
      setDetectionProgress(0);
      const timer = setInterval(() => {
        setDetectionProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            return 100;
          }
          return prev + 10;
        });
      }, 200);
      return () => clearInterval(timer);
    }
  }, [detectLoading]);

  // 页面加载时显示抱抱动画
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowHugAnimation(true);
    }, 500); // 延迟500ms显示动画
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setDetectionResult(null);
  };
  
  // 滑动到智能检测区域的函数
  const scrollToDetection = () => {
    if (detectionSectionRef.current) {
      detectionSectionRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
    // 同时切换到智能检测标签页
    setTabValue(0);
  };
  
  const handleDetect = async () => {
    try {
      const result = await dispatch(detectViolenceContent(content));
      setDetectionResult(result);
      // 检测完成后更新检测次数（从数据库获取最新值）
      await fetchDetectionCount();
      if (!result.detected) {
        setSnackbarMessage('内容检测通过，未发现敏感内容！');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('检测失败:', error);
    }
  };
  
  const handleReportFormChange = (e) => {
    setReportForm({
      ...reportForm,
      [e.target.name]: e.target.value
    });
  };
  
  const handleReportSubmit = async (e) => {
    e.preventDefault();
    
    // 检查用户是否已登录
    if (!isAuthenticated) {
      setSnackbarMessage('请先登录后再进行举报');
      setSnackbarOpen(true);
      return;
    }
    
    try {
      await dispatch(reportViolenceContent(reportForm));
      setShowSuccessDialog(true);
      setReportForm({
        content: '',
        type: '网络霸凌',
        platform: '',
        url: '',
        description: ''
      });
    } catch (error) {
      console.error('举报失败:', error);
      // 添加更详细的错误处理
      if (error.response?.status === 401 || error.message.includes('unauthorized')) {
        setSnackbarMessage('登录已过期，请重新登录');
      } else if (error.response?.status === 500) {
        setSnackbarMessage('服务器错误，请稍后重试');
      } else {
        setSnackbarMessage('举报提交失败，请稍后重试');
      }
      setSnackbarOpen(true);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setSnackbarMessage('内容已复制到剪贴板');
    setSnackbarOpen(true);
  };

  const StatCard = ({ icon, title, value, color = 'primary' }) => {
    const gradients = {
      primary: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)',
      success: 'linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)',
      warning: 'linear-gradient(135deg, #d97706 0%, #f59e0b 50%, #fbbf24 100%)',
      secondary: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 50%, #a78bfa 100%)'
    };
    
    return (
      <Card 
        sx={{ 
          height: '100%',
          background: gradients[color] || gradients.primary,
          color: 'white',
          animation: `${fadeInUp} 0.6s ease-out`,
          borderRadius: 3,
          overflow: 'hidden',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)',
            zIndex: 1
          },
          '&:hover': {
            transform: 'translateY(-8px) scale(1.02)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            '& .stat-icon': {
              transform: 'scale(1.1) rotate(5deg)'
            }
          },
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <CardContent sx={{ textAlign: 'center', p: { xs: 2.5, md: 3 }, position: 'relative', zIndex: 2 }}>
          <Avatar 
            className="stat-icon"
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.15)', 
              mx: 'auto', 
              mb: 2, 
              width: { xs: 50, md: 56 }, 
              height: { xs: 50, md: 56 },
              backdropFilter: 'blur(10px)',
              border: '2px solid rgba(255,255,255,0.2)',
              transition: 'all 0.3s ease'
            }}
          >
            {icon}
          </Avatar>
          <Typography variant="h4" component="div" fontWeight="bold" sx={{ fontSize: { xs: '1.8rem', md: '2.125rem' } }}>
            {value}
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, fontSize: { xs: '0.9rem', md: '1rem' } }}>
            {title}
          </Typography>
        </CardContent>
      </Card>
    );
  };
  
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'linear-gradient(180deg, #f8fafc 0%, #e3f2fd 100%)' }}>
      {/* 英雄区域 */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #06b6d4 100%)',
          color: 'white',
          py: { xs: 6, md: 8 },
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(255,255,255,0.08) 0%, transparent 50%)',
            zIndex: 1
          }
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Cpath d="M40 40c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm20 0c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: 0.4,
            zIndex: 2
          }}
        />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 3 }}>
          <Fade in timeout={1000}>
            <Box textAlign="center">
              <Avatar
                sx={{
                  bgcolor: 'rgba(255,255,255,0.15)',
                  mx: 'auto',
                  mb: 3,
                  width: { xs: 70, md: 80 },
                  height: { xs: 70, md: 80 },
                  animation: `${pulse} 2s infinite`,
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(255,255,255,0.2)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                }}
              >
                <Shield sx={{ fontSize: { xs: 35, md: 40 } }} />
              </Avatar>
              <Typography 
                variant="h2" 
                component="h1" 
                gutterBottom 
                fontWeight="bold"
                sx={{ 
                  animation: `${fadeInUp} 0.8s ease-out`,
                  fontSize: { xs: '2.5rem', md: '3.75rem' },
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  background: 'linear-gradient(45deg, #ffffff 30%, #e3f2fd 90%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                🛡️ 反网络暴力守护平台
              </Typography>
              <Typography 
                variant="h5" 
                paragraph 
                sx={{ 
                  opacity: 0.95,
                  maxWidth: { xs: 400, md: 600 },
                  mx: 'auto',
                  animation: `${fadeInUp} 1s ease-out`,
                  fontSize: { xs: '1.1rem', md: '1.5rem' },
                  lineHeight: 1.6,
                  textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                }}
              >
                🌟 共建健康网络环境，守护每一位无辜的火星人 🌟
              </Typography>
              <Box sx={{ mt: 4, animation: `${fadeInUp} 1.2s ease-out` }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={scrollToDetection}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.15)',
                    color: 'white',
                    px: { xs: 3, md: 4 },
                    py: { xs: 1.2, md: 1.5 },
                    mr: { xs: 1, md: 2 },
                    mb: { xs: 2, md: 0 },
                    borderRadius: 3,
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    fontSize: { xs: '0.9rem', md: '1rem' },
                    fontWeight: 600,
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.25)',
                      transform: 'translateY(-3px)',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.15)'
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                  startIcon={<AutoFixHigh />}
                >
                  🚀 开始检测
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    borderColor: 'rgba(255,255,255,0.3)',
                    color: 'white',
                    px: { xs: 3, md: 4 },
                    py: { xs: 1.2, md: 1.5 },
                    borderRadius: 3,
                    backdropFilter: 'blur(10px)',
                    fontSize: { xs: '0.9rem', md: '1rem' },
                    fontWeight: 600,
                    '&:hover': {
                      borderColor: 'rgba(255,255,255,0.6)',
                      bgcolor: 'rgba(255,255,255,0.1)',
                      transform: 'translateY(-3px)',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.15)'
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                  startIcon={<Support />}
                >
                  💡 获取帮助
                </Button>
              </Box>
            </Box>
          </Fade>
        </Container>
      </Box>

      {/* 统计数据 */}
      <Container maxWidth="lg" sx={{ mt: { xs: -4, md: -6 }, mb: 6, position: 'relative', zIndex: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={<Shield />}
              title="🔍 检测次数"
              value={globalStats.detectionCount.toString()}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={<Group />}
              title="👥 帮助用户"
              value={globalStats.helpedUsers.toString()}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={<TrendingUp />}
              title="📈 准确率"
              value={`${globalStats.accuracyRate}%`}
              color="warning"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={<LocalPolice />}
              title="🚨 处理举报"
              value={globalStats.processedReports.toString()}
              color="secondary"
            />
          </Grid>
        </Grid>
      </Container>

      <Container maxWidth="lg" sx={{ pb: 6 }} ref={detectionSectionRef}>
        <Slide direction="up" in timeout={800}>
          <Paper 
            elevation={8}
            sx={{ 
              borderRadius: 3,
              overflow: 'hidden',
              background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)'
            }}
          >
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
              sx={{
                bgcolor: 'rgba(25, 118, 210, 0.05)',
                '& .MuiTab-root': {
                  py: 3,
                  fontSize: '1rem',
                  fontWeight: 600,
                  '&:hover': {
                    bgcolor: 'rgba(25, 118, 210, 0.08)'
                  }
                }
              }}
            >
              <Tab 
                label="智能检测" 
                icon={<AutoFixHigh />} 
                iconPosition="start"
                sx={{ gap: 1 }}
              />
              <Tab 
                label="资源中心" 
                icon={<School />} 
                iconPosition="start"
                sx={{ gap: 1 }}
              />
              <Tab 
                label="举报平台" 
                icon={<Report />} 
                iconPosition="start"
                sx={{ gap: 1 }}
              />
            </Tabs>
            
            <Box p={4}>
              {/* 内容检测标签页 */}
              {tabValue === 0 && (
                <Fade in timeout={600}>
                  <Box>
                    <Box sx={{ mb: 4, textAlign: 'center' }}>
                      <Avatar
                        sx={{
                          bgcolor: 'primary.main',
                          mx: 'auto',
                          mb: 2,
                          width: 64,
                          height: 64
                        }}
                      >
                        <Psychology sx={{ fontSize: 32 }} />
                      </Avatar>
                      <Typography variant="h5" gutterBottom fontWeight="bold">
                        AI智能内容检测(不完全准确)
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
                        运用先进的自然语言处理技术，实时识别网络暴力内容，为您提供专业的改进建议
                      </Typography>
                    </Box>
                    
                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        p: 4, 
                        mb: 3,
                        borderRadius: 3,
                        background: 'linear-gradient(145deg, #f8fafc 0%, #ffffff 100%)',
                        border: '2px solid transparent',
                        backgroundImage: 'linear-gradient(white, white), linear-gradient(45deg, #e3f2fd, #f3e5f5)',
                        backgroundOrigin: 'border-box',
                        backgroundClip: 'content-box, border-box',
                        position: 'relative',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          borderRadius: 3,
                          padding: '2px',
                          background: 'linear-gradient(45deg, #1976d2, #9c27b0)',
                          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                          maskComposite: 'exclude',
                          opacity: 0,
                          transition: 'opacity 0.3s ease'
                        },
                        '&:hover::before': {
                          opacity: 0.6
                        }
                      }}
                    >
                      <Box sx={{ position: 'relative', zIndex: 1 }}>
                        <TextField
                          fullWidth
                          multiline
                          rows={8}
                          variant="outlined"
                          placeholder="🔍 请输入需要检测的内容...\n\n💡 支持检测类型：\n• 社交媒体评论和帖子\n• 聊天记录和私信\n• 论坛讨论内容\n• 其他文本内容\n\n✨ AI将为您提供专业的内容分析和改进建议"
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          sx={{ 
                            mb: 3,
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              backgroundColor: 'rgba(255, 255, 255, 0.8)',
                              backdropFilter: 'blur(10px)',
                              transition: 'all 0.3s ease',
                              '& fieldset': {
                                borderColor: 'rgba(25, 118, 210, 0.2)',
                                borderWidth: '2px'
                              },
                              '&:hover fieldset': {
                                borderColor: 'primary.main',
                                boxShadow: '0 0 0 4px rgba(25, 118, 210, 0.1)'
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: 'primary.main',
                                boxShadow: '0 0 0 4px rgba(25, 118, 210, 0.2)'
                              }
                            },
                            '& .MuiInputBase-input': {
                              fontSize: '1rem',
                              lineHeight: 1.6,
                              '&::placeholder': {
                                color: 'text.secondary',
                                opacity: 0.8
                              }
                            }
                          }}
                        />
                      
                        {detectLoading && (
                          <Box sx={{ 
                            mb: 3,
                            p: 3,
                            borderRadius: 2,
                            background: 'linear-gradient(145deg, #e3f2fd 0%, #ffffff 100%)',
                            border: '1px solid rgba(25, 118, 210, 0.2)'
                          }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 32, height: 32 }}>
                                <Psychology sx={{ fontSize: 18 }} />
                              </Avatar>
                              <Typography variant="subtitle1" fontWeight="bold" sx={{ flexGrow: 1 }}>
                                🤖 AI正在智能分析内容...
                              </Typography>
                              <Chip 
                                label={`${detectionProgress}%`} 
                                color="primary" 
                                size="small"
                                sx={{ fontWeight: 'bold' }}
                              />
                            </Box>
                            <LinearProgress 
                              variant="determinate" 
                              value={detectionProgress}
                              sx={{ 
                                borderRadius: 2, 
                                height: 8,
                                backgroundColor: 'rgba(25, 118, 210, 0.1)',
                                '& .MuiLinearProgress-bar': {
                                  borderRadius: 2,
                                  background: 'linear-gradient(45deg, #1976d2, #42a5f5)'
                                }
                              }}
                            />
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                              正在运用深度学习算法分析文本语义和情感倾向...
                            </Typography>
                          </Box>
                        )}
                        
                        <Box sx={{ 
                          display: 'flex', 
                          gap: 3, 
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          justifyContent: 'space-between'
                        }}>
                          <Button
                            variant="contained"
                            size="large"
                            onClick={handleDetect}
                            disabled={!content.trim() || detectLoading}
                            startIcon={detectLoading ? <CircularProgress size={20} color="inherit" /> : <AutoFixHigh />}
                            sx={{
                              px: 5,
                              py: 2,
                              borderRadius: 3,
                              fontSize: '1.1rem',
                              fontWeight: 'bold',
                              background: detectLoading 
                                ? 'linear-gradient(45deg, #9e9e9e 30%, #bdbdbd 90%)'
                                : 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                              boxShadow: detectLoading 
                                ? 'none'
                                : '0 4px 15px rgba(25, 118, 210, 0.3)',
                              '&:hover': {
                                background: detectLoading 
                                  ? 'linear-gradient(45deg, #9e9e9e 30%, #bdbdbd 90%)'
                                  : 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
                                transform: detectLoading ? 'none' : 'translateY(-3px)',
                                boxShadow: detectLoading 
                                  ? 'none'
                                  : '0 8px 25px rgba(25, 118, 210, 0.4)'
                              },
                              '&:disabled': {
                                color: 'rgba(255, 255, 255, 0.7)'
                              },
                              transition: 'all 0.3s ease',
                              minWidth: 160
                            }}
                          >
                            {detectLoading ? '🔍 分析中...' : '🚀 开始智能检测'}
                          </Button>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Chip 
                              icon={<Article />}
                              label={`字数: ${content.length}`}
                              variant="outlined"
                              color={content.length > 500 ? 'warning' : 'default'}
                              sx={{ fontWeight: 'bold' }}
                            />
                            {content.length > 1000 && (
                              <Chip 
                                label="内容较长"
                                color="info"
                                size="small"
                              />
                            )}
                          </Box>
                        </Box>
                      </Box>
                    </Paper>
                    
                    {detectError && (
                      <Zoom in>
                        <Alert 
                          severity="error" 
                          sx={{ 
                            mb: 3,
                            borderRadius: 2,
                            '& .MuiAlert-icon': {
                              fontSize: 24
                            }
                          }}
                        >
                          {detectError}
                        </Alert>
                      </Zoom>
                    )}
                    
                    {detectionResult && (
                      <Slide direction="up" in timeout={600}>
                        <Paper 
                          elevation={6}
                          sx={{ 
                            p: 5, 
                            borderRadius: 4,
                            background: detectionResult.detected 
                              ? 'linear-gradient(145deg, #fff3e0 0%, #ffffff 100%)'
                              : 'linear-gradient(145deg, #e8f5e8 0%, #ffffff 100%)',
                            border: detectionResult.detected 
                              ? '3px solid #ff9800'
                              : '3px solid #4caf50',
                            position: 'relative',
                            overflow: 'hidden',
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              height: '4px',
                              background: detectionResult.detected 
                                ? 'linear-gradient(90deg, #ff9800, #ffb74d)'
                                : 'linear-gradient(90deg, #4caf50, #81c784)'
                            }
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                            <Avatar
                              sx={{
                                bgcolor: detectionResult.detected ? 'warning.main' : 'success.main',
                                mr: 3,
                                width: 56,
                                height: 56,
                                boxShadow: detectionResult.detected 
                                  ? '0 4px 20px rgba(255, 152, 0, 0.3)'
                                  : '0 4px 20px rgba(76, 175, 80, 0.3)'
                              }}
                            >
                              {detectionResult.detected ? <WarningAmber sx={{ fontSize: 28 }} /> : <CheckCircleOutline sx={{ fontSize: 28 }} />}
                            </Avatar>
                            <Box>
                              <Typography variant="h5" fontWeight="bold" sx={{ mb: 0.5 }}>
                                🎯 AI检测结果
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                基于深度学习模型的智能内容分析
                              </Typography>
                            </Box>
                          </Box>
                          
                          {detectionResult.detected ? (
                            <Box>
                              <Alert 
                                severity="warning" 
                                icon={<WarningAmber sx={{ fontSize: 24 }} />}
                                sx={{ 
                                  mb: 4,
                                  borderRadius: 3,
                                  fontSize: '1.1rem',
                                  background: 'linear-gradient(145deg, #fff8e1 0%, #ffffff 100%)',
                                  border: '2px solid #ffb74d',
                                  '& .MuiAlert-message': {
                                    width: '100%'
                                  }
                                }}
                              >
                                <Box>
                                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                                    ⚠️ 检测到潜在的{detectionResult.type === 'emotional' ? '情绪类' : 
                                                detectionResult.type === 'violence' ? '暴力类' : 
                                                detectionResult.type === 'cyberViolence' ? '网络暴力类' : 
                                                '混合类'}敏感内容
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    建议您参考下方的改进建议，创造更加友善的网络环境
                                  </Typography>
                                </Box>
                              </Alert>
                              
                              <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                  <Paper 
                                    variant="outlined" 
                                    sx={{ 
                                      p: 4, 
                                      borderRadius: 3,
                                      background: 'linear-gradient(145deg, #ffebee 0%, #ffffff 100%)',
                                      border: '2px solid #ffcdd2',
                                      height: '100%'
                                    }}
                                  >
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                      <Avatar sx={{ bgcolor: 'error.main', mr: 2, width: 40, height: 40 }}>
                                        <WarningAmber sx={{ fontSize: 20 }} />
                                      </Avatar>
                                      <Typography variant="h6" fontWeight="bold">
                                        🔍 检测到的敏感词
                                      </Typography>
                                    </Box>
                                    <Box sx={{ mb: 2 }}>
                                      {detectionResult.detectedWords?.map((word, index) => (
                                        <Chip
                                          key={index}
                                          label={word}
                                          color="error"
                                          size="medium"
                                          sx={{ 
                                            m: 0.5,
                                            fontWeight: 'bold',
                                            fontSize: '0.9rem',
                                            px: 1,
                                            py: 0.5,
                                            borderRadius: 2,
                                            boxShadow: '0 2px 8px rgba(244, 67, 54, 0.2)',
                                            '&:hover': {
                                              transform: 'scale(1.05)',
                                              boxShadow: '0 4px 12px rgba(244, 67, 54, 0.3)'
                                            },
                                            transition: 'all 0.2s ease'
                                          }}
                                        />
                                      ))}
                                    </Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                      共检测到 {detectionResult.detectedWords?.length || 0} 个敏感词汇
                                    </Typography>
                                  </Paper>
                                </Grid>
                                
                                <Grid item xs={12} md={6}>
                                  <Paper 
                                    variant="outlined" 
                                    sx={{ 
                                      p: 4, 
                                      borderRadius: 3,
                                      background: 'linear-gradient(145deg, #e8f5e8 0%, #ffffff 100%)',
                                      border: '2px solid #c8e6c9',
                                      height: '100%'
                                    }}
                                  >
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                      <Avatar sx={{ bgcolor: 'success.main', mr: 2, width: 40, height: 40 }}>
                                        <AutoFixHigh sx={{ fontSize: 20 }} />
                                      </Avatar>
                                      <Typography variant="h6" fontWeight="bold" sx={{ flexGrow: 1 }}>
                                        ✨ 建议修改后的内容
                                      </Typography>
                                      <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Tooltip title={showSanitized ? '隐藏内容' : '显示内容'}>
                                          <IconButton
                                            size="small"
                                            onClick={() => setShowSanitized(!showSanitized)}
                                            sx={{
                                              bgcolor: 'rgba(76, 175, 80, 0.1)',
                                              '&:hover': {
                                                bgcolor: 'rgba(76, 175, 80, 0.2)'
                                              }
                                            }}
                                          >
                                            {showSanitized ? <VisibilityOff /> : <Visibility />}
                                          </IconButton>
                                        </Tooltip>
                                        <Tooltip title="复制内容">
                                          <IconButton
                                            size="small"
                                            onClick={() => copyToClipboard(detectionResult.sanitizedContent)}
                                            sx={{
                                              bgcolor: 'rgba(76, 175, 80, 0.1)',
                                              '&:hover': {
                                                bgcolor: 'rgba(76, 175, 80, 0.2)'
                                              }
                                            }}
                                          >
                                            <ContentCopy />
                                          </IconButton>
                                        </Tooltip>
                                      </Box>
                                    </Box>
                                    {showSanitized && (
                                      <Fade in timeout={300}>
                                        <Paper 
                                          variant="outlined" 
                                          sx={{ 
                                            p: 3, 
                                            bgcolor: 'rgba(232, 245, 233, 0.5)',
                                            borderRadius: 2,
                                            border: '2px dashed #4caf50',
                                            position: 'relative',
                                            '&::before': {
                                              content: '"💡"',
                                              position: 'absolute',
                                              top: -10,
                                              left: 16,
                                              bgcolor: '#4caf50',
                                              color: 'white',
                                              borderRadius: '50%',
                                              width: 24,
                                              height: 24,
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              fontSize: '12px'
                                            }
                                          }}
                                        >
                                          <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                                            {detectionResult.sanitizedContent}
                                          </Typography>
                                        </Paper>
                                      </Fade>
                                    )}
                                    {!showSanitized && (
                                      <Box sx={{ textAlign: 'center', py: 3 }}>
                                        <Typography variant="body2" color="text.secondary">
                                          点击眼睛图标查看优化后的内容
                                        </Typography>
                                      </Box>
                                    )}
                                  </Paper>
                                </Grid>
                                
                                <Grid item xs={12}>
                                  <Paper 
                                    variant="outlined" 
                                    sx={{ 
                                      p: 4, 
                                      borderRadius: 3,
                                      background: 'linear-gradient(145deg, #f3e5f5 0%, #ffffff 100%)',
                                      border: '2px solid #e1bee7'
                                    }}
                                  >
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                      <Avatar sx={{ bgcolor: 'secondary.main', mr: 2, width: 48, height: 48 }}>
                                        <Lightbulb sx={{ fontSize: 24 }} />
                                      </Avatar>
                                      <Box>
                                        <Typography variant="h6" fontWeight="bold">
                                          💡 AI专业改进建议
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                          基于语言学和心理学的优化建议
                                        </Typography>
                                      </Box>
                                    </Box>
                                    <List sx={{ '& .MuiListItem-root': { borderRadius: 2, mb: 1 } }}>
                                      {detectionResult.suggestions?.map((suggestion, index) => (
                                        <ListItem 
                                          key={index} 
                                          sx={{ 
                                            py: 2,
                                            px: 3,
                                            backgroundColor: 'rgba(156, 39, 176, 0.05)',
                                            border: '1px solid rgba(156, 39, 176, 0.1)',
                                            '&:hover': {
                                              backgroundColor: 'rgba(156, 39, 176, 0.1)',
                                              transform: 'translateX(8px)'
                                            },
                                            transition: 'all 0.3s ease'
                                          }}
                                        >
                                          <ListItemIcon sx={{ minWidth: 40 }}>
                                            <Avatar sx={{ bgcolor: 'success.main', width: 28, height: 28 }}>
                                              <CheckCircleOutline sx={{ fontSize: 16 }} />
                                            </Avatar>
                                          </ListItemIcon>
                                          <ListItemText 
                                            primary={suggestion}
                                            sx={{
                                              '& .MuiListItemText-primary': {
                                                fontSize: '1.05rem',
                                                lineHeight: 1.6,
                                                fontWeight: 500
                                              }
                                            }}
                                          />
                                        </ListItem>
                                      ))}
                                    </List>
                                    <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(156, 39, 176, 0.05)', borderRadius: 2 }}>
                                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', textAlign: 'center' }}>
                                        💬 温馨提示：友善的沟通能够建立更好的人际关系，创造和谐的网络环境
                                      </Typography>
                                    </Box>
                                  </Paper>
                                </Grid>
                              </Grid>
                            </Box>
                          ) : (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                              <Avatar
                                sx={{
                                  bgcolor: 'success.main',
                                  mx: 'auto',
                                  mb: 3,
                                  width: 80,
                                  height: 80,
                                  boxShadow: '0 8px 32px rgba(76, 175, 80, 0.3)'
                                }}
                              >
                                <CheckCircleOutline sx={{ fontSize: 40 }} />
                              </Avatar>
                              <Typography variant="h4" fontWeight="bold" sx={{ mb: 2, color: 'success.main' }}>
                                🎉 检测通过！
                              </Typography>
                              <Typography variant="h6" sx={{ mb: 3, color: 'text.secondary' }}>
                                您的内容表达友善且积极正面
                              </Typography>
                              <Box sx={{ 
                                p: 3, 
                                borderRadius: 3,
                                background: 'linear-gradient(145deg, #e8f5e8 0%, #ffffff 100%)',
                                border: '2px solid #c8e6c9',
                                maxWidth: 500,
                                mx: 'auto'
                              }}>
                                <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
                                  ✨ 恭喜您！您的文本内容：
                                </Typography>
                                <List dense>
                                  <ListItem>
                                    <ListItemIcon sx={{ minWidth: 32 }}>
                                      <CheckCircleOutline color="success" sx={{ fontSize: 20 }} />
                                    </ListItemIcon>
                                    <ListItemText primary="语言表达友善温和" />
                                  </ListItem>
                                  <ListItem>
                                    <ListItemIcon sx={{ minWidth: 32 }}>
                                      <CheckCircleOutline color="success" sx={{ fontSize: 20 }} />
                                    </ListItemIcon>
                                    <ListItemText primary="情感倾向积极正面" />
                                  </ListItem>
                                  <ListItem>
                                    <ListItemIcon sx={{ minWidth: 32 }}>
                                      <CheckCircleOutline color="success" sx={{ fontSize: 20 }} />
                                    </ListItemIcon>
                                    <ListItemText primary="未发现敏感词汇" />
                                  </ListItem>
                                </List>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontStyle: 'italic', textAlign: 'center' }}>
                                  💚 感谢您为创造友善网络环境做出的贡献！
                                </Typography>
                              </Box>
                            </Box>
                          )}
                        </Paper>
                      </Slide>
                    )}
                  </Box>
                </Fade>
              )}
              
              {/* 资源与帮助标签页 */}
              {tabValue === 1 && (
                <Fade in timeout={600}>
                  <Box>
                    <Box sx={{ mb: 6, textAlign: 'center' }}>
                      <Avatar
                        sx={{
                          bgcolor: 'success.main',
                          mx: 'auto',
                          mb: 3,
                          width: 80,
                          height: 80,
                          boxShadow: '0 8px 32px rgba(76, 175, 80, 0.3)',
                          background: 'linear-gradient(135deg, #4caf50 0%, #81c784 100%)'
                        }}
                      >
                        <School sx={{ fontSize: 40 }} />
                      </Avatar>
                      <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ mb: 2 }}>
                        📚 帮助中心
                      </Typography>
                      <Box sx={{ 
                        mt: 3, 
                        p: 2, 
                        borderRadius: 3,
                        background: 'linear-gradient(145deg, #e8f5e8 0%, #ffffff 100%)',
                        border: '1px solid #c8e6c9',
                        maxWidth: 600,
                        mx: 'auto'
                      }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                          💡 我们致力于为每一位用户提供专业、及时的帮助与支持
                        </Typography>
                      </Box>
                    </Box>
                    
                    {resourcesError && (
                      <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                        {resourcesError}
                      </Alert>
                    )}
                    
                    {resourcesLoading ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', my: 6 }}>
                        <Box sx={{ textAlign: 'center' }}>
                          <CircularProgress size={60} thickness={4} />
                          <Typography variant="body1" sx={{ mt: 2 }} color="text.secondary">
                            正在加载资源...
                          </Typography>
                        </Box>
                      </Box>
                    ) : resources ? (
                      <Grid container spacing={4}>
                        <Grid item xs={12} lg={6}>
                          <Paper 
                            elevation={6}
                            sx={{ 
                              p: 4, 
                              height: '100%',
                              borderRadius: 4,
                              background: 'linear-gradient(145deg, #e3f2fd 0%, #ffffff 100%)',
                              border: '2px solid #bbdefb',
                              position: 'relative',
                              overflow: 'hidden',
                              '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: '4px',
                                background: 'linear-gradient(90deg, #2196f3 0%, #64b5f6 100%)'
                              },
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 12px 40px rgba(33, 150, 243, 0.2)'
                              },
                              transition: 'all 0.3s ease'
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                              <Avatar sx={{ 
                                bgcolor: 'info.main', 
                                mr: 2,
                                width: 56,
                                height: 56,
                                boxShadow: '0 4px 16px rgba(33, 150, 243, 0.3)'
                              }}>
                                <InfoOutlined sx={{ fontSize: 28 }} />
                              </Avatar>
                              <Box>
                                <Typography variant="h5" fontWeight="bold" sx={{ mb: 0.5 }}>
                                  🛡️ 应对策略指南
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  专业建议助您应对网络暴力
                                </Typography>
                              </Box>
                            </Box>
                            <Divider sx={{ mb: 3, borderColor: '#bbdefb' }} />
                            <List sx={{ '& .MuiListItem-root': { mb: 1 } }}>
                              {resources.suggestions?.map((suggestion, index) => (
                                <ListItem 
                                  key={index} 
                                  sx={{ 
                                    py: 2,
                                    px: 2,
                                    borderRadius: 2,
                                    backgroundColor: 'rgba(33, 150, 243, 0.04)',
                                    border: '1px solid rgba(33, 150, 243, 0.1)',
                                    '&:hover': {
                                      backgroundColor: 'rgba(33, 150, 243, 0.08)',
                                      transform: 'translateX(4px)'
                                    },
                                    transition: 'all 0.2s ease'
                                  }}
                                >
                                  <ListItemIcon sx={{ minWidth: 36 }}>
                                    <CheckCircleOutline color="success" sx={{ fontSize: 22 }} />
                                  </ListItemIcon>
                                  <ListItemText 
                                    primary={suggestion}
                                    sx={{
                                      '& .MuiListItemText-primary': {
                                        fontSize: '1.05rem',
                                        lineHeight: 1.6,
                                        fontWeight: 500
                                      }
                                    }}
                                  />
                                </ListItem>
                              ))}
                            </List>
                            <Box sx={{ 
                              mt: 3, 
                              p: 2, 
                              borderRadius: 2,
                              background: 'rgba(33, 150, 243, 0.06)',
                              border: '1px dashed #2196f3'
                            }}>
                              <Typography variant="body2" color="info.main" sx={{ fontWeight: 500, textAlign: 'center' }}>
                                💪 记住：您并不孤单，我们与您同在
                              </Typography>
                            </Box>
                          </Paper>
                        </Grid>
                        
                        <Grid item xs={12} lg={6}>
                          <Paper 
                            elevation={6}
                            sx={{ 
                              p: 4, 
                              height: '100%',
                              borderRadius: 4,
                              background: 'linear-gradient(145deg, #f3e5f5 0%, #ffffff 100%)',
                              border: '2px solid #e1bee7',
                              position: 'relative',
                              overflow: 'hidden',
                              '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: '4px',
                                background: 'linear-gradient(90deg, #9c27b0 0%, #ba68c8 100%)'
                              },
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 12px 40px rgba(156, 39, 176, 0.2)'
                              },
                              transition: 'all 0.3s ease'
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                              <Avatar sx={{ 
                                bgcolor: 'secondary.main', 
                                mr: 2,
                                width: 56,
                                height: 56,
                                boxShadow: '0 4px 16px rgba(156, 39, 176, 0.3)',
                                background: 'linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%)'
                              }}>
                                <Phone sx={{ fontSize: 28 }} />
                              </Avatar>
                              <Box>
                                <Typography variant="h5" fontWeight="bold" sx={{ mb: 0.5 }}>
                                  📞 紧急求助热线
                                </Typography>
                              </Box>
                            </Box>
                            <Divider sx={{ mb: 3, borderColor: '#e1bee7' }} />
                            <List sx={{ '& .MuiListItem-root': { mb: 2 } }}>
                              {resources.helplines?.map((helpline, index) => (
                                <ListItem 
                                  key={index} 
                                  sx={{ 
                                    py: 2.5,
                                    px: 3,
                                    borderRadius: 3,
                                    backgroundColor: 'rgba(156, 39, 176, 0.04)',
                                    border: '2px solid rgba(156, 39, 176, 0.1)',
                                    '&:hover': {
                                      backgroundColor: 'rgba(156, 39, 176, 0.08)',
                                      borderColor: 'rgba(156, 39, 176, 0.2)',
                                      transform: 'scale(1.02)'
                                    },
                                    transition: 'all 0.2s ease',
                                    cursor: 'pointer'
                                  }}
                                  onClick={() => window.open(`tel:${helpline.phone}`)}
                                >
                                  <ListItemIcon sx={{ minWidth: 40 }}>
                                    <Avatar sx={{ 
                                      bgcolor: 'secondary.main', 
                                      width: 32, 
                                      height: 32 
                                    }}>
                                      <Phone sx={{ fontSize: 18 }} />
                                    </Avatar>
                                  </ListItemIcon>
                                  <ListItemText
                                    primary={helpline.name}
                                    secondary={
                                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                        <Typography 
                                          component="span" 
                                          sx={{ 
                                            fontSize: '1.2rem',
                                            color: 'secondary.main',
                                            fontWeight: 'bold',
                                            mr: 1
                                          }}
                                        >
                                          {helpline.phone}
                                        </Typography>
                                        <Chip 
                                          label="点击拨打" 
                                          size="small" 
                                          color="secondary" 
                                          variant="outlined"
                                          sx={{ fontSize: '0.75rem' }}
                                        />
                                      </Box>
                                    }
                                    sx={{
                                      '& .MuiListItemText-primary': {
                                        fontSize: '1.1rem',
                                        fontWeight: 600,
                                        color: 'text.primary'
                                      }
                                    }}
                                  />
                                </ListItem>
                              ))}
                            </List>
                            <Box sx={{ 
                              mt: 3, 
                              p: 3, 
                              borderRadius: 3,
                              background: 'linear-gradient(145deg, rgba(156, 39, 176, 0.06) 0%, rgba(186, 104, 200, 0.06) 100%)',
                              border: '1px dashed #9c27b0',
                              textAlign: 'center'
                            }}>
                              <Typography variant="body2" color="secondary.main" sx={{ fontWeight: 600, mb: 1 }}>
                                🆘 紧急情况请立即拨打
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                所有热线均提供免费、保密的专业咨询服务
                              </Typography>
                            </Box>
                          </Paper>
                        </Grid>
                      </Grid>
                    ) : null}
                  </Box>
                </Fade>
              )}
              
              {/* 举报网络暴力标签页 */}
              {tabValue === 2 && (
                <Fade in timeout={600}>
                  <Box>
                    <Box sx={{ mb: 6, textAlign: 'center' }}>
                      <Avatar
                        sx={{
                          bgcolor: 'error.main',
                          mx: 'auto',
                          mb: 3,
                          width: 80,
                          height: 80,
                          boxShadow: '0 8px 32px rgba(244, 67, 54, 0.3)',
                          background: 'linear-gradient(135deg, #f44336 0%, #ef5350 100%)'
                        }}
                      >
                        <Report sx={{ fontSize: 40 }} />
                      </Avatar>
                      <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ mb: 2 }}>
                        🚨 网络暴力举报平台
                      </Typography>
                      <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto', lineHeight: 1.6, mb: 2 }}>
                        勇敢举报，共建和谐网络环境
                      </Typography>
                      <Box sx={{ 
                        p: 2, 
                        borderRadius: 3,
                        background: 'linear-gradient(145deg, #ffebee 0%, #ffffff 100%)',
                        border: '1px solid #ffcdd2',
                        maxWidth: 600,
                        mx: 'auto'
                      }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                          💡 您的每一次举报都是对网络暴力的有力回击
                        </Typography>
                      </Box>
                    </Box>
                    
                    {reportSuccess && (
                      <Zoom in>
                        <Alert 
                          severity="success" 
                          sx={{ 
                            mb: 3,
                            borderRadius: 2,
                            fontSize: '1rem'
                          }}
                        >
                          举报已成功提交，我们将在24小时内处理
                        </Alert>
                      </Zoom>
                    )}
                    
                    {reportError && (
                      <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                        {reportError}
                      </Alert>
                    )}
                    
                    {!isAuthenticated && (
                      <Alert 
                        severity="warning" 
                        sx={{ mb: 3, borderRadius: 2 }}
                        action={
                          <Button 
                            component={RouterLink} 
                            to="/login" 
                            color="inherit" 
                            size="small"
                          >
                            立即登录
                          </Button>
                        }
                      >
                        请先登录后再进行举报操作
                      </Alert>
                    )}

                    <Paper 
                      elevation={6}
                      sx={{ 
                        p: 5,
                        borderRadius: 4,
                        background: 'linear-gradient(145deg, #fafafa 0%, #ffffff 100%)',
                        border: '2px solid #ffcdd2',
                        opacity: isAuthenticated ? 1 : 0.6,
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: '4px',
                          background: 'linear-gradient(90deg, #f44336 0%, #ef5350 100%)'
                        }
                      }}
                    >
                      <form onSubmit={handleReportSubmit}>
                        <Grid container spacing={4}>
                          <Grid item xs={12}>
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="h6" fontWeight="bold" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                                📝 详细描述
                                <Chip label="必填" size="small" color="error" sx={{ ml: 1, fontSize: '0.7rem' }} />
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                请详细描述您遭遇或发现的网络暴力内容，包括具体行为、时间、地点等信息
                              </Typography>
                            </Box>
                            <TextField
                              required
                              fullWidth
                              multiline
                              rows={6}
                              label="网络暴力内容描述"
                              placeholder="例如：在某平台上，用户XXX对我进行了人身攻击，使用了侮辱性词汇..."
                              name="content"
                              value={reportForm.content}
                              onChange={handleReportFormChange}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 3,
                                  backgroundColor: 'rgba(244, 67, 54, 0.02)',
                                  border: '2px solid rgba(244, 67, 54, 0.1)',
                                  '&:hover': {
                                    borderColor: 'rgba(244, 67, 54, 0.2)'
                                  },
                                  '&.Mui-focused': {
                                    borderColor: 'error.main',
                                    backgroundColor: 'rgba(244, 67, 54, 0.04)'
                                  }
                                },
                                '& .MuiInputLabel-root': {
                                  fontWeight: 500
                                }
                              }}
                            />
                          </Grid>
                          
                          <Grid item xs={12} sm={6}>
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="h6" fontWeight="bold" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                                🏷️ 暴力类型
                                <Chip label="必填" size="small" color="error" sx={{ ml: 1, fontSize: '0.7rem' }} />
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                请选择最符合的网络暴力类型
                              </Typography>
                            </Box>
                            <TextField
                              required
                              fullWidth
                              select
                              label="暴力类型"
                              name="type"
                              value={reportForm.type}
                              onChange={handleReportFormChange}
                              SelectProps={{
                                native: true
                              }}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 3,
                                  backgroundColor: 'rgba(244, 67, 54, 0.02)',
                                  border: '2px solid rgba(244, 67, 54, 0.1)',
                                  '&:hover': {
                                    borderColor: 'rgba(244, 67, 54, 0.2)'
                                  },
                                  '&.Mui-focused': {
                                    borderColor: 'error.main'
                                  }
                                },
                                '& .MuiInputLabel-root': {
                                  fontWeight: 500
                                }
                              }}
                            >
                              <option value="">请选择暴力类型</option>
                              <option value="网络霸凌">🎯 网络霸凌</option>
                              <option value="网络骚扰">📱 网络骚扰</option>
                              <option value="网络诽谤">💬 网络诽谤</option>
                              <option value="网络侮辱">😡 网络侮辱</option>
                              <option value="网络威胁">⚠️ 网络威胁</option>
                              <option value="其他">📋 其他</option>
                            </TextField>
                          </Grid>
                          
                          <Grid item xs={12} sm={6}>
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="h6" fontWeight="bold" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                                🌐 发生平台
                                <Chip label="选填" size="small" color="info" sx={{ ml: 1, fontSize: '0.7rem' }} />
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                网络暴力发生的具体平台或应用
                              </Typography>
                            </Box>
                            <TextField
                              fullWidth
                              label="发生平台"
                              placeholder="如：微博、微信、QQ、抖音、知乎等"
                              name="platform"
                              value={reportForm.platform}
                              onChange={handleReportFormChange}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 3,
                                  backgroundColor: 'rgba(33, 150, 243, 0.02)',
                                  border: '2px solid rgba(33, 150, 243, 0.1)',
                                  '&:hover': {
                                    borderColor: 'rgba(33, 150, 243, 0.2)'
                                  },
                                  '&.Mui-focused': {
                                    borderColor: 'info.main'
                                  }
                                },
                                '& .MuiInputLabel-root': {
                                  fontWeight: 500
                                }
                              }}
                            />
                          </Grid>
                          
                          <Grid item xs={12}>
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="h6" fontWeight="bold" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                                🔗 相关证据
                                <Chip label="选填" size="small" color="warning" sx={{ ml: 1, fontSize: '0.7rem' }} />
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                提供相关链接、截图或其他证据材料（有助于快速处理）
                              </Typography>
                            </Box>
                            <TextField
                              fullWidth
                              label="相关链接或截图"
                              placeholder="如：https://weibo.com/xxx 或 已保存截图到本地"
                              name="url"
                              value={reportForm.url}
                              onChange={handleReportFormChange}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 3,
                                  backgroundColor: 'rgba(255, 152, 0, 0.02)',
                                  border: '2px solid rgba(255, 152, 0, 0.1)',
                                  '&:hover': {
                                    borderColor: 'rgba(255, 152, 0, 0.2)'
                                  },
                                  '&.Mui-focused': {
                                    borderColor: 'warning.main'
                                  }
                                },
                                '& .MuiInputLabel-root': {
                                  fontWeight: 500
                                }
                              }}
                            />
                          </Grid>
                          
                          <Grid item xs={12}>
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="h6" fontWeight="bold" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                                📄 补充说明
                                <Chip label="选填" size="small" color="success" sx={{ ml: 1, fontSize: '0.7rem' }} />
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                提供更多背景信息、事件时间、对您的影响等详细说明
                              </Typography>
                            </Box>
                            <TextField
                              fullWidth
                              multiline
                              rows={4}
                              label="补充说明"
                              placeholder="如：事件发生时间、对我造成的心理影响、之前是否有过类似经历等..."
                              name="description"
                              value={reportForm.description}
                              onChange={handleReportFormChange}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 3,
                                  backgroundColor: 'rgba(76, 175, 80, 0.02)',
                                  border: '2px solid rgba(76, 175, 80, 0.1)',
                                  '&:hover': {
                                    borderColor: 'rgba(76, 175, 80, 0.2)'
                                  },
                                  '&.Mui-focused': {
                                    borderColor: 'success.main'
                                  }
                                },
                                '& .MuiInputLabel-root': {
                                  fontWeight: 500
                                }
                              }}
                            />
                          </Grid>
                          
                          <Grid item xs={12} sx={{ textAlign: 'center', mt: 4 }}>
                            <Box sx={{ mb: 3 }}>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                💡 提交前请确认信息准确无误
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                我们将在24小时内处理您的举报，并通过邮件通知处理结果
                              </Typography>
                            </Box>
                            <Button
                              type="submit"
                              variant="contained"
                              size="large"
                              disabled={!reportForm.content.trim() || reportLoading || !isAuthenticated}
                              startIcon={reportLoading ? <CircularProgress size={24} color="inherit" /> : <Report />}
                              sx={{
                                px: 6,
                                py: 2,
                                borderRadius: 4,
                                fontSize: '1.2rem',
                                fontWeight: 'bold',
                                textTransform: 'none',
                                background: 'linear-gradient(45deg, #f44336 30%, #e57373 90%)',
                                boxShadow: '0 6px 20px rgba(244, 67, 54, 0.3)',
                                position: 'relative',
                                overflow: 'hidden',
                                '&::before': {
                                  content: '""',
                                  position: 'absolute',
                                  top: 0,
                                  left: '-100%',
                                  width: '100%',
                                  height: '100%',
                                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                                  transition: 'left 0.5s'
                                },
                                '&:hover': {
                                  background: 'linear-gradient(45deg, #d32f2f 30%, #f44336 90%)',
                                  transform: 'translateY(-2px)',
                                  boxShadow: '0 8px 25px rgba(244, 67, 54, 0.4)',
                                  '&::before': {
                                    left: '100%'
                                  }
                                },
                                '&:disabled': {
                                  background: 'rgba(0, 0, 0, 0.12)',
                                  boxShadow: 'none',
                                  transform: 'none'
                                },
                                transition: 'all 0.3s ease'
                              }}
                            >
                              {reportLoading ? '正在提交举报...' : '🚀 提交举报'}
                            </Button>
                              
                            <Box sx={{ mt: 3, textAlign: 'center' }}>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                或者您也可以前往官方举报平台
                              </Typography>
                              <Button
                                variant="outlined"
                                size="large"
                                startIcon={<Launch />}
                                onClick={() => window.open('https://ts.isc.org.cn/', '_blank')}
                                sx={{
                                  px: 5,
                                  py: 1.5,
                                  borderRadius: 4,
                                  fontSize: '1.1rem',
                                  fontWeight: 'bold',
                                  textTransform: 'none',
                                  borderColor: 'primary.main',
                                  color: 'primary.main',
                                  border: '2px solid',
                                  position: 'relative',
                                  overflow: 'hidden',
                                  '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: '-100%',
                                    width: '100%',
                                    height: '100%',
                                    background: 'linear-gradient(90deg, transparent, rgba(25, 118, 210, 0.1), transparent)',
                                    transition: 'left 0.5s'
                                  },
                                  '&:hover': {
                                    borderColor: 'primary.dark',
                                    bgcolor: 'primary.main',
                                    color: 'white',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 8px 25px rgba(25, 118, 210, 0.3)',
                                    '&::before': {
                                      left: '100%'
                                    }
                                  },
                                  transition: 'all 0.3s ease'
                                }}
                              >
                                🌐 官方举报平台
                              </Button>
                            </Box>
                          </Grid>
                        </Grid>
                      </form>
                    </Paper>
                  </Box>
                </Fade>
              )}
            </Box>
          </Paper>
        </Slide>
      </Container>

      {/* 成功对话框 */}
      <Dialog
        open={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            p: 3,
            background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.05) 0%, rgba(129, 199, 132, 0.05) 100%)',
            border: '1px solid rgba(76, 175, 80, 0.1)'
          }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 2 }}>
          <Avatar
            sx={{
              bgcolor: 'success.main',
              mx: 'auto',
              mb: 3,
              width: 80,
              height: 80,
              boxShadow: '0 8px 25px rgba(76, 175, 80, 0.3)',
              background: 'linear-gradient(45deg, #4caf50 30%, #81c784 90%)'
            }}
          >
            <CheckCircleOutline sx={{ fontSize: 40 }} />
          </Avatar>
          <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
            🎉 举报提交成功
          </Typography>
          <Typography variant="subtitle1" color="success.main" fontWeight="medium">
            您的勇敢行为值得赞扬
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center' }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
              感谢您的举报，我们将在 <strong>24小时内</strong> 进行处理。
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              您的勇敢举报有助于维护健康的网络环境，让互联网变得更加美好。
            </Typography>
            <Box sx={{ 
              p: 2, 
              bgcolor: 'rgba(76, 175, 80, 0.1)', 
              borderRadius: 2,
              border: '1px solid rgba(76, 175, 80, 0.2)'
            }}>
              <Typography variant="body2" color="success.dark">
                💌 处理结果将通过邮件通知您
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button
            onClick={() => setShowSuccessDialog(false)}
            variant="contained"
            size="large"
            sx={{ 
              px: 6, 
              py: 1.5,
              borderRadius: 3,
              fontSize: '1.1rem',
              fontWeight: 'bold',
              textTransform: 'none',
              background: 'linear-gradient(45deg, #4caf50 30%, #81c784 90%)',
              boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)',
              '&:hover': {
                boxShadow: '0 6px 20px rgba(76, 175, 80, 0.4)',
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            ✨ 确定
          </Button>
        </DialogActions>
      </Dialog>

      {/* 消息提示 */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{
          '& .MuiSnackbarContent-root': {
            minWidth: '300px'
          }
        }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          variant="filled"
          sx={{ 
            width: '100%',
            borderRadius: 3,
            fontSize: '1rem',
            fontWeight: 'medium',
            boxShadow: '0 8px 25px rgba(76, 175, 80, 0.3)',
            background: 'linear-gradient(45deg, #4caf50 30%, #81c784 90%)',
            '& .MuiAlert-icon': {
              fontSize: 28,
              color: '#fff'
            },
            '& .MuiAlert-message': {
              color: '#fff',
              display: 'flex',
              alignItems: 'center'
            },
            '& .MuiAlert-action': {
              '& .MuiIconButton-root': {
                color: '#fff',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }
              }
            }
          }}
        >
          ✨ {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* 抱抱动画弹窗 */}
      <Dialog
        open={showHugAnimation}
        onClose={() => setShowHugAnimation(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
            textAlign: 'center',
            p: 2
          }
        }}
      >
        <DialogContent>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2
            }}
          >
            {/* 抱抱表情动画 */}
            <Box
              sx={{
                fontSize: '80px',
                animation: `${hugAnimation} 1.5s ease-out`,
                '&:hover': {
                  animation: `${heartFloat} 2s ease-in-out infinite`
                }
              }}
            >
              🤗
            </Box>
            
            {/* 温暖的文字 */}
            <Typography
              variant="h5"
              sx={{
                color: '#fff',
                fontWeight: 'bold',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                mb: 1
              }}
            >
              给你一个温暖的拥抱
            </Typography>
            
            <Typography
              variant="body1"
              sx={{
                color: '#fff',
                opacity: 0.9,
                textShadow: '0 1px 2px rgba(0,0,0,0.3)'
              }}
            >
              在这里，你不是一个人在战斗 💕
            </Typography>
            
            {/* 漂浮的小心心 */}
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                mt: 1
              }}
            >
              {['💖', '💝', '💗'].map((heart, index) => (
                <Box
                  key={index}
                  sx={{
                    fontSize: '20px',
                    animation: `${heartFloat} 2s ease-in-out infinite`,
                    animationDelay: `${index * 0.3}s`
                  }}
                >
                  {heart}
                </Box>
              ))}
            </Box>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button
            onClick={() => setShowHugAnimation(false)}
            variant="contained"
            sx={{
              background: 'rgba(255,255,255,0.9)',
              color: '#ff6b9d',
              fontWeight: 'bold',
              borderRadius: 3,
              px: 4,
              '&:hover': {
                background: 'rgba(255,255,255,1)',
                transform: 'scale(1.05)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            收到啦 ❤️
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AntiViolencePage;