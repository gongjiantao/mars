import React, { useEffect, useState, useRef } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { isAdmin } from '../utils/permissions';
import { createApiUrl, API_ENDPOINTS } from '../config/api';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Container,
  Divider,
  Paper,
  Avatar,
  useTheme,
  Chip,
  IconButton,
  Fade,
  Zoom,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery,
  Skeleton,
  LinearProgress,
  Stack,
  CircularProgress
} from '@mui/material';

import {
  PlayArrow as PlayIcon,
  Favorite as FavoriteIcon,
  Share as ShareIcon,
  EmojiEvents as TrophyIcon,
  MusicNote as MusicIcon,
  VideoLibrary as VideoIcon,
  Album as AlbumIcon,
  Star as StarIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  People as PeopleIcon,
  ArrowForward as ArrowForwardIcon,
  Comment as CommentIcon,
  Close as CloseIcon,
  Warning as WarningIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  KeyboardArrowDown as ArrowDownIcon,
  WbTwilight as SunriseIcon, 
  EmojiEvents as StageIcon,
  Public as GlobalIcon,
  AdminPanelSettings as AdminIcon,
  RestartAlt as ResetIcon,
  Devices as DevicesIcon,
  Computer as ComputerIcon,
  PhoneAndroid as PhoneIcon,
  Lightbulb as TipIcon,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon
} from '@mui/icons-material';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import GalaxyBackground from '../components/common/GalaxyBackground';
import LoadingAnimation from '../components/common/LoadingAnimation';
import { keyframes } from '@emotion/react';

// const styles = `
//   @keyframes bounce {
//     0%, 20%, 50%, 80%, 100% {
//       transform: translateY(0);
//     }
//     40% {
//       transform: translateY(-10px);
//     }
//     60% {
//       transform: translateY(-5px);
//     }
//   }
// `;

// 更贴近真实的日出动画关键帧
const sunriseRise = keyframes`
  0%   { transform: translate(-50%, 70vh) scale(0.9); opacity: 0.95; }
  46.43%  { transform: translate(-50%, calc(50vh - 2vmin)) scale(1.0);  opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(1.06); opacity: 0.98; }
`;

const raysSpin = keyframes`
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to   { transform: translate(-50%, -50%) rotate(360deg); }
`;

// 更自然的云雾漂浮（慢速）
const cloudDriftSlow = keyframes`
  0%   { transform: translate(-10vw, 16vh); opacity: 0; }
  8%   { opacity: 0.3; }
  15%  { opacity: 0.75; }
  85%  { opacity: 0.75; }
  92%  { opacity: 0.3; }
  100% { transform: translate(12vw, -8vh); opacity: 0; }
`;

// 更自然的云雾漂浮（中速）
const cloudDriftMedium = keyframes`
  0%   { transform: translate(-6vw, 14vh); opacity: 0; }
  10%  { opacity: 0.25; }
  18%  { opacity: 0.65; }
  82%  { opacity: 0.65; }
  90%  { opacity: 0.25; }
  100% { transform: translate(7vw, -10vh); opacity: 0; }
`;

// 更自然的云雾漂浮（快速）
const cloudDriftFast = keyframes`
  0%   { transform: translate(-12vw, 18vh); opacity: 0; }
  12%  { opacity: 0.2; }
  22%  { opacity: 0.6; }
  78%  { opacity: 0.6; }
  88%  { opacity: 0.2; }
  100% { transform: translate(14vw, -12vh); opacity: 0; }
`;

// 光锥的淡入淡出（更柔）
const conePulse = keyframes`
  0%   { opacity: 0; }
  10%  { opacity: 0.2; }
  25%  { opacity: 0.6; }
  65%  { opacity: 0.38; }
  85%  { opacity: 0.15; }
  100% { opacity: 0; }
`;

// 长时间轴日出动画关键帧
const sunriseRiseLong = keyframes`
  0%   { transform: translate(-50%, 70vh) scale(0.9);  opacity: 0.98; }
  27%  { transform: translate(-50%, 20vh) scale(1.0);  opacity: 1; }    /* 约6秒：露头 */
  100% { transform: translate(-50%, -50%) scale(1.08); opacity: 1; }    /* 22秒：到屏幕中间 */
`;

const conePulseLong = keyframes`
  0%   { opacity: 0; }
  12%  { opacity: 0.2; }
  22%  { opacity: 0.55; }
  65%  { opacity: 0.36; }
  85%  { opacity: 0.15; }
  100% { opacity: 0; }
`;

const goldenFloodExpand = keyframes`
  0%   { transform: translate(-50%, -50%) scale(0.1); opacity: 0; }
  20%  { opacity: 0.7; }
  100% { transform: translate(-50%, -50%) scale(6.5); opacity: 1; }
`;

const finalTextFadeIn = keyframes`
  0%   { opacity: 0; transform: translate(-50%, -40%) scale(0.98); }
  100% { opacity: 1; transform: translate(-50%, -40%) scale(1); }
`;

const sunriseContainerFadeIn = keyframes`
  0%   { opacity: 0; }
  5%   { opacity: 0.3; }
  10%  { opacity: 0.7; }
  15%  { opacity: 1; }
  93%  { opacity: 1; }
  96%  { opacity: 0.7; }
  98%  { opacity: 0.3; }
  100% { opacity: 0; }
`;

const heroSliderStyles = `
  .hero-fullscreen {
    position: relative;
    height: 100vh;
    overflow: hidden;
    opacity: 1;
  }

  .hero-fullscreen .slick-slider {
    height: 100vh;
  }

  .hero-fullscreen .slick-list {
    height: 100vh;
  }

  .hero-fullscreen .slick-track {
    height: 100vh;
    display: flex;
    align-items: flex-end; /* 改为底部对齐 */
  }

  .hero-fullscreen .slick-slide {
    height: 100vh;
    outline: none;
  }

  .hero-fullscreen .slick-slide > div {
    height: 100vh;
  }

  .hero-slide {
    position: relative;
    height: 100vh;
    background-size: cover;
    background-position: center;
    display: flex;
    align-items: flex-end; /* 改为底部对齐 */
    justify-content: center;
    opacity: 1;
    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .hero-slide.slick-active {
    opacity: 1;
  }

  .hero-slide.slick-current {
    opacity: 1;
  }

  .hero-slide:not(.slick-active) {
    opacity: 0.95;
  }

  /* 简化遮罩层 */
  .hero-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      135deg,
      rgba(0, 0, 0, 0.1) 0%,
      rgba(0, 0, 0, 0.05) 50%,
      rgba(0, 0, 0, 0.15) 100%
    );
    z-index: 1;
  }

  .hero-content {
    position: relative;
    z-index: 2;
    text-align: center;
    color: white;
    max-width: 800px;
    padding: 0 40px;
    margin-bottom: 120px;
    opacity: 0;
    transform: translateY(60px);
    animation: slideUpFromBottom 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.3s forwards;
  }

  .hero-title {
  font-size: 4rem;
  font-weight: 700;
  margin-bottom: 2rem;
  letter-spacing: -0.02em;
  line-height: 1.1;
  background: linear-gradient(
    135deg, 
    #ffffff 0%, 
    #f8f9ff 30%,
    #e8eaff 70%,
    #ffffff 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
  opacity: 0;
  transform: translateY(40px);
  animation: slideUpFromBottom 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.5s forwards;
  
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3)) 
          drop-shadow(0 0 15px rgba(255, 255, 255, 0.2));
}

.hero-title::before {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    135deg, 
    #667eea 0%, 
    #764ba2 50%,
    #f093fb 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  opacity: 0;
  animation: titleGlow 6s ease-in-out infinite;
  z-index: -1;
}

@keyframes titleGlow {
  0%, 100% {
    opacity: 0;
    filter: blur(0px);
  }
  50% {
    opacity: 0.3;
    filter: blur(1px);
  }
}

.hero-subtitle {
  font-size: 1.5rem;
  font-weight: 400;
  margin-bottom: 2.5rem;
  opacity: 0;
  letter-spacing: 0.02em;
  transform: translateY(40px);
  
  overflow: hidden;
  white-space: nowrap;
  border-right: 2px solid rgba(255, 255, 255, 0.6);
  animation: slideUpFromBottom 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.7s forwards,
             typewriter 2.5s steps(25) 1.5s forwards,
             blinkCursor 1.5s infinite 1.5s;
  
  background: linear-gradient(
    90deg,
    #e8eaff 0%,
    #c7d2fe 30%,
    #a5b4fc 50%,
    #c7d2fe 70%,
    #e8eaff 100%
  );
  background-size: 200% 100%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: slideUpFromBottom 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.7s forwards,
             typewriter 2.5s steps(25) 1.5s forwards,
             blinkCursor 1.5s infinite 1.5s,
             subtleShift 8s ease-in-out infinite 4s;
}

@keyframes typewriter {
  from {
    width: 0;
  }
  to {
    width: 100%;
  }
}

@keyframes blinkCursor {
  0%, 50% {
    border-color: rgba(255, 255, 255, 0.7);
  }
  51%, 100% {
    border-color: transparent;
  }
}

@keyframes subtleShift {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.hero-description {
  font-size: 1.2rem;
  font-weight: 300;
  margin-bottom: 3rem;
  line-height: 1.6;
  opacity: 0;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  transform: translateY(40px);
  letter-spacing: 0.02em;
  animation: slideUpFromBottom 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.9s forwards;
  
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.95) 0%,
    rgba(255, 255, 255, 1) 50%,
    rgba(255, 255, 255, 0.95) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))
          drop-shadow(0 0 6px rgba(255, 255, 255, 0.1));
}



  .hero-buttons {
  opacity: 0;
  transform: translateY(40px);
  animation: slideUpFromBottom 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) 1.1s forwards;
}

.hero-buttons .MuiButton-root {
  position: relative;
  overflow: hidden;
  font-weight: 600;
  letter-spacing: 0.5px;
  
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
}

.hero-buttons .MuiButton-root::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.4) 50%,
    transparent 100%
  );
  transition: left 0.6s ease;
}

.hero-buttons .MuiButton-root:hover::after {
  left: 100%;
}

.hero-content > * {
  animation-fill-mode: both;
}

.hero-title {
  animation: slideUpFromBottom 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.5s forwards;
}

.hero-subtitle {
  animation: slideUpFromBottom 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.7s forwards,
             typewriter 2.5s steps(25) 1.5s forwards,
             blinkCursor 1.5s infinite 1.5s,
             subtleShift 8s ease-in-out infinite 4s;
}

.hero-description {
  animation: slideUpFromBottom 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.9s forwards;
}

@keyframes floatTitle {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-5px);
  }
}

@keyframes floatSubtitle {
  0%, 100% {
    transform: translateY(0px);
  }
  33% {
    transform: translateY(-3px);
  }
  66% {
    transform: translateY(3px);
  }
}

@keyframes floatDescription {
  0%, 100% {
    transform: translateY(0px);
  }
  25% {
    transform: translateY(-2px);
  }
  75% {
    transform: translateY(2px);
  }
}

  .hero-fullscreen .slick-dots {
  bottom: 25px;
  z-index: 10;
  display: flex !important;
  justify-content: center;
  align-items: center;
  gap: 20px;
  padding: 0 20px;
}

.hero-fullscreen .slick-dots li {
  margin: 0;
  width: auto;
  height: auto;
}

.hero-fullscreen .slick-dots li button {
  width: 140px;
  height: 80px;
  border-radius: 16px;
  background: rgba(0, 0, 0, 0.6);
  border: 2px solid rgba(255, 255, 255, 0.3);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(20px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.hero-fullscreen .slick-dots li button::before {
  content: '';
  position: absolute;
  top: 6px;
  left: 6px;
  right: 6px;
  bottom: 22px;
  background-size: cover;
  background-position: center;
  border-radius: 10px;
  opacity: 0.9;
  transition: all 0.3s ease;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.3);
}

.hero-fullscreen .slick-dots li:nth-child(1) button::before {
  background-image: url('img/20210501154254_02eee.jpg');
}

.hero-fullscreen .slick-dots li:nth-child(2) button::before {
  background-image: url('img/dc22902c05919f731839feac022aa67e.jpg');
}

.hero-fullscreen .slick-dots li:nth-child(3) button::before {
  background-image: url('img/92d87395953a21e1518d57c068ad35a7.jpg');
}

.hero-fullscreen .slick-dots li button::after {
  content: attr(data-title);
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  font-size: 11px;
  font-weight: 500;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
  white-space: nowrap;
  z-index: 3;
  background: rgba(0, 0, 0, 0.7);
  padding: 3px 10px;
  border-radius: 8px;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.hero-fullscreen .slick-dots li:nth-child(1) button::after {
  content: '华晨宇';
}

.hero-fullscreen .slick-dots li:nth-child(2) button::after {
  content: '创作鬼才';
}

.hero-fullscreen .slick-dots li:nth-child(3) button::after {
  content: '演唱会传奇';
}

.hero-fullscreen .slick-dots li button:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
}

.hero-fullscreen .slick-dots li button:hover::before {
  opacity: 1;
  transform: scale(1.02);
}

.hero-fullscreen .slick-dots li.slick-active button {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.7);
  transform: translateY(-3px) scale(1.08);
  box-shadow: 0 12px 30px rgba(102, 126, 234, 0.4);
}

.hero-fullscreen .slick-dots li.slick-active button::before {
  opacity: 1;
  transform: scale(1.01);
  box-shadow: inset 0 0 15px rgba(255, 255, 255, 0.15);
}

.hero-fullscreen .slick-dots li.slick-active button::after {
  color: #fff;
  font-weight: 600;
  background: rgba(102, 126, 234, 0.9);
  border-color: rgba(255, 255, 255, 0.2);
}

/* 移动端优化 */
@media (max-width: 768px) {
  .hero-fullscreen .slick-dots {
    bottom: 20px;
    gap: 15px;
    padding: 0 15px;
  }
  
  .hero-fullscreen .slick-dots li button {
    width: 100px;
    height: 60px;
    border-radius: 12px;
  }
  
  .hero-fullscreen .slick-dots li button::before {
    top: 3px;
    left: 3px;
    right: 3px;
    bottom: 16px;
    border-radius: 9px;
  }
  
  .hero-fullscreen .slick-dots li button::after {
    font-size: 10px;
    bottom: 4px;
    padding: 1px 6px;
    border-radius: 4px;
  }
}

@media (max-width: 480px) {
  .hero-fullscreen .slick-dots {
    bottom: 15px;
    gap: 10px;
    padding: 0 10px;
  }
  
  .hero-fullscreen .slick-dots li button {
    width: 80px;
    height: 50px;
    border-radius: 10px;
  }
  
  .hero-fullscreen .slick-dots li button::before {
    top: 2px;
    left: 2px;
    right: 2px;
    bottom: 14px;
    border-radius: 8px;
  }
  
  .hero-fullscreen .slick-dots li button::after {
    font-size: 9px;
    bottom: 3px;
    padding: 1px 4px;
    border-radius: 3px;
  }
}

  @keyframes slideUpFromBottom {
    0% {
      opacity: 0;
      transform: translateY(60px) scale(0.95);
    }
    60% {
      opacity: 0.8;
      transform: translateY(-8px) scale(1.02);
    }
    100% {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes slideInLeft {
    0% {
      opacity: 0;
      transform: translateX(-30px);
    }
    100% {
      opacity: 0.95;
      transform: translateX(0);
    }
  }

  @keyframes slideInRight {
    0% {
      opacity: 0;
      transform: translateX(30px);
    }
    100% {
      opacity: 0.9;
      transform: translateX(0);
    }
  }

  @keyframes fadeInUp {
    0% {
      opacity: 0;
      transform: translateY(20px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .section-title {
    font-size: 3rem;
    font-weight: 800;
    text-align: center;
    margin-bottom: 3rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .timeline-item {
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
    border: 1px solid rgba(0, 0, 0, 0.05);
    border-radius: 20px;
    position: relative;
    overflow: hidden;
  }

  .timeline-item::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }

  .timeline-item:hover::before {
    transform: scaleX(1);
  }

  .timeline-item:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 20px 40px rgba(102, 126, 234, 0.15), 0 8px 16px rgba(0, 0, 0, 0.1);
    border-color: rgba(102, 126, 234, 0.2);
  }

  .award-card {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    background: linear-gradient(145deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
    border-radius: 24px;
    position: relative;
    overflow: hidden;
    backdrop-filter: blur(10px);
  }

  .award-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.15) 50%, transparent 100%);
    transform: skewX(-20deg);
    transition: left 0.4s ease;
  }

  .award-card:hover::before {
    left: 100%;
  }

  .award-card:hover {
    transform: translateY(-8px) scale(1.03);
    box-shadow: 0 20px 40px rgba(102, 126, 234, 0.25), 0 8px 16px rgba(240, 147, 251, 0.15);
  }

  /* 移动端进一步优化 */
  @media (max-width: 768px) {
    .award-card {
      transition: all 0.2s ease;
    }
    
    .award-card::before {
      background: linear-gradient(90deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%);
      transition: left 0.3s ease;
    }
    
    .award-card:hover {
      transform: translateY(-4px) scale(1.01);
      box-shadow: 0 15px 30px rgba(102, 126, 234, 0.2), 0 6px 12px rgba(240, 147, 251, 0.1);
    }
  }

  @media (max-width: 480px) {
    .award-card::before {
      background: rgba(255, 255, 255, 0.08);
      transition: opacity 0.2s ease;
      left: 0;
      transform: none;
    }
    
    .award-card:hover::before {
      opacity: 1;
      left: 0;
    }
  }

  .fan-message {
    background: linear-gradient(145deg, #667eea 0%, #764ba2 100%);
    color: white;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 24px;
    position: relative;
    overflow: hidden;
    backdrop-filter: blur(15px);
  }

  .fan-message::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%, rgba(255, 255, 255, 0.05) 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
  }

  .fan-message:hover::after {
    opacity: 1;
  }

  .fan-message:hover {
    transform: translateY(-6px) scale(1.03);
    box-shadow: 0 20px 40px rgba(102, 126, 234, 0.4), 0 8px 16px rgba(118, 75, 162, 0.3);
  }

  .card-content-animate {
    opacity: 0;
    transform: translateY(20px);
    animation: cardContentFadeIn 0.6s ease-out forwards;
  }

  @keyframes cardContentFadeIn {
    0% {
      opacity: 0;
      transform: translateY(20px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
    margin-bottom: 1.5rem;
    filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.2)) 
            drop-shadow(0 0 15px rgba(102, 126, 234, 0.15));
  }
  
  .hero-subtitle {
    font-size: 1.2rem;
    margin-bottom: 2rem;
  }
  
  .hero-description {
    font-size: 1rem;
    margin-bottom: 2.5rem;
    line-height: 1.5;
  }
  .hero-content {
    padding: 0 20px;
    max-width: 100%;
    margin-bottom: 80px; /* 移动端减少底部间距 */
  }
  .section-title {
    font-size: 2rem;
  }
  .hero-buttons {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .timeline-item:hover,
  .award-card:hover,
  .fan-message:hover {
    transform: translateY(-4px) scale(1.01);
  }
  
  .timeline-item,
  .award-card,
  .fan-message {
    border-radius: 16px;
  }
  
  @keyframes floatTitle {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-2px); }
  }
  
  @keyframes floatSubtitle {
    0%, 100% { transform: translateY(0px); }
    33% { transform: translateY(-1px); }
    66% { transform: translateY(1px); }
  }
  
  @keyframes floatDescription {
    0%, 100% { transform: translateY(0px); }
    25% { transform: translateY(-1px); }
    75% { transform: translateY(1px); }
  }
}

  @media (max-width: 480px) {
  .hero-title {
    font-size: 2rem;
    filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.15));
  }
  
  .hero-subtitle {
    font-size: 1.1rem;
  }
  
  .hero-description {
    font-size: 0.95rem;
  }
  .hero-content {
    margin-bottom: 60px; /* 小屏幕进一步减少间距 */
  }
  .timeline-item,
  .award-card,
  .fan-message {
    border-radius: 12px;
  }
}
`;

const sunriseEffectStyles = `
  @keyframes sunriseRise {
    0% {
      transform: translate(-50%, 60vh);
      opacity: 0;
    }
    30% {
      opacity: 1;
    }
    100% {
      transform: translate(-50%, 0);
      opacity: 0.95;
    }
  }

  @keyframes raysSpin {
    from {
      transform: translate(-50%, -50%) rotate(0deg);
    }
    to {
      transform: translate(-50%, -50%) rotate(360deg);
    }
  }

  @keyframes conePulse {
    0% { opacity: 0; }
    20% { opacity: 1; }
    80% { opacity: 0.9; }
    100% { opacity: 0; }
  }

  @keyframes mistDrift {
    0% {
      transform: translateY(0) translateX(0);
      opacity: 0;
    }
    10% {
      opacity: 1;
    }
    100% {
      transform: translateY(-8vh) translateX(-5vw);
      opacity: 0;
    }
  }
`;

if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = heroSliderStyles + '\n' + sunriseEffectStyles;
  document.head.appendChild(styleElement);
}

const FloatingNotes = () => {
  const notes = ['♪', '♫', '♬', '♩', '♭', '♯'];
  
  return (
    <div className="floating-elements">
      {Array.from({ length: 15 }).map((_, index) => (
        <div
          key={index}
          className="floating-note"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            '--delay': `${Math.random() * 8}s`,
            animationDuration: `${8 + Math.random() * 6}s`
          }}
        >
          {notes[Math.floor(Math.random() * notes.length)]}
        </div>
      ))}
    </div>
  );
};

const HomePage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileWarningOpen, setMobileWarningOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [fanMessages, setFanMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [resetLoading, setResetLoading] = useState(false);
  const [showLoading, setShowLoading] = useState(true); 
  const [pageReady, setPageReady] = useState(false);
  const [sunriseActive, setSunriseActive] = useState(false);
  const [sunriseKey, setSunriseKey] = useState(0);
  const [showFlood, setShowFlood] = useState(false);
  const [showFinalText, setShowFinalText] = useState(false);
  const SUN_TO_CENTER_MS = 28000;
  const audioRef = useRef(null);

  const [awardPreviewOpen, setAwardPreviewOpen] = useState(false);
  const [awardPreviewImages, setAwardPreviewImages] = useState([]);
  const [awardPreviewTitle, setAwardPreviewTitle] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const previewSliderRef = useRef(null);
  const imageRef = useRef(null);
  const isAwardMobile = useMediaQuery('(max-width:600px)');

  // 图片查看器处理函数
  const handleImageZoom = (direction) => {
    setZoomLevel(prev => {
      const newZoom = direction === 'in' ? prev * 1.2 : prev / 1.2;
      return Math.max(0.5, Math.min(3, newZoom));
    });
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
  };

  const handlePrevImage = () => {
    setCurrentImageIndex(prev => 
      prev === 0 ? awardPreviewImages.length - 1 : prev - 1
    );
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
  };

  const handleNextImage = () => {
    setCurrentImageIndex(prev => 
      prev === awardPreviewImages.length - 1 ? 0 : prev + 1
    );
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - imagePosition.x,
        y: e.clientY - imagePosition.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && zoomLevel > 1) {
      setImagePosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleAwardPreviewOpen = (images, title) => {
    setAwardPreviewImages(images);
    setAwardPreviewTitle(title);
    setCurrentImageIndex(0);
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
    setIsFullscreen(false);
    setAwardPreviewOpen(true);
  };

  const handleAwardPreviewClose = () => {
    setAwardPreviewOpen(false);
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
    setIsFullscreen(false);
  };

  const cloudDriftSlow = keyframes`
    from { transform: translateX(-20%); }
    to   { transform: translateX(20%); }
  `;
  const cloudDriftMedium = keyframes`
    0%   { transform: translateX(-50%) translateY(0px) scale(1); opacity: 0.60; }
    15%  { transform: translateX(-42%) translateY(-2px) scale(1.01); opacity: 0.62; }
    35%  { transform: translateX(-25%) translateY(-4px) scale(1.02); opacity: 0.64; }
    50%  { transform: translateX(-50%) translateY(-3px) scale(1.01); opacity: 0.63; }
    65%  { transform: translateX(-38%) translateY(1px) scale(1); opacity: 0.61; }
    85%  { transform: translateX(-22%) translateY(2px) scale(0.99); opacity: 0.59; }
    100% { transform: translateX(-50%) translateY(0px) scale(1); opacity: 0.60; }
  `;
  const cloudDriftFast = keyframes`
    0%   { transform: translateX(-50%) translateY(0px) scale(1); opacity: 0.55; }
    12%  { transform: translateX(-38%) translateY(-3px) scale(1.01); opacity: 0.57; }
    25%  { transform: translateX(-20%) translateY(-5px) scale(1.02); opacity: 0.59; }
    40%  { transform: translateX(-58%) translateY(-4px) scale(1.01); opacity: 0.58; }
    55%  { transform: translateX(-40%) translateY(-1px) scale(1); opacity: 0.56; }
    70%  { transform: translateX(-18%) translateY(2px) scale(0.99); opacity: 0.54; }
    85%  { transform: translateX(-32%) translateY(3px) scale(1); opacity: 0.55; }
    100% { transform: translateX(-50%) translateY(0px) scale(1); opacity: 0.55; }
  `;

  const cloudBase = {
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    width: 'clamp(60vmin, 80vw, 140vmin)',
    height: '22vmin',
    borderRadius: '9999px',
    overflow: 'hidden',
    background: `
      radial-gradient(ellipse at 20% 70%, rgba(255,250,240,0.98) 0%, rgba(255,250,240,0.15) 45%, rgba(255,250,240,0) 70%),
      radial-gradient(ellipse at 45% 30%, rgba(255,245,235,0.92) 0%, rgba(255,245,235,0.25) 50%, rgba(255,245,235,0) 75%),
      radial-gradient(ellipse at 75% 65%, rgba(255,240,225,0.88) 0%, rgba(255,240,225,0.20) 48%, rgba(255,240,225,0) 72%),
      radial-gradient(ellipse at 60% 80%, rgba(255,235,210,0.85) 0%, rgba(255,235,210,0.18) 42%, rgba(255,235,210,0) 68%),
      linear-gradient(165deg, rgba(255,245,225,0.82) 0%, rgba(255,235,205,0.68) 35%, rgba(255,225,190,0.58) 70%, rgba(255,215,175,0.45) 100%)
    `,
    filter: 'blur(11px) saturate(1.18) brightness(1.08) contrast(1.02)',
    opacity: 0.65,
    maskImage: 'linear-gradient(180deg, black 0%, black 40%, rgba(0,0,0,0.8) 65%, rgba(0,0,0,0.4) 85%, transparent 100%)',
    WebkitMaskImage: 'linear-gradient(180deg, black 0%, black 40%, rgba(0,0,0,0.8) 65%, rgba(0,0,0,0.4) 85%, transparent 100%)',
    boxShadow: `
      inset 0 0 80px rgba(255,220,160,0.42),
      inset 0 -20px 60px rgba(255,200,140,0.28),
      0 25px 100px rgba(255,190,130,0.26),
      0 8px 40px rgba(255,180,120,0.18)
    `
  };

  const cloudLayer1 = {
    ...cloudBase,
    left: '25%',
    bottom: '2vh',
    height: '26vmin',
    width: 'clamp(80vmin, 88vw, 150vmin)',
    filter: 'blur(13px) saturate(1.20) brightness(1.10) contrast(1.03)',
    opacity: 0.68,
    boxShadow: `
      inset 0 0 90px rgba(255,225,170,0.48),
      inset 0 -25px 70px rgba(255,205,150,0.32),
      0 30px 120px rgba(255,195,140,0.30),
      0 10px 50px rgba(255,185,130,0.22)
    `,
    animation: `${cloudDriftSlow} 59s ease-in-out forwards`
  };

  const cloudLayer2 = {
    ...cloudBase,
    left: '60%',
    bottom: '6vh',
    height: '22vmin',
    width: 'clamp(68vmin, 78vw, 130vmin)',
    filter: 'blur(10px) saturate(1.16) brightness(1.07) contrast(1.02)',
    opacity: 0.60,
    boxShadow: `
      inset 0 0 75px rgba(255,220,165,0.40),
      inset 0 -18px 55px rgba(255,200,145,0.26),
      0 22px 90px rgba(255,190,135,0.24),
      0 6px 35px rgba(255,180,125,0.16)
    `,
    animation: `${cloudDriftMedium} 59s ease-in-out forwards`
  };

  const cloudLayer3 = {
    ...cloudBase,
    left: '40%',
    bottom: '10vh',
    height: '18vmin',
    width: 'clamp(56vmin, 68vw, 110vmin)',
    filter: 'blur(8px) saturate(1.14) brightness(1.05) contrast(1.01)',
    opacity: 0.55,
    boxShadow: `
      inset 0 0 65px rgba(255,215,160,0.35),
      inset 0 -15px 45px rgba(255,195,140,0.22),
      0 18px 70px rgba(255,185,130,0.20),
      0 4px 25px rgba(255,175,120,0.12)
    `,
    animation: `${cloudDriftFast} 59s ease-in-out forwards`
  };

  const triggerSunrise = () => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio('/audio/mars.mp3');
      }
      audioRef.current.currentTime = 0;
      audioRef.current.volume = 1.0;
      audioRef.current.play().catch(() => {/* 点击触发的 */});
    } catch (_) {}

    setSunriseKey((k) => k + 1);
    setShowFlood(false);
    setShowFinalText(false);
    setSunriseActive(true);

    setTimeout(() => setShowFlood(true), 28000);
    setTimeout(() => setShowFinalText(true), 43000);
    setTimeout(() => {
      setSunriseActive(false);
      setShowFlood(false);
      setShowFinalText(false);
      try {
        if (audioRef.current) {
          // 按需淡出或直接停止，先保持播放自然结束，不慌
        }
      } catch (_) {}
    }, 59000);
  };

  const { user } = useSelector((state) => state.auth || {});
  const concertVideoUrl = 'https://space.bilibili.com/1927400409?spm_id_from=333.337.0.0';
  const sunriseConcertUrl = 'https://www.bilibili.com/video/BV11xs6eyEDS/?spm_id_from=333.1387.0.0&vd_source=dcee163075e14b30aa2c51fec3fcb4c6';
  
  const scrollToTimeline = () => {
    const timelineSection = document.getElementById('music-journey-section');
    if (timelineSection) {
      timelineSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const handleWatchConcert = () => {
    window.open(concertVideoUrl, '_blank');
  };

  const handleWatchSunriseConcert = () => {
    window.open(sunriseConcertUrl, '_blank');
  };

  const blockScroll = (e) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  useEffect(() => {
    if (isMobile) {
      setMobileWarningOpen(true);
    }
  }, [isMobile]);

  const handleCloseMobileWarning = () => {
    setMobileWarningOpen(false);
  };

  const heroSlides = [
    {
      image: 'img/20210501154254_02eee.jpg',
      title: '华晨宇',
      subtitle: '火星音乐王子',
      description: '用音乐点燃梦想，用声音传递力量'
    },
    {
      image: 'img/dc22902c05919f731839feac022aa67e.jpg',
      title: '',
      subtitle: '创作鬼才',
      description: '每一首歌都是一个宇宙，每一个音符都有生命'
    },
    {
      image: 'img/92d87395953a21e1518d57c068ad35a7.jpg',
      title: '',
      subtitle: '演唱会传奇',
      description: '用最震撼的舞美，带给观众最难忘的体验'
    }
  ];

  const timelineData = [
    {
      year: '1990',
      title: '出生',
      description: '2月7日出生于湖北十堰，从小展现音乐天赋'
    },
    {
      year: '2013',
      title: '快男冠军',
      description: '参加《快乐男声》获得全国总冠军，正式出道'
    },
    {
      year: '2014',
      title: '首张专辑',
      description: '发行首张个人专辑《卡西莫多的礼物》'
    },
    {
      year: '2014',
      title: '火星演唱会',
      description: '举办首次个人演唱会"火星"演唱会'
    },
    {
      year: '2018',
      title: '国际认可',
      description: '演唱会舞美设计获得国际大奖'
    },
    {
      year: '2024',
      title: '烟台日出',
      description: '烟台日出演唱会震撼全场，成为经典'
    }
  ];

  const awards = [
    {
      title: '缪斯设计奖',
      year: '2018',
      description: '先锋舞台创意，顶级艺术审美',
      icon: <TrophyIcon />
    },
    {
      title: '美国设计奖',
      year: '2019',
      description: '先锋美学，匠心独运',
      icon: <StageIcon />
    },
    {
      title: '德国IF奖',
      year: '2020',
      description: '巧思入微，美觉无界',
      icon: <GlobalIcon />
    },
    {
      title: '法国设计奖',
      year: '2021',
      description: '非凡乐章，无限可能',
      icon: <StarIcon />
    }
  ];

  const getAwardImages = (awardIndex) => {
    const group = awardIndex + 1; // 1~4
    const count = awardIndex === 2 ? 2 : 3;
    return Array.from({ length: count }, (_, i) => `/img/word/${group}.${i + 1}.jpg`);
  };

  const handleOpenAwardPreview = (awardIndex, title) => {
    setAwardPreviewTitle(title);
    setAwardPreviewImages(getAwardImages(awardIndex));
    setAwardPreviewOpen(true);
    setTimeout(() => {
      if (previewSliderRef.current?.slickGoTo) {
        previewSliderRef.current.slickGoTo(0, true);
      }
    }, 0);
  };

  const handleCloseAwardPreview = () => setAwardPreviewOpen(false);

  const fetchFanMessages = async () => {
    try {
      setLoadingMessages(true);
      const response = await fetch(createApiUrl(API_ENDPOINTS.FAN_MESSAGES.LIST));
      const data = await response.json();
      
      if (data.success) {
        setFanMessages(data.data);
      } else {
        console.error('获取粉丝留言失败:', data.message);
      }
    } catch (error) {
      console.error('获取粉丝留言失败:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    fetchFanMessages();
  }, []);

  const handleLike = async (messageId) => {
    try {
      const response = await fetch(createApiUrl(API_ENDPOINTS.FAN_MESSAGES.LIKE(messageId)), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setFanMessages(prev => 
          prev.map(msg => 
            msg.message_id === messageId 
              ? { ...msg, likes: data.data.likes }
              : msg
          )
        );
      } else {
        console.error('点赞失败:', data.message);
      }
    } catch (error) {
      console.error('点赞失败:', error);
    }
  };

  const handleResetAllLikes = async () => {
    if (!isAdmin(user)) {
      alert('您没有权限执行此操作');
      return;
    }
    
    if (!window.confirm('确定要重置所有粉丝留言的点赞数量吗？此操作不可撤销。')) {
      return;
    }
    
    try {
      setResetLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(createApiUrl(API_ENDPOINTS.FAN_MESSAGES.RESET_ALL_LIKES), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        fetchFanMessages();
        alert('所有点赞数量已重置为0');
      } else {
        alert('重置失败，请稍后重试');
      }
    } catch (error) {
      console.error('重置失败:', error);
      alert('重置失败，请稍后重试');
    } finally {
      setResetLoading(false);
    }
  };

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 6000,
    fade: true,
    cssEase: 'ease-in-out',
    pauseOnHover: true,
    pauseOnFocus: true,
    beforeChange: (current, next) => {
      setCurrentSlide(next);
    }
  };

  const previewSliderSettings = {
    dots: true,
    arrows: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: true
  };

  return (
    <Box sx={{ minHeight: '100vh', position: 'relative' }}>
      <GalaxyBackground />
      <Dialog
  open={mobileWarningOpen}
  onClose={() => setMobileWarningOpen(false)}
  PaperProps={{
    sx: {
      borderRadius: '20px',
      background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15), 0 8px 16px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgba(102, 126, 234, 0.1)',
      backdropFilter: 'blur(20px)',
      minWidth: '320px',
      maxWidth: '420px',
      width: '90vw',
      '@media (max-width: 768px)': {
        minWidth: '280px',
        maxWidth: '380px',
        width: '85vw',
        margin: '16px',
      },
      '@media (max-width: 480px)': {
        minWidth: '260px',
        maxWidth: '340px',
        width: '80vw',
        margin: '12px',
      }
    }
  }}
>
  <DialogTitle
    sx={{
      textAlign: 'center',
      fontSize: '1.3rem',
      fontWeight: '600',
      color: '#2c3e50',
      paddingBottom: '12px',
      paddingTop: '28px',
      textShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
      '@media (max-width: 768px)': {
        fontSize: '1.2rem',
        paddingTop: '24px',
      },
      '@media (max-width: 480px)': {
        fontSize: '1.1rem',
        paddingTop: '20px',
      }
    }}
  >
    💡 温馨提示
  </DialogTitle>
  <DialogContent sx={{ 
    textAlign: 'center', 
    padding: '12px 32px 20px',
    '@media (max-width: 768px)': {
      padding: '10px 28px 18px',
    },
    '@media (max-width: 480px)': {
      padding: '8px 24px 16px',
    }
  }}>
    <Typography
      variant="body2"
      sx={{
        fontSize: '1.1rem', 
        color: '#34495e',
        lineHeight: 1.6,
        marginBottom: '8px',
        fontWeight: '500',
        '@media (max-width: 768px)': {
          fontSize: '1.05rem',
        },
        '@media (max-width: 480px)': {
          fontSize: '1rem',
        }
      }}
    >
      桌面端体验更佳
    </Typography>
    <Typography
      variant="body2"
      sx={{
        fontSize: '0.95rem',
        color: '#7f8c8d',
        fontStyle: 'italic',
        opacity: 0.8,
        '@media (max-width: 768px)': {
          fontSize: '0.9rem',
        },
        '@media (max-width: 480px)': {
          fontSize: '0.85rem',
        }
      }}
    >
      当然，移动端勉强也能用📱
    </Typography>
  </DialogContent>
  <DialogActions sx={{ 
    justifyContent: 'center', 
    paddingBottom: '28px',
    '@media (max-width: 768px)': {
      paddingBottom: '24px',
    },
    '@media (max-width: 480px)': {
      paddingBottom: '20px',
    }
  }}>
    <Button
      onClick={() => setMobileWarningOpen(false)}
      variant="contained"
      sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontSize: '1rem',
        fontWeight: '500',
        padding: '12px 32px',
        borderRadius: '12px',
        textTransform: 'none',
        boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3), 0 2px 4px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        position: 'relative',
        overflow: 'hidden',
        '@media (max-width: 768px)': {
          fontSize: '0.95rem',
          padding: '11px 30px',
        },
        '@media (max-width: 480px)': {
          fontSize: '0.9rem',
          padding: '10px 28px',
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
          transition: 'left 0.5s ease'
        },
        '&:hover': {
          background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
          boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4), 0 3px 6px rgba(0, 0, 0, 0.15)',
          transform: 'translateY(-1px)',
          '&::before': {
            left: '100%'
          }
        },
        '&:active': {
          transform: 'translateY(0px)'
        }
      }}
    >
      彳亍 ✨
    </Button>
  </DialogActions>
</Dialog>

      <Box className="hero-fullscreen">
        <Slider {...sliderSettings}>
          {heroSlides.map((slide, index) => (
            <div key={index}>
              <div
                className="hero-slide"
                style={{
                  backgroundImage: `url(${slide.image})`
                }}
              >
                <div className="hero-overlay" />
                <FloatingNotes />
                <div className="hero-content">
                  <Typography 
                    className="hero-title" 
                    variant="h1"
                    data-text={slide.title}
                  >
                    {slide.title}
                  </Typography>
                  <Typography className="hero-subtitle" variant="h4">
                    {slide.subtitle}
                  </Typography>
                  <Typography className="hero-description" variant="body1">
                    {slide.description}
                  </Typography>
                  <div className="hero-buttons">
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<PlayIcon />}
                      onClick={scrollToTimeline}
                      sx={{
                        px: 4,
                        py: 1.5,
                        fontSize: '1.1rem',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 10px 20px rgba(102, 126, 234, 0.3)'
                        }
                      }}
                    >
                      BEGIN
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </Box>

      <Box id="music-journey-section" sx={{ py: 10, backgroundColor: '#f8f9fa' }}>
        <Container maxWidth="lg">
          <Typography className="section-title" variant="h2">
            音乐路上的每一步
          </Typography>
          
          <Box sx={{ mb: 8, textAlign: 'center' }}>
            <Avatar
              src="img/9afe43e0e4bb0aeee9e2e216cf789cb7.jpg"
              sx={{ 
                width: 200, 
                height: 200, 
                mx: 'auto', 
                mb: 3,
                border: '5px solid #667eea',
                boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
              }}
            />
            <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>
              华晨宇 Hua Chenyu
            </Typography>
            <Typography variant="h6" sx={{ mb: 3, color: '#666' }}>
              中国内地流行乐男歌手、音乐制作人
            </Typography>
            <Typography variant="body1" sx={{ maxWidth: 800, mx: 'auto', lineHeight: 1.8, fontSize: '1.1rem' }}>
              华晨宇，1990年2月7日出生于湖北十堰，中国内地流行乐男歌手、音乐制作人。
              2013年参加湖南卫视《快乐男声》获得全国总冠军正式出道。他以独特的音乐风格、
              震撼的舞台表现力和创新的演唱会设计而闻名，被誉为"火星音乐王子"。
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {timelineData.map((item, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <Fade in timeout={1000 + index * 200}>
                  <Card className="timeline-item" sx={{ 
                    height: '100%', 
                    p: 4,
                    position: 'relative',
                    cursor: 'pointer',
                    '&:hover .timeline-chip': {
                      transform: 'scale(1.1) rotate(2deg)',
                      boxShadow: '0 12px 24px rgba(102, 126, 234, 0.4)'
                    },
                    '&:hover .card-icon': {
                      transform: 'scale(1.2) rotate(10deg)',
                      filter: 'drop-shadow(0 4px 8px rgba(102, 126, 234, 0.3))',
                      opacity: 1
                    }
                  }}>
                    <Box sx={{ 
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      opacity: 0.3,
                      transition: 'all 0.3s ease'
                    }}>
                      <Box className="card-icon" sx={{
                        fontSize: '3rem',
                        color: '#667eea',
                        transition: 'all 0.3s ease'
                      }}>
                        {index === 0 && '🎂'}
                        {index === 1 && '🏆'}
                        {index === 2 && '💿'}
                        {index === 3 && '🎤'}
                        {index === 4 && '🌟'}
                        {index === 5 && '🌅'}
                      </Box>
                    </Box>
                    
                    <Box sx={{ textAlign: 'center', mb: 3, position: 'relative', zIndex: 2 }}>
                      <Chip
                        className="timeline-chip"
                        label={item.year}
                        sx={{
                          fontSize: '1.4rem',
                          fontWeight: 'bold',
                          px: 4,
                          py: 2,
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
                          color: 'white',
                          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                          boxShadow: '0 6px 16px rgba(102, 126, 234, 0.3)',
                          border: '2px solid rgba(255, 255, 255, 0.2)',
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                      />
                    </Box>
                    
                    <Typography 
                      className="card-title"
                      variant="h5" 
                      sx={{ 
                        mb: 3, 
                        fontWeight: 'bold', 
                        textAlign: 'center',
                        background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        position: 'relative',
                        zIndex: 2
                      }}
                    >
                      {item.title}
                    </Typography>
                    
                    <Typography 
                      className="card-description"
                      variant="body1" 
                      sx={{ 
                        color: '#64748b', 
                        textAlign: 'center', 
                        lineHeight: 1.8,
                        fontSize: '1.05rem',
                        position: 'relative',
                        zIndex: 2
                      }}
                    >
                      {item.description}
                    </Typography>
                    
                    {/* 底部装饰线 */}
                    <Box sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '60%',
                      height: '3px',
                      background: 'linear-gradient(90deg, transparent 0%, #667eea 50%, transparent 100%)',
                      opacity: 0,
                      transition: 'opacity 0.3s ease 0.2s'
                    }} className="bottom-line" />
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Box sx={{ 
        py: 10, 
        background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Container maxWidth="lg">
          <Typography className="section-title" variant="h2" sx={{ color: 'white', mb: 6 }}>
            日出演唱会
          </Typography>
          
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ position: 'relative' }}>
                <img
                  src="img/57b610e7eeff4c812cd5465470f27c88.jpg"
                  alt="烟台日出演唱会"
                  style={{
                    width: '100%',
                    borderRadius: '20px',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
                  }}
                />
                <Box
                  onClick={triggerSunrise}
                  role="button"
                  aria-label="触发日出特效"
                  tabIndex={0}
                  sx={{
                    position: 'absolute',
                    top: 20,
                    right: 20,
                    background: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '50%',
                    p: 2,
                    cursor: 'pointer',
                    boxShadow: '0 8px 20px rgba(255,210,64,0.4)',
                    transition: 'transform 0.2s ease',
                    '&:hover': { transform: 'scale(1.05)' }
                  }}
                >
                  <SunriseIcon sx={{ fontSize: 40, color: '#ff6b6b' }} />
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'white' }}>
                当音乐遇见日出
              </Typography>
              <Typography variant="body1" sx={{ mb: 4, fontSize: '1.2rem', lineHeight: 1.8, color: 'white' }}>
              2024 年 5 月 4 日，华晨宇在烟台里蹦岛海滩举办了一场前所未有的日出演唱会（属于 2024 华晨宇火星演唱会烟台站）。
              当第一缕阳光洒向大海的那一刻，伴随着《向阳而生》的旋律，整个舞台与自然景观融为一体，创造了演唱会史上
              极具标志性的浪漫画面。
              </Typography>
              <Stack spacing={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CalendarIcon sx={{ color: 'white' }} />
                  <Typography sx={{ color: 'white', fontSize: '1.1rem' }}>2024年5月4凌晨5:30</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <LocationIcon sx={{ color: 'white' }} />
                  <Typography sx={{ color: 'white', fontSize: '1.1rem' }}>山东烟台·里蹦岛海滩</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <PeopleIcon sx={{ color: 'white' }} />
                  <Typography sx={{ color: 'white', fontSize: '1.1rem' }}>现场观众：120,000+人</Typography>
                </Box>
              </Stack>
              <Button
                variant="contained"
                size="large"
                startIcon={<PlayIcon />}
                onClick={handleWatchSunriseConcert}
                sx={{
                  mt: 4,
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.3)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                重温经典时刻
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box sx={{ py: 10, backgroundColor: '#1a1a2e' }}>
        <Container maxWidth="lg">
          <Typography className="section-title" variant="h2" sx={{ color: 'white', mb: 6 }}>
            国际舞美大奖
          </Typography>
          <Typography variant="h6" sx={{ textAlign: 'center', mb: 6, color: '#ccc' }}>
            华晨宇演唱会舞美设计屡获国际殊荣，引领行业创新潮流
          </Typography>
          
          <Grid container spacing={4}>
            {awards.map((award, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Zoom in timeout={1000 + index * 200}>
                  <Card className="award-card" onClick={() => handleOpenAwardPreview(index, award.title)} sx={{ 
                    height: '100%', 
                    p: 4, 
                    textAlign: 'center',
                    color: 'white',
                    position: 'relative',
                    zIndex: 1,
                    cursor: 'pointer'
                  }}>
                    <Box sx={{ 
                      mb: 4,
                      '& svg': {
                        filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))'
                      }
                    }}>
                      {React.cloneElement(award.icon, { 
                        sx: { 
                          fontSize: 70, 
                          color: 'white',
                          transition: 'all 0.3s ease'
                        } 
                      })}
                    </Box>
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        mb: 3, 
                        fontWeight: 'bold',
                        textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
                      }}
                    >
                      {award.title}
                    </Typography>
                    <Chip
                      label={award.year}
                      sx={{
                        mb: 3,
                        backgroundColor: 'rgba(255, 255, 255, 0.25)',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                      }}
                    />
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        lineHeight: 1.7,
                        textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
                        fontSize: '1rem'
                      }}
                    >
                      {award.description}
                    </Typography>
                  </Card>
                </Zoom>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Dialog
        open={awardPreviewOpen}
        onClose={handleAwardPreviewClose}
        fullWidth
        maxWidth={isFullscreen ? false : "lg"}
        fullScreen={isFullscreen}
        PaperProps={{
          sx: {
            bgcolor: '#000',
            borderRadius: isFullscreen ? 0 : 2,
            maxHeight: isFullscreen ? '100vh' : '90vh'
          }
        }}
      >
        <DialogTitle sx={{ pr: 6, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ color: '#fff' }}>
            {awardPreviewTitle} ({currentImageIndex + 1}/{awardPreviewImages.length})
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              onClick={() => handleImageZoom('out')}
              sx={{ color: '#fff' }}
              disabled={zoomLevel <= 0.5}
            >
              <ZoomOutIcon />
            </IconButton>
            <Typography variant="body2" sx={{ color: '#fff', minWidth: '60px', textAlign: 'center' }}>
              {Math.round(zoomLevel * 100)}%
            </Typography>
            <IconButton
              onClick={() => handleImageZoom('in')}
              sx={{ color: '#fff' }}
              disabled={zoomLevel >= 3}
            >
              <ZoomInIcon />
            </IconButton>
            <IconButton
              onClick={handleFullscreen}
              sx={{ color: '#fff' }}
            >
              {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </IconButton>
            <IconButton
              onClick={handleAwardPreviewClose}
              sx={{ color: '#fff' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0, position: 'relative', overflow: 'hidden' }}>
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: isFullscreen ? 'calc(100vh - 64px)' : '70vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: '#000',
              overflow: 'hidden'
            }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* 左箭头 */}
            <IconButton
              onClick={handlePrevImage}
              sx={{
                position: 'absolute',
                left: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 2,
                color: '#fff',
                bgcolor: 'rgba(0,0,0,0.5)',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
              }}
              disabled={awardPreviewImages.length <= 1}
            >
              <KeyboardArrowLeft />
            </IconButton>
            
            {/* 右箭头 */}
            <IconButton
              onClick={handleNextImage}
              sx={{
                position: 'absolute',
                right: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 2,
                color: '#fff',
                bgcolor: 'rgba(0,0,0,0.5)',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
              }}
              disabled={awardPreviewImages.length <= 1}
            >
              <KeyboardArrowRight />
            </IconButton>
            
            {/* 图片容器 */}
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
              }}
            >
              {awardPreviewImages.length > 0 && (
                <img
                  ref={imageRef}
                  src={awardPreviewImages[currentImageIndex]}
                  alt={`${awardPreviewTitle} - ${currentImageIndex + 1}`}
                  style={{
                    maxWidth: zoomLevel === 1 ? '100%' : 'none',
                    maxHeight: zoomLevel === 1 ? '100%' : 'none',
                    width: zoomLevel > 1 ? `${zoomLevel * 100}%` : 'auto',
                    height: 'auto',
                    transform: `translate(${imagePosition.x}px, ${imagePosition.y}px)`,
                    transition: isDragging ? 'none' : 'transform 0.2s ease',
                    userSelect: 'none',
                    pointerEvents: 'none'
                  }}
                  onMouseDown={handleMouseDown}
                  draggable={false}
                />
              )}
            </Box>
            
            {/* 图片指示器 */}
            {awardPreviewImages.length > 1 && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 16,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  gap: 1,
                  zIndex: 2
                }}
              >
                {awardPreviewImages.map((_, index) => (
                  <Box
                    key={index}
                    onClick={() => {
                      setCurrentImageIndex(index);
                      setZoomLevel(1);
                      setImagePosition({ x: 0, y: 0 });
                    }}
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: index === currentImageIndex ? '#fff' : 'rgba(255,255,255,0.5)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: '#fff',
                        transform: 'scale(1.2)'
                      }
                    }}
                  />
                ))}
              </Box>
            )}
          </Box>
        </DialogContent>
      </Dialog>

      <Box sx={{ py: 10, backgroundColor: '#f0f2f5' }}>
        <Container maxWidth="lg">
          <Typography className="section-title" variant="h2" sx={{ mb: 2 }}>
            黑煤球的心声
          </Typography>
          <Typography variant="h6" sx={{ textAlign: 'center', mb: 4, color: '#666' }}>
            华晨宇粉丝的真挚话语
          </Typography>
          
          {isAdmin(user) && (
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Button
                variant="outlined"
                color="error"
                startIcon={<ResetIcon />}
                onClick={handleResetAllLikes}
                disabled={resetLoading}
                sx={{
                  borderRadius: '25px',
                  px: 3,
                  py: 1,
                  '&:hover': {
                    backgroundColor: 'rgba(244, 67, 54, 0.04)'
                  }
                }}
              >
                {resetLoading ? (
                   <>
                     <CircularProgress size={20} sx={{ mr: 1 }} />
                     重置中...
                   </>
                 ) : (
                   '重置所有点赞'
                 )}
              </Button>
            </Box>
          )}
          
          <Grid container spacing={4}>
            {loadingMessages ? (
              Array.from({ length: 6 }).map((_, index) => (
                <Grid item xs={12} md={6} lg={4} key={index}>
                  <Card sx={{ height: '100%', p: 3, borderRadius: '20px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Skeleton variant="circular" width={50} height={50} sx={{ mr: 2 }} />
                      <Skeleton variant="text" width={120} height={30} />
                    </Box>
                    <Skeleton variant="text" width="100%" height={20} sx={{ mb: 1 }} />
                    <Skeleton variant="text" width="80%" height={20} sx={{ mb: 3 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Skeleton variant="text" width={80} height={20} />
                      <Skeleton variant="circular" width={40} height={40} />
                    </Box>
                  </Card>
                </Grid>
              ))
            ) : (
              fanMessages.map((fan, index) => (
                <Grid item xs={12} md={6} lg={4} key={fan.message_id}>
                  <Fade in timeout={1000 + index * 150}>
                    <Card className="fan-message" sx={{ 
                      height: '100%', 
                      p: 4,
                      position: 'relative',
                      zIndex: 1,
                      borderRadius: '20px'
                    }}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        mb: 4,
                        '&:hover .fan-avatar': {
                          transform: 'scale(1.1)',
                          boxShadow: '0 8px 16px rgba(255, 255, 255, 0.3)'
                        }
                      }}>
                        <Avatar
                          className="fan-avatar"
                          src={fan.avatar}
                          sx={{ 
                            width: 60, 
                            height: 60, 
                            mr: 3,
                            border: '3px solid rgba(255, 255, 255, 0.4)',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                          }}
                        />
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 'bold', 
                            color: 'white',
                            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                            fontSize: '1.2rem'
                          }}
                        >
                          {fan.name}
                        </Typography>
                      </Box>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          lineHeight: 1.9, 
                          fontStyle: 'italic',
                          color: 'rgba(255, 255, 255, 0.95)',
                          fontSize: '1.05rem',
                          textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
                          mb: 4
                        }}
                      >
                        "{fan.message}"
                      </Typography>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center'
                      }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: 'rgba(255, 255, 255, 0.8)',
                            fontWeight: '500'
                          }}
                        >
                          {fan.likes} 人赞同
                        </Typography>
                        <IconButton 
                          sx={{ 
                            color: 'rgba(255, 255, 255, 0.8)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                              color: '#ff6b9d',
                              transform: 'scale(1.3) rotate(10deg)',
                              background: 'rgba(255, 107, 157, 0.15)',
                              boxShadow: '0 4px 12px rgba(255, 107, 157, 0.3)'
                            },
                            '&:active': {
                              transform: 'scale(0.9)'
                            }
                          }}
                          onClick={() => handleLike(fan.message_id)}
                        >
                          <FavoriteIcon />
                        </IconButton>
                      </Box>
                    </Card>
                  </Fade>
                </Grid>
              ))
            )}
          </Grid>
        </Container>
      </Box>

      {sunriseActive && (
        <Box
          key={sunriseKey}
          onWheel={blockScroll}
          onTouchMove={blockScroll}
          sx={{
            position: 'fixed',
            inset: 0,
            zIndex: 2000,
            pointerEvents: 'auto',
            overflow: 'hidden',
            touchAction: 'none',
            overscrollBehavior: 'contain',
            background: 'linear-gradient(180deg, rgba(25,25,45,0.35) 0%, rgba(255,170,120,0.10) 45%, rgba(255,200,140,0.08) 70%, rgba(255,160,120,0.06) 100%)',
            transition: 'background 1s ease',
            animation: `${sunriseContainerFadeIn} 59s ease-in-out forwards`
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: '38vh',
              background: 'linear-gradient(180deg, rgba(255,120,80,0.06) 0%, rgba(255,160,120,0.18) 35%, rgba(255,190,150,0.24) 60%, rgba(255,170,120,0) 100%)',
              filter: 'blur(2px)'
            }}
          />

          <Box
            sx={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: '30vh',
              height: '30vh',
              transform: 'translate(-50%, 70vh)',
              borderRadius: '50%',
              background: 'radial-gradient(circle, #fff0e0 0%, #ffd08a 24%, #ff9a4a 48%, #ff6a2a 66%, #ff3d1f 86%, rgba(255,61,31,0.0) 92%)',
              boxShadow: '0 0 180px 60px rgba(255,120,60,0.38), 0 0 320px 120px rgba(255,80,40,0.25)',
              filter: 'saturate(1.2)',
              animation: `${sunriseRise} ${SUN_TO_CENTER_MS}ms cubic-bezier(0.22, 0.61, 0.36, 1) forwards`,
              willChange: 'transform, opacity'
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '100vh',
                height: '100vh',
                borderRadius: '50%',
                background: 'repeating-conic-gradient(from 0deg, rgba(255,210,120,0.14) 0deg 8deg, rgba(255,210,120,0.0) 8deg 22deg)',
                filter: 'blur(9px)',
                transform: 'translate(-50%, -50%)',
                animation: `${raysSpin} 18s linear infinite`,
                mixBlendMode: 'screen',
                opacity: 0.95
              }}
            />

            <Box
              sx={{
                position: 'absolute',
                inset: '-10%',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,230,160,0.28) 0%, rgba(255,160,80,0.22) 45%, rgba(255,120,60,0.0) 70%)',
                filter: 'blur(10px)',
                mixBlendMode: 'screen'
              }}
            />
          </Box>

          <Box
            sx={{
              position: 'absolute',
              left: '50%',
              bottom: 0,
              width: '140vw',
              height: '90vh',
              transform: 'translateX(-50%)',
              clipPath: 'polygon(50% 10%, 30% 100%, 70% 100%)',
              background: 'linear-gradient(to bottom, rgba(255,200,120,0.55), rgba(255,180,110,0.22) 45%, rgba(255,160,100,0.08) 70%, rgba(255,160,100,0) 100%)',
              filter: 'blur(8px)',
              animation: `${conePulseLong} 28s ease-in-out forwards`
            }}
          />

          <Box sx={cloudLayer1} />
          <Box sx={cloudLayer2} />
          <Box sx={cloudLayer3} />

          {showFlood && (
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '30vh',
                height: '30vh',
                transform: 'translate(-50%, -50%) scale(0.1)',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,225,120,0.95) 0%, rgba(255,210,100,0.85) 35%, rgba(255,190,90,0.7) 60%, rgba(255,180,80,0.55) 75%, rgba(255,170,70,0.0) 100%)',
                mixBlendMode: 'normal',
                filter: 'blur(6px) saturate(1.1)',
                animation: `${goldenFloodExpand} 12s ease-out forwards`
              }}
            />
          )}

          {showFinalText && (
            <Box
              sx={{
                position: 'absolute',
                top: '40%',
                left: '50%',
                transform: 'translate(-50%, -40%)',
                color: '#fff8e1',
                textAlign: 'center',
                textShadow: '0 4px 12px rgba(0,0,0,0.35), 0 0 18px rgba(255, 215, 120, 0.45)',
                letterSpacing: '0.08em',
                fontWeight: 800,
                fontSize: { xs: '1.3rem', sm: '1.8rem', md: '2.4rem', lg: '3rem' },
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
                padding: '0 4px',
                animation: `${finalTextFadeIn} 4s ease-in forwards`
              }}
            >
              中国青年，向上生长，向阳而生！
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};
export default HomePage;