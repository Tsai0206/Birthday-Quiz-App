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
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold p-3 rounded-full shadow-lg transition-all hover:scale-110"
                title={isPlaying ? 'Pause Music' : 'Play Music'}
            >
                {isPlaying ? '⏸️' : '🎵'}
            </button>
            <button
                onClick={toggleMute}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold p-3 rounded-full shadow-lg transition-all hover:scale-110"
                title={isMuted ? 'Unmute' : 'Mute'}
            >
                {isMuted ? '🔇' : '🔊'}
            </button>
        </div>
    );
}
