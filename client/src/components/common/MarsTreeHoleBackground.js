import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';

const MarsTreeHoleBackground = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  
  // 火星树洞特效配置 - 性能优化版本
  const starCount = 80;
  const marsParticleCount = 15;
  const treeHoleCount = 2;
  const energyWaveCount = 3;
  const cosmicDustCount = 20;
  const portalEffectCount = 1;
  
  // 性能控制
  const targetFPS = 30;
  const frameInterval = 1000 / targetFPS;
  let lastFrameTime = 0;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let stars = [];
    let marsParticles = [];
    let treeHoles = [];
    let energyWaves = [];
    let cosmicDust = [];
    let portalEffects = [];

    // 设置画布尺寸
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initializeElements();
    };

    // 初始化所有元素
    const initializeElements = () => {
      // 创建星星
      stars = [];
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.8 + 0.2,
          twinkleSpeed: Math.random() * 0.02 + 0.01,
          twinkle: Math.random() * Math.PI * 2,
          color: `hsl(${Math.random() * 60 + 200}, 70%, 80%)`
        });
      }

      // 创建火星粒子
      marsParticles = [];
      for (let i = 0; i < marsParticleCount; i++) {
        marsParticles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 4 + 2,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5,
          opacity: Math.random() * 0.6 + 0.4,
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: Math.random() * 0.03 + 0.01,
          color: `hsl(${Math.random() * 30 + 10}, 80%, 60%)`,
          trail: []
        });
      }

      // 创建树洞传送门效果
      treeHoles = [];
      for (let i = 0; i < treeHoleCount; i++) {
        treeHoles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 80 + 60,
          rotation: 0,
          rotationSpeed: (Math.random() - 0.5) * 0.02,
          opacity: Math.random() * 0.3 + 0.1,
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: Math.random() * 0.01 + 0.005,
          color: `hsl(${Math.random() * 40 + 280}, 70%, 50%)`,
          rings: Math.floor(Math.random() * 3) + 3
        });
      }

      // 创建能量波
      energyWaves = [];
      for (let i = 0; i < energyWaveCount; i++) {
        energyWaves.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: 0,
          maxRadius: Math.random() * 200 + 100,
          speed: Math.random() * 2 + 1,
          opacity: Math.random() * 0.4 + 0.2,
          color: `hsl(${Math.random() * 60 + 300}, 80%, 60%)`,
          life: 0,
          maxLife: Math.random() * 300 + 200
        });
      }

      // 创建宇宙尘埃
      cosmicDust = [];
      for (let i = 0; i < cosmicDustCount; i++) {
        cosmicDust.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 1.5 + 0.5,
          speedX: (Math.random() - 0.5) * 0.3,
          speedY: (Math.random() - 0.5) * 0.3,
          opacity: Math.random() * 0.5 + 0.2,
          color: `hsl(${Math.random() * 40 + 30}, 60%, 70%)`,
          drift: Math.random() * Math.PI * 2,
          driftSpeed: Math.random() * 0.02 + 0.01
        });
      }

      // 创建传送门特效
      portalEffects = [];
      for (let i = 0; i < portalEffectCount; i++) {
        portalEffects.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          innerRadius: Math.random() * 30 + 20,
          outerRadius: Math.random() * 80 + 60,
          rotation: 0,
          rotationSpeed: Math.random() * 0.03 + 0.01,
          opacity: Math.random() * 0.4 + 0.3,
          spiralCount: Math.floor(Math.random() * 3) + 4,
          color1: `hsl(${Math.random() * 60 + 280}, 80%, 60%)`,
          color2: `hsl(${Math.random() * 40 + 10}, 80%, 50%)`,
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: Math.random() * 0.02 + 0.01
        });
      }
    };

    // 动画循环 - 性能优化版本
    const animate = (currentTime) => {
      // 帧率控制
      if (currentTime - lastFrameTime < frameInterval) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      lastFrameTime = currentTime;
      
      // 清除画布（更高效的方式）
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // 创建深空背景渐变（缓存优化）
      if (!animate.bgGradient || animate.lastCanvasSize !== `${canvas.width}x${canvas.height}`) {
        animate.bgGradient = ctx.createRadialGradient(
          canvas.width / 2, canvas.height / 2, 0,
          canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height)
        );
        animate.bgGradient.addColorStop(0, 'rgba(10, 5, 25, 1)');
        animate.bgGradient.addColorStop(0.5, 'rgba(20, 10, 40, 1)');
        animate.bgGradient.addColorStop(1, 'rgba(5, 5, 15, 1)');
        animate.lastCanvasSize = `${canvas.width}x${canvas.height}`;
      }
      
      ctx.fillStyle = animate.bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 绘制和更新星星（优化版本）
      ctx.save();
      stars.forEach(star => {
        star.twinkle += star.twinkleSpeed;
        const twinkleFactor = Math.sin(star.twinkle) * 0.3 + 0.7;
        
        ctx.globalAlpha = star.opacity * twinkleFactor;
        ctx.fillStyle = star.color;
        
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size * twinkleFactor, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      // 绘制和更新宇宙尘埃（优化版本）
      ctx.save();
      cosmicDust.forEach(dust => {
        dust.drift += dust.driftSpeed;
        dust.x += dust.speedX + Math.sin(dust.drift) * 0.1;
        dust.y += dust.speedY + Math.cos(dust.drift) * 0.1;
        
        // 边界检查
        if (dust.x < 0) dust.x = canvas.width;
        if (dust.x > canvas.width) dust.x = 0;
        if (dust.y < 0) dust.y = canvas.height;
        if (dust.y > canvas.height) dust.y = 0;
        
        ctx.globalAlpha = dust.opacity;
        ctx.fillStyle = dust.color;
        
        ctx.beginPath();
        ctx.arc(dust.x, dust.y, dust.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      // 绘制和更新树洞传送门
      treeHoles.forEach(hole => {
        hole.rotation += hole.rotationSpeed;
        hole.pulse += hole.pulseSpeed;
        const pulseFactor = Math.sin(hole.pulse) * 0.3 + 0.7;
        
        ctx.save();
        ctx.translate(hole.x, hole.y);
        ctx.rotate(hole.rotation);
        
        // 绘制多层同心圆环（优化版本）
        for (let i = 0; i < hole.rings; i++) {
          const ringRadius = (hole.radius / hole.rings) * (i + 1) * pulseFactor;
          const ringOpacity = hole.opacity * (1 - i / hole.rings) * 0.6;
          
          ctx.globalAlpha = ringOpacity;
          ctx.strokeStyle = hole.color;
          ctx.lineWidth = 1.5;
          
          ctx.beginPath();
          ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
          ctx.stroke();
        }
        
        ctx.restore();
      });

      // 绘制和更新传送门特效
      portalEffects.forEach(portal => {
        portal.rotation += portal.rotationSpeed;
        portal.pulse += portal.pulseSpeed;
        const pulseFactor = Math.sin(portal.pulse) * 0.2 + 0.8;
        
        ctx.save();
        ctx.translate(portal.x, portal.y);
        
        // 绘制螺旋传送门
        for (let i = 0; i < portal.spiralCount; i++) {
          const angle = (Math.PI * 2 / portal.spiralCount) * i + portal.rotation;
          const spiralRadius = portal.innerRadius + (portal.outerRadius - portal.innerRadius) * (i / portal.spiralCount);
          
          ctx.save();
          ctx.rotate(angle);
          
          const gradient = ctx.createLinearGradient(-spiralRadius, 0, spiralRadius, 0);
          gradient.addColorStop(0, 'transparent');
          gradient.addColorStop(0.5, i % 2 === 0 ? portal.color1 : portal.color2);
          gradient.addColorStop(1, 'transparent');
          
          ctx.globalAlpha = portal.opacity * pulseFactor;
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 2;
          
          ctx.beginPath();
          ctx.arc(0, 0, spiralRadius, 0, Math.PI);
          ctx.stroke();
          
          ctx.restore();
        }
        
        ctx.restore();
      });

      // 绘制和更新火星粒子
      marsParticles.forEach(particle => {
        particle.pulse += particle.pulseSpeed;
        const pulseFactor = Math.sin(particle.pulse) * 0.4 + 0.8;
        
        // 更新轨迹（优化版本）
        particle.trail.push({ x: particle.x, y: particle.y });
        if (particle.trail.length > 5) {
          particle.trail.shift();
        }
        
        // 绘制轨迹（简化版本）
        if (particle.trail.length > 1) {
          ctx.save();
          ctx.globalAlpha = particle.opacity * 0.3;
          ctx.strokeStyle = particle.color;
          ctx.lineWidth = particle.size * 0.5;
          ctx.beginPath();
          ctx.moveTo(particle.trail[0].x, particle.trail[0].y);
          for (let i = 1; i < particle.trail.length; i++) {
            ctx.lineTo(particle.trail[i].x, particle.trail[i].y);
          }
          ctx.stroke();
          ctx.restore();
        }
        
        // 绘制主粒子（优化版本）
        ctx.save();
        ctx.globalAlpha = particle.opacity * pulseFactor;
        ctx.fillStyle = particle.color;
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * pulseFactor, 0, Math.PI * 2);
        ctx.fill();
        
        // 添加内部高光（简化版本）
        ctx.globalAlpha = particle.opacity * pulseFactor * 0.4;
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(particle.x - particle.size * 0.2, particle.y - particle.size * 0.2, particle.size * 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        
        // 移动粒子
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // 边界检查
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
      });

      // 绘制和更新能量波
      energyWaves.forEach((wave, index) => {
        wave.life += 1;
        wave.radius += wave.speed;
        
        if (wave.radius > wave.maxRadius || wave.life > wave.maxLife) {
          // 重置能量波
          wave.x = Math.random() * canvas.width;
          wave.y = Math.random() * canvas.height;
          wave.radius = 0;
          wave.life = 0;
        }
        
        const lifeFactor = 1 - (wave.life / wave.maxLife);
        const radiusFactor = 1 - (wave.radius / wave.maxRadius);
        
        ctx.save();
        ctx.globalAlpha = wave.opacity * lifeFactor * radiusFactor;
        ctx.strokeStyle = wave.color;
        ctx.lineWidth = 1.5;
        
        ctx.beginPath();
        ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };

    // 初始化
    resizeCanvas();
    animate();

    // 监听窗口大小变化
    window.addEventListener('resize', resizeCanvas);

    // 清理函数
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

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

export default MarsTreeHoleBackground;