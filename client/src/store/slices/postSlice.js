import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// 异步action：获取帖子列表
export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async ({ page = 1, limit = 10, search = '' }, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/posts', {
        params: { page, limit, search }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// 异步action：获取单个帖子详情
export const fetchPostById = createAsyncThunk(
  'posts/fetchPostById',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/posts/${postId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// 异步action：创建新帖子
export const createPost = createAsyncThunk(
  'posts/createPost',
  async (postData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/posts', postData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// 异步action：更新帖子
export const updatePost = createAsyncThunk(
  'posts/updatePost',
  async ({ postId, postData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/posts/${postId}`, postData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// 异步action：删除帖子
export const deletePost = createAsyncThunk(
  'posts/deletePost',
  async (postId, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/posts/${postId}`);
      return postId;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// 异步action：点赞帖子
export const likePost = createAsyncThunk(
  'posts/likePost',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/api/posts/${postId}/like`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// 异步action：取消点赞帖子
export const unlikePost = createAsyncThunk(
  'posts/unlikePost',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`/api/posts/${postId}/like`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// 异步action：收藏帖子
export const savePost = createAsyncThunk(
  'posts/savePost',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/api/posts/${postId}/save`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// 异步action：取消收藏帖子
export const unsavePost = createAsyncThunk(
  'posts/unsavePost',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`/api/posts/${postId}/save`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  posts: [],
  post: null,
  loading: false,
  error: null,
  success: false,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  },
  filters: {
    search: '',
    category: '',
    sortBy: 'createdAt',
    order: 'desc'
  }
};

const postSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    clearPostError: (state) => {
      state.error = null;
    },
    resetPostSuccess: (state) => {
      state.success = false;
    },
    setPostFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetPostFilters: (state) => {
      state.filters = {
        search: '',
        category: '',
        sortBy: 'createdAt',
        order: 'desc'
      };
    },
    // 模拟点赞帖子（本地状态更新）
    toggleLikeLocal: (state, action) => {
      const { postId, liked } = action.payload;
      if (state.post && state.post._id === postId) {
        state.post.liked = liked;
        state.post.likes = liked 
          ? state.post.likes + 1 
          : Math.max(0, state.post.likes - 1);
      }
      
      const postIndex = state.posts.findIndex(post => post._id === postId);
      if (postIndex !== -1) {
        state.posts[postIndex].liked = liked;
        state.posts[postIndex].likes = liked 
          ? state.posts[postIndex].likes + 1 
          : Math.max(0, state.posts[postIndex].likes - 1);
      }
    },
    // 模拟收藏帖子（本地状态更新）
    toggleSaveLocal: (state, action) => {
      const { postId, saved } = action.payload;
      if (state.post && state.post._id === postId) {
        state.post.saved = saved;
      }
      
      const postIndex = state.posts.findIndex(post => post._id === postId);
      if (postIndex !== -1) {
        state.posts[postIndex].saved = saved;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // 获取帖子列表
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload.posts;
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          totalPages: action.payload.totalPages
        };
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || '获取帖子列表失败';
      })
      // 获取单个帖子详情
      .addCase(fetchPostById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPostById.fulfilled, (state, action) => {
        state.loading = false;
        state.post = action.payload;
      })
      .addCase(fetchPostById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || '获取帖子详情失败';
      })
      // 创建新帖子
      .addCase(createPost.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.loading = false;
        state.posts.unshift(action.payload);
        state.success = true;
      })
      .addCase(createPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || '创建帖子失败';
        state.success = false;
      })
      // 更新帖子
      .addCase(updatePost.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        state.loading = false;
        if (state.post && state.post._id === action.payload._id) {
          state.post = action.payload;
        }
        const postIndex = state.posts.findIndex(post => post._id === action.payload._id);
        if (postIndex !== -1) {
          state.posts[postIndex] = action.payload;
        }
        state.success = true;
      })
      .addCase(updatePost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || '更新帖子失败';
        state.success = false;
      })
      // 删除帖子
      .addCase(deletePost.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = state.posts.filter(post => post._id !== action.payload);
        if (state.post && state.post._id === action.payload) {
          state.post = null;
        }
        state.success = true;
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || '删除帖子失败';
        state.success = false;
      })
      // 点赞帖子
      .addCase(likePost.fulfilled, (state, action) => {
        const { postId, likes } = action.payload;
        if (state.post && state.post._id === postId) {
          state.post.liked = true;
          state.post.likes = likes;
        }
        const postIndex = state.posts.findIndex(post => post._id === postId);
        if (postIndex !== -1) {
          state.posts[postIndex].liked = true;
          state.posts[postIndex].likes = likes;
        }
      })
      // 取消点赞帖子
      .addCase(unlikePost.fulfilled, (state, action) => {
        const { postId, likes } = action.payload;
        if (state.post && state.post._id === postId) {
          state.post.liked = false;
          state.post.likes = likes;
        }
        const postIndex = state.posts.findIndex(post => post._id === postId);
        if (postIndex !== -1) {
          state.posts[postIndex].liked = false;
          state.posts[postIndex].likes = likes;
        }
      })
      // 收藏帖子
      .addCase(savePost.fulfilled, (state, action) => {
        const { postId } = action.payload;
        if (state.post && state.post._id === postId) {
          state.post.saved = true;
        }
        const postIndex = state.posts.findIndex(post => post._id === postId);
        if (postIndex !== -1) {
          state.posts[postIndex].saved = true;
        }
      })
      // 取消收藏帖子
      .addCase(unsavePost.fulfilled, (state, action) => {
        const { postId } = action.payload;
        if (state.post && state.post._id === postId) {
          state.post.saved = false;
        }
        const postIndex = state.posts.findIndex(post => post._id === postId);
        if (postIndex !== -1) {
          state.posts[postIndex].saved = false;
        }
      });
  }
});

export const { 
  clearPostError, 
  resetPostSuccess, 
  setPostFilters, 
  resetPostFilters,
  toggleLikeLocal,
  toggleSaveLocal
} = postSlice.actions;

export default postSlice.reducer;