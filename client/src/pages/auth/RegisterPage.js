import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Link,
  Paper,
  InputAdornment,
  IconButton,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';
import { register, clearError } from '../../store/slices/authSlice';

const RegisterPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);

  // 表单状态 - 移除phone字段
  const [formData, setFormData] = useState({
    username: '',
    nickname: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [generalError, setGeneralError] = useState('');

  // 如果已经登录，重定向到首页
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // 清除错误信息
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // 处理输入变化
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // 清除对应字段的错误
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
  };

  // 切换密码可见性
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // 验证表单 - 移除手机号验证
  const validateForm = () => {
    const errors = {};
    
    // 验证用户名
    if (!formData.username.trim()) {
      errors.username = '请输入用户名';
    } else if (!/^[a-zA-Z0-9_]{3,20}$/.test(formData.username)) {
      errors.username = '用户名只能包含字母、数字和下划线，长度3-20';
    }
    
    // 验证昵称
    if (!formData.nickname.trim()) {
      errors.nickname = '请输入昵称';
    } else if (formData.nickname.length > 20) {
      errors.nickname = '昵称长度不能超过20个字符';
    }
    
    // 验证密码
    if (!formData.password) {
      errors.password = '请输入密码';
    } else if (formData.password.length < 6) {
      errors.password = '密码长度不能少于6个字符';
    }
    
    // 验证确认密码
    if (!formData.confirmPassword) {
      errors.confirmPassword = '请确认密码';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = '两次输入的密码不一致';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 处理表单提交 - 移除phone字段
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const { username, password, nickname } = formData;
      const registerData = { username, password, nickname };
      
      try {
        // 清除之前的错误
        setGeneralError('');
        setFormErrors({});
        
        const result = await dispatch(register(registerData));
        
        if (register.rejected.match(result)) {
          // 处理注册失败
          const errorData = result.payload;
          
          if (errorData && typeof errorData === 'object') {
            if (errorData.field && errorData.message) {
              // 如果有特定字段错误，设置到对应字段
              setFormErrors(prev => ({
                ...prev,
                [errorData.field]: errorData.message
              }));
              // 清除通用错误
              setGeneralError('');
            } else if (errorData.message) {
              // 通用错误信息
              setGeneralError(errorData.message);
            } else {
              // 兜底错误信息
              setGeneralError('注册失败，请重试');
            }
          } else {
            // 如果errorData是字符串或其他类型
            const message = typeof errorData === 'string' ? errorData : '注册失败，请重试';
            setGeneralError(message);
          }
        }
      } catch (error) {
        console.error('注册错误:', error);
        setGeneralError('网络错误，请检查网络连接后重试');
      }
    }
  };

  // 渲染表单内容 - 移除手机号字段
  const renderFormContent = () => {
    return (
      <>
        <TextField
          margin="normal"
          required
          fullWidth
          id="username"
          label="用户名"
          name="username"
          autoComplete="username"
          autoFocus
          value={formData.username}
          onChange={handleChange}
          error={!!formErrors.username}
          helperText={formErrors.username || '用户名将用于登录，只能包含字母、数字和下划线'}
          disabled={loading}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          id="nickname"
          label="昵称"
          name="nickname"
          value={formData.nickname}
          onChange={handleChange}
          error={!!formErrors.nickname}
          helperText={formErrors.nickname || '昵称将显示在社区中'}
          disabled={loading}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          id="password"
          label="密码"
          name="password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          value={formData.password}
          onChange={handleChange}
          error={!!formErrors.password}
          helperText={formErrors.password || '密码长度不能少于6个字符'}
          disabled={loading}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleTogglePasswordVisibility}
                  edge="end"
                  disabled={loading}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          id="confirmPassword"
          label="确认密码"
          name="confirmPassword"
          type={showConfirmPassword ? 'text' : 'password'}
          autoComplete="new-password"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={!!formErrors.confirmPassword}
          helperText={formErrors.confirmPassword || '请再次输入密码'}
          disabled={loading}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle confirm password visibility"
                  onClick={handleToggleConfirmPasswordVisibility}
                  edge="end"
                  disabled={loading}
                >
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
       </>
     );
    };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 8 }}>
        <Paper elevation={3} sx={{ p: { xs: 3, md: 5 }, borderRadius: 2 }}>
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography variant="h4" component="h1" gutterBottom>
              创建账号
            </Typography>
            <Typography variant="body1" color="text.secondary">
              加入火星基地粉丝社区，与志同道合的粉丝交流
            </Typography>
          </Box>

          {(error || generalError) && (
            <Box sx={{ mb: 3 }}>
              <Typography color="error" align="center">
                {generalError || (typeof error === 'string' ? error : error?.message || '发生未知错误')}
              </Typography>
            </Box>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            {renderFormContent()}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ mt: 3, mb: 2 }}
              endIcon={loading ? <CircularProgress size={20} /> : <PersonAddIcon />}
            >
              {loading ? '注册中...' : '完成注册'}
            </Button>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                已有账号？
              </Typography>
            </Divider>

            <Box sx={{ textAlign: 'center' }}>
              <Button
                component={RouterLink}
                to="/login"
                variant="outlined"
                color="primary"
                fullWidth
              >
                登录现有账号
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default RegisterPage;