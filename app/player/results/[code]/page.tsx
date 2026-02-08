'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Player } from '@/lib/supabase';
import Link from 'next/link';
import { sampleQuestions } from '@/lib/game-logic';

export default function PlayerResultsPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const roomCode = params.code as string;
    const playerId = searchParams.get('playerId');

    const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
    const [rank, setRank] = useState<number>(0);
    const [topPlayers, setTopPlayers] = useState<Player[]>([]);
    const [allPlayers, setAllPlayers] = useState<Player[]>([]);
    const [stats, setStats] = useState<{
        correctAnswers: number;
        totalQuestions: number;
        avgTime: number;
    }>({ correctAnswers: 0, totalQuestions: sampleQuestions.length, avgTime: 0 });
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const fetchResult = async () => {
            const { data: game } = await supabase.from('games').select('id').eq('room_code', roomCode).single();
            if (game && playerId) {
                // Fetch players
                const { data: players } = await supabase.from('players').select('*').eq('game_id', game.id).order('score', { ascending: false });
                if (players) {
                    const playerIndex = players.findIndex(p => p.id === playerId);
                    if (playerIndex !== -1) {
                        setCurrentPlayer(players[playerIndex]);
                        setRank(playerIndex + 1);
                    }
                    setTopPlayers(players.slice(0, 3));
                    setAllPlayers(players);
                }

                // Fetch player's answers for statistics
                const { data: answers } = await supabase
                    .from('answers')
                    .select('*')
                    .eq('player_id', playerId);

                if (answers && answers.length > 0) {
                    const correctCount = answers.filter(a => a.is_correct).length;
                    const totalTime = answers.reduce((sum, a) => sum + (a.time_taken || 0), 0);
                    const avgTime = totalTime / answers.length;

                    setStats({
                        correctAnswers: correctCount,
                        totalQuestions: sampleQuestions.length,
                        avgTime: avgTime
                    });
                }
            }
        };
        fetchResult();
    }, [roomCode, playerId]);

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

    if (!currentPlayer) return <div className="min-h-screen bg-[#6D28D9] flex items-center justify-center text-white">載入中...</div>;

    return (
        <div className="min-h-screen bg-[#6D28D9] flex flex-col p-0 relative overflow-hidden">
            <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full pointer-events-none z-0"
            />
            {/* Curved Header Background (Purple from reference) */}
            <div className="bg-[#5B21B6] pt-20 pb-24 px-6 rounded-b-[3rem] shadow-2xl relative z-10 text-center">
                <h1 className="text-white text-lg font-bold opacity-80 mb-3">LEADERBOARD</h1>
                <div className="inline-block bg-[#8B5CF6] text-white px-6 py-1 rounded-full text-sm font-bold mb-6">All Time</div>

                {/* Podium (Simplified for Mobile) */}
                <div className="flex justify-center items-end gap-4 h-40 mb-[-4rem]">
                    {/* 2nd Place */}
                    {topPlayers[1] && (
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-white rounded-full border-4 border-[#C4B5FD] flex items-center justify-center text-2xl mb-2 shadow-lg relative z-20">
                                {topPlayers[1].avatar}
                                <div className="absolute -bottom-2 bg-[#8B5CF6] text-white text-xs px-2 rounded-full font-bold">2</div>
                            </div>
                            <div className="w-20 h-24 bg-[#7C3AED] rounded-t-xl opacity-80"></div>
                        </div>
                    )}

                    {/* 1st Place */}
                    {topPlayers[0] && (
                        <div className="flex flex-col items-center z-20">
                            <div className="text-4xl absolute -top-12 animate-bounce">👑</div>
                            <div className="w-24 h-24 bg-white rounded-full border-4 border-[#FBBF24] flex items-center justify-center text-4xl mb-2 shadow-xl relative">
                                {topPlayers[0].avatar}
                                <div className="absolute -bottom-3 bg-[#FBBF24] text-[#78350F] text-xs px-3 py-1 rounded-full font-bold">1</div>
                            </div>
                            <div className="w-24 h-32 bg-[#6D28D9] rounded-t-xl shadow-[0_0_20px_rgba(0,0,0,0.3)] gradient-to-b from-[#7C3AED] to-[#5B21B6]"></div>
                        </div>
                    )}

                    {/* 3rd Place */}
                    {topPlayers[2] && (
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-white rounded-full border-4 border-[#FCD34D] flex items-center justify-center text-2xl mb-2 shadow-lg relative z-20">
                                {topPlayers[2].avatar}
                                <div className="absolute -bottom-2 bg-[#8B5CF6] text-white text-xs px-2 rounded-full font-bold">3</div>
                            </div>
                            <div className="w-20 h-16 bg-[#7C3AED] rounded-t-xl opacity-60"></div>
                        </div>
                    )}
                </div>
            </div>

            {/* Stats Card - Following the 'Physics/Chemistry' clean card look from reference */}
            <div className="flex-grow bg-[#F3F4F6] pt-20 px-6 -mt-10 overflow-y-auto">
                {/* My Rank Card */}
                <div className="bg-white rounded-3xl p-6 shadow-xl mb-4 flex items-center justify-between border border-gray-100 animate-slide-up">
                    <div className="flex items-center gap-4">
                        <div className="text-2xl font-bold text-gray-400">#{rank}</div>
                        <div className="text-4xl">{currentPlayer.avatar}</div>
                        <div>
                            <div className="font-black text-[#1F2937] text-lg">{currentPlayer.username}</div>
                            <div className="text-xs text-gray-400 font-bold uppercase">Your Rank</div>
                        </div>
                    </div>
                    <div className="text-[#E76F51] font-black text-2xl">
                        {currentPlayer.score}
                    </div>
                </div>

                {/* Detailed Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 text-center">
                        <div className="text-3xl font-black text-[#2A9D8F] mb-1">
                            {stats.correctAnswers}/{stats.totalQuestions}
                        </div>
                        <div className="text-xs text-gray-500 font-bold uppercase">答對題數</div>
                    </div>
                    <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 text-center">
                        <div className="text-3xl font-black text-[#E9C46A] mb-1">
                            {stats.avgTime.toFixed(1)}s
                        </div>
                        <div className="text-xs text-gray-500 font-bold uppercase">平均時間</div>
                    </div>
                    <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 text-center">
                        <div className="text-3xl font-black text-[#E76F51] mb-1">
                            {((stats.correctAnswers / stats.totalQuestions) * 100).toFixed(0)}%
                        </div>
                        <div className="text-xs text-gray-500 font-bold uppercase">正確率</div>
                    </div>
                    <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 text-center">
                        <div className="text-3xl font-black text-[#52B788] mb-1">
                            {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}
                        </div>
                        <div className="text-xs text-gray-500 font-bold uppercase">名次</div>
                    </div>
                </div>

                {/* Full Leaderboard */}
                {allPlayers.length > 3 && (
                    <div className="bg-white rounded-3xl p-6 shadow-xl mb-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        <h3 className="text-lg font-black text-[#1F2937] mb-4">完整排行榜</h3>
                        <div className="space-y-2">
                            {allPlayers.slice(3).map((player, index) => {
                                const actualRank = index + 4;
                                const isCurrentPlayer = player.id === playerId;
                                return (
                                    <div
                                        key={player.id}
                                        className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                                            isCurrentPlayer ? 'bg-[#E76F51]/10 border-2 border-[#E76F51]' : 'bg-gray-50'
                                        }`}
                                    >
                                        <div className="text-lg font-bold text-gray-400 w-8">
                                            #{actualRank}
                                        </div>
                                        <div className="text-2xl">{player.avatar}</div>
                                        <div className="flex-grow">
                                            <div className={`font-bold ${isCurrentPlayer ? 'text-[#E76F51]' : 'text-[#1F2937]'}`}>
                                                {player.username}
                                            </div>
                                        </div>
                                        <div className="text-[#2A9D8F] font-bold text-lg">
                                            {player.score}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <Link href="/" className="block w-full bg-gradient-to-r from-[#E76F51] to-[#E9C46A] text-white font-bold py-4 rounded-2xl text-center shadow-lg shadow-orange-500/30 hover:scale-105 transition-transform">
                    🎮 再玩一次
                </Link>
            </div>
        </div>
    );
}
