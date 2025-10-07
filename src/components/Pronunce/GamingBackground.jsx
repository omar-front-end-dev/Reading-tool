import { useEffect, useRef } from "react";

// Gaming Background Animations
// Advanced particle system with gaming effects - Exact copy from gaming-background.js

class GamingBackgroundClass {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.particles = [];
    this.stars = [];
    this.connections = [];
    this.mouse = { x: 0, y: 0 };
    this.animationId = null;

    this.init();
  }

  init() {
    this.resizeCanvas();
    this.createParticles();
    this.createStars();
    this.setupEventListeners();
    this.animate();
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  createParticles() {
    const particleCount = Math.min(
      100,
      Math.floor((window.innerWidth * window.innerHeight) / 10000)
    );

    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.2,
        color: this.getRandomColor(),
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.02 + 0.01,
      });
    }
  }

  createStars() {
    const starCount = Math.min(
      200,
      Math.floor((window.innerWidth * window.innerHeight) / 5000)
    );

    for (let i = 0; i < starCount; i++) {
      this.stars.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.8 + 0.2,
        twinkle: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 0.03 + 0.01,
      });
    }
  }

  getRandomColor() {
    const colors = [
      "#00d4ff",
      "#ff6b6b",
      "#4ecdc4",
      "#45b7d1",
      "#96ceb4",
      "#feca57",
      "#ff9ff3",
      "#54a0ff",
      "#5f27cd",
      "#00d2d3",
      "#ff9f43",
      "#10ac84",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  setupEventListeners() {
    window.addEventListener("resize", () => {
      this.resizeCanvas();
      this.particles = [];
      this.stars = [];
      this.createParticles();
      this.createStars();
    });

    window.addEventListener("mousemove", (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });

    // Add touch support for mobile
    window.addEventListener("touchmove", (e) => {
      if (e.touches.length > 0) {
        this.mouse.x = e.touches[0].clientX;
        this.mouse.y = e.touches[0].clientY;
      }
    });
  }

  updateParticles() {
    this.particles.forEach((particle) => {
      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Bounce off edges
      if (particle.x < 0 || particle.x > this.canvas.width) {
        particle.vx *= -1;
      }
      if (particle.y < 0 || particle.y > this.canvas.height) {
        particle.vy *= -1;
      }

      // Keep particles in bounds
      particle.x = Math.max(0, Math.min(this.canvas.width, particle.x));
      particle.y = Math.max(0, Math.min(this.canvas.height, particle.y));

      // Update pulse
      particle.pulse += particle.pulseSpeed;
    });
  }

  updateStars() {
    this.stars.forEach((star) => {
      star.twinkle += star.twinkleSpeed;
    });
  }

  updateConnections() {
    this.connections = [];
    const maxDistance = 150;

    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < maxDistance) {
          this.connections.push({
            x1: this.particles[i].x,
            y1: this.particles[i].y,
            x2: this.particles[j].x,
            y2: this.particles[j].y,
            opacity: (1 - distance / maxDistance) * 0.3,
          });
        }
      }

      // Connect particles to mouse
      const dx = this.particles[i].x - this.mouse.x;
      const dy = this.particles[i].y - this.mouse.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < maxDistance * 1.5) {
        this.connections.push({
          x1: this.particles[i].x,
          y1: this.particles[i].y,
          x2: this.mouse.x,
          y2: this.mouse.y,
          opacity: (1 - distance / (maxDistance * 1.5)) * 0.2,
          isMouse: true,
        });
      }
    }
  }

  drawBackground() {
    // Create gradient background
    const gradient = this.ctx.createRadialGradient(
      this.canvas.width / 2,
      this.canvas.height / 2,
      0,
      this.canvas.width / 2,
      this.canvas.height / 2,
      Math.max(this.canvas.width, this.canvas.height) / 2
    );

    gradient.addColorStop(0, "rgba(15, 15, 35, 0.8)");
    gradient.addColorStop(0.5, "rgba(26, 26, 46, 0.6)");
    gradient.addColorStop(1, "rgba(22, 33, 62, 0.4)");

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawStars() {
    this.stars.forEach((star) => {
      const twinkleOpacity =
        star.opacity * (0.5 + 0.5 * Math.sin(star.twinkle));

      this.ctx.save();
      this.ctx.globalAlpha = twinkleOpacity;
      this.ctx.fillStyle = "#ffffff";
      this.ctx.beginPath();
      this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      this.ctx.fill();

      // Add star glow effect
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = "#ffffff";
      this.ctx.beginPath();
      this.ctx.arc(star.x, star.y, star.size * 0.5, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    });
  }

  drawConnections() {
    this.connections.forEach((connection) => {
      this.ctx.save();
      this.ctx.globalAlpha = connection.opacity;
      this.ctx.strokeStyle = connection.isMouse ? "#00d4ff" : "#4ecdc4";
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.moveTo(connection.x1, connection.y1);
      this.ctx.lineTo(connection.x2, connection.y2);
      this.ctx.stroke();
      this.ctx.restore();
    });
  }

  drawParticles() {
    this.particles.forEach((particle) => {
      const pulseOpacity =
        particle.opacity * (0.7 + 0.3 * Math.sin(particle.pulse));

      this.ctx.save();
      this.ctx.globalAlpha = pulseOpacity;

      // Create particle glow
      const gradient = this.ctx.createRadialGradient(
        particle.x,
        particle.y,
        0,
        particle.x,
        particle.y,
        particle.size * 3
      );
      gradient.addColorStop(0, particle.color);
      gradient.addColorStop(1, "transparent");

      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);
      this.ctx.fill();

      // Draw particle core
      this.ctx.fillStyle = particle.color;
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.restore();
    });
  }

  drawMouseEffect() {
    if (this.mouse.x && this.mouse.y) {
      this.ctx.save();
      this.ctx.globalAlpha = 0.1;

      const gradient = this.ctx.createRadialGradient(
        this.mouse.x,
        this.mouse.y,
        0,
        this.mouse.x,
        this.mouse.y,
        100
      );
      gradient.addColorStop(0, "#00d4ff");
      gradient.addColorStop(1, "transparent");

      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(this.mouse.x, this.mouse.y, 100, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.restore();
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawBackground();
    this.drawStars();
    this.updateStars();

    this.updateParticles();
    this.updateConnections();
    this.drawConnections();
    this.drawParticles();
    this.drawMouseEffect();

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}

const GamingBackground = () => {
  const canvasRef = useRef(null);
  const gamingBgInstance = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    gamingBgInstance.current = new GamingBackgroundClass(canvas, ctx);

    return () => {
      if (gamingBgInstance.current) {
        gamingBgInstance.current.destroy();
      }
    };
  }, []);

  return (
    <canvas
      id="gamingBackground"
      ref={canvasRef}
      className="gaming-background"
    />
  );
};

export default GamingBackground;
