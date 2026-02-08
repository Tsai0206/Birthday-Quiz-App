'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Player } from '@/lib/supabase';
import {
    sampleQuestions,
    calculatePoints,
    generatePlayerShuffle,
    applyShuffleToOptions,
    validateShuffledAnswer
} from '@/lib/game-logic';

interface ShuffledQuestion {
    question: string;
    options: string[];
    shuffledIndices: number[]; // Renamed from originalIndexes for clarity
    correctAnswer: number; // Original correct answer index
    timeLimit: number;
    isSpecial?: boolean; // Flag for special questions
    videoLink?: string; // Optional video link for special questions
    imageUrl?: string; // Optional image for special questions
}

// Random error messages
const getRandomErrorMessage = () => {
    const messages = ["請加油...", "太不了解它了喔", "考倒你了吧", "Oops"];
    return messages[Math.floor(Math.random() * messages.length)];
};

export default function PlayerGamePage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const roomCode = params.code as string;
    const playerId = searchParams.get('playerId');

    const [gameId, setGameId] = useState<string | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [shuffledQuestion, setShuffledQuestion] = useState<ShuffledQuestion | null>(null);
    const [timeLeft, setTimeLeft] = useState(30);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [hasAnswered, setHasAnswered] = useState(false);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [pointsEarned, setPointsEarned] = useState(0);
    const [isTimeout, setIsTimeout] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [rankings, setRankings] = useState<Player[]>([]);
    const [myRank, setMyRank] = useState<number>(0);
    const [totalPlayers, setTotalPlayers] = useState<number>(0);

    // 🔒 Database-backed shuffle for anti-cheating
    const shuffleQuestion = async (questionIndex: number) => {
        const question = sampleQuestions[questionIndex];
        if (!question || !playerId) return null;

        // Generate or retrieve shuffle from database
        const shuffledIndices = await generatePlayerShuffle(
            supabase,
            playerId,
            questionIndex,
            question.options.length
        );

        // Apply shuffle to options
        const shuffledOptions = applyShuffleToOptions(question.options, shuffledIndices);

        return {
            question: question.question,
            options: shuffledOptions,
            shuffledIndices: shuffledIndices, // Store for answer validation
            correctAnswer: question.correctAnswer, // Keep original correct answer
            timeLimit: question.timeLimit,
            isSpecial: (question as any).isSpecial,
            videoLink: (question as any).videoLink,
            imageUrl: (question as any).imageUrl
        };
    };

    useEffect(() => {
        const setupGame = async () => {
            const { data: game } = await supabase.from('games').select('*').eq('room_code', roomCode).single();
            if (!game) { router.push('/'); return; }
            setGameId(game.id);
            setCurrentQuestionIndex(game.current_question_index);

            // Get total player count
            const { data: players } = await supabase.from('players').select('id').eq('game_id', game.id);
            if (players) {
                setTotalPlayers(players.length);
            }

            // Load shuffled question from database
            const shuffled = await shuffleQuestion(game.current_question_index);
            setShuffledQuestion(shuffled);

            const channel = supabase.channel(`player-game-${game.id}`)
                .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'games', filter: `id=eq.${game.id}` }, async (payload: any) => {
                    if (payload.new.status === 'finished') {
                        router.push(`/player/results/${roomCode}?playerId=${playerId}`);
                        return;
                    }
                    if (payload.new.current_question_index !== currentQuestionIndex) {
                        setCurrentQuestionIndex(payload.new.current_question_index);
                        // Load new shuffled question from database
                        const newShuffled = await shuffleQuestion(payload.new.current_question_index);
                        setShuffledQuestion(newShuffled);
                        setTimeLeft(30);
                        setSelectedAnswer(null);
                        setHasAnswered(false);
                        setIsCorrect(null);
                        setPointsEarned(0);
                        setIsTimeout(false);
                        setErrorMessage('');
                        setShowLeaderboard(false);
                        setRankings([]);
                    }
                }).subscribe();
            return () => { supabase.removeChannel(channel); };
        };
        setupGame();
    }, [roomCode, router, playerId]);

    useEffect(() => {
        if (hasAnswered || !shuffledQuestion) return;
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) { clearInterval(timer); if (!hasAnswered) handleTimeout(); return 0; }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [currentQuestionIndex, hasAnswered, shuffledQuestion]);

    // Monitor when all players have answered to show leaderboard
    useEffect(() => {
        if (!gameId || !hasAnswered || totalPlayers === 0) return;

        const checkAllAnswered = async () => {
            // Count answers for current question
            const { data: answers, error } = await supabase
                .from('answers')
                .select('id')
                .eq('game_id', gameId)
                .eq('question_index', currentQuestionIndex);

            if (error) {
                console.error('Error checking answers:', error);
                return;
            }

            // If all players have answered, fetch rankings and show leaderboard
            if (answers && answers.length >= totalPlayers) {
                const { data: players } = await supabase
                    .from('players')
                    .select('*')
                    .eq('game_id', gameId)
                    .order('score', { ascending: false });

                if (players) {
                    setRankings(players);
                    const rank = players.findIndex(p => p.id === playerId) + 1;
                    setMyRank(rank);
                    setShowLeaderboard(true);
                }
            }
        };

        // Check immediately after answering
        checkAllAnswered();

        // Subscribe to answers table to detect when others answer
        const channel = supabase
            .channel(`answers-${gameId}-${currentQuestionIndex}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'answers',
                    filter: `game_id=eq.${gameId}`
                },
                () => {
                    checkAllAnswered();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [gameId, hasAnswered, currentQuestionIndex, totalPlayers, playerId]);

    const handleTimeout = async () => {
        setHasAnswered(true);
        setIsCorrect(false);
        setIsTimeout(true);
        setErrorMessage("你反應很慢耶");
        setPointsEarned(0);
        await supabase.from('answers').insert({
            game_id: gameId,
            player_id: playerId,
            question_index: currentQuestionIndex,
            selected_option: -1,
            is_correct: false,
            time_taken: 30,
            points_earned: 0
        });
    };

    const handleAnswerClick = async (index: number) => {
        if (hasAnswered || !shuffledQuestion || !gameId || !playerId) return;

        // Add haptic feedback for mobile
        if (navigator.vibrate) {
            navigator.vibrate(50); // 50ms vibration
        }

        setSelectedAnswer(index);
        setHasAnswered(true);
        const timeTaken = 30 - timeLeft;

        // Validate answer using database shuffle
        const correct = validateShuffledAnswer(
            index,
            shuffledQuestion.shuffledIndices,
            shuffledQuestion.correctAnswer
        );

        // Special questions (like Matt Rife invitation) don't count for points
        const points = (correct && !shuffledQuestion.isSpecial) ? calculatePoints(timeTaken, 30) : 0;
        setIsCorrect(correct);
        setPointsEarned(points);
        setIsTimeout(false);
        if (!correct) {
            setErrorMessage(getRandomErrorMessage());
        }

        // Get original index for database storage
        const originalIndex = shuffledQuestion.shuffledIndices[index];

        await supabase.from('answers').insert({
            game_id: gameId,
            player_id: playerId,
            question_index: currentQuestionIndex,
            selected_option: originalIndex,
            is_correct: correct,
            time_taken: timeTaken,
            points_earned: points
        });

        if (correct && !shuffledQuestion.isSpecial) {
            await supabase.rpc('increment_score', {
                player_id_param: playerId,
                points_param: points
            });
        }

        // Leaderboard will be shown when all players have answered
        // This is handled by the realtime subscription in useEffect
    };

    if (!shuffledQuestion) return <div className="min-h-screen bg-[#F0FDF4] flex items-center justify-center">載入中...</div>;

    return (
        <div className="min-h-screen bg-[#52B788] flex flex-col p-6 relative overflow-hidden">
            {/* Background Patterns */}
            <div className="absolute top-[-20%] right-[-20%] w-[500px] h-[500px] bg-[#FFFFFF] opacity-10 rounded-full pointer-events-none"></div>

            {/* Top Bar: Progress & Timer */}
            <div className="flex justify-between items-center mb-8 relative z-10">
                <div className="bg-white/20 backdrop-blur-md rounded-full px-4 py-2 text-white font-bold flex items-center gap-2">
                    <span>QUEST</span>
                    <span className="bg-white/30 px-2 rounded text-sm">{currentQuestionIndex + 1}/{sampleQuestions.length}</span>
                </div>

                <div className="relative w-16 h-16 flex items-center justify-center">
                    <svg className="absolute w-full h-full transform -rotate-90">
                        <circle cx="32" cy="32" r="28" stroke="rgba(255,255,255,0.2)" strokeWidth="4" fill="none" />
                        <circle cx="32" cy="32" r="28" stroke="white" strokeWidth="4" fill="none" strokeDasharray={175} strokeDashoffset={175 - (175 * timeLeft / 30)} className="transition-all duration-1000 ease-linear" />
                    </svg>
                    <span className="text-white font-black text-lg">{timeLeft}</span>
                </div>
            </div>

            {/* Question Card */}
            <div className={`bg-white rounded-[2rem] p-8 shadow-2xl mb-6 relative z-10 flex-shrink-0 animate-slide-up ${
                shuffledQuestion.isSpecial ? 'border-4 border-[#E76F51] bg-gradient-to-br from-white to-orange-50' : ''
            }`}>
                {shuffledQuestion.isSpecial && (
                    <div className="text-center mb-4">
                        {shuffledQuestion.imageUrl ? (
                            <div className="mb-2 animate-bounce-in">
                                <img
                                    src={shuffledQuestion.imageUrl}
                                    alt="Special Guest"
                                    className="w-32 h-32 rounded-full object-cover mx-auto shadow-lg border-4 border-[#E76F51]"
                                />
                            </div>
                        ) : (
                            <div className="text-6xl mb-2 animate-bounce-in">🎭</div>
                        )}
                        <div className="text-sm font-bold text-[#E76F51] uppercase tracking-wider">特別邀請</div>
                    </div>
                )}
                <h2 className="text-2xl font-black text-[#264653] text-center leading-relaxed mb-4">
                    {shuffledQuestion.question}
                </h2>
                {shuffledQuestion.isSpecial && shuffledQuestion.videoLink && (
                    <div className="bg-[#F0FDF4] rounded-xl p-4 mt-4">
                        <p className="text-sm text-gray-600 mb-2 text-center">📹 想先看看 Matt Rife 的表演？</p>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(shuffledQuestion.videoLink!);
                                alert('連結已複製！請到瀏覽器貼上觀看 🎬');
                            }}
                            className="w-full bg-[#2A9D8F] text-white font-bold py-2 px-4 rounded-lg hover:bg-[#238276] transition-colors"
                        >
                            📋 複製影片連結
                        </button>
                    </div>
                )}
            </div>

            {/* Options Grid */}
            <div className="flex-grow grid grid-cols-1 gap-4 overflow-y-auto pb-4 z-10">
                {shuffledQuestion.options.map((option, index) => {
                    // Find the correct answer's display position
                    const correctDisplayIndex = shuffledQuestion.shuffledIndices.indexOf(shuffledQuestion.correctAnswer);

                    let statusClass = "bg-white border-b-4 border-gray-200 text-[#264653]";
                    if (hasAnswered) {
                        if (index === correctDisplayIndex) {
                            statusClass = "bg-[#2A9D8F] border-[#264653]/10 text-white ring-4 ring-[#2A9D8F]/30";
                        } else if (index === selectedAnswer && !isCorrect) {
                            statusClass = "bg-[#E76F51] border-red-700 text-white animate-shake";
                        } else {
                            statusClass = "bg-gray-100 text-gray-400 opacity-50";
                        }
                    }

                    return (
                        <button
                            key={index}
                            onClick={() => handleAnswerClick(index)}
                            disabled={hasAnswered}
                            className={`w-full p-6 rounded-2xl text-lg font-bold shadow-lg transition-all transform active:scale-95 flex items-center justify-between group ${statusClass}`}
                        >
                            <span>{option}</span>
                            {hasAnswered && index === correctDisplayIndex && (
                                <span className="bg-white/20 rounded-full p-1">✅</span>
                            )}
                            {hasAnswered && index === selectedAnswer && !isCorrect && (
                                <span className="bg-white/20 rounded-full p-1">❌</span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Feedback Bar */}
            {hasAnswered && (
                <div className={`fixed bottom-0 left-0 w-full p-6 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] animate-slide-up z-20 ${isCorrect ? 'bg-[#2A9D8F]' : isTimeout ? 'bg-[#9CA3AF]' : 'bg-[#E76F51]'
                    }`}>
                    <div className="flex justify-between items-center text-white">
                        <div>
                            <div className="text-sm font-bold opacity-80 uppercase">
                                {isCorrect ? 'CORRECT' : isTimeout ? 'TIME OUT' : 'WRONG'}
                            </div>
                            <div className="text-2xl font-black">
                                {isCorrect ? 'Excellent! 🎉' : isTimeout ? '你反應很慢耶 ⏰' : `${errorMessage} 😅`}
                            </div>
                        </div>
                        {isCorrect && (
                            <div className="bg-white/20 px-4 py-2 rounded-xl font-black text-xl">
                                +{pointsEarned} pts
                            </div>
                        )}
                        {!isCorrect && (
                            <div className="bg-white/20 px-4 py-2 rounded-xl font-black text-xl">
                                0 pts
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Animated Leaderboard Overlay */}
            {showLeaderboard && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 flex items-center justify-center p-6 animate-fade-in">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl animate-flip-in">
                        {/* Header with Status Message */}
                        <div className="text-center mb-6">
                            <div className="text-4xl mb-2">
                                {myRank === 1 ? '👑' : myRank === 2 ? '🥈' : myRank === 3 ? '🥉' : '🎯'}
                            </div>
                            <h3 className="text-2xl font-black text-[#264653] mb-1">
                                {myRank === 1 ? '穩穩領先！' :
                                 myRank === 2 ? '緊追在後！' :
                                 myRank === 3 ? '保持勢頭！' :
                                 myRank <= 5 ? '繼續努力！' : '加油！'}
                            </h3>
                            <p className="text-gray-500 text-sm">
                                你目前排名第 <span className="font-bold text-[#E76F51]">{myRank}</span> 位
                            </p>
                        </div>

                        {/* Top 5 Rankings */}
                        <div className="space-y-2 mb-4">
                            {rankings.slice(0, 5).map((player, index) => {
                                const isMe = player.id === playerId;
                                const rank = index + 1;
                                return (
                                    <div
                                        key={player.id}
                                        className={`flex items-center gap-3 p-3 rounded-xl transition-all animate-slide-in ${
                                            isMe ? 'bg-[#E76F51]/10 border-2 border-[#E76F51] scale-105' : 'bg-gray-50'
                                        }`}
                                        style={{ animationDelay: `${index * 0.1}s` }}
                                    >
                                        <div className={`text-lg font-black w-8 ${
                                            rank === 1 ? 'text-yellow-500' :
                                            rank === 2 ? 'text-gray-400' :
                                            rank === 3 ? 'text-amber-600' : 'text-gray-400'
                                        }`}>
                                            #{rank}
                                        </div>
                                        <div className="text-2xl">{player.avatar}</div>
                                        <div className="flex-grow">
                                            <div className={`font-bold ${isMe ? 'text-[#E76F51]' : 'text-[#264653]'}`}>
                                                {player.username}
                                                {isMe && <span className="ml-2 text-xs">（你）</span>}
                                            </div>
                                        </div>
                                        <div className="text-[#2A9D8F] font-bold text-lg">
                                            {player.score}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={() => setShowLeaderboard(false)}
                            className="w-full bg-gradient-to-r from-[#2A9D8F] to-[#52B788] text-white font-bold py-3 rounded-xl hover:scale-105 transition-transform"
                        >
                            繼續 →
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
