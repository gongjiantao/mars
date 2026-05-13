import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Snackbar, Alert as MuiAlert } from '@mui/material';
import { removeAlert } from '../../store/slices/alertSlice';

// 自定义Alert组件
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const AlertContainer = () => {
  const alerts = useSelector((state) => state.alert);
  const dispatch = useDispatch();

  // 处理关闭提示
  const handleClose = (id) => (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    dispatch(removeAlert(id));
  };

  // 设置自动关闭提示
  useEffect(() => {
    if (alerts.length > 0) {
      alerts.forEach((alert) => {
        const timer = setTimeout(() => {
          dispatch(removeAlert(alert.id));
        }, alert.timeout || 5000);

        return () => clearTimeout(timer);
      });
    }
  }, [alerts, dispatch]);

  return (
    <div>
      {alerts.map((alert) => (
        <Snackbar
          key={alert.id}
          open={true}
          autoHideDuration={alert.timeout || 5000}
          onClose={handleClose(alert.id)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{ mt: 7 }} // 避免被AppBar遮挡
        >
          <Alert
            onClose={handleClose(alert.id)}
            severity={alert.type}
            sx={{ width: '100%' }}
          >
            {alert.message}
          </Alert>
        </Snackbar>
      ))}
    </div>
  );
};

export default AlertContainer;