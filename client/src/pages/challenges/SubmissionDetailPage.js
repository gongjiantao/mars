import React, { useEffect, useState } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  Chip,
  Avatar,
  IconButton,
  Dialog,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Breadcrumbs,
  Link,
  Divider,
  Card,
  CardContent,
  ImageList,
  ImageListItem,
  Fade,
  Zoom,
  Tooltip
} from '@mui/material';
import {
  ArrowBack,
  ThumbUp,
  ThumbUpOutlined,
  Share,
  Close,
  ZoomIn,
  NavigateBefore,
  NavigateNext,
  ChevronLeft,
  ChevronRight,
  EmojiEvents,
  AccessTime,
  Visibility
} from '@mui/icons-material';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { createApiUrl } from '../../config/api';
import {
  fetchSubmissionById,
  voteForSubmission,
  unvoteSubmission,
  clearError
} from '../../store/slices/challengeSlice';

const SubmissionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const {
    selectedSubmission,
    loading,
    voting,
    error
  } = useSelector(state => state.challenge);

  // 图片查看器状态
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (id) {
      dispatch(fetchSubmissionById(id));
    }
  }, [dispatch, id]);

  const handleVote = (hasVoted) => {
    if (!isAuthenticated) {
      alert('请先登录后再投票');
      return;
    }

    if (hasVoted) {
      dispatch(unvoteSubmission(id));
    } else {
      dispatch(voteForSubmission(id));
    }
  };

  const openImageViewer = (index) => {
    setCurrentImageIndex(index);
    setImageViewerOpen(true);
  };

  const nextImage = () => {
    if (selectedSubmission?.photos) {
      setCurrentImageIndex((prev) => 
        prev === selectedSubmission.photos.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (selectedSubmission?.photos) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? selectedSubmission.photos.length - 1 : prev - 1
      );
    }
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

  if (!selectedSubmission) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">作品不存在</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* 页面头部 */}
      <Box sx={{ 
        mb: 4,
        p: 3,
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
        borderRadius: 4,
        border: '1px solid rgba(102, 126, 234, 0.2)'
      }}>
        {/* 面包屑导航 */}
        <Breadcrumbs 
          sx={{ 
            mb: 2,
            '& .MuiBreadcrumbs-separator': {
              color: '#667eea'
            }
          }}
        >
          <Link 
            component={RouterLink} 
            to="/challenges" 
            sx={{
              color: '#667eea',
              textDecoration: 'none',
              fontWeight: 'medium',
              '&:hover': {
                textDecoration: 'underline',
                color: '#764ba2'
              }
            }}
          >
            🏆 挑战赛
          </Link>
          <Link 
            component={RouterLink} 
            to={`/challenges/${selectedSubmission.challenge._id}`} 
            sx={{
              color: '#667eea',
              textDecoration: 'none',
              fontWeight: 'medium',
              '&:hover': {
                textDecoration: 'underline',
                color: '#764ba2'
              }
            }}
          >
            {selectedSubmission.challenge.title}
          </Link>
          <Typography 
            sx={{ 
              color: '#333',
              fontWeight: 'bold'
            }}
          >
            {selectedSubmission.title}
          </Typography>
        </Breadcrumbs>

        {/* 返回按钮 */}
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(`/challenges/${selectedSubmission.challenge._id}`)}
          sx={{ 
            borderRadius: 3,
            px: 3,
            py: 1,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontWeight: 'bold',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
            border: 'none',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
              transform: 'translateY(-2px)'
            },
            transition: 'all 0.3s ease'
          }}
        >
          返回挑战详情
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => dispatch(clearError())}>
          {error}
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* 作品信息 */}
        <Grid item xs={12} md={8}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 4, 
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(15px)',
              border: '2px solid rgba(102, 126, 234, 0.1)',
              boxShadow: '0 8px 32px rgba(102, 126, 234, 0.1)'
            }}
          >
            {/* 作品标题和状态 */}
            <Box sx={{ mb: 4 }}>
              <Typography 
                variant="h4" 
                component="h1" 
                sx={{ 
                  fontWeight: 'bold', 
                  mb: 3,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: { xs: '1.8rem', md: '2.5rem' }
                }}
              >
                🎨 {selectedSubmission.title}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <Chip 
                  label={selectedSubmission.status === 'approved' ? '✅ 已通过' : 
                         selectedSubmission.status === 'rejected' ? '❌ 未通过' : '⏳ 审核中'}
                  color={selectedSubmission.status === 'approved' ? 'success' : 
                         selectedSubmission.status === 'rejected' ? 'error' : 'warning'}
                  sx={{
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                    px: 2,
                    py: 1,
                    borderRadius: 3
                  }}
                />
                
                {selectedSubmission.isWinner && (
                  <Chip 
                    icon={<EmojiEvents />}
                    label={`🏆 ${selectedSubmission.rank} 获奖作品`}
                    sx={{
                      background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '0.9rem',
                      px: 2,
                      py: 1,
                      borderRadius: 3,
                      boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)'
                    }}
                    variant="filled"
                  />
                )}
              </Box>
              
              {/* 作者信息 */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 3,
                p: 3,
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                borderRadius: 3,
                border: '1px solid rgba(102, 126, 234, 0.1)'
              }}>
                <Avatar 
                  src={selectedSubmission.user?.avatar ? createApiUrl(selectedSubmission.user?.avatar) : undefined} 
                  sx={{ 
                    width: 56, 
                    height: 56, 
                    mr: 3,
                    border: '3px solid rgba(102, 126, 234, 0.2)',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.2)'
                  }}
                >
                  {selectedSubmission.user?.username?.[0]}
                </Avatar>
                <Box>
                  <Typography 
                    variant="h6"
                    sx={{
                      fontWeight: 'bold',
                      color: '#333',
                      mb: 0.5
                    }}
                  >
                    👤 {selectedSubmission.user?.username}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{
                      color: '#667eea',
                      fontWeight: 'medium',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5
                    }}
                  >
                    <AccessTime fontSize="small" />
                    {format(new Date(selectedSubmission.createdAt), 'yyyy年MM月dd日 HH:mm', { locale: zhCN })}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* 作品描述 */}
            <Box sx={{ mb: 4 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 'bold', 
                  mb: 3,
                  color: '#667eea',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                📝 作品描述
              </Typography>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.03) 0%, rgba(118, 75, 162, 0.03) 100%)',
                  border: '1px solid rgba(102, 126, 234, 0.1)',
                  borderRadius: 3
                }}
              >
                <Typography 
                  variant="body1" 
                  sx={{ 
                    lineHeight: 1.8, 
                    whiteSpace: 'pre-wrap',
                    color: '#333',
                    fontSize: '1.1rem'
                  }}
                >
                  {selectedSubmission.description}
                </Typography>
              </Paper>
            </Box>

            {/* 活动照片 */}
            {selectedSubmission.photos && selectedSubmission.photos.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 'bold', 
                    mb: 3,
                    color: '#667eea',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  📸 活动照片 ({selectedSubmission.photos.length})
                </Typography>
                <ImageList 
                  cols={selectedSubmission.photos.length === 1 ? 1 : 2} 
                  rowHeight={300}
                  gap={16}
                  sx={{
                    borderRadius: 3,
                    overflow: 'hidden'
                  }}
                >
                  {selectedSubmission.photos.map((photo, index) => (
                    <ImageListItem key={index}>
                      <Box
                        sx={{
                          position: 'relative',
                          cursor: 'pointer',
                          borderRadius: 3,
                          overflow: 'hidden',
                          border: '2px solid rgba(102, 126, 234, 0.1)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.02)',
                            boxShadow: '0 8px 25px rgba(102, 126, 234, 0.2)',
                            borderColor: 'rgba(102, 126, 234, 0.3)'
                          },
                          '&:hover .overlay': {
                            opacity: 1
                          }
                        }}
                        onClick={() => openImageViewer(index)}
                      >
                        <img
                          src={photo.url}
                          alt={`活动照片 ${index + 1}`}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                        <Box
                          className="overlay"
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            bgcolor: 'rgba(0,0,0,0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: 0,
                            transition: 'opacity 0.3s ease'
                          }}
                        >
                          <ZoomIn sx={{ color: 'white', fontSize: 40 }} />
                        </Box>
                      </Box>
                    </ImageListItem>
                  ))}
                </ImageList>
              </Box>
            )}

            {/* 投票和分享 */}
            <Divider sx={{ 
              my: 4,
              borderColor: 'rgba(102, 126, 234, 0.2)',
              borderWidth: 1
            }} />
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 3,
              p: 3,
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
              borderRadius: 3,
              border: '1px solid rgba(102, 126, 234, 0.1)'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant={selectedSubmission.hasVoted ? 'contained' : 'outlined'}
                  startIcon={selectedSubmission.hasVoted ? <ThumbUp /> : <ThumbUpOutlined />}
                  onClick={() => handleVote(selectedSubmission.hasVoted)}
                  disabled={voting || !isAuthenticated}
                  size="large"
                  sx={{
                    borderRadius: 3,
                    px: 3,
                    py: 1.5,
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    ...(selectedSubmission.hasVoted ? {
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                        boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                        transform: 'translateY(-2px)'
                      }
                    } : {
                      borderColor: '#667eea',
                      color: '#667eea',
                      '&:hover': {
                        borderColor: '#764ba2',
                        color: '#764ba2',
                        background: 'rgba(102, 126, 234, 0.1)',
                        transform: 'translateY(-2px)'
                      }
                    }),
                    transition: 'all 0.3s ease'
                  }}
                >
                  {selectedSubmission.hasVoted ? '👍 已投票' : '👍 投票'} ({selectedSubmission.votes})
                </Button>
                
                {!isAuthenticated && (
                  <Typography 
                    variant="body2" 
                    sx={{
                      color: '#667eea',
                      fontWeight: 'medium',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5
                    }}
                  >
                    🔐 登录后可投票
                  </Typography>
                )}
              </Box>
              
              <Button
                variant="outlined"
                startIcon={<Share />}
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('链接已复制到剪贴板');
                }}
                sx={{
                  borderRadius: 3,
                  px: 3,
                  py: 1.5,
                  borderColor: '#667eea',
                  color: '#667eea',
                  fontWeight: 'bold',
                  '&:hover': {
                    borderColor: '#764ba2',
                    color: '#764ba2',
                    background: 'rgba(102, 126, 234, 0.1)',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                🔗 分享作品
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* 侧边栏信息 */}
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 4, 
              mb: 3,
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(15px)',
              border: '2px solid rgba(102, 126, 234, 0.1)',
              borderRadius: 4,
              boxShadow: '0 8px 32px rgba(102, 126, 234, 0.1)'
            }}
          >
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 'bold', 
                mb: 3,
                color: '#667eea',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              📊 挑战信息
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#667eea',
                  fontWeight: 'bold',
                  mb: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5
                }}
              >
                🎯 所属挑战
              </Typography>
              <Link 
                component={RouterLink} 
                to={`/challenges/${selectedSubmission.challenge._id}`}
                sx={{ 
                  textDecoration: 'none',
                  display: 'block',
                  p: 2,
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                  borderRadius: 2,
                  border: '1px solid rgba(102, 126, 234, 0.1)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.2)'
                  }
                }}
              >
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: '#667eea', 
                    fontWeight: 'bold',
                    fontSize: '1rem'
                  }}
                >
                  {selectedSubmission.challenge.title}
                </Typography>
              </Link>
            </Box>
            
            <Divider sx={{ my: 3, borderColor: 'rgba(102, 126, 234, 0.2)' }} />
            
            <Box sx={{ mb: 3 }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#667eea',
                  fontWeight: 'bold',
                  mb: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5
                }}
              >
                <AccessTime fontSize="small" /> 提交时间
              </Typography>
              <Typography 
                variant="body1"
                sx={{
                  color: '#333',
                  fontWeight: 'medium',
                  fontSize: '1rem'
                }}
              >
                {format(new Date(selectedSubmission.createdAt), 'yyyy年MM月dd日 HH:mm', { locale: zhCN })}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#667eea',
                  fontWeight: 'bold',
                  mb: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5
                }}
              >
                <ThumbUp fontSize="small" /> 投票数
              </Typography>
              <Typography 
                variant="body1"
                sx={{
                  color: '#333',
                  fontWeight: 'bold',
                  fontSize: '1.2rem'
                }}
              >
                {selectedSubmission.votes} 票
              </Typography>
            </Box>
            
            <Box>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#667eea',
                  fontWeight: 'bold',
                  mb: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5
                }}
              >
                <Visibility fontSize="small" /> 浏览次数
              </Typography>
              <Typography 
                variant="body1"
                sx={{
                  color: '#333',
                  fontWeight: 'bold',
                  fontSize: '1.2rem'
                }}
              >
                {selectedSubmission.views || 0} 次
              </Typography>
            </Box>
          </Paper>

          {/* 获奖信息 */}
          {selectedSubmission.isWinner && (
            <Paper 
              elevation={0}
              sx={{ 
                p: 4,
                background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 165, 0, 0.1) 100%)',
                border: '2px solid rgba(255, 215, 0, 0.3)',
                borderRadius: 4,
                boxShadow: '0 8px 32px rgba(255, 215, 0, 0.2)'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <EmojiEvents sx={{ color: '#FFD700', mr: 2, fontSize: '2rem' }} />
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 'bold', 
                    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  🏆 获奖作品
                </Typography>
              </Box>
              
              <Typography 
                variant="body1" 
                sx={{ 
                  mb: 2,
                  color: '#e65100',
                  fontWeight: 'bold',
                  fontSize: '1.1rem'
                }}
              >
                <strong>🎖️ 奖项：</strong>{selectedSubmission.rank}
              </Typography>
              
              {selectedSubmission.awardDescription && (
                <Typography 
                  variant="body2" 
                  sx={{
                    color: '#bf360c',
                    fontWeight: 'medium',
                    lineHeight: 1.6,
                    p: 2,
                    background: 'rgba(255, 255, 255, 0.5)',
                    borderRadius: 2,
                    border: '1px solid rgba(255, 215, 0, 0.2)'
                  }}
                >
                  {selectedSubmission.awardDescription}
                </Typography>
              )}
            </Paper>
          )}
        </Grid>
      </Grid>

      {/* 图片查看器 */}
      <Dialog
        open={imageViewerOpen}
        onClose={() => setImageViewerOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            background: 'rgba(0, 0, 0, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: 4,
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)'
          }
        }}
      >
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          <IconButton
            sx={{
              position: 'absolute',
              top: 20,
              right: 20,
              color: 'white',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '50%',
              width: 48,
              height: 48,
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%)',
                transform: 'scale(1.1)',
                boxShadow: '0 8px 25px rgba(255, 255, 255, 0.2)'
              },
              zIndex: 1
            }}
            onClick={() => setImageViewerOpen(false)}
          >
            <Close sx={{ fontSize: '1.5rem' }} />
          </IconButton>
          
          {selectedSubmission.photos && selectedSubmission.photos.length > 1 && (
            <>
              <IconButton
                sx={{
                  position: 'absolute',
                  left: 24,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'white',
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.8) 0%, rgba(118, 75, 162, 0.8) 100%)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '50%',
                  width: 56,
                  height: 56,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 1) 0%, rgba(118, 75, 162, 1) 100%)',
                    transform: 'translateY(-50%) scale(1.1) translateX(-2px)',
                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)'
                  },
                  zIndex: 1
                }}
                onClick={prevImage}
              >
                <NavigateBefore sx={{ fontSize: '2rem' }} />
              </IconButton>
              
              <IconButton
                sx={{
                  position: 'absolute',
                  right: 24,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'white',
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.8) 0%, rgba(118, 75, 162, 0.8) 100%)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '50%',
                  width: 56,
                  height: 56,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 1) 0%, rgba(118, 75, 162, 1) 100%)',
                    transform: 'translateY(-50%) scale(1.1) translateX(2px)',
                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)'
                  },
                  zIndex: 1
                }}
                onClick={nextImage}
              >
                <NavigateNext sx={{ fontSize: '2rem' }} />
              </IconButton>
            </>
          )}
          
          {selectedSubmission.photos && selectedSubmission.photos[currentImageIndex] && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '70vh',
                p: 3
              }}
            >
              <img
                src={selectedSubmission.photos[currentImageIndex].url}
                alt={`活动照片 ${currentImageIndex + 1}`}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  borderRadius: '12px',
                  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
                  transition: 'all 0.3s ease'
                }}
              />
            </Box>
          )}
          
          {selectedSubmission.photos && selectedSubmission.photos.length > 1 && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 24,
                left: '50%',
                transform: 'translateX(-50%)',
                color: 'white',
                background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.6) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                px: 3,
                py: 1.5,
                borderRadius: 3,
                fontSize: '1rem',
                fontWeight: 'bold',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)'
              }}
            >
              <Typography variant="body2" sx={{ fontSize: '1rem', fontWeight: 'bold' }}>
                📸 {currentImageIndex + 1} / {selectedSubmission.photos.length}
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default SubmissionDetailPage;