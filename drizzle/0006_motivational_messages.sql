CREATE TABLE IF NOT EXISTS "motivational_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"message" text NOT NULL,
	"min_percentage" integer DEFAULT 0 NOT NULL,
	"max_percentage" integer DEFAULT 100 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now()
);

-- Seed initial motivational messages
INSERT INTO motivational_messages (message, min_percentage, max_percentage, is_active) VALUES
-- 0% (Not Started)
('New day, new energy. Let''s start!', 0, 0, true),
('A small step is better than no step. Let''s go!', 0, 0, true),
('Don''t procrastinate, your goals are waiting.', 0, 0, true),

-- 1% - 25% (Just Started)
('Great start! Keep it moving.', 1, 25, true),
('Momentum is building up. Keep going!', 1, 25, true),

-- 26% - 50% (Making Progress)
('You are on the right track.', 26, 50, true),
('Solid progress for today.', 26, 50, true),

-- 51% - 80% (Over the Hump)
('Awesome! You are more than halfway there.', 51, 80, true),
('Just a bit more! Don''t slow down.', 51, 80, true),

-- 81% - 99% (Almost There)
('Almost at the finish line! One last push.', 81, 99, true),
('Victory is in sight for today.', 81, 99, true),

-- 100% (Completed)
('Perfect! You conquered the day.', 100, 100, true),
('Outstanding! You earned your rest.', 100, 100, true),
('Consistency is key, and you nailed it!', 100, 100, true);
