import React, { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface Particle {
  id: number;
  x: number;
  y: number;
  delay: number;
  duration: number;
}

export const FloatingParticles: React.FC = () => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const { theme } = useTheme();

  useEffect(() => {
    const generateParticles = () => {
      const particleArray: Particle[] = [];
      const particleCount = 15;

      for (let i = 0; i < particleCount; i++) {
        particleArray.push({
          id: i,
          x: Math.random() * 100, // 百分比位置
          y: 100, // 從底部開始
          delay: Math.random() * 10, // 隨機延遲
          duration: 10 + Math.random() * 10 // 10-20秒動畫
        });
      }

      setParticles(particleArray);
    };

    generateParticles();
  }, []);

  if (theme === 'light') return null;

  return (
    <div className="floating-particles">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="particle"
          style={{
            left: `${particle.x}%`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
          }}
        />
      ))}
    </div>
  );
};

export default FloatingParticles;
