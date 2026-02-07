'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
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
}

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
            timeLimit: question.timeLimit
        };
    };

    useEffect(() => {
        const setupGame = async () => {
            const { data: game } = await supabase.from('games').select('*').eq('room_code', roomCode).single();
            if (!game) { router.push('/'); return; }
            setGameId(game.id);
            setCurrentQuestionIndex(game.current_question_index);

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

    const handleTimeout = async () => {
        setHasAnswered(true); setIsCorrect(false);
        await supabase.from('answers').insert({ game_id: gameId, player_id: playerId, question_index: currentQuestionIndex, selected_option: -1, is_correct: false, time_taken: 30, points_earned: 0 });
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

        const points = correct ? calculatePoints(timeTaken, 30) : 0;
        setIsCorrect(correct);
        setPointsEarned(points);

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

        if (correct) {
            await supabase.rpc('increment_score', {
                player_id_param: playerId,
                points_param: points
            });
        }
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
            <div className="bg-white rounded-[2rem] p-8 shadow-2xl mb-6 relative z-10 flex-shrink-0 animate-slide-up">
                <h2 className="text-2xl font-black text-[#264653] text-center leading-relaxed">
                    {shuffledQuestion.question}
                </h2>
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
                <div className={`fixed bottom-0 left-0 w-full p-6 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] animate-slide-up z-20 ${isCorrect ? 'bg-[#2A9D8F]' : 'bg-[#E76F51]'
                    }`}>
                    <div className="flex justify-between items-center text-white">
                        <div>
                            <div className="text-sm font-bold opacity-80 uppercase">RESULT</div>
                            <div className="text-2xl font-black">{isCorrect ? 'Excellent! 🎉' : 'Oops! 😅'}</div>
                        </div>
                        {isCorrect && (
                            <div className="bg-white/20 px-4 py-2 rounded-xl font-black text-xl">
                                +{pointsEarned} pts
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
