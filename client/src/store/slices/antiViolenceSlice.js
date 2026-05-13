import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { setAlert } from './alertSlice';

// 异步action: 检测内容中的网络暴力敏感词
export const detectViolenceContent = createAsyncThunk(
  'antiViolence/detectContent',
  async (content, { rejectWithValue, dispatch }) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      const { data } = await axios.post('/api/anti-violence/detect', { content }, config);
      
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || '检测内容失败';
      dispatch(setAlert({ message: errorMessage, type: 'error' }));
      return rejectWithValue(errorMessage);
    }
  }
);

// 异步action: 获取反网络暴力资源和建议
export const getAntiViolenceResources = createAsyncThunk(
  'antiViolence/getResources',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await axios.get('/api/anti-violence/resources');
      
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || '获取资源失败';
      dispatch(setAlert({ message: errorMessage, type: 'error' }));
      return rejectWithValue(errorMessage);
    }
  }
);

// 异步action: 提交网络暴力举报
export const reportViolenceContent = createAsyncThunk(
  'antiViolence/reportContent',
  async (reportData, { rejectWithValue, dispatch }) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      const { data } = await axios.post('/api/anti-violence/report', reportData, config);
      
      dispatch(setAlert({ message: '举报已提交，感谢您的贡献！', type: 'success' }));
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || '提交举报失败';
      dispatch(setAlert({ message: errorMessage, type: 'error' }));
      return rejectWithValue(errorMessage);
    }
  }
);

// 异步action: 获取反网络暴力案例
export const getAntiViolenceCase = createAsyncThunk(
  'antiViolence/getCase',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await axios.get(`/api/anti-violence-cases/${id}`);
      
      return data.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || '获取案例失败';
      dispatch(setAlert({ message: errorMessage, type: 'error' }));
      return rejectWithValue(errorMessage);
    }
  }
);

// 异步action: 点赞案例
export const likeCase = createAsyncThunk(
  'antiViolence/likeCase',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await axios.put(`/api/anti-violence-cases/${id}/like`);
      
      dispatch(setAlert({ message: '点赞成功！', type: 'success' }));
      return data.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || '点赞失败';
      dispatch(setAlert({ message: errorMessage, type: 'error' }));
      return rejectWithValue(errorMessage);
    }
  }
);

// 异步action: 分享案例
export const shareCase = createAsyncThunk(
  'antiViolence/shareCase',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await axios.put(`/api/anti-violence-cases/${id}/share`);
      
      dispatch(setAlert({ message: '分享成功！', type: 'success' }));
      return data.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || '分享失败';
      dispatch(setAlert({ message: errorMessage, type: 'error' }));
      return rejectWithValue(errorMessage);
    }
  }
);

// 异步action: 获取鼓励留言
export const getEncouragements = createAsyncThunk(
  'antiViolence/getEncouragements',
  async (caseId, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`/api/encouragements?caseId=${caseId}`);
      
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || '获取鼓励留言失败');
    }
  }
);

// 异步action: 添加鼓励留言
export const addEncouragement = createAsyncThunk(
  'antiViolence/addEncouragement',
  async ({ caseId, content }, { rejectWithValue, dispatch }) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      const { data } = await axios.post('/api/encouragements', { caseId, content }, config);
      
      dispatch(setAlert({ message: '留言已发布！', type: 'success' }));
      return data.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || '发布留言失败';
      dispatch(setAlert({ message: errorMessage, type: 'error' }));
      return rejectWithValue(errorMessage);
    }
  }
);

// 初始状态
const initialState = {
  // 内容检测
  detectionResult: null,
  detectionLoading: false,
  detectionError: null,
  
  // 资源获取
  resources: null,
  resourcesLoading: false,
  resourcesError: null,
  
  // 举报
  reportSuccess: false,
  reportLoading: false,
  reportError: null,
  
  // 案例详情
  caseData: null,
  caseLoading: false,
  caseError: null,
  
  // 案例操作（点赞、分享）
  actionSuccess: false,
  actionLoading: false,
  actionError: null,
  
  // 鼓励留言
  encouragements: [],
  encouragementsLoading: false,
  encouragementsError: null,
  addEncouragementSuccess: false
};

// 创建slice
const antiViolenceSlice = createSlice({
  name: 'antiViolence',
  initialState,
  reducers: {
    clearDetectionResult: (state) => {
      state.detectionResult = null;
      state.detectionError = null;
    },
    clearReportStatus: (state) => {
      state.reportSuccess = false;
      state.reportError = null;
    },
    clearActionStatus: (state) => {
      state.actionSuccess = false;
      state.actionError = null;
    },
    clearAddEncouragementStatus: (state) => {
      state.addEncouragementSuccess = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // 检测内容
      .addCase(detectViolenceContent.pending, (state) => {
        state.detectionLoading = true;
        state.detectionError = null;
      })
      .addCase(detectViolenceContent.fulfilled, (state, action) => {
        state.detectionLoading = false;
        state.detectionResult = action.payload;
      })
      .addCase(detectViolenceContent.rejected, (state, action) => {
        state.detectionLoading = false;
        state.detectionError = action.payload;
      })
      
      // 获取资源
      .addCase(getAntiViolenceResources.pending, (state) => {
        state.resourcesLoading = true;
        state.resourcesError = null;
      })
      .addCase(getAntiViolenceResources.fulfilled, (state, action) => {
        state.resourcesLoading = false;
        state.resources = action.payload;
      })
      .addCase(getAntiViolenceResources.rejected, (state, action) => {
        state.resourcesLoading = false;
        state.resourcesError = action.payload;
      })
      
      // 提交举报
      .addCase(reportViolenceContent.pending, (state) => {
        state.reportLoading = true;
        state.reportError = null;
        state.reportSuccess = false;
      })
      .addCase(reportViolenceContent.fulfilled, (state) => {
        state.reportLoading = false;
        state.reportSuccess = true;
      })
      .addCase(reportViolenceContent.rejected, (state, action) => {
        state.reportLoading = false;
        state.reportError = action.payload;
      })
      
      // 获取案例
      .addCase(getAntiViolenceCase.pending, (state) => {
        state.caseLoading = true;
        state.caseError = null;
      })
      .addCase(getAntiViolenceCase.fulfilled, (state, action) => {
        state.caseLoading = false;
        state.caseData = action.payload;
      })
      .addCase(getAntiViolenceCase.rejected, (state, action) => {
        state.caseLoading = false;
        state.caseError = action.payload;
      })
      
      // 点赞案例
      .addCase(likeCase.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
        state.actionSuccess = false;
      })
      .addCase(likeCase.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.actionSuccess = true;
        state.caseData = action.payload;
      })
      .addCase(likeCase.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      })
      
      // 分享案例
      .addCase(shareCase.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
        state.actionSuccess = false;
      })
      .addCase(shareCase.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.actionSuccess = true;
        state.caseData = action.payload;
      })
      .addCase(shareCase.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      })
      
      // 获取鼓励留言
      .addCase(getEncouragements.pending, (state) => {
        state.encouragementsLoading = true;
        state.encouragementsError = null;
      })
      .addCase(getEncouragements.fulfilled, (state, action) => {
        state.encouragementsLoading = false;
        state.encouragements = action.payload;
      })
      .addCase(getEncouragements.rejected, (state, action) => {
        state.encouragementsLoading = false;
        state.encouragementsError = action.payload;
      })
      
      // 添加鼓励留言
      .addCase(addEncouragement.pending, (state) => {
        state.encouragementsLoading = true;
        state.encouragementsError = null;
        state.addEncouragementSuccess = false;
      })
      .addCase(addEncouragement.fulfilled, (state, action) => {
        state.encouragementsLoading = false;
        state.addEncouragementSuccess = true;
        state.encouragements.push(action.payload);
      })
      .addCase(addEncouragement.rejected, (state, action) => {
        state.encouragementsLoading = false;
        state.encouragementsError = action.payload;
      });
  }
});

export const { 
  clearDetectionResult, 
  clearReportStatus, 
  clearActionStatus,
  clearAddEncouragementStatus
} = antiViolenceSlice.actions;

export default antiViolenceSlice.reducer;