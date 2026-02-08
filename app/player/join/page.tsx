'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { avatarOptions } from '@/lib/game-logic';
import FlowGradientHeroSection from '@/components/ui/flow-gradient-hero-section';

function PlayerJoinContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const code = searchParams.get('code');

    const [step, setStep] = useState(1);
    const [username, setUsername] = useState('');
    const [avatar, setAvatar] = useState('');
    const [quote, setQuote] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!code) {
            router.push('/');
        }
    }, [code, router]);

    const handleJoin = async () => {
        if (!username || !avatar) return;
        setIsLoading(true);

        // Get game ID
        const { data: game, error: gameError } = await supabase
            .from('games')
            .select('id')
            .eq('room_code', code)
            .single();

        if (gameError || !game) {
            alert('遊戲不存在');
            router.push('/');
            return;
        }

        // Insert player
        const { data: player, error: playerError } = await supabase
            .from('players')
            .insert([
                {
                    game_id: game.id,
                    username,
                    avatar,
                    personal_quote: quote,
                    score: 0
                }
            ])
            .select()
            .single();

        if (playerError) {
            console.error(playerError);
            alert('加入失敗');
            setIsLoading(false);
            return;
        }

        // Redirect to lobby
        router.push(`/player/lobby/${code}?playerId=${player.id}`);
    };

    return (
        <div className="min-h-screen p-6 flex flex-col items-center relative overflow-hidden">
            {/* Liquid Gradient Background */}
            <FlowGradientHeroSection />

            {/* Header / Progress */}
            <div className="w-full max-w-md mt-6 mb-8 relative z-10">
                <div className="flex justify-between items-center mb-4 px-2">
                    <button
                        onClick={() => step > 1 && setStep(step - 1)}
                        className={`text-[#264653] p-2 rounded-full hover:bg-black/5 transition-colors ${step === 1 ? 'opacity-0 pointer-events-none' : ''}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                    </button>
                    <div className="font-bold text-[#264653] text-lg">
                        你是誰 ({step}/3)
                    </div>
                    <div className="w-10"></div> {/* Spacer */}
                </div>

                {/* Progress Bar */}
                <div className="h-2 bg-gray-200 rounded-full w-full overflow-hidden">
                    <div
                        className="h-full bg-[#E76F51] transition-all duration-500 rounded-full"
                        style={{ width: `${(step / 3) * 100}%` }}
                    ></div>
                </div>
            </div>

            {/* Main Card */}
            <div className="w-full max-w-md flex-grow flex flex-col relative z-10">
                <div className="card-modern p-8 flex-grow flex flex-col animate-slide-up bg-white/90 backdrop-blur-md">

                    {/* Step 1: Username */}
                    {step === 1 && (
                        <div className="flex flex-col h-full">
                            <h2 className="text-3xl font-black text-[#264653] mb-2 text-center">取一個有趣的名字</h2>
                            <p className="text-gray-400 text-center mb-8">讓大家認識你吧</p>

                            <div className="flex-grow flex items-center justify-center">
                                <input
                                    type="text"
                                    placeholder="輸入暱稱"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    maxLength={10}
                                    className="input-modern text-center text-3xl font-bold p-8 border-4 border-dashed focus:border-solid border-[#E9C46A]"
                                    autoFocus
                                />
                            </div>

                            <button
                                onClick={() => username && setStep(2)}
                                disabled={!username}
                                className={`btn-primary w-full mt-auto ${!username ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                下一步
                            </button>
                        </div>
                    )}

                    {/* Step 2: Avatar */}
                    {step === 2 && (
                        <div className="flex flex-col h-full">
                            <h2 className="text-3xl font-black text-[#264653] mb-2 text-center">選個頭像</h2>
                            <p className="text-gray-400 text-center mb-8">今天的心情是？</p>

                            <div className="grid grid-cols-3 gap-4 mb-8 overflow-y-auto">
                                {avatarOptions.map((a) => (
                                    <button
                                        key={a}
                                        onClick={() => setAvatar(a)}
                                        className={`aspect-square text-4xl flex items-center justify-center rounded-2xl transition-all ${avatar === a
                                                ? 'bg-[#2A9D8F] text-white shadow-lg scale-105'
                                                : 'bg-gray-50 hover:bg-gray-100'
                                            }`}
                                    >
                                        {a}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => avatar && setStep(3)}
                                disabled={!avatar}
                                className={`btn-primary w-full mt-auto ${!avatar ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                下一步
                            </button>
                        </div>
                    )}

                    {/* Step 3: Quote */}
                    {step === 3 && (
                        <div className="flex flex-col h-full">
                            <h2 className="text-3xl font-black text-[#264653] mb-2 text-center">想說的話？</h2>
                            <p className="text-gray-400 text-center mb-8">（選填）給大家的一句話</p>

                            <div className="flex-grow">
                                <div className="bg-gray-50 rounded-3xl p-6 text-center mb-6">
                                    <div className="text-6xl mb-4">{avatar}</div>
                                    <div className="text-2xl font-bold text-[#264653]">{username}</div>
                                </div>

                                <textarea
                                    placeholder="生日快樂！！"
                                    value={quote}
                                    onChange={(e) => setQuote(e.target.value)}
                                    maxLength={50}
                                    className="input-modern resize-none h-32"
                                />
                            </div>

                            <button
                                onClick={handleJoin}
                                disabled={isLoading}
                                className="btn-primary w-full mt-auto flex items-center justify-center gap-2"
                            >
                                {isLoading ? '加入中...' : '準備好了！🚀'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function PlayerJoinPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center relative">
                <FlowGradientHeroSection />
                <div className="text-[#264653] text-xl font-bold relative z-10">載入中...</div>
            </div>
        }>
            <PlayerJoinContent />
        </Suspense>
    );
}
