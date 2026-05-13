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

// 网络暴力内容检测的reducer
export const violenceDetectionReducer = (state = {}, action) => {
  switch (action.type) {
    case DETECT_VIOLENCE_REQUEST:
      return { loading: true };
    case DETECT_VIOLENCE_SUCCESS:
      return { loading: false, result: action.payload };
    case DETECT_VIOLENCE_FAIL:
      return { loading: false, error: action.payload };
    default:
      return state;
  }
};

// 反网络暴力资源的reducer
export const antiViolenceResourcesReducer = (state = {}, action) => {
  switch (action.type) {
    case GET_RESOURCES_REQUEST:
      return { loading: true };
    case GET_RESOURCES_SUCCESS:
      return { loading: false, resources: action.payload };
    case GET_RESOURCES_FAIL:
      return { loading: false, error: action.payload };
    default:
      return state;
  }
};

// 网络暴力举报的reducer
export const violenceReportReducer = (state = {}, action) => {
  switch (action.type) {
    case REPORT_VIOLENCE_REQUEST:
      return { loading: true };
    case REPORT_VIOLENCE_SUCCESS:
      return { loading: false, success: true, report: action.payload };
    case REPORT_VIOLENCE_FAIL:
      return { loading: false, error: action.payload };
    default:
      return state;
  }
};

// 反网络暴力案例的reducer
export const antiViolenceCaseReducer = (state = {}, action) => {
  switch (action.type) {
    case GET_CASE_REQUEST:
      return { loading: true };
    case GET_CASE_SUCCESS:
      return { loading: false, caseData: action.payload };
    case GET_CASE_FAIL:
      return { loading: false, error: action.payload };
    default:
      return state;
  }
};

// 案例操作（点赞、分享）的reducer
export const caseActionReducer = (state = {}, action) => {
  switch (action.type) {
    case LIKE_CASE_REQUEST:
    case SHARE_CASE_REQUEST:
      return { loading: true };
    case LIKE_CASE_SUCCESS:
    case SHARE_CASE_SUCCESS:
      return { loading: false, success: true, caseData: action.payload };
    case LIKE_CASE_FAIL:
    case SHARE_CASE_FAIL:
      return { loading: false, error: action.payload };
    default:
      return state;
  }
};

// 鼓励留言的reducer
export const encouragementsReducer = (state = { encouragements: [] }, action) => {
  switch (action.type) {
    case GET_ENCOURAGEMENTS_REQUEST:
    case ADD_ENCOURAGEMENT_REQUEST:
      return { ...state, loading: true };
    case GET_ENCOURAGEMENTS_SUCCESS:
      return { loading: false, encouragements: action.payload };
    case ADD_ENCOURAGEMENT_SUCCESS:
      return {
        loading: false,
        success: true,
        encouragements: [...state.encouragements, action.payload]
      };
    case GET_ENCOURAGEMENTS_FAIL:
    case ADD_ENCOURAGEMENT_FAIL:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};