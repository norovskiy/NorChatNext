import { useEffect, useRef } from 'react';

const FireworksBackground = ({ className = '', population = 120, color = '#f97316' }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    let particles = [];
    let sparks = [];
    const maxParticles = population || 120;

    // ========== ВСПЫШКИ (САЛЮТЫ) ==========
    const createExplosion = (x, y) => {
      const colors = ['#f97316', '#ea580c', '#fb923c', '#f59e0b', '#fbbf24', '#ffffff', '#ff6b6b', '#ffd93d'];
      const count = 40 + Math.random() * 30;
      
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 6 + 2;
        const size = Math.random() * 3 + 1;
        sparks.push({
          x: x,
          y: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1,
          life: 60 + Math.random() * 40,
          maxLife: 60 + Math.random() * 40,
          radius: size,
          color: colors[Math.floor(Math.random() * colors.length)],
          gravity: 0.06,
          friction: 0.98,
          trail: [],
        });
      }
    };

    // ========== СОЗДАНИЕ ЧАСТИЦ (ФОН) ==========
    const getRandom = (min, max) => Math.random() * (max - min) + min;

    const createParticle = () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = getRandom(1, 4);
      return {
        x: getRandom(0, width),
        y: height + getRandom(0, 30),
        vx: Math.cos(angle) * speed,
        vy: -getRandom(2, 7),
        radius: getRandom(1.5, 3.5),
        life: getRandom(50, 90),
        maxLife: getRandom(50, 90),
        color: color,
        gravity: 0.03,
        trail: [],
        maxTrail: 4,
      };
    };

    for (let i = 0; i < maxParticles; i++) {
      particles.push(createParticle());
    }

    // ========== АНИМАЦИЯ ==========
    let animationId;
    let frameCount = 0;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // ===== ВСПЫШКИ (каждые 60 кадров) =====
      frameCount++;
      if (frameCount % 60 === 0) {
        const x = getRandom(100, width - 100);
        const y = getRandom(50, height * 0.6);
        createExplosion(x, y);
      }
      if (frameCount % 90 === 0) {
        const x = getRandom(100, width - 100);
        const y = getRandom(50, height * 0.6);
        createExplosion(x, y);
      }

      // ===== ОТРИСОВКА ЧАСТИЦ (ФОН) =====
      particles.forEach((p) => {
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > p.maxTrail) p.trail.shift();

        p.trail.forEach((pos, index) => {
          const alpha = (index / p.trail.length) * 0.4;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, p.radius * (index / p.trail.length), 0, Math.PI * 2);
          ctx.fillStyle = p.color + Math.floor(alpha * 40).toString(16).padStart(2, '0');
          ctx.fill();
        });

        ctx.shadowBlur = 15;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;

        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.life--;

        if (p.life <= 0 || p.y > height + 50) {
          Object.assign(p, createParticle());
          p.x = getRandom(0, width);
          p.y = height + getRandom(0, 20);
          p.life = getRandom(50, 90);
          p.maxLife = p.life;
        }
      });

      // ===== ОТРИСОВКА ИСКР (САЛЮТЫ) =====
      sparks.forEach((s, index) => {
        s.trail.push({ x: s.x, y: s.y });
        if (s.trail.length > 8) s.trail.shift();

        s.trail.forEach((pos, i) => {
          const alpha = (i / s.trail.length) * 0.6;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, s.radius * (i / s.trail.length), 0, Math.PI * 2);
          ctx.fillStyle = s.color + Math.floor(alpha * 60).toString(16).padStart(2, '0');
          ctx.fill();
        });

        ctx.shadowBlur = 25;
        ctx.shadowColor = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.fill();
        ctx.shadowBlur = 0;

        s.vx *= s.friction;
        s.vy *= s.friction;
        s.vy += s.gravity;
        s.x += s.vx;
        s.y += s.vy;
        s.life--;

        if (s.life <= 0 || s.y > height) {
          sparks.splice(index, 1);
        }
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    // ========== РЕСАЙЗ ==========
    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [population, color]);

  return <canvas ref={canvasRef} className={className} />;
};

export default FireworksBackground;