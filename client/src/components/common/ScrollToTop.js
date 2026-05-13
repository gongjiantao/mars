import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // 延迟滚动到顶部，确保页面内容已经渲染
    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    };

    // 使用 setTimeout 确保在页面内容渲染完成后再滚动
    setTimeout(scrollToTop, 100);
    
    // 对于移动端，可能需要更长的延迟
    if (window.innerWidth <= 768) {
      setTimeout(scrollToTop, 200);
    }
  }, [pathname]);

  return null;
};

export default ScrollToTop;