"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  life: number;
  maxLife: number;
}

export function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    const particles: Particle[] = [];

    const colors = [
      "rgba(0, 212, 255, ",   // neon blue
      "rgba(139, 92, 246, ",  // neon purple
      "rgba(6, 182, 212, ",   // neon cyan
    ];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Initialize particles
    const PARTICLE_COUNT = Math.min(80, Math.floor(window.innerWidth / 20));
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(createParticle(canvas.width, canvas.height));
    }

    function createParticle(w: number, h: number): Particle {
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3 - 0.1,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: Math.random() * 1000,
        maxLife: 800 + Math.random() * 400,
      };
    }

    const animate = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life++;

        // Fade in/out based on life
        const lifeRatio = p.life / p.maxLife;
        let alpha = p.opacity;
        if (lifeRatio < 0.1) alpha *= lifeRatio / 0.1;
        if (lifeRatio > 0.8) alpha *= (1 - lifeRatio) / 0.2;

        // Wrap around
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;
        if (p.y < -10) p.y = canvas.height + 10;
        if (p.y > canvas.height + 10) p.y = -10;

        // Reset if life expired
        if (p.life >= p.maxLife) {
          Object.assign(p, createParticle(canvas.width, canvas.height));
          p.life = 0;
        }

        // Draw particle with glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${alpha})`;
        ctx.fill();

        // Glow effect
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${alpha * 0.15})`;
        ctx.fill();
      });

      // Draw connections between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 150) {
            const alpha = (1 - dist / 150) * 0.06;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0, 212, 255, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}
