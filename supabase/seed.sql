-- Seed data for development
-- Insert a test user
INSERT INTO users (id, email, name) VALUES 
  ('00000000-0000-0000-0000-000000000001', 'test@example.com', 'Test User')
ON CONFLICT (email) DO NOTHING;

-- Insert sample meals
INSERT INTO meals (id, user_id, name, date, meal_type) VALUES 
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'Breakfast', CURRENT_DATE, 'breakfast'),
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'Lunch', CURRENT_DATE, 'lunch')
ON CONFLICT DO NOTHING;

-- Insert sample ingredients
INSERT INTO ingredients (meal_id, name, quantity, unit, calories, protein, carbs, fat) VALUES 
  ('00000000-0000-0000-0000-000000000010', 'Oatmeal', 100, 'g', 389, 16.9, 66.3, 6.9),
  ('00000000-0000-0000-0000-000000000010', 'Banana', 1, 'piece', 105, 1.3, 27, 0.4),
  ('00000000-0000-0000-0000-000000000011', 'Chicken Breast', 200, 'g', 330, 62, 0, 7.2),
  ('00000000-0000-0000-0000-000000000011', 'Rice', 150, 'g', 195, 4.1, 43, 0.4)
ON CONFLICT DO NOTHING;
