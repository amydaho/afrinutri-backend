-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create meals table
CREATE TABLE IF NOT EXISTS meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ingredients table
CREATE TABLE IF NOT EXISTS ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_id UUID REFERENCES meals(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity NUMERIC,
  unit TEXT,
  calories NUMERIC,
  protein NUMERIC,
  carbs NUMERIC,
  fat NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create nutrition_logs table
CREATE TABLE IF NOT EXISTS nutrition_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_calories NUMERIC DEFAULT 0,
  total_protein NUMERIC DEFAULT 0,
  total_carbs NUMERIC DEFAULT 0,
  total_fat NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Create food_scans table for AI-analyzed food images
CREATE TABLE IF NOT EXISTS food_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  image_url TEXT,
  analysis_result JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_meals_user_id ON meals(user_id);
CREATE INDEX idx_meals_date ON meals(date);
CREATE INDEX idx_ingredients_meal_id ON ingredients(meal_id);
CREATE INDEX idx_nutrition_logs_user_date ON nutrition_logs(user_id, date);
CREATE INDEX idx_food_scans_user_id ON food_scans(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meals_updated_at BEFORE UPDATE ON meals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ingredients_updated_at BEFORE UPDATE ON ingredients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nutrition_logs_updated_at BEFORE UPDATE ON nutrition_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
