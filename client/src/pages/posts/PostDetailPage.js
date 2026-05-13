import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createApiUrl, API_ENDPOINTS } from '../../config/api';
import {
  Container,
  Typography,
  Box,
  Avatar,
  Chip,
  Divider,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  IconButton,
  Paper,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShareIcon from '@mui/icons-material/Share';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { format } from 'date-fns';
import { EmojiButton, EmojiDisplay } from '../../components/emojis/EmojiPicker';
import { parseEmojiContent } from '../../utils/emojiParser';

// 模拟的Redux action
const getPost = (id) => async (dispatch) => {
  try {
    dispatch({ type: 'posts/getPostStart' });
    // 这里应该是API调用
    const response = await new Promise(resolve => {
      setTimeout(() => {
        resolve({
          data: {
            post: {
              _id: id,
              title: '我的第一首原创歌曲',
              content: `这是我创作的第一首歌曲，希望大家喜欢！

创作这首歌的灵感来源于我的一次旅行经历。在旅途中，我被美丽的风景所打动，感受到了大自然的力量和生命的美好。回来后，我决定将这些感受融入到我的音乐创作中。

这首歌的旋律轻快而富有感染力，歌词则表达了对生活的热爱和对未来的期待。我希望通过这首歌，能够传递积极向上的能量，鼓励大家勇敢追求自己的梦想。

在创作过程中，我尝试了一些新的编曲技巧，融合了不同的音乐元素，希望能够带给听众耳目一新的感受。

非常感谢大家的支持和鼓励，这是我音乐创作道路上的重要一步。期待与大家分享更多的作品！`,
              images: [
                'https://source.unsplash.com/random/800x600/?music',
                'https://source.unsplash.com/random/800x600/?concert',
                'https://source.unsplash.com/random/800x600/?studio'
              ],
              user: {
                _id: '101',
                name: '音乐爱好者',
                avatar: 'https://source.unsplash.com/random/100x100/?portrait',
                bio: '热爱音乐创作的普通人'
              },
              likes: 120,
              comments: 45,
              views: 1200,
              tags: ['原创', '流行', '音乐创作'],
              createdAt: new Date().toISOString()
            }
          }
        });
      }, 1000);
    });
    
    dispatch({
      type: 'posts/getPostSuccess',
      payload: response.data
    });
    
    return response.data;
  } catch (error) {
    dispatch({
      type: 'posts/getPostFailure',
      payload: { error: error.message || '获取帖子详情失败' }
    });
    throw error;
  }
};

const getComments = (postId) => async (dispatch) => {
  try {
    dispatch({ type: 'comments/getCommentsStart' });
    
    const response = await fetch(createApiUrl(`${API_ENDPOINTS.COMMENTS.LIST}?post_id=${postId}`), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || '获取评论失败');
    }
    
    dispatch({
      type: 'comments/getCommentsSuccess',
      payload: data
    });
    
    return { comments: data.data || [] };
  } catch (error) {
    dispatch({
      type: 'comments/getCommentsFailure',
      payload: { error: error.message || '获取评论失败' }
    });
    throw error;
  }
};

// 获取或生成用户匿名ID
const getUserAnonymousId = () => {
  let anonymousId = localStorage.getItem('user_anonymous_id');
  if (!anonymousId) {
    anonymousId = 'anon_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('user_anonymous_id', anonymousId);
  }
  return anonymousId;
};



const addComment = (postId, content, selectedEmoji) => async (dispatch) => {
  try {
    dispatch({ type: 'comments/addCommentStart' });
    
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('请先登录');
    }

    const response = await fetch(createApiUrl(API_ENDPOINTS.COMMENTS.CREATE), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        post_id: postId,
        content: content,
        emotion_tag: selectedEmoji
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || '添加评论失败');
    }
    
    dispatch({
      type: 'comments/addCommentSuccess',
      payload: data
    });
    
    return data;
  } catch (error) {
    dispatch({
      type: 'comments/addCommentFailure',
      payload: { error: error.message || '添加评论失败' }
    });
    throw error;
  }
};



const PostDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // 这些状态通常从Redux store获取
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentContent, setCommentContent] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState(null);
  
  // 获取帖子详情和评论
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const postData = await dispatch(getPost(id));
        setPost(postData.post);
        
        // 初始化点赞状态
        const userAnonymousId = getUserAnonymousId();
        const post = postData.post;
        if (post && post.liked_by && Array.isArray(post.liked_by)) {
          setIsLiked(post.liked_by.includes(userAnonymousId));
        }
        
        const commentsData = await dispatch(getComments(id));
        setComments(commentsData.comments);
        
        setLoading(false);
      } catch (err) {
        setError(err.message || '加载数据失败');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [dispatch, id]);
  
  // 处理点赞
  const handleLike = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('请先登录');
        return;
      }
      
      // 使用用户的固定匿名ID
      const userAnonymousId = getUserAnonymousId();
      
      const response = await fetch(createApiUrl(API_ENDPOINTS.POSTS.LIKE(id)), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          anonymous_id: userAnonymousId
        })
      });
      
      const data = await response.json();
      
      // 检查响应是否成功
      if (data && data.success) {
        if (data.data) {
          // 新格式：包含data字段
          const { likes_count, is_liked } = data.data;
          setIsLiked(is_liked);
          setPost(prev => ({ ...prev, likes: likes_count }));
        } else {
          // 旧格式：直接包含likes_count和is_liked
          if (data.likes_count !== undefined && data.is_liked !== undefined) {
            setIsLiked(data.is_liked);
            setPost(prev => ({ ...prev, likes: data.likes_count }));
          } else {
            // 如果都没有，重新获取帖子数据
            console.log('点赞成功，重新获取帖子数据');
            const postData = await dispatch(getPost(id));
            if (postData && postData.post) {
              setPost(postData.post);
              const userAnonymousId = getUserAnonymousId();
              if (postData.post.liked_by && Array.isArray(postData.post.liked_by)) {
                setIsLiked(postData.post.liked_by.includes(userAnonymousId));
              }
            }
          }
        }
      } else {
        // 如果响应格式不正确，显示错误信息
        const errorMsg = data?.error || '点赞操作失败';
        console.error('点赞响应格式错误:', data);
        alert(errorMsg);
      }
    } catch (error) {
      console.error('点赞失败:', error);
      // 检查是否是网络错误或服务器错误
      if (error.response) {
        const errorMsg = error.response.data?.error || '服务器错误';
        alert(`点赞失败: ${errorMsg}`);
      } else if (error.request) {
        alert('网络连接失败，请检查网络');
      } else {
        alert('点赞失败，请重试');
      }
    }
  };
  
  // 处理收藏
  const handleBookmark = () => {
    // 检查用户是否登录
    const isAuthenticated = true; // 这应该从Redux store获取
    
    if (!isAuthenticated) {
      // 提示用户登录
      alert('请先登录');
      return;
    }
    
    setIsBookmarked(!isBookmarked);
    // 这里应该有一个dispatch调用收藏API的action
  };
  
  // 处理分享
  const handleShare = () => {
    // 实现分享逻辑
    alert(`分享链接: ${window.location.href}`);
  };
  
  // 提交评论
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!commentContent.trim()) return;
    
    // 检查用户是否登录
    const token = localStorage.getItem('token');
    
    if (!token) {
      alert('请先登录');
      return;
    }
    
    try {
      setSubmittingComment(true);
      const result = await dispatch(addComment(id, commentContent, selectedEmoji));
      // 后端返回的数据结构是 { success: true, data: comment }
      const newComment = result.data || result.comment;
      setComments(prev => [newComment, ...prev]);
      setCommentContent('');
      setSelectedEmoji(null); // 重置表情选择
      setSubmittingComment(false);
      // 更新帖子的评论数
      setPost(prev => ({ ...prev, comments_count: (prev.comments_count || 0) + 1 }));
    } catch (err) {
      alert(err.message || '评论失败');
      setSubmittingComment(false);
    }
  };

  // 处理表情选择
  const handleEmojiSelect = (emojiKey) => {
    // 将表情文本插入到评论内容中
    const emojiText = `[${emojiKey}]`;
    setCommentContent(prev => prev + emojiText);
    setSelectedEmoji(emojiKey);
  };
  
  if (loading) {
    return (
      <Container sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          正在加载帖子详情...
        </Typography>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container sx={{ py: 8 }}>
        <Alert severity="error">{error}</Alert>
        <Box sx={{ mt: 2 }}>
          <Button
            component={Link}
            to="/posts"
            startIcon={<ArrowBackIcon />}
            variant="outlined"
          >
            返回帖子列表
          </Button>
        </Box>
      </Container>
    );
  }
  
  if (!post) {
    return (
      <Container sx={{ py: 8 }}>
        <Alert severity="info">找不到该帖子</Alert>
        <Box sx={{ mt: 2 }}>
          <Button
            component={Link}
            to="/posts"
            startIcon={<ArrowBackIcon />}
            variant="outlined"
          >
            返回帖子列表
          </Button>
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      {/* 返回按钮 */}
      <Box sx={{ mb: 4 }}>
        <Button
          component={Link}
          to="/posts"
          startIcon={<ArrowBackIcon />}
          variant="outlined"
        >
          返回帖子列表
        </Button>
      </Box>
      
      {/* 帖子标题和操作按钮 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {post.title}
        </Typography>
        
        <Box>
          <IconButton onClick={handleLike} color={isLiked ? 'error' : 'default'}>
            {isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          </IconButton>
          
          <IconButton onClick={handleBookmark} color={isBookmarked ? 'primary' : 'default'}>
            {isBookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
          </IconButton>
          
          <IconButton onClick={handleShare} color="default">
            <ShareIcon />
          </IconButton>
        </Box>
      </Box>
      
      {/* 作者信息和发布时间 */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Avatar 
          src={post.user.avatar ? createApiUrl(post.user.avatar) : undefined} 
          sx={{ 
            width: 48, 
            height: 48, 
            mr: 2,
            cursor: 'pointer',
            '&:hover': {
              transform: 'scale(1.05)',
              transition: 'transform 0.2s'
            }
          }}
          onClick={() => navigate(`/profile/${post.user.username}`)}
        />
        <Box>
          <Typography variant="subtitle1">{post.user.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            {post.user.bio}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            发布于 {format(new Date(post.createdAt), 'yyyy-MM-dd HH:mm')}
          </Typography>
        </Box>
      </Box>
      
      {/* 帖子统计信息 */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <Chip icon={<FavoriteIcon fontSize="small" />} label={`${post.likes} 赞`} variant="outlined" />
        <Chip icon={<SendIcon fontSize="small" />} label={`${post.comments} 评论`} variant="outlined" />
        <Chip icon={<VisibilityIcon fontSize="small" />} label={`${post.views} 浏览`} variant="outlined" />
      </Box>
      
      {/* 帖子标签 */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 4 }}>
        {post.tags.map((tag) => (
          <Chip key={tag} label={tag} size="small" color="primary" variant="outlined" />
        ))}
      </Box>
      
      {/* 帖子内容 */}
      <Paper elevation={0} sx={{ p: 3, mb: 4, bgcolor: 'background.paper', borderRadius: 2 }}>
        <Typography variant="body1" sx={{ whiteSpace: 'pre-line', mb: 4 }}>
          {post.content}
        </Typography>
        
        {/* 帖子图片 */}
        {post.images && post.images.length > 0 && (
          <Grid container spacing={2} sx={{ mb: 2 }}>
            {post.images.map((image, index) => (
              <Grid item xs={12} md={post.images.length === 1 ? 12 : 6} key={index}>
                <Box
                  component="img"
                  src={image}
                  alt={`帖子图片 ${index + 1}`}
                  sx={{
                    width: '100%',
                    borderRadius: 1,
                    maxHeight: 500,
                    objectFit: 'cover',
                  }}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
      
      <Divider sx={{ mb: 4 }} />
      
      {/* 评论区 */}
      <Typography variant="h5" component="h2" gutterBottom>
        评论 ({post.comments})
      </Typography>
      
      {/* 评论表单 */}
      <Box component="form" onSubmit={handleSubmitComment} sx={{ mb: 4 }}>
        <TextField
          fullWidth
          multiline
          rows={3}
          placeholder="写下你的评论..."
          value={commentContent}
          onChange={(e) => setCommentContent(e.target.value)}
          disabled={submittingComment}
          sx={{ mb: 2 }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <EmojiButton onEmojiSelect={handleEmojiSelect} />
            {selectedEmoji && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  已选择:
                </Typography>
                <EmojiDisplay emojiKey={selectedEmoji} size={24} />
              </Box>
            )}
          </Box>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            endIcon={<SendIcon />}
            disabled={!commentContent.trim() || submittingComment}
          >
            {submittingComment ? '发送中...' : '发送评论'}
          </Button>
        </Box>
      </Box>
      
      {/* 评论列表 */}
      {comments.length > 0 ? (
        <Box>
          {comments.map((comment) => (
            <Paper key={comment._id} sx={{ p: 2, mb: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <Avatar src={comment.user.avatar} sx={{ mr: 2 }} />
                <Box sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2">{comment.user.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {format(new Date(comment.createdAt), 'yyyy-MM-dd HH:mm')}
                    </Typography>
                  </Box>
                  <Typography variant="body2">
                    {parseEmojiContent(comment.content, 16)}
                  </Typography>
                  {comment.emotion_tag && (
                    <Box sx={{ mt: 1 }}>
                      <EmojiDisplay emojiKey={comment.emotion_tag} size={20} />
                    </Box>
                  )}
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>
      ) : (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            暂无评论，成为第一个评论的人吧！
          </Typography>
        </Box>
      )}
      
      {/* 相关帖子推荐 */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          相关推荐
        </Typography>
        <Grid container spacing={3}>
          {[1, 2, 3].map((item) => (
            <Grid item xs={12} sm={4} key={item}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="h3" gutterBottom>
                    相关帖子标题 {item}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    这是一个相关帖子的简短描述...
                  </Typography>
                  <Button
                    component={Link}
                    to={`/posts/${item}`}
                    size="small"
                    color="primary"
                  >
                    查看详情
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default PostDetailPage;