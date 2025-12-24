import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  ArrowLeft,
  CreditCard,
  Building2,
  Wallet,
  Lock,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Upload,
  X,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';
import {
  validateBooking,
  validateMinimumStay,
  MINIMUM_NIGHTS,
} from '@/utils/bookingValidation';
import { validatePaymentAmount } from '@/utils/pricing';
import { createBooking, createPayment } from '@/services/bookingCrud';

// Helper to detect card brand from card number
function detectCardBrand(cardNumber: string): string | undefined {
  const num = cardNumber.replace(/\s/g, '');
  if (num.startsWith('4')) return 'visa';
  if (/^5[1-5]/.test(num) || /^2[2-7]/.test(num)) return 'mastercard';
  if (/^3[47]/.test(num)) return 'amex';
  if (/^6(?:011|5)/.test(num)) return 'discover';
  if (/^35(?:2[89]|[3-8])/.test(num)) return 'jcb';
  return undefined;
}

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { formatPrice } = useCurrency();
  const { user, profileId } = useAuth();

  // Booking data must come from navigation state (from camp detail page)
  const bookingData = location.state?.booking || null;

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [cardDetails, setCardDetails] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
    zip: '',
  });

  // Validate booking on mount (Critical Issues #1, #3, #4, #6, #7)
  useEffect(() => {
    const runValidation = async () => {
      if (!bookingData) return;

      setIsValidating(true);
      try {
        const dateRange = {
          from: new Date(bookingData.dateRange.from),
          to: new Date(bookingData.dateRange.to),
        };

        const validation = await validateBooking({
          userId: profileId || '', // Empty if not logged in - validation will handle
          campId: bookingData.campId,
          dateRange,
          guests: bookingData.guests,
          accommodationCapacity: {
            maxGuests: bookingData.accommodation?.maxGuests || 4,
          },
        });

        setValidationErrors(validation.errors);
        setValidationWarnings(validation.warnings);

        if (!validation.valid) {
          validation.errors.forEach(err => toast.error(err));
        }
      } catch (error) {
        console.error('Validation error:', error);
        setValidationWarnings(['Could not complete booking validation']);
      } finally {
        setIsValidating(false);
      }
    };

    runValidation();
  }, [bookingData]);

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.slice(0, 2) + '/' + v.slice(2, 4);
    }
    return v;
  };

  const handlePayment = async () => {
    // Check for validation errors first (Critical Issues #1, #3, #4, #6, #7)
    if (validationErrors.length > 0) {
      toast.error('Cannot proceed: ' + validationErrors[0]);
      return;
    }

    if (paymentMethod === 'card') {
      if (!cardDetails.number || !cardDetails.name || !cardDetails.expiry || !cardDetails.cvv) {
        toast.error(t('validation.fillCardDetails'));
        return;
      }
    }

    if (paymentMethod === 'bank' && !slipFile) {
      toast.error('Please upload transfer slip');
      return;
    }

    // REQUIRE LOGIN: User must be logged in with valid profile to confirm booking
    if (!user || !profileId) {
      toast.error(t('payment.loginRequired', 'Please login to complete your booking'));
      // Store current booking state and redirect to auth
      navigate('/auth', {
        state: {
          returnTo: '/payment',
          bookingData: location.state?.booking,
        }
      });
      return;
    }

    // Use authenticated profile ID (matches RLS get_profile_id())
    const userId = profileId;

    setIsProcessing(true);

    try {
      let receiptUrl = null;

      // Upload slip if bank transfer
      if (paymentMethod === 'bank' && slipFile) {
        const fileName = `${userId}/${Date.now()}_${slipFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from('payment-slips')
          .upload(fileName, slipFile);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw new Error('Failed to upload payment slip');
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('payment-slips')
          .getPublicUrl(fileName);

        receiptUrl = urlData.publicUrl;
      }

      // SECURITY: Format dates properly for API and database
      const formatDateForApi = (date: Date | string): string => {
        const d = date instanceof Date ? date : new Date(date);
        return d.toISOString();
      };
      const formatDateForDb = (date: Date | string): string => {
        const d = date instanceof Date ? date : new Date(date);
        return d.toISOString().split('T')[0];
      };

      // Call Edge Function to create Payment Intent
      // SECURITY: Server calculates the price - never trust client-side pricing
      const { data: paymentIntent, error: paymentError } = await supabase.functions.invoke('create-payment-intent', {
        body: {
          booking: {
            campId: bookingData.campId,
            dateRange: {
              from: formatDateForApi(bookingData.dateRange.from),
              to: formatDateForApi(bookingData.dateRange.to),
            },
            guests: bookingData.guests
          }
        }
      });

      if (paymentError) {
        console.error('Payment intent error:', paymentError);
        throw new Error('Failed to process payment. Please try again.');
      }

      // SECURITY: Require server-calculated price - never use client-side total alone
      if (!paymentIntent?.calculatedTotal) {
        throw new Error('Unable to calculate price. Please try again.');
      }

      // Payment amount validation
      const expectedTotal = bookingData.pricing.total;
      const serverTotal = paymentIntent.calculatedTotal;
      const paymentValidation = validatePaymentAmount(serverTotal, expectedTotal);
      if (!paymentValidation.valid) {
        throw new Error(paymentValidation.error || 'Payment amount mismatch');
      }

      // Determine status based on payment method
      const initialStatus = paymentMethod === 'card' ? 'confirmed' :
                           paymentMethod === 'pay_at_camp' ? 'pending' : 'processing';

      // Create booking record using booking service
      const bookingResult = await createBooking({
        campId: bookingData.campId,
        startDate: formatDateForDb(bookingData.dateRange.from),
        endDate: formatDateForDb(bookingData.dateRange.to),
        totalPrice: serverTotal, // SECURITY: Always use server-calculated price
        status: initialStatus,
        receiptUrl: receiptUrl,
        guestCount: bookingData.guests,
        paymentMethod: paymentMethod as 'card' | 'promptpay' | 'bank' | 'pay_at_camp',
        userId: userId, // Use authenticated user ID
      });

      if (!bookingResult.success) {
        // User-friendly error messages handled by bookingCrud service
        throw new Error(bookingResult.error || 'Failed to create booking');
      }

      const data = bookingResult.data;

      // Create payment record AFTER booking succeeds
      // Failure-safe: Log warning but don't block booking confirmation
      const paymentResult = await createPayment({
        bookingId: data!.id,
        amount: serverTotal,
        currency: 'THB',
        paymentMethod: paymentMethod as 'card' | 'promptpay' | 'bank' | 'pay_at_camp',
        receiptUrl: receiptUrl,
        // Extract card info if available (last 4 digits only for security)
        cardLastFour: paymentMethod === 'card' && cardDetails.number
          ? cardDetails.number.replace(/\s/g, '').slice(-4)
          : undefined,
        cardBrand: paymentMethod === 'card' ? detectCardBrand(cardDetails.number) : undefined,
      });

      if (!paymentResult.success) {
        // Log warning but don't fail the booking
        console.warn('Payment record creation failed:', paymentResult.error);
        // Optionally show a subtle warning (booking still succeeded)
      }

      toast.success(t('validation.paymentSuccess'));

      // Navigate to confirmation page
      navigate('/booking-confirmation', {
        state: {
          booking: bookingData,
          paymentMethod,
          transactionId: data.id, // Use actual booking ID
        }
      });
    } catch (error: unknown) {
      console.error('Booking error:', error);
      const message = error instanceof Error ? error.message : 'Failed to process booking';
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{t('common.bookingNotFound')}</h1>
          <Button onClick={() => navigate('/')}>{t('common.backToHome')}</Button>
        </div>
      </div>
    );
  }

  // Calculate half price for "Part now, part later" mock
  const halfPrice = bookingData.pricing?.total ? bookingData.pricing.total / 2 : 0;

  // Animation variants for staggered step entry
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50 supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-7xl mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="rounded-full hover:bg-secondary transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">{t('payment.title', 'Confirm and pay')}</h1>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs font-medium bg-primary/10 px-3 py-1.5 rounded-full text-primary">
            <ShieldCheck className="w-3.5 h-3.5" />
            Secure Payment
          </div>
        </div>
      </header>

      <main className="container max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 xl:gap-24">

          {/* LEFT COLUMN: Steps */}
          <motion.div
            className="space-y-12"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >

            {/* Step 1: Payment Details */}
            <motion.section variants={itemVariants}>
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold shadow-glow">1</span>
                {t('payment.details', 'Payment Details')}
              </h2>
              <div className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow p-6">
                <div className="flex items-start gap-4">
                  <div className="pt-1">
                    <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="font-bold text-base">
                      {t('payment.payNow', 'Pay')} {formatPrice(bookingData.pricing?.total || 0)} {t('payment.now', 'now')}
                    </div>
                    <p className="text-muted-foreground text-sm font-light">
                      {t('payment.description', 'Pay the total amount securely to confirm your booking.')}
                    </p>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Step 2: Add a payment method */}
            <motion.section variants={itemVariants}>
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold shadow-glow">2</span>
                {t('payment.payWith', 'Pay with')}
              </h2>

              {/* Payment Methods Tabs/Selection */}
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">

                {/* Credit Card Option */}
                <div
                  className={`border rounded-2xl p-6 transition-all duration-300 ${paymentMethod === 'card'
                    ? 'border-primary ring-1 ring-primary/20 bg-primary/5 shadow-md'
                    : 'border-border hover:border-sidebar-border hover:bg-secondary/30'
                    }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="pm-card" className="flex items-center gap-3 cursor-pointer group">
                      <RadioGroupItem value="card" id="pm-card" className="data-[state=checked]:border-primary data-[state=checked]:text-primary border-muted-foreground/30" />
                      <span className={`font-semibold text-base transition-colors ${paymentMethod === 'card' ? 'text-primary' : 'group-hover:text-foreground'}`}>
                        {t('payment.creditCard', 'Credit or debit card')}
                      </span>
                    </Label>
                    <div className="flex gap-1.5 opacity-80 grayscale-[30%] transition-all hover:grayscale-0">
                      <div className="h-6 w-10 bg-[#1A1F71] rounded flex items-center justify-center text-white text-[10px] font-bold tracking-tighter">VISA</div>
                      <div className="h-6 w-10 bg-[#FF5F00] rounded ml-1 flex items-center justify-center relative overflow-hidden">
                        <div className="absolute left-0 w-6 h-6 bg-[#EB001B] rounded-full mix-blend-multiply opacity-80" />
                        <div className="absolute right-0 w-6 h-6 bg-[#F79E1B] rounded-full mix-blend-multiply opacity-80" />
                      </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {paymentMethod === 'card' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-4 max-w-md">
                          <div className="relative group">
                            <CreditCard className="w-5 h-5 absolute left-3.5 top-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input
                              placeholder="Card number"
                              value={cardDetails.number}
                              onChange={(e) => setCardDetails(prev => ({ ...prev, number: formatCardNumber(e.target.value) }))}
                              maxLength={19}
                              className="pl-11 h-12 bg-background border-input focus:border-primary focus:ring-1 focus:ring-primary rounded-xl transition-all"
                            />
                            <Lock className="w-3.5 h-3.5 absolute right-3.5 top-4.5 text-muted-foreground/50" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <Input
                              placeholder="Expiration (MM/YY)"
                              value={cardDetails.expiry}
                              onChange={(e) => setCardDetails(prev => ({ ...prev, expiry: formatExpiry(e.target.value) }))}
                              maxLength={5}
                              className="h-12 bg-background border-input focus:border-primary focus:ring-1 focus:ring-primary rounded-xl transition-all"
                            />
                            <Input
                              type="password"
                              placeholder="CVV"
                              value={cardDetails.cvv}
                              onChange={(e) => setCardDetails(prev => ({ ...prev, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                              maxLength={4}
                              className="h-12 bg-background border-input focus:border-primary focus:ring-1 focus:ring-primary rounded-xl transition-all"
                            />
                          </div>
                          <Input
                            placeholder="Name on card"
                            value={cardDetails.name}
                            onChange={(e) => setCardDetails(prev => ({ ...prev, name: e.target.value.toUpperCase() }))}
                            className="h-12 bg-background border-input focus:border-primary focus:ring-1 focus:ring-primary rounded-xl transition-all"
                          />
                          <Input
                            placeholder="ZIP code"
                            value={cardDetails.zip}
                            onChange={(e) => setCardDetails(prev => ({ ...prev, zip: e.target.value }))}
                            className="h-12 bg-background border-input focus:border-primary focus:ring-1 focus:ring-primary rounded-xl transition-all"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* PromptPay Option */}
                <div
                  className={`border rounded-2xl p-6 transition-all duration-300 ${paymentMethod === 'promptpay'
                    ? 'border-primary ring-1 ring-primary/20 bg-primary/5 shadow-md'
                    : 'border-border hover:border-sidebar-border hover:bg-secondary/30'
                    }`}
                >
                  <Label htmlFor="pm-promptpay" className="flex items-center justify-between cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="promptpay" id="pm-promptpay" className="data-[state=checked]:border-primary data-[state=checked]:text-primary border-muted-foreground/30" />
                      <span className={`font-semibold text-base transition-colors ${paymentMethod === 'promptpay' ? 'text-primary' : 'group-hover:text-foreground'}`}>
                        PromptPay / QR
                      </span>
                    </div>
                    <Wallet className={`w-5 h-5 transition-colors ${paymentMethod === 'promptpay' ? 'text-primary' : 'text-muted-foreground'}`} />
                  </Label>
                  <AnimatePresence>
                    {paymentMethod === 'promptpay' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        className="bg-background/50 p-6 rounded-xl text-center border border-dashed border-primary/30"
                      >
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-md border border-neutral-100">
                          <CheckCircle2 className="w-6 h-6 text-green-500" />
                        </div>
                        <p className="text-sm font-medium text-foreground">Scan safely via your banking app</p>
                        <p className="text-xs text-muted-foreground mt-1">QR code will be generated after confirmation</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Bank Transfer Option */}
                <div
                  className={`border rounded-2xl p-6 transition-all duration-300 ${paymentMethod === 'bank'
                    ? 'border-primary ring-1 ring-primary/20 bg-primary/5 shadow-md'
                    : 'border-border hover:border-sidebar-border hover:bg-secondary/30'
                    }`}
                >
                  <Label htmlFor="pm-bank" className="flex items-center justify-between cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="bank" id="pm-bank" className="data-[state=checked]:border-primary data-[state=checked]:text-primary border-muted-foreground/30" />
                      <span className={`font-semibold text-base transition-colors ${paymentMethod === 'bank' ? 'text-primary' : 'group-hover:text-foreground'}`}>
                        Bank Transfer
                      </span>
                    </div>
                    <Building2 className={`w-5 h-5 transition-colors ${paymentMethod === 'bank' ? 'text-primary' : 'text-muted-foreground'}`} />
                  </Label>
                  <AnimatePresence>
                    {paymentMethod === 'bank' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        className="bg-background/50 p-5 rounded-xl border border-primary/20"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-semibold">CampThai Co., Ltd.</p>
                          <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded">KBANK</span>
                        </div>
                        <p className="text-lg font-mono text-primary tracking-wider font-semibold">123-4-56789-0</p>

                        <div className="mt-4 text-left">
                          <p className="text-xs text-muted-foreground mb-2 font-medium">Upload Transfer Slip</p>
                          {!slipFile ? (
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-accent/50 hover:border-primary/50 transition-all bg-card/50">
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                                <p className="text-sm text-foreground font-medium">Click to upload slip</p>
                                <p className="text-xs text-muted-foreground">JPG, PNG up to 5MB</p>
                              </div>
                              <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    const file = e.target.files[0];
                                    // Validate file size (max 5MB)
                                    if (file.size > 5 * 1024 * 1024) {
                                      toast.error('File must be less than 5MB');
                                      e.target.value = ''; // Reset input
                                      return;
                                    }
                                    setSlipFile(file);
                                  }
                                }}
                              />
                            </label>
                          ) : (
                            <div className="relative flex items-center p-3 bg-card border border-border rounded-xl shadow-sm">
                              <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center mr-3 shrink-0">
                                <FileText className="w-5 h-5 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">
                                  {slipFile.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {(slipFile.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  setSlipFile(null);
                                }}
                                className="p-1 hover:bg-destructive/10 hover:text-destructive rounded-full transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Pay at Camp Option */}
                <div
                  className={`border rounded-2xl p-6 transition-all duration-300 ${paymentMethod === 'pay_at_camp'
                    ? 'border-primary ring-1 ring-primary/20 bg-primary/5 shadow-md'
                    : 'border-border hover:border-sidebar-border hover:bg-secondary/30'
                    }`}
                >
                  <Label htmlFor="pm-pay-at-camp" className="flex items-center gap-3 cursor-pointer group">
                    <RadioGroupItem value="pay_at_camp" id="pm-pay-at-camp" className="data-[state=checked]:border-primary data-[state=checked]:text-primary border-muted-foreground/30" />
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-6 rounded flex items-center justify-center transition-colors ${paymentMethod === 'pay_at_camp' ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground'}`}>
                        <Wallet className="w-4 h-4" />
                      </div>
                      <span className={`font-semibold text-base transition-colors ${paymentMethod === 'pay_at_camp' ? 'text-primary' : 'group-hover:text-foreground'}`}>
                        Pay at Camp
                      </span>
                    </div>
                  </Label>
                  <AnimatePresence>
                    {paymentMethod === 'pay_at_camp' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        className="overflow-hidden pl-9"
                      >
                        <p className="text-sm text-muted-foreground">
                          {t('payment.payAtCampDesc', 'You can pay in cash or transfer directly to the host upon arrival.')}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

              </RadioGroup>
            </motion.section>

            {/* Step 3: Review your reservation */}
            <motion.section variants={itemVariants}>
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold shadow-glow">3</span>
                {t('payment.review', 'Review & Confirm')}
              </h2>

              {/* Validation Errors Display */}
              {validationErrors.length > 0 && (
                <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-xl">
                  <div className="flex items-center gap-2 text-destructive font-semibold mb-2">
                    <AlertTriangle className="w-5 h-5" />
                    <span>Cannot Complete Booking</span>
                  </div>
                  <ul className="text-sm text-destructive/80 space-y-1 ml-7">
                    {validationErrors.map((error, idx) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Validation Warnings Display */}
              {validationWarnings.length > 0 && validationErrors.length === 0 && (
                <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl">
                  <div className="flex items-center gap-2 text-orange-600 font-semibold mb-2">
                    <AlertTriangle className="w-5 h-5" />
                    <span>Warnings</span>
                  </div>
                  <ul className="text-sm text-orange-600/80 space-y-1 ml-7">
                    {validationWarnings.map((warning, idx) => (
                      <li key={idx}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="text-sm text-muted-foreground leading-relaxed mb-8 max-w-lg">
                By selecting the button below, I agree to the <span className="underline font-semibold text-foreground cursor-pointer hover:text-primary">Host's House Rules</span>, <span className="underline font-semibold text-foreground cursor-pointer hover:text-primary">Ground rules for guests</span>, <span className="underline font-semibold text-foreground cursor-pointer hover:text-primary">Campycom's Rebooking and Refund Policy</span>, and that Campycom can charge my payment method if I'm responsible for damage.
              </p>

              <Button
                onClick={handlePayment}
                disabled={isProcessing || isValidating || validationErrors.length > 0}
                size="lg"
                className="w-full md:w-48 h-14 text-lg font-bold rounded-xl bg-gradient-forest text-white hover:scale-[1.02] active:scale-[0.98] transition-all shadow-glow disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isProcessing ? (
                  <><Loader2 className="animate-spin w-5 h-5 mr-2" /> Processing...</>
                ) : isValidating ? (
                  <><Loader2 className="animate-spin w-5 h-5 mr-2" /> Validating...</>
                ) : validationErrors.length > 0 ? (
                  'Cannot Book'
                ) : (
                  t('payment.confirm', 'Confirm and pay')
                )}
              </Button>
            </motion.section>

          </motion.div>

          {/* RIGHT COLUMN: Summary */}
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="border border-border/60 rounded-3xl p-6 lg:p-8 sticky top-32 glass shadow-elevated hover:shadow-lg transition-all duration-500"
            >

              {/* Header with Image */}
              <div className="flex gap-5 mb-6">
                <img
                  src={bookingData.campImage}
                  alt={bookingData.campName}
                  className="w-28 h-28 object-cover rounded-2xl shadow-sm border border-border"
                />
                <div className="flex-1 py-1">
                  <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
                    {t('payment.camperDetails', 'Camper details')}
                  </div>
                  <h3 className="font-bold text-base leading-tight mb-2 text-foreground">
                    {bookingData.campName}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="font-bold flex items-center gap-1 text-foreground"><CheckCircle2 className="w-3 h-3 fill-primary text-primary-foreground" /> 5.0</span>
                    <span>•</span>
                    <span className="underline decoration-border underline-offset-2">126 reviews</span>
                  </div>
                </div>
              </div>

              <Separator className="my-6 bg-border/60" />

              {/* Free Cancellation */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold tracking-tight">{t('payment.priceDetails', 'Price details')}</h3>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{formatPrice(bookingData.accommodation?.pricePerNight || 0)} x {bookingData.pricing?.nights} {t('common.nights', 'nights')}</span>
                    <span>{formatPrice(bookingData.pricing?.basePrice || 0)}</span>
                  </div>

                  {bookingData.pricing?.vat > 0 && (
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span className="underline decoration-dotted decoration-border cursor-help">{t('payment.taxes', 'Taxes and fees')}</span>
                      <span>{formatPrice(bookingData.pricing.vat)}</span>
                    </div>
                  )}
                </div>

                <Separator className="my-2 bg-border/60" />

                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-lg">{t('payment.total', 'Total')} (THB)</span>
                  <span className="font-bold text-2xl tracking-tight text-primary">{formatPrice(bookingData.pricing?.total || 0)}</span>
                </div>
              </div>

            </motion.div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Payment;
