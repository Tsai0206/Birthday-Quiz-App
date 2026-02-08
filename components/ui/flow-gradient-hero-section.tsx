'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function FlowGradientHeroSection() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const cursorDotRef = useRef<HTMLDivElement>(null);
    const cursorRingRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        // Set initial dimensions
        setDimensions({
            width: window.innerWidth,
            height: window.innerHeight,
        });

        // Handle window resize
        const handleResize = () => {
            setDimensions({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (!canvasRef.current || dimensions.width === 0) return;

        const canvas = canvasRef.current;
        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

        const renderer = new THREE.WebGLRenderer({
            canvas,
            alpha: true,
            antialias: true,
        });
        renderer.setSize(dimensions.width, dimensions.height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Touch texture for interaction
        const touchTexture = new THREE.DataTexture(
            new Uint8Array(4),
            1,
            1,
            THREE.RGBAFormat
        );
        touchTexture.needsUpdate = true;

        const data = new Uint8Array(64 * 64 * 4);
        for (let i = 0; i < data.length; i += 4) {
            data[i] = 0;
            data[i + 1] = 0;
            data[i + 2] = 0;
            data[i + 3] = 255;
        }
        touchTexture.image.data = data;
        touchTexture.image.width = 64;
        touchTexture.image.height = 64;

        // Shader material with light colors (sky blue and light green)
        const material = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uResolution: {
                    value: new THREE.Vector2(dimensions.width, dimensions.height),
                },
                uMouse: { value: new THREE.Vector2(0.5, 0.5) },
                uTouchTexture: { value: touchTexture },
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float uTime;
                uniform vec2 uResolution;
                uniform vec2 uMouse;
                uniform sampler2D uTouchTexture;
                varying vec2 vUv;

                // Noise function
                vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
                vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
                vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

                float snoise(vec2 v) {
                    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
                    vec2 i  = floor(v + dot(v, C.yy));
                    vec2 x0 = v -   i + dot(i, C.xx);
                    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
                    vec4 x12 = x0.xyxy + C.xxzz;
                    x12.xy -= i1;
                    i = mod289(i);
                    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
                    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
                    m = m*m;
                    m = m*m;
                    vec3 x = 2.0 * fract(p * C.www) - 1.0;
                    vec3 h = abs(x) - 0.5;
                    vec3 ox = floor(x + 0.5);
                    vec3 a0 = x - ox;
                    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
                    vec3 g;
                    g.x  = a0.x  * x0.x  + h.x  * x0.y;
                    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
                    return 130.0 * dot(m, g);
                }

                void main() {
                    vec2 uv = vUv;
                    vec2 aspectRatio = vec2(uResolution.x / uResolution.y, 1.0);

                    // Animated noise layers
                    float noise1 = snoise(uv * 2.0 + uTime * 0.1);
                    float noise2 = snoise(uv * 3.0 - uTime * 0.15);
                    float noise3 = snoise(uv * 4.0 + uTime * 0.08);

                    // Combine noise
                    float combined = (noise1 + noise2 * 0.5 + noise3 * 0.25) / 1.75;

                    // Mouse interaction
                    vec2 mouseInfluence = uv - uMouse;
                    float mouseDist = length(mouseInfluence * aspectRatio);
                    float mouseEffect = smoothstep(0.5, 0.0, mouseDist) * 0.3;

                    // Light color palette - Sky blue and light green/white-green
                    vec3 color1 = vec3(0.529, 0.808, 0.980); // Sky blue (#87CEEB)
                    vec3 color2 = vec3(0.596, 0.984, 0.596); // Light green (#98FB98)
                    vec3 color3 = vec3(0.878, 0.988, 0.878); // White-green (#E0FCE0)
                    vec3 color4 = vec3(0.678, 0.918, 0.992); // Light sky blue (#ADE9FD)

                    // Mix colors based on noise and position
                    vec3 finalColor = mix(color1, color2, (combined + 1.0) * 0.5);
                    finalColor = mix(finalColor, color3, uv.y * 0.3);
                    finalColor = mix(finalColor, color4, (noise2 + 1.0) * 0.3);

                    // Add mouse interaction
                    finalColor += mouseEffect;

                    // Touch texture influence
                    vec4 touchColor = texture2D(uTouchTexture, uv);
                    finalColor = mix(finalColor, finalColor * 1.2, touchColor.r * 0.3);

                    gl_FragColor = vec4(finalColor, 1.0);
                }
            `,
            transparent: true,
        });

        const geometry = new THREE.PlaneGeometry(2, 2);
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        // Mouse/Touch tracking
        let mouseX = 0.5;
        let mouseY = 0.5;

        const handlePointerMove = (e: PointerEvent | TouchEvent) => {
            const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
            const y = 'touches' in e ? e.touches[0].clientY : e.clientY;

            mouseX = x / dimensions.width;
            mouseY = 1 - y / dimensions.height;

            // Update cursor position
            if (cursorDotRef.current && cursorRingRef.current) {
                cursorDotRef.current.style.left = `${x}px`;
                cursorDotRef.current.style.top = `${y}px`;
                cursorRingRef.current.style.left = `${x}px`;
                cursorRingRef.current.style.top = `${y}px`;
            }

            // Update touch texture
            const data = touchTexture.image.data;
            const size = 64;
            const centerX = Math.floor(mouseX * size);
            const centerY = Math.floor(mouseY * size);
            const radius = 8;

            for (let y = 0; y < size; y++) {
                for (let x = 0; x < size; x++) {
                    const dx = x - centerX;
                    const dy = y - centerY;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const index = (y * size + x) * 4;

                    if (dist < radius) {
                        const strength = 1 - dist / radius;
                        data[index] = Math.min(255, data[index] + strength * 30);
                    } else {
                        data[index] = Math.max(0, data[index] - 2);
                    }
                }
            }
            touchTexture.needsUpdate = true;
        };

        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('touchmove', handlePointerMove as any);

        // Animation loop
        let animationFrameId: number;
        const clock = new THREE.Clock();

        const animate = () => {
            const elapsedTime = clock.getElapsedTime();

            material.uniforms.uTime.value = elapsedTime;
            material.uniforms.uMouse.value.set(mouseX, mouseY);

            renderer.render(scene, camera);
            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        // Cleanup
        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('touchmove', handlePointerMove as any);
            geometry.dispose();
            material.dispose();
            touchTexture.dispose();
            renderer.dispose();
        };
    }, [dimensions]);

    return (
        <div className="liquid-container">
            <div className="liquid-canvas-wrapper">
                <canvas ref={canvasRef} />
            </div>
            <div ref={cursorRingRef} className="cursor-ring" />
            <div ref={cursorDotRef} className="cursor-dot-element" />
        </div>
    );
}
