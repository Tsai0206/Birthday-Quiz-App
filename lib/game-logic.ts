// Sample questions for development
export const sampleQuestions = [
    {
        id: 1,
        question: "Marvin 今年幾歲?",
        options: ["18歲", "19歲", "20歲", "21歲"],
        correctAnswer: 2,
        timeLimit: 30,
        points: 0 // Base points = 0, only speed bonus
    },
    {
        id: 2,
        question: "Marvin 最喜歡的顏色是?",
        options: ["紅色", "藍色", "綠色", "紫色"],
        correctAnswer: 1,
        timeLimit: 30,
        points: 0
    },
    {
        id: 3,
        question: "Marvin 的星座是?",
        options: ["水瓶座", "雙魚座", "牡羊座", "金牛座"],
        correctAnswer: 0,
        timeLimit: 30,
        points: 0
    },
    {
        id: 4,
        question: "Marvin 最喜歡的食物是?",
        options: ["披薩", "壽司", "牛排", "火鍋"],
        correctAnswer: 3,
        timeLimit: 30,
        points: 0
    },
    {
        id: 5,
        question: "Marvin 的興趣是?",
        options: ["運動", "音樂", "繪畫", "閱讀"],
        correctAnswer: 1,
        timeLimit: 30,
        points: 0
    }
];

// Generate random 6-digit room code
export function generateRoomCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Shuffle array (Fisher-Yates algorithm)
export function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Calculate points based on time taken
export function calculatePoints(timeTaken: number, timeLimit: number): number {
    // Max 1000 points for instant answer, decreases with time
    const speedBonus = Math.floor((timeLimit - timeTaken) / timeLimit * 1000);
    return Math.max(0, speedBonus);
}

// Avatar options
export const avatarOptions = [
    "😀", "😎", "🤓", "🥳", "🤩", "😇",
    "🤗", "🥰", "😊", "🙃", "😏", "🤪"
];

// ==========================================
// 🔒 ANTI-CHEATING: Option Shuffle Database Functions
// ==========================================

/**
 * Generate and store shuffled option order for a specific player and question
 * This ensures each player sees options in a different order (anti-cheating)
 * and the order persists across page reloads.
 *
 * @param supabase - Supabase client instance
 * @param playerId - UUID of the player
 * @param questionIndex - Index of the current question
 * @param optionsCount - Number of options for this question
 * @returns Array of shuffled indices (e.g., [2, 0, 3, 1])
 */
export async function generatePlayerShuffle(
    supabase: any,
    playerId: string,
    questionIndex: number,
    optionsCount: number
): Promise<number[]> {
    // Check if shuffle already exists (for page reload scenarios)
    const { data: existing } = await supabase
        .from('option_shuffles')
        .select('shuffled_order')
        .eq('player_id', playerId)
        .eq('question_index', questionIndex)
        .single();

    if (existing) {
        return existing.shuffled_order;
    }

    // Generate new shuffle using Fisher-Yates algorithm
    const indices = Array.from({ length: optionsCount }, (_, i) => i);
    const shuffled = shuffleArray(indices);

    // Store in database
    await supabase
        .from('option_shuffles')
        .insert({
            player_id: playerId,
            question_index: questionIndex,
            shuffled_order: shuffled
        });

    return shuffled;
}

/**
 * Retrieve the shuffled option order for a player and question
 * Used when player reloads the page mid-game.
 *
 * @param supabase - Supabase client instance
 * @param playerId - UUID of the player
 * @param questionIndex - Index of the current question
 * @returns Array of shuffled indices, or null if not found
 */
export async function getPlayerShuffle(
    supabase: any,
    playerId: string,
    questionIndex: number
): Promise<number[] | null> {
    const { data } = await supabase
        .from('option_shuffles')
        .select('shuffled_order')
        .eq('player_id', playerId)
        .eq('question_index', questionIndex)
        .single();

    return data?.shuffled_order || null;
}

/**
 * Apply the shuffle to the options array
 * Converts [A, B, C, D] with shuffle [2, 0, 3, 1] → [C, A, D, B]
 *
 * @param options - Original options array
 * @param shuffledIndices - Shuffled indices from database
 * @returns Shuffled options array
 */
export function applyShuffleToOptions(options: string[], shuffledIndices: number[]): string[] {
    return shuffledIndices.map(index => options[index]);
}

/**
 * Validate player's answer using the original option index
 * Player selected displayIndex 2, but we need to check the original index.
 *
 * @param displayIndex - Index of option as displayed to player (0-3)
 * @param shuffledIndices - The shuffle order from database
 * @param correctAnswer - The original correct answer index
 * @returns true if correct, false otherwise
 */
export function validateShuffledAnswer(
    displayIndex: number,
    shuffledIndices: number[],
    correctAnswer: number
): boolean {
    const originalIndex = shuffledIndices[displayIndex];
    return originalIndex === correctAnswer;
}
