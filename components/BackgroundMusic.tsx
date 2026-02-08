'use client';

import { useEffect, useRef, useState } from 'react';

export default function BackgroundMusic() {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = 0.3; // Set volume to 30%
        }
    }, []);

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play().catch(err => console.log('Audio play failed:', err));
            }
            setIsPlaying(!isPlaying);
        }
    };

    const toggleMute = () => {
        if (audioRef.current) {
            audioRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-50 flex gap-2">
            <audio
                ref={audioRef}
                src="/music/yuno-miles.mp3" // You need to add your music file here
                loop
                onEnded={() => setIsPlaying(false)}
            />
            <button
                onClick={togglePlay}
                className="bg-gradient-to-r from-[#2A9D8F] to-[#52B788] hover:from-[#248276] hover:to-[#42A678] text-white font-bold p-3 rounded-full shadow-lg transition-all hover:scale-110"
                title={isPlaying ? 'Pause Music' : 'Play Music'}
            >
                {isPlaying ? '⏸️' : '🎵'}
            </button>
            <button
                onClick={toggleMute}
                className="bg-gradient-to-r from-[#E76F51] to-[#E9C46A] hover:from-[#D55F41] hover:to-[#D9B45A] text-white font-bold p-3 rounded-full shadow-lg transition-all hover:scale-110"
                title={isMuted ? 'Unmute' : 'Mute'}
            >
                {isMuted ? '🔇' : '🔊'}
            </button>
        </div>
    );
}
