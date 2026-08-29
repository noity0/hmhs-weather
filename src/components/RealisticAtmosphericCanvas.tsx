import React, { useEffect, useRef } from 'react';
import { weatherAudio } from '../lib/audioSynthesizer';

interface RealisticAtmosphericCanvasProps {
  effect: 'clear-day' | 'clear-night' | 'cloudy' | 'rain' | 'snow' | 'thunder' | 'fog';
  windSpeed?: number;
  windDirection?: number;
  isDay?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  maxAlpha: number;
  length?: number;
  spin?: number;
  spinSpeed?: number;
  z?: number;
  twinkleSpeed?: number;
  color?: string;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
}

interface LightningBolt {
  segments: { x: number; y: number }[];
  alpha: number;
  width: number;
}

export function RealisticAtmosphericCanvas({
  effect,
  windSpeed = 15,
  windDirection = 180,
  isDay = 1,
}: RealisticAtmosphericCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const isVisibleRef = useRef<boolean>(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 400);

    // Particle pool
    const particles: Particle[] = [];
    const ripples: Ripple[] = [];
    let lightning: LightningBolt | null = null;
    let lightningFlash = 0;
    let nextLightningTime = Date.now() + Math.random() * 5000 + 4000;
    let nextMeteorTime = Date.now() + Math.random() * 6000 + 3000;
    let meteor: { x: number; y: number; vx: number; vy: number; length: number; alpha: number } | null = null;

    // Wind drift vector
    const windRad = ((windDirection - 180) * Math.PI) / 180;
    const windForceX = Math.sin(windRad) * Math.min(8, windSpeed / 6);

    // Max particles allocation
    const particleCount = effect === 'rain' || effect === 'thunder'
      ? 120
      : effect === 'snow'
      ? 80
      : effect === 'clear-night'
      ? 100
      : effect === 'clear-day'
      ? 45
      : 30; // Fog / cloudy

    // Pre-populate particles (Zero GC allocation in loop)
    for (let i = 0; i < particleCount; i++) {
      if (effect === 'rain' || effect === 'thunder') {
        particles.push({
          x: Math.random() * (width + 200) - 100,
          y: Math.random() * height,
          vx: windForceX + (Math.random() * 1 - 0.5),
          vy: Math.random() * 12 + 18,
          size: Math.random() * 1.5 + 1,
          length: Math.random() * 18 + 12,
          alpha: Math.random() * 0.4 + 0.3,
          maxAlpha: 0.7,
        });
      } else if (effect === 'snow') {
        const z = Math.random() * 2 + 0.5;
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: windForceX * 0.3 + (Math.random() * 1 - 0.5),
          vy: (Math.random() * 1.8 + 0.8) * z,
          size: (Math.random() * 2.5 + 1.5) * z,
          spin: Math.random() * Math.PI * 2,
          spinSpeed: (Math.random() - 0.5) * 0.03,
          alpha: Math.random() * 0.5 + 0.4,
          maxAlpha: 0.9,
          z,
        });
      } else if (effect === 'clear-night') {
        const isBright = Math.random() > 0.85;
        particles.push({
          x: Math.random() * width,
          y: Math.random() * (height * 0.85),
          vx: (Math.random() - 0.5) * 0.05,
          vy: (Math.random() - 0.5) * 0.05,
          size: isBright ? Math.random() * 2 + 1.2 : Math.random() * 1.2 + 0.6,
          alpha: Math.random() * 0.8 + 0.2,
          maxAlpha: isBright ? 1.0 : 0.6,
          twinkleSpeed: Math.random() * 0.04 + 0.015,
          color: Math.random() > 0.7 ? '#bae6fd' : Math.random() > 0.4 ? '#fef08a' : '#ffffff',
        });
      } else if (effect === 'clear-day') {
        // Floating solar dust motes / pollen glowing in sunrays
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: -Math.random() * 0.5 - 0.1,
          size: Math.random() * 3 + 1,
          alpha: Math.random() * 0.3 + 0.1,
          maxAlpha: 0.45,
          twinkleSpeed: Math.random() * 0.02 + 0.01,
        });
      } else {
        // Fog & Mist volumetric puffs
        particles.push({
          x: Math.random() * (width + 200) - 100,
          y: height - Math.random() * (height * 0.6),
          vx: windForceX * 0.2 + (Math.random() * 0.4 + 0.2),
          vy: (Math.random() - 0.5) * 0.1,
          size: Math.random() * 100 + 80,
          alpha: Math.random() * 0.12 + 0.04,
          maxAlpha: 0.18,
        });
      }
    }

    // Generate procedural branched lightning
    const createLightningBolt = () => {
      const startX = Math.random() * (width * 0.7) + width * 0.15;
      const segments: { x: number; y: number }[] = [{ x: startX, y: 0 }];
      let curX = startX;
      let curY = 0;
      while (curY < height * 0.8) {
        curX += (Math.random() - 0.5) * 45;
        curY += Math.random() * 35 + 15;
        segments.push({ x: curX, y: curY });
      }
      lightning = {
        segments,
        alpha: 1.0,
        width: Math.random() * 2.5 + 2,
      };
      lightningFlash = 0.85;

      // Trigger audio rumble if enabled
      weatherAudio.triggerThunder();
    };

    let lastTime = performance.now();

    // Render loop
    const render = (time: number) => {
      if (!isVisibleRef.current) {
        animFrameIdRef.current = requestAnimationFrame(render);
        return;
      }

      const dt = Math.min(40, time - lastTime) / 16.66;
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      // 1. SUNNY / CLEAR DAY GOD-RAYS & SOLAR FLARES
      if (effect === 'clear-day') {
        const sunX = width * 0.82;
        const sunY = height * 0.22;

        // Radial Sun Corona Glow
        const sunGlow = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 280);
        sunGlow.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
        sunGlow.addColorStop(0.3, 'rgba(251, 146, 60, 0.2)');
        sunGlow.addColorStop(1, 'rgba(251, 146, 60, 0)');
        ctx.fillStyle = sunGlow;
        ctx.fillRect(0, 0, width, height);

        // Dynamic Shimmering God-Rays
        const rayCount = 5;
        for (let r = 0; r < rayCount; r++) {
          const angle = (Math.PI / 4) * (r / rayCount) + Math.sin(time * 0.0008 + r) * 0.08 + Math.PI * 0.65;
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(sunX, sunY);
          ctx.lineTo(sunX + Math.cos(angle - 0.12) * width, sunY + Math.sin(angle - 0.12) * height);
          ctx.lineTo(sunX + Math.cos(angle + 0.12) * width, sunY + Math.sin(angle + 0.12) * height);
          ctx.closePath();
          ctx.fillStyle = `rgba(255, 255, 255, ${0.04 + Math.sin(time * 0.001 + r * 1.5) * 0.02})`;
          ctx.fill();
          ctx.restore();
        }
      }

      // 2. THUNDERSTORM AMBIENT FLASHES
      if (effect === 'thunder') {
        if (Date.now() > nextLightningTime) {
          createLightningBolt();
          nextLightningTime = Date.now() + Math.random() * 8000 + 4000;
        }

        if (lightningFlash > 0.01) {
          ctx.fillStyle = `rgba(224, 231, 255, ${lightningFlash * 0.4})`;
          ctx.fillRect(0, 0, width, height);
          lightningFlash *= 0.88;
        }

        if (lightning) {
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(lightning.segments[0].x, lightning.segments[0].y);
          for (let s = 1; s < lightning.segments.length; s++) {
            ctx.lineTo(lightning.segments[s].x, lightning.segments[s].y);
          }
          ctx.strokeStyle = `rgba(255, 255, 255, ${lightning.alpha})`;
          ctx.lineWidth = lightning.width;
          ctx.shadowColor = '#818cf8';
          ctx.shadowBlur = 18;
          ctx.stroke();
          ctx.restore();

          lightning.alpha *= 0.82;
          if (lightning.alpha < 0.05) lightning = null;
        }
      }

      // 3. SHOOTING STARS / METEORS (Clear Night)
      if (effect === 'clear-night') {
        if (!meteor && Date.now() > nextMeteorTime) {
          meteor = {
            x: Math.random() * (width * 0.6) + width * 0.2,
            y: Math.random() * (height * 0.3),
            vx: Math.random() * 12 + 10,
            vy: Math.random() * 8 + 6,
            length: Math.random() * 70 + 40,
            alpha: 1.0,
          };
          nextMeteorTime = Date.now() + Math.random() * 10000 + 6000;
        }

        if (meteor) {
          ctx.save();
          const mGrad = ctx.createLinearGradient(meteor.x, meteor.y, meteor.x - meteor.vx * 3, meteor.y - meteor.vy * 3);
          mGrad.addColorStop(0, `rgba(255, 255, 255, ${meteor.alpha})`);
          mGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
          ctx.strokeStyle = mGrad;
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(meteor.x, meteor.y);
          ctx.lineTo(meteor.x - (meteor.vx / 15) * meteor.length, meteor.y - (meteor.vy / 15) * meteor.length);
          ctx.stroke();
          ctx.restore();

          meteor.x += meteor.vx * dt;
          meteor.y += meteor.vy * dt;
          meteor.alpha -= 0.03 * dt;
          if (meteor.alpha <= 0 || meteor.x > width || meteor.y > height) {
            meteor = null;
          }
        }
      }

      // 4. RENDER AND UPDATE PARTICLES
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (effect === 'rain' || effect === 'thunder') {
          // Rain Streak Drawing
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.vx * 0.9, p.y + (p.length || 15));
          ctx.strokeStyle = `rgba(186, 230, 253, ${p.alpha})`;
          ctx.lineWidth = p.size;
          ctx.lineCap = 'round';
          ctx.stroke();

          p.x += p.vx * dt;
          p.y += p.vy * dt;

          // Hit ground -> Create ripple
          if (p.y > height - 10) {
            if (ripples.length < 25 && Math.random() > 0.7) {
              ripples.push({
                x: p.x,
                y: height - Math.random() * 15,
                radius: 1,
                maxRadius: Math.random() * 9 + 4,
                alpha: 0.5,
              });
            }
            p.y = -20;
            p.x = Math.random() * (width + 200) - 100;
          }
        } else if (effect === 'snow') {
          // 3D Snowflake Rendering with gentle wobble
          p.x += (p.vx + Math.sin(time * 0.002 + i) * 0.6) * dt;
          p.y += p.vy * dt;
          if (p.spin !== undefined && p.spinSpeed !== undefined) {
            p.spin += p.spinSpeed * dt;
          }

          ctx.save();
          ctx.translate(p.x, p.y);
          if (p.spin) ctx.rotate(p.spin);

          ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
          ctx.shadowColor = 'rgba(255, 255, 255, 0.6)';
          ctx.shadowBlur = p.z ? p.z * 3 : 2;

          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          if (p.y > height + 10) {
            p.y = -10;
            p.x = Math.random() * width;
          }
        } else if (effect === 'clear-night') {
          // Twinkling Constellation Stars
          if (p.twinkleSpeed) {
            p.alpha += Math.sin(time * p.twinkleSpeed + i) * 0.015;
            p.alpha = Math.max(0.1, Math.min(p.maxAlpha, p.alpha));
          }

          ctx.fillStyle = p.color ? p.color : `rgba(255, 255, 255, ${p.alpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();

          // Star cross flare for brighter stars
          if (p.size > 2.0 && p.alpha > 0.7) {
            ctx.strokeStyle = `rgba(255, 255, 255, ${p.alpha * 0.4})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(p.x - p.size * 2.5, p.y);
            ctx.lineTo(p.x + p.size * 2.5, p.y);
            ctx.moveTo(p.x, p.y - p.size * 2.5);
            ctx.lineTo(p.x, p.y + p.size * 2.5);
            ctx.stroke();
          }
        } else if (effect === 'clear-day') {
          // Floating solar pollen & light motes
          p.x += (p.vx + Math.sin(time * 0.001 + i) * 0.3) * dt;
          p.y += p.vy * dt;

          const currentAlpha = p.alpha + Math.sin(time * 0.002 + i) * 0.1;
          ctx.fillStyle = `rgba(254, 240, 138, ${Math.max(0.05, currentAlpha)})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();

          if (p.y < -10) {
            p.y = height + 10;
            p.x = Math.random() * width;
          }
        } else {
          // Fog puffs
          p.x += p.vx * dt;
          p.y += p.vy * dt;

          const fogGrad = ctx.createRadialGradient(p.x, p.y, p.size * 0.1, p.x, p.y, p.size);
          fogGrad.addColorStop(0, `rgba(203, 213, 225, ${p.alpha})`);
          fogGrad.addColorStop(1, 'rgba(203, 213, 225, 0)');

          ctx.fillStyle = fogGrad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();

          if (p.x > width + p.size) {
            p.x = -p.size;
            p.y = height - Math.random() * (height * 0.6);
          }
        }
      }

      // 5. RENDER SPLASH RIPPLES
      for (let r = ripples.length - 1; r >= 0; r--) {
        const rip = ripples[r];
        ctx.beginPath();
        ctx.ellipse(rip.x, rip.y, rip.radius * 1.6, rip.radius * 0.6, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(186, 230, 253, ${rip.alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        rip.radius += 0.4 * dt;
        rip.alpha -= 0.03 * dt;

        if (rip.alpha <= 0 || rip.radius >= rip.maxRadius) {
          ripples.splice(r, 1);
        }
      }

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    // Responsive Resize Observer
    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    const resizeObserver = new ResizeObserver(handleResize);
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    // Visibility change handler (saves 100% CPU when tab is hidden)
    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      resizeObserver.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [effect, windSpeed, windDirection, isDay]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      style={{ willChange: 'transform' }}
    />
  );
}
