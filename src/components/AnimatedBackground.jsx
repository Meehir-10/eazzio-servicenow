import React, { useEffect, useRef } from 'react';

export default function AnimatedBackground({ theme = 'night' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    // Check user preference for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width, height;

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const isDay = theme === 'day';
    const PARTICLE_COUNT = Math.min(Math.floor(window.innerWidth / 20), 65);
    const MAX_DISTANCE = 130;

    const colors = isDay
      ? ['#4f46e5', '#d97706', '#0284c7', '#059669']
      : ['#60a5fa', '#818cf8', '#38bdf8', '#c084fc'];

    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: Math.random() * 2 + 1,
      baseAlpha: isDay ? Math.random() * 0.2 + 0.1 : Math.random() * 0.35 + 0.2,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Constellation link lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < MAX_DISTANCE) {
            const alpha = (1 - dist / MAX_DISTANCE) * (isDay ? 0.08 : 0.18);
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = isDay ? '#6366f1' : '#60a5fa';
            ctx.globalAlpha = alpha;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        else if (p.x > width) p.x = 0;

        if (p.y < 0) p.y = height;
        else if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.baseAlpha;
        ctx.fill();
      }

      ctx.globalAlpha = 1.0;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  const isDay = theme === 'day';

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 0,
          pointerEvents: 'none',
          opacity: 0.9,
        }}
      />
      {/* Ambient background glows with zero pointer events */}
      <div
        style={{
          position: 'fixed',
          top: '-15%',
          left: '-10%',
          width: '550px',
          height: '550px',
          background: isDay
            ? 'radial-gradient(circle, rgba(245, 158, 11, 0.12) 0%, rgba(248, 250, 252, 0) 70%)'
            : 'radial-gradient(circle, rgba(79, 70, 229, 0.22) 0%, rgba(9, 13, 22, 0) 70%)',
          borderRadius: '50%',
          zIndex: 0,
          pointerEvents: 'none',
          transition: 'background 0.5s ease',
        }}
      />
      <div
        style={{
          position: 'fixed',
          bottom: '-15%',
          right: '-10%',
          width: '600px',
          height: '600px',
          background: isDay
            ? 'radial-gradient(circle, rgba(79, 70, 229, 0.1) 0%, rgba(248, 250, 252, 0) 70%)'
            : 'radial-gradient(circle, rgba(147, 51, 234, 0.18) 0%, rgba(9, 13, 22, 0) 70%)',
          borderRadius: '50%',
          zIndex: 0,
          pointerEvents: 'none',
          transition: 'background 0.5s ease',
        }}
      />
    </>
  );
}
