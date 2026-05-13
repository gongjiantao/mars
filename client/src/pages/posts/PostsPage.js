import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { createApiUrl, API_ENDPOINTS } from '../../config/api';
import MarsTreeHoleBackground from '../../components/common/MarsTreeHoleBackground';
import LikeEffect from '../../components/effects/LikeEffect';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Box,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  TextField,
  IconButton,
  Fab,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Menu,
  ListItemIcon,
  ListItemText,
  Collapse,
  Fade
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  Comment as CommentIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  FilterList as FilterIcon,
  ViewModule as ViewModuleIcon,
  ViewList as ViewListIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  AdminPanelSettings as AdminIcon,
  Search as SearchIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { canDeletePost, isAdmin } from '../../utils/permissions';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import axios from 'axios';
import { EmojiButton, EmojiDisplay, EmojiPicker } from '../../components/emojis/EmojiPicker';
import { parseEmojiContent } from '../../utils/emojiParser';

// 简化的懒加载图片组件
const LazyImage = ({ src, alt, height, sx, ...props }) => {
  return (
    <CardMedia
      component="img"
      height={height}
      image={src}
      alt={alt}
      loading="lazy"
      sx={{
        borderRadius: 'inherit',
        ...sx
      }}
      {...props}
    />
  );
};

// 简化的帖子卡片骨架屏组件
const PostCardSkeleton = ({ viewMode }) => (
  <Card 
    sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: viewMode === 'list' ? 'row' : 'column'
    }}
  >
    <Skeleton
      variant="rectangular"
      height={viewMode === 'list' ? 150 : 200}
      sx={{
        width: viewMode === 'list' ? 200 : '100%',
        flexShrink: 0,
        borderRadius: viewMode === 'list' ? '8px 0 0 8px' : '8px 8px 0 0'
      }}
    />
    <CardContent sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
        <Box sx={{ flexGrow: 1 }}>
          <Skeleton variant="text" width="60%" height={20} />
          <Skeleton variant="text" width="40%" height={16} />
        </Box>
        <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 2 }} />
      </Box>
      <Skeleton variant="text" width="100%" height={20} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="80%" height={20} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="60%" height={20} sx={{ mb: 3 }} />
      <Box sx={{ display: 'flex', gap: 0.5, mb: 3 }}>
        <Skeleton variant="rectangular" width={50} height={24} sx={{ borderRadius: 2 }} />
        <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 2 }} />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Skeleton variant="circular" width={32} height={32} />
        <Skeleton variant="text" width={30} height={20} />
        <Skeleton variant="circular" width={32} height={32} />
        <Skeleton variant="text" width={30} height={20} />
      </Box>
    </CardContent>
  </Card>
);

// 模拟的Redux action
const getPosts = () => async (dispatch) => {
  try {
    dispatch({ type: 'posts/getPostsStart' });
    // 这里应该是API调用
    const response = await new Promise(resolve => {
      setTimeout(() => {
        resolve({
          data: {
            posts: [
              {
                _id: '1',
                title: '我的第一首原创歌曲',
                content: '这是我创作的第一首歌曲，希望大家喜欢！',
                image: 'https://source.unsplash.com/random/300x200/?music',
                user: {
                  _id: '101',
                  name: '音乐爱好者',
                  avatar: 'https://source.unsplash.com/random/100x100/?portrait'
                },
                likes: 120,
                comments: 45,
                views: 1200,
                tags: ['原创', '流行'],
                createdAt: new Date().toISOString()
              },
              {
                _id: '2',
                title: '分享我的演唱会经历',
                content: '昨天参加了一场精彩的演唱会，想和大家分享我的感受...',
                image: 'https://source.unsplash.com/random/300x200/?concert',
                user: {
                  _id: '102',
                  name: '演唱会达人',
                  avatar: 'https://source.unsplash.com/random/100x100/?face'
                },
                likes: 89,
                comments: 32,
                views: 950,
                tags: ['演唱会', '现场'],
                createdAt: new Date(Date.now() - 86400000).toISOString()
              },
              {
                _id: '3',
                title: '音乐创作技巧分享',
                content: '作为一名音乐创作者，我想分享一些我的创作技巧和经验...',
                image: 'https://source.unsplash.com/random/300x200/?studio',
                user: {
                  _id: '103',
                  name: '创作者',
                  avatar: 'https://source.unsplash.com/random/100x100/?artist'
                },
                likes: 210,
                comments: 78,
                views: 1800,
                tags: ['创作', '技巧', '分享'],
                createdAt: new Date(Date.now() - 172800000).toISOString()
              }
            ],
            totalPages: 5
          }
        });
      }, 1000);
    });
    
    dispatch({
      type: 'posts/getPostsSuccess',
      payload: response.data
    });
  } catch (error) {
    dispatch({
      type: 'posts/getPostsFailure',
      payload: { error: error.message || '获取帖子失败' }
    });
  }
};

const PostsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const [refreshing, setRefreshing] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostEmotion, setNewPostEmotion] = useState('neutral');
  const [submitting, setSubmitting] = useState(false);
  
  // 管理员菜单状态
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPostId, setSelectedPostId] = useState(null);
  
  // 数据状态
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [posts, setPosts] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalPosts, setTotalPosts] = useState(0);
  const [bookmarkedPosts, setBookmarkedPosts] = useState(new Set());
  const [likedPosts, setLikedPosts] = useState(new Set());
  
  // 分页和筛选状态
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);
  const [sortBy, setSortBy] = useState('-created_at');
  const [filterTag, setFilterTag] = useState('');
  const [emotionFilter, setEmotionFilter] = useState('');
  
  // 布局状态
  const [viewMode, setViewMode] = useState('grid'); // 'grid' 或 'list'
  const [showFilters, setShowFilters] = useState(false);
  
  // 评论相关状态
  const [expandedComments, setExpandedComments] = useState(new Set());
  const [postComments, setPostComments] = useState({});
  const [loadingComments, setLoadingComments] = useState(new Set());
  const [newComment, setNewComment] = useState({});
  const [selectedEmojis, setSelectedEmojis] = useState({}); // 每个帖子的表情选择
  
  // 内容展开状态
  const [expandedPosts, setExpandedPosts] = useState(new Set());
  
  // 搜索状态
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // 无限滚动相关
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const observerRef = useRef();
  
  // 初始化标志
  const [isInitialized, setIsInitialized] = useState(false);
  
  // 可用的标签和情绪选项
  const availableTags = ['原创', '流行', '摇滚', '民谣', '电子', '古典', '爵士', '说唱'];
  const emotionOptions = [
    { value: '', label: '全部情绪' },
    { value: 'happy', label: '开心' },
    { value: 'sad', label: '伤感' },
    { value: 'excited', label: '兴奋' },
    { value: 'calm', label: '平静' },
    { value: 'angry', label: '愤怒' },
    { value: 'neutral', label: '中性' }
  ];
  
  // 获取或生成用户的匿名ID
  const getUserAnonymousId = () => {
    let anonymousId = localStorage.getItem('user_anonymous_id');
    if (!anonymousId) {
      anonymousId = Math.floor(Math.random() * 1000000).toString();
      localStorage.setItem('user_anonymous_id', anonymousId);
    }
    return anonymousId;
  };
  
  // 防抖处理筛选条件变化
  const debouncedFilters = useMemo(() => ({
    pageSize,
    sortBy,
    filterTag,
    emotionFilter
  }), [pageSize, sortBy, filterTag, emotionFilter]);

  const fetchPosts = useCallback(async (reset = false, pageToLoad = null) => {
    try {
      if (reset) {
        setLoading(true);
        setPosts([]);
        if (pageToLoad === null) {
          setCurrentPage(1);
        }
      } else {
        setLoadingMore(true);
      }
      setError(null);
      
      const targetPage = pageToLoad || (reset ? 1 : currentPage);
      const params = new URLSearchParams({
        page: targetPage,
        limit: pageSize,
        sort: sortBy
      });
      
      if (filterTag) params.append('tag', filterTag);
      if (emotionFilter) params.append('emotion', emotionFilter);
      
      const response = await axios.get(createApiUrl(`${API_ENDPOINTS.POSTS.LIST}?${params.toString()}`));
      
      if (response.data.success) {
        const newPosts = response.data.data;
        const userAnonymousId = getUserAnonymousId();
        
        // 初始化用户的点赞状态
        const newLikedPosts = new Set(likedPosts);
        newPosts.forEach(post => {
          if (post.liked_by && post.liked_by.includes(userAnonymousId)) {
            newLikedPosts.add(post._id);
          }
        });
        setLikedPosts(newLikedPosts);
        
        // 分页模式下总是替换数据，无限滚动模式下追加数据
        if (reset || pageToLoad) {
          setPosts(newPosts);
        } else {
          setPosts(prev => [...prev, ...newPosts]);
        }
        
        setTotalPages(response.data.totalPages || 1);
        setTotalPosts(response.data.total || 0);
        // 只有在无限滚动模式下才设置hasMore
        if (!pageToLoad) {
          setHasMore(newPosts.length === pageSize && targetPage < (response.data.totalPages || 1));
        } else {
          setHasMore(false); // 分页模式下禁用无限滚动
        }
      } else {
        setError('获取帖子失败');
      }
    } catch (error) {
      console.error('获取帖子失败:', error);
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [currentPage, pageSize, sortBy, filterTag, emotionFilter, likedPosts, getUserAnonymousId]);
  
  // 组件初始化时加载数据
  useEffect(() => {
    if (!isInitialized) {
      fetchPosts(true);
      setIsInitialized(true);
    }
  }, []);
  
  // 筛选条件变化时的防抖处理
  useEffect(() => {
    if (!isInitialized) return; // 初始化期间不触发
    
    const timeoutId = setTimeout(() => {
      fetchPosts(true);
    }, 300); // 300ms防抖
    
    return () => clearTimeout(timeoutId);
  }, [pageSize, sortBy, filterTag, emotionFilter]); // 只依赖筛选条件，避免频繁触发
  
  // 搜索功能的防抖处理
  useEffect(() => {
    if (!isInitialized) return;
    
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        // 在前端过滤帖子
        const filtered = posts.filter(post => 
          post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (post.tags && post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
        );
        setSearchResults(filtered);
        setIsSearching(true);
      } else {
        setSearchResults([]);
        setIsSearching(false);
      }
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [searchQuery, posts, isInitialized]);
  
  // 禁用无限滚动，使用分页模式
  // useEffect(() => {
  //   if (currentPage > 1) {
  //     fetchPosts(false);
  //   }
  // }, [currentPage]);

  // 无限滚动回调 - 已禁用
  const lastPostElementRef = useCallback(node => {
    // 分页模式下禁用无限滚动
    return;
  }, []);

  // 筛选和排序处理
  const handleFilterChange = (type, value) => {
    if (type === 'tag') {
      setFilterTag(value);
    } else if (type === 'emotion') {
      setEmotionFilter(value);
    } else if (type === 'sort') {
      setSortBy(value);
    }
    setCurrentPage(1);
  };

  const handlePageChange = (event, page) => {
    if (page !== currentPage) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // 使用分页模式加载指定页面的数据
      fetchPosts(true, page);
    }
  };

  const handlePageSizeChange = (event) => {
    setPageSize(event.target.value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilterTag('');
    setEmotionFilter('');
    setSortBy('-created_at');
    setCurrentPage(1);
  };
  
  // 管理员菜单处理函数
  const handleMenuOpen = (event, postId) => {
    setAnchorEl(event.currentTarget);
    setSelectedPostId(postId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPostId(null);
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('确定要删除这个帖子吗？')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(createApiUrl(API_ENDPOINTS.POSTS.DELETE(postId)), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // 删除成功后重新加载帖子列表
      fetchPosts(true);
      handleMenuClose();
      alert('帖子删除成功');
    } catch (error) {
      console.error('删除帖子失败:', error);
      alert('删除帖子失败，请重试');
    }
  };
  
  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;
    
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const userAnonymousId = getUserAnonymousId();
      const response = await axios.post(createApiUrl(API_ENDPOINTS.POSTS.CREATE), {
        content: newPostContent,
        emotion_tag: newPostEmotion,
        anonymous_id: userAnonymousId
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('帖子创建成功:', response.data);
      setNewPostContent('');
      setNewPostEmotion('neutral');
      setCreateDialogOpen(false);
      // 重新加载帖子
        fetchPosts(true);
    } catch (error) {
      console.error('创建帖子失败:', error);
      alert('创建帖子失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleLike = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('请先登录');
        return;
      }

      // 使用用户的固定匿名ID
      const userAnonymousId = getUserAnonymousId();

      const response = await axios.put(createApiUrl(API_ENDPOINTS.POSTS.LIKE(postId)), {
        anonymous_id: userAnonymousId
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // 检查响应是否成功且包含必要的数据
      if (response.data && response.data.success && response.data.data) {
        const { likes_count, is_liked } = response.data.data;
        
        // 更新本地状态
        const newLikedPosts = new Set(likedPosts);
        if (is_liked) {
          newLikedPosts.add(postId);
        } else {
          newLikedPosts.delete(postId);
        }
        setLikedPosts(newLikedPosts);
        
        // 直接更新帖子列表中的点赞数，避免重新加载
        setPosts(prevPosts => 
          prevPosts.map(post => {
            if (post._id === postId) {
              return {
                ...post,
                likes: likes_count
              };
            }
            return post;
          })
        );
      } else {
        // 如果响应格式不正确，显示错误信息
        const errorMsg = response.data?.error || '点赞操作失败';
        console.error('点赞响应格式错误:', response.data);
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
  
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchPosts(true);
    } finally {
      setTimeout(() => setRefreshing(false), 1000);
    }
  };
  
  // 切换评论展开状态
  const toggleComments = async (postId) => {
    const newExpandedComments = new Set(expandedComments);
    
    if (expandedComments.has(postId)) {
      // 收起评论
      newExpandedComments.delete(postId);
      setExpandedComments(newExpandedComments);
    } else {
      // 展开评论
      newExpandedComments.add(postId);
      setExpandedComments(newExpandedComments);
      
      // 如果还没有加载过评论，则加载
      if (!postComments[postId]) {
        await fetchComments(postId);
      }
    }
  };
  
  // 获取评论
  const fetchComments = async (postId) => {
    try {
      const newLoadingComments = new Set(loadingComments);
      newLoadingComments.add(postId);
      setLoadingComments(newLoadingComments);
      
      const response = await axios.get(createApiUrl(API_ENDPOINTS.POSTS.COMMENTS(postId)));
      
      if (response.data && response.data.success) {
        const comments = response.data.data || [];
        setPostComments(prev => ({
          ...prev,
          [postId]: comments
        }));
      }
      } catch (error) {
        console.error('获取评论失败:', error);
    } finally {
      const newLoadingComments = new Set(loadingComments);
      newLoadingComments.delete(postId);
      setLoadingComments(newLoadingComments);
    }
  };
  
  // 提交评论
  const handleSubmitComment = async (postId) => {
    const content = newComment[postId];
    if (!content || !content.trim()) {
      alert('请输入评论内容');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('请先登录');
        return;
      }
      
      const userAnonymousId = getUserAnonymousId();
      
      const requestData = {
        content: content.trim(),
        anonymous_id: userAnonymousId,
        emotion_tag: selectedEmojis[postId] || null
      };
      
      console.log('发送评论请求:', { postId, requestData });
      
      const response = await axios.post(createApiUrl(API_ENDPOINTS.POSTS.COMMENTS(postId)), requestData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data && response.data.success) {
        // 清空输入框和表情选择
        setNewComment(prev => ({
          ...prev,
          [postId]: ''
        }));
        setSelectedEmojis(prev => ({
          ...prev,
          [postId]: null
        }));
        
        // 重新获取评论
        await fetchComments(postId);
        
        // 更新帖子的评论数
        setPosts(prevPosts => 
          prevPosts.map(post => {
            if (post._id === postId) {
              return {
                ...post,
                comment_count: (post.comment_count || 0) + 1
              };
            }
            return post;
          })
        );
      }
    } catch (error) {
      console.error('提交评论失败:', error);
      alert('提交评论失败，请重试');
    }
  };
  
  // 处理评论输入变化
  const handleCommentChange = (postId, value) => {
    setNewComment(prev => ({
      ...prev,
      [postId]: value
    }));
  };

  // 处理表情选择
  const handleEmojiSelect = (postId, emojiKey) => {
    // 将表情文本插入到评论内容中
    const emojiText = `[${emojiKey}]`;
    setNewComment(prev => ({
      ...prev,
      [postId]: (prev[postId] || '') + emojiText
    }));
    setSelectedEmojis(prev => ({
      ...prev,
      [postId]: emojiKey
    }));
  };
  

  
  if (loading && posts.length === 0) {
    return (
      <Container sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          正在加载帖子...
        </Typography>
      </Container>
    );
  }
  
  if (error && posts.length === 0) {
    return (
      <Container sx={{ py: 8 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* 头部区域 */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 4, 
          mb: 4, 
          borderRadius: 3,
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 2 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start', 
            mb: 3,
            flexWrap: 'wrap',
            gap: 2,
            flexDirection: { xs: 'column', md: 'row' }
          }}>
            <Box>
              <Typography 
                variant="h3" 
                component="h1" 
                gutterBottom
                sx={{ 
                  fontWeight: 'bold',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}
              >
                🌟 火星树洞
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  opacity: 0.9,
                  mb: 1
                }}
              >
                在这里分享你的小秘密，与火星人一起探索内心的宇宙
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                共 {totalPosts} 个帖子
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <IconButton 
                onClick={() => setShowFilters(!showFilters)}
                sx={{ 
                  color: 'white',
                  bgcolor: showFilters ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                }}
              >
                <FilterIcon />
              </IconButton>
              
              <IconButton 
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                sx={{ 
                  color: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                }}
              >
                {viewMode === 'grid' ? <ViewListIcon /> : <ViewModuleIcon />}
              </IconButton>
              
              <IconButton
                onClick={handleRefresh}
                disabled={refreshing}
                sx={{ 
                  color: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                }}
              >
                <RefreshIcon sx={{ 
                  animation: refreshing ? 'spin 1s linear infinite' : 'none',
                  '@keyframes spin': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' }
                  }
                }} />
              </IconButton>
            </Box>
          </Box>
          
          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            flexWrap: 'wrap', 
            alignItems: 'center',
            width: { xs: '100%', md: 'auto' },
            flexDirection: { xs: 'column', sm: 'row' }
          }}>
            {/* 搜索框 */}
            <Box sx={{ 
              position: 'relative', 
              minWidth: { xs: '100%', sm: 250 },
              width: { xs: '100%', sm: 'auto' }
            }}>
              <TextField
                size="small"
                placeholder="搜索帖子内容..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: 3,
                    color: 'white',
                    '& fieldset': {
                      border: 'none'
                    },
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.25)'
                    },
                    '&.Mui-focused': {
                      bgcolor: 'rgba(255,255,255,0.3)'
                    }
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: 'rgba(255,255,255,0.7)',
                    opacity: 1
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <SearchIcon sx={{ color: 'rgba(255,255,255,0.7)', mr: 1 }} />
                  ),
                  endAdornment: searchQuery && (
                    <IconButton
                      size="small"
                      onClick={() => setSearchQuery('')}
                      sx={{ color: 'rgba(255,255,255,0.7)' }}
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  )
                }}
              />
            </Box>
            
            <Button
              onClick={() => setCreateDialogOpen(true)}
              variant="contained"
              size="large"
              startIcon={<EditIcon />}
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.3)',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.3)'
                }
              }}
            >
              发布新帖子
            </Button>
          </Box>
        </Box>
        
        {/* 装饰性背景 */}
        <Box
          sx={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            zIndex: 1
          }}
        />
      </Paper>
      
      {/* 筛选和排序控件 */}
      {showFilters && (
        <Paper sx={{ 
          p: { xs: 2, md: 3 }, 
          mb: 3, 
          bgcolor: 'rgba(255, 255, 255, 0.9)', 
          backdropFilter: 'blur(10px)', 
          borderRadius: 3 
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
              筛选和排序
            </Typography>
            <Chip 
              label={`${(isSearching ? searchResults : posts).length} 个帖子`}
              size="small"
              sx={{ 
                bgcolor: 'rgba(102, 126, 234, 0.1)',
                color: 'primary.main',
                fontWeight: 600
              }}
            />
          </Box>
          
          {/* 快速筛选标签 */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
              快速筛选：
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {emotionOptions.slice(1).map(option => (
                <Chip
                  key={option.value}
                  label={option.label}
                  size="small"
                  clickable
                  variant={emotionFilter === option.value ? 'filled' : 'outlined'}
                  color={emotionFilter === option.value ? 'primary' : 'default'}
                  onClick={() => handleFilterChange('emotion', emotionFilter === option.value ? '' : option.value)}
                  sx={{
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: 2
                    }
                  }}
                />
              ))}
            </Box>
          </Box>
          
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>排序方式</InputLabel>
                <Select
                  value={sortBy}
                  label="排序方式"
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                >
                  <MenuItem value="-created_at">最新发布</MenuItem>
                  <MenuItem value="created_at">最早发布</MenuItem>
                  <MenuItem value="-likes">最多点赞</MenuItem>
                  <MenuItem value="-comment_count">最多评论</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            

            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>情绪分类</InputLabel>
                <Select
                  value={emotionFilter}
                  label="情绪分类"
                  onChange={(e) => handleFilterChange('emotion', e.target.value)}
                >
                  {emotionOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <FormControl size="small" sx={{ minWidth: 80 }}>
                  <InputLabel>每页</InputLabel>
                  <Select
                    value={pageSize}
                    label="每页"
                    onChange={handlePageSizeChange}
                  >
                    <MenuItem value={6}>6</MenuItem>
                    <MenuItem value={12}>12</MenuItem>
                    <MenuItem value={24}>24</MenuItem>
                    <MenuItem value={48}>48</MenuItem>
                  </Select>
                </FormControl>
                
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={clearFilters}
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  清除筛选
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}
      
      {/* 火星树洞背景特效 */}
      <MarsTreeHoleBackground />
      
      {/* 搜索结果提示 */}
      {isSearching && (
        <Box sx={{ mb: 3 }}>
          <Alert 
            severity={searchResults.length > 0 ? "success" : "info"}
            sx={{ 
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              borderRadius: 2
            }}
          >
            {searchResults.length > 0 
              ? `找到 ${searchResults.length} 个相关帖子` 
              : `没有找到包含 "${searchQuery}" 的帖子`
            }
          </Alert>
        </Box>
      )}
      
      <Grid container spacing={3}>
        {/* 加载骨架屏 */}
        {loading && posts.length === 0 && (
          Array.from({ length: pageSize }).map((_, index) => (
            <Grid 
              item 
              key={`skeleton-${index}`}
              xs={12} 
              sm={viewMode === 'list' ? 12 : 6} 
              md={viewMode === 'list' ? 12 : 4}
            >
              <PostCardSkeleton viewMode={viewMode} />
            </Grid>
          ))
        )}
        
        {/* 实际帖子内容 */}
        {(isSearching ? searchResults : posts).map((post, index) => {
          const isExpanded = expandedPosts.has(post._id);
          const shouldTruncate = post.content && post.content.length > 200;
          const displayContent = shouldTruncate && !isExpanded 
            ? post.content.substring(0, 200) + '...' 
            : post.content;
            
          return (
            <Grid 
                item 
                key={post._id} 
                xs={12} 
                sm={viewMode === 'list' ? 12 : 6} 
                md={viewMode === 'list' ? 12 : 6}
                lg={viewMode === 'list' ? 12 : 4}
                ref={index === posts.length - 1 ? lastPostElementRef : null}
              >
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: viewMode === 'list' ? 'row' : 'column',
                    background: 'white',
                    border: '1px solid rgba(0, 0, 0, 0.12)'
                  }}
                >
                  {post.image && (
                    <LazyImage
                      src={post.image}
                      alt={post.title || '帖子图片'}
                      height={viewMode === 'list' ? 150 : 200}
                      sx={{ 
                        borderRadius: viewMode === 'list' ? '8px 0 0 8px' : '8px 8px 0 0',
                        width: viewMode === 'list' ? 200 : '100%',
                        flexShrink: 0
                      }}
                    />
                  )}
              <CardContent sx={{ flexGrow: 1, p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar 
                    sx={{ 
                      mr: 2, 
                      width: 40, 
                      height: 40, 
                      bgcolor: 'primary.main',
                      cursor: post.user_id ? 'pointer' : 'default',
                      '&:hover': post.user_id ? {
                        transform: 'scale(1.05)',
                        transition: 'transform 0.2s'
                      } : {}
                    }}
                    onClick={() => {
                      console.log('Avatar clicked, post data:', post);
                      console.log('post.user_id:', post.user_id);
                      console.log('post.user_id type:', typeof post.user_id);
                      if (post.user_id && post.user_id._id) {
                        console.log('Navigating to:', `/messages/${post.user_id._id}`);
                        navigate(`/messages/${post.user_id._id}`);
                      } else if (post.user_id) {
                        console.log('user_id exists but no _id, navigating to:', `/messages/${post.user_id}`);
                        navigate(`/messages/${post.user_id}`);
                      } else {
                        console.log('No user_id found, cannot navigate');
                      }
                    }}
                  >
                    {post.anonymous_id ? post.anonymous_id.slice(-2) : '匿'}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      匿名用户#{post.anonymous_id ? post.anonymous_id.slice(-4) : '0000'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {format(new Date(post.created_at), 'MM月dd日 HH:mm', { locale: zhCN })}
                    </Typography>
                  </Box>
                  {post.emotion_tag && (
                    <Chip 
                      label={emotionOptions.find(opt => opt.value === post.emotion_tag)?.label || post.emotion_tag}
                      size="small"
                      variant="outlined"
                      sx={{ 
                        borderRadius: 2,
                        fontSize: '0.75rem',
                        height: 24,
                        mr: 1
                      }}
                    />
                  )}
                  {/* 管理员菜单 */}
                  {isAdmin(user) && (
                    <>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, post._id)}
                        sx={{ ml: 1 }}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                      <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl) && selectedPostId === post._id}
                        onClose={handleMenuClose}
                        PaperProps={{
                          sx: { minWidth: 120 }
                        }}
                      >
                        <MenuItem onClick={() => handleDeletePost(post._id)}>
                          <ListItemIcon>
                            <DeleteIcon fontSize="small" color="error" />
                          </ListItemIcon>
                          <ListItemText primary="删除帖子" />
                        </MenuItem>
                      </Menu>
                    </>
                  )}
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Typography 
                    variant="body2" 
                    color="text.primary" 
                    sx={{ 
                      lineHeight: 1.6,
                      mb: shouldTruncate ? 1 : 0
                    }}
                  >
                    {parseEmojiContent(displayContent)}
                  </Typography>
                  {shouldTruncate && (
                    <Button
                      size="small"
                      onClick={() => {
                        const newExpanded = new Set(expandedPosts);
                        if (isExpanded) {
                          newExpanded.delete(post._id);
                        } else {
                          newExpanded.add(post._id);
                        }
                        setExpandedPosts(newExpanded);
                      }}
                      sx={{ 
                        p: 0, 
                        minWidth: 'auto',
                        color: 'primary.main',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        '&:hover': {
                          bgcolor: 'transparent',
                          textDecoration: 'underline'
                        }
                      }}
                    >
                      {isExpanded ? '收起' : '展开'}
                    </Button>
                  )}
                </Box>
                
                {post.tags && post.tags.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 3 }}>
                    {post.tags.slice(0, 3).map((tag) => (
                      <Chip 
                        key={tag} 
                        label={tag} 
                        size="small" 
                        variant="outlined"
                        sx={{ borderRadius: 2 }}
                      />
                    ))}
                  </Box>
                )}
                
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <LikeEffect
                      isLiked={likedPosts.has(post._id)}
                      onLike={() => handleLike(post._id)}
                      likesCount={post.likes || 0}
                      size="small"
                      showCount={true}
                    />
                    
                    <IconButton 
                      size="small" 
                      color={expandedComments.has(post._id) ? 'primary' : 'default'}
                      onClick={() => toggleComments(post._id)}
                    >
                      <CommentIcon fontSize="small" />
                    </IconButton>
                    <Typography 
                      variant="body2" 
                      color={expandedComments.has(post._id) ? 'primary.main' : 'text.secondary'}
                    >
                      {postComments[post._id]?.length || post.comment_count || 0}
                    </Typography>
                  </Box>
                </Box>
                
                {/* 评论区域 */}
                {expandedComments.has(post._id) && (
                  <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                    {/* 评论列表 */}
                    {loadingComments.has(post._id) ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                        <CircularProgress size={20} />
                      </Box>
                    ) : (
                      <Box sx={{ mb: 2 }}>
                        {postComments[post._id] && postComments[post._id].length > 0 ? (
                          postComments[post._id].map((comment, index) => (
                            <Box key={index} sx={{ mb: 1.5, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                <Avatar 
                                  sx={{ 
                                    width: 24, 
                                    height: 24, 
                                    mr: 1, 
                                    fontSize: '0.75rem',
                                    cursor: comment.user_id ? 'pointer' : 'default',
                                    '&:hover': comment.user_id ? {
                                      transform: 'scale(1.1)',
                                      transition: 'transform 0.2s'
                                    } : {}
                                  }}
                                  onClick={() => {
                                    console.log('Comment avatar clicked, comment data:', comment);
                                    console.log('comment.user_id:', comment.user_id);
                                    console.log('comment.user_id type:', typeof comment.user_id);
                                    if (comment.user_id && comment.user_id._id) {
                                      console.log('Navigating to:', `/messages/${comment.user_id._id}`);
                                      navigate(`/messages/${comment.user_id._id}`);
                                    } else if (comment.user_id) {
                                      console.log('user_id exists but no _id, navigating to:', `/messages/${comment.user_id}`);
                                      navigate(`/messages/${comment.user_id}`);
                                    } else {
                                      console.log('No user_id found, cannot navigate');
                                    }
                                  }}
                                >
                                  {comment.anonymous_id ? comment.anonymous_id.slice(-2) : 'U'}
                                </Avatar>
                                <Typography variant="caption" color="text.secondary">
                                  匿名用户{comment.anonymous_id ? comment.anonymous_id.slice(-2) : ''}
                                </Typography>
                                {comment.emotion_tag && (
                                  <Box sx={{ ml: 1 }}>
                                    <EmojiDisplay emojiKey={comment.emotion_tag} size={16} />
                                  </Box>
                                )}
                                <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                                  {comment.created_at ? format(new Date(comment.created_at), 'MM-dd HH:mm', { locale: zhCN }) : ''}
                                </Typography>
                              </Box>
                              <Typography variant="body2" sx={{ pl: 4 }}>
                                {parseEmojiContent(comment.content, 16)}
                              </Typography>
                            </Box>
                          ))
                        ) : (
                          <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                              暂无评论
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    )}
                    
                    {/* 评论输入框 */}
                    <Box sx={{ 
                      mt: 2,
                      p: 2,
                      bgcolor: 'rgba(248, 250, 252, 0.5)',
                      borderRadius: 2,
                      border: '1px solid rgba(0, 0, 0, 0.08)'
                    }}>
                      <Box sx={{ 
                        display: 'flex', 
                        gap: 1, 
                        alignItems: 'flex-end',
                        mb: 1
                      }}>
                        <TextField
                          size="small"
                          fullWidth
                          multiline
                          maxRows={3}
                          placeholder="写下你的评论..."
                          value={newComment[post._id] || ''}
                          onChange={(e) => handleCommentChange(post._id, e.target.value)}
                          variant="outlined"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              bgcolor: 'white',
                              borderRadius: 2,
                              fontSize: '0.875rem',
                              '& fieldset': {
                                borderColor: 'rgba(0, 0, 0, 0.12)'
                              },
                              '&:hover fieldset': {
                                borderColor: 'primary.main'
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: 'primary.main',
                                borderWidth: 2
                              }
                            },
                            '& .MuiInputBase-input': {
                              fontSize: '0.875rem',
                              lineHeight: 1.4
                            }
                          }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => handleSubmitComment(post._id)}
                          disabled={!newComment[post._id]?.trim()}
                          sx={{
                            bgcolor: 'primary.main',
                            color: 'white',
                            width: 36,
                            height: 36,
                            '&:hover': {
                              bgcolor: 'primary.dark'
                            },
                            '&:disabled': {
                              bgcolor: 'rgba(0, 0, 0, 0.12)',
                              color: 'rgba(0, 0, 0, 0.26)'
                            }
                          }}
                        >
                          <CommentIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      
                      {/* 表情选择器 */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <EmojiButton onEmojiSelect={(emojiKey) => handleEmojiSelect(post._id, emojiKey)} />
                        {selectedEmojis[post._id] && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              已选择:
                            </Typography>
                            <EmojiDisplay emojiKey={selectedEmojis[post._id]} size={20} />
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Box>
                )}
                
              </CardContent>
                </Card>
            </Grid>
          );
          })}
        
        {/* 加载更多骨架屏 */}
        {loadingMore && (
          Array.from({ length: 3 }).map((_, index) => (
            <Grid 
              item 
              key={`loading-skeleton-${index}`}
              xs={12} 
              sm={viewMode === 'list' ? 12 : 6} 
              md={viewMode === 'list' ? 12 : 4}
            >
              <PostCardSkeleton viewMode={viewMode} />
            </Grid>
          ))
        )}
      </Grid>
      
      {/* 加载更多指示器 */}
      {loadingMore && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      )}
      
      {/* 分页组件 */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination 
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            size="large"
            sx={{
              '& .MuiPaginationItem-root': {
                bgcolor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.95)'
                }
              }
            }}
          />
        </Box>
      )}
      
      {posts.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="white" gutterBottom>
            暂无帖子
          </Typography>
          <Typography variant="body2" color="rgba(255,255,255,0.8)">
            还没有人发布帖子，快来发布第一个吧！
          </Typography>
        </Box>
      )}
      
      {/* 创建帖子对话框 */}
      <Dialog 
        open={createDialogOpen} 
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
        fullScreen={window.innerWidth < 600}
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.95) 100%)',
            backdropFilter: 'blur(30px)',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.2)',
            overflow: 'hidden',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
              zIndex: 1
            }
          }
        }}
        TransitionProps={{
          timeout: 400
        }}
      >
        <DialogTitle sx={{ 
          textAlign: 'center', 
          fontWeight: 700,
          fontSize: '1.5rem',
          background: 'transparent',
          color: 'transparent',
          backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          pt: 4,
          pb: 2,
          position: 'relative'
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: 1
          }}>
            ✨ 发布新帖子
          </Box>
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'text.secondary',
              fontWeight: 400,
              mt: 0.5,
              opacity: 0.8
            }}
          >
            分享你的想法，连接更多朋友
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ 
          px: { xs: 2, md: 4 }, 
          pb: 2,
          pt: 1
        }}>
          {/* 内容输入区域 */}
          <Box sx={{ 
            position: 'relative',
            mb: 3
          }}>
            <TextField
              autoFocus
              multiline
              rows={8}
              fullWidth
              placeholder="在这里分享你的想法、心情或见解..."
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  bgcolor: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(10px)',
                  border: '2px solid transparent',
                  background: 'linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8)) padding-box, linear-gradient(135deg, #667eea, #764ba2) border-box',
                  transition: 'all 0.3s ease',
                  fontSize: '1rem',
                  lineHeight: 1.6,
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.15)'
                  },
                  '&.Mui-focused': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 35px rgba(102, 126, 234, 0.2)'
                  },
                  '& textarea': {
                    fontSize: '1rem',
                    lineHeight: 1.6
                  }
                },
                '& .MuiInputBase-input::placeholder': {
                  color: 'rgba(0, 0, 0, 0.5)',
                  opacity: 1
                }
              }}
            />
            
            {/* 字符计数器和表情选择器 */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mt: 1.5
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: newPostContent.length > 450 ? 'error.main' : 'text.secondary',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5
                  }}
                >
                  📝 {newPostContent.length}/500 字符
                </Typography>
                
                {/* 表情选择器 */}
                <EmojiButton
                  onEmojiSelect={(emojiKey) => {
                    const emojiText = `[${emojiKey}]`;
                    const newContent = newPostContent + emojiText;
                    if (newContent.length <= 500) {
                      setNewPostContent(newContent);
                    }
                  }}
                />
              </Box>
              
              {newPostContent.length > 0 && (
                <Box sx={{ 
                  width: 60, 
                  height: 4, 
                  bgcolor: 'rgba(0, 0, 0, 0.1)', 
                  borderRadius: 2,
                  overflow: 'hidden'
                }}>
                  <Box sx={{
                    width: `${Math.min((newPostContent.length / 500) * 100, 100)}%`,
                    height: '100%',
                    bgcolor: newPostContent.length > 450 ? 'error.main' : 'primary.main',
                    borderRadius: 2,
                    transition: 'all 0.3s ease'
                  }} />
                </Box>
              )}
            </Box>
          </Box>
          
          {/* 情绪分类选择 */}
          <FormControl 
            fullWidth 
            sx={{ 
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                bgcolor: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                border: '2px solid transparent',
                background: 'linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8)) padding-box, linear-gradient(135deg, #667eea, #764ba2) border-box',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: '0 8px 25px rgba(102, 126, 234, 0.15)'
                },
                '&.Mui-focused': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 35px rgba(102, 126, 234, 0.2)'
                }
              },
              '& .MuiInputLabel-root': {
                fontWeight: 500,
                color: 'text.primary'
              }
            }}
          >
            <InputLabel sx={{ fontSize: '1.4rem', fontWeight: 600 }}>🎭 选择情绪分类</InputLabel>
            <Select
              value={newPostEmotion}
              label="🎭 选择情绪分类"
              onChange={(e) => setNewPostEmotion(e.target.value)}
              sx={{
                fontSize: '1.1rem'
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    borderRadius: 2,
                    mt: 1,
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    '& .MuiMenuItem-root': {
                      fontSize: '1.1rem'
                    }
                  }
                }
              }}
            >
              {emotionOptions.map(option => (
                <MenuItem 
                  key={option.value} 
                  value={option.value}
                  sx={{
                    borderRadius: 1,
                    mx: 1,
                    my: 0.5,
                    fontSize: '1.1rem',
                    '&:hover': {
                      bgcolor: 'rgba(102, 126, 234, 0.1)'
                    }
                  }}
                >
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        
        <DialogActions sx={{ 
          p: { xs: 2, md: 4 }, 
          pt: 2,
          gap: 2,
          justifyContent: 'center',
          flexDirection: { xs: 'column', sm: 'row' }
        }}>
          <Button 
            onClick={() => setCreateDialogOpen(false)}
            variant="outlined"
            size="large"
            sx={{ 
              borderRadius: 3,
              px: 4,
              py: 1.5,
              borderColor: 'rgba(102, 126, 234, 0.3)',
              color: 'text.secondary',
              fontWeight: 600,
              transition: 'all 0.3s ease',
              '&:hover': {
                borderColor: 'rgba(102, 126, 234, 0.5)',
                bgcolor: 'rgba(102, 126, 234, 0.05)',
                transform: 'translateY(-1px)'
              }
            }}
          >
            取消
          </Button>
          <Button 
            onClick={handleCreatePost}
            variant="contained"
            size="large"
            disabled={!newPostContent.trim() || submitting || newPostContent.length > 500}
            sx={{
              borderRadius: 3,
              px: 4,
              py: 1.5,
              fontWeight: 600,
              fontSize: '1rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                boxShadow: '0 12px 35px rgba(102, 126, 234, 0.4)',
                transform: 'translateY(-2px)'
              },
              '&:disabled': {
                background: 'rgba(0, 0, 0, 0.12)',
                color: 'rgba(0, 0, 0, 0.26)',
                boxShadow: 'none',
                transform: 'none'
              }
            }}
          >
            {submitting ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={20} color="inherit" />
                发布中...
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                🚀 发布帖子
              </Box>
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PostsPage;