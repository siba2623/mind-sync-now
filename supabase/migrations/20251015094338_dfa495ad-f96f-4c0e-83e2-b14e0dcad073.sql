-- Fix search path for security functions
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;