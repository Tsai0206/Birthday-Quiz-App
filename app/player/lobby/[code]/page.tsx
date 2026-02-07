'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Player } from '@/lib/supabase';

export default function PlayerLobbyPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const roomCode = params.code as string;
    const playerId = searchParams.get('playerId');

    const [players, setPlayers] = useState<Player[]>([]);
    const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);

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

    if (!currentPlayer) return <div className="min-h-screen bg-[#F0FDF4] flex items-center justify-center">載入中...</div>;

    return (
        <div className="min-h-screen bg-[#F0FDF4] p-6 flex flex-col relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-[#2A9D8F] to-[#F0FDF4] opacity-20 pointer-events-none" />

            {/* Header Card */}
            <div className="bg-white rounded-3xl p-6 shadow-xl mb-6 flex items-center gap-4 relative z-10 animate-slide-up">
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

                {/* Players Grid (Mini) */}
                <div className="w-full max-w-sm bg-white/50 backdrop-blur-sm rounded-3xl p-6 border border-white">
                    <p className="text-left text-sm font-bold text-gray-400 mb-4 px-2">RECENT JOINED</p>
                    <div className="flex flex-wrap gap-3">
                        {players.map(p => (
                            <div key={p.id} className="flex flex-col items-center animate-bounce-in">
                                <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-xl border border-gray-100">
                                    {p.avatar}
                                </div>
                                <span className="text-xs text-gray-500 mt-1 max-w-[4rem] truncate">{p.username}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
