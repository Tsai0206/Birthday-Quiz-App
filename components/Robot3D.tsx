'use client';

import { useEffect, useRef } from 'react';

interface CuteRobotProps {
    lookDirection: 'left' | 'right' | 'center';
}

export default function CuteRobot({ lookDirection }: CuteRobotProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number | undefined>(undefined);
    const blinkRef = useRef(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const size = 180;
        canvas.width = size;
        canvas.height = size;

        const getEyeOffset = () => {
            switch (lookDirection) {
                case 'left': return { x: -6, y: 0 };
                case 'right': return { x: 6, y: 0 };
                default: return { x: 0, y: 0 };
            }
        };

        let currentOffset = { x: 0, y: 0 };
        const targetOffset = getEyeOffset();
        let isBlinking = false;
        let blinkTimer = 0;

        const animate = () => {
            // Smooth eye movement
            currentOffset.x += (targetOffset.x - currentOffset.x) * 0.15;
            currentOffset.y += (targetOffset.y - currentOffset.y) * 0.15;

            // Blink logic
            blinkTimer++;
            if (blinkTimer > 150) {
                isBlinking = true;
                if (blinkTimer > 160) {
                    isBlinking = false;
                    blinkTimer = 0;
                }
            }

            ctx.clearRect(0, 0, size, size);

            const cx = size / 2;
            const cy = size / 2 + 10;

            // Glow effect
            const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 70);
            gradient.addColorStop(0, 'rgba(139, 92, 246, 0.3)');
            gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(cx, cy, 70, 0, Math.PI * 2);
            ctx.fill();

            // Ears
            ctx.fillStyle = '#A78BFA';
            // Left ear
            ctx.beginPath();
            ctx.ellipse(cx - 50, cy - 20, 12, 18, -0.3, 0, Math.PI * 2);
            ctx.fill();
            // Right ear
            ctx.beginPath();
            ctx.ellipse(cx + 50, cy - 20, 12, 18, 0.3, 0, Math.PI * 2);
            ctx.fill();

            // Inner ears
            ctx.fillStyle = '#F9A8D4';
            ctx.beginPath();
            ctx.ellipse(cx - 50, cy - 20, 6, 10, -0.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(cx + 50, cy - 20, 6, 10, 0.3, 0, Math.PI * 2);
            ctx.fill();

            // Head - cute round shape
            const headGradient = ctx.createLinearGradient(cx, cy - 50, cx, cy + 50);
            headGradient.addColorStop(0, '#C4B5FD');
            headGradient.addColorStop(1, '#A78BFA');
            ctx.fillStyle = headGradient;
            ctx.beginPath();
            ctx.arc(cx, cy, 50, 0, Math.PI * 2);
            ctx.fill();

            // Cheeks (blush)
            ctx.fillStyle = 'rgba(249, 168, 212, 0.5)';
            ctx.beginPath();
            ctx.ellipse(cx - 35, cy + 10, 10, 7, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(cx + 35, cy + 10, 10, 7, 0, 0, Math.PI * 2);
            ctx.fill();

            // Eyes
            const eyeY = cy - 5;
            const eyeSpacing = 18;

            if (!isBlinking) {
                // Eye whites
                ctx.fillStyle = '#FFFFFF';
                ctx.beginPath();
                ctx.ellipse(cx - eyeSpacing + currentOffset.x, eyeY + currentOffset.y, 12, 14, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.ellipse(cx + eyeSpacing + currentOffset.x, eyeY + currentOffset.y, 12, 14, 0, 0, Math.PI * 2);
                ctx.fill();

                // Pupils
                ctx.fillStyle = '#1E1B4B';
                ctx.beginPath();
                ctx.arc(cx - eyeSpacing + currentOffset.x * 1.5, eyeY + currentOffset.y, 6, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(cx + eyeSpacing + currentOffset.x * 1.5, eyeY + currentOffset.y, 6, 0, Math.PI * 2);
                ctx.fill();

                // Eye shine
                ctx.fillStyle = '#FFFFFF';
                ctx.beginPath();
                ctx.arc(cx - eyeSpacing + currentOffset.x * 1.5 - 2, eyeY + currentOffset.y - 2, 2.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(cx + eyeSpacing + currentOffset.x * 1.5 - 2, eyeY + currentOffset.y - 2, 2.5, 0, Math.PI * 2);
                ctx.fill();
            } else {
                // Closed eyes (happy ^_^)
                ctx.strokeStyle = '#1E1B4B';
                ctx.lineWidth = 3;
                ctx.lineCap = 'round';

                ctx.beginPath();
                ctx.arc(cx - eyeSpacing, eyeY, 8, 0.2, Math.PI - 0.2);
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(cx + eyeSpacing, eyeY, 8, 0.2, Math.PI - 0.2);
                ctx.stroke();
            }

            // Cute smile
            ctx.strokeStyle = '#1E1B4B';
            ctx.lineWidth = 2.5;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.arc(cx, cy + 15, 12, 0.3, Math.PI - 0.3);
            ctx.stroke();

            // Antenna
            ctx.strokeStyle = '#A78BFA';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(cx, cy - 50);
            ctx.quadraticCurveTo(cx, cy - 65, cx + Math.sin(Date.now() / 300) * 3, cy - 70);
            ctx.stroke();

            // Antenna ball
            ctx.fillStyle = '#F472B6';
            ctx.beginPath();
            ctx.arc(cx + Math.sin(Date.now() / 300) * 3, cy - 72, 6, 0, Math.PI * 2);
            ctx.fill();

            // Antenna shine
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(cx + Math.sin(Date.now() / 300) * 3 - 2, cy - 74, 2, 0, Math.PI * 2);
            ctx.fill();

            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [lookDirection]);

    return (
        <div className="flex flex-col items-center">
            <canvas
                ref={canvasRef}
                className="drop-shadow-xl"
            />
            <div className="mt-1 text-white/70 text-sm font-medium">
                {lookDirection === 'left' && '👈 看主持人'}
                {lookDirection === 'right' && '👉 看玩家'}
                {lookDirection === 'center' && '✨ 準備好了嗎？'}
            </div>
        </div>
    );
}
