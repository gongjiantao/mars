// API配置文件
// 根据环境自动选择API基础URL

const getApiBaseUrl = () => {
  // 在开发环境中使用localhost
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:5000';
  }
  
  // 在生产环境中使用相对路径，这样会自动使用当前域名
  return '';
};

export const API_BASE_URL = getApiBaseUrl();

// 创建完整的API URL
export const createApiUrl = (endpoint) => {
  // 确保endpoint以/开头
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
};

// 常用的API端点
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    PROFILE: '/api/auth/me',
    ME: '/api/auth/me',
    UPDATE_PROFILE: '/api/auth/update-profile',
    CHANGE_PASSWORD: '/api/auth/change-password',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
    STATS: '/api/auth/stats'
  },
  
  // 粉丝留言相关
  FAN_MESSAGES: {
    LIST: '/api/fan-messages',
    LIKE: (messageId) => `/api/fan-messages/${messageId}/like`,
    RESET_LIKES: (messageId) => `/api/fan-messages/${messageId}/reset-likes`,
    RESET_ALL_LIKES: '/api/fan-messages/reset-all-likes',
    ADMIN: '/api/fan-messages/admin'
  },
  
  // 帖子相关
  POSTS: {
    LIST: '/api/posts',
    CREATE: '/api/posts',
    DETAIL: (postId) => `/api/posts/${postId}`,
    LIKE: (postId) => `/api/posts/${postId}/like`,
    COMMENTS: (postId) => `/api/posts/${postId}/comments`,
    DELETE: (postId) => `/api/posts/${postId}`
  },
  
  // 评论相关
  COMMENTS: {
    LIST: '/api/comments',
    CREATE: '/api/comments',
    LIKE: (commentId) => `/api/comments/${commentId}/like`
  },
  
  // 活动相关
  EVENTS: {
    LIST: '/api/events',
    DETAIL: (eventId) => `/api/events/${eventId}`,
    CREATE: '/api/events'
  },
  
  // 挑战相关
  CHALLENGES: {
    LIST: '/api/challenges',
    CREATE: '/api/challenges',
    CURRENT: '/api/challenges/current',
    DETAIL: (challengeId) => `/api/challenges/${challengeId}`,
    DELETE: (challengeId) => `/api/challenges/${challengeId}`,
    SUBMISSIONS: (challengeId) => `/api/challenges/${challengeId}/submissions`,
    SUBMIT: (challengeId) => `/api/challenges/${challengeId}/submit`,
    VOTE: (submissionId) => `/api/challenges/submissions/${submissionId}/vote`,
    MY_SUBMISSION: (challengeId) => `/api/challenges/${challengeId}/my-submission`,
    SUBMISSION_DETAIL: (submissionId) => `/api/challenges/submissions/${submissionId}`,
    DELETE_SUBMISSION: (submissionId) => `/api/challenges/submissions/${submissionId}`,
    ADMIN_SUBMISSIONS: (challengeId) => `/api/challenges/${challengeId}/submissions/admin`,
    ADMIN_SUBMISSION_DETAIL: (submissionId) => `/api/challenges/submissions/${submissionId}/admin`
  },
  
  // 检测记录相关
  DETECTION_RECORDS: {
    GET: '/api/detection-records',
    GET_GUEST: (sessionId) => `/api/detection-records/guest/${sessionId}`,
    UPDATE: '/api/detection-records/update',
    HISTORY: '/api/detection-records/history'
  },
  
  // 反网络暴力相关
  ANTI_VIOLENCE: {
    DETECT: '/api/anti-violence/detect',
    RESOURCES: '/api/anti-violence/resources',
    REPORT: '/api/anti-violence/report',
    STATS: '/api/anti-violence/stats'
  }
};

export default {
  API_BASE_URL,
  createApiUrl,
  API_ENDPOINTS
};
