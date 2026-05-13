import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // 第一步：门户登录（预筛选）状态
  const isPreVerified = localStorage.getItem('isAuthenticated') === 'true';
  const loginTime = localStorage.getItem('loginTime');
  const isPreVerifyExpired =
    loginTime && (Date.now() - parseInt(loginTime, 10)) > 24 * 60 * 60 * 1000;

  // 第二步：正常登录（获取 token）状态
  const token = localStorage.getItem('token');

  // 未通过门户登录或已过期，先去门户登录页
  if (!isPreVerified || isPreVerifyExpired) {
    if (isPreVerifyExpired) {
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('loginTime');
    }
    return <Navigate to="/verify" replace />;
  }

  // 已通过门户登录，但未完成正常登录，则跳到正常登录页
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 两步均通过，允许访问受保护页面
  return children;
};

export default ProtectedRoute;