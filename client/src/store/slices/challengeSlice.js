import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { createApiUrl, API_ENDPOINTS } from '../../config/api';

// 异步action：获取挑战赛列表
export const fetchChallenges = createAsyncThunk(
  'challenges/fetchChallenges',
  async ({ page = 1, limit = 10, status = 'active' }, { rejectWithValue }) => {
    try {
      const response = await axios.get(createApiUrl(API_ENDPOINTS.CHALLENGES.LIST), {
        params: { page, limit, status }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: '获取挑战赛列表失败' });
    }
  }
);

// 异步action：获取当前挑战赛
export const fetchCurrentChallenge = createAsyncThunk(
  'challenges/fetchCurrentChallenge',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(createApiUrl(API_ENDPOINTS.CHALLENGES.CURRENT));
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: '获取当前挑战赛失败' });
    }
  }
);

// 异步action：获取挑战赛详情
export const fetchChallengeById = createAsyncThunk(
  'challenges/fetchChallengeById',
  async (challengeId, { rejectWithValue }) => {
    try {
      const response = await axios.get(createApiUrl(API_ENDPOINTS.CHALLENGES.DETAIL(challengeId)));
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: '获取挑战赛详情失败' });
    }
  }
);

// 异步action：获取挑战赛作品列表
export const fetchChallengeSubmissions = createAsyncThunk(
  'challenges/fetchChallengeSubmissions',
  async ({ challengeId, page = 1, limit = 9, sort = 'votes' }, { rejectWithValue }) => {
    try {
      const response = await axios.get(createApiUrl(API_ENDPOINTS.CHALLENGES.SUBMISSIONS(challengeId)), {
        params: { page, limit, sort }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: '获取作品列表失败' });
    }
  }
);

// 异步action：提交挑战赛作品
export const submitChallengeWork = createAsyncThunk(
  'challenges/submitChallengeWork',
  async ({ challengeId, formData }, { rejectWithValue }) => {
    try {
      const response = await axios.post(createApiUrl(API_ENDPOINTS.CHALLENGES.SUBMIT(challengeId)), formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: '提交作品失败' });
    }
  }
);

// 异步action：为作品投票
export const voteForSubmission = createAsyncThunk(
  'challenges/voteForSubmission',
  async (submissionId, { rejectWithValue }) => {
    try {
      const response = await axios.post(createApiUrl(API_ENDPOINTS.CHALLENGES.VOTE(submissionId)));
      return { submissionId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: '投票失败' });
    }
  }
);

// 异步action：取消投票
export const unvoteSubmission = createAsyncThunk(
  'challenges/unvoteSubmission',
  async (submissionId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(createApiUrl(API_ENDPOINTS.CHALLENGES.VOTE(submissionId)));
      return { submissionId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: '取消投票失败' });
    }
  }
);

// 异步action：获取作品详情
export const fetchSubmissionById = createAsyncThunk(
  'challenges/fetchSubmissionById',
  async (submissionId, { rejectWithValue }) => {
    try {
      const response = await axios.get(createApiUrl(API_ENDPOINTS.CHALLENGES.SUBMISSION_DETAIL(submissionId)));
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: '获取作品详情失败' });
    }
  }
);

// 异步action：获取用户在指定挑战中的提交
export const fetchMySubmission = createAsyncThunk(
  'challenges/fetchMySubmission',
  async (challengeId, { rejectWithValue }) => {
    try {
      const response = await axios.get(createApiUrl(API_ENDPOINTS.CHALLENGES.MY_SUBMISSION(challengeId)));
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: '获取用户提交失败' });
    }
  }
);

// 异步action：删除作品（管理员功能）
export const deleteSubmission = createAsyncThunk(
  'challenges/deleteSubmission',
  async (submissionId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(createApiUrl(API_ENDPOINTS.CHALLENGES.SUBMISSION_DETAIL(submissionId)), {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { ...response.data, submissionId };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: '删除作品失败' });
    }
  }
);

const initialState = {
  // 挑战赛列表
  challenges: [],
  currentChallenge: null,
  selectedChallenge: null,
  
  // 作品列表
  submissions: [],
  selectedSubmission: null,
  mySubmission: null,
  
  // 分页信息
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  },
  submissionsPagination: {
    page: 1,
    limit: 9,
    total: 0,
    totalPages: 0
  },
  
  // 加载状态
  loading: false,
  submissionsLoading: false,
  submitting: false,
  voting: false,
  
  // 错误信息
  error: null,
  submissionError: null,
  
  // 成功状态
  submitSuccess: false,
  voteSuccess: false
};

const challengeSlice = createSlice({
  name: 'challenges',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.submissionError = null;
    },
    clearSubmitSuccess: (state) => {
      state.submitSuccess = false;
    },
    clearVoteSuccess: (state) => {
      state.voteSuccess = false;
    },
    resetSelectedChallenge: (state) => {
      state.selectedChallenge = null;
    },
    resetSelectedSubmission: (state) => {
      state.selectedSubmission = null;
    },
    resetMySubmission: (state) => {
      state.mySubmission = null;
    },
    // 本地更新投票状态
    updateSubmissionVoteLocal: (state, action) => {
      const { submissionId, votes, hasVoted } = action.payload;
      
      // 更新submissions列表中的投票数
      const submissionIndex = state.submissions.findIndex(sub => sub._id === submissionId);
      if (submissionIndex !== -1) {
        state.submissions[submissionIndex].votes = votes;
        state.submissions[submissionIndex].hasVoted = hasVoted;
      }
      
      // 更新selectedSubmission的投票数
      if (state.selectedSubmission && state.selectedSubmission._id === submissionId) {
        state.selectedSubmission.votes = votes;
        state.selectedSubmission.hasVoted = hasVoted;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // 获取挑战赛列表
      .addCase(fetchChallenges.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChallenges.fulfilled, (state, action) => {
        state.loading = false;
        state.challenges = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchChallenges.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || '获取挑战赛列表失败';
      })
      
      // 获取当前挑战赛
      .addCase(fetchCurrentChallenge.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentChallenge.fulfilled, (state, action) => {
        state.loading = false;
        state.currentChallenge = action.payload.data;
      })
      .addCase(fetchCurrentChallenge.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || '获取当前挑战赛失败';
      })
      
      // 获取挑战赛详情
      .addCase(fetchChallengeById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChallengeById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedChallenge = action.payload.data;
      })
      .addCase(fetchChallengeById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || '获取挑战赛详情失败';
      })
      
      // 获取作品列表
      .addCase(fetchChallengeSubmissions.pending, (state) => {
        state.submissionsLoading = true;
        state.error = null;
      })
      .addCase(fetchChallengeSubmissions.fulfilled, (state, action) => {
        state.submissionsLoading = false;
        const { data, pagination } = action.payload;
        
        // 如果是第一页或者重新加载，替换数据；否则追加数据
        if (pagination.page === 1) {
          state.submissions = data;
        } else {
          state.submissions = [...state.submissions, ...data];
        }
        
        state.submissionsPagination = pagination;
      })
      .addCase(fetchChallengeSubmissions.rejected, (state, action) => {
        state.submissionsLoading = false;
        state.error = action.payload?.message || '获取作品列表失败';
      })
      
      // 提交作品
      .addCase(submitChallengeWork.pending, (state) => {
        state.submitting = true;
        state.submissionError = null;
        state.submitSuccess = false;
      })
      .addCase(submitChallengeWork.fulfilled, (state, action) => {
        state.submitting = false;
        state.submitSuccess = true;
        state.mySubmission = action.payload.data;
        // 更新当前挑战的提交数量
        if (state.selectedChallenge) {
          state.selectedChallenge.currentSubmissions += 1;
        }
      })
      .addCase(submitChallengeWork.rejected, (state, action) => {
        state.submitting = false;
        state.submissionError = action.payload?.message || '提交作品失败';
        state.submitSuccess = false;
      })
      
      // 投票
      .addCase(voteForSubmission.pending, (state) => {
        state.voting = true;
        state.error = null;
      })
      .addCase(voteForSubmission.fulfilled, (state, action) => {
        state.voting = false;
        state.voteSuccess = true;
        const { submissionId, data } = action.payload;
        
        // 更新submissions列表中的投票数
        const submissionIndex = state.submissions.findIndex(sub => sub._id === submissionId);
        if (submissionIndex !== -1) {
          state.submissions[submissionIndex].votes = data.votes;
          state.submissions[submissionIndex].hasVoted = true;
        }
        
        // 更新selectedSubmission的投票数
        if (state.selectedSubmission && state.selectedSubmission._id === submissionId) {
          state.selectedSubmission.votes = data.votes;
          state.selectedSubmission.hasVoted = true;
        }
      })
      .addCase(voteForSubmission.rejected, (state, action) => {
        state.voting = false;
        state.error = action.payload?.message || '投票失败';
      })
      
      // 取消投票
      .addCase(unvoteSubmission.pending, (state) => {
        state.voting = true;
        state.error = null;
      })
      .addCase(unvoteSubmission.fulfilled, (state, action) => {
        state.voting = false;
        state.voteSuccess = true;
        const { submissionId, data } = action.payload;
        
        // 更新submissions列表中的投票数
        const submissionIndex = state.submissions.findIndex(sub => sub._id === submissionId);
        if (submissionIndex !== -1) {
          state.submissions[submissionIndex].votes = data.votes;
          state.submissions[submissionIndex].hasVoted = false;
        }
        
        // 更新selectedSubmission的投票数
        if (state.selectedSubmission && state.selectedSubmission._id === submissionId) {
          state.selectedSubmission.votes = data.votes;
          state.selectedSubmission.hasVoted = false;
        }
      })
      .addCase(unvoteSubmission.rejected, (state, action) => {
        state.voting = false;
        state.error = action.payload?.message || '取消投票失败';
      })
      
      // 获取作品详情
      .addCase(fetchSubmissionById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubmissionById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedSubmission = action.payload.data;
      })
      .addCase(fetchSubmissionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || '获取作品详情失败';
      })
      
      // 获取用户提交
      .addCase(fetchMySubmission.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMySubmission.fulfilled, (state, action) => {
        state.loading = false;
        state.mySubmission = action.payload.data;
      })
      .addCase(fetchMySubmission.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || '获取用户提交失败';
      })
      
      // 删除作品
      .addCase(deleteSubmission.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSubmission.fulfilled, (state, action) => {
        state.loading = false;
        const submissionId = action.payload.submissionId;
        // 从作品列表中移除被删除的作品
        state.submissions = state.submissions.filter(sub => sub._id !== submissionId);
        // 如果当前选中的作品被删除，清空选中状态
        if (state.selectedSubmission && state.selectedSubmission._id === submissionId) {
          state.selectedSubmission = null;
        }
      })
      .addCase(deleteSubmission.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || '删除作品失败';
      });
  }
});

export const {
  clearError,
  clearSubmitSuccess,
  clearVoteSuccess,
  resetSelectedChallenge,
  resetSelectedSubmission,
  resetMySubmission,
  updateSubmissionVoteLocal
} = challengeSlice.actions;

export default challengeSlice.reducer;