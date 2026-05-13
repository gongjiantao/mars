import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import http from '../../services/http';

// 异步action：获取活动列表
export const fetchEvents = createAsyncThunk(
  'events/fetchEvents',
  async ({ page = 1, limit = 10, search = '' }, { rejectWithValue }) => {
    try {
      const response = await http.get('/api/events', {
        params: { page, limit, search }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.data || { error: error.message });
    }
  }
);

// 异步action：获取单个活动详情
export const fetchEventById = createAsyncThunk(
  'events/fetchEventById',
  async (eventId, { rejectWithValue }) => {
    try {
      const response = await http.get(`/api/events/${eventId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.data || { error: error.message });
    }
  }
);

// 异步action：创建新活动
export const createEvent = createAsyncThunk(
  'events/createEvent',
  async (eventData, { rejectWithValue }) => {
    try {
      const response = await http.post('/api/events', eventData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.data || { error: error.message });
    }
  }
);

// 异步action：更新活动
export const updateEvent = createAsyncThunk(
  'events/updateEvent',
  async ({ eventId, eventData }, { rejectWithValue }) => {
    try {
      const response = await http.put(`/api/events/${eventId}`, eventData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.data || { error: error.message });
    }
  }
);

// 异步action：删除活动
export const deleteEvent = createAsyncThunk(
  'events/deleteEvent',
  async (eventId, { rejectWithValue }) => {
    try {
      await http.delete(`/api/events/${eventId}`);
      return eventId;
    } catch (error) {
      return rejectWithValue(error.data || { error: error.message });
    }
  }
);

// 异步action：报名参加活动
export const joinEvent = createAsyncThunk(
  'events/joinEvent',
  async (eventId, { rejectWithValue }) => {
    try {
      const response = await http.post(`/api/events/${eventId}/join`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.data || { error: error.message });
    }
  }
);

// 异步action：取消报名活动
export const leaveEvent = createAsyncThunk(
  'events/leaveEvent',
  async (eventId, { rejectWithValue }) => {
    try {
      const response = await http.delete(`/api/events/${eventId}/join`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.data || { error: error.message });
    }
  }
);

// 异步action：收藏活动
export const saveEvent = createAsyncThunk(
  'events/saveEvent',
  async (eventId, { rejectWithValue }) => {
    try {
      const response = await http.post(`/api/events/${eventId}/save`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.data || { error: error.message });
    }
  }
);

// 异步action：取消收藏活动
export const unsaveEvent = createAsyncThunk(
  'events/unsaveEvent',
  async (eventId, { rejectWithValue }) => {
    try {
      const response = await http.delete(`/api/events/${eventId}/save`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.data || { error: error.message });
    }
  }
);

const initialState = {
  events: [],
  event: null,
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
    status: '',
    sortBy: 'startDate',
    order: 'asc'
  }
};

const eventSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    clearEventError: (state) => {
      state.error = null;
    },
    resetEventSuccess: (state) => {
      state.success = false;
    },
    setEventFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetEventFilters: (state) => {
      state.filters = {
        search: '',
        category: '',
        status: '',
        sortBy: 'startDate',
        order: 'asc'
      };
    },
    // 模拟收藏活动（本地状态更新）
    toggleSaveEventLocal: (state, action) => {
      const { eventId, saved } = action.payload;
      if (state.event && state.event._id === eventId) {
        state.event.saved = saved;
      }
      
      const eventIndex = state.events.findIndex(event => event._id === eventId);
      if (eventIndex !== -1) {
        state.events[eventIndex].saved = saved;
      }
    },
    // 模拟报名活动（本地状态更新）
    toggleJoinEventLocal: (state, action) => {
      const { eventId, joined } = action.payload;
      if (state.event && state.event._id === eventId) {
        state.event.joined = joined;
        state.event.participants = joined 
          ? state.event.participants + 1 
          : Math.max(0, state.event.participants - 1);
      }
      
      const eventIndex = state.events.findIndex(event => event._id === eventId);
      if (eventIndex !== -1) {
        state.events[eventIndex].joined = joined;
        state.events[eventIndex].participants = joined 
          ? state.events[eventIndex].participants + 1 
          : Math.max(0, state.events[eventIndex].participants - 1);
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // 获取活动列表
      .addCase(fetchEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.events = action.payload.events;
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          totalPages: action.payload.totalPages
        };
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || '获取活动列表失败';
      })
      // 获取单个活动详情
      .addCase(fetchEventById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEventById.fulfilled, (state, action) => {
        state.loading = false;
        state.event = action.payload;
      })
      .addCase(fetchEventById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || '获取活动详情失败';
      })
      // 创建新活动
      .addCase(createEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.events.unshift(action.payload);
        state.success = true;
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || '创建活动失败';
        state.success = false;
      })
      // 更新活动
      .addCase(updateEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        state.loading = false;
        if (state.event && state.event._id === action.payload._id) {
          state.event = action.payload;
        }
        const eventIndex = state.events.findIndex(event => event._id === action.payload._id);
        if (eventIndex !== -1) {
          state.events[eventIndex] = action.payload;
        }
        state.success = true;
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || '更新活动失败';
        state.success = false;
      })
      // 删除活动
      .addCase(deleteEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.events = state.events.filter(event => event._id !== action.payload);
        if (state.event && state.event._id === action.payload) {
          state.event = null;
        }
        state.success = true;
      })
      .addCase(deleteEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || '删除活动失败';
        state.success = false;
      })
      // 报名参加活动
      .addCase(joinEvent.fulfilled, (state, action) => {
        const { eventId, participants } = action.payload;
        if (state.event && state.event._id === eventId) {
          state.event.joined = true;
          state.event.participants = participants;
        }
        const eventIndex = state.events.findIndex(event => event._id === eventId);
        if (eventIndex !== -1) {
          state.events[eventIndex].joined = true;
          state.events[eventIndex].participants = participants;
        }
      })
      // 取消报名活动
      .addCase(leaveEvent.fulfilled, (state, action) => {
        const { eventId, participants } = action.payload;
        if (state.event && state.event._id === eventId) {
          state.event.joined = false;
          state.event.participants = participants;
        }
        const eventIndex = state.events.findIndex(event => event._id === eventId);
        if (eventIndex !== -1) {
          state.events[eventIndex].joined = false;
          state.events[eventIndex].participants = participants;
        }
      })
      // 收藏活动
      .addCase(saveEvent.fulfilled, (state, action) => {
        const { eventId } = action.payload;
        if (state.event && state.event._id === eventId) {
          state.event.saved = true;
        }
        const eventIndex = state.events.findIndex(event => event._id === eventId);
        if (eventIndex !== -1) {
          state.events[eventIndex].saved = true;
        }
      })
      // 取消收藏活动
      .addCase(unsaveEvent.fulfilled, (state, action) => {
        const { eventId } = action.payload;
        if (state.event && state.event._id === eventId) {
          state.event.saved = false;
        }
        const eventIndex = state.events.findIndex(event => event._id === eventId);
        if (eventIndex !== -1) {
          state.events[eventIndex].saved = false;
        }
      });
  }
});

export const { 
  clearEventError, 
  resetEventSuccess, 
  setEventFilters, 
  resetEventFilters,
  toggleSaveEventLocal,
  toggleJoinEventLocal
} = eventSlice.actions;

export default eventSlice.reducer;