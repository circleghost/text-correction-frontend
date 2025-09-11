import React, { useEffect, useState } from 'react';

interface LensFlarePosition {
  x: number;
  y: number;
}

export const LensFlareTracker: React.FC = () => {
  const [position, setPosition] = useState<LensFlarePosition>({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let animationFrame: number;
    let timeout: NodeJS.Timeout;

    const handleMouseMove = (e: MouseEvent) => {
      // 延遲顯示光暈，避免頻繁閃爍
      if (!isVisible) {
        setIsVisible(true);
      }

      // 清除現有的隱藏定時器
      clearTimeout(timeout);

      // 平滑跟隨滑鼠位置
      animationFrame = requestAnimationFrame(() => {
        setPosition({
          x: e.clientX - 50, // 居中偏移
          y: e.clientY - 50
        });
      });

      // 滑鼠停止移動1秒後隱藏光暈
      timeout = setTimeout(() => {
        setIsVisible(false);
      }, 1000);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    // 監聽滑鼠事件
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrame);
      clearTimeout(timeout);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      className="lens-flare-tracker"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        opacity: isVisible ? 0.6 : 0,
        transition: 'opacity 0.3s ease-out'
      }}
    />
  );
};

export default LensFlareTracker;