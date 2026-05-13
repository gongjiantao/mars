import React, { useState, useEffect } from 'react';
import { SvgIcon } from '@mui/material';

const MarsIcon = (props) => {
  const [rotation, setRotation] = useState(0);
  const [expressionIndex, setExpressionIndex] = useState(0);

  // 表情数组
  const expressions = [
    // 开心表情
    {
      mouth: 'M85,115 Q100,130 115,115',
      eyeRy: '10'
    },
    // 惊讶表情
    {
      mouth: 'M95,115 Q100,120 105,115',
      eyeRy: '8'
    },
    // 调皮表情
    {
      mouth: 'M85,115 Q100,120 110,110',
      eyeRy: '9'
    }
  ];

  // 自动旋转效果
  useEffect(() => {
    const rotationInterval = setInterval(() => {
      setRotation(prev => prev + 360);
    }, 5000); // 每5秒旋转一次

    return () => clearInterval(rotationInterval);
  }, []);

  // 自动切换表情
  useEffect(() => {
    const expressionInterval = setInterval(() => {
      setExpressionIndex(prev => (prev + 1) % expressions.length);
    }, 3000); // 每3秒切换一次表情

    return () => clearInterval(expressionInterval);
  }, [expressions.length]);

  const currentExpression = expressions[expressionIndex];

  return (
    <SvgIcon 
      {...props} 
      viewBox="0 0 200 200"
      sx={{
        ...props.sx,
        transform: `rotate(${rotation}deg)`,
        transition: 'transform 2s ease-in-out',
        filter: 'drop-shadow(0 0 10px rgba(255, 90, 0, 0.6))'
      }}
    >
      {/* 火星主体 */}
      <circle cx="100" cy="100" r="85" fill="#c1440e" />
      
      {/* 表面纹理 */}
      <path d="M60,80 Q85,70 100,90 Q115,110 130,100 Q150,120 140,140 Q120,160 90,150 Q70,140 60,120 Z" fill="#9c3c10" opacity="0.7" />
      <path d="M40,110 Q60,100 70,120 Q80,140 60,150 Q40,160 30,140 Q20,120 40,110 Z" fill="#a53f11" opacity="0.7" />
      <path d="M110,60 Q130,50 150,70 Q160,90 140,110 Q120,130 100,120 Q80,110 90,90 Q100,70 110,60 Z" fill="#8c3610" opacity="0.7" />
      
      {/* 极地冰冠 */}
      <path d="M80,30 Q100,20 120,30 Q125,40 120,50 Q100,60 80,50 Q75,40 80,30 Z" fill="#d4f1f9" opacity="0.6" />
      <path d="M70,160 Q100,170 130,160 Q140,155 130,150 Q100,140 70,150 Q60,155 70,160 Z" fill="#d4f1f9" opacity="0.6" />
      
      {/* 陨石坑 */}
      <circle cx="150" cy="130" r="8" fill="#8c3610" opacity="0.8" />
      <circle cx="150" cy="130" r="4" fill="#6a260b" />
      <circle cx="60" cy="70" r="6" fill="#8c3610" opacity="0.8" />
      <circle cx="60" cy="70" r="3" fill="#6a260b" />
      
      {/* 左眼 */}
      <ellipse 
        cx="80" 
        cy="85" 
        rx="8" 
        ry={currentExpression.eyeRy} 
        fill="white"
        style={{
          transition: 'ry 0.3s ease'
        }}
      />
      <circle cx="80" cy="85" r="4" fill="#333" />
      <circle cx="81" cy="83" r="1.5" fill="white" />
      
      {/* 右眼 */}
      <ellipse 
        cx="120" 
        cy="85" 
        rx="8" 
        ry={currentExpression.eyeRy} 
        fill="white"
        style={{
          transition: 'ry 0.3s ease'
        }}
      />
      <circle cx="120" cy="85" r="4" fill="#333" />
      <circle cx="121" cy="83" r="1.5" fill="white" />
      
      {/* 鼻子 */}
      <circle cx="100" cy="100" r="6" fill="#ff704d" />
      
      {/* 嘴巴 */}
      <path 
        d={currentExpression.mouth}
        stroke="#ff4040" 
        strokeWidth="3" 
        fill="none" 
        strokeLinecap="round"
        style={{
          transition: 'd 0.3s ease'
        }}
      />
      
      {/* 腮红 */}
      <circle cx="65" cy="95" r="10" fill="#ff8c66" opacity="0.4" />
      <circle cx="135" cy="95" r="10" fill="#ff8c66" opacity="0.4" />
      
      {/* 光泽效果 */}
      <circle cx="70" cy="80" r="25" fill="white" opacity="0.05" />
    </SvgIcon>
  );
};

export default MarsIcon;