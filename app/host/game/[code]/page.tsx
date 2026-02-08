'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Player } from '@/lib/supabase';
import { sampleQuestions, shuffleArray, calculatePoints } from '@/lib/game-logic';

export default function HostGamePage() {
    const params = useParams();
    const router = useRouter();
    const roomCode = params.code as string;

    const [gameId, setGameId] = useState<string | null>(null);
    const [players, setPlayers] = useState<Player[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [isShowingAnswer, setIsShowingAnswer] = useState(false);
    const [answeredPlayers, setAnsweredPlayers] = useState<string[]>([]);
    const [gameEnded, setGameEnded] = useState(false);

    const currentQuestion = sampleQuestions[currentQuestionIndex];
    const totalQuestions = sampleQuestions.length;

    useEffect(() => {
        const setupGame = async () => {
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

            // Fetch players
            const { data: gamePlayers } = await supabase
                .from('players')
                .select('*')
                .eq('game_id', game.id)
                .order('score', { ascending: false });

            if (gamePlayers) {
                setPlayers(gamePlayers);
            }

            // Subscribe to answer changes
            const channel = supabase
                .channel(`game-answers-${game.id}`)
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'answers',
                        filter: `game_id=eq.${game.id}`
                    },
                    async () => {
                        // Refetch answered players for current question
                        const { data: answers } = await supabase
                            .from('answers')
                            .select('player_id')
                            .eq('game_id', game.id)
                            .eq('question_index', currentQuestionIndex);

                        if (answers) {
                            setAnsweredPlayers(answers.map(a => a.player_id));
                        }
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        };

        setupGame();
    }, [roomCode, router, currentQuestionIndex]);

    // Timer countdown
    useEffect(() => {
        if (isShowingAnswer || gameEnded) return;

        // Check if all non-host players have answered
        const nonHostPlayers = players.filter(p => !p.is_host);
        const allAnswered = nonHostPlayers.length > 0 &&
            nonHostPlayers.every(p => answeredPlayers.includes(p.id));

        // If all answered, end countdown immediately
        if (allAnswered) {
            handleShowAnswer();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleShowAnswer();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [currentQuestionIndex, isShowingAnswer, gameEnded, answeredPlayers, players]);

    const handleShowAnswer = async () => {
        setIsShowingAnswer(true);

        // Fetch updated scores
        if (gameId) {
            const { data: updatedPlayers } = await supabase
                .from('players')
                .select('*')
                .eq('game_id', gameId)
                .order('score', { ascending: false });

            if (updatedPlayers) {
                setPlayers(updatedPlayers);
            }
        }
    };

    const handleNextQuestion = async () => {
        if (currentQuestionIndex >= totalQuestions - 1) {
            // Game ended
            setGameEnded(true);

            // Update game status
            await supabase
                .from('games')
                .update({ status: 'finished' })
                .eq('id', gameId);

            router.push(`/host/results/${roomCode}`);
            return;
        }

        // Update game's current question
        const nextIndex = currentQuestionIndex + 1;
        await supabase
            .from('games')
            .update({ current_question_index: nextIndex })
            .eq('id', gameId);

        setCurrentQuestionIndex(nextIndex);
        setTimeLeft(30);
        setIsShowingAnswer(false);
        setAnsweredPlayers([]);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div className="text-white">
                        <span className="text-lg">題目 </span>
                        <span className="text-3xl font-bold text-orange-400">{currentQuestionIndex + 1}</span>
                        <span className="text-lg text-gray-400">/{totalQuestions}</span>
                    </div>
                    <div className={`text-6xl font-bold ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                        {timeLeft}
                    </div>
                    <div className="text-white">
                        房間: <span className="text-orange-400 font-bold">{roomCode}</span>
                    </div>
                </div>

                {/* Question */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-6 border border-white/20">
                    <h2 className="text-3xl font-bold text-white text-center mb-8">
                        {currentQuestion?.question}
                    </h2>

                    {/* Options */}
                    <div className="grid grid-cols-2 gap-4">
                        {currentQuestion?.options.map((option, index) => (
                            <div
                                key={index}
                                className={`p-6 rounded-xl text-xl font-semibold text-center transition-all ${isShowingAnswer && index === currentQuestion.correctAnswer
                                        ? 'bg-green-500 text-white ring-4 ring-green-300'
                                        : 'bg-white/10 text-white border border-white/20'
                                    }`}
                            >
                                {option}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Player Status Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Answer Status */}
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                        <h3 className="text-xl font-bold text-white mb-4">
                            答題狀態 ({answeredPlayers.length}/{players.filter(p => !p.is_host).length})
                        </h3>
                        <div className="grid grid-cols-3 gap-2">
                            {players.filter(p => !p.is_host).map((player) => (
                                <div
                                    key={player.id}
                                    className={`p-2 rounded-lg text-center transition-all ${answeredPlayers.includes(player.id)
                                            ? 'bg-green-500/30 border border-green-500'
                                            : 'bg-white/5 border border-white/10'
                                        }`}
                                >
                                    <div className="text-2xl">{player.avatar}</div>
                                    <div className="text-white text-sm truncate">{player.username}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Leaderboard */}
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                        <h3 className="text-xl font-bold text-white mb-4">排行榜</h3>
                        <div className="space-y-2">
                            {players.slice(0, 5).map((player, index) => (
                                <div
                                    key={player.id}
                                    className="flex items-center gap-3 bg-white/5 rounded-lg p-2"
                                >
                                    <div className={`text-2xl ${index === 0 ? 'text-yellow-400' :
                                            index === 1 ? 'text-gray-300' :
                                                index === 2 ? 'text-amber-600' : 'text-gray-500'
                                        }`}>
                                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                                    </div>
                                    <div className="text-2xl">{player.avatar}</div>
                                    <div className="flex-grow text-white truncate">{player.username}</div>
                                    <div className="text-orange-400 font-bold">{player.score}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Next Button */}
                {isShowingAnswer && (
                    <button
                        onClick={handleNextQuestion}
                        className="w-full mt-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-6 px-8 rounded-2xl text-2xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                        {currentQuestionIndex >= totalQuestions - 1 ? '🏆 查看結果' : '➡️ 下一題'}
                    </button>
                )}
            </div>
        </div>
    );
}
