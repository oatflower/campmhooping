import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trees, Mail, ArrowLeft, Loader2, User, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import SocialLoginButtons from '@/components/SocialLoginButtons';
import { supabase } from '@/lib/supabase';

type AuthStep = 'email' | 'register' | 'login' | 'otp';

const Auth = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const returnTo = location.state?.returnTo || '/';
  const bookingData = location.state?.bookingData;

  const [step, setStep] = useState<AuthStep>('email');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isNewUser, setIsNewUser] = useState(false);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // After email entry, go to register step (user can switch to login if needed)
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error(t('auth.invalidEmail', 'Please enter a valid email'));
      return;
    }

    // Default to register, user can switch to login
    setStep('register');
  };

  // Handle registration
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !password) return;

    if (password.length < 6) {
      toast.error(t('auth.passwordTooShort', 'Password must be at least 6 characters'));
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (error) throw error;

      // Check if user already exists (empty identities array)
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        toast.error(t('auth.userExists', 'Account already exists. Please login.'));
        setStep('login');
        return;
      }

      // Send OTP for verification
      await supabase.auth.signInWithOtp({ email });

      setStep('otp');
      setCountdown(60);
      toast.success(t('auth.otpSent', 'Verification code sent to your email'));
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle login with password
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // If email not confirmed, send OTP for verification
        if (error.message.includes('Email not confirmed')) {
          await supabase.auth.signInWithOtp({ email });
          setStep('otp');
          setCountdown(60);
          toast.info(t('auth.emailNotConfirmed', 'Please verify your email. Code sent!'));
          setTimeout(() => otpRefs.current[0]?.focus(), 100);
          return;
        }
        throw error;
      }

      if (data.session) {
        toast.success(t('auth.loginSuccess', 'Login successful!'));
        navigate(returnTo, {
          state: bookingData ? { booking: bookingData } : undefined,
        });
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Login failed';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
    if (newOtp.every(d => d) && newOtp.join('').length === 6) handleOtpSubmit(newOtp.join(''));
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus();
  };

  const handleOtpSubmit = async (code: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'email',
      });

      if (error) throw error;

      if (data.session) {
        toast.success(t('auth.registerSuccess', 'Account created successfully!'));
        navigate(returnTo, {
          state: bookingData ? { booking: bookingData } : undefined,
        });
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : t('auth.invalidOtp', 'Invalid code');
      toast.error(message);
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;
      setCountdown(60);
      toast.success(t('auth.otpResent', 'Code resent'));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to resend';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'otp') setStep('register');
    else if (step === 'register' || step === 'login') {
      setStep('email');
      setPassword('');
      setName('');
    }
    else navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-forest/5 via-background to-background flex flex-col">
      {/* Header */}
      <header className="p-4">
        <Button variant="ghost" size="icon" onClick={handleBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-forest to-forest-dark flex items-center justify-center mb-4 shadow-lg shadow-forest/20">
              <Trees className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">CampThai</h1>
          </div>

          <AnimatePresence mode="wait">
            {/* Step 1: Email */}
            {step === 'email' && (
              <motion.div key="email" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <div className="text-center mb-8">
                  <h2 className="text-xl font-semibold text-foreground mb-2">{t('auth.welcome', 'Welcome')}</h2>
                  <p className="text-muted-foreground">{t('auth.enterEmailToContinue', 'Enter your email to continue')}</p>
                </div>
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder={t('auth.yourEmail', 'Your email')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-12 h-14 rounded-xl text-base"
                      autoFocus
                    />
                  </div>
                  <Button type="submit" variant="booking" size="lg" className="w-full" disabled={isLoading || !email}>
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('auth.continue', 'Continue')}
                  </Button>
                </form>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">{t('common.or', 'or')}</span></div>
                </div>
                <SocialLoginButtons disabled={isLoading} />
                <p className="text-center text-xs text-muted-foreground mt-6">
                  {t('auth.termsAccept', 'By continuing, you agree to our')} <a href="#" className="text-primary hover:underline">{t('auth.termsOfUse', 'Terms')}</a> {t('auth.and', 'and')} <a href="#" className="text-primary hover:underline">{t('auth.privacyPolicy', 'Privacy Policy')}</a>
                </p>
              </motion.div>
            )}

            {/* Step 2a: Register (New User) */}
            {step === 'register' && (
              <motion.div key="register" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="text-center mb-8">
                  <h2 className="text-xl font-semibold text-foreground mb-2">{t('auth.createAccount', 'Create Account')}</h2>
                  <p className="text-muted-foreground">{t('auth.enterDetails', 'Enter your details to register')}</p>
                  <p className="text-sm text-foreground mt-2">{email}</p>
                </div>
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder={t('auth.yourName', 'Your name')}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-12 h-14 rounded-xl text-base"
                      autoFocus
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder={t('auth.createPassword', 'Create password')}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-12 pr-12 h-14 rounded-xl text-base"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">{t('auth.passwordRequirement', 'At least 6 characters')}</p>
                  <Button type="submit" variant="booking" size="lg" className="w-full" disabled={isLoading || !name || !password}>
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('auth.registerAccount', 'Register Account')}
                  </Button>
                </form>
                <p className="text-center text-sm text-muted-foreground mt-4">
                  {t('auth.alreadyHaveAccount', 'Already have an account?')}{' '}
                  <button onClick={() => setStep('login')} className="text-primary hover:underline font-medium">
                    {t('auth.login', 'Login')}
                  </button>
                </p>
              </motion.div>
            )}

            {/* Step 2b: Login (Existing User) */}
            {step === 'login' && (
              <motion.div key="login" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="text-center mb-8">
                  <h2 className="text-xl font-semibold text-foreground mb-2">{t('auth.welcomeBack', 'Welcome Back')}</h2>
                  <p className="text-muted-foreground">{t('auth.enterPassword', 'Enter your password to login')}</p>
                  <p className="text-sm text-foreground mt-2">{email}</p>
                </div>
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder={t('auth.password', 'Password')}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-12 pr-12 h-14 rounded-xl text-base"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <Button type="submit" variant="booking" size="lg" className="w-full" disabled={isLoading || !password}>
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('auth.login', 'Login')}
                  </Button>
                </form>
                <div className="text-center mt-4 space-y-2">
                  <Button
                    variant="link"
                    className="text-primary"
                    onClick={async () => {
                      setIsLoading(true);
                      try {
                        await supabase.auth.resetPasswordForEmail(email);
                        toast.success(t('auth.resetEmailSent', 'Password reset email sent'));
                      } catch {
                        toast.error('Failed to send reset email');
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                  >
                    {t('auth.forgotPassword', 'Forgot password?')}
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    {t('auth.noAccount', "Don't have an account?")}{' '}
                    <button onClick={() => setStep('register')} className="text-primary hover:underline font-medium">
                      {t('auth.register', 'Register')}
                    </button>
                  </p>
                </div>
              </motion.div>
            )}

            {/* Step 3: OTP Verification */}
            {step === 'otp' && (
              <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="text-center mb-8">
                  <h2 className="text-xl font-semibold text-foreground mb-2">{t('auth.verifyEmail', 'Verify Email')}</h2>
                  <p className="text-muted-foreground">{t('auth.enterCodeSent', 'Enter the code sent to')}<br /><span className="text-foreground font-medium">{email}</span></p>
                </div>
                <div className="flex justify-center gap-2 mb-6">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={el => otpRefs.current[index] = el}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-12 h-14 text-center text-xl font-semibold border border-border rounded-xl bg-card focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      disabled={isLoading}
                    />
                  ))}
                </div>
                {isLoading && <div className="flex justify-center mb-6"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">{t('auth.didntReceive', "Didn't receive the code?")}</p>
                  <Button variant="ghost" onClick={handleResendOtp} disabled={countdown > 0 || isLoading} className="text-primary">
                    {countdown > 0 ? t('auth.resendIn', { seconds: countdown, defaultValue: `Resend in ${countdown}s` }) : t('auth.resend', 'Resend')}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  );
};

export default Auth;
