import React, { useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';

export const StarsBackground = ({ 
  starColor = '#FFF',
  factor = 0.05,
  speed = 1,
  className,
  ...props 
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Установка размеров
    const setCanvasSize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      
      const rect = parent.getBoundingClientRect();
      canvas.width = rect.width || window.innerWidth;
      canvas.height = rect.height || window.innerHeight;
    };
    
    setCanvasSize();
    
    let width = canvas.width;
    let height = canvas.height;
    
    let stars = [];
    let animationId = null;
    let mouseX = 0;
    let mouseY = 0;

    // Создание звезд
    const createStars = () => {
      const count = Math.floor((width * height) / 4000) * factor * 20;
      stars = [];
      for (let i = 0; i < Math.max(count, 80); i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.8 + 0.2,
          speed: (Math.random() * 0.5 + 0.1) * speed,
          angle: Math.random() * Math.PI * 2,
          twinkleSpeed: Math.random() * 0.03 + 0.01,
          twinkleOffset: Math.random() * Math.PI * 2,
        });
      }
    };

    // Анимация
    let time = 0;
    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      time += 0.01;
      
      // Эффект параллакса от мыши
      const parallaxX = (mouseX / width - 0.5) * 0.3;
      const parallaxY = (mouseY / height - 0.5) * 0.3;
      
      stars.forEach(star => {
        // ДВИЖЕНИЕ ЗВЕЗД ВВЕРХ
        star.y -= star.speed + parallaxY * 0.1;
        star.x += parallaxX * 0.1;
        
        // Возврат снизу
        if (star.y < -10) {
          star.y = height + 10;
          star.x = Math.random() * width;
        }
        if (star.x < -10) star.x = width + 10;
        if (star.x > width + 10) star.x = -10;
        
        // Мерцание
        const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset) * 0.3 + 0.7;
        const finalOpacity = star.opacity * twinkle;
        
        // Рисуем звезду
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = starColor;
        ctx.globalAlpha = finalOpacity;
        ctx.fill();
        
        // Свечение для больших звезд
        if (star.radius > 1.5) {
          const glow = ctx.createRadialGradient(
            star.x, star.y, 0,
            star.x, star.y, star.radius * 4
          );
          glow.addColorStop(0, starColor + '40');
          glow.addColorStop(1, 'transparent');
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius * 4, 0, Math.PI * 2);
          ctx.fillStyle = glow;
          ctx.globalAlpha = finalOpacity * 0.3;
          ctx.fill();
        }
      });
      
      ctx.globalAlpha = 1;
      animationId = requestAnimationFrame(animate);
    };

    // Обработка движения мыши
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    // Обработка ресайза
    const handleResize = () => {
      setCanvasSize();
      width = canvas.width;
      height = canvas.height;
      createStars();
    };

    window.addEventListener('resize', handleResize);
    canvas.addEventListener('mousemove', handleMouseMove);
    createStars();
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [starColor, factor, speed]);

  return (
    <canvas
      ref={canvasRef}
      className={cn('w-full h-full', className)}
      {...props}
    />
  );
};