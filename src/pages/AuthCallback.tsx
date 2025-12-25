import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          setError(error.message);
          return;
        }

        if (data.session) {
          // Get redirect path from session storage or default to home
          const redirectTo = sessionStorage.getItem('authRedirect') || '/';
          sessionStorage.removeItem('authRedirect');
          navigate(redirectTo, { replace: true });
        } else {
          // No session, redirect to auth page
          navigate('/auth', { replace: true });
        }
      } catch (err) {
        setError('An unexpected error occurred');
      }
    };

    handleCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
        <p className="text-destructive text-center">{error}</p>
        <button
          onClick={() => navigate('/auth')}
          className="text-primary underline"
        >
          Back to login
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}
