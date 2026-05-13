import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  Link,
  useMediaQuery,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Slide,
  Badge,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fade,
  Paper 
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Forum as ForumIcon,
  EmojiEvents as EventsIcon,
  Celebration as ChallengesIcon,
  Shield as AntiViolenceIcon,
  Login as LoginIcon,
  PersonAdd as RegisterIcon,
  Person as ProfileIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Notifications as NotificationsIcon,
  Close as CloseIcon,
  FormatQuote as QuoteIcon,  
  Favorite as FavoriteIcon,
  Message as MessageIcon
} from '@mui/icons-material';
import { logout } from '../../store/slices/authSlice';
import { createApiUrl } from '../../config/api';
import MarsIcon from '../icons/MarsIcon';

const Header = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [notificationCount] = useState(3);
  const [quoteDialogOpen, setQuoteDialogOpen] = useState(false);
  const [dailyQuote, setDailyQuote] = useState('');

  const marsQuotes = [
    {
      text: "我最大的才华是自由。",
      author: "华晨宇",
      type: "哲学"
    },
    {
      text: "你不理解我没关系，我理解你的不理解",
      author: "华晨宇",
      type: "人际交往态度"
    },
    {
      text: "火星人们，感谢你们一直以来的支持，你们是我前进的动力！",
      author: "admin",
      type: "admin"
    },
    {
      text: "性向善，才是人类最后的骄傲和胜算。",
      author: "华晨宇",
      type: "价值观"
    },
    {
      text: "祝你们早日实现财富自由啊。",
      author: "华晨宇",
      type: "社区精神"
    },
    {
      text: "他们给我贴标签，说我是‘异类’。可标签是给商品的，而我是活人 —— 我的血肉，就是我的创作宣言。",
      author: "华晨宇",
      type: "自我认知"
    },
    {
      text: "人生有很多条路，谁知道哪一条对呢，反正先走了再说。",
      author: "华晨宇",
      type: "人生态度"
    },
    {
      text: "即使每个人都只有一个小宇宙，也应该尽力燃烧出自己的形状。",
      author: "华晨宇",
      type: "励志感悟"
    },
    {
      text: "希望树活着。",
      author: "华晨宇",
      type: " "
    },
    {
      text: "大部分人在追求快乐，我只追求自己没有烦恼。",
      author: "华晨宇",
      type: " "
    },
    {
      text: "我不喜欢被人评价，我只喜欢被人发现。",
      author: "华晨宇",
      type: " "
    },
    {
      text: "没有什么东西是你必须永远拿在手里放不下的。",
      author: "华晨宇",
      type: " "
    },
    {
      text: "没有光环，我也能活得很开心。",
      author: "华晨宇",
      type: " "
    },
    {
      text: "我觉得青年应该有梦想，横冲直撞，无所畏惧。",
      author: "华晨宇",
      type: " "
    },
    {
      text: "遇到问题先冷静，想解决办法，若解决不了再另想对策，实在不行再哭。",
      author: "华晨宇",
      type: " "
    },
    {
      text: "我明白这世界规则，却不一定置身其中。",
      author: "华晨宇",
      type: " "
    },
    {
      text: "我们能普通，却绝不能甘于平庸。",
      author: "华晨宇",
      type: " "
    },
    {
      text: "有人说我变，其实是他们变了，而我始终未改。",
      author: "华晨宇",
      type: " "
    },
    {
      text: "蚂蚁难懂海鸥的辽阔。",
      author: "华晨宇",
      type: " "
    },
    {
      text: "不管他人看法，我的世界由我主宰。",
      author: "华晨宇",
      type: " "
    },
    {
      text: "书本老师说海水咸，可我不必全然认可 。",
      author: "华晨宇",
      type: " "
    },
    {
      text: "做自己力所能及之事，在角落默默发光。",
      author: "华晨宇",
      type: " "
    },
    {
      text: "哪怕只有一个人懂，我的音乐就有意义。",
      author: "华晨宇",
      type: " "
    },
    {
      text: "生活给的酸甜苦辣，都化作歌里的情绪。",
      author: "华晨宇",
      type: " "
    },
    {
      text: "打破常规，才能找到音乐新的可能性。",
      author: "华晨宇",
      type: " "
    },
    {
      text: "歌声是我的语言，诉说着心底的温柔。",
      author: "华晨宇",
      type: " "
    },
    {
      text: "不被理解？那是因为我走在不同道路。",
      author: "华晨宇",
      type: " "
    },
    {
      text: "别定义我的音乐，它有自己的生命力 。",
      author: "华晨宇",
      type: " "
    },
    {
      text: "用歌声唤醒沉睡在心底的那份勇敢 。",
      author: "华晨宇",
      type: " "
    },

  ];

  const getDailyQuote = () => {
    const today = new Date().toDateString();
    const savedDate = localStorage.getItem('mars_quote_date');
    const savedQuote = localStorage.getItem('mars_daily_quote');
    
    if (savedDate === today && savedQuote) {
      return JSON.parse(savedQuote);
    } else {
      const baseDate = new Date('2024-01-01'); 
      const currentDate = new Date();
      const daysDiff = Math.floor((currentDate - baseDate) / (1000 * 60 * 60 * 24));
      const index = daysDiff % marsQuotes.length;
      const quote = marsQuotes[index];
      
      localStorage.setItem('mars_quote_date', today);
      localStorage.setItem('mars_daily_quote', JSON.stringify(quote));
      return quote;
    }
  };
  const handleNotificationClick = () => {
    const quote = getDailyQuote();
    setDailyQuote(quote);
    setQuoteDialogOpen(true);
  };
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const navLinks = [
    { title: '首页', path: '/', icon: <HomeIcon />, description: '华晨宇简介' },
    { title: '火星树洞', path: '/posts', icon: <ForumIcon />, description: '粉丝交流社区' },
    { title: '黑煤球足迹', path: '/events', icon: <EventsIcon />, description: '黑煤球在地球的趣事' },
    { title: '挑战赛', path: '/challenges', icon: <ChallengesIcon />, description: '创意挑战活动' },
    { title: '反网络暴力', path: '/anti-violence', icon: <AntiViolenceIcon />, description: '守护网络环境' },
  ];
  const userMenuItems = isAuthenticated
    ? [
        { title: '个人中心', path: '/profile', icon: <ProfileIcon /> },
        { title: '私信', path: '/messages', icon: <MessageIcon /> },
        { title: '退出登录', action: () => dispatch(logout()), icon: <LogoutIcon /> },
      ]
    : [
        { title: '登录', path: '/login', icon: <LoginIcon /> },
        { title: '注册', path: '/register', icon: <RegisterIcon /> },
      ];
  const isActiveLink = (path) => {
    return location.pathname === path;
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleUserMenuItemClick = (item) => {
    handleCloseUserMenu();
    if (item.path) {
      navigate(item.path);
    } else if (item.action) {
      item.action();
    }
  };

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };



  const handleLogoClick = () => {
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const drawerContent = (
    <Box sx={{ width: 280 }} role="presentation">
      <Box
        sx={{
          p: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              mr: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              bgcolor: 'rgba(255,255,255,0.2)'
            }}
          >
            <MarsIcon
              sx={{
                fontSize: '2rem',
                color: 'white'
              }}
            />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              火星基地
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={toggleDrawer(false)}
          sx={{ color: 'white' }}
        >
          <CloseIcon />
        </IconButton>
      </Box>
      <List sx={{ pt: 0 }}>
        {navLinks.map((link) => (
          <ListItem
            button
            key={link.title}
            component={RouterLink}
            to={link.path}
            onClick={toggleDrawer(false)}
            sx={{
              py: 1.5,
              px: 3,
              borderLeft: isActiveLink(link.path) ? '4px solid #667eea' : '4px solid transparent',
              backgroundColor: isActiveLink(link.path) ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
              '&:hover': {
                backgroundColor: 'rgba(102, 126, 234, 0.05)',
                borderLeft: '4px solid rgba(102, 126, 234, 0.5)'
              }
            }}
          >
            <ListItemIcon
              sx={{
                color: isActiveLink(link.path) ? '#667eea' : 'inherit',
                minWidth: 40
              }}
            >
              {link.icon}
            </ListItemIcon>
            <ListItemText
              primary={link.title}
              secondary={link.description}
              primaryTypographyProps={{
                fontWeight: isActiveLink(link.path) ? 600 : 400,
                color: isActiveLink(link.path) ? '#667eea' : 'inherit'
              }}
              secondaryTypographyProps={{
                fontSize: '0.75rem',
                color: 'text.secondary'
              }}
            />
          </ListItem>
        ))}
      </List>

      <Divider sx={{ mx: 2 }} />
      <List>
        {userMenuItems.map((item) => (
          <ListItem
            button
            key={item.title}
            component={item.path ? RouterLink : 'div'}
            to={item.path}
            onClick={(e) => {
              if (item.action) {
                e.preventDefault();
                item.action();
              }
              toggleDrawer(false)(e);
            }}
            sx={{
              py: 1.5,
              px: 3,
              '&:hover': {
                backgroundColor: 'rgba(102, 126, 234, 0.05)'
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.title} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          bgcolor: scrolled ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: scrolled ? '1px solid rgba(0, 0, 0, 0.12)' : 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          color: 'text.primary'
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ minHeight: { xs: 64, md: 72 } }}>
            <IconButton
              size="large"
              edge="start"
              onClick={toggleDrawer(true)}
              sx={{
                mr: 2,
                display: { xs: 'flex', md: 'none' },
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'rgba(102, 126, 234, 0.1)',
                  transform: 'scale(1.1)'
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              <MenuIcon />
            </IconButton>
            <Box
              onClick={handleLogoClick}
              sx={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                mr: { xs: 'auto', md: 4 },
                '&:hover': {
                  transform: 'scale(1.05)'
                },
                transition: 'transform 0.2s ease-in-out'
              }}
            >
              <MarsIcon
                sx={{
                  fontSize: { xs: '2.5rem', md: '3rem' },
                  mr: 1.5
                }}
              />
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontSize: { sm: '1.1rem', md: '1.3rem' },
                    letterSpacing: '0.5px'
                  }}
                >
                  火星基地
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    fontSize: '0.7rem',
                    letterSpacing: '1px',
                    textTransform: 'uppercase'
                  }}
                >
                  Mars base
                </Typography>
              </Box>
            </Box>
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, ml: 2 }}>
              {navLinks.map((link) => {
                const isActive = isActiveLink(link.path);
                return (
                  <Button
                    key={link.title}
                    component={RouterLink}
                    to={link.path}
                    startIcon={link.icon}
                    sx={{
                      mx: 0.5,
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                      color: isActive ? 'primary.main' : 'text.primary',
                      backgroundColor: isActive ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
                      fontWeight: isActive ? 600 : 500,
                      fontSize: '0.9rem',
                      textTransform: 'none',
                      '&:hover': {
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        color: 'primary.main',
                        transform: 'translateY(-1px)'
                      },
                      transition: 'all 0.2s ease-in-out',
                      position: 'relative',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: 0,
                        left: '50%',
                        width: isActive ? '80%' : '0%',
                        height: '2px',
                        backgroundColor: 'primary.main',
                        transform: 'translateX(-50%)',
                        transition: 'width 0.3s ease-in-out'
                      }
                    }}
                  >
                    {link.title}
                  </Button>
                );
              })}
            </Box>

            {/* 工具栏 */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton
                onClick={handleNotificationClick}
                sx={{
                  color: 'text.secondary',
                  '&:hover': {
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    color: 'primary.main',
                    transform: 'scale(1.1)'
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                <Badge badgeContent={notificationCount} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>

              <Dialog
                open={quoteDialogOpen}
                onClose={() => setQuoteDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                TransitionComponent={Fade}
                PaperProps={{
                  sx: {
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden'
                  }
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)',
                    animation: 'pulse 2s infinite'
                  }}
                />
                
                <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                    <QuoteIcon sx={{ fontSize: 32, mr: 1 }} />
                    <Typography variant="h5" fontWeight="bold">
                      今日火星语录
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    {new Date().toLocaleDateString('zh-CN', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </Typography>
                </DialogTitle>
                
                <DialogContent sx={{ 
                  py: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Paper
                    sx={{
                      p: 3,
                      background: 'rgba(255,255,255,0.15)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: 2,
                      width: '100%',
                      maxWidth: 400
                    }}
                  >
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontStyle: 'italic',
                        lineHeight: 1.6,
                        mb: 2,
                        position: 'relative',
                        textAlign: 'left',  
                        width: '100%'
                      }}
                    >
                      "{dailyQuote.text}"
                    </Typography>
                    
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'flex-end', 
                      gap: 1,
                      width: '100%',
                      mt: 2
                    }}>
                      <FavoriteIcon sx={{ fontSize: 16, color: '#ff6b9d' }} />
                      <Typography variant="body2" sx={{ 
                        opacity: 0.9,
                        textAlign: 'right'
                      }}>
                        —— {dailyQuote.author}
                      </Typography>
                    </Box>
                    
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        display: 'block',
                        mt: 1,
                        opacity: 0.7,
                        fontSize: '0.75rem',
                        textAlign: 'center',
                        width: '100%'
                      }}
                    >
                      {dailyQuote.type}
                    </Typography>
                  </Paper>
                </DialogContent>
                
                <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
                  <Button
                    onClick={() => setQuoteDialogOpen(false)}
                    variant="contained"
                    sx={{
                      background: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      '&:hover': {
                        background: 'rgba(255,255,255,0.3)'
                      },
                      borderRadius: 2,
                      px: 4
                    }}
                  >
                    收到啦 💫
                  </Button>
                </DialogActions>
              </Dialog>
              {isAuthenticated && user ? (
                <>
                  <Tooltip title="用户菜单" arrow>
                    <IconButton
                      onClick={handleOpenUserMenu}
                      sx={{
                        p: 0.5,
                        ml: 1,
                        '&:hover': {
                          transform: 'scale(1.1)'
                        },
                        transition: 'transform 0.2s ease-in-out'
                      }}
                    >
                      <Avatar
                        alt={user.nickname || user.username}
                        src={user.avatar ? createApiUrl(user.avatar) : undefined}
                        sx={{
                          width: 36,
                          height: 36,
                          border: '2px solid',
                          borderColor: 'primary.main',
                          boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
                        }}
                      >
                        {(user.nickname || user.username).charAt(0).toUpperCase()}
                      </Avatar>
                    </IconButton>
                  </Tooltip>
                  <Menu
                    sx={{
                      mt: '45px',
                      '& .MuiPaper-root': {
                        borderRadius: 2,
                        minWidth: 200,
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                        border: '1px solid rgba(0, 0, 0, 0.08)'
                      }
                    }}
                    anchorEl={anchorElUser}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    keepMounted
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    open={Boolean(anchorElUser)}
                    onClose={handleCloseUserMenu}
                  >
                    <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid rgba(0, 0, 0, 0.08)' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {user.nickname || user.username}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {user.email}
                      </Typography>
                    </Box>
                    {userMenuItems.map((item) => (
                      <MenuItem
                        key={item.title}
                        onClick={() => handleUserMenuItemClick(item)}
                        sx={{
                          py: 1.5,
                          px: 2,
                          '&:hover': {
                            backgroundColor: 'rgba(102, 126, 234, 0.1)'
                          }
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          {item.icon}
                        </ListItemIcon>
                        <Typography variant="body2">{item.title}</Typography>
                      </MenuItem>
                    ))}
                  </Menu>
                </>
              ) : (
                <Button
                  component={RouterLink}
                  to="/login"
                  variant="outlined"
                  startIcon={<LoginIcon />}
                  sx={{
                    ml: 1,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 3,
                    py: 0.8,
                    fontSize: '0.9rem',
                    color: '#667eea',
                    borderColor: '#667eea',
                    backgroundColor: 'transparent',
                    '&:hover': {
                      borderColor: '#764ba2',
                      backgroundColor: 'rgba(102, 126, 234, 0.04)',
                      color: '#764ba2',
                      transform: 'translateY(-1px)'
                    },
                    '&:active': {
                      transform: 'translateY(0)'
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  登录
                </Button>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* 抽屉菜单 */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        sx={{
          '& .MuiDrawer-paper': {
            borderRadius: '0 16px 16px 0',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
          }
        }}
      >
        <Slide direction="right" in={drawerOpen} mountOnEnter unmountOnExit>
          {drawerContent}
        </Slide>
      </Drawer>
    </>
  );
};

export default Header;