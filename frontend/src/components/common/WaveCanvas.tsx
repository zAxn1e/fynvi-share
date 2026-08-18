import { useMantineTheme } from "@mantine/core";
import React, { useEffect, useRef } from "react";

export type WaveState = "idle" | "uploading" | "complete" | "paused" | "error";

export interface WaveCanvasProps {
  state?: WaveState;
  speed?: number; // Live transfer speed in MB/s
  progress?: number; // Progress 0 - 100
  className?: string;
}

export const WaveCanvas: React.FC<WaveCanvasProps> = ({
  state = "idle",
  speed = 0,
  progress = 0,
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const theme = useMantineTheme();
  const isDark = theme.colorScheme === "dark";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    // Detect reduced motion preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const prefersReducedMotion = mediaQuery.matches;

    const resize = () => {
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.parentElement?.clientWidth || window.innerWidth;
      const height = canvas.parentElement?.clientHeight || window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener("resize", resize);

    // Target dynamic wave configuration based on state
    let targetSpeed = 0.008;
    let targetAmplitude = 32;
    let targetFrequency = 0.0018;

    const render = () => {
      const width = canvas.parentElement?.clientWidth || window.innerWidth;
      const height = canvas.parentElement?.clientHeight || window.innerHeight;

      // Adjust parameters based on state
      if (state === "uploading") {
        const speedBonus = Math.min(speed / 15, 2.5);
        targetSpeed = 0.015 + speedBonus * 0.015;
        targetAmplitude = 45 + Math.min(progress * 0.3, 20);
        targetFrequency = 0.0028;
      } else if (state === "complete") {
        targetSpeed = 0.006;
        targetAmplitude = 24;
        targetFrequency = 0.0015;
      } else if (state === "paused") {
        targetSpeed = 0.002;
        targetAmplitude = 18;
        targetFrequency = 0.0012;
      } else if (state === "error") {
        targetSpeed = 0.004;
        targetAmplitude = 15;
        targetFrequency = 0.0035;
      } else {
        // Idle state
        targetSpeed = 0.006;
        targetAmplitude = 28;
        targetFrequency = 0.0016;
      }

      time += prefersReducedMotion ? 0 : targetSpeed;

      ctx.clearRect(0, 0, width, height);

      // Dynamic primary color paletting from theme
      const themePrimaryHex =
        theme.colors[theme.primaryColor]?.[6] || (isDark ? "#3B82F6" : "#2563EB");
      const hexToRgbStr = (hex: string) => {
        const h = hex.replace("#", "");
        if (h.length === 3) {
          return `${parseInt(h[0] + h[0], 16)}, ${parseInt(h[1] + h[1], 16)}, ${parseInt(h[2] + h[2], 16)}`;
        }
        if (h.length === 6) {
          return `${parseInt(h.slice(0, 2), 16)}, ${parseInt(h.slice(2, 4), 16)}, ${parseInt(h.slice(4, 6), 16)}`;
        }
        return isDark ? "59, 130, 246" : "37, 99, 235";
      };
      const primaryRgbStr = hexToRgbStr(themePrimaryHex);

      const primaryColor =
        state === "complete"
          ? "rgba(16, 185, 129, "
          : state === "error"
            ? isDark
              ? "rgba(239, 68, 68, "
              : "rgba(220, 38, 38, "
            : `rgba(${primaryRgbStr}, `;

      const secondaryColor = isDark
        ? `rgba(${primaryRgbStr}, `
        : `rgba(${primaryRgbStr}, `;

      const accentColor = isDark
        ? "rgba(139, 92, 246, "
        : "rgba(99, 102, 241, ";

      // Helper to draw a single wave harmonic
      const drawWave = (
        opacity: number,
        ampFactor: number,
        freqFactor: number,
        offset: number,
        colorPrefix: string,
        yOffsetRatio: number = 0.5
      ) => {
        ctx.beginPath();
        const baseHeight = height * yOffsetRatio;

        ctx.moveTo(0, height);
        ctx.lineTo(0, baseHeight);

        for (let x = 0; x <= width; x += 8) {
          const y =
            baseHeight +
            Math.sin(x * targetFrequency * freqFactor + time + offset) *
              (targetAmplitude * ampFactor) +
            Math.cos(x * targetFrequency * 0.5 * freqFactor + time * 0.8) *
              (targetAmplitude * 0.4 * ampFactor);
          ctx.lineTo(x, y);
        }

        ctx.lineTo(width, height);
        ctx.closePath();

        const grad = ctx.createLinearGradient(0, baseHeight - 50, width, height);
        grad.addColorStop(0, `${colorPrefix}${opacity})`);
        grad.addColorStop(1, `${colorPrefix}0)`);
        ctx.fillStyle = grad;
        ctx.fill();
      };

      // Draw layered harmonic curves
      const baseAlpha = isDark ? 0.07 : 0.05;
      drawWave(baseAlpha * 0.7, 0.8, 1.2, 0, primaryColor, 0.45);
      drawWave(baseAlpha * 0.9, 1.1, 0.9, 1.8, secondaryColor, 0.52);
      drawWave(baseAlpha * 0.6, 0.7, 1.4, 3.4, accentColor, 0.60);

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
    };
  }, [state, speed, progress, isDark]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
        opacity: isDark ? 0.85 : 0.6,
        transition: "opacity 0.6s ease",
      }}
      aria-hidden="true"
    />
  );
};

export default WaveCanvas;
