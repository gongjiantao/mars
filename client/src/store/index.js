import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import profileReducer from './slices/profileSlice';
import postReducer from './slices/postSlice';
import commentReducer from './slices/commentSlice';
import eventReducer from './slices/eventSlice';
import challengeReducer from './slices/challengeSlice';
import antiViolenceReducer from './slices/antiViolenceSlice';
import alertReducer from './slices/alertSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    post: postReducer,
    comment: commentReducer,
    event: eventReducer,
    challenge: challengeReducer,
    antiViolence: antiViolenceReducer,
    alert: alertReducer
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;