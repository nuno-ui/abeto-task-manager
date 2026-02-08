-- Vision Feedback System Migration
-- Enables team members to submit feedback, suggestions, challenges, and questions about the strategic vision

-- Create enum types for feedback
DO $$ BEGIN
  CREATE TYPE vision_feedback_type AS ENUM ('suggestion', 'challenge', 'resource', 'question');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE vision_feedback_status AS ENUM ('pending', 'reviewed', 'accepted', 'declined', 'implemented');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE vision_feedback_topic AS ENUM (
    'agent_autonomy',
    'data_moat',
    'pricing_model',
    'build_vs_buy',
    'three_pillars',
    'human_empowerment',
    'general'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create vision_feedback table
CREATE TABLE IF NOT EXISTS vision_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type vision_feedback_type NOT NULL DEFAULT 'suggestion',
  topic vision_feedback_topic NOT NULL DEFAULT 'general',
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  resource_url TEXT,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name VARCHAR(100),
  author_email VARCHAR(255),
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  status vision_feedback_status NOT NULL DEFAULT 'pending',
  admin_response TEXT,
  upvotes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_vision_feedback_status ON vision_feedback(status);
CREATE INDEX IF NOT EXISTS idx_vision_feedback_type ON vision_feedback(type);
CREATE INDEX IF NOT EXISTS idx_vision_feedback_topic ON vision_feedback(topic);
CREATE INDEX IF NOT EXISTS idx_vision_feedback_created_at ON vision_feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vision_feedback_author ON vision_feedback(author_id);

-- Enable RLS
ALTER TABLE vision_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Anyone authenticated can view non-anonymous feedback, or their own anonymous feedback
CREATE POLICY "vision_feedback_select_policy" ON vision_feedback
  FOR SELECT
  USING (
    NOT is_anonymous
    OR author_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Anyone authenticated can insert feedback
CREATE POLICY "vision_feedback_insert_policy" ON vision_feedback
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Only admins can update feedback (for responses and status changes)
CREATE POLICY "vision_feedback_update_policy" ON vision_feedback
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Only admins can delete feedback
CREATE POLICY "vision_feedback_delete_policy" ON vision_feedback
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Function to increment upvotes (prevents race conditions)
CREATE OR REPLACE FUNCTION increment_vision_feedback_upvotes(feedback_id UUID)
RETURNS vision_feedback AS $$
DECLARE
  result vision_feedback;
BEGIN
  UPDATE vision_feedback
  SET upvotes = upvotes + 1,
      updated_at = now()
  WHERE id = feedback_id
  RETURNING * INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION increment_vision_feedback_upvotes(UUID) TO authenticated;

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_vision_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS vision_feedback_updated_at_trigger ON vision_feedback;
CREATE TRIGGER vision_feedback_updated_at_trigger
  BEFORE UPDATE ON vision_feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_vision_feedback_updated_at();

-- Insert some sample feedback to demonstrate the feature
INSERT INTO vision_feedback (type, topic, title, content, author_name, status, upvotes) VALUES
  ('suggestion', 'pricing_model', 'Consider usage-based pricing for AI features',
   'Instead of flat subscription tiers, we should explore charging based on AI agent usage (per task completed, per lead qualified, etc.). This aligns our incentives with customer outcomes and could be a significant differentiator.',
   'Nuno', 'pending', 3),

  ('challenge', 'agent_autonomy', 'Full autonomy might scare early adopters',
   'While our vision emphasizes full agent autonomy, early enterprise customers may be hesitant. We should consider a "training wheels" mode where agents require human approval for key decisions during an initial period.',
   'Product Team', 'reviewed', 5),

  ('resource', 'data_moat', 'Research on data network effects in SaaS',
   'This article from a]16z explains how data network effects create defensible moats in vertical SaaS. Key insight: proprietary data from customer workflows is more valuable than generic AI improvements.',
   'Strategy Team', 'accepted', 8),

  ('question', 'three_pillars', 'How do we prioritize between pillars?',
   'The three pillars (Data Foundation, Knowledge Generation, Human Empowerment) are all important, but with limited resources, how do we decide which to invest in first? Is there a recommended sequence?',
   'Anonymous', 'pending', 2)
ON CONFLICT DO NOTHING;

COMMENT ON TABLE vision_feedback IS 'Strategic vision feedback from team members - suggestions, challenges, resources, and questions';
