-- Create profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create trigger function for new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create mood_entries table
CREATE TABLE public.mood_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  mood_value int NOT NULL CHECK (mood_value >= 1 AND mood_value <= 5),
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS on mood_entries
ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;

-- Mood entries policies
CREATE POLICY "Users can view own mood entries"
  ON public.mood_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mood entries"
  ON public.mood_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create activities table
CREATE TABLE public.activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  duration text NOT NULL,
  description text NOT NULL,
  icon_name text NOT NULL,
  color_gradient text NOT NULL,
  best_for text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS on activities (public read)
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view activities"
  ON public.activities FOR SELECT
  USING (true);

-- Insert default activities
INSERT INTO public.activities (title, duration, description, icon_name, color_gradient, best_for) VALUES
  ('Deep Breathing', '2 min', 'Calm your nervous system with box breathing technique', 'Wind', 'from-blue-400 to-cyan-400', 'Anxiety, Stress'),
  ('Quick Stretch', '3 min', 'Release physical tension with gentle body movements', 'Zap', 'from-green-400 to-emerald-400', 'Low energy, Tension'),
  ('Calming Sounds', '2 min', 'Listen to nature sounds to ground yourself', 'Music', 'from-purple-400 to-pink-400', 'Overwhelm, Restlessness'),
  ('Gratitude Moment', '2 min', 'Shift perspective by noting three good things', 'Heart', 'from-rose-400 to-orange-400', 'Low mood, Negativity');

-- Create activity_completions table
CREATE TABLE public.activity_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  activity_id uuid REFERENCES public.activities(id) ON DELETE CASCADE NOT NULL,
  completed_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS on activity_completions
ALTER TABLE public.activity_completions ENABLE ROW LEVEL SECURITY;

-- Activity completions policies
CREATE POLICY "Users can view own completions"
  ON public.activity_completions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own completions"
  ON public.activity_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own completions"
  ON public.activity_completions FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_mood_entries_user_id ON public.mood_entries(user_id);
CREATE INDEX idx_mood_entries_created_at ON public.mood_entries(created_at DESC);
CREATE INDEX idx_activity_completions_user_id ON public.activity_completions(user_id);
CREATE INDEX idx_activity_completions_activity_id ON public.activity_completions(activity_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Add trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();