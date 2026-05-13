import { createSlice } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

const initialState = [];

const alertSlice = createSlice({
  name: 'alert',
  initialState,
  reducers: {
    setAlert: {
      reducer: (state, action) => {
        state.push(action.payload);
      },
      prepare: ({ message, type, timeout = 5000 }) => {
        const id = uuidv4();
        return { payload: { id, message, type, timeout } };
      }
    },
    removeAlert: (state, action) => {
      return state.filter(alert => alert.id !== action.payload);
    }
  }
});

export const { setAlert, removeAlert } = alertSlice.actions;

// 创建一个带有自动移除功能的alert action
export const setAlertWithTimeout = ({ message, type, timeout = 5000 }) => dispatch => {
  const id = uuidv4();
  dispatch(setAlert({ message, type, timeout, id }));

  setTimeout(() => {
    dispatch(removeAlert(id));
  }, timeout);
};

export default alertSlice.reducer;