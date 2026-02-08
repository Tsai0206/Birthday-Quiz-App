'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Player } from '@/lib/supabase';
import FlowGradientHeroSection from '@/components/ui/flow-gradient-hero-section';

export default function HostLobbyPage() {
    const params = useParams();
    const router = useRouter();
    const roomCode = params.code as string;

    const [players, setPlayers] = useState<Player[]>([]);
    const [playerCount, setPlayerCount] = useState(0);
    const [gameId, setGameId] = useState<string | null>(null);
    const [isStarting, setIsStarting] = useState(false);

    useEffect(() => {
        let channel: ReturnType<typeof supabase.channel> | null = null;

        // Fetch game and setup realtime subscription
        const setupGame = async () => {
            // Get game by room code
            const { data: game } = await supabase
                .from('games')
                .select('*')
                .eq('room_code', roomCode)
                .single();

            if (!game) {
                alert('遊戲不存在');
                router.push('/');
                return;
            }

            setGameId(game.id);

            // Fetch initial players
            const { data: initialPlayers } = await supabase
                .from('players')
                .select('*')
                .eq('game_id', game.id)
                .order('joined_at', { ascending: true });

            if (initialPlayers) {
                setPlayers(initialPlayers);
                setPlayerCount(initialPlayers.length);
            }

            // Subscribe to player changes with wildcard to catch all events
            channel = supabase
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
                        // Refetch all players on any change
                        const { data: updatedPlayers } = await supabase
                            .from('players')
                            .select('*')
                            .eq('game_id', game.id)
                            .order('joined_at', { ascending: true });

                        if (updatedPlayers) {
                            setPlayers(updatedPlayers);
                            setPlayerCount(updatedPlayers.length);
                        }
                    }
                )
                .subscribe((status) => {
                    console.log('Realtime subscription status:', status);
                });
        };

        setupGame();

        return () => {
            if (channel) {
                supabase.removeChannel(channel);
            }
        };
    }, [roomCode, router]);

    const handleStartGame = async () => {
        if (players.length === 0) {
            alert('至少需要一位玩家才能開始遊戲');
            return;
        }

        setIsStarting(true);

        try {
            // Update game status
            await supabase
                .from('games')
                .update({ status: 'playing' })
                .eq('id', gameId);

            // Redirect to host game page
            router.push(`/host/game/${roomCode}`);
        } catch (error) {
            console.error('Error starting game:', error);
            alert('開始遊戲失敗');
            setIsStarting(false);
        }
    };

    return (
        <div className="min-h-screen p-4 relative overflow-hidden">
            {/* Liquid Gradient Background */}
            <FlowGradientHeroSection />

            {/* Content Overlay */}
            <div className="max-w-4xl mx-auto relative z-10">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-5xl font-bold text-[#264653] mb-4">🎮 主持人大廳</h1>
                    <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 inline-block border border-white/50 shadow-xl">
                        <p className="text-gray-600 mb-2 font-semibold">房間代碼</p>
                        <p className="text-6xl font-bold text-[#E76F51] tracking-widest">{roomCode}</p>
                    </div>
                    <div className="mt-4 text-2xl text-[#264653] font-bold">
                        👥 當前人數: <span className="text-[#2A9D8F] font-black">{playerCount}</span>
                    </div>
                </div>

                {/* Host + Players Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Host Section */}
                    <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-white/50 shadow-xl">
                        <h3 className="text-xl font-bold text-[#264653] mb-4 text-center">👑 主持人</h3>
                        <div className="flex justify-center">
                            <div className="bg-[#E76F51]/20 rounded-xl p-4 border-2 border-[#E76F51]/50">
                                <div className="text-6xl text-center">🎮</div>
                                <div className="text-[#264653] font-bold text-center mt-2">你</div>
                            </div>
                        </div>
                    </div>

                    {/* Players Count */}
                    <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-white/50 shadow-xl">
                        <h3 className="text-xl font-bold text-[#264653] mb-4 text-center">👥 玩家</h3>
                        <div className="text-center">
                            <div className="text-6xl font-bold text-[#2A9D8F]">{playerCount}</div>
                            <div className="text-gray-600 mt-2 font-semibold">位玩家已加入</div>
                        </div>
                    </div>
                </div>

                {/* Players Grid */}
                <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 mb-6 border border-white/50 shadow-xl min-h-[300px]">
                    {players.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-gray-500 text-xl font-semibold">
                            等待玩家加入...
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {players.map((player) => (
                                <div
                                    key={player.id}
                                    className="bg-white/70 rounded-xl p-4 border border-gray-200 text-center transform transition-all duration-300 hover:scale-105 shadow-md"
                                >
                                    <div className="text-5xl mb-2">{player.avatar}</div>
                                    <div className="text-[#264653] font-bold truncate">{player.username}</div>
                                    {player.personal_quote && (
                                        <div className="text-gray-500 text-sm mt-2 truncate">
                                            "{player.personal_quote}"
                                        </div>
                                    )}
                                    {player.is_host && (
                                        <div className="mt-2 bg-[#E76F51]/30 text-[#E76F51] text-xs px-2 py-1 rounded-full font-bold">
                                            主持人
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Start Button */}
                <button
                    onClick={handleStartGame}
                    disabled={isStarting || players.length === 0}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-6 px-8 rounded-2xl text-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                    {isStarting ? '開始中...' : '🚀 開始遊戲'}
                </button>

                {/* Instructions */}
                <div className="mt-6 text-center text-gray-600">
                    <p className="font-semibold">分享房間代碼給朋友，讓他們加入遊戲</p>
                    <p className="text-sm mt-2">主持人不參與答題，只負責管理和查看統計</p>
                </div>
            </div>
        </div>
    );
}
