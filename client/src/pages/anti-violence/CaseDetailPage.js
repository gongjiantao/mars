import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  IconButton,
  TextField,
  Alert,
  CircularProgress,
  Breadcrumbs,
  Link
} from '@mui/material';
import {
  Gavel,
  Lightbulb,
  Article,
  Person,
  Share,
  ThumbUp,
  Visibility,
  ArrowBack,
  Send,
  BookmarkBorder,
  Bookmark
} from '@mui/icons-material';
import axios from 'axios';

// 模拟的Redux action（实际项目中应该定义在单独的文件中）
const getAntiViolenceCase = (id) => async (dispatch) => {
  try {
    dispatch({ type: 'GET_CASE_REQUEST' });
    
    const { data } = await axios.get(`/api/anti-violence-cases/${id}`);
    
    dispatch({
      type: 'GET_CASE_SUCCESS',
      payload: data.data
    });
    
    return data.data;
  } catch (error) {
    dispatch({
      type: 'GET_CASE_FAIL',
      payload: error.response && error.response.data.error
        ? error.response.data.error
        : error.message
    });
    throw error;
  }
};

const likeCase = (id) => async (dispatch) => {
  try {
    dispatch({ type: 'LIKE_CASE_REQUEST' });
    
    const { data } = await axios.put(`/api/anti-violence-cases/${id}/like`);
    
    dispatch({
      type: 'LIKE_CASE_SUCCESS',
      payload: data.data
    });
    
    return data.data;
  } catch (error) {
    dispatch({
      type: 'LIKE_CASE_FAIL',
      payload: error.response && error.response.data.error
        ? error.response.data.error
        : error.message
    });
    throw error;
  }
};

const shareCase = (id) => async (dispatch) => {
  try {
    dispatch({ type: 'SHARE_CASE_REQUEST' });
    
    const { data } = await axios.put(`/api/anti-violence-cases/${id}/share`);
    
    dispatch({
      type: 'SHARE_CASE_SUCCESS',
      payload: data.data
    });
    
    return data.data;
  } catch (error) {
    dispatch({
      type: 'SHARE_CASE_FAIL',
      payload: error.response && error.response.data.error
        ? error.response.data.error
        : error.message
    });
    throw error;
  }
};

const addEncouragement = (caseId, content) => async (dispatch) => {
  try {
    dispatch({ type: 'ADD_ENCOURAGEMENT_REQUEST' });
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    };
    
    const { data } = await axios.post('/api/encouragements', { case_id: caseId, content }, config);
    
    dispatch({
      type: 'ADD_ENCOURAGEMENT_SUCCESS',
      payload: data.data
    });
    
    return data.data;
  } catch (error) {
    dispatch({
      type: 'ADD_ENCOURAGEMENT_FAIL',
      payload: error.response && error.response.data.error
        ? error.response.data.error
        : error.message
    });
    throw error;
  }
};

const getEncouragements = (caseId) => async (dispatch) => {
  try {
    dispatch({ type: 'GET_ENCOURAGEMENTS_REQUEST' });
    
    const { data } = await axios.get(`/api/encouragements?case_id=${caseId}`);
    
    dispatch({
      type: 'GET_ENCOURAGEMENTS_SUCCESS',
      payload: data.data
    });
    
    return data.data;
  } catch (error) {
    dispatch({
      type: 'GET_ENCOURAGEMENTS_FAIL',
      payload: error.response && error.response.data.error
        ? error.response.data.error
        : error.message
    });
    throw error;
  }
};

const CaseDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  
  // 本地状态
  const [caseData, setCaseData] = useState(null);
  const [encouragements, setEncouragements] = useState([]);
  const [encouragementContent, setEncouragementContent] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  // Redux状态
  const { loading, error } = useSelector((state) => state.antiViolenceCase || {});
  const { loading: likeLoading } = useSelector((state) => state.caseAction || {});
  const { loading: encouragementLoading, error: encouragementError } = useSelector(
    (state) => state.encouragements || {}
  );
  const { isAuthenticated } = useSelector((state) => state.auth || {});
  
  // 加载案例数据
  useEffect(() => {
    const loadCaseData = async () => {
      try {
        const data = await dispatch(getAntiViolenceCase(id));
        setCaseData(data);
        
        // 加载鼓励留言
        const encouragementsData = await dispatch(getEncouragements(id));
        setEncouragements(encouragementsData);
        
        // 检查是否已收藏（实际应用中应该从API获取）
        const bookmarks = JSON.parse(localStorage.getItem('bookmarkedCases') || '[]');
        setIsBookmarked(bookmarks.includes(id));
      } catch (error) {
        console.error('加载案例数据失败:', error);
      }
    };
    
    loadCaseData();
  }, [dispatch, id]);
  
  // 处理点赞
  const handleLike = async () => {
    if (!isAuthenticated) {
      // 提示用户登录
      alert('请先登录后再点赞');
      return;
    }
    
    try {
      const updatedCase = await dispatch(likeCase(id));
      setCaseData(updatedCase);
    } catch (error) {
      console.error('点赞失败:', error);
    }
  };
  
  // 处理分享
  const handleShare = async () => {
    try {
      // 复制链接到剪贴板
      navigator.clipboard.writeText(window.location.href);
      
      // 更新分享计数
      const updatedCase = await dispatch(shareCase(id));
      setCaseData(updatedCase);
      
      alert('链接已复制到剪贴板');
    } catch (error) {
      console.error('分享失败:', error);
      alert('分享失败，请手动复制链接');
    }
  };
  
  // 处理收藏
  const handleBookmark = () => {
    if (!isAuthenticated) {
      // 提示用户登录
      alert('请先登录后再收藏');
      return;
    }
    
    // 获取当前收藏列表
    const bookmarks = JSON.parse(localStorage.getItem('bookmarkedCases') || '[]');
    
    if (isBookmarked) {
      // 取消收藏
      const updatedBookmarks = bookmarks.filter(caseId => caseId !== id);
      localStorage.setItem('bookmarkedCases', JSON.stringify(updatedBookmarks));
      setIsBookmarked(false);
    } else {
      // 添加收藏
      bookmarks.push(id);
      localStorage.setItem('bookmarkedCases', JSON.stringify(bookmarks));
      setIsBookmarked(true);
    }
  };
  
  // 提交鼓励留言
  const handleSubmitEncouragement = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      // 提示用户登录
      alert('请先登录后再发表留言');
      return;
    }
    
    if (!encouragementContent.trim()) return;
    
    try {
      await dispatch(addEncouragement(id, encouragementContent));
      
      // 重新加载留言
      const encouragementsData = await dispatch(getEncouragements(id));
      setEncouragements(encouragementsData);
      
      // 清空输入框
      setEncouragementContent('');
    } catch (error) {
      console.error('提交留言失败:', error);
    }
  };
  
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }
  
  if (!caseData) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="info">案例不存在或已被删除</Alert>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* 面包屑导航 */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/" underline="hover" color="inherit">
          首页
        </Link>
        <Link component={RouterLink} to="/anti-violence" underline="hover" color="inherit">
          反网络暴力
        </Link>
        <Typography color="text.primary">{caseData.title}</Typography>
      </Breadcrumbs>
      
      {/* 返回按钮 */}
      <Button
        component={RouterLink}
        to="/anti-violence"
        startIcon={<ArrowBack />}
        sx={{ mb: 2 }}
      >
        返回案例列表
      </Button>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          {/* 案例主体内容 */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h4" component="h1">
                {caseData.title}
              </Typography>
              <Box>
                <IconButton onClick={handleBookmark} color={isBookmarked ? 'primary' : 'default'}>
                  {isBookmarked ? <Bookmark /> : <BookmarkBorder />}
                </IconButton>
                <IconButton onClick={handleShare}>
                  <Share />
                </IconButton>
              </Box>
            </Box>
            
            <Box display="flex" alignItems="center" mb={2}>
              <Chip
                label={caseData.type}
                color="primary"
                size="medium"
                sx={{ mr: 1 }}
              />
              <Box display="flex" alignItems="center" sx={{ mr: 2 }}>
                <Visibility fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {caseData.view_count || 0}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" sx={{ mr: 2 }}>
                <ThumbUp fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {caseData.like_count || 0}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center">
                <Share fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {caseData.share_count || 0}
                </Typography>
              </Box>
            </Box>
            
            <Typography variant="subtitle1" color="text.secondary" paragraph>
              {caseData.description}
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="h6" gutterBottom>
              案例内容
            </Typography>
            <Typography variant="body1" paragraph>
              {caseData.content}
            </Typography>
            
            {caseData.images && caseData.images.length > 0 && (
              <Box my={2}>
                <Grid container spacing={1}>
                  {caseData.images.map((image, index) => (
                    <Grid item xs={6} sm={4} key={index}>
                      <img
                        src={image}
                        alt={`案例图片 ${index + 1}`}
                        style={{ width: '100%', borderRadius: '4px' }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="h6" gutterBottom>
              <Gavel sx={{ mr: 1, verticalAlign: 'middle' }} />
              法律分析
            </Typography>
            <Typography variant="body1" paragraph>
              {caseData.legal_analysis}
            </Typography>
            
            <Typography variant="h6" gutterBottom>
              <Lightbulb sx={{ mr: 1, verticalAlign: 'middle' }} />
              解决方案
            </Typography>
            <List>
              {caseData.solutions && caseData.solutions.map((solution, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <Lightbulb color="primary" />
                  </ListItemIcon>
                  <ListItemText primary={solution} />
                </ListItem>
              ))}
            </List>
            
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              <Article sx={{ mr: 1, verticalAlign: 'middle' }} />
              相关法律法规
            </Typography>
            <List dense>
              {caseData.related_laws && caseData.related_laws.map((law, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <Article color="info" />
                  </ListItemIcon>
                  <ListItemText primary={law} />
                </ListItem>
              ))}
            </List>
            
            <Box mt={2}>
              <Typography variant="subtitle2" gutterBottom>
                标签：
              </Typography>
              <Box>
                {caseData.tags && caseData.tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    size="small"
                    variant="outlined"
                    sx={{ mr: 0.5, mb: 0.5 }}
                  />
                ))}
              </Box>
            </Box>
            
            <Box mt={3} display="flex" justifyContent="center">
              <Button
                variant="contained"
                color="primary"
                startIcon={<ThumbUp />}
                onClick={handleLike}
                disabled={likeLoading}
              >
                {likeLoading ? '处理中...' : `点赞 (${caseData.like_count || 0})`}
              </Button>
              <Button
                variant="outlined"
                startIcon={<Share />}
                onClick={handleShare}
                sx={{ ml: 2 }}
              >
                分享
              </Button>
            </Box>
          </Paper>
          
          {/* 鼓励留言区 */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              守护者留言板
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              分享您的支持和鼓励，一起守护健康的网络环境
            </Typography>
            
            {encouragementError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {encouragementError}
              </Alert>
            )}
            
            <form onSubmit={handleSubmitEncouragement}>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="写下您的鼓励和支持..."
                value={encouragementContent}
                onChange={(e) => setEncouragementContent(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Box display="flex" justifyContent="flex-end">
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  endIcon={<Send />}
                  disabled={!encouragementContent.trim() || encouragementLoading}
                >
                  {encouragementLoading ? '发送中...' : '发送留言'}
                </Button>
              </Box>
            </form>
            
            <Divider sx={{ my: 3 }} />
            
            {encouragements.length > 0 ? (
              <List>
                {encouragements.map((encouragement, index) => (
                  <React.Fragment key={encouragement._id || index}>
                    <ListItem alignItems="flex-start">
                      <ListItemIcon>
                        <Avatar>
                          <Person />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="subtitle2">
                              {encouragement.user_name || '匿名用户'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(encouragement.created_at).toLocaleDateString()}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Typography
                            variant="body2"
                            color="text.primary"
                            sx={{ mt: 1 }}
                          >
                            {encouragement.content}
                          </Typography>
                        }
                      />
                    </ListItem>
                    {index < encouragements.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box textAlign="center" py={3}>
                <Typography variant="body2" color="text.secondary">
                  暂无留言，成为第一个留言的人吧
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          {/* 专家观点 */}
          {caseData.expert_opinions && caseData.expert_opinions.length > 0 && (
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
                专家观点
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {caseData.expert_opinions.map((opinion, index) => (
                <Card key={index} variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      {opinion.expert}
                    </Typography>
                    <Typography variant="body2">
                      {opinion.opinion}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Paper>
          )}
          
          {/* 相关资源 */}
          {caseData.resources && caseData.resources.length > 0 && (
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                <Article sx={{ mr: 1, verticalAlign: 'middle' }} />
                相关资源
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <List dense>
                {caseData.resources.map((resource, index) => (
                  <ListItem key={index} component="a" href={resource.link} target="_blank" button>
                    <ListItemIcon>
                      <Article color="primary" />
                    </ListItemIcon>
                    <ListItemText primary={resource.title} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
          
          {/* 相关案例 */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              相关案例
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {/* 这里应该从API获取相关案例，这里使用模拟数据 */}
            {[
              {
                _id: 'related1',
                title: '校园网络欺凌防治指南',
                type: '校园欺凌',
                description: '针对校园网络欺凌现象的防治措施和应对方法'
              },
              {
                _id: 'related2',
                title: '如何应对网络人身攻击',
                type: '网络攻击',
                description: '面对网络人身攻击的应对策略和法律保障'
              }
            ].map((relatedCase, index) => (
              <Card key={index} variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1">
                    {relatedCase.title}
                  </Typography>
                  <Chip
                    label={relatedCase.type}
                    size="small"
                    color="primary"
                    sx={{ mt: 1, mb: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {relatedCase.description}
                  </Typography>
                </CardContent>
                <Box px={2} pb={2}>
                  <Button
                    size="small"
                    component={RouterLink}
                    to={`/anti-violence/${relatedCase._id}`}
                    variant="text"
                  >
                    查看详情
                  </Button>
                </Box>
              </Card>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CaseDetailPage;