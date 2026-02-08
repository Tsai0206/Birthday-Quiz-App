'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Player } from '@/lib/supabase';
import Matter from 'matter-js';
import FlowGradientHeroSection from '@/components/ui/flow-gradient-hero-section';

export default function PlayerLobbyPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const roomCode = params.code as string;
    const playerId = searchParams.get('playerId');

    const [players, setPlayers] = useState<Player[]>([]);
    const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const setupLobby = async () => {
            // Get game
            const { data: game, error } = await supabase
                .from('games')
                .select('*')
                .eq('room_code', roomCode)
                .single();

            if (error || !game) {
                alert('遊戲不存在');
                router.push('/');
                return;
            }

            // Check game status
            if (game.status === 'playing') {
                router.push(`/player/game/${roomCode}?playerId=${playerId}`);
                return;
            }

            // Get players
            const { data: initialPlayers } = await supabase
                .from('players')
                .select('*')
                .eq('game_id', game.id)
                .order('joined_at', { ascending: true });

            if (initialPlayers) {
                setPlayers(initialPlayers);
                const me = initialPlayers.find(p => p.id === playerId);
                if (me) setCurrentPlayer(me);
            }

            // Subscribe to changes
            const channel = supabase
                .channel(`lobby-${game.id}`)
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'players',
                        filter: `game_id=eq.${game.id}`
                    },
                    async () => {
                        const { data: updated } = await supabase
                            .from('players')
                            .select('*')
                            .eq('game_id', game.id)
                            .order('joined_at', { ascending: true });
                        if (updated) setPlayers(updated);
                    }
                )
                .on(
                    'postgres_changes',
                    {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'games',
                        filter: `id=eq.${game.id}`
                    },
                    (payload) => {
                        if (payload.new.status === 'playing') {
                            router.push(`/player/game/${roomCode}?playerId=${playerId}`);
                        }
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        };

        setupLobby();
    }, [roomCode, playerId, router]);

    // Matter.js Physics Simulation for Interactive Avatars
    useEffect(() => {
        if (!canvasRef.current || players.length === 0) return;

        const canvas = canvasRef.current;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const { Engine, Bodies, Composite, Runner, MouseConstraint, Mouse, Events } = Matter;

        // Create engine
        const engine = Engine.create({
            gravity: { x: 0, y: 0.3 } // Gentle downward gravity
        });

        // Create walls (invisible boundaries)
        const wallOptions = { isStatic: true };
        const walls = [
            Bodies.rectangle(width / 2, -25, width, 50, wallOptions), // top
            Bodies.rectangle(width / 2, height + 25, width, 50, wallOptions), // bottom
            Bodies.rectangle(-25, height / 2, 50, height, wallOptions), // left
            Bodies.rectangle(width + 25, height / 2, 50, height, wallOptions) // right
        ];

        // Create avatar circles with player data
        const bodies = new Map<string, { body: Matter.Body; player: Player }>();
        players.forEach((player, index) => {
            const x = 50 + Math.random() * (width - 100);
            const y = 50 + Math.random() * 100;
            const circle = Bodies.circle(x, y, 30, {
                restitution: 0.8, // Bounciness
                friction: 0.01,
                frictionAir: 0.01
            });
            bodies.set(player.id, { body: circle, player });
        });

        // Add everything to the world
        Composite.add(engine.world, [...walls, ...Array.from(bodies.values()).map(b => b.body)]);

        // Add mouse control for drag interaction
        const mouse = Mouse.create(canvas);
        const mouseConstraint = MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.2
            }
        });
        Composite.add(engine.world, mouseConstraint);

        // Run the engine
        const runner = Runner.create();
        Runner.run(runner, engine);

        // Custom render loop
        const render = () => {
            ctx.clearRect(0, 0, width, height);

            // Draw each avatar
            bodies.forEach(({ body, player }, playerId) => {
                const { x, y } = body.position;

                // Draw circle background
                ctx.beginPath();
                ctx.arc(x, y, 30, 0, Math.PI * 2);
                ctx.fillStyle = '#FFFFFF';
                ctx.fill();
                ctx.strokeStyle = playerId === currentPlayer?.id ? '#E76F51' : '#2A9D8F';
                ctx.lineWidth = 3;
                ctx.stroke();

                // Draw emoji
                ctx.font = '32px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#000000';
                ctx.fillText(player.avatar, x, y);
            });

            requestAnimationFrame(render);
        };
        render();

        // Add gentle random forces to keep things moving
        const addRandomForces = () => {
            bodies.forEach(({ body }) => {
                if (Math.random() > 0.98) {
                    const force = {
                        x: (Math.random() - 0.5) * 0.001,
                        y: (Math.random() - 0.5) * 0.001
                    };
                    Matter.Body.applyForce(body, body.position, force);
                }
            });
        };

        Events.on(engine, 'beforeUpdate', addRandomForces);

        // Cleanup
        return () => {
            Events.off(engine, 'beforeUpdate', addRandomForces);
            Runner.stop(runner);
            Composite.clear(engine.world, false);
            Engine.clear(engine);
        };
    }, [players, currentPlayer]);

    if (!currentPlayer) return (
        <div className="min-h-screen flex items-center justify-center relative">
            <FlowGradientHeroSection />
            <div className="relative z-10">載入中...</div>
        </div>
    );

    return (
        <div className="min-h-screen p-6 flex flex-col relative overflow-hidden">
            {/* Liquid Gradient Background */}
            <FlowGradientHeroSection />

            {/* Content Overlay */}
            <div className="relative z-10 flex flex-col h-full">

            {/* Header Card */}
            <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-xl mb-6 flex items-center gap-4 animate-slide-up">
                <div className="w-16 h-16 bg-[#F0FDF4] rounded-2xl flex items-center justify-center text-4xl border-2 border-[#2A9D8F]/20">
                    {currentPlayer.avatar}
                </div>
                <div>
                    <p className="text-gray-400 text-sm font-bold uppercase tracking-wider">Hello,</p>
                    <h1 className="text-2xl font-black text-[#264653]">{currentPlayer.username}</h1>
                </div>
                <div className="ml-auto">
                    <div className="bg-[#E76F51] text-white px-4 py-2 rounded-full font-bold shadow-md">
                        Waiting
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-grow flex flex-col items-center justify-center text-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <div className="w-48 h-48 mb-6 relative">
                    {/* Pulse Rings */}
                    <div className="absolute inset-0 bg-[#E9C46A] rounded-full opacity-20 animate-ping"></div>
                    <div className="absolute inset-4 bg-[#E9C46A] rounded-full opacity-40 animate-pulse"></div>
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                        <span className="text-6xl">⏳</span>
                    </div>
                </div>

                <h2 className="text-3xl font-black text-[#264653] mb-2">等待主持人開始</h2>
                <p className="text-[#264653]/60 mb-8 max-w-xs mx-auto">
                    目前有 <span className="text-[#E76F51] font-bold text-xl">{players.length}</span> 位玩家準備好了
                </p>

                {/* Interactive Physics Playground */}
                <div className="w-full max-w-sm bg-white/50 backdrop-blur-sm rounded-3xl p-4 border border-white relative overflow-hidden">
                    <p className="text-left text-sm font-bold text-gray-400 mb-2 px-2">互動頭像區 (可以拖動喔！)</p>
                    <div className="relative w-full h-64">
                        {/* Matter.js Canvas with Emoji Rendering */}
                        <canvas
                            ref={canvasRef}
                            className="w-full h-full rounded-2xl"
                            style={{ touchAction: 'none' }}
                        />
                    </div>
                </div>
            </div>

            </div>
        </div>
    );
}
