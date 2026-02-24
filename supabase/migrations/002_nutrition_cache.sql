-- Create nutrition cache table for storing verified nutrition data
CREATE TABLE IF NOT EXISTS nutrition_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  food_name TEXT NOT NULL,
  food_name_normalized TEXT NOT NULL, -- lowercase, trimmed for searching
  calories NUMERIC NOT NULL,
  protein NUMERIC NOT NULL,
  carbs NUMERIC NOT NULL,
  fat NUMERIC NOT NULL,
  fiber NUMERIC DEFAULT 0,
  serving_size NUMERIC DEFAULT 100, -- in grams
  data_source TEXT, -- 'Open Food Facts', 'USDA', 'User Verified', etc.
  verified BOOLEAN DEFAULT FALSE,
  times_used INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(food_name_normalized)
);

-- Create index for fast searching
CREATE INDEX idx_nutrition_cache_name ON nutrition_cache(food_name_normalized);
CREATE INDEX idx_nutrition_cache_verified ON nutrition_cache(verified);
CREATE INDEX idx_nutrition_cache_times_used ON nutrition_cache(times_used DESC);

-- Add trigger for updated_at
CREATE TRIGGER update_nutrition_cache_updated_at BEFORE UPDATE ON nutrition_cache
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to increment times_used
CREATE OR REPLACE FUNCTION increment_nutrition_cache_usage(cache_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE nutrition_cache
  SET times_used = times_used + 1
  WHERE id = cache_id;
END;
$$ LANGUAGE plpgsql;
