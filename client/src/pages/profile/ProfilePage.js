import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createApiUrl, API_ENDPOINTS } from '../../config/api';
import { updateProfile } from '../../store/slices/authSlice';
import {
  Container,
  Box,
  Grid,
  Paper,
  Typography,
  Avatar,
  Button,
  Tabs,
  Tab,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  CircularProgress,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  Edit as EditIcon,
  Favorite as FavoriteIcon,
  Comment as CommentIcon,
  Share as ShareIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Cake as CakeIcon,
  LocationOn as LocationIcon,
  Link as LinkIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  Message as MessageIcon
} from '@mui/icons-material';
// 假设这些action会在后续实现
// import { getUserProfile, getUserPosts, getUserEvents } from '../../store/slices/profileSlice';

// 自定义TabPanel组件
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ProfilePage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);
  
  // 模拟数据，实际应用中应该从Redux获取
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [events, setEvents] = useState([]);
  const [profileLoading, setProfileLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 标签状态
  const [tabValue, setTabValue] = useState(0);
  
  // 编辑对话框状态
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    nickname: '',
    bio: ''
  });
  const [editLoading, setEditLoading] = useState(false);

  // 是否是当前用户的个人资料
  const isOwnProfile = user && (username === user.username || (!username && user));

  // 获取用户统计数据
  const fetchUserStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('请先登录');
        setProfileLoading(false);
        return;
      }

      const response = await fetch(createApiUrl(API_ENDPOINTS.AUTH.STATS), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        return result.data;
      } else {
        console.error('获取用户统计失败');
        return {
          posts: 0,
          comments: 0,
          badges: 0,
          totalLikes: 0,
          followers: 0,
          following: 0
        };
      }
    } catch (error) {
      console.error('获取用户统计失败:', error);
      return {
        posts: 0,
        comments: 0,
        badges: 0,
        totalLikes: 0,
        followers: 0,
        following: 0
      };
    }
  };

  // 获取用户资料数据
  useEffect(() => {
    // 如果没有指定username，则显示当前登录用户的资料
    if (!username && user) {
      const loadUserProfile = async () => {
        const stats = await fetchUserStats();
        
        // 使用当前登录用户的真实数据
        setProfile({
          id: user.id || user._id,
          username: user.username,
          nickname: user.nickname || user.username,
          avatar: user.avatar,
          bio: user.bio || '这个人很懒，什么都没有留下。',
          email: user.email,
          location: user.location || '',
          website: user.website || '',
          joinDate: user.created_at || user.createdAt || '2023-01-15',
          followers: stats.followers,
          following: stats.following,
          posts: stats.posts,
          events: 0, // 暂时设为0，因为统计API中没有活动数据
          totalLikes: stats.totalLikes
        });
        
        // 暂时设置空的帖子和活动数据
        setPosts([]);
        setEvents([]);
        
        setProfileLoading(false);
      };
      
      loadUserProfile();
    } else if (username) {
      // 如果指定了username但不是当前用户，暂时显示错误
      setError('暂不支持查看其他用户资料');
      setProfileLoading(false);
    } else {
      setError('未找到用户资料');
      setProfileLoading(false);
    }
    
    // 实际应用中应该调用Redux action
    // if (username) {
    //   dispatch(getUserProfile(username));
    //   dispatch(getUserPosts(username));
    //   dispatch(getUserEvents(username));
    // } else if (user) {
    //   dispatch(getUserProfile(user.username));
    //   dispatch(getUserPosts(user.username));
    //   dispatch(getUserEvents(user.username));
    // }
  }, [username, user, dispatch]);

  // 监听Redux中user状态的变化，同步更新本地profile状态
  useEffect(() => {
    if (!username && user && profile) {
      // 只更新可能变化的字段，保持统计数据不变
      setProfile(prev => ({
        ...prev,
        nickname: user.nickname || user.username,
        bio: user.bio || '这个人很懒，什么都没有留下。',
        avatar: user.avatar,
        location: user.location || '',
        website: user.website || ''
      }));
    }
  }, [user?.nickname, user?.bio, user?.avatar, user?.location, user?.website, username]);

  // 处理标签切换
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // 处理编辑个人资料
  const handleEditProfile = () => {
    if (profile) {
      setEditFormData({
        nickname: profile.nickname || '',
        bio: profile.bio || ''
      });
      setEditDialogOpen(true);
    }
  };

  // 处理编辑对话框关闭
  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
    setEditFormData({
      nickname: '',
      bio: ''
    });
  };

  // 处理表单输入变化
  const handleEditFormChange = (field) => (event) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  // 处理保存编辑
  const handleSaveEdit = async () => {
    if (!editFormData.nickname.trim()) {
      return;
    }
    
    setEditLoading(true);
    try {
      // 调用Redux action更新用户资料
      const result = await dispatch(updateProfile({
        nickname: editFormData.nickname.trim(),
        bio: editFormData.bio.trim()
      }));

      if (updateProfile.fulfilled.match(result)) {
        // 更新成功，关闭对话框
        // 不需要手动更新profile状态，因为useEffect会监听Redux user状态变化并自动同步
        handleEditDialogClose();
      }
    } catch (error) {
      console.error('更新资料失败:', error);
    } finally {
      setEditLoading(false);
    }
  };

  // 格式化日期
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('zh-CN', options);
  };

  if (profileLoading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Alert severity="info">未找到用户资料</Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 6 }}>
        {/* 个人资料头部 */}
        <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar
                src={profile.avatar ? createApiUrl(profile.avatar) : undefined}
                alt={profile.nickname}
                sx={{ width: 150, height: 150, mb: 2 }}
              />
              {isOwnProfile && (
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={handleEditProfile}
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  编辑资料
                </Button>
              )}
            </Grid>
            <Grid item xs={12} md={9}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" component="h1">
                  {profile.nickname}
                </Typography>
                <Box>
                  <Chip
                    icon={<PersonIcon />}
                    label={`@${profile.username}`}
                    variant="outlined"
                    sx={{ mr: 1 }}
                  />
                  {!isOwnProfile && (
                    <>
                      <Button 
                        variant="contained" 
                        color="primary" 
                        startIcon={<AddIcon />}
                        sx={{ mr: 1 }}
                      >
                        关注
                      </Button>
                      <Button 
                        variant="outlined" 
                        color="primary" 
                        startIcon={<MessageIcon />}
                        onClick={() => navigate(`/messages/${profile.id}`)}
                      >
                        私信
                      </Button>
                    </>
                  )}
                </Box>
              </Box>
              
              <Typography variant="body1" paragraph>
                {profile.bio}
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item>
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                    <EmailIcon fontSize="small" sx={{ mr: 1 }} />
                    {profile.email}
                  </Typography>
                </Grid>
                {profile.location && (
                  <Grid item>
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocationIcon fontSize="small" sx={{ mr: 1 }} />
                      {profile.location}
                    </Typography>
                  </Grid>
                )}
                {profile.website && (
                  <Grid item>
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                      <LinkIcon fontSize="small" sx={{ mr: 1 }} />
                      <a href={profile.website} target="_blank" rel="noopener noreferrer">
                        {profile.website}
                      </a>
                    </Typography>
                  </Grid>
                )}
                <Grid item>
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                    <CakeIcon fontSize="small" sx={{ mr: 1 }} />
                    加入于 {formatDate(profile.joinDate)}
                  </Typography>
                </Grid>
              </Grid>
              
              <Box sx={{ display: 'flex', gap: 3 }}>
                <Typography variant="body2">
                  <strong>{profile.posts}</strong> 帖子
                </Typography>
                <Typography variant="body2">
                  <strong>{profile.followers}</strong> 粉丝
                </Typography>
                <Typography variant="body2">
                  <strong>{profile.following}</strong> 关注
                </Typography>
                <Typography variant="body2">
                  <strong>{profile.totalLikes || 0}</strong> 获得点赞
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
        
        {/* 内容标签页 */}
        <Box sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="profile tabs"
              centered
            >
              <Tab label="帖子" id="profile-tab-0" aria-controls="profile-tabpanel-0" />
              <Tab label="活动" id="profile-tab-1" aria-controls="profile-tabpanel-1" />
              <Tab label="收藏" id="profile-tab-2" aria-controls="profile-tabpanel-2" />
            </Tabs>
          </Box>
          
          {/* 帖子标签页 */}
          <TabPanel value={tabValue} index={0}>
            {posts.length > 0 ? (
              <Grid container spacing={3}>
                {posts.map((post) => (
                  <Grid item xs={12} sm={6} md={4} key={post.id}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <CardActionArea>
                        {post.image && (
                          <CardMedia
                            component="img"
                            height="140"
                            image={post.image}
                            alt={post.title}
                          />
                        )}
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Typography gutterBottom variant="h6" component="div">
                            {post.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {post.content.length > 100 ? `${post.content.substring(0, 100)}...` : post.content}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(post.createdAt)}
                          </Typography>
                        </CardContent>
                      </CardActionArea>
                      <Divider />
                      <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1 }}>
                        <IconButton aria-label="like" size="small">
                          <FavoriteIcon fontSize="small" />
                        </IconButton>
                        <Typography variant="body2" sx={{ mr: 2 }}>
                          {post.likes}
                        </Typography>
                        <IconButton aria-label="comment" size="small">
                          <CommentIcon fontSize="small" />
                        </IconButton>
                        <Typography variant="body2" sx={{ mr: 2 }}>
                          {post.comments}
                        </Typography>
                        <IconButton aria-label="share" size="small">
                          <ShareIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  暂无帖子
                </Typography>
                {isOwnProfile && (
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    sx={{ mt: 2 }}
                  >
                    发布新帖子
                  </Button>
                )}
              </Box>
            )}
          </TabPanel>
          
          {/* 活动标签页 */}
          <TabPanel value={tabValue} index={1}>
            {events.length > 0 ? (
              <Grid container spacing={3}>
                {events.map((event) => (
                  <Grid item xs={12} sm={6} md={4} key={event.id}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <CardActionArea>
                        {event.image && (
                          <CardMedia
                            component="img"
                            height="140"
                            image={event.image}
                            alt={event.title}
                          />
                        )}
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Typography gutterBottom variant="h6" component="div">
                            {event.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {event.description}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <LocationIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {event.location}
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(event.date)}
                          </Typography>
                        </CardContent>
                      </CardActionArea>
                      <Divider />
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          {event.participants} 人参与
                        </Typography>
                        <Button size="small" variant="outlined">
                          查看详情
                        </Button>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  暂无活动
                </Typography>
                {isOwnProfile && (
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    sx={{ mt: 2 }}
                  >
                    创建活动
                  </Button>
                )}
              </Box>
            )}
          </TabPanel>
          
          {/* 收藏标签页 */}
          <TabPanel value={tabValue} index={2}>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                暂无收藏内容
              </Typography>
            </Box>
          </TabPanel>
        </Box>

        {/* 编辑资料对话框 */}
        <Dialog 
          open={editDialogOpen} 
          onClose={handleEditDialogClose}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>编辑个人资料</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="昵称"
              type="text"
              fullWidth
              variant="outlined"
              value={editFormData.nickname}
              onChange={handleEditFormChange('nickname')}
              sx={{ mb: 2 }}
              required
              helperText="请输入您的昵称"
            />
            <TextField
              margin="dense"
              label="个性签名"
              type="text"
              fullWidth
              variant="outlined"
              multiline
              rows={3}
              value={editFormData.bio}
              onChange={handleEditFormChange('bio')}
              helperText="介绍一下自己吧"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleEditDialogClose} disabled={editLoading}>
              取消
            </Button>
            <Button 
              onClick={handleSaveEdit} 
              variant="contained"
              disabled={editLoading || !editFormData.nickname.trim()}
            >
              {editLoading ? <CircularProgress size={20} /> : '保存'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default ProfilePage;