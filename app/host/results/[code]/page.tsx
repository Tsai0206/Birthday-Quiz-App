'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Player } from '@/lib/supabase';
import Link from 'next/link';
import ShareButton from '@/components/ShareButton';

export default function HostResultsPage() {
    const params = useParams();
    const router = useRouter();
    const roomCode = params.code as string;
    const [players, setPlayers] = useState<Player[]>([]);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const fetchResults = async () => {
            const { data: game } = await supabase
                .from('games')
                .select('id')
                .eq('room_code', roomCode)
                .single();

            if (game) {
                const { data: gamePlayers } = await supabase
                    .from('players')
                    .select('*')
                    .eq('game_id', game.id)
                    .order('score', { ascending: false });

                if (gamePlayers) {
                    setPlayers(gamePlayers);
                }
            }
        };

        fetchResults();
    }, [roomCode]);

    // Confetti Effect
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles: any[] = [];
        const colors = ['#F472B6', '#34D399', '#60A5FA', '#FBBF24', '#A78BFA'];

        for (let i = 0; i < 150; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height - canvas.height,
                vx: Math.random() * 4 - 2,
                vy: Math.random() * 4 + 2,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: Math.random() * 10 + 5,
                rotation: Math.random() * 360,
                rotationSpeed: Math.random() * 10 - 5
            });
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach((p, i) => {
                p.y += p.vy;
                p.x += p.vx;
                p.rotation += p.rotationSpeed;

                if (p.y > canvas.height) {
                    p.y = -20;
                    p.x = Math.random() * canvas.width;
                }

                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate((p.rotation * Math.PI) / 180);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                ctx.restore();
            });

            requestAnimationFrame(animate);
        };

        animate();

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const getPodiumHeight = (rank: number) => {
        switch (rank) {
            case 0: return 'h-64'; // 1st
            case 1: return 'h-48'; // 2nd
            case 2: return 'h-32'; // 3rd
            default: return 'h-0';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 relative overflow-hidden">
            <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
            />

            <div className="max-w-6xl mx-auto relative z-10" id="results-screenshot">
                <h1 className="text-6xl font-bold text-center text-white mb-12 drop-shadow-lg">
                    🏆 最終結果
                </h1>

                {/* Podium */}
                <div className="flex justify-center items-end gap-4 mb-16 h-80">
                    {players[1] && (
                        <div className="flex flex-col items-center w-32 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                            <div className="text-4xl mb-2">{players[1].avatar}</div>
                            <div className="text-white font-bold truncate w-full text-center mb-1">{players[1].username}</div>
                            <div className={`w-full ${getPodiumHeight(1)} bg-gray-300 rounded-t-lg flex items-start justify-center pt-4 shadow-2xl border-4 border-gray-400`}>
                                <span className="text-4xl font-bold text-gray-600">2</span>
                            </div>
                            <div className="text-2xl text-orange-400 font-bold mt-2">{players[1].score}</div>
                        </div>
                    )}

                    {players[0] && (
                        <div className="flex flex-col items-center w-32 animate-slide-up z-20">
                            <div className="text-6xl mb-2">👑</div>
                            <div className="text-5xl mb-2">{players[0].avatar}</div>
                            <div className="text-white font-bold truncate w-full text-center mb-1 text-xl">{players[0].username}</div>
                            <div className={`w-full ${getPodiumHeight(0)} bg-yellow-400 rounded-t-lg flex items-start justify-center pt-4 shadow-orange-500/50 shadow-2xl border-4 border-yellow-200`}>
                                <span className="text-5xl font-bold text-yellow-700">1</span>
                            </div>
                            <div className="text-3xl text-orange-400 font-bold mt-2">{players[0].score}</div>
                        </div>
                    )}

                    {players[2] && (
                        <div className="flex flex-col items-center w-32 animate-slide-up" style={{ animationDelay: '0.4s' }}>
                            <div className="text-4xl mb-2">{players[2].avatar}</div>
                            <div className="text-white font-bold truncate w-full text-center mb-1">{players[2].username}</div>
                            <div className={`w-full ${getPodiumHeight(2)} bg-amber-600 rounded-t-lg flex items-start justify-center pt-4 shadow-2xl border-4 border-amber-700`}>
                                <span className="text-4xl font-bold text-amber-900">3</span>
                            </div>
                            <div className="text-2xl text-orange-400 font-bold mt-2">{players[2].score}</div>
                        </div>
                    )}
                </div>

                {/* Full Leaderboard */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 max-w-2xl mx-auto">
                    <h2 className="text-2xl font-bold text-white mb-6">排行榜</h2>
                    <div className="space-y-3">
                        {players.map((player, index) => (
                            <div
                                key={player.id}
                                className={`flex items-center gap-4 p-4 rounded-xl transition-all hover:scale-[1.02] ${index < 3 ? 'bg-white/10 border border-white/20' : 'bg-white/5'
                                    }`}
                            >
                                <div className={`text-2xl font-bold w-8 ${index === 0 ? 'text-yellow-400' :
                                        index === 1 ? 'text-gray-300' :
                                            index === 2 ? 'text-amber-600' : 'text-gray-500'
                                    }`}>
                                    {index + 1}
                                </div>
                                <div className="text-3xl">{player.avatar}</div>
                                <div className="flex-grow">
                                    <div className="text-white font-bold text-lg">{player.username}</div>
                                    {player.personal_quote && (
                                        <div className="text-gray-400 text-sm">"{player.personal_quote}"</div>
                                    )}
                                </div>
                                <div className="text-2xl text-orange-400 font-bold">{player.score}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <ShareButton
                        targetId="results-screenshot"
                        filename={`birthday-quiz-${roomCode}-${Date.now()}.png`}
                        className="bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-full shadow-lg border border-white/20"
                    />
                    <Link
                        href="/"
                        className="inline-block bg-white/10 hover:bg-white/20 text-white font-bold py-4 px-8 rounded-full transition-all border border-white/20"
                    >
                        🏠 返回首頁
                    </Link>
                </div>
            </div>
        </div>
    );
}
