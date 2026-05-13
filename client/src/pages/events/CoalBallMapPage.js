import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import {
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  Avatar,
  Fab,
  Alert,
  CircularProgress,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Close as CloseIcon,
  PhotoCamera as PhotoCameraIcon,
  LocationOn as LocationIcon,
  MyLocation as MyLocationIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { isAdmin } from '../../utils/permissions';
import { useNavigate } from 'react-router-dom';
import { createApiUrl, API_ENDPOINTS } from '../../config/api';
import { EmojiButton } from '../../components/emojis/EmojiPicker';
import { parseEmojiContent } from '../../utils/emojiParser';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const coalBallIcon = new L.Icon({
  iconUrl: '/img/coalball.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
});

// const createUserImageIcon = (imageUrl, blobUrl) => { // 暂时注释掉未使用的函数
//   const displayUrl = blobUrl || (imageUrl.startsWith('http') ? imageUrl : createApiUrl(imageUrl));
//   return new L.Icon({
//     iconUrl: 'data:image/svg+xml;base64,' + btoa(`
//       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40">
//         <defs>
//           <clipPath id="circle">
//             <circle cx="20" cy="20" r="18"/>
//           </clipPath>
//         </defs>
//         <circle cx="20" cy="20" r="20" fill="white" stroke="#ddd" stroke-width="2"/>
//         <image href="${displayUrl}" x="2" y="2" width="36" height="36" clip-path="url(#circle)" preserveAspectRatio="xMidYMid slice"/>
//       </svg>
//     `),
//     iconSize: [40, 40],
//     iconAnchor: [20, 40],
//     popupAnchor: [0, -40]
//   });
// };

const CoalBallMapPage = () => {
  const [events, setEvents] = useState([]);
  const [eventDetails, setEventDetails] = useState({}); // 存储详细信息的缓存
  const [imageUrls, setImageUrls] = useState({}); // 图片URL缓存
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    image: null
  });
  const [submitting, setSubmitting] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState({}); // 跟踪详细信息加载状态
  const [mapRef, setMapRef] = useState(null); // 地图引用状态
  
  const user = useSelector(state => state.auth.user);
  const navigate = useNavigate();

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imageUrls[imagePath]) return imageUrls[imagePath];
    
    let fullUrl;
    if (imagePath.startsWith('http')) {
      fullUrl = imagePath;
    } else {
      const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
      fullUrl = createApiUrl(cleanPath);
    }
    
    setImageUrls(prev => ({ ...prev, [imagePath]: fullUrl }));
    return fullUrl;
  };

  // 移除复杂的图片预加载逻辑以提升性能

  const ImageComponent = ({ imagePath, alt, ...props }) => {
    const imageUrl = getImageUrl(imagePath);

    if (!imageUrl) {
      return (
        <Box sx={{ 
          height: props.height || 160, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}>
          <img 
            src="/img/coalball.png" 
            alt="黑煤球图标" 
            style={{ 
              width: 60, 
              height: 60, 
              objectFit: 'contain'
            }}
          />
        </Box>
      );
    }

    return (
      <CardMedia
        component="img"
        image={imageUrl}
        alt={alt}
        loading="lazy"
        {...props}
      />
    );
  };

  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        setSelectedPosition([e.latlng.lat, e.latlng.lng]);
        setDialogOpen(true);
      }
    });
    return null;
  };

  const MapRefHandler = () => {
    const map = useMap();
    useEffect(() => {
      setMapRef(map);
    }, [map]);
    return null;
  };

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      alert('您的浏览器不支持地理位置功能');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const userPos = [latitude, longitude];
        setUserLocation(userPos);
        
        if (mapRef) {
          mapRef.setView(userPos, 15);
        }
        setLocating(false);
      },
      (error) => {
        console.error('获取位置失败:', error);
        let errorMessage = '获取位置失败';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = '用户拒绝了地理位置请求';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = '位置信息不可用';
            break;
          case error.TIMEOUT:
            errorMessage = '获取位置超时';
            break;
          default:
            errorMessage = '获取位置时发生未知错误';
            break;
        }
        alert(errorMessage);
        setLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  useEffect(() => {
    loadMapEvents();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRetry = () => {
    setError(null);
    loadMapEvents();
  };

  const loadMapEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      // 使用轻量级API，只加载位置和基本信息
      const response = await fetch(createApiUrl(API_ENDPOINTS.EVENTS.LIST) + '?limit=1000&lightweight=true');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        const formattedEvents = data.data.map(event => ({
          id: event._id,
          lat: event.latitude,
          lng: event.longitude,
          title: event.title,
          author: event.author,
          createdAt: event.createdAt,
          // 标记为轻量级数据，详细信息需要懒加载
          isLightweight: true
        }));
        setEvents(formattedEvents);
      } else {
        throw new Error(data.error || '获取地图事件失败');
      }
    } catch (error) {
      console.error('加载地图事件失败:', error);
      setError({
        message: '加载足迹数据失败',
        detail: error.message,
        canRetry: true
      });
    } finally {
      setLoading(false);
    }
  };

  // 新增：懒加载单个事件的详细信息
  const loadEventDetails = async (eventId) => {
    if (eventDetails[eventId] || loadingDetails[eventId]) {
      return; // 已加载或正在加载中
    }

    try {
      setLoadingDetails(prev => ({ ...prev, [eventId]: true }));
      
      const response = await fetch(createApiUrl(API_ENDPOINTS.EVENTS.DETAIL(eventId)));
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setEventDetails(prev => ({
          ...prev,
          [eventId]: {
            description: data.data.description,
            image: data.data.image,
            views_count: data.data.views_count,
            likes_count: data.data.likes_count,
            // 其他详细信息
            ...data.data
          }
        }));
      }
    } catch (error) {
      console.error('加载事件详情失败:', error);
    } finally {
      setLoadingDetails(prev => ({ ...prev, [eventId]: false }));
    }
  };

  const handleMenuOpen = (event, eventId) => {
    setAnchorEl(event.currentTarget);
    setSelectedEventId(eventId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedEventId(null);
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('确定要删除这个足迹吗？')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(createApiUrl(API_ENDPOINTS.EVENTS.DETAIL(eventId)), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        loadMapEvents();
        handleMenuClose();
        alert('足迹删除成功');
      } else {
        throw new Error('删除失败');
      }
    } catch (error) {
      console.error('删除足迹失败:', error);
      alert('删除足迹失败，请重试');
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedPosition(null);
    setNewEvent({
      title: '',
      description: '',
      image: null,
      imagePreview: ''
    });
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setNewEvent(prev => ({ ...prev, image: file }));
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewEvent(prev => ({ ...prev, imagePreview: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!newEvent.title || !newEvent.description || !selectedPosition) {
      alert('请填写完整信息');
      return;
    }

    try {
      setSubmitting(true);
      
      const formData = new FormData();
      formData.append('title', newEvent.title);
      formData.append('description', newEvent.description);
      formData.append('latitude', selectedPosition[0]);
      formData.append('longitude', selectedPosition[1]);
      formData.append('author', '匿名用户');
      
      if (newEvent.image) {
        formData.append('image', newEvent.image);
      }

      const response = await fetch(createApiUrl(API_ENDPOINTS.EVENTS.CREATE), {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        handleCloseDialog();
        loadMapEvents();
        
        if (mapRef && selectedPosition) {
          mapRef.flyTo(selectedPosition, 15, {
            duration: 2,
            easeLinearity: 0.25
          });
        }
      } else {
        alert('分享失败: ' + (data.error || '未知错误'));
      }
    } catch (error) {
      console.error('提交失败:', error);
      alert('提交失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          正在加载黑煤球足迹地图...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      flexGrow: 1, 
      height: '100vh', 
      width: '100%', 
      overflow: 'hidden',
      position: 'relative'
    }}>
        
        {/* 地图容器 */}
        <Box sx={{ height: '100%', width: '100%', position: 'absolute', top: 0, left: 0 }}>
        {loading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%)',
              backdropFilter: 'blur(10px)',
              zIndex: 1000
            }}
          >
            <CircularProgress 
              size={60} 
              sx={{ 
                color: 'white',
                mb: 2,
                '& .MuiCircularProgress-circle': {
                  strokeLinecap: 'round'
                }
              }} 
            />
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'white', 
                fontWeight: 'bold',
                textAlign: 'center',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}
            >
              🗺️ 正在加载足迹地图...
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'rgba(255,255,255,0.8)', 
                mt: 1,
                textAlign: 'center'
              }}
            >
              探索黑煤球们的精彩足迹
            </Typography>
          </Box>
        )}

        {error && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.9) 0%, rgba(233, 30, 99, 0.9) 100%)',
              backdropFilter: 'blur(10px)',
              zIndex: 1000,
              p: 4
            }}
          >
            <Typography 
              variant="h4" 
              sx={{ 
                color: 'white', 
                mb: 2,
                textAlign: 'center'
              }}
            >
              😔
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'white', 
                fontWeight: 'bold',
                textAlign: 'center',
                mb: 1
              }}
            >
              {error.message}
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'rgba(255,255,255,0.8)', 
                textAlign: 'center',
                mb: 3,
                maxWidth: '300px'
              }}
            >
              {error.detail}
            </Typography>
            {error.canRetry && (
              <Button
                variant="contained"
                onClick={handleRetry}
                sx={{
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  fontWeight: 'bold',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.3)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.3)'
                  }
                }}
              >
                🔄 重新加载
              </Button>
            )}
          </Box>
        )}
        
        <MapContainer
          center={[35.8617, 104.1954]}
          zoom={4}
          style={{ height: '100%', width: '100%' }}
          maxBounds={[[18, 73], [54, 135]]}
          maxBoundsViscosity={1.0}
          worldCopyJump={false}
          preferCanvas={true}
          zoomControl={true}
          attributionControl={true}
        >
          <TileLayer
            attribution='&copy; 高德地图'
            url="https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}"
            subdomains={['1', '2', '3', '4']}
            maxZoom={18}
            tileSize={256}
          />
          
          <MapClickHandler />
          <MapRefHandler />
          
          {events.map((event) => {
             const markerIcon = coalBallIcon;
            
            return (
              <Marker
                key={event.id}
                position={[event.lat, event.lng]}
                icon={markerIcon}
                eventHandlers={{
                  click: () => {
                    // 点击标记时懒加载详细信息
                    loadEventDetails(event.id);
                  }
                }}
              >
                <Popup maxWidth={380}>
                <Card sx={{ 
                  maxWidth: 360, 
                  borderRadius: 2,
                  overflow: 'hidden',
                  background: '#fff',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                    {loadingDetails[event.id] ? (
                      // 加载中状态
                      <Box sx={{ 
                        height: 160, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      }}>
                        <CircularProgress sx={{ color: 'white' }} />
                        <Typography sx={{ color: 'white', ml: 2 }}>
                          加载中...
                        </Typography>
                      </Box>
                    ) : eventDetails[event.id]?.image ? (
                      // 有图片时显示图片
                      <ImageComponent
                        imagePath={eventDetails[event.id].image}
                        alt={event.title}
                        height="160"
                        sx={{ 
                          objectFit: 'cover'
                        }}
                      />
                    ) : eventDetails[event.id] ? (
                      // 无图片但有详细信息时显示默认图标
                      <Box sx={{ 
                        height: 160, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      }}>
                        <img 
                          src="/img/coalball.png" 
                          alt="黑煤球图标" 
                          style={{ 
                            width: 60, 
                            height: 60, 
                            objectFit: 'contain'
                          }}
                        />
                      </Box>
                    ) : (
                      // 轻量级数据状态，显示点击提示
                      <Box sx={{ 
                        height: 160, 
                        display: 'flex', 
                        flexDirection: 'column',
                        alignItems: 'center', 
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        cursor: 'pointer'
                      }}
                      onClick={() => loadEventDetails(event.id)}
                      >
                        <img 
                          src="/img/coalball.png" 
                          alt="黑煤球图标" 
                          style={{ 
                            width: 60, 
                            height: 60, 
                            objectFit: 'contain',
                            marginBottom: 8
                          }}
                        />
                        <Typography sx={{ 
                          color: 'white', 
                          fontSize: '0.8rem',
                          textAlign: 'center'
                        }}>
                          点击查看详情
                        </Typography>
                      </Box>
                    )}

                  </Box>
                  <CardContent sx={{ p: 3, position: 'relative' }}>

                    {isAdmin(user) && (
                      <>
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, event.id)}
                          sx={{ 
                            position: 'absolute',
                            top: 8,
                            right: 8
                          }}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                        <Menu
                          anchorEl={anchorEl}
                          open={Boolean(anchorEl) && selectedEventId === event.id}
                          onClose={handleMenuClose}
                          PaperProps={{
                            sx: { 
                              minWidth: 120
                            }
                          }}
                        >
                          <MenuItem onClick={() => handleDeleteEvent(event.id)}>
                            <ListItemIcon>
                              <DeleteIcon fontSize="small" color="error" />
                            </ListItemIcon>
                            <ListItemText primary="删除足迹" />
                          </MenuItem>
                        </Menu>
                      </>
                    )}
                    <Typography 
                      variant="h6" 
                      component="h3" 
                      gutterBottom
                      sx={{ 
                        fontWeight: 'bold',
                        color: '#1a202c',
                        mb: 1.5,
                        pr: isAdmin(user) ? 5 : 0,
                        fontSize: '1.15rem',
                        lineHeight: 1.3
                      }}
                    >
                      ✨ {event.title}
                    </Typography>
                    {eventDetails[event.id] ? (
                      // 显示详细描述
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        paragraph
                        sx={{
                          lineHeight: 1.6,
                          color: '#4a5568',
                          mb: 2.5,
                          fontSize: '0.9rem',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {parseEmojiContent(eventDetails[event.id].description || '暂无描述')}
                      </Typography>
                    ) : loadingDetails[event.id] ? (
                      // 加载中状态
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        py: 2,
                        mb: 2.5
                      }}>
                        <CircularProgress size={16} sx={{ mr: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          加载详情中...
                        </Typography>
                      </Box>
                    ) : (
                      // 轻量级数据状态，显示点击加载提示
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          py: 2,
                          mb: 2.5,
                          background: 'rgba(102, 126, 234, 0.05)',
                          borderRadius: 1,
                          cursor: 'pointer',
                          border: '1px dashed rgba(102, 126, 234, 0.3)',
                          '&:hover': {
                            background: 'rgba(102, 126, 234, 0.1)'
                          }
                        }}
                        onClick={() => loadEventDetails(event.id)}
                      >
                        <Typography variant="body2" sx={{ 
                          color: '#667eea',
                          fontSize: '0.85rem',
                          fontWeight: 500
                        }}>
                          点击加载详细内容
                        </Typography>
                      </Box>
                    )}
                    <Box
                      sx={{
                        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%)',
                        borderRadius: 2,
                        p: 1.5,
                        mb: 2.5,
                        border: '1px solid rgba(102, 126, 234, 0.1)'
                      }}
                    >
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: '#667eea',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        📍 经纬度: {event.lat.toFixed(6)}, {event.lng.toFixed(6)}
                      </Typography>
                    </Box>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      pt: 2,
                      borderTop: '1px solid rgba(0,0,0,0.06)'
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          sx={{ 
                            width: 32, 
                            height: 32, 
                            mr: 1.5, 
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            fontSize: '0.9rem',
                            fontWeight: 'bold',
                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                            cursor: event.user_id ? 'pointer' : 'default',
                            transition: 'all 0.2s ease',
                            '&:hover': event.user_id ? {
                              transform: 'scale(1.1)',
                              boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)'
                            } : {}
                          }}
                          onClick={() => {
                            console.log('CoalBall avatar clicked, event data:', event);
                            console.log('event.user_id:', event.user_id);
                            console.log('event.user_id type:', typeof event.user_id);
                            if (event.user_id && typeof event.user_id === 'object' && event.user_id._id) {
                              console.log('Navigating to:', `/messages/${event.user_id._id}`);
                              navigate(`/messages/${event.user_id._id}`);
                            } else if (event.user_id) {
                              console.log('user_id exists but no _id, navigating to:', `/messages/${event.user_id}`);
                              navigate(`/messages/${event.user_id}`);
                            } else {
                              console.log('No user_id found, cannot navigate');
                            }
                          }}
                        >
                          {event.author.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="caption" sx={{ 
                            color: '#2d3748',
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            display: 'block'
                          }}>
                            {event.author}
                          </Typography>
                          <Typography variant="caption" sx={{ 
                            color: '#a0aec0',
                            fontSize: '0.7rem'
                          }}>
                            足迹创建者
                          </Typography>
                        </Box>
                      </Box>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                          borderRadius: 1.5,
                          px: 1.5,
                          py: 0.5
                        }}
                      >
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            mr: 0.8
                          }}
                        />
                        <Typography variant="caption" sx={{ 
                          color: '#667eea',
                          fontSize: '0.7rem',
                          fontWeight: 600
                        }}>
                          足迹点
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Popup>
            </Marker>
            );
          })}
          
          {userLocation && (
            <Marker
              position={userLocation}
              icon={new L.Icon({
                iconUrl: 'data:image/svg+xml;base64,' + btoa(`
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                    <circle cx="12" cy="12" r="8" fill="#2196F3" stroke="white" stroke-width="2"/>
                    <circle cx="12" cy="12" r="3" fill="white"/>
                  </svg>
                `),
                iconSize: [24, 24],
                iconAnchor: [12, 12],
                popupAnchor: [0, -12]
              })}
            >
              <Popup>
                <Typography variant="body2">
                  您的当前位置
                </Typography>
              </Popup>
            </Marker>
          )}
        </MapContainer>
        
        <Fab
          color="primary"
          aria-label="定位"
          onClick={getUserLocation}
          disabled={locating}
          size={window.innerWidth < 600 ? 'medium' : 'large'}
          sx={{
            position: 'absolute',
            top: { xs: 70, sm: 80 },
            right: { xs: 12, sm: 16 },
            zIndex: 1000,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            boxShadow: '0 8px 16px rgba(102, 126, 234, 0.4)',
            width: { xs: 48, sm: 56 },
            height: { xs: 48, sm: 56 },
            '&:hover': {
              background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
              transform: 'translateY(-2px)',
              boxShadow: '0 12px 20px rgba(102, 126, 234, 0.6)'
            },
            '&:disabled': {
              background: 'rgba(102, 126, 234, 0.5)',
              color: 'rgba(255,255,255,0.7)'
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          {locating ? (
            <CircularProgress 
              size={24} 
              sx={{ 
                color: 'inherit',
                '& .MuiCircularProgress-circle': {
                  strokeLinecap: 'round'
                }
              }} 
            />
          ) : (
            <MyLocationIcon sx={{ fontSize: 28 }} />
          )}
        </Fab>

        {/* 地图控制面板 */}
        <Box
          sx={{
            position: 'absolute',
            top: { xs: 12, sm: 16 },
            left: { xs: 12, sm: 16 },
            zIndex: 1000,
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: 3,
            p: { xs: 1.5, sm: 2 },
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            maxWidth: { xs: '200px', sm: 'none' }
          }}
        >
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'rgba(0,0,0,0.6)',
              fontSize: { xs: '0.75rem', sm: '0.85rem' },
              display: { xs: 'none', sm: 'block' }
            }}
          >
            点击地图添加足迹
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'rgba(0,0,0,0.6)',
              fontSize: { xs: '0.75rem', sm: '0.85rem' }
            }}
          >
            📍 共 {events.length} 个足迹
          </Typography>
        </Box>
      </Box>

      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
        fullScreen={window.innerWidth < 600}
        TransitionProps={{
          timeout: {
            enter: 400,
            exit: 300
          }
        }}
        PaperProps={{
          sx: {
            borderRadius: { xs: 0, sm: 4 },
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            boxShadow: '0 24px 48px rgba(102, 126, 234, 0.4)',
            overflow: 'hidden',
            position: 'relative',
            m: { xs: 0, sm: 2 },
            height: { xs: '100vh', sm: 'auto' },
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
              pointerEvents: 'none'
            },
            animation: 'dialogSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'rgba(255,255,255,0.15)', 
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.25)',
          position: 'relative',
          overflow: 'hidden',
          py: { xs: 2, sm: 3 },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
            animation: 'shimmer 2s infinite'
          }
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 'bold', 
                color: 'white',
                fontSize: { xs: '1.25rem', sm: '1.5rem' }
              }}
            >
              ✨ 记录美好
            </Typography>
            <IconButton 
              onClick={handleCloseDialog}
              sx={{ 
                color: 'white',
                '&:hover': { 
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  transform: 'scale(1.1)'
                }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ 
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(10px)',
          p: { xs: 2, sm: 3 },
          flex: 1,
          overflow: 'auto'
        }}>
          {selectedPosition && (
            <Alert 
              severity="info" 
              sx={{ 
                mb: 3,
                background: 'rgba(255,255,255,0.15)',
                color: 'white',
                borderRadius: 2,
                '& .MuiAlert-icon': { color: 'white' }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationIcon sx={{ mr: 1 }} />
                📍 位置: {selectedPosition[0].toFixed(4)}, {selectedPosition[1].toFixed(4)}
              </Box>
            </Alert>
          )}
          
          <TextField
            fullWidth
            label="✏️ 标题"
            value={newEvent.title}
            onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
            margin="normal"
            required
            error={newEvent.title.length > 50}
            helperText={newEvent.title.length > 50 ? '标题不能超过50个字符' : `${newEvent.title.length}/50`}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255,255,255,0.12)',
                borderRadius: 3,
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '& fieldset': {
                  borderColor: 'rgba(255,255,255,0.3)',
                  borderWidth: 2
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255,255,255,0.6)',
                  transform: 'scale(1.02)'
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'rgba(255,255,255,0.9)',
                  boxShadow: '0 0 0 3px rgba(255,255,255,0.1)'
                },
                '&.Mui-error fieldset': {
                  borderColor: 'rgba(244, 67, 54, 0.8)'
                }
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(255,255,255,0.9)',
                fontWeight: 500,
                fontSize: { xs: '0.9rem', sm: '1rem' },
                '&.Mui-focused': {
                  color: 'white'
                }
              },
              '& .MuiOutlinedInput-input': {
                color: 'white',
                fontSize: { xs: '0.9rem', sm: '1rem' },
                fontWeight: 500
              },
              '& .MuiFormHelperText-root': {
                color: 'rgba(255,255,255,0.7)',
                fontSize: '0.75rem',
                '&.Mui-error': {
                  color: 'rgba(244, 67, 54, 0.9)'
                }
              }
            }}
          />
          
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              label="📝 描述"
              value={newEvent.description}
              onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
              margin="normal"
              multiline
              rows={window.innerWidth < 600 ? 3 : 4}
              required
              error={newEvent.description.length > 200}
              helperText={newEvent.description.length > 200 ? '描述不能超过200个字符' : `${newEvent.description.length}/200`}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255,255,255,0.12)',
                  borderRadius: 3,
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '& fieldset': {
                    borderColor: 'rgba(255,255,255,0.3)',
                    borderWidth: 2
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255,255,255,0.6)'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'rgba(255,255,255,0.9)',
                    boxShadow: '0 0 0 3px rgba(255,255,255,0.1)'
                  },
                  '&.Mui-error fieldset': {
                    borderColor: 'rgba(244, 67, 54, 0.8)'
                  }
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255,255,255,0.9)',
                  fontWeight: 500,
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  '&.Mui-focused': {
                    color: 'white'
                  }
                },
                '& .MuiOutlinedInput-input': {
                  color: 'white',
                  fontSize: { xs: '0.85rem', sm: '0.95rem' },
                  lineHeight: 1.5
                },
                '& .MuiFormHelperText-root': {
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '0.75rem',
                  '&.Mui-error': {
                    color: 'rgba(244, 67, 54, 0.9)'
                  }
                }
              }}
            />
            <EmojiButton
              onEmojiSelect={(emojiKey) => {
                const emojiText = `[${emojiKey}]`;
                setNewEvent(prev => ({
                  ...prev,
                  description: prev.description + emojiText
                }));
              }}
            />
          </Box>
          
          <Box sx={{ mt: 2 }}>
            <input
              accept="image/jpeg,image/png,image/webp"
              style={{ display: 'none' }}
              id="image-upload"
              type="file"
              onChange={handleImageChange}
            />
            <label htmlFor="image-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<PhotoCameraIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />}
                fullWidth
                sx={{
                  borderColor: 'rgba(255,255,255,0.4)',
                  color: 'white',
                  borderRadius: 3,
                  py: { xs: 1.5, sm: 2 },
                  px: { xs: 2, sm: 3 },
                  background: 'rgba(255,255,255,0.12)',
                  backdropFilter: 'blur(15px)',
                  borderWidth: 2,
                  fontSize: { xs: '0.85rem', sm: '0.95rem' },
                  fontWeight: 600,
                  textTransform: 'none',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                    transition: 'left 0.5s ease'
                  },
                  '&:hover': {
                    borderColor: 'rgba(255,255,255,0.8)',
                    background: 'rgba(255,255,255,0.2)',
                    transform: 'translateY(-3px)',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.3)',
                    '&::before': {
                      left: '100%'
                    }
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                📷 上传图片（可选）
              </Button>
            </label>
          </Box>
          
          {newEvent.imagePreview && (
            <Box 
              sx={{ 
                mt: 3,
                position: 'relative',
                borderRadius: 3,
                overflow: 'hidden',
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                border: '2px solid rgba(255,255,255,0.2)'
              }}
            >
              <ImageComponent
                src={newEvent.imagePreview}
                alt="预览"
                lazy={false}
                sx={{
                  width: '100%',
                  maxHeight: { xs: '180px', sm: '220px' },
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  background: 'rgba(0,0,0,0.6)',
                  borderRadius: '50%',
                  p: 0.5
                }}
              >
                <IconButton
                  size="small"
                  onClick={() => setNewEvent(prev => ({ ...prev, image: null, imagePreview: null }))}
                  sx={{
                    color: 'white',
                    width: { xs: 32, sm: 40 },
                    height: { xs: 32, sm: 40 },
                    '&:hover': {
                      background: 'rgba(244, 67, 54, 0.8)',
                      transform: 'scale(1.1)'
                    }
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                  p: 1.5
                }}
              >
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: 'white',
                    fontSize: { xs: '0.75rem', sm: '0.8rem' },
                    fontWeight: 500
                  }}
                >
                  📸 图片预览
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ 
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid rgba(255,255,255,0.2)',
          p: { xs: 2, sm: 3 },
          gap: { xs: 1, sm: 2 },
          flexDirection: { xs: 'column', sm: 'row' }
        }}>
          <Button 
            onClick={handleCloseDialog}
            fullWidth={window.innerWidth < 600}
            sx={{
              color: 'rgba(255,255,255,0.8)',
              borderRadius: 2,
              px: { xs: 2, sm: 3 },
              py: { xs: 1.5, sm: 1 },
              fontSize: { xs: '0.9rem', sm: '1rem' },
              '&:hover': {
                background: 'rgba(255,255,255,0.1)',
                color: 'white'
              }
            }}
          >
            ❌ 取消
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!newEvent.title || !newEvent.description || submitting || newEvent.title.length > 50 || newEvent.description.length > 200}
            fullWidth={window.innerWidth < 600}
            sx={{
              background: 'linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%)',
              color: 'white',
              borderRadius: 3,
              px: { xs: 3, sm: 5 },
              py: { xs: 1.5, sm: 2 },
              fontSize: { xs: '0.9rem', sm: '1rem' },
              fontWeight: 'bold',
              textTransform: 'none',
              boxShadow: '0 12px 24px rgba(255, 107, 107, 0.4)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                transition: 'left 0.6s ease'
              },
              '&:hover:not(:disabled)': {
                background: 'linear-gradient(135deg, #FF5252 0%, #26C6DA 100%)',
                transform: 'translateY(-3px)',
                boxShadow: '0 16px 32px rgba(255, 107, 107, 0.6)',
                '&::before': {
                  left: '100%'
                }
              },
              '&:active:not(:disabled)': {
                transform: 'translateY(-1px)',
                boxShadow: '0 8px 16px rgba(255, 107, 107, 0.4)'
              },
              '&:disabled': {
                background: 'rgba(255,255,255,0.15)',
                color: 'rgba(255,255,255,0.4)',
                boxShadow: 'none',
                cursor: 'not-allowed'
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {submitting ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CircularProgress size={20} sx={{ color: 'white', mr: 1 }} />
                🚀 提交中...
              </Box>
            ) : (
              '✨ 分享足迹'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CoalBallMapPage;