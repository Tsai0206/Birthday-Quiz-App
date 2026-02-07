import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    realtime: {
        params: {
            eventsPerSecond: 10
        }
    }
});

// Database types
export interface Game {
    id: string;
    room_code: string;
    host_id: string | null;
    status: 'waiting' | 'playing' | 'finished';
    current_question_index: number;
    created_at: string;
}

export interface Player {
    id: string;
    game_id: string;
    username: string;
    avatar: string;
    personal_quote: string | null;
    score: number;
    is_host: boolean;
    joined_at: string;
}

export interface Answer {
    id: string;
    game_id: string;
    player_id: string;
    question_index: number;
    selected_option: number | null;
    is_correct: boolean;
    time_taken: number;
    points_earned: number;
    answered_at: string;
}

export interface Question {
    id: number;
    question: string;
    options: string[];
    correctAnswer: number;
    timeLimit: number;
    points: number;
}
