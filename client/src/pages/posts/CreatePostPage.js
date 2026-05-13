import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  IconButton,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Fade,
  Avatar,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ImageIcon from '@mui/icons-material/Image';
import SendIcon from '@mui/icons-material/Send';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import MoodIcon from '@mui/icons-material/Mood';
import MoodBadIcon from '@mui/icons-material/MoodBad';
import SentimentSatisfiedIcon from '@mui/icons-material/SentimentSatisfied';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CloseIcon from '@mui/icons-material/Close';

// 模拟的Redux action
const createPost = (postData) => async (dispatch) => {
  try {
    dispatch({ type: 'posts/createPostStart' });
    // 这里应该是API调用
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    dispatch({
      type: 'posts/createPostSuccess',
      payload: { post: { ...postData, _id: Date.now().toString() } }
    });
    
    return { success: true, postId: Date.now().toString() };
  } catch (error) {
    dispatch({
      type: 'posts/createPostFailure',
      payload: { error: error.message || '创建帖子失败' }
    });
    throw error;
  }
};

const CreatePostPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tag, setTag] = useState('');
  const [tags, setTags] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // 添加标签
  const handleAddTag = () => {
    if (tag.trim() && !tags.includes(tag.trim())) {
      setTags([...tags, tag.trim()]);
      setTag('');
    }
  };
  
  // 删除标签
  const handleDeleteTag = (tagToDelete) => {
    setTags(tags.filter((t) => t !== tagToDelete));
  };
  
  // 处理图片上传
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    // 在实际应用中，这里应该上传图片到服务器或云存储
    // 这里仅做模拟，将文件转换为URL
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name
    }));
    
    setImages([...images, ...newImages]);
  };
  
  // 删除图片
  const handleRemoveImage = (index) => {
    const newImages = [...images];
    // 释放URL对象
    URL.revokeObjectURL(newImages[index].preview);
    newImages.splice(index, 1);
    setImages(newImages);
  };
  
  // 提交表单
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      setError('标题和内容不能为空');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // 在实际应用中，这里应该先上传图片，然后将图片URL添加到帖子数据中
      const postData = {
        title: title.trim(),
        content: content.trim(),
        tags,
        // 模拟图片URL
        images: images.length > 0 
          ? images.map((_, index) => `https://source.unsplash.com/random/800x600/?music&sig=${index}`)
          : []
      };
      
      const result = await dispatch(createPost(postData));
      
      if (result.success) {
        // 清理图片URL对象
        images.forEach(img => URL.revokeObjectURL(img.preview));
        // 跳转到新创建的帖子详情页
        navigate(`/posts/${result.postId}`);
      }
    } catch (err) {
      setError(err.message || '创建帖子失败');
      setLoading(false);
    }
  };
  
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
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
      
      <Typography variant="h4" component="h1" gutterBottom>
        创建新帖子
      </Typography>
      
      <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit}>
          {/* 标题 */}
          <TextField
            fullWidth
            label="标题"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            margin="normal"
            required
            disabled={loading}
          />
          
          {/* 内容 */}
          <TextField
            fullWidth
            label="内容"
            multiline
            rows={8}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            margin="normal"
            required
            disabled={loading}
          />
          
          {/* 标签 */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              标签
            </Typography>

          </Box>
          
          {/* 图片上传 */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              图片
            </Typography>
            <Button
              variant="outlined"
              component="label"
              startIcon={<ImageIcon />}
              disabled={loading}
            >
              上传图片
              <input
                type="file"
                hidden
                accept="image/*"
                multiple
                onChange={handleImageUpload}
              />
            </Button>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
              {images.map((img, index) => (
                <Box
                  key={index}
                  sx={{
                    position: 'relative',
                    width: 150,
                    height: 150,
                  }}
                >
                  <img
                    src={img.preview}
                    alt={`上传预览 ${index}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: 8,
                    }}
                  />
                  <IconButton
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 5,
                      right: 5,
                      bgcolor: 'rgba(0, 0, 0, 0.5)',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'rgba(0, 0, 0, 0.7)',
                      },
                    }}
                    onClick={() => handleRemoveImage(index)}
                    disabled={loading}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                  <Typography
                    variant="caption"
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      bgcolor: 'rgba(0, 0, 0, 0.5)',
                      color: 'white',
                      padding: '4px',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {img.name}
                  </Typography>
                </Box>
              ))}
              {images.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  暂无图片
                </Typography>
              )}
            </Box>
          </Box>
          
          {/* 提交按钮 */}
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading || !title.trim() || !content.trim()}
              startIcon={loading && <CircularProgress size={20} color="inherit" />}
            >
              {loading ? '发布中...' : '发布帖子'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreatePostPage;