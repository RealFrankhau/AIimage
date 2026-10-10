-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create works table
CREATE TABLE IF NOT EXISTS works (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    prompt TEXT NOT NULL,
    negative_prompt TEXT,
    image_path TEXT NOT NULL,
    ai_tool TEXT,
    model_name TEXT,
    style TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    tags TEXT[] NOT NULL DEFAULT '{}',
    image_width INTEGER,
    image_height INTEGER,
    aspect_ratio TEXT,
    seed TEXT,
    parameters JSONB,
    notes TEXT,
    is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for works table
CREATE INDEX IF NOT EXISTS idx_works_user_id ON works(user_id);
CREATE INDEX IF NOT EXISTS idx_works_category_id ON works(category_id);
CREATE INDEX IF NOT EXISTS idx_works_created_at ON works(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_works_updated_at ON works(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_works_is_favorite ON works(is_favorite) WHERE is_favorite = TRUE;
CREATE INDEX IF NOT EXISTS idx_works_ai_tool ON works(ai_tool);
CREATE INDEX IF NOT EXISTS idx_works_style ON works(style);
CREATE INDEX IF NOT EXISTS idx_works_tags ON works USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_works_title_search ON works USING GIN(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_works_prompt_search ON works USING GIN(to_tsvector('english', prompt));

-- Create indexes for categories table
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to works table
DROP TRIGGER IF EXISTS update_works_updated_at ON works;
CREATE TRIGGER update_works_updated_at
    BEFORE UPDATE ON works
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply updated_at trigger to categories table
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE works ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Works table policies
CREATE POLICY "Users can view own works" ON works
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own works" ON works
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own works" ON works
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own works" ON works
    FOR DELETE USING (auth.uid() = user_id);

-- Categories table policies
CREATE POLICY "Users can view own categories" ON categories
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories" ON categories
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories" ON categories
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories" ON categories
    FOR DELETE USING (auth.uid() = user_id);

-- Storage bucket policies will be created separately in Supabase Dashboard
-- See STORAGE_SETUP.md for instructions