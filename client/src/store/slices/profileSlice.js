import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// 异步action：获取用户资料
export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/users/${userId}/profile`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// 异步action：更新用户资料
export const updateProfile = createAsyncThunk(
  'profile/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/users/profile`, profileData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// 异步action：上传头像
export const uploadAvatar = createAsyncThunk(
  'profile/uploadAvatar',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/users/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  profile: null,
  loading: false,
  error: null,
  updateSuccess: false,
  stats: {
    posts: 0,
    followers: 0,
    following: 0,
    likes: 0
  },
  recentActivity: [],
  savedItems: []
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearProfileError: (state) => {
      state.error = null;
    },
    resetUpdateSuccess: (state) => {
      state.updateSuccess = false;
    },
    // 模拟添加关注者
    addFollower: (state) => {
      state.stats.followers += 1;
    },
    // 模拟移除关注者
    removeFollower: (state) => {
      state.stats.followers = Math.max(0, state.stats.followers - 1);
    },
    // 模拟添加关注
    addFollowing: (state) => {
      state.stats.following += 1;
    },
    // 模拟移除关注
    removeFollowing: (state) => {
      state.stats.following = Math.max(0, state.stats.following - 1);
    },
    // 添加保存的项目
    addSavedItem: (state, action) => {
      state.savedItems.unshift(action.payload);
    },
    // 移除保存的项目
    removeSavedItem: (state, action) => {
      state.savedItems = state.savedItems.filter(item => item.id !== action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      // 获取用户资料
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        // 模拟数据
        state.stats = {
          posts: 12,
          followers: 230,
          following: 184,
          likes: 1024
        };
        state.recentActivity = [
          { id: 1, type: 'post', content: '发布了新歌曲《心声》', timestamp: new Date().toISOString() },
          { id: 2, type: 'like', content: '喜欢了张三的歌曲《远方》', timestamp: new Date(Date.now() - 86400000).toISOString() },
          { id: 3, type: 'comment', content: '评论了李四的歌曲《旅程》', timestamp: new Date(Date.now() - 172800000).toISOString() },
          { id: 4, type: 'follow', content: '关注了音乐人王五', timestamp: new Date(Date.now() - 259200000).toISOString() },
          { id: 5, type: 'event', content: '参加了「原创歌曲创作大赛」', timestamp: new Date(Date.now() - 345600000).toISOString() }
        ];
        state.savedItems = [
          { id: 101, type: 'post', title: '如何提高vocal技巧', author: '专业歌手小明', timestamp: new Date(Date.now() - 86400000).toISOString() },
          { id: 102, type: 'song', title: '《心声》', artist: '音乐人小红', timestamp: new Date(Date.now() - 172800000).toISOString() },
          { id: 103, type: 'event', title: '原创歌曲创作大赛', organizer: '火星音乐平台', timestamp: new Date(Date.now() - 259200000).toISOString() }
        ];
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || '获取用户资料失败';
      })
      // 更新用户资料
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.updateSuccess = false;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.updateSuccess = true;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || '更新用户资料失败';
        state.updateSuccess = false;
      })
      // 上传头像
      .addCase(uploadAvatar.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        state.loading = false;
        if (state.profile) {
          state.profile.avatar = action.payload.avatar;
        }
      })
      .addCase(uploadAvatar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || '上传头像失败';
      });
  }
});

export const { 
  clearProfileError, 
  resetUpdateSuccess, 
  addFollower, 
  removeFollower, 
  addFollowing, 
  removeFollowing,
  addSavedItem,
  removeSavedItem
} = profileSlice.actions;

export default profileSlice.reducer;