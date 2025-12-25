import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';

interface SocialLoginButtonsProps {
  onSocialLogin?: (provider: string) => void;
  disabled?: boolean;
}

const SocialLoginButtons = ({ onSocialLogin, disabled }: SocialLoginButtonsProps) => {
  const { t } = useTranslation();

  const handleSocialLogin = async (provider: string) => {
    if (provider === 'Google') {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
            },
          },
        });
        if (error) throw error;
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to login with Google';
        toast.error(message);
      }
    } else if (provider === 'LINE') {
      // LINE Login - Using LINE Login API
      // Note: LINE is not a built-in Supabase provider, so we use custom OAuth flow
      try {
        // LINE Login Channel ID should be configured in environment
        const lineChannelId = import.meta.env.VITE_LINE_CHANNEL_ID;

        if (!lineChannelId) {
          toast.info(t('socialLogin.lineNotConfigured', 'LINE Login is being configured'));
          return;
        }

        const redirectUri = encodeURIComponent(`${window.location.origin}/auth/callback?provider=line`);
        const state = crypto.randomUUID(); // CSRF protection
        sessionStorage.setItem('line_auth_state', state);

        const lineAuthUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${lineChannelId}&redirect_uri=${redirectUri}&state=${state}&scope=profile%20openid%20email`;

        window.location.href = lineAuthUrl;
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to login with LINE';
        toast.error(message);
      }
    } else {
      toast.info(t('socialLogin.comingSoon', { provider }));
    }
  };

  return (
    <div className="space-y-3">
      {/* LINE - Primary for Thai users */}
      <Button
        variant="outline"
        className="w-full h-12 gap-3 text-sm font-medium bg-[#00B900] hover:bg-[#00A000] text-white border-[#00B900] hover:border-[#00A000]"
        onClick={() => handleSocialLogin('LINE')}
        disabled={disabled}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.349 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
        </svg>
        {t('socialLogin.continueWith', { provider: 'LINE' })}
      </Button>

      {/* Google */}
      <Button
        variant="outline"
        className="w-full h-12 gap-3 text-sm font-medium"
        onClick={() => handleSocialLogin('Google')}
        disabled={disabled}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        {t('socialLogin.continueWith', { provider: 'Google' })}
      </Button>

      {/* Facebook */}
      <Button
        variant="outline"
        className="w-full h-12 gap-3 text-sm font-medium"
        onClick={() => handleSocialLogin('Facebook')}
        disabled={disabled}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
        {t('socialLogin.continueWith', { provider: 'Facebook' })}
      </Button>

      {/* Apple */}
      <Button
        variant="outline"
        className="w-full h-12 gap-3 text-sm font-medium"
        onClick={() => handleSocialLogin('Apple')}
        disabled={disabled}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
        </svg>
        {t('socialLogin.continueWith', { provider: 'Apple' })}
      </Button>
    </div>
  );
};

export default SocialLoginButtons;
