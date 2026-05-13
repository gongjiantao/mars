import React, { useEffect, useRef } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';

const GalaxyBackground = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // 进一步轻量化粒子数量配置
  const starCount = isMobile ? 10 : 25;
  const nebulaeCount = isMobile ? 1 : 1;
  const marsParticleCount = isMobile ? 2 : 4;
  const dustStormCount = 0; // 移除尘暴效果
  const marsOrbitCount = 0; // 移除轨道效果
  const meteorCount = isMobile ? 0 : 1;
  const atmosphereLayerCount = 0; // 移除大气层效果

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let stars = [];
    let nebulae = [];
    let marsParticles = [];
    let dustStorms = [];
    let marsOrbits = [];
    let meteors = [];
    let atmosphereLayers = [];

    // 设置画布尺寸
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    // 简化的星星类
    class Star {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 1.5 + 0.5;
        this.opacity = Math.random() * 0.6 + 0.4;
        this.twinkleSpeed = Math.random() * 0.01 + 0.005;
        this.twinklePhase = Math.random() * Math.PI * 2;
      }

      update() {
        this.twinklePhase += this.twinkleSpeed;
        this.opacity = 0.4 + Math.sin(this.twinklePhase) * 0.3;
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // 简化的星云类
    class Nebula {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 150 + 80;
        this.opacity = Math.random() * 0.08 + 0.02;
        this.color = this.getRandomColor();
        this.pulseSpeed = Math.random() * 0.008 + 0.002;
        this.pulsePhase = Math.random() * Math.PI * 2;
      }

      getRandomColor() {
        const colors = [
          'rgba(138, 43, 226, 0.2)',
          'rgba(75, 0, 130, 0.2)',
          'rgba(255, 20, 147, 0.2)',
          'rgba(0, 191, 255, 0.2)'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.pulsePhase += this.pulseSpeed;
      }

      draw() {
        ctx.save();
        const pulseOpacity = this.opacity + Math.sin(this.pulsePhase) * 0.01;
        ctx.globalAlpha = Math.max(0, pulseOpacity);
        
        const gradient = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, this.size
        );
        
        gradient.addColorStop(0, this.color.replace('0.2', '0.1'));
        gradient.addColorStop(0.5, this.color);
        gradient.addColorStop(1, this.color.replace('0.2', '0'));
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // 初始化
    const init = () => {
      resizeCanvas();
      
      // 创建星星
      stars = [];
      for (let i = 0; i < starCount; i++) {
        stars.push(new Star());
      }
      
      // 创建星云
      nebulae = [];
      for (let i = 0; i < nebulaeCount; i++) {
        nebulae.push(new Nebula());
      }
      
      // 简化的火星粒子（移动端不显示轨迹）
      marsParticles = [];
      for (let i = 0; i < marsParticleCount; i++) {
        marsParticles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 3 + 1,
          color: `hsl(${Math.random() * 30 + 10}, 70%, ${Math.random() * 20 + 50}%)`,
          opacity: Math.random() * 0.5 + 0.3,
          speedX: (Math.random() - 0.5) * 0.2,
          speedY: (Math.random() - 0.5) * 0.2,
          pulse: Math.random() * Math.PI * 2
        });
      }
      
      // 尘暴和轨道效果已移除以提升性能
      dustStorms = [];
      marsOrbits = [];
      
      // 简化的流星效果
      meteors = [];
      for (let i = 0; i < meteorCount; i++) {
        meteors.push({
          x: Math.random() * canvas.width,
          y: -50,
          speedX: (Math.random() - 0.5) * 1,
          speedY: Math.random() * 2 + 1,
          size: Math.random() * 2 + 1,
          opacity: Math.random() * 0.6 + 0.2,
          color: `hsl(${Math.random() * 40 + 10}, 80%, 60%)`,
          life: Math.random() * 150 + 80
        });
      }
      
      // 大气层效果已移除以提升性能
      atmosphereLayers = [];
    };

    // 优化的动画循环
    const animate = () => {
      // 简化的背景渐变
      const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGradient.addColorStop(0, 'rgba(5, 5, 20, 1)');
      bgGradient.addColorStop(1, 'rgba(15, 5, 25, 1)');
      
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // 更新和绘制星云
      nebulae.forEach(nebula => {
        nebula.update();
        nebula.draw();
      });
      
      // 更新和绘制火星粒子（轻量化版本）
      ctx.save();
      marsParticles.forEach(particle => {
        particle.pulse += 0.02;
        const pulseFactor = Math.sin(particle.pulse) * 0.2 + 0.9;
        
        ctx.globalAlpha = particle.opacity * pulseFactor;
        ctx.fillStyle = particle.color;
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * pulseFactor, 0, Math.PI * 2);
        ctx.fill();
        
        // 移动粒子
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // 边界检查
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
      });
      ctx.restore();
      
      // 尘暴和轨道效果已移除以提升性能
      

      
      // 更新和绘制流星（轻量化版本）
      ctx.save();
      meteors.forEach(meteor => {
        ctx.globalAlpha = meteor.opacity;
        ctx.fillStyle = meteor.color;
        
        ctx.beginPath();
        ctx.arc(meteor.x, meteor.y, meteor.size, 0, Math.PI * 2);
        ctx.fill();
        
        meteor.x += meteor.speedX;
        meteor.y += meteor.speedY;
        meteor.life--;
        
        if (meteor.y > canvas.height + 50 || meteor.life <= 0) {
          meteor.x = Math.random() * canvas.width;
          meteor.y = -50;
          meteor.life = Math.random() * 150 + 80;
        }
      });
      ctx.restore();
      
      // 大气层效果已移除以提升性能
      

      
      // 更新和绘制星星
      stars.forEach(star => {
        star.update();
        star.draw();
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };

    // 窗口大小改变事件
    const handleResize = () => {
      resizeCanvas();
      stars.forEach(star => {
        if (star.x > canvas.width) star.x = Math.random() * canvas.width;
        if (star.y > canvas.height) star.y = Math.random() * canvas.height;
      });
      nebulae.forEach(nebula => {
        if (nebula.x > canvas.width) nebula.x = Math.random() * canvas.width;
        if (nebula.y > canvas.height) nebula.y = Math.random() * canvas.height;
      });
    };

    window.addEventListener('resize', handleResize);
    
    init();
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isMobile]);

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        pointerEvents: 'none'
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%'
        }}
      />
    </Box>
  );
};

export default GalaxyBackground;