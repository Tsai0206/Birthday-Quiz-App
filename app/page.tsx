'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { generateRoomCode } from '@/lib/game-logic';
import BackgroundMusic from '@/components/BackgroundMusic';

export default function Home() {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState('');
  const [isJoinLoading, setIsJoinLoading] = useState(false);
  const [isCreateLoading, setIsCreateLoading] = useState(false);

  // Auto-focus suppression (unchanged)
  useEffect(() => {
    const originalConsoleError = console.error;
    console.error = (...args) => {
      if (args[0] && typeof args[0] === 'string' && args[0].includes('Extra attributes from the server')) {
        return;
      }
      originalConsoleError(...args);
    };
  }, []);

  const handleCreateGame = async () => {
    setIsCreateLoading(true);
    const newRoomCode = generateRoomCode();

    // Create new game in database
    const { data, error } = await supabase
      .from('games')
      .insert([
        {
          room_code: newRoomCode,
          status: 'waiting',
          current_question_index: 0
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating game:', error);
      alert('創建遊戲失敗，請稍後再試');
      setIsCreateLoading(false);
      return;
    }

    if (data) {
      router.push(`/host/lobby/${newRoomCode}`);
    }
  };

  const handleJoinGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode || roomCode.length !== 6) {
      alert('請輸入 6 位數房間代碼');
      return;
    }

    setIsJoinLoading(true);

    const { data: game, error } = await supabase
      .from('games')
      .select('*')
      .eq('room_code', roomCode)
      .single();

    if (error || !game) {
      alert('找不到此房間，請確認代碼');
      setIsJoinLoading(false);
      return;
    }

    router.push(`/player/join?code=${roomCode}`);
  };

  return (
    <div className="min-h-screen bg-[#F0FDF4] flex flex-col relative overflow-hidden">
      {/* Decorative Circles */}
      <div className="absolute top-[-10%] right-[-10%] w-[50vh] h-[50vh] bg-[#2A9D8F]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50vh] h-[50vh] bg-[#E9C46A]/10 rounded-full blur-3xl pointer-events-none" />

      <main className="flex-grow flex flex-col items-center justify-center p-6 relative z-10">

        {/* Logo/Hero Section */}
        <div className="text-center mb-12 animate-slide-up">
          <div className="inline-block bg-white p-2 rounded-full shadow-xl mb-6 transform hover:scale-110 transition-all duration-300 overflow-hidden">
            <img
              src="/pipi.jpg?v=3"
              alt="Pipi the Cat"
              className="w-24 h-24 rounded-full object-cover"
            />
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-[#264653] mb-2 tracking-tight leading-tight">
            <span className="text-[#E76F51]">Marv</span>elous Quiz
          </h1>
          <p className="text-[#264653]/70 text-lg font-medium">
            第一名也沒有獎勵 haha
          </p>
        </div>

        {/* Main Action Card */}
        <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-8 animate-slide-up border-4 border-white" style={{ animationDelay: '0.1s' }}>

          {/* Toggle Tabs (Visual only for now) */}
          <div className="flex bg-gray-100 rounded-2xl p-1 mb-8">
            <button className="flex-1 py-3 rounded-xl bg-white text-[#264653] font-bold shadow-sm text-sm">
              玩家
            </button>
            <button
              onClick={handleCreateGame}
              disabled={isCreateLoading}
              className="flex-1 py-3 rounded-xl text-gray-500 font-bold hover:text-[#264653] transition-colors text-sm"
            >
              主持人
            </button>
          </div>

          {/* Join Form */}
          <form onSubmit={handleJoinGame} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-500 mb-2 ml-1">
                房間代碼
              </label>
              <input
                type="text"
                placeholder="123456"
                maxLength={6}
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                className="input-modern text-center tracking-[0.5em] text-2xl font-black text-[#264653]"
                suppressHydrationWarning
              />
            </div>

            <button
              type="submit"
              disabled={isJoinLoading}
              className="btn-primary w-full text-xl flex justify-center items-center gap-2"
            >
              {isJoinLoading ? (
                <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                '加入遊戲'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-[#264653]/40 text-sm font-medium">
          Powered by Marvin's self-trained AI model 🤖
        </div>

      </main>

      {/* Background Music Player */}
      <BackgroundMusic />
    </div>
  );
}
