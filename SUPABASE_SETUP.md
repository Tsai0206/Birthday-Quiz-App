# 🔑 Supabase 設置指南

## 步驟 1: 創建 Supabase 項目

1. 訪問 https://supabase.com
2. 點擊 "Start your project"
3. 使用 GitHub 登入
4. 點擊 "New Project"
5. 填寫項目資訊:
   - **Name**: birthday-quiz-game
   - **Database Password**: (設置一個強密碼，記下來)
   - **Region**: 選擇最近的區域 (例如: East US)
6. 點擊 "Create new project"
7. 等待 1-2 分鐘讓項目初始化

## 步驟 2: 獲取 API Keys

項目創建完成後:

1. 在左側選單點擊 **Settings** (齒輪圖標)
2. 點擊 **API**
3. 你會看到:
   - **Project URL**: 類似 `https://xxxxx.supabase.co`
   - **anon public**: 一個很長的 JWT token

## 步驟 3: 配置環境變數

將這些值填入 `.env.local` 文件:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 步驟 4: 創建資料庫表

在 Supabase Dashboard:

1. 點擊左側的 **SQL Editor**
2. 點擊 **New Query**
3. 複製貼上以下 SQL:

```sql
-- 創建 games 表
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code VARCHAR(6) UNIQUE NOT NULL,
  host_id UUID,
  status VARCHAR(20) DEFAULT 'waiting',
  current_question_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 創建 players 表
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  username VARCHAR(50) NOT NULL,
  avatar VARCHAR(100),
  personal_quote TEXT,
  score INTEGER DEFAULT 0,
  is_host BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMP DEFAULT NOW()
);

-- 創建 answers 表
CREATE TABLE answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  question_index INTEGER NOT NULL,
  selected_option INTEGER,
  is_correct BOOLEAN,
  time_taken DECIMAL(5,2),
  points_earned INTEGER,
  answered_at TIMESTAMP DEFAULT NOW()
);

-- 啟用 Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE players;
ALTER PUBLICATION supabase_realtime ADD TABLE answers;
ALTER PUBLICATION supabase_realtime ADD TABLE games;
```

4. 點擊 **Run** 執行 SQL

## 步驟 5: 設置 Row Level Security (RLS)

為了安全，我們需要設置 RLS 政策。在 SQL Editor 執行:

```sql
-- 啟用 RLS
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;

-- 允許所有人讀取
CREATE POLICY "Allow public read access" ON games FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON players FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON answers FOR SELECT USING (true);

-- 允許所有人插入
CREATE POLICY "Allow public insert" ON games FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert" ON players FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert" ON answers FOR INSERT WITH CHECK (true);

-- 允許所有人更新
CREATE POLICY "Allow public update" ON games FOR UPDATE USING (true);
CREATE POLICY "Allow public update" ON players FOR UPDATE USING (true);
```

## ✅ 完成！

現在你的 Supabase 已經設置完成，可以繼續開發了！

---

**需要幫助？** 如果遇到任何問題，請告訴我你的 Supabase URL 和 anon key（我會幫你配置）。
