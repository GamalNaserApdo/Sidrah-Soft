import { useEffect, useRef } from 'react';

const NODE_COUNT = 36;
const CONNECTION_DISTANCE = 130;
const MOUSE_RADIUS = 220;
const MOUSE_FORCE = 0.35;
const RETURN_FORCE = 0.025;
const FRICTION = 0.94;
const AMBIENT_DRIFT = 0.15;

/**
 * Subtle fixed-canvas network background.
 *
 * Renders a low-density node/line network that gently responds to cursor
 * movement. Disabled on touch devices and when reduced motion is preferred.
 *
 * Uses refs and requestAnimationFrame to avoid React re-renders.
 */
function InteractiveNetworkBackground() {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const nodesRef = useRef([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const rafRef = useRef(null);
  const dprRef = useRef(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctxRef.current = ctx;

    if (typeof window === 'undefined') return;

    const isTouch =
      window.matchMedia('(hover: none)').matches ||
      window.matchMedia('(pointer: coarse)').matches ||
      navigator.maxTouchPoints > 0;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isTouch || reducedMotion) return;

    function resize() {
      dprRef.current = Math.min(window.devicePixelRatio || 1, 2);
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = Math.floor(width * dprRef.current);
      canvas.height = Math.floor(height * dprRef.current);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dprRef.current, 0, 0, dprRef.current, 0, 0);

      const nodes = nodesRef.current;
      if (nodes.length === 0) return;

      nodes.forEach((node) => {
        node.baseX = (node.baseX / node.viewportWidth) * width;
        node.baseY = (node.baseY / node.viewportHeight) * height;
        node.x = node.baseX;
        node.y = node.baseY;
        node.viewportWidth = width;
        node.viewportHeight = height;
      });
    }

    function initNodes() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const nodes = [];

      for (let i = 0; i < NODE_COUNT; i += 1) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        nodes.push({
          x,
          y,
          baseX: x,
          baseY: y,
          vx: 0,
          vy: 0,
          radius: Math.random() * 1.2 + 0.8,
          viewportWidth: width,
          viewportHeight: height,
        });
      }

      nodesRef.current = nodes;
    }

    function handleMouseMove(e) {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    }

    function handleMouseLeave() {
      mouseRef.current = { x: -1000, y: -1000 };
    }

    function updateNodes() {
      const nodes = nodesRef.current;
      const mouse = mouseRef.current;

      nodes.forEach((node) => {
        // Return to base position
        node.vx += (node.baseX - node.x) * RETURN_FORCE;
        node.vy += (node.baseY - node.y) * RETURN_FORCE;

        // Ambient micro drift
        node.vx += (Math.random() - 0.5) * AMBIENT_DRIFT;
        node.vy += (Math.random() - 0.5) * AMBIENT_DRIFT;

        // Gentle mouse influence (attraction)
        const dx = mouse.x - node.x;
        const dy = mouse.y - node.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < MOUSE_RADIUS) {
          const force = ((MOUSE_RADIUS - dist) / MOUSE_RADIUS) * MOUSE_FORCE;
          const angle = Math.atan2(dy, dx);
          node.vx += Math.cos(angle) * force;
          node.vy += Math.sin(angle) * force;
        }

        node.vx *= FRICTION;
        node.vy *= FRICTION;
        node.x += node.vx;
        node.y += node.vy;
      });
    }

    function draw() {
      const ctx = ctxRef.current;
      const nodes = nodesRef.current;
      const mouse = mouseRef.current;
      const width = window.innerWidth;
      const height = window.innerHeight;

      ctx.clearRect(0, 0, width, height);

      // Subtle cursor-local glow
      if (mouse.x >= 0 && mouse.y >= 0 && mouse.x <= width && mouse.y <= height) {
        const glow = ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          0,
          mouse.x,
          mouse.y,
          MOUSE_RADIUS * 1.2
        );
        glow.addColorStop(0, 'rgba(141, 81, 160, 0.035)');
        glow.addColorStop(0.5, 'rgba(130, 145, 205, 0.015)');
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, width, height);
      }

      // Draw connections
      for (let i = 0; i < nodes.length; i += 1) {
        const a = nodes[i];

        for (let j = i + 1; j < nodes.length; j += 1) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CONNECTION_DISTANCE) {
            const midX = (a.x + b.x) / 2;
            const midY = (a.y + b.y) / 2;
            const mdx = mouse.x - midX;
            const mdy = mouse.y - midY;
            const mouseDist = Math.sqrt(mdx * mdx + mdy * mdy);
            const mouseFactor = Math.max(0, 1 - mouseDist / MOUSE_RADIUS);

            const distanceFactor = 1 - dist / CONNECTION_DISTANCE;
            const baseOpacity = 0.055;
            const opacity = (baseOpacity + mouseFactor * 0.095) * distanceFactor;
            const lineWidth = 0.55 + mouseFactor * 0.65;
            const lineBrightness = 145 + mouseFactor * 40;

            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(${lineBrightness - 15}, ${lineBrightness}, 225, ${opacity})`;
            ctx.lineWidth = lineWidth;
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      nodes.forEach((node) => {
        const mdx = mouse.x - node.x;
        const mdy = mouse.y - node.y;
        const mouseDist = Math.sqrt(mdx * mdx + mdy * mdy);
        const mouseFactor = Math.max(0, 1 - mouseDist / MOUSE_RADIUS);

        const opacity = 0.22 + mouseFactor * 0.26;
        const radius = node.radius + mouseFactor * 0.6;
        const nodeBrightness = 141 + mouseFactor * 40;

        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${nodeBrightness}, 81, 160, ${opacity})`;
        ctx.fill();
      });
    }

    function loop() {
      updateNodes();
      draw();
      rafRef.current = requestAnimationFrame(loop);
    }

    initNodes();
    resize();

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="interactive-network-background"
      aria-hidden="true"
    />
  );
}

export default InteractiveNetworkBackground;
