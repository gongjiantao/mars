import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Typography, Button, Box, Paper } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HomeIcon from '@mui/icons-material/Home';

const NotFoundPage = () => {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 5, 
          textAlign: 'center',
          borderRadius: 2,
          backgroundColor: 'background.paper'
        }}
      >
        <ErrorOutlineIcon sx={{ fontSize: 100, color: 'error.main', mb: 2 }} />
        
        <Typography variant="h3" component="h1" gutterBottom>
          404 - 页面未找到
        </Typography>
        
        <Typography variant="h6" color="text.secondary" paragraph>
          抱歉，您访问的页面不存在或已被移除。
        </Typography>
        
        <Box sx={{ mt: 4 }}>
          <Button 
            component={Link} 
            to="/" 
            variant="contained" 
            color="primary" 
            size="large"
            startIcon={<HomeIcon />}
          >
            返回首页
          </Button>
        </Box>
        
        <Box sx={{ mt: 4 }}>
          <Typography variant="body2" color="text.secondary">
            您可以尝试以下操作：
          </Typography>
          <Box component="ul" sx={{ display: 'inline-block', textAlign: 'left', mt: 1 }}>
            <Typography component="li" variant="body2" color="text.secondary">
              检查URL是否正确
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              返回上一页
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              访问首页浏览其他内容
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default NotFoundPage;