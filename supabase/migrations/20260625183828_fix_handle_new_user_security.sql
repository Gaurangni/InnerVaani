/*
# Fix handle_new_user security vulnerabilities

1. Changes
   - Set explicit `search_path = ''` on `handle_new_user` to prevent search_path hijacking
   - Revoke EXECUTE on `handle_new_user()` from `anon` and `authenticated` roles
     (it is a trigger function — only the trigger itself should invoke it, not API callers)

2. Security
   - Fixes "Function Search Path Mutable" by pinning search_path to empty string
     and using fully-qualified names (public.profiles, auth.uid, etc.)
   - Fixes "Public/Authenticated Can Execute SECURITY DEFINER Function" by
     revoking direct EXECUTE privilege from both roles
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;
