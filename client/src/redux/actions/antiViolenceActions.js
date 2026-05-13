import axios from 'axios';
import {
  DETECT_VIOLENCE_REQUEST,
  DETECT_VIOLENCE_SUCCESS,
  DETECT_VIOLENCE_FAIL,
  GET_RESOURCES_REQUEST,
  GET_RESOURCES_SUCCESS,
  GET_RESOURCES_FAIL,
  REPORT_VIOLENCE_REQUEST,
  REPORT_VIOLENCE_SUCCESS,
  REPORT_VIOLENCE_FAIL,
  GET_CASE_REQUEST,
  GET_CASE_SUCCESS,
  GET_CASE_FAIL,
  LIKE_CASE_REQUEST,
  LIKE_CASE_SUCCESS,
  LIKE_CASE_FAIL,
  SHARE_CASE_REQUEST,
  SHARE_CASE_SUCCESS,
  SHARE_CASE_FAIL,
  ADD_ENCOURAGEMENT_REQUEST,
  ADD_ENCOURAGEMENT_SUCCESS,
  ADD_ENCOURAGEMENT_FAIL,
  GET_ENCOURAGEMENTS_REQUEST,
  GET_ENCOURAGEMENTS_SUCCESS,
  GET_ENCOURAGEMENTS_FAIL
} from '../constants/antiViolenceConstants';

// 检测内容中的网络暴力敏感词
export const detectViolenceContent = (content) => async (dispatch) => {
  try {
    dispatch({ type: DETECT_VIOLENCE_REQUEST });
    
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    // 为游客用户添加sessionId请求头
    const token = localStorage.getItem('token');
    if (!token) {
      // 游客用户，生成或获取sessionId
      let sessionId = localStorage.getItem('detection_session_id');
      if (!sessionId) {
        sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('detection_session_id', sessionId);
      }
      config.headers['x-session-id'] = sessionId;
    }
    
    const { data } = await axios.post('/api/anti-violence/detect', { content }, config);
    
    dispatch({
      type: DETECT_VIOLENCE_SUCCESS,
      payload: data
    });
    
    return data;
  } catch (error) {
    dispatch({
      type: DETECT_VIOLENCE_FAIL,
      payload: error.response && error.response.data.error
        ? error.response.data.error
        : error.message
    });
    throw error;
  }
};

// 获取反网络暴力资源和建议
export const getAntiViolenceResources = () => async (dispatch) => {
  try {
    dispatch({ type: GET_RESOURCES_REQUEST });
    
    const { data } = await axios.get('/api/anti-violence/resources');
    
    dispatch({
      type: GET_RESOURCES_SUCCESS,
      payload: data.data
    });
    
    return data.data;
  } catch (error) {
    dispatch({
      type: GET_RESOURCES_FAIL,
      payload: error.response && error.response.data.error
        ? error.response.data.error
        : error.message
    });
    throw error;
  }
};

// 提交网络暴力举报
export const reportViolenceContent = (reportData) => async (dispatch, getState) => {
  try {
    dispatch({ type: REPORT_VIOLENCE_REQUEST });
    
    // 从状态中获取用户token
    const { userLogin: { userInfo } } = getState();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`
      }
    };
    
    const { data } = await axios.post('/api/anti-violence/report', reportData, config);
    
    dispatch({
      type: REPORT_VIOLENCE_SUCCESS,
      payload: data
    });
    
    return data;
  } catch (error) {
    dispatch({
      type: REPORT_VIOLENCE_FAIL,
      payload: error.response && error.response.data.error
        ? error.response.data.error
        : error.message
    });
    throw error;
  }
};

// 获取反网络暴力案例
export const getAntiViolenceCase = (id) => async (dispatch) => {
  try {
    dispatch({ type: GET_CASE_REQUEST });
    
    const { data } = await axios.get(`/api/anti-violence-cases/${id}`);
    
    dispatch({
      type: GET_CASE_SUCCESS,
      payload: data.data
    });
    
    return data.data;
  } catch (error) {
    dispatch({
      type: GET_CASE_FAIL,
      payload: error.response && error.response.data.error
        ? error.response.data.error
        : error.message
    });
    throw error;
  }
};

// 点赞案例
export const likeCase = (id) => async (dispatch, getState) => {
  try {
    dispatch({ type: LIKE_CASE_REQUEST });
    
    // 从状态中获取用户token
    const { userLogin: { userInfo } } = getState();
    
    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`
      }
    };
    
    const { data } = await axios.put(`/api/anti-violence-cases/${id}/like`, {}, config);
    
    dispatch({
      type: LIKE_CASE_SUCCESS,
      payload: data.data
    });
    
    return data.data;
  } catch (error) {
    dispatch({
      type: LIKE_CASE_FAIL,
      payload: error.response && error.response.data.error
        ? error.response.data.error
        : error.message
    });
    throw error;
  }
};

// 分享案例
export const shareCase = (id) => async (dispatch) => {
  try {
    dispatch({ type: SHARE_CASE_REQUEST });
    
    const { data } = await axios.put(`/api/anti-violence-cases/${id}/share`);
    
    dispatch({
      type: SHARE_CASE_SUCCESS,
      payload: data.data
    });
    
    return data.data;
  } catch (error) {
    dispatch({
      type: SHARE_CASE_FAIL,
      payload: error.response && error.response.data.error
        ? error.response.data.error
        : error.message
    });
    throw error;
  }
};

// 添加鼓励留言
export const addEncouragement = (caseId, content) => async (dispatch, getState) => {
  try {
    dispatch({ type: ADD_ENCOURAGEMENT_REQUEST });
    
    // 从状态中获取用户token
    const { userLogin: { userInfo } } = getState();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`
      }
    };
    
    const { data } = await axios.post('/api/encouragements', { case_id: caseId, content }, config);
    
    dispatch({
      type: ADD_ENCOURAGEMENT_SUCCESS,
      payload: data.data
    });
    
    return data.data;
  } catch (error) {
    dispatch({
      type: ADD_ENCOURAGEMENT_FAIL,
      payload: error.response && error.response.data.error
        ? error.response.data.error
        : error.message
    });
    throw error;
  }
};

// 获取鼓励留言
export const getEncouragements = (caseId) => async (dispatch) => {
  try {
    dispatch({ type: GET_ENCOURAGEMENTS_REQUEST });
    
    const { data } = await axios.get(`/api/encouragements?case_id=${caseId}`);
    
    dispatch({
      type: GET_ENCOURAGEMENTS_SUCCESS,
      payload: data.data
    });
    
    return data.data;
  } catch (error) {
    dispatch({
      type: GET_ENCOURAGEMENTS_FAIL,
      payload: error.response && error.response.data.error
        ? error.response.data.error
        : error.message
    });
    throw error;
  }
};