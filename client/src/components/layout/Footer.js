import React from 'react';
import { Box, Container, Typography, Divider, Grid, Link } from '@mui/material';
import { 
  Home,
  Forum,
  Map,
  Shield,
  EmojiEvents,
  Email,
  Phone,
  GitHub,
  Rocket,
  Star,
  People,
  TrendingUp,
  Celebration
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#000000',
        color: 'white',
        py: 4
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
              <Rocket sx={{ mr: 1, animation: 'rocketFloat 3s ease-in-out infinite' }} />
              火星基地粉丝社区
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, opacity: 0.8, lineHeight: 1.6 }}>
              连接每一颗热爱音乐的灵魂，在“火星基地”分享你的故事，发现志同道合的火星人。
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Box sx={{ 
                    textAlign: 'center', 
                    p: 1, 
                    borderRadius: 1, 
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)'
                    }
                  }}>
                    <People sx={{ fontSize: 20, mb: 0.5, color: '#3498db' }} />
                    <Typography variant="caption" display="block" sx={{ fontWeight: 600 }}>
                      300+
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                      用户
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ 
                    textAlign: 'center', 
                    p: 1, 
                    borderRadius: 1, 
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)'
                    }
                  }}>
                    <Star sx={{ fontSize: 20, mb: 0.5, color: '#f39c12', animation: 'starTwinkle 2s ease-in-out infinite' }} />
                    <Typography variant="caption" display="block" sx={{ fontWeight: 600 }}>
                      4.8
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                      评分
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ 
                    textAlign: 'center', 
                    p: 1, 
                    borderRadius: 1, 
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)'
                    }
                  }}>
                    <TrendingUp sx={{ fontSize: 20, mb: 0.5, color: '#27ae60' }} />
                    <Typography variant="caption" display="block" sx={{ fontWeight: 600 }}>
                      88%
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                      活跃度
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {[
                { text: '爱心传递', color: '#e74c3c' },
                { text: '创意交流', color: '#9b59b6' },
                { text: '友好社区', color: '#3498db' }
              ].map((tag, index) => (
                <Box
                  key={index}
                  sx={{
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 2,
                    backgroundColor: tag.color,
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    animation: `tagFloat ${2 + index * 0.5}s ease-in-out infinite`,
                    animationDelay: `${index * 0.2}s`
                  }}
                >
                  {tag.text}
                </Box>
              ))}
            </Box>
        
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              快速导航
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {[
                { icon: <Home />, text: '首页', path: '/' },
                { icon: <Forum />, text: '社区', path: '/posts' },
                { icon: <Map />, text: '地图', path: '/events' },
                { icon: <EmojiEvents />, text: '挑战', path: '/challenges' },
                { icon: <Shield />, text: '反暴力', path: '/anti-violence' }
              ].map((item, index) => (
                <Link
                  key={index}
                  component={RouterLink}
                  to={item.path}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    color: 'rgba(255,255,255,0.8)',
                    textDecoration: 'none',
                    py: 0.5,
                    '&:hover': {
                      color: 'white'
                    }
                  }}
                >
                  <Box sx={{ mr: 1, fontSize: 18 }}>
                    {item.icon}
                  </Box>
                  {item.text}
                </Link>
              ))}
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              网页内容有问题？请尽情联系我吧
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Email sx={{ mr: 1.5, fontSize: 18 }} />
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  3092976135@qq.com
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Phone sx={{ mr: 1.5, fontSize: 18 }} />
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  19123910193
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <GitHub sx={{ mr: 1.5, fontSize: 18 }} />
                <Link
                  href="https://github.com/gongjiantao"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: 'rgba(255,255,255,0.8)',
                    textDecoration: 'none',
                    '&:hover': {
                      color: 'white'
                    }
                  }}
                >
                  GitHub
                </Link>
              </Box>
              
              {/* 分割线 */}
              <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.2)' }} />
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ 
          my: 3, 
          borderColor: 'rgba(255,255,255,0.2)'
        }} />

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" sx={{ mb: 1, opacity: 0.8 }}>
            火星基地粉丝社区 · 让音乐连接世界
          </Typography>
          
          <Typography variant="caption" sx={{ mb: 2, opacity: 0.6, display: 'block' }}>
            本平台致力于创建安全、健康、积极的粉丝交流环境
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            gap: 1,
            opacity: 0.6
          }}>
            <img 
              src="/uploads/avatars/Gan.png" 
              alt="备案图标" 
              style={{ 
                width: 16, 
                height: 16,
                verticalAlign: 'middle'
              }}
            />
            <Typography variant="caption" component="span">
              <Link 
                href="https://beian.mps.gov.cn/#/query/webSearch?code=50023102500777" 
                target="_blank" 
                rel="noreferrer"
                color="inherit"
                underline="none"
                sx={{
                  '&:hover': {
                    color: '#3498db'
                  }
                }}
              >
                渝公网安备50023102500777号
              </Link>
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
<style jsx global>{`
  @keyframes rocketFloat {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-5px); }
  }

  @keyframes starTwinkle {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.7; transform: scale(1.1); }
  }

  @keyframes tagFloat {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-3px); }
  }

  @keyframes celebrationBounce {
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(-10deg); }
    75% { transform: rotate(10deg); }
  }

  @keyframes emojiFloat {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-8px); }
  }
`}</style>