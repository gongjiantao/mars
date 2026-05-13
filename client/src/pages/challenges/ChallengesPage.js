import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createApiUrl, API_ENDPOINTS } from '../../config/api';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Paper,
  Avatar,
  IconButton,
  Fade,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Fab,
  FormControl,
  InputLabel,
  Select,
  FormHelperText
} from '@mui/material';
import {
  EmojiEvents,
  AccessTime,
  People,
  ArrowForward,
  Refresh,
  TrendingUp,
  Star,
  LocalFireDepartment,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Remove as RemoveIcon
} from '@mui/icons-material';
import { isAdmin } from '../../utils/permissions';
import { format, isAfter, isBefore } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { fetchChallenges, fetchCurrentChallenge, clearError } from '../../store/slices/challengeSlice';

const ChallengesPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { 
    challenges, 
    currentChallenge, 
    loading, 
    error, 
    pagination 
  } = useSelector(state => state.challenge);
  const user = useSelector(state => state.auth.user);
  
  const [filter, setFilter] = useState('active');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedChallengeId, setSelectedChallengeId] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newChallenge, setNewChallenge] = useState({
    title: '',
    description: '',
    theme: '',
    startDate: '',
    endDate: '',
    prizes: [{ rank: '', description: '', count: 1 }],
    rules: ''
  });

  useEffect(() => {
    dispatch(fetchCurrentChallenge());
    dispatch(fetchChallenges({ status: filter }));
  }, [dispatch, filter]);

  const handleRefresh = () => {
    dispatch(clearError());
    dispatch(fetchCurrentChallenge());
    dispatch(fetchChallenges({ status: filter }));
  };

  // 管理员菜单处理函数
  const handleMenuOpen = (event, challengeId) => {
    setAnchorEl(event.currentTarget);
    setSelectedChallengeId(challengeId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedChallengeId(null);
  };

  const handleDeleteChallenge = async () => {
    try {
      const response = await fetch(createApiUrl(API_ENDPOINTS.CHALLENGES.DELETE(selectedChallengeId)), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        dispatch(fetchChallenges({ status: filter }));
        handleMenuClose();
      }
    } catch (error) {
      console.error('删除挑战赛失败:', error);
    }
  };

  // 发布挑战赛对话框处理函数
  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setNewChallenge({
      title: '',
      description: '',
      theme: '',
      startDate: '',
      endDate: '',
      prizes: [{ rank: '', description: '', count: 1 }],
      rules: ''
    });
  };

  const handleInputChange = (field, value) => {
    setNewChallenge(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 奖项管理函数
  const handlePrizeChange = (index, field, value) => {
    setNewChallenge(prev => ({
      ...prev,
      prizes: prev.prizes.map((prize, i) => 
        i === index ? { ...prize, [field]: value } : prize
      )
    }));
  };

  const addPrize = () => {
    setNewChallenge(prev => ({
      ...prev,
      prizes: [...prev.prizes, { rank: '', description: '', count: 1 }]
    }));
  };

  const removePrize = (index) => {
    if (newChallenge.prizes.length > 1) {
      setNewChallenge(prev => ({
        ...prev,
        prizes: prev.prizes.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmitChallenge = async () => {
    console.log('开始发布挑战赛，数据:', newChallenge);
    
    // 验证必填字段
    if (!newChallenge.title || !newChallenge.description || !newChallenge.theme || !newChallenge.startDate || !newChallenge.endDate) {
      alert('请填写所有必填字段（标题、描述、主题、开始日期、结束日期）');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      console.log('Token存在:', !!token);
      console.log('Token前10个字符:', token ? token.substring(0, 10) : 'null');
      console.log('发送请求到服务器...');
      const response = await fetch(createApiUrl(API_ENDPOINTS.CHALLENGES.CREATE), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newChallenge)
      });
      
      console.log('服务器响应状态:', response.status);
      
      if (response.ok) {
        console.log('发布成功');
        dispatch(fetchChallenges({ status: filter }));
        handleDialogClose();
        alert('挑战赛发布成功！');
      } else {
        const errorData = await response.json();
        console.error('发布挑战赛失败:', errorData);
        alert(`发布失败: ${errorData.message || '未知错误'}`);
      }
    } catch (error) {
       console.error('发布挑战赛失败:', error);
       alert('发布失败: 网络错误或服务器无响应');
     }
   };

  const getChallengeStatus = (challenge) => {
    const now = new Date();
    const startDate = new Date(challenge.startDate);
    const endDate = new Date(challenge.endDate);

    if (isBefore(now, startDate)) {
      return { status: 'upcoming', label: '即将开始', color: 'info' };
    } else if (isAfter(now, endDate)) {
      return { status: 'ended', label: '已结束', color: 'default' };
    } else {
      return { status: 'active', label: '进行中', color: 'success' };
    }
  };

  const formatDateRange = (startDate, endDate) => {
    const start = format(new Date(startDate), 'MM月dd日', { locale: zhCN });
    const end = format(new Date(endDate), 'MM月dd日', { locale: zhCN });
    return `${start} - ${end}`;
  };

  if (loading && challenges.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* 页面标题 */}
      <Box 
        sx={{ 
          mb: 6, 
          textAlign: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 4,
          py: 6,
          px: 4,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: 0.3
          }
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography 
            variant="h2" 
            component="h1" 
            gutterBottom 
            sx={{ 
              fontWeight: 800, 
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              mb: 2
            }}
          >
            🏆 挑战赛
          </Typography>
          <Typography 
            variant="h5" 
            sx={{ 
              opacity: 0.95,
              fontSize: { xs: '1.1rem', md: '1.3rem' },
              fontWeight: 500,
              textShadow: '0 1px 2px rgba(0,0,0,0.2)',
              mb: 4
            }}
          >
            静待世界在看不见的地方，花开遍地。🌸
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant={filter === 'active' ? 'contained' : 'outlined'}
              onClick={() => setFilter('active')}
              startIcon={<LocalFireDepartment />}
              sx={{
                bgcolor: filter === 'active' ? 'rgba(255,255,255,0.2)' : 'transparent',
                color: 'white',
                borderColor: 'rgba(255,255,255,0.5)',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.3)',
                  borderColor: 'rgba(255,255,255,0.8)'
                },
                fontWeight: 600,
                px: 3
              }}
            >
              进行中
            </Button>
            <Button
              variant={filter === 'all' ? 'contained' : 'outlined'}
              onClick={() => setFilter('all')}
              startIcon={<Star />}
              sx={{
                bgcolor: filter === 'all' ? 'rgba(255,255,255,0.2)' : 'transparent',
                color: 'white',
                borderColor: 'rgba(255,255,255,0.5)',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.3)',
                  borderColor: 'rgba(255,255,255,0.8)'
                },
                fontWeight: 600,
                px: 3
              }}
            >
              全部挑战
            </Button>
            <IconButton 
              onClick={handleRefresh} 
              sx={{
                color: 'white',
                bgcolor: 'rgba(255,255,255,0.1)',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.2)'
                }
              }}
            >
              <Refresh />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => dispatch(clearError())}>
          {error}
        </Alert>
      )}

      {currentChallenge && (
        <Fade in={true}>
          <Paper
            elevation={12}
            sx={{
              mb: 6,
              p: 0,
              background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 50%, #ff9ff3 100%)',
              borderRadius: 4,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'url("data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Cpath d="M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z"/%3E%3C/g%3E%3C/svg%3E")',
                opacity: 0.3
              }
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1, p: 5, color: 'white' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: '50%',
                    bgcolor: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <EmojiEvents sx={{ fontSize: 48, color: '#FFD700' }} />
                </Box>
                <Box sx={{ flex: 1, minWidth: '200px' }}>
                  <Typography
                    variant="h3"
                    component="h2"
                    sx={{
                      fontWeight: 900,
                      mb: 2,
                      fontSize: { xs: '1.8rem', md: '2.5rem' },
                      textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                      lineHeight: 1.2
                    }}
                  >
                    {currentChallenge.title}
                  </Typography>
                  <Chip
                    label="本月挑战"
                    sx={{
                      fontWeight: 'bold',
                      fontSize: '0.9rem',
                      px: 2,
                      py: 1,
                      bgcolor: 'rgba(76, 175, 80, 0.9)',
                      color: 'white',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                      '&:hover': {
                        transform: 'scale(1.05)'
                      },
                      transition: 'transform 0.2s ease'
                    }}
                  />
                </Box>
              </Box>
              
              <Typography
                variant="body1"
                sx={{
                  mb: 4,
                  fontSize: { xs: '1rem', md: '1.2rem' },
                  lineHeight: 1.7,
                  opacity: 0.95,
                  textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                }}
              >
                {currentChallenge.description}
              </Typography>
              
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={4}>
                  <Paper
                    elevation={0}
                    sx={{
                      textAlign: 'center',
                      p: 3,
                      bgcolor: 'rgba(255,255,255,0.15)',
                      borderRadius: 3,
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        bgcolor: 'rgba(255,255,255,0.2)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <AccessTime sx={{ fontSize: 36, mb: 2, color: '#FFD700' }} />
                    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1, color: 'white' }}>
                      {formatDateRange(currentChallenge.startDate, currentChallenge.endDate)}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, color: 'white', fontWeight: 500 }}>
                      挑战时间
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Paper
                    elevation={0}
                    sx={{
                      textAlign: 'center',
                      p: 3,
                      bgcolor: 'rgba(255,255,255,0.15)',
                      borderRadius: 3,
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        bgcolor: 'rgba(255,255,255,0.2)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <People sx={{ fontSize: 36, mb: 2, color: '#FFD700' }} />
                    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1, color: 'white' }}>
                      {currentChallenge.currentSubmissions} 人
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, color: 'white', fontWeight: 500 }}>
                      参与人数
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Paper
                    elevation={0}
                    sx={{
                      textAlign: 'center',
                      p: 3,
                      bgcolor: 'rgba(255,255,255,0.15)',
                      borderRadius: 3,
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        bgcolor: 'rgba(255,255,255,0.2)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <TrendingUp sx={{ fontSize: 36, mb: 2, color: '#FFD700' }} />
                    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1, color: 'white' }}>
                      {getChallengeStatus(currentChallenge).label}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, color: 'white', fontWeight: 500 }}>
                      挑战状态
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
              
              <Box sx={{ textAlign: 'center' }}>
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForward />}
                  onClick={() => navigate(`/challenges/${currentChallenge._id}`)}
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                    color: '#333',
                    fontWeight: 'bold',
                    px: 5,
                    py: 2,
                    fontSize: '1.2rem',
                    borderRadius: 3,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                    '&:hover': {
                      bgcolor: 'white',
                      transform: 'translateY(-3px)',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.4)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  立即参与挑战
                </Button>
              </Box>
            </Box>
          </Paper>
        </Fade>
      )}

      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', mb: 2 }}>
          {filter === 'active' ? '进行中的挑战' : '所有挑战'}
        </Typography>
        <Divider sx={{ mb: 3 }} />
      </Box>

      {challenges.length === 0 ? (
        <Paper 
          elevation={0}
          sx={{ 
            p: 8, 
            textAlign: 'center',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            borderRadius: 4,
            border: '1px solid rgba(102, 126, 234, 0.1)'
          }}
        >
          <Box
            sx={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
              boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
            }}
          >
            <EmojiEvents sx={{ fontSize: 60, color: 'white' }} />
          </Box>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 'bold',
              mb: 2,
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            暂无挑战赛
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
            敬请期待即将到来的精彩挑战！
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={4}>
            {challenges.map((challenge) => {
              const statusInfo = getChallengeStatus(challenge);
              return (
                <Grid item xs={12} sm={6} lg={4} key={challenge._id}>
                  <Fade in={true}>
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        cursor: 'pointer',
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        borderRadius: 4,
                        overflow: 'hidden',
                        position: 'relative',
                        background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
                        border: '1px solid rgba(102, 126, 234, 0.1)',
                        '&:hover': {
                          transform: 'translateY(-12px) scale(1.02)',
                          boxShadow: '0 20px 60px rgba(102, 126, 234, 0.25)',
                          '& .challenge-image': {
                            transform: 'scale(1.1)'
                          },
                          '& .challenge-overlay': {
                            opacity: 1
                          }
                        }
                      }}
                      onClick={() => navigate(`/challenges/${challenge._id}`)}
                    >
                      <Box sx={{ position: 'relative', overflow: 'hidden', height: 220 }}>
                        <Box 
                          className="challenge-image"
                          sx={{
                            height: '100%',
                            background: `linear-gradient(135deg, 
                              ${statusInfo.status === 'active' ? '#4CAF50, #2196F3' : 
                                statusInfo.status === 'upcoming' ? '#FF9800, #F44336' : 
                                '#9E9E9E, #607D8B'})`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'transform 0.4s ease',
                            position: 'relative'
                          }}
                        >
                          <EmojiEvents sx={{ fontSize: 80, color: 'rgba(255,255,255,0.8)', zIndex: 2 }} />
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                              opacity: 0.3
                            }}
                          />
                        </Box>
                        <Box 
                          className="challenge-overlay"
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'linear-gradient(45deg, rgba(102, 126, 234, 0.9), rgba(118, 75, 162, 0.9))',
                            opacity: 0,
                            transition: 'opacity 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 3
                          }}
                        >
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              color: 'white', 
                              fontWeight: 'bold',
                              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                            }}
                          >
                            查看详情
                          </Typography>
                        </Box>
                      </Box>
                      
                      <CardContent sx={{ flexGrow: 1, p: 4 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                          <Typography 
                            variant="h5" 
                            component="h3" 
                            sx={{ 
                              fontWeight: 800,
                              background: 'linear-gradient(45deg, #667eea, #764ba2)',
                              backgroundClip: 'text',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              lineHeight: 1.3,
                              flex: 1,
                              mr: 2,
                              fontSize: '1.3rem'
                            }}
                          >
                            {challenge.title}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip 
                              label={statusInfo.label}
                              size="medium"
                              sx={{ 
                                fontWeight: 'bold',
                                minWidth: '80px',
                                bgcolor: statusInfo.status === 'active' ? '#4CAF50' : 
                                        statusInfo.status === 'upcoming' ? '#FF9800' : '#9E9E9E',
                                color: 'white',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                '&:hover': {
                                  transform: 'scale(1.05)'
                                },
                                transition: 'transform 0.2s ease'
                              }}
                            />
                            {isAdmin(user) && (
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMenuOpen(e, challenge._id);
                                }}
                                sx={{ 
                                  p: 1,
                                  bgcolor: 'rgba(102, 126, 234, 0.1)',
                                  '&:hover': {
                                    bgcolor: 'rgba(102, 126, 234, 0.2)'
                                  }
                                }}
                              >
                                <MoreVertIcon fontSize="small" />
                              </IconButton>
                            )}
                          </Box>
                        </Box>
                        
                        <Typography 
                          variant="body1" 
                          color="text.secondary" 
                          sx={{ 
                            mb: 3,
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            lineHeight: 1.6,
                            fontSize: '0.95rem'
                          }}
                        >
                          {challenge.description}
                        </Typography>
                        
                        <Box sx={{ mb: 3 }}>
                          <Paper 
                            elevation={0}
                            sx={{
                              p: 2,
                              bgcolor: 'rgba(102, 126, 234, 0.05)',
                              borderRadius: 2,
                              border: '1px solid rgba(102, 126, 234, 0.1)'
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <AccessTime sx={{ fontSize: 18, color: '#667eea' }} />
                              <Typography variant="body2" sx={{ fontWeight: 600, color: '#667eea' }}>
                                挑战时间
                              </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                              {formatDateRange(challenge.startDate, challenge.endDate)}
                            </Typography>
                          </Paper>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: '#667eea' }}>
                              <People sx={{ fontSize: 18 }} />
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#667eea' }}>
                                {challenge.currentSubmissions || 0}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                参与者
                              </Typography>
                            </Box>
                          </Box>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar 
                              src={challenge.createdBy?.avatar} 
                              sx={{ 
                                width: 32, 
                                height: 32,
                                bgcolor: 'linear-gradient(45deg, #667eea, #764ba2)',
                                fontSize: '0.9rem',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                '&:hover': {
                                  transform: 'scale(1.05)',
                                  transition: 'transform 0.2s'
                                }
                              }}
                              onClick={() => navigate(`/profile/${challenge.createdBy?.username}`)}
                            >
                              {challenge.createdBy?.username?.[0]}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#333' }}>
                                {challenge.createdBy?.username}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                发起人
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Fade>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}

      {/* 分页 */}
      {pagination.totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button
            variant="outlined"
            onClick={() => {
              if (pagination.page < pagination.totalPages) {
                dispatch(fetchChallenges({ 
                  page: pagination.page + 1, 
                  status: filter 
                }));
              }
            }}
            disabled={pagination.page >= pagination.totalPages || loading}
          >
            {loading ? <CircularProgress size={20} /> : '加载更多'}
          </Button>
        </Box>
      )}

      {/* 管理员发布挑战赛浮动按钮 */}
      {isAdmin(user) && (
        <Fab
          color="primary"
          aria-label="发布挑战赛"
          onClick={handleDialogOpen}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 1000
          }}
        >
          <AddIcon />
        </Fab>
      )}

      {/* 管理员菜单 */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleDeleteChallenge}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>删除挑战赛</ListItemText>
        </MenuItem>
      </Menu>

      {/* 发布挑战赛对话框 */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleDialogClose} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
            boxShadow: '0 24px 80px rgba(102, 126, 234, 0.25)'
          }
        }}
      >
        <DialogTitle 
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            textAlign: 'center',
            py: 3,
            fontSize: '1.5rem',
            fontWeight: 'bold',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'url("data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Cpath d="M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z"/%3E%3C/g%3E%3C/svg%3E")',
              opacity: 0.3
            }
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <EmojiEvents sx={{ fontSize: 32 }} />
            🚀 发布新挑战赛
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#667eea' }}>
              📝 基本信息
            </Typography>
            <TextField
              autoFocus
              label="挑战赛标题"
              fullWidth
              variant="outlined"
              value={newChallenge.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: '#667eea'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#667eea'
                  }
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#667eea'
                }
              }}
              placeholder="为你的挑战赛起一个吸引人的标题"
            />
            <TextField
              label="挑战赛描述"
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              value={newChallenge.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: '#667eea'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#667eea'
                  }
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#667eea'
                }
              }}
              placeholder="详细描述挑战赛的目标、意义和参与方式"
            />
            <TextField
              label="挑战赛主题"
              fullWidth
              variant="outlined"
              value={newChallenge.theme}
              onChange={(e) => handleInputChange('theme', e.target.value)}
              sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: '#667eea'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#667eea'
                  }
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#667eea'
                }
              }}
              placeholder="例如：环保行动、社区服务、教育支持、科技创新等"
            />
          </Box>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#667eea' }}>
              📅 时间安排
            </Typography>
            <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
              <TextField
                label="开始日期"
                type="date"
                fullWidth
                variant="outlined"
                value={newChallenge.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: '#667eea'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea'
                    }
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#667eea'
                  }
                }}
              />
              <TextField
                label="结束日期"
                type="date"
                fullWidth
                variant="outlined"
                value={newChallenge.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: '#667eea'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea'
                    }
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#667eea'
                  }
                }}
              />
            </Box>
          </Box>
          {/* 奖项设置 */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#667eea' }}>
              🏆 奖项设置
            </Typography>
            {newChallenge.prizes.map((prize, index) => (
              <Paper 
                key={index} 
                elevation={0}
                sx={{ 
                  mb: 3, 
                  p: 3, 
                  border: '2px solid rgba(102, 126, 234, 0.1)', 
                  borderRadius: 3,
                  background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
                  position: 'relative',
                  '&:hover': {
                    borderColor: 'rgba(102, 126, 234, 0.3)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.15)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#667eea' }}>
                    🥇 奖项 {index + 1}
                  </Typography>
                  {newChallenge.prizes.length > 1 && (
                    <IconButton
                      size="small"
                      onClick={() => removePrize(index)}
                      sx={{
                        color: '#ff4757',
                        bgcolor: 'rgba(255, 71, 87, 0.1)',
                        '&:hover': {
                          bgcolor: 'rgba(255, 71, 87, 0.2)',
                          transform: 'scale(1.1)'
                        },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <RemoveIcon />
                    </IconButton>
                  )}
                </Box>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="奖项等级"
                      variant="outlined"
                      value={prize.rank}
                      onChange={(e) => handlePrizeChange(index, 'rank', e.target.value)}
                      placeholder="如：一等奖、金奖等"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': {
                            borderColor: '#667eea'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#667eea'
                          }
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#667eea'
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="奖项描述"
                      variant="outlined"
                      value={prize.description}
                      onChange={(e) => handlePrizeChange(index, 'description', e.target.value)}
                      placeholder="如：现金奖励1000元、荣誉证书等"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': {
                            borderColor: '#667eea'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#667eea'
                          }
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#667eea'
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <TextField
                      fullWidth
                      label="名额"
                      variant="outlined"
                      type="number"
                      value={prize.count}
                      onChange={(e) => handlePrizeChange(index, 'count', parseInt(e.target.value) || 1)}
                      inputProps={{ min: 1 }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': {
                            borderColor: '#667eea'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#667eea'
                          }
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#667eea'
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              </Paper>
            ))}
            <Button
              startIcon={<AddIcon />}
              onClick={addPrize}
              variant="outlined"
              sx={{ 
                mt: 2,
                borderColor: '#667eea',
                color: '#667eea',
                borderRadius: 2,
                px: 3,
                py: 1,
                fontWeight: 'bold',
                '&:hover': {
                  borderColor: '#667eea',
                  bgcolor: 'rgba(102, 126, 234, 0.1)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              添加奖项
            </Button>
          </Box>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#667eea' }}>
              📋 挑战规则
            </Typography>
            <TextField
              label="挑战规则"
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              value={newChallenge.rules}
              onChange={(e) => handleInputChange('rules', e.target.value)}
              placeholder="详细说明参与规则、评判标准、提交要求等"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: '#667eea'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#667eea'
                  }
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#667eea'
                }
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 4, pt: 0 }}>
          <Button 
            onClick={handleDialogClose}
            variant="outlined"
            sx={{
              borderColor: '#9e9e9e',
              color: '#9e9e9e',
              borderRadius: 2,
              px: 4,
              py: 1.5,
              fontWeight: 'bold',
              '&:hover': {
                borderColor: '#757575',
                color: '#757575',
                bgcolor: 'rgba(158, 158, 158, 0.1)'
              }
            }}
          >
            取消
          </Button>
          <Button 
            onClick={handleSubmitChallenge} 
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: 2,
              px: 4,
              py: 1.5,
              fontWeight: 'bold',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            🚀 发布挑战赛
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ChallengesPage;