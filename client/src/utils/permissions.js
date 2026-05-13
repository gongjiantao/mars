/**
 * 权限检查工具函数
 */

// 检查用户是否为管理员
export const isAdmin = (user) => {
  return user && user.role === 'admin';
};

// 检查用户是否为版主
export const isModerator = (user) => {
  return user && (user.role === 'moderator' || user.role === 'admin');
};

// 检查用户是否有管理权限（版主或管理员）
export const hasModeratorPermission = (user) => {
  return user && (user.role === 'moderator' || user.role === 'admin');
};

// 检查用户是否有管理员权限
export const hasAdminPermission = (user) => {
  return user && user.role === 'admin';
};

// 检查用户是否可以删除帖子（作者本人或管理员）
export const canDeletePost = (user, post) => {
  if (!user || !post) return false;
  return user._id === post.author?._id || user._id === post.user_id || isAdmin(user);
};

// 检查用户是否可以编辑帖子（作者本人）
export const canEditPost = (user, post) => {
  if (!user || !post) return false;
  return user._id === post.author?._id || user._id === post.user_id;
};

// 检查用户是否可以删除评论（作者本人或管理员）
export const canDeleteComment = (user, comment) => {
  if (!user || !comment) return false;
  return user._id === comment.author?._id || user._id === comment.user_id || isAdmin(user);
};

// 检查用户是否可以管理挑战赛（管理员）
export const canManageChallenge = (user) => {
  return isAdmin(user);
};

// 检查用户是否可以管理事件（管理员）
export const canManageEvent = (user) => {
  return isAdmin(user);
};

// 角色显示名称映射
export const getRoleDisplayName = (role) => {
  const roleMap = {
    'user': '普通用户',
    'moderator': '版主',
    'admin': '管理员'
  };
  return roleMap[role] || '未知角色';
};

// 角色颜色映射
export const getRoleColor = (role) => {
  const colorMap = {
    'user': 'default',
    'moderator': 'primary',
    'admin': 'error'
  };
  return colorMap[role] || 'default';
};