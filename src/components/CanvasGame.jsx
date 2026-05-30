// Zen Tap 60 FPS HTML5 Canvas Interactive Game Engine
// Programmatically renders gorgeous floating physics, sways, pings, and ripples.
// Ensures zero react rendering overhead during interactions.

import React, { useRef, useEffect, useState } from 'react';
import { audio } from '../audio';
import { hapticImpact } from '../telegram';

export const CanvasGame = ({ mode, isPaused, onPointScored }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;

    // Resize Handler
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    // Game Entities state arrays
    let bubbles = [];
    let leaves = [];
    let fireflies = [];
    let ripples = [];
    let particles = [];

    // Helper functions
    const randomRange = (min, max) => Math.random() * (max - min) + min;

    // --- Entity Constructors ---
    
    // 1. Bubble Class
    class Bubble {
      constructor() {
        this.reset();
        this.y = randomRange(height + 20, height + 100);
      }

      reset() {
        this.baseRadius = randomRange(24, 48);
        this.x = randomRange(this.baseRadius, width - this.baseRadius);
        this.y = height + this.baseRadius + randomRange(10, 80);
        this.vx = randomRange(-0.4, 0.4);
        this.vy = randomRange(-0.8, -1.8);
        this.color = `hsla(${randomRange(180, 220)}, 70%, 75%, 0.25)`;
        this.shineColor = `rgba(255, 255, 255, 0.5)`;
        this.isPopping = false;
        this.popProgress = 0;
        this.wobbleTime = randomRange(0, Math.PI * 2);
        this.wobbleSpeed = randomRange(0.02, 0.05);
      }

      update() {
        if (isPaused) return;

        if (this.isPopping) {
          this.popProgress += 0.1;
          if (this.popProgress >= 1) this.reset();
          return;
        }

        this.x += this.vx;
        this.y += this.vy;
        this.wobbleTime += this.wobbleSpeed;

        if (this.x - this.baseRadius < 0 || this.x + this.baseRadius > width) {
          this.vx *= -1;
        }
        if (this.y + this.baseRadius < -20) {
          this.reset();
        }
      }

      draw() {
        ctx.save();
        if (this.isPopping) {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.baseRadius * (1 + this.popProgress * 0.8), 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.4 * (1 - this.popProgress)})`;
          ctx.lineWidth = 2.5;
          ctx.stroke();

          for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const dist = this.baseRadius * (1 + this.popProgress * 1.2);
            const px = this.x + Math.cos(angle) * dist;
            const py = this.y + Math.sin(angle) * dist;
            ctx.beginPath();
            ctx.arc(px, py, 2.5 * (1 - this.popProgress), 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${0.8 * (1 - this.popProgress)})`;
            ctx.fill();
          }
        } else {
          const rX = this.baseRadius + Math.sin(this.wobbleTime) * 3;
          const rY = this.baseRadius + Math.cos(this.wobbleTime) * 3;

          const grad = ctx.createRadialGradient(
            this.x - rX * 0.3, this.y - rY * 0.3, rX * 0.1,
            this.x, this.y, Math.max(rX, rY)
          );
          grad.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
          grad.addColorStop(0.3, this.color);
          grad.addColorStop(1, 'rgba(255, 255, 255, 0.02)');

          ctx.beginPath();
          ctx.ellipse(this.x, this.y, rX, rY, 0, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();

          ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.beginPath();
          ctx.ellipse(
            this.x - rX * 0.35, this.y - rY * 0.35,
            rX * 0.2, rY * 0.1,
            -Math.PI / 4, 0, Math.PI * 2
          );
          ctx.fillStyle = this.shineColor;
          ctx.fill();
        }
        ctx.restore();
      }

      tap(tx, ty) {
        if (this.isPopping) return false;
        const dx = this.x - tx;
        const dy = this.y - ty;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= this.baseRadius + 15) {
          this.isPopping = true;
          this.popProgress = 0;
          return true;
        }
        return false;
      }
    }

    // 2. Leaf Class (Nature Drift Mode)
    class Leaf {
      constructor() {
        this.reset();
        this.y = randomRange(-100, -20);
      }

      reset() {
        this.x = randomRange(20, width - 20);
        this.y = randomRange(-80, -20);
        this.size = randomRange(25, 40);
        this.vy = randomRange(0.6, 1.2);
        this.swaySpeed = randomRange(0.01, 0.03);
        this.swayRange = randomRange(15, 35);
        this.swayTime = randomRange(0, 100);
        this.rotation = randomRange(0, Math.PI * 2);
        this.rotSpeed = randomRange(-0.02, 0.02);
        this.color = `hsla(${randomRange(90, 120)}, 65%, 55%, 0.6)`;
        this.fading = false;
        this.fadeVal = 1;
      }

      update() {
        if (isPaused) return;

        if (this.fading) {
          this.fadeVal -= 0.08;
          if (this.fadeVal <= 0) this.reset();
          return;
        }

        this.y += this.vy;
        this.swayTime += this.swaySpeed;
        this.rotation += this.rotSpeed;
        
        this.xOffset = Math.sin(this.swayTime) * this.swayRange;

        if (this.y - this.size > height + 20) {
          this.reset();
        }
      }

      draw() {
        ctx.save();
        const renderX = this.x + (this.xOffset || 0);
        
        ctx.translate(renderX, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = this.fadeVal;

        // Draw realistic leaf shape
        ctx.beginPath();
        ctx.moveTo(0, -this.size);
        ctx.bezierCurveTo(this.size * 0.7, -this.size * 0.3, this.size * 0.3, this.size, 0, this.size);
        ctx.bezierCurveTo(-this.size * 0.3, this.size, -this.size * 0.7, -this.size * 0.3, 0, -this.size);
        ctx.fillStyle = this.color;
        ctx.fill();

        // Main vein
        ctx.beginPath();
        ctx.moveTo(0, -this.size * 0.9);
        ctx.lineTo(0, this.size * 0.9);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.restore();
      }

      tap(tx, ty) {
        if (this.fading) return false;
        const renderX = this.x + (this.xOffset || 0);
        const dx = renderX - tx;
        const dy = this.y - ty;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= this.size + 15) {
          this.fading = true;
          return true;
        }
        return false;
      }
    }

    // 3. Firefly Class (Night Glow Mode)
    class Firefly {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = randomRange(30, width - 30);
        this.y = randomRange(30, height - 30);
        this.vx = randomRange(-0.8, 0.8);
        this.vy = randomRange(-0.8, 0.8);
        this.radius = randomRange(3, 6);
        this.color = `hsla(${randomRange(45, 65)}, 95%, 65%, 0.8)`;
        this.glowRadius = this.radius * randomRange(5, 8);
        this.pulseSpeed = randomRange(0.02, 0.05);
        this.pulseTime = randomRange(0, 10);
        this.absorbing = false;
        this.absorbProgress = 0;
        this.trail = [];
      }

      update() {
        if (isPaused) return;

        if (this.absorbing) {
          this.absorbProgress += 0.08;
          if (this.absorbProgress >= 1) this.reset();
          return;
        }

        this.vx += randomRange(-0.06, 0.06);
        this.vy += randomRange(-0.06, 0.06);

        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > 1.5) {
          this.vx = (this.vx / speed) * 1.5;
          this.vy = (this.vy / speed) * 1.5;
        }

        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 10) { this.x = 10; this.vx *= -1; }
        if (this.x > width - 10) { this.x = width - 10; this.vx *= -1; }
        if (this.y < 10) { this.y = 10; this.vy *= -1; }
        if (this.y > height - 10) { this.y = height - 10; this.vy *= -1; }

        this.pulseTime += this.pulseSpeed;

        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 8) this.trail.shift();
      }

      draw() {
        ctx.save();
        
        if (this.absorbing) {
          const size = this.radius * (1 - this.absorbProgress);
          const opacity = 1 - this.absorbProgress;

          ctx.beginPath();
          ctx.arc(this.x, this.y, size * 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 230, 120, ${opacity})`;
          ctx.fill();

          for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2 + this.absorbProgress * 4;
            const dist = 35 * (1 - this.absorbProgress);
            const sx = this.x + Math.cos(angle) * dist;
            const sy = this.y + Math.sin(angle) * dist;

            ctx.beginPath();
            ctx.arc(sx, sy, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 230, 120, ${opacity})`;
            ctx.fill();
          }
        } else {
          // Trail
          if (this.trail.length > 1) {
            ctx.beginPath();
            ctx.moveTo(this.trail[0].x, this.trail[0].y);
            for (let i = 1; i < this.trail.length; i++) {
              ctx.lineTo(this.trail[i].x, this.trail[i].y);
            }
            ctx.strokeStyle = `rgba(255, 230, 120, 0.2)`;
            ctx.lineWidth = 2;
            ctx.stroke();
          }

          const oscGlow = this.glowRadius + Math.sin(this.pulseTime) * (this.glowRadius * 0.4);
          
          const grad = ctx.createRadialGradient(this.x, this.y, this.radius * 0.2, this.x, this.y, oscGlow);
          grad.addColorStop(0, '#ffffff');
          grad.addColorStop(0.2, this.color);
          grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

          ctx.beginPath();
          ctx.arc(this.x, this.y, oscGlow, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        }
        ctx.restore();
      }

      tap(tx, ty) {
        if (this.absorbing) return false;
        const dx = this.x - tx;
        const dy = this.y - ty;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= this.radius + 30) {
          this.absorbing = true;
          return true;
        }
        return false;
      }
    }

    // 4. Tap Ripple (Rain Mode)
    class Ripple {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 1;
        this.maxRadius = randomRange(100, 160);
        this.alpha = 0.8;
      }

      update() {
        if (isPaused) return;
        this.radius += 4;
        this.alpha -= 0.02;
      }

      draw() {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(14, 165, 233, ${this.alpha})`;
        ctx.lineWidth = 3 * (1 - this.radius / this.maxRadius);
        ctx.stroke();

        if (this.radius > 30) {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.radius - 20, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(14, 165, 233, ${this.alpha * 0.5})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
        ctx.restore();
      }

      isFinished() {
        return this.alpha <= 0 || this.radius >= this.maxRadius;
      }
    }

    // 5. Automatic Falling Raindrops
    class Raindrop {
      constructor() {
        this.reset();
        this.y = randomRange(0, height);
      }

      reset() {
        this.x = randomRange(0, width);
        this.y = randomRange(-50, -10);
        this.length = randomRange(10, 20);
        this.vy = randomRange(6, 12);
        this.alpha = randomRange(0.1, 0.3);
      }

      update() {
        if (isPaused) return;
        this.y += this.vy;
        if (this.y > height) {
          this.reset();
        }
      }

      draw() {
        ctx.save();
        ctx.beginPath();
        // Teardrop shape simulation
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x, this.y + this.length);
        const grad = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.length);
        grad.addColorStop(0, `rgba(255, 255, 255, 0)`);
        grad.addColorStop(1, `rgba(255, 255, 255, ${this.alpha})`);
        
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        ctx.stroke();
        ctx.restore();
      }
    }

    // Initialize Arrays
    const initGame = () => {
      bubbles = Array.from({ length: 6 }, () => new Bubble());
      leaves = Array.from({ length: 6 }, () => new Leaf());
      fireflies = Array.from({ length: 6 }, () => new Firefly());
      
      // Raindrops list
      ripples = [];
      particles = Array.from({ length: 30 }, () => new Raindrop());
    };

    initGame();

    // --- Main Game Loop (60 FPS) ---
    const tick = () => {
      ctx.clearRect(0, 0, width, height);

      // Render mode-specific entities
      if (mode === 'bubble') {
        bubbles.forEach(b => {
          b.update();
          b.draw();
        });
      } else if (mode === 'rain') {
        // Draw fall background
        particles.forEach(d => {
          d.update();
          d.draw();
        });

        // Update & Draw active ripples
        ripples = ripples.filter(r => {
          r.update();
          r.draw();
          return !r.isFinished();
        });
      } else if (mode === 'nature') {
        leaves.forEach(l => {
          l.update();
          l.draw();
        });
      } else if (mode === 'night') {
        fireflies.forEach(f => {
          f.update();
          f.draw();
        });
      }

      animationFrameId = requestAnimationFrame(tick);
    };

    tick();

    // Tap Input Event Listener
    const handleTap = (e) => {
      if (isPaused) return;

      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
      const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;

      let scoreVal = 0;

      if (mode === 'bubble') {
        bubbles.forEach(b => {
          if (b.tap(x, y)) {
            audio.playPop();
            hapticImpact('light');
            scoreVal += 1;
          }
        });
      } else if (mode === 'rain') {
        // Tapping anywhere in rain mode triggers a ripple!
        ripples.push(new Ripple(x, y));
        audio.playRaindrop();
        hapticImpact('soft');
        scoreVal += 1;
      } else if (mode === 'nature') {
        leaves.forEach(l => {
          if (l.tap(x, y)) {
            audio.playLeafRustle();
            hapticImpact('medium');
            scoreVal += 1;
          }
        });
      } else if (mode === 'night') {
        fireflies.forEach(f => {
          if (f.tap(x, y)) {
            audio.playFireflyGlow();
            hapticImpact('rigid');
            scoreVal += 1;
          }
        });
      }

      if (scoreVal > 0) {
        onPointScored(scoreVal);
      }
    };

    // Bind touch & click
    canvas.addEventListener('mousedown', handleTap);
    canvas.addEventListener('touchstart', handleTap, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      if (canvas) {
        canvas.removeEventListener('mousedown', handleTap);
        canvas.removeEventListener('touchstart', handleTap);
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, [mode, isPaused, onPointScored]);

  return (
    <div ref={containerRef} className="game-canvas-container">
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
    </div>
  );
};
