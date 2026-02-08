-- ==========================================
-- 🎮 Birthday Quiz Game - Complete Database Schema
-- ==========================================
-- For FRESH Supabase projects (no existing tables)

-- ==========================================
-- 1. GAMES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code VARCHAR(6) UNIQUE NOT NULL,
  host_id UUID,
  status VARCHAR(20) DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished')),
  current_question_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 2. PLAYERS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  username VARCHAR(50) NOT NULL,
  avatar VARCHAR(100),
  personal_quote TEXT,
  score INTEGER DEFAULT 0,
  is_host BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_username_per_game UNIQUE(game_id, username)
);

-- ==========================================
-- 3. ANSWERS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  question_index INTEGER NOT NULL,
  selected_option INTEGER,
  is_correct BOOLEAN,
  time_taken DECIMAL(5,2),
  points_earned INTEGER,
  answered_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_answer_per_question UNIQUE(player_id, question_index)
);

-- ==========================================
-- 4. OPTION_SHUFFLES TABLE (Anti-Cheating)
-- ==========================================
CREATE TABLE IF NOT EXISTS option_shuffles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  question_index INTEGER NOT NULL,
  shuffled_order INTEGER[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_shuffle_per_question UNIQUE(player_id, question_index)
);

-- ==========================================
-- 5. TRIGGERS
-- ==========================================

-- Auto-update games.updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_games_modtime
BEFORE UPDATE ON games
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- ==========================================
-- 6. FUNCTIONS
-- ==========================================

-- Atomic score increment (prevents race conditions)
CREATE OR REPLACE FUNCTION increment_score(player_id_param UUID, points_param INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE players
  SET score = score + points_param
  WHERE id = player_id_param;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 7. ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE option_shuffles ENABLE ROW LEVEL SECURITY;

-- Create public access policies (for casual party game)
CREATE POLICY "Allow all operations on games"
  ON games FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on players"
  ON players FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on answers"
  ON answers FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on option_shuffles"
  ON option_shuffles FOR ALL
  USING (true)
  WITH CHECK (true);

-- ==========================================
-- 8. REALTIME SUBSCRIPTIONS
-- ==========================================

-- Enable Realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE games;
ALTER PUBLICATION supabase_realtime ADD TABLE players;
ALTER PUBLICATION supabase_realtime ADD TABLE answers;
ALTER PUBLICATION supabase_realtime ADD TABLE option_shuffles;

-- ==========================================
-- 9. INDEXES (Performance Optimization)
-- ==========================================

-- Games
CREATE INDEX idx_games_room_code ON games(room_code);
CREATE INDEX idx_games_status ON games(status);

-- Players
CREATE INDEX idx_players_game_id ON players(game_id);
CREATE INDEX idx_players_score ON players(score DESC);

-- Answers
CREATE INDEX idx_answers_game_id ON answers(game_id);
CREATE INDEX idx_answers_player_id ON answers(player_id);
CREATE INDEX idx_answers_question_index ON answers(question_index);

-- Option Shuffles
CREATE INDEX idx_shuffles_player_id ON option_shuffles(player_id);
CREATE INDEX idx_shuffles_question_index ON option_shuffles(question_index);

-- ==========================================
-- ✅ MIGRATION COMPLETE!
-- ==========================================
-- All 4 tables created successfully:
--   1. games
--   2. players
--   3. answers
--   4. option_shuffles
--
-- All functions, triggers, indexes, and RLS policies are in place.
-- Realtime is enabled for all tables.
--
-- Next: Click "Table Editor" to verify all tables exist!
