import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// 异步action：获取评论列表
export const fetchComments = createAsyncThunk(
  'comments/fetchComments',
  async ({ postId, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/posts/${postId}/comments`, {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// 异步action：创建评论
export const createComment = createAsyncThunk(
  'comments/createComment',
  async ({ postId, content }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/api/posts/${postId}/comments`, { content });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// 异步action：回复评论
export const replyToComment = createAsyncThunk(
  'comments/replyToComment',
  async ({ postId, commentId, content }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/api/posts/${postId}/comments/${commentId}/replies`, { content });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// 异步action：更新评论
export const updateComment = createAsyncThunk(
  'comments/updateComment',
  async ({ postId, commentId, content }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/posts/${postId}/comments/${commentId}`, { content });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// 异步action：删除评论
export const deleteComment = createAsyncThunk(
  'comments/deleteComment',
  async ({ postId, commentId }, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/posts/${postId}/comments/${commentId}`);
      return { postId, commentId };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// 异步action：点赞评论
export const likeComment = createAsyncThunk(
  'comments/likeComment',
  async ({ postId, commentId }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/api/posts/${postId}/comments/${commentId}/like`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// 异步action：取消点赞评论
export const unlikeComment = createAsyncThunk(
  'comments/unlikeComment',
  async ({ postId, commentId }, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`/api/posts/${postId}/comments/${commentId}/like`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  comments: [],
  loading: false,
  error: null,
  success: false,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  }
};

const commentSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    clearCommentError: (state) => {
      state.error = null;
    },
    resetCommentSuccess: (state) => {
      state.success = false;
    },
    // 模拟点赞评论（本地状态更新）
    toggleCommentLikeLocal: (state, action) => {
      const { commentId, liked } = action.payload;
      const commentIndex = state.comments.findIndex(comment => comment._id === commentId);
      
      if (commentIndex !== -1) {
        state.comments[commentIndex].liked = liked;
        state.comments[commentIndex].likes = liked 
          ? state.comments[commentIndex].likes + 1 
          : Math.max(0, state.comments[commentIndex].likes - 1);
      } else {
        // 检查是否是回复评论
        for (let i = 0; i < state.comments.length; i++) {
          if (state.comments[i].replies) {
            const replyIndex = state.comments[i].replies.findIndex(reply => reply._id === commentId);
            if (replyIndex !== -1) {
              state.comments[i].replies[replyIndex].liked = liked;
              state.comments[i].replies[replyIndex].likes = liked 
                ? state.comments[i].replies[replyIndex].likes + 1 
                : Math.max(0, state.comments[i].replies[replyIndex].likes - 1);
              break;
            }
          }
        }
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // 获取评论列表
      .addCase(fetchComments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.loading = false;
        state.comments = action.payload.comments;
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          totalPages: action.payload.totalPages
        };
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || '获取评论列表失败';
      })
      // 创建评论
      .addCase(createComment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createComment.fulfilled, (state, action) => {
        state.loading = false;
        state.comments.unshift(action.payload);
        state.pagination.total += 1;
        state.success = true;
      })
      .addCase(createComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || '创建评论失败';
        state.success = false;
      })
      // 回复评论
      .addCase(replyToComment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(replyToComment.fulfilled, (state, action) => {
        state.loading = false;
        const { parentId, reply } = action.payload;
        const commentIndex = state.comments.findIndex(comment => comment._id === parentId);
        if (commentIndex !== -1) {
          if (!state.comments[commentIndex].replies) {
            state.comments[commentIndex].replies = [];
          }
          state.comments[commentIndex].replies.push(reply);
          state.comments[commentIndex].replyCount = (state.comments[commentIndex].replyCount || 0) + 1;
        }
        state.success = true;
      })
      .addCase(replyToComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || '回复评论失败';
        state.success = false;
      })
      // 更新评论
      .addCase(updateComment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateComment.fulfilled, (state, action) => {
        state.loading = false;
        const updatedComment = action.payload;
        const commentIndex = state.comments.findIndex(comment => comment._id === updatedComment._id);
        
        if (commentIndex !== -1) {
          // 保留原有的回复
          const replies = state.comments[commentIndex].replies;
          state.comments[commentIndex] = updatedComment;
          if (replies) {
            state.comments[commentIndex].replies = replies;
          }
        } else {
          // 检查是否是回复评论
          for (let i = 0; i < state.comments.length; i++) {
            if (state.comments[i].replies) {
              const replyIndex = state.comments[i].replies.findIndex(reply => reply._id === updatedComment._id);
              if (replyIndex !== -1) {
                state.comments[i].replies[replyIndex] = {
                  ...state.comments[i].replies[replyIndex],
                  content: updatedComment.content,
                  updatedAt: updatedComment.updatedAt
                };
                break;
              }
            }
          }
        }
        state.success = true;
      })
      .addCase(updateComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || '更新评论失败';
        state.success = false;
      })
      // 删除评论
      .addCase(deleteComment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.loading = false;
        const { commentId } = action.payload;
        const commentIndex = state.comments.findIndex(comment => comment._id === commentId);
        
        if (commentIndex !== -1) {
          state.comments.splice(commentIndex, 1);
          state.pagination.total = Math.max(0, state.pagination.total - 1);
        } else {
          // 检查是否是回复评论
          for (let i = 0; i < state.comments.length; i++) {
            if (state.comments[i].replies) {
              const replyIndex = state.comments[i].replies.findIndex(reply => reply._id === commentId);
              if (replyIndex !== -1) {
                state.comments[i].replies.splice(replyIndex, 1);
                state.comments[i].replyCount = Math.max(0, state.comments[i].replyCount - 1);
                break;
              }
            }
          }
        }
        state.success = true;
      })
      .addCase(deleteComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || '删除评论失败';
        state.success = false;
      })
      // 点赞评论
      .addCase(likeComment.fulfilled, (state, action) => {
        const { commentId, likes } = action.payload;
        const commentIndex = state.comments.findIndex(comment => comment._id === commentId);
        
        if (commentIndex !== -1) {
          state.comments[commentIndex].liked = true;
          state.comments[commentIndex].likes = likes;
        } else {
          // 检查是否是回复评论
          for (let i = 0; i < state.comments.length; i++) {
            if (state.comments[i].replies) {
              const replyIndex = state.comments[i].replies.findIndex(reply => reply._id === commentId);
              if (replyIndex !== -1) {
                state.comments[i].replies[replyIndex].liked = true;
                state.comments[i].replies[replyIndex].likes = likes;
                break;
              }
            }
          }
        }
      })
      // 取消点赞评论
      .addCase(unlikeComment.fulfilled, (state, action) => {
        const { commentId, likes } = action.payload;
        const commentIndex = state.comments.findIndex(comment => comment._id === commentId);
        
        if (commentIndex !== -1) {
          state.comments[commentIndex].liked = false;
          state.comments[commentIndex].likes = likes;
        } else {
          // 检查是否是回复评论
          for (let i = 0; i < state.comments.length; i++) {
            if (state.comments[i].replies) {
              const replyIndex = state.comments[i].replies.findIndex(reply => reply._id === commentId);
              if (replyIndex !== -1) {
                state.comments[i].replies[replyIndex].liked = false;
                state.comments[i].replies[replyIndex].likes = likes;
                break;
              }
            }
          }
        }
      });
  }
});

export const { 
  clearCommentError, 
  resetCommentSuccess,
  toggleCommentLikeLocal
} = commentSlice.actions;

export default commentSlice.reducer;