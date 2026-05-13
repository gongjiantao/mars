import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { setAlert } from './alertSlice';
import { createApiUrl, API_ENDPOINTS } from '../../config/api';

// 设置请求头中的token
const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

// 异步action: 注册用户 - 移除phone参数
export const register = createAsyncThunk(
  'auth/register',
  async ({ username, password, nickname, avatar }, { rejectWithValue, dispatch }) => {
    try {
      // 如果有头像文件，使用FormData；否则使用JSON
      let requestData;
      let headers = {};
      
      if (avatar) {
        // 有头像文件时使用FormData
        requestData = new FormData();
        requestData.append('username', username);
        requestData.append('password', password);
        requestData.append('nickname', nickname);
        requestData.append('avatar', avatar);
        headers['Content-Type'] = 'multipart/form-data';
      } else {
        // 没有头像文件时使用JSON
        requestData = { username, password, nickname };
        headers['Content-Type'] = 'application/json';
      }
      
      const res = await axios.post(createApiUrl(API_ENDPOINTS.AUTH.REGISTER), requestData, {
        headers
      });
      
      // 设置token到localStorage
      localStorage.setItem('token', res.data.token);
      // 设置请求头
      setAuthToken(res.data.token);
      
      dispatch(setAlert({ message: res.data.message, type: 'success' }));
      return res.data;
    } catch (err) {
      const errorData = err.response?.data || {};
      
      // 处理400状态码的各种错误
      if (err.response?.status === 400) {
        // 处理表单验证错误（有errors数组）
        if (errorData.errors && Array.isArray(errorData.errors)) {
          const firstError = errorData.errors[0];
          dispatch(setAlert({ message: firstError.msg, type: 'error' }));
          return rejectWithValue({ field: firstError.param, message: firstError.msg });
        }
        
        // 处理业务逻辑错误（如用户名重复）
        if (errorData.error) {
          const message = errorData.error;
          dispatch(setAlert({ message, type: 'error' }));
          
          // 根据错误信息判断是否为特定字段错误
          let field = null;
          if (message.includes('用户名')) {
            field = 'username';
          } else if (message.includes('昵称')) {
            field = 'nickname';
          } else if (message.includes('密码')) {
            field = 'password';
          }
          
          return rejectWithValue({ field, message });
        }
      }
      
      const message = errorData.error || errorData.message || '注册失败，请重试';
      dispatch(setAlert({ message, type: 'error' }));
      return rejectWithValue({ message });
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async ({ username, password }, { rejectWithValue, dispatch }) => {
    try {
      const res = await axios.post(createApiUrl(API_ENDPOINTS.AUTH.LOGIN), {
        username,
        password
      });
      
      localStorage.setItem('token', res.data.token);
      setAuthToken(res.data.token);
      
      dispatch(setAlert({ message: res.data.message || '登录成功', type: 'success' }));
      return res.data;
    } catch (err) {
      const errorData = err.response?.data || {};
      const errorMessage = errorData.error || '登录失败';
      dispatch(setAlert({ message: errorMessage, type: 'error' }));
      return rejectWithValue({
        message: errorMessage,
        field: errorData.field,
        errors: errorData.errors
      });
    }
  }
);

export const loadUser = createAsyncThunk(
  'auth/loadUser',
  async (_, { rejectWithValue }) => {
    // 从localStorage获取token
    const token = localStorage.getItem('token');
    
    if (!token) {
      return rejectWithValue('No token');
    }
    
    try {
      // 设置请求头
      setAuthToken(token);
      
      const res = await axios.get(createApiUrl(API_ENDPOINTS.AUTH.ME));
      return res.data;
    } catch (err) {
      localStorage.removeItem('token');
      setAuthToken(null);
      return rejectWithValue(err.response?.data?.message || '加载用户信息失败');
    }
  }
);

// 异步action: 更新用户资料
export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (formData, { rejectWithValue, dispatch }) => {
    try {
      const res = await axios.put(createApiUrl(API_ENDPOINTS.AUTH.UPDATE_PROFILE), formData);
      
      dispatch(setAlert({ message: '个人资料更新成功', type: 'success' }));
      return res.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || '更新个人资料失败';
      dispatch(setAlert({ message: errorMessage, type: 'error' }));
      return rejectWithValue(errorMessage);
    }
  }
);

// 异步action: 修改密码
export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async ({ currentPassword, newPassword }, { rejectWithValue, dispatch }) => {
    try {
      const res = await axios.put(createApiUrl(API_ENDPOINTS.AUTH.CHANGE_PASSWORD), { 
        currentPassword, 
        newPassword 
      });
      
      dispatch(setAlert({ message: '密码修改成功', type: 'success' }));
      return res.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || '密码修改失败';
      dispatch(setAlert({ message: errorMessage, type: 'error' }));
      return rejectWithValue(errorMessage);
    }
  }
);

// 异步action: 忘记密码
export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue, dispatch }) => {
    try {
      const res = await axios.post(createApiUrl(API_ENDPOINTS.AUTH.FORGOT_PASSWORD), { email });
      
      dispatch(setAlert({ message: '重置密码邮件已发送', type: 'success' }));
      return res.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || '发送重置密码邮件失败';
      dispatch(setAlert({ message: errorMessage, type: 'error' }));
      return rejectWithValue(errorMessage);
    }
  }
);

// 异步action: 重置密码
export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, password }, { rejectWithValue, dispatch }) => {
    try {
      const res = await axios.post(createApiUrl(`${API_ENDPOINTS.AUTH.RESET_PASSWORD}/${token}`), { password });
      
      dispatch(setAlert({ message: '密码重置成功，请登录', type: 'success' }));
      return res.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || '密码重置失败';
      dispatch(setAlert({ message: errorMessage, type: 'error' }));
      return rejectWithValue(errorMessage);
    }
  }
);

// 初始状态
const initialState = {
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: false,
  user: null,
  error: null
};

// 创建slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('token');
      setAuthToken(null);
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.user = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // 注册
      .addCase(register.pending, (state) => {
        state.loading = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // 登录
      .addCase(login.pending, (state) => {
        state.loading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // 加载用户
      .addCase(loadUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(loadUser.rejected, (state, action) => {
        state.loading = false;
        state.token = null;
        state.isAuthenticated = false;
        state.user = null;
      })
      
      // 更新用户资料
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        // 后端返回的数据格式是 { success: true, data: user }
        state.user = action.payload.data;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // 修改密码
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { logout, clearError } = authSlice.actions;

export default authSlice.reducer;