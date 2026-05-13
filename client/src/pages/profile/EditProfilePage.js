import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  IconButton,
  Divider,
  CircularProgress,
  Alert,
  FormControlLabel,
  Switch,
  InputAdornment
} from '@mui/material';
import {
  PhotoCamera as PhotoCameraIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Lock as LockIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  Link as LinkIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
// 假设这些action会在后续实现
// import { updateProfile, updateAvatar, clearProfileError } from '../../store/slices/profileSlice';

const EditProfilePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  // 假设这些状态会在后续实现
  // const { profile, loading, error, success } = useSelector((state) => state.profile);
  
  // 模拟数据，实际应用中应该从Redux获取
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // 表单状态
  const [formData, setFormData] = useState({
    nickname: '',
    bio: '',
    location: '',
    website: '',
    email: '',
    isPublicEmail: true,
    isPublicLocation: true
  });
  
  // 头像状态
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  
  // 表单错误
  const [formErrors, setFormErrors] = useState({});

  // 初始化表单数据
  useEffect(() => {
    if (user) {
      // 模拟从用户数据中获取初始值
      setFormData({
        nickname: user.nickname || '',
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || '',
        email: user.email || '',
        isPublicEmail: user.isPublicEmail !== undefined ? user.isPublicEmail : true,
        isPublicLocation: user.isPublicLocation !== undefined ? user.isPublicLocation : true
      });
      
      if (user.avatar) {
        setAvatarPreview(user.avatar);
      }
    }
  }, [user]);

  // 清除错误信息
  useEffect(() => {
    return () => {
      // 实际应用中应该调用Redux action
      // dispatch(clearProfileError());
    };
  }, [dispatch]);

  // 处理输入变化
  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData({ ...formData, [name]: newValue });
    
    // 清除对应字段的错误
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
  };

  // 处理头像变化
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // 验证文件类型
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setFormErrors({ ...formErrors, avatar: '请上传JPG、PNG或GIF格式的图片' });
        return;
      }
      
      // 验证文件大小（最大5MB）
      if (file.size > 5 * 1024 * 1024) {
        setFormErrors({ ...formErrors, avatar: '图片大小不能超过5MB' });
        return;
      }
      
      setAvatar(file);
      
      // 创建预览URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      // 清除错误
      if (formErrors.avatar) {
        setFormErrors({ ...formErrors, avatar: '' });
      }
      
      // 立即上传头像
      try {
        const formData = new FormData();
        formData.append('avatar', file);
        
        const token = localStorage.getItem('token');
        const response = await fetch('/api/upload/avatar', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('头像上传成功:', data.avatarUrl);
        } else {
          setFormErrors({ ...formErrors, avatar: '头像上传失败，请重试' });
        }
      } catch (error) {
        console.error('头像上传错误:', error);
        setFormErrors({ ...formErrors, avatar: '头像上传失败，请重试' });
      }
    }
  };

  // 验证表单
  const validateForm = () => {
    const errors = {};
    
    if (!formData.nickname.trim()) {
      errors.nickname = '请输入昵称';
    } else if (formData.nickname.length > 20) {
      errors.nickname = '昵称长度不能超过20个字符';
    }
    
    if (formData.bio && formData.bio.length > 200) {
      errors.bio = '个人简介不能超过200个字符';
    }
    
    if (formData.website && !/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(formData.website)) {
      errors.website = '请输入有效的网址';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 处理表单提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setLoading(true);
      setError(null);
      
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/auth/update-profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            nickname: formData.nickname,
            bio: formData.bio,
            location: formData.location,
            website: formData.website
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('个人资料更新成功:', data);
          setSuccess(true);
          
          // 成功后延迟跳转回个人资料页面
          setTimeout(() => {
            navigate('/profile');
          }, 2000);
        } else {
          const errorData = await response.json();
          setError(errorData.error || '更新个人资料失败');
        }
      } catch (err) {
        console.error('更新个人资料错误:', err);
        setError('更新个人资料失败，请重试');
      } finally {
        setLoading(false);
      }
    }
  };

  // 处理取消
  const handleCancel = () => {
    navigate('/profile');
  };

  // 如果用户未登录，重定向到登录页面
  if (!user) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4 }}>
          <Alert severity="warning">
            您需要登录才能编辑个人资料
          </Alert>
          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={() => navigate('/login')}
          >
            前往登录
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 6 }}>
        <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            编辑个人资料
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              个人资料更新成功！正在跳转到个人资料页面...
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={3}>
              {/* 头像上传 */}
              <Grid item xs={12} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                <Avatar
                  src={avatarPreview}
                  alt={formData.nickname || user.username}
                  sx={{ width: 120, height: 120, mb: 2 }}
                />
                <input
                  accept="image/*"
                  id="avatar-upload"
                  type="file"
                  style={{ display: 'none' }}
                  onChange={handleAvatarChange}
                  disabled={loading}
                />
                <label htmlFor="avatar-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<PhotoCameraIcon />}
                    disabled={loading}
                  >
                    更换头像
                  </Button>
                </label>
                {formErrors.avatar && (
                  <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                    {formErrors.avatar}
                  </Typography>
                )}
              </Grid>
              
              {/* 基本信息 */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  基本信息
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="nickname"
                  name="nickname"
                  label="昵称"
                  value={formData.nickname}
                  onChange={handleChange}
                  error={!!formErrors.nickname}
                  helperText={formErrors.nickname || '昵称将显示在社区中'}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="email"
                  name="email"
                  label="邮箱"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!formErrors.email}
                  helperText={formErrors.email}
                  disabled={true} // 邮箱通常不允许直接修改
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <FormControlLabel
                          control={
                            <Switch
                              checked={formData.isPublicEmail}
                              onChange={handleChange}
                              name="isPublicEmail"
                              disabled={loading}
                              size="small"
                            />
                          }
                          label={<Typography variant="caption">公开</Typography>}
                        />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="bio"
                  name="bio"
                  label="个人简介"
                  multiline
                  rows={4}
                  value={formData.bio}
                  onChange={handleChange}
                  error={!!formErrors.bio}
                  helperText={formErrors.bio || `${formData.bio.length}/200`}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                        <DescriptionIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  联系方式
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="location"
                  name="location"
                  label="所在地"
                  value={formData.location}
                  onChange={handleChange}
                  error={!!formErrors.location}
                  helperText={formErrors.location}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationIcon />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <FormControlLabel
                          control={
                            <Switch
                              checked={formData.isPublicLocation}
                              onChange={handleChange}
                              name="isPublicLocation"
                              disabled={loading}
                              size="small"
                            />
                          }
                          label={<Typography variant="caption">公开</Typography>}
                        />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="website"
                  name="website"
                  label="个人网站"
                  value={formData.website}
                  onChange={handleChange}
                  error={!!formErrors.website}
                  helperText={formErrors.website}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LinkIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleCancel}
                    startIcon={<CancelIcon />}
                    disabled={loading}
                  >
                    取消
                  </Button>
                  
                  <Box>
                    <Button
                      component="a"
                      href="/change-password"
                      variant="outlined"
                      color="primary"
                      sx={{ mr: 2 }}
                      startIcon={<LockIcon />}
                      disabled={loading}
                    >
                      修改密码
                    </Button>
                    
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                      disabled={loading}
                    >
                      {loading ? '保存中...' : '保存修改'}
                    </Button>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default EditProfilePage;