// Marvin 24歲生日問答題庫
export const sampleQuestions = [
    // ==== 第 1 階段：基本送分題 ====
    {
        id: 1,
        question: "Marvin 就讀科系全名是？(看清楚呦)",
        options: [
            "Biomedical Engineering",
            "Biochemical Engineering",
            "BioEnginearing",
            "Biomedical Imagineering"
        ],
        correctAnswer: 0,
        timeLimit: 30,
        points: 0
    },
    {
        id: 2,
        question: "Marvin 人生中在哪個城市「生活最久」？",
        options: ["廣東", "彰化", "台南", "台中"],
        correctAnswer: 1,
        timeLimit: 30,
        points: 0
    },
    {
        id: 3,
        question: "Marvin 不理解哪種語言？",
        options: ["英語", "日語", "粵語", "台語"],
        correctAnswer: 1,
        timeLimit: 30,
        points: 0
    },
    {
        id: 4,
        question: "Marvin 似乎跳過舞，請問舞風是？",
        options: ["廣場舞", "Hip Hop", "High Heels", "Popping"],
        correctAnswer: 1,
        timeLimit: 30,
        points: 0
    },
    {
        id: 5,
        question: "Marvin 兄弟姊妹年齡比他？",
        options: [
            "弟弟小一歲，妹妹小九歲",
            "弟弟小一歲，妹妹小五歲",
            "哥哥大一歲，妹妹小五歲",
            "哥哥大一歲，沒有妹妹"
        ],
        correctAnswer: 0,
        timeLimit: 30,
        points: 0
    },
    {
        id: 6,
        question: "Marvin 最愛穿什麼衣服？",
        options: ["Skinny", "Oversize", "8+9", "Nudist"],
        correctAnswer: 1,
        timeLimit: 30,
        points: 0
    },
    {
        id: 7,
        question: "Marvin 被別人說長得像哪位人？",
        options: ["許光漢", "陶喆", "趙雨凡", "兩津勘吉"],
        correctAnswer: 1,
        timeLimit: 30,
        points: 0
    },

    // ==== 第 2 階段：生活習慣與技能 ====
    {
        id: 8,
        question: "Marvin 平均都在幾點「入睡」？",
        options: [
            "10:00 PM - 12:00 AM",
            "12:00 AM - 2:00 AM",
            "2:00 AM - 4:00 AM",
            "4:00 AM - 6:00 AM"
        ],
        correctAnswer: 2,
        timeLimit: 30,
        points: 0
    },
    {
        id: 9,
        question: "Marvin 去上課的時候最討厭？",
        options: [
            "錯過公車上課遲到",
            "書包太重腰酸背痛",
            "根本就不想上實體課",
            "B'more爛路暈車暈爛"
        ],
        correctAnswer: 1,
        timeLimit: 30,
        points: 0
    },
    {
        id: 10,
        question: "自己一個人的時候，Marvin 最常煮什麼？",
        options: ["麻婆豆腐", "泡麵加蛋", "馬鈴薯燉肉", "玉米濃湯"],
        correctAnswer: 2,
        timeLimit: 30,
        points: 0
    },
    {
        id: 11,
        question: "屁屁(我的貓)為甚麼叫屁屁",
        options: [
            "他小時候屁股特別肥",
            "他小時候很愛睡在我屁股旁邊",
            "領養前就叫屁屁了沒有改",
            "她小時候喜歡被拍屁屁"
        ],
        correctAnswer: 1,
        timeLimit: 30,
        points: 0
    },
    {
        id: 12,
        question: "身為台灣人，Marvin 最愛的飲料是？",
        options: ["珍珠奶茶", "芭樂綠茶", "可口可樂", "豆漿紅茶"],
        correctAnswer: 2,
        timeLimit: 30,
        points: 0
    },
    {
        id: 13,
        question: "Marvin 在哪款遊戲上課金最多？",
        options: ["Fortnite", "League of Legends", "Valorant", "Marvel Snap"],
        correctAnswer: 2,
        timeLimit: 30,
        points: 0
    },
    {
        id: 14,
        question: "以下什麼事會讓 Marvin 心裡最煩躁？",
        options: [
            "屁屁半夜五點吵我睡覺",
            "遇到超雷Project組員",
            "約吃飯朋友遲到一小時",
            "事情跟預期計畫不一樣"
        ],
        correctAnswer: 3,
        timeLimit: 30,
        points: 0
    },

    // ==== 第 3 階段：腦洞與消費 ====
    {
        id: 15,
        question: "Marvin 買Groceries的習慣是？",
        options: ["斤斤計較", "一次囤夠", "有機食品", "選擇困難"],
        correctAnswer: 1,
        timeLimit: 30,
        points: 0
    },
    {
        id: 16,
        question: "Marvin 最喜歡以下哪位歌手",
        options: [
            "XXXTentacion",
            "Kendrick Lamar",
            "Don Toliver",
            "Drake"
        ],
        correctAnswer: 0,
        timeLimit: 30,
        points: 0
    },
    {
        id: 17,
        question: "Marvin 會選一個超能力，絕對會選？",
        options: ["隱身術", "讀心術", "瞬間移動", "力大無窮"],
        correctAnswer: 2,
        timeLimit: 30,
        points: 0
    },
    {
        id: 18,
        question: "這個問答網站，Marvin 花了多久做出來(w/ Claude Code)？",
        options: [
            "1 week",
            "He copied and stole it from others",
            "1 day",
            "3 days"
        ],
        correctAnswer: 2,
        timeLimit: 30,
        points: 0
    },
    {
        id: 19,
        question: "Marvin 是甚麼的忠實粉絲?",
        options: [
            "日本AV女優",
            "NMIXX",
            "MARVEL Movies",
            "DC Films"
        ],
        correctAnswer: 2,
        timeLimit: 30,
        points: 0
    },

    // ==== 第 4 階段：搞事與爆料 ====
    {
        id: 20,
        question: "喝醉酒的 Marvin 會變成？",
        options: [
            "Sleep/Play dead",
            "English Native Speaker",
            "Become a Psychopath",
            "Never drunk before"
        ],
        correctAnswer: 0,
        timeLimit: 30,
        points: 0
    },
    {
        id: 21,
        question: "最符合我自傳的書名",
        options: [
            "《論如何一事無成，卻依然高度自信》",
            "《從入門到放棄：半途而廢的 100 件事》",
            "《我買的不是廢物，是當下的快樂》",
            "《我下次一定準時》"
        ],
        correctAnswer: 1,
        timeLimit: 30,
        points: 0
    },
    {
        id: 22,
        question: "下列關於 Marvin 的敘述，哪一個是真？",
        options: [
            "我其實討厭貓咪",
            "我其實是Gay",
            "我其實想當黑人",
            "我其實休學過"
        ],
        correctAnswer: 2,
        timeLimit: 30,
        points: 0
    },
    {
        id: 23,
        question: "Marvin 為甚麼失眠是因為?",
        options: [
            "Super horny",
            "Can't stop thinking",
            "Non-stop Instagram Reels",
            "No special reason"
        ],
        correctAnswer: 1,
        timeLimit: 30,
        points: 0
    },
    {
        id: 24,
        question: "在 Baltimore 生活過後，Marvin 進步最多技能是？",
        options: [
            "很會Small talk",
            "東不怕西不怕",
            "聽懂 Baltimore 腔調",
            "口齒清晰 會區分捲舌音了"
        ],
        correctAnswer: 1,
        timeLimit: 30,
        points: 0
    },

    // ==== 第 5 階段：最終大獎 ====
    {
        id: 25,
        question: "Marvin 最近一筆「大額消費」是為了什麼",
        options: [
            "AI tokens 年費",
            "遊戲課金買造型",
            "DC脫口秀門票",
            "墨西哥機票"
        ],
        correctAnswer: 2,
        timeLimit: 30,
        points: 0
    },

    // ==== 特別邀請 ====
    {
        id: 26,
        question: "3/1 禮拜日晚上7點 MATT RIFE 脫口秀世界巡迴想去嗎?",
        options: ["是", "否", "看看影片再決定"],
        correctAnswer: 0,
        timeLimit: 60,
        points: 0,
        isSpecial: true,
        videoLinks: [
            "https://youtu.be/mvUW8KGolMI?si=OwRht4wDGUh1NmqL",
            "https://youtu.be/ZSIfh5GAx-k?si=2mjHIeKeXszFTChw"
        ],
        imageUrl: "/mattrife.png"
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

// Avatar options (20+ fun emojis)
export const avatarOptions = [
    "😀", "😎", "🤓", "🥳", "🤩", "😇",
    "🤗", "🥰", "😊", "🙃", "😏", "🤪",
    "🤡", "👻", "👽", "🤖", "💩", "🦄",
    "🐶", "🐱", "🐼", "🦊", "🐸", "🦁",
    "🌟", "⚡", "🔥", "💎", "🎭", "🎪"
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
