import React, { useEffect, useState } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Breadcrumbs,
  Link,
  Divider,
  ImageList,
  ImageListItem,
  Fab,
  Badge,
  Tooltip,
  Fade,
  Zoom,
  Snackbar,
  Alert,
  MobileStepper
} from '@mui/material';
import {
  ArrowBack,
  EmojiEvents,
  AccessTime,
  People,
  Add,
  PhotoCamera,
  ThumbUp,
  ThumbUpOutlined,
  Visibility,
  Share,
  Close,
  Phone,
  Email,
  Upload,
  CheckCircle,
  Warning,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  Delete
} from '@mui/icons-material';
import { format, isAfter, isBefore } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { createApiUrl } from '../../config/api';
import {
  fetchChallengeById,
  fetchChallengeSubmissions,
  fetchMySubmission,
  submitChallengeWork,
  voteForSubmission,
  unvoteSubmission,
  deleteSubmission,
  clearError,
  clearSubmitSuccess
} from '../../store/slices/challengeSlice';
import { isAdmin } from '../../utils/permissions';

const ChallengeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const {
    selectedChallenge,
    submissions,
    mySubmission,
    loading,
    submissionsLoading,
    submitting,
    voting,
    error,
    submissionError,
    submitSuccess,
    submissionsPagination
  } = useSelector(state => state.challenge);

  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [submitForm, setSubmitForm] = useState({
    title: '',
    description: '',
    phone: '',
    email: '',
    photos: []
  });
  const [previewImages, setPreviewImages] = useState([]);
  const [sortBy, setSortBy] = useState('votes');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [imageSteppers, setImageSteppers] = useState({});
  // 添加缺失的状态变量
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // 添加图片点击处理函数
  const handleImageClick = (submission, photoIndex = 0) => {
    setSelectedImage({
      url: submission.photos[photoIndex].url,
      title: submission.title,
      photos: submission.photos,
      currentIndex: photoIndex,
      submissionId: submission._id
    });
    setImageDialogOpen(true);
  };

  useEffect(() => {
    if (id) {
      dispatch(fetchChallengeById(id));
      dispatch(fetchChallengeSubmissions({ challengeId: id, page: 1, sort: sortBy }));
      if (isAuthenticated) {
        dispatch(fetchMySubmission(id));
      }
    }
  }, [dispatch, id, isAuthenticated, sortBy]);

  useEffect(() => {
    if (error) {
      setSnackbar({ open: true, message: error, severity: 'error' });
      dispatch(clearError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (submitSuccess) {
      setSubmitDialogOpen(false);
      setSubmitForm({ title: '', description: '', phone: '', email: '', photos: [] });
      setPreviewImages([]);
      dispatch(clearSubmitSuccess());
      dispatch(fetchMySubmission(id));
    }
  }, [submitSuccess, dispatch, id]);

  const getChallengeStatus = (challenge) => {
    if (!challenge) return { status: 'unknown', label: '未知', color: 'default' };
    
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

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    if (files.length + submitForm.photos.length > 5) {
      setSnackbar({ open: true, message: '最多只能上传5张照片', severity: 'error' });
      return;
    }
  
    const validFiles = [];
    const maxSize = 10 * 1024 * 1024; 
  
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        setSnackbar({ open: true, message: '只能上传图片文件', severity: 'error' });
        continue;
      }
      if (file.size > maxSize) {
        setSnackbar({ open: true, message: `图片 "${file.name}" 超过10MB大小限制`, severity: 'error' });
        continue;
      }
      validFiles.push(file);
    }
  
    if (validFiles.length === 0) return;
  
    setSubmitForm(prev => ({
      ...prev,
      photos: [...prev.photos, ...validFiles]
    }));
  
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImages(prev => [...prev, e.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index) => {
    setSubmitForm(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!submitForm.title.trim()) {
      alert('请输入作品标题');
      return;
    }
    if (!submitForm.description.trim()) {
      alert('请输入作品描述');
      return;
    }
    if (!submitForm.phone.trim() && !submitForm.email.trim()) {
      alert('请提供手机号或邮箱作为联系方式');
      return;
    }
    if (submitForm.photos.length === 0) {
      alert('请至少上传一张活动照片');
      return;
    }

    const formData = new FormData();
    formData.append('title', submitForm.title);
    formData.append('description', submitForm.description);
    formData.append('phone', submitForm.phone);
    formData.append('email', submitForm.email);
    
    submitForm.photos.forEach(photo => {
      formData.append('photos', photo);
    });

    dispatch(submitChallengeWork({ challengeId: id, formData }));
  };

  const handleVote = async (submissionId, hasVoted) => {
    if (!isAuthenticated) {
      alert('请先登录后再投票');
      return;
    }

    try {
      if (hasVoted) {
        await dispatch(unvoteSubmission(submissionId)).unwrap();
        setSnackbar({ open: true, message: '取消投票成功', severity: 'success' });
      } else {
        await dispatch(voteForSubmission(submissionId)).unwrap();
        setSnackbar({ open: true, message: '投票成功', severity: 'success' });
      }
      dispatch(fetchChallengeSubmissions({ challengeId: id, page: 1, sort: sortBy }));
    } catch (error) {
      console.error('投票操作失败:', error);
      setSnackbar({ open: true, message: error.message || '投票失败，请重试', severity: 'error' });
    }
  };

  const handleDeleteSubmission = async (submissionId) => {
    if (!window.confirm('确定要删除这个作品吗？此操作不可撤销。')) {
      return;
    }

    try {
      await dispatch(deleteSubmission(submissionId)).unwrap();
      setSnackbar({ open: true, message: '作品删除成功', severity: 'success' });
      dispatch(fetchChallengeSubmissions({ challengeId: id, page: 1, sort: sortBy }));
    } catch (error) {
      console.error('删除作品失败:', error);
      setSnackbar({ open: true, message: error.message || '删除作品失败，请重试', severity: 'error' });
    }
  };

  const canParticipate = () => {
    if (!selectedChallenge || !isAuthenticated) return false;
    const status = getChallengeStatus(selectedChallenge);
    return status.status === 'active' && !mySubmission;
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (!selectedChallenge) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">挑战赛不存在</Alert>
      </Container>
    );
  }

  const statusInfo = getChallengeStatus(selectedChallenge);

  return (
    <>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* 面包屑导航 */}
        <Box sx={{ 
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
          borderRadius: 3,
          p: 3,
          mb: 4,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23667eea" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: 0.3
          }
        }}>
          <Breadcrumbs sx={{ mb: 2, position: 'relative', zIndex: 1 }}>
            <Link 
              component={RouterLink} 
              to="/challenges" 
              sx={{ 
                color: '#667eea',
                textDecoration: 'none',
                fontWeight: 'bold',
                '&:hover': {
                  textDecoration: 'underline'
                }
              }}
            >
              🏆 挑战赛
            </Link>
            <Typography sx={{ color: '#764ba2', fontWeight: 'bold' }}>
              {selectedChallenge.title}
            </Typography>
          </Breadcrumbs>

          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/challenges')}
            variant="outlined"
            sx={{ 
              borderColor: '#667eea',
              color: '#667eea',
              borderRadius: 2,
              px: 3,
              py: 1,
              fontWeight: 'bold',
              position: 'relative',
              zIndex: 1,
              '&:hover': {
                borderColor: '#667eea',
                bgcolor: 'rgba(102, 126, 234, 0.1)',
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            返回挑战赛列表
          </Button>
        </Box>

      {/* 挑战赛详情 */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 5, 
          mb: 4, 
          borderRadius: 4,
          background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
          border: '2px solid rgba(102, 126, 234, 0.1)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
            borderRadius: '50%',
            zIndex: 0
          }
        }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={8} sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              <Box sx={{ 
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                borderRadius: '50%',
                p: 1.5,
                mr: 3,
                boxShadow: '0 4px 15px rgba(255, 215, 0, 0.4)'
              }}>
                <EmojiEvents sx={{ fontSize: 40, color: 'white' }} />
              </Box>
              <Box>
                <Typography 
                  variant="h3" 
                  component="h1" 
                  sx={{ 
                    fontWeight: 'bold', 
                    mb: 2,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 2px 4px rgba(102, 126, 234, 0.1)',
                    fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
                  }}
                >
                  {selectedChallenge.title}
                </Typography>
                <Chip 
                  label={statusInfo.label} 
                  color={statusInfo.color}
                  sx={{
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                />
              </Box>
            </Box>

            <Paper 
              elevation={0}
              sx={{
                p: 3,
                mb: 4,
                borderRadius: 3,
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(102, 126, 234, 0.1)'
              }}
            >
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 2, 
                  color: '#667eea',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                📝 挑战描述
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  lineHeight: 1.8,
                  color: '#555',
                  fontSize: '1.1rem'
                }}
              >
                {selectedChallenge.description}
              </Typography>
            </Paper>

            {/* 挑战规则 */}
            {selectedChallenge.rules && selectedChallenge.rules.length > 0 && (
              <Paper 
                elevation={0}
                sx={{
                  p: 3,
                  mb: 4,
                  borderRadius: 3,
                  background: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(102, 126, 234, 0.1)'
                }}
              >
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 'bold', 
                    mb: 3,
                    color: '#667eea',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  📋 挑战规则
                </Typography>
                <Box component="ul" sx={{ pl: 2, m: 0 }}>
                  {selectedChallenge.rules.map((rule, index) => (
                    <Typography 
                      component="li" 
                      key={index} 
                      sx={{ 
                        mb: 2,
                        fontSize: '1rem',
                        lineHeight: 1.6,
                        color: '#555'
                      }}
                    >
                      {rule}
                    </Typography>
                  ))}
                </Box>
              </Paper>
            )}

            {/* 奖项设置 */}
            {selectedChallenge.prizes && selectedChallenge.prizes.length > 0 && (
              <Paper 
                elevation={0}
                sx={{
                  p: 3,
                  mb: 4,
                  borderRadius: 3,
                  background: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(102, 126, 234, 0.1)'
                }}
              >
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 'bold', 
                    mb: 3,
                    color: '#667eea',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  🏆 奖项设置
                </Typography>
                <Grid container spacing={3}>
                  {selectedChallenge.prizes.map((prize, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Card 
                        elevation={0}
                        sx={{
                          background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
                          border: '2px solid rgba(102, 126, 234, 0.1)',
                          borderRadius: 3,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 8px 25px rgba(102, 126, 234, 0.15)',
                            borderColor: 'rgba(102, 126, 234, 0.3)'
                          }
                        }}
                      >
                        <CardContent sx={{ p: 3 }}>
                          <Typography 
                            variant="h6" 
                            sx={{
                              color: '#667eea',
                              fontWeight: 'bold',
                              mb: 2,
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅'} {prize.rank}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: '#666',
                              mb: 2,
                              lineHeight: 1.6
                            }}
                          >
                            {prize.description}
                          </Typography>
                          <Chip
                            label={`${prize.count}个名额`}
                            size="small"
                            sx={{
                              bgcolor: 'rgba(102, 126, 234, 0.1)',
                              color: '#667eea',
                              fontWeight: 'bold'
                            }}
                          />
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            )}
          </Grid>

          <Grid item xs={12} md={4} sx={{ position: 'relative', zIndex: 1 }}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 4,
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(15px)',
                border: '2px solid rgba(102, 126, 234, 0.1)',
                borderRadius: 4,
                position: 'sticky',
                top: 20
              }}
            >
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 'bold', 
                  mb: 4,
                  color: '#667eea',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ℹ️ 挑战信息
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 2,
                  p: 2,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)'
                }}>
                  <Box sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '50%',
                    p: 1,
                    mr: 2
                  }}>
                    <AccessTime sx={{ color: 'white', fontSize: 20 }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: '#667eea', fontWeight: 'bold' }}>
                      挑战时间
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#333' }}>
                      {format(new Date(selectedChallenge.startDate), 'yyyy年MM月dd日', { locale: zhCN })}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      至 {format(new Date(selectedChallenge.endDate), 'yyyy年MM月dd日', { locale: zhCN })}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 2,
                  p: 2,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)'
                }}>
                  <Box sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '50%',
                    p: 1,
                    mr: 2
                  }}>
                    <People sx={{ color: 'white', fontSize: 20 }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: '#667eea', fontWeight: 'bold' }}>
                      参与人数
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
                      {selectedChallenge.currentSubmissions} / {selectedChallenge.maxSubmissions}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ my: 3, borderColor: 'rgba(102, 126, 234, 0.2)' }} />

              {/* 参与状态 */}
              {isAuthenticated ? (
                mySubmission ? (
                  <Alert 
                    severity="success" 
                    sx={{ 
                      mb: 3,
                      borderRadius: 3,
                      '& .MuiAlert-icon': {
                        fontSize: '1.5rem'
                      }
                    }}
                  >
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      🎉 您已参与此挑战！
                    </Typography>
                  </Alert>
                ) : canParticipate() ? (
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    startIcon={<Add />}
                    onClick={() => setSubmitDialogOpen(true)}
                    sx={{ 
                      mb: 3,
                      py: 2,
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      fontSize: '1.1rem',
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
                    🚀 参与挑战
                  </Button>
                ) : (
                  <Alert 
                    severity="warning" 
                    sx={{ 
                      mb: 3,
                      borderRadius: 3,
                      '& .MuiAlert-icon': {
                        fontSize: '1.5rem'
                      }
                    }}
                  >
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {statusInfo.status === 'ended' ? '⏰ 挑战已结束' : 
                       statusInfo.status === 'upcoming' ? '⏳ 挑战尚未开始' : '❌ 无法参与'}
                    </Typography>
                  </Alert>
                )
              ) : (
                <Alert 
                  severity="info" 
                  sx={{ 
                    mb: 3,
                    borderRadius: 3,
                    '& .MuiAlert-icon': {
                      fontSize: '1.5rem'
                    }
                  }}
                >
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    🔐 请先登录后参与挑战
                  </Typography>
                </Alert>
              )}

              <Button
                variant="outlined"
                fullWidth
                size="large"
                startIcon={<Share />}
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  setSnackbar({ open: true, message: '链接已复制到剪贴板！', severity: 'success' });
                }}
                sx={{
                  py: 1.5,
                  borderRadius: 3,
                  borderColor: '#667eea',
                  color: '#667eea',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  '&:hover': {
                    borderColor: '#667eea',
                    bgcolor: 'rgba(102, 126, 234, 0.1)',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                分享挑战
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {/* 作品展示区域 */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 4, 
          mb: 4,
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(15px)',
          border: '2px solid rgba(102, 126, 234, 0.1)',
          borderRadius: 4
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 4,
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            🎨 参赛作品 ({submissionsPagination.total})
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant={sortBy === 'votes' ? 'contained' : 'outlined'}
              size="medium"
              onClick={() => setSortBy('votes')}
              sx={{
                borderRadius: 3,
                borderColor: '#667eea',
                color: sortBy === 'votes' ? 'white' : '#667eea',
                bgcolor: sortBy === 'votes' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
                fontWeight: 'bold',
                px: 3,
                py: 1,
                '&:hover': {
                  borderColor: '#667eea',
                  bgcolor: sortBy === 'votes' ? 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)' : 'rgba(102, 126, 234, 0.1)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              👍 按票数
            </Button>
            <Button
              variant={sortBy === 'latest' ? 'contained' : 'outlined'}
              size="medium"
              onClick={() => setSortBy('latest')}
              sx={{
                borderRadius: 3,
                borderColor: '#667eea',
                color: sortBy === 'latest' ? 'white' : '#667eea',
                bgcolor: sortBy === 'latest' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
                fontWeight: 'bold',
                px: 3,
                py: 1,
                '&:hover': {
                  borderColor: '#667eea',
                  bgcolor: sortBy === 'latest' ? 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)' : 'rgba(102, 126, 234, 0.1)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              📅 最新
            </Button>
          </Box>
        </Box>

        {submissionsLoading ? (
          <Box display="flex" justifyContent="center" py={6}>
            <Box sx={{ textAlign: 'center' }}>
              <CircularProgress size={60} sx={{ color: '#667eea', mb: 2 }} />
              <Typography variant="body1" sx={{ color: '#667eea', fontWeight: 'bold' }}>
                正在加载精彩作品...
              </Typography>
            </Box>
          </Box>
        ) : submissions.length === 0 ? (
          <Paper 
            elevation={0}
            sx={{ 
              p: 8, 
              textAlign: 'center',
              background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
              border: '2px dashed rgba(102, 126, 234, 0.3)',
              borderRadius: 4
            }}
          >
            <Box sx={{
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
              borderRadius: '50%',
              width: 120,
              height: 120,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3
            }}>
              <PhotoCamera sx={{ fontSize: 60, color: '#667eea' }} />
            </Box>
            <Typography 
              variant="h5" 
              sx={{ 
                color: '#667eea', 
                fontWeight: 'bold',
                mb: 2
              }}
            >
              🎨 暂无参赛作品
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: '#666',
                fontSize: '1.1rem',
                lineHeight: 1.6
              }}
            >
              成为第一个参与挑战的人吧！展示你的创意和才华 ✨
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={4}>
            {submissions.map((submission) => (
              <Grid item xs={12} sm={6} md={4} key={submission._id}>
                <Fade in={true}>
                  <Card
                    elevation={0}
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
                      border: '2px solid rgba(102, 126, 234, 0.1)',
                      borderRadius: 4,
                      overflow: 'hidden',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 12px 30px rgba(102, 126, 234, 0.2)',
                        borderColor: 'rgba(102, 126, 234, 0.3)'
                      }
                    }}
                  >
                    {submission.photos && submission.photos.length > 0 && (
                      <CardMedia
                        component="img"
                        height="200"
                        image={createApiUrl(submission.photos[imageSteppers[submission._id] || 0].url)}
                        alt={`${submission.title} - 图片 ${(imageSteppers[submission._id] || 0) + 1}`}
                        sx={{ 
                          objectFit: 'cover',
                          cursor: 'pointer'
                        }}
                        onClick={() => handleImageClick(submission, imageSteppers[submission._id] || 0)}
                      />
                    )}
                    {submission.photos && submission.photos.length > 1 && (
                      <MobileStepper
                        steps={submission.photos.length}
                        position="static"
                        activeStep={imageSteppers[submission._id] || 0}
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          bgcolor: 'rgba(0,0,0,0.5)',
                          '& .MuiMobileStepper-dot': {
                            bgcolor: 'rgba(255,255,255,0.5)'
                          },
                          '& .MuiMobileStepper-dotActive': {
                            bgcolor: 'white'
                          }
                        }}
                        nextButton={
                          <IconButton
                            size="small"
                            onClick={() => {
                              const currentStep = imageSteppers[submission._id] || 0;
                              if (currentStep < submission.photos.length - 1) {
                                setImageSteppers(prev => ({
                                  ...prev,
                                  [submission._id]: currentStep + 1
                                }));
                              }
                            }}
                            disabled={(imageSteppers[submission._id] || 0) >= submission.photos.length - 1}
                            sx={{ color: 'white' }}
                          >
                            <KeyboardArrowRight />
                          </IconButton>
                        }
                        backButton={
                          <IconButton
                            size="small"
                            onClick={() => {
                              const currentStep = imageSteppers[submission._id] || 0;
                              if (currentStep > 0) {
                                setImageSteppers(prev => ({
                                  ...prev,
                                  [submission._id]: currentStep - 1
                                }));
                              }
                            }}
                            disabled={(imageSteppers[submission._id] || 0) <= 0}
                            sx={{ color: 'white' }}
                          >
                            <KeyboardArrowLeft />
                          </IconButton>
                        }
                      />
                    )}
                    
                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      <Typography 
                        variant="h6" 
                        component="h3" 
                        sx={{
                          fontWeight: 'bold',
                          color: '#333',
                          mb: 2,
                          fontSize: '1.2rem',
                          lineHeight: 1.3
                        }}
                      >
                        {submission.title}
                      </Typography>
                      
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          mb: 3,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          color: '#666',
                          lineHeight: 1.6,
                          fontSize: '0.95rem'
                        }}
                      >
                        {submission.description}
                      </Typography>
                      
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        mb: 3,
                        p: 2,
                        borderRadius: 2,
                        background: 'rgba(102, 126, 234, 0.05)'
                      }}>
                        <Avatar 
                          src={submission.user?.avatar ? createApiUrl(submission.user?.avatar) : undefined} 
                          sx={{ 
                            width: 36, 
                            height: 36, 
                            mr: 2,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            '&:hover': {
                              transform: 'scale(1.05)',
                              transition: 'transform 0.2s'
                            }
                          }}
                          onClick={() => navigate(`/profile/${submission.user?.username}`)}
                        >
                          {submission.user?.username?.[0]}
                        </Avatar>
                        <Box>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: '#667eea',
                              fontWeight: 'bold',
                              fontSize: '0.9rem'
                            }}
                          >
                            {submission.user?.username}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: '#999',
                              fontSize: '0.8rem'
                            }}
                          >
                            创作者
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        pt: 2,
                        borderTop: '1px solid rgba(102, 126, 234, 0.1)'
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <IconButton
                            size="medium"
                            onClick={() => handleVote(submission._id, submission.hasVoted)}
                            disabled={voting || !isAuthenticated}
                            sx={{
                              color: submission.hasVoted ? '#667eea' : '#999',
                              bgcolor: submission.hasVoted ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
                              borderRadius: 2,
                              '&:hover': {
                                bgcolor: 'rgba(102, 126, 234, 0.15)',
                                transform: 'scale(1.1)'
                              },
                              transition: 'all 0.2s ease'
                            }}
                          >
                            {submission.hasVoted ? <ThumbUp fontSize="small" /> : <ThumbUpOutlined fontSize="small" />}
                          </IconButton>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: 'bold',
                              color: submission.hasVoted ? '#667eea' : '#666',
                              minWidth: '20px'
                            }}
                          >
                            {submission.votes}
                          </Typography>
                          
                          {/* 管理员删除按钮 */}
                          {isAuthenticated && isAdmin(user) && (
                            <Tooltip title="删除违规作品">
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteSubmission(submission._id)}
                                sx={{ 
                                  ml: 1, 
                                  color: 'error.main',
                                  '&:hover': {
                                    bgcolor: 'rgba(244, 67, 54, 0.1)',
                                    transform: 'scale(1.1)'
                                  },
                                  transition: 'all 0.2s ease'
                                }}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                        
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: '#999',
                              fontSize: '0.8rem',
                              display: 'block'
                            }}
                          >
                            {format(new Date(submission.createdAt), 'MM-dd', { locale: zhCN })}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      {/* 提交作品对话框 */}
      <Dialog 
        open={submitDialogOpen} 
        onClose={() => setSubmitDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
            border: '2px solid rgba(102, 126, 234, 0.1)',
            boxShadow: '0 20px 60px rgba(102, 126, 234, 0.15)'
          }
        }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            textAlign: 'center',
            py: 3,
            position: 'relative'
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            🎨 提交参赛作品
          </Typography>
          <IconButton
            onClick={() => setSubmitDialogOpen(false)}
            sx={{ 
              position: 'absolute', 
              right: 16, 
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ p: 4 }}>
          {submissionError && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderRadius: 3,
                '& .MuiAlert-icon': {
                  fontSize: '1.5rem'
                }
              }}
            >
              {submissionError}
            </Alert>
          )}
          
          <Alert 
            severity="info" 
            sx={{ 
              mb: 4,
              borderRadius: 3,
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
              border: '1px solid rgba(102, 126, 234, 0.2)',
              '& .MuiAlert-icon': {
                fontSize: '1.5rem'
              }
            }}
          >
            <Typography variant="body1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
              <Warning sx={{ fontSize: 20, mr: 1 }} />
              💡 每个挑战只能参加一次，请仔细填写作品信息
            </Typography>
          </Alert>
          
          <Box sx={{ mb: 4 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#667eea', 
                fontWeight: 'bold', 
                mb: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              📝 基本信息
            </Typography>
            
            <TextField
              fullWidth
              label="作品标题"
              value={submitForm.title}
              onChange={(e) => setSubmitForm(prev => ({ ...prev, title: e.target.value }))}
              sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
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
              required
            />
            
            <TextField
              fullWidth
              label="作品描述"
              multiline
              rows={4}
              value={submitForm.description}
              onChange={(e) => setSubmitForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="详细描述您的作品创意、设计理念或制作过程..."
              sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
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
              required
            />
          </Box>
          
          <Box sx={{ mb: 4 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#667eea', 
                fontWeight: 'bold', 
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              📞 联系方式
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#666', 
                mb: 3,
                fontStyle: 'italic'
              }}
            >
              获奖后联系使用，不会公开展示
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="手机号"
                  value={submitForm.phone}
                  onChange={(e) => setSubmitForm(prev => ({ ...prev, phone: e.target.value }))}
                  InputProps={{
                    startAdornment: <Phone sx={{ mr: 1, color: '#667eea' }} />
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
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
                  label="邮箱"
                  type="email"
                  value={submitForm.email}
                  onChange={(e) => setSubmitForm(prev => ({ ...prev, email: e.target.value }))}
                  InputProps={{
                    startAdornment: <Email sx={{ mr: 1, color: '#667eea' }} />
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
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
          </Box>
          
          <Box sx={{ mb: 4 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#667eea', 
                fontWeight: 'bold', 
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              📷 作品照片
            </Typography>
            
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="photo-upload"
              multiple
              type="file"
              onChange={handleFileChange}
            />
            <label htmlFor="photo-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<Upload />}
                disabled={submitForm.photos.length >= 5}
                size="large"
                sx={{
                  borderRadius: 3,
                  borderColor: '#667eea',
                  color: '#667eea',
                  fontWeight: 'bold',
                  py: 1.5,
                  px: 4,
                  mb: 2,
                  '&:hover': {
                    borderColor: '#667eea',
                    bgcolor: 'rgba(102, 126, 234, 0.1)',
                    transform: 'translateY(-2px)'
                  },
                  '&:disabled': {
                    borderColor: '#ccc',
                    color: '#999'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                📸 上传照片 ({submitForm.photos.length}/5)
              </Button>
            </label>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#666', 
                fontStyle: 'italic',
                display: 'block'
              }}
            >
              💡 支持JPG、PNG等图片格式，单个文件不超过10MB
            </Typography>
          </Box>
          
          {previewImages.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: '#667eea', 
                  fontWeight: 'bold', 
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                🖼️ 照片预览 ({previewImages.length})
              </Typography>
              <ImageList cols={3} rowHeight={140} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                {previewImages.map((image, index) => (
                  <ImageListItem 
                    key={index} 
                    sx={{ 
                      position: 'relative',
                      borderRadius: 2,
                      overflow: 'hidden',
                      '&:hover .delete-btn': {
                        opacity: 1
                      }
                    }}
                  >
                    <img
                      src={image}
                      alt={`预览 ${index + 1}`}
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover',
                        borderRadius: '8px'
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(45deg, transparent 0%, rgba(0,0,0,0.1) 100%)',
                        borderRadius: 2
                      }}
                    />
                    <IconButton
                      className="delete-btn"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: 'rgba(244, 67, 54, 0.9)',
                        color: 'white',
                        opacity: 0,
                        transition: 'all 0.3s ease',
                        '&:hover': { 
                          bgcolor: 'rgba(244, 67, 54, 1)',
                          transform: 'scale(1.1)'
                        }
                      }}
                      size="small"
                      onClick={() => removePhoto(index)}
                    >
                      <Close fontSize="small" />
                    </IconButton>
                  </ImageListItem>
                ))}
              </ImageList>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions 
          sx={{ 
            p: 4, 
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
            borderTop: '1px solid rgba(102, 126, 234, 0.1)',
            gap: 2,
            justifyContent: 'center'
          }}
        >
          <Button 
            onClick={() => setSubmitDialogOpen(false)}
            size="large"
            sx={{
              borderRadius: 3,
              px: 4,
              py: 1.5,
              color: '#666',
              fontWeight: 'bold',
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.05)'
              }
            }}
          >
            取消
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <CheckCircle />}
            size="large"
            sx={{
              borderRadius: 3,
              px: 6,
              py: 1.5,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)'
              },
              '&:disabled': {
                background: 'linear-gradient(135deg, #ccc 0%, #999 100%)',
                transform: 'none',
                boxShadow: 'none'
              },
              transition: 'all 0.3s ease'
            }}
          >
            {submitting ? '🚀 提交中...' : '✨ 提交作品'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 分页组件 */}
      {submissionsPagination.totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button
            variant="outlined"
            onClick={() => {
              if (submissionsPagination.page < submissionsPagination.totalPages) {
                dispatch(fetchChallengeSubmissions({ 
                  challengeId: id, 
                  page: submissionsPagination.page + 1, 
                  sort: sortBy 
                }));
              }
            }}
            disabled={submissionsPagination.page >= submissionsPagination.totalPages || submissionsLoading}
          >
            {submissionsLoading ? <CircularProgress size={20} /> : '加载更多'}
          </Button>
        </Box>
      )}

      {/* 浮动参与按钮 */}
      {canParticipate() && (
        <Zoom in={true}>
          <Fab
            color="primary"
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              zIndex: 1000
            }}
            onClick={() => setSubmitDialogOpen(true)}
          >
            <Add />
          </Fab>
        </Zoom>
      )}

      {/* Snackbar 提示消息 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
    
    {/* 图片预览对话框 */}
    <Dialog
      open={imageDialogOpen}
      onClose={() => setImageDialogOpen(false)}
      maxWidth="md"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          bgcolor: 'transparent',
          boxShadow: 'none',
          overflow: 'visible'
        }
      }}
    >
      <DialogContent sx={{ p: 0, position: 'relative' }}>
        {selectedImage && (
          <Box sx={{ position: 'relative' }}>
            <img
              src={createApiUrl(selectedImage.url)}
              alt={selectedImage.title}
              style={{
                width: '100%',
                height: 'auto',
                maxHeight: '80vh',
                objectFit: 'contain',
                borderRadius: '8px'
              }}
            />
            
            {/* 关闭按钮 */}
            <IconButton
              onClick={() => setImageDialogOpen(false)}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                bgcolor: 'rgba(0,0,0,0.5)',
                color: 'white',
                '&:hover': {
                  bgcolor: 'rgba(0,0,0,0.7)'
                }
              }}
            >
              <Close />
            </IconButton>
            
            {/* 多图片时的导航 */}
            {selectedImage.photos && selectedImage.photos.length > 1 && (
              <>
                <IconButton
                  onClick={() => {
                    const newIndex = Math.max(0, selectedImage.currentIndex - 1);
                    setSelectedImage(prev => ({
                      ...prev,
                      url: prev.photos[newIndex].url,
                      currentIndex: newIndex
                    }));
                    setImageSteppers(prev => ({
                      ...prev,
                      [selectedImage.submissionId]: newIndex
                    }));
                  }}
                  disabled={selectedImage.currentIndex <= 0}
                  sx={{
                    position: 'absolute',
                    left: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    bgcolor: 'rgba(0,0,0,0.5)',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'rgba(0,0,0,0.7)'
                    }
                  }}
                >
                  <KeyboardArrowLeft />
                </IconButton>
                
                <IconButton
                  onClick={() => {
                    const newIndex = Math.min(selectedImage.photos.length - 1, selectedImage.currentIndex + 1);
                    setSelectedImage(prev => ({
                      ...prev,
                      url: prev.photos[newIndex].url,
                      currentIndex: newIndex
                    }));
                    setImageSteppers(prev => ({
                      ...prev,
                      [selectedImage.submissionId]: newIndex
                    }));
                  }}
                  disabled={selectedImage.currentIndex >= selectedImage.photos.length - 1}
                  sx={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    bgcolor: 'rgba(0,0,0,0.5)',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'rgba(0,0,0,0.7)'
                    }
                  }}
                >
                  <KeyboardArrowRight />
                </IconButton>
                
                {/* 图片计数 */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 16,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    bgcolor: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    px: 2,
                    py: 1,
                    borderRadius: 1,
                    fontSize: '0.875rem'
                  }}
                >
                  {selectedImage.currentIndex + 1} / {selectedImage.photos.length}
                </Box>
              </>
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
  </>
  );
};

export default ChallengeDetailPage;