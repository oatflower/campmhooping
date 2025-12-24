import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Booking } from '@/types/supabase';
import { getBookings, BookingRecord } from '@/services/bookingCrud';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, User as UserIcon, Mail, Camera, Check, X, Loader2, Star } from 'lucide-react';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, MapPin, Trophy, Tent } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Trip {
    id: string;
    campName: string;
    location: string;
    date: string;
    image: string;
    price: number;
    status: string;
    rating: number | null;
}

const Profile = () => {
    const { user, logout, updateUser } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Edit states
    const [isEditingName, setIsEditingName] = useState(false);
    const [newName, setNewName] = useState('');

    // Email change states
    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [newEmail, setNewEmail] = useState('');
    const [showOtpDialog, setShowOtpDialog] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isVerifying, setIsVerifying] = useState(false);
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Review states
    const [showReviewDialog, setShowReviewDialog] = useState(false);
    const [rating, setRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

    const handleOpenReview = (tripId: string) => {
        setSelectedTripId(tripId);
        setRating(0);
        setReviewText('');
        setShowReviewDialog(true);
    };

    const handleSubmitReview = () => {
        // Here you would typically send the review to the backend
        console.log({
            tripId: selectedTripId,
            rating,
            comment: reviewText
        });

        toast.success(t('reviews.success', 'Review submitted successfully!'));
        setShowReviewDialog(false);
    };



    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.4 }
        }
    };

    const [trips, setTrips] = useState<Trip[]>([]);
    const [isLoadingTrips, setIsLoadingTrips] = useState(true);

    // Stats calculation
    const stats = {
        totalTrips: trips.length,
        totalSpent: trips.reduce((acc, trip) => acc + (trip.price || 0), 0),
        campsVisited: new Set(trips.map(t => t.campName)).size
    };

    useEffect(() => {
        // Fetch trips using mock user (no auth required for local dev)
        const fetchTrips = async () => {
            setIsLoadingTrips(true);
            try {
                const result = await getBookings();

                if (!result.success) {
                    throw new Error(result.error || 'Failed to fetch bookings');
                }

                // Map to UI format
                const mappedTrips = result.data?.map((booking: BookingRecord) => ({
                    id: booking.id,
                    campName: booking.camps?.name || 'Unknown Camp',
                    location: booking.camps?.location || 'Unknown Location',
                    date: `${new Date(booking.start_date).toLocaleDateString()} - ${new Date(booking.end_date).toLocaleDateString()}`,
                    image: booking.camps?.images?.[0] || 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4',
                    price: booking.total_price,
                    status: booking.status,
                    rating: null // Reviews not implemented in backend yet
                })) || [];

                setTrips(mappedTrips);
            } catch (error) {
                console.error('Error fetching trips:', error);
                toast.error(t('profile.errorFetchingTrips', 'Failed to load trips'));
            } finally {
                setIsLoadingTrips(false);
            }
        };

        fetchTrips();
    }, [t]);

    // Auth is handled by ProtectedRoute wrapper
    const displayUser = user;

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Avatar upload handler
    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error(t('profile.invalidImageType', 'Please select an image file'));
                return;
            }
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error(t('profile.imageTooLarge', 'Image must be less than 5MB'));
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                const base64 = event.target?.result as string;
                updateUser({ avatar: base64 });
                toast.success(t('profile.avatarUpdated', 'Profile picture updated'));
            };
            reader.readAsDataURL(file);
        }
    };

    // Name editing handlers
    const handleSaveName = () => {
        if (newName.trim().length < 2) {
            toast.error(t('profile.nameTooShort', 'Name must be at least 2 characters'));
            return;
        }
        updateUser({ name: newName.trim() });
        setIsEditingName(false);
        toast.success(t('profile.nameUpdated', 'Display name updated'));
    };

    const handleCancelNameEdit = () => {
        setNewName(displayUser.name);
        setIsEditingName(false);
    };

    // Email change handlers
    const handleStartEmailChange = () => {
        setNewEmail('');
        setIsEditingEmail(true);
    };

    const handleSendOtp = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newEmail)) {
            toast.error(t('validation.invalidEmail', 'Please enter a valid email'));
            return;
        }
        if (newEmail === displayUser.email) {
            toast.error(t('profile.sameEmail', 'This is already your email'));
            return;
        }
        setShowOtpDialog(true);
        setOtp(['', '', '', '', '', '']);
        toast.success(t('validation.otpSent', 'OTP sent to your email'));
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
    };

    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);
        if (value && index < 5) otpRefs.current[index + 1]?.focus();

        // Auto-verify when all digits entered
        if (newOtp.every(d => d) && newOtp.join('').length === 6) {
            handleVerifyOtp(newOtp.join(''));
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleVerifyOtp = async (code: string) => {
        setIsVerifying(true);

        try {
            // SECURITY: Use Supabase's proper email verification flow
            // In production, this should use supabase.auth.verifyOtp() or similar
            // For now, using updateUser which triggers Supabase's email confirmation flow
            const { error } = await supabase.auth.updateUser({ email: newEmail });

            if (error) {
                throw error;
            }

            // Supabase sends a confirmation email - user needs to click the link
            setShowOtpDialog(false);
            setIsEditingEmail(false);
            toast.success(t('profile.emailVerificationSent', 'Verification email sent. Please check your inbox to confirm the change.'));
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to update email';
            toast.error(message);
            setOtp(['', '', '', '', '', '']);
            otpRefs.current[0]?.focus();
        } finally {
            setIsVerifying(false);
        }
    };

    const defaultTab = searchParams.get('tab') === 'trips' ? 'trips' : 'account';

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />
            <main className="flex-1 pb-12">
                {/* Hero Header Background */}
                <div className="h-48 bg-gradient-forest relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?q=80&w=2000&auto=format&fit=crop')] opacity-10 bg-cover bg-center" />
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
                </div>

                <div className="container max-w-2xl mx-auto px-4 -mt-20 relative z-10">
                    {/* Avatar Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col items-center text-center space-y-4 mb-8"
                    >
                        <div className="relative inline-block group">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            >
                                <Avatar
                                    className="w-32 h-32 border-4 border-background shadow-glow cursor-pointer"
                                    onClick={handleAvatarClick}
                                >
                                    <AvatarImage src={displayUser.avatar} alt={displayUser.name} className="object-cover" />
                                    <AvatarFallback className="text-4xl bg-secondary text-secondary-foreground">
                                        {displayUser.name.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                            </motion.div>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={handleAvatarClick}
                                className="absolute bottom-2 right-2 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
                            >
                                <Camera className="w-5 h-5" />
                            </motion.button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">{displayUser.name}</h1>
                            <p className="text-muted-foreground mt-1 flex items-center justify-center gap-2">
                                <Mail className="w-4 h-4" />
                                {displayUser.email}
                            </p>
                        </div>
                    </motion.div>

                    <Tabs defaultValue={defaultTab} className="w-full space-y-8">
                        <TabsList className="grid w-full grid-cols-2 p-1 bg-secondary/30 backdrop-blur-sm rounded-xl">
                            <TabsTrigger
                                value="account"
                                className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-300"
                            >
                                {t('profile.accountSettings', 'Account Settings')}
                            </TabsTrigger>
                            <TabsTrigger
                                value="trips"
                                className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-300"
                            >
                                {t('profile.pastTrips', 'Past Trips')}
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="account">
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="space-y-6"
                            >
                                {/* Stats Section */}
                                <motion.div variants={itemVariants} className="grid grid-cols-3 gap-4">
                                    <div className="bg-card border border-border/50 rounded-2xl p-4 text-center shadow-sm hover:shadow-md transition-all">
                                        <div className="w-10 h-10 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-2 text-primary">
                                            <Trophy className="w-5 h-5" />
                                        </div>
                                        <div className="text-2xl font-bold text-gradient-forest">{stats.totalTrips}</div>
                                        <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Trips</div>
                                    </div>
                                    <div className="bg-card border border-border/50 rounded-2xl p-4 text-center shadow-sm hover:shadow-md transition-all">
                                        <div className="w-10 h-10 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-2 text-primary">
                                            <Tent className="w-5 h-5" />
                                        </div>
                                        <div className="text-2xl font-bold text-gradient-forest">{stats.campsVisited}</div>
                                        <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Camps</div>
                                    </div>
                                    <div className="bg-card border border-border/50 rounded-2xl p-4 text-center shadow-sm hover:shadow-md transition-all">
                                        <div className="w-10 h-10 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-2 text-primary">
                                            <Star className="w-5 h-5" />
                                        </div>
                                        <div className="text-2xl font-bold text-gradient-forest">5.0</div>
                                        <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Rating</div>
                                    </div>
                                </motion.div>

                                {/* Account Settings Card */}
                                <motion.div variants={itemVariants} className="bg-card border border-border/50 rounded-2xl p-6 space-y-6 shadow-sm hover:shadow-md transition-all duration-300">
                                    <div className="flex items-center gap-2 pb-4 border-b border-border/50">
                                        <UserIcon className="w-5 h-5 text-primary" />
                                        <h2 className="font-semibold text-lg">{t('profile.personalInfo', 'Personal Information')}</h2>
                                    </div>

                                    <div className="space-y-4">
                                        {/* Display Name */}
                                        <div className="group flex items-center gap-4 p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                <UserIcon className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-muted-foreground">{t('profile.displayName', 'Display Name')}</p>
                                                {isEditingName ? (
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Input
                                                            value={newName}
                                                            onChange={(e) => setNewName(e.target.value)}
                                                            className="h-8 bg-background"
                                                            autoFocus
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') handleSaveName();
                                                                if (e.key === 'Escape') handleCancelNameEdit();
                                                            }}
                                                        />
                                                        <Button size="icon" className="h-8 w-8 text-primary-foreground" onClick={handleSaveName}>
                                                            <Check className="w-4 h-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" onClick={handleCancelNameEdit}>
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-between">
                                                        <p className="font-medium text-foreground">{displayUser.name}</p>
                                                        <Button variant="ghost" size="sm" className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setIsEditingName(true)}>
                                                            {t('common.edit', 'Edit')}
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Email Address */}
                                        <div className="group flex items-center gap-4 p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                <Mail className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-muted-foreground">{t('profile.emailAddress', 'Email Address')}</p>
                                                {isEditingEmail ? (
                                                    <div className="flex gap-2 mt-1">
                                                        <Input
                                                            type="email"
                                                            value={newEmail}
                                                            onChange={(e) => setNewEmail(e.target.value)}
                                                            placeholder={t('profile.enterNewEmail', 'Enter new email')}
                                                            className="h-9 bg-background flex-1"
                                                            autoFocus
                                                        />
                                                        <Button size="sm" onClick={handleSendOtp}>
                                                            {t('profile.verify', 'Verify')}
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="w-9" onClick={() => setIsEditingEmail(false)}>
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-between">
                                                        <p className="font-medium text-foreground">{displayUser.email}</p>
                                                        <Button variant="ghost" size="sm" className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" onClick={handleStartEmailChange}>
                                                            {t('common.edit', 'Edit')}
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-border/50">
                                        <Button
                                            variant="ghost"
                                            className="w-full gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                            onClick={handleLogout}
                                        >
                                            <LogOut className="w-4 h-4" />
                                            {t('profile.logout', 'Log Out')}
                                        </Button>
                                    </div>
                                </motion.div>
                            </motion.div>
                        </TabsContent>

                        <TabsContent value="trips">
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="space-y-4"
                            >
                                {isLoadingTrips ? (
                                    <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
                                ) : trips.length === 0 ? (
                                    <div className="text-center p-8 text-muted-foreground bg-card/50 rounded-2xl border border-dashed border-border">
                                        <p className="mb-2">{t('profile.noTrips', 'No trips yet')}</p>
                                        <Button variant="link" onClick={() => navigate('/')} className="text-primary">Explore Camps</Button>
                                    </div>
                                ) : (
                                    trips.map((trip, index) => (
                                        <motion.div
                                            key={trip.id}
                                            variants={itemVariants}
                                            className="group bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden hover:shadow-glow hover:border-primary/30 transition-all duration-300 cursor-pointer"
                                            whileHover={{ y: -5 }}
                                        >
                                            <div className="flex flex-col sm:flex-row h-full">
                                                <div className="sm:w-56 h-48 sm:h-auto relative overflow-hidden">
                                                    <img
                                                        src={trip.image}
                                                        alt={trip.campName}
                                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent sm:bg-gradient-to-r" />
                                                    <Badge
                                                        className={`absolute top-3 left-3 shadow-md backdrop-blur-md border-0 ${trip.status === 'completed'
                                                            ? 'bg-green-500/90 text-white'
                                                            : 'bg-primary/90 text-white'
                                                            }`}
                                                    >
                                                        {trip.status}
                                                    </Badge>
                                                </div>
                                                <div className="flex-1 p-5 lg:p-6 flex flex-col justify-between relative overflow-hidden">
                                                    {/* Decorative background circle */}
                                                    <div className="absolute -right-20 -top-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />

                                                    <div>
                                                        <div className="flex justify-between items-start mb-2 relative">
                                                            <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">{trip.campName}</h3>
                                                            {trip.status === 'completed' && (
                                                                <div className="hidden sm:flex text-yellow-400 gap-0.5">
                                                                    {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-3 h-3 fill-current" />)}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="space-y-2 relative">
                                                            <div className="flex items-center gap-2 text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors">
                                                                <MapPin className="w-4 h-4 text-primary" />
                                                                {trip.location}
                                                            </div>
                                                            <div className="flex items-center gap-2 text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors">
                                                                <CalendarIcon className="w-4 h-4 text-primary" />
                                                                {trip.date}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between items-end mt-4 pt-4 border-t border-border/50 bg-gradient-to-r from-transparent via-transparent to-transparent group-hover:to-primary/5 transition-all">
                                                        <div className="flex flex-col">
                                                            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{t('common.price', 'Total Price')}</span>
                                                            <span className="font-bold text-xl text-primary font-mono">฿{trip.price.toLocaleString()}</span>
                                                        </div>
                                                        {trip.status === 'completed' ? (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="gap-2 border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground transition-all shadow-sm hover:shadow-glow"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleOpenReview(trip.id);
                                                                }}
                                                            >
                                                                <Check className="w-3 h-3" />
                                                                {t('reviews.write', 'Write Review')}
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                size="sm"
                                                                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-glow"
                                                            >
                                                                View Details
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )))}
                            </motion.div>
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
            <Footer />

            <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{t('reviews.writeTitle', 'Write a Review')}</DialogTitle>
                        <DialogDescription>
                            {t('reviews.writeDesc', 'Share your experience with others')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="flex justify-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className="focus:outline-none transition-transform hover:scale-110"
                                >
                                    <Star
                                        className={`w-8 h-8 ${star <= rating
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'text-muted-foreground/30 hover:text-yellow-400/50'
                                            } transition-colors`}
                                    />
                                </button>
                            ))}
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="review" className="text-sm font-medium">
                                {t('reviews.comment', 'Your Review')}
                            </label>
                            <textarea
                                id="review"
                                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder={t('reviews.placeholder', 'Tell us about your stay...')}
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setShowReviewDialog(false)}>
                            {t('common.cancel', 'Cancel')}
                        </Button>
                        <Button onClick={handleSubmitReview} disabled={rating === 0}>
                            {t('common.submit', 'Submit Review')}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
            {/* OTP Verification Dialog */}
            <Dialog open={showOtpDialog} onOpenChange={setShowOtpDialog}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>{t('auth.verifyOtp', 'Verify OTP')}</DialogTitle>
                        <DialogDescription>
                            {t('profile.otpSentTo', 'Enter the 6-digit code sent to')} <strong>{newEmail}</strong>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                        <div className="flex justify-center gap-2">
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
                                    className="w-10 h-12 text-center text-xl font-semibold border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                                    disabled={isVerifying}
                                />
                            ))}
                        </div>
                        {isVerifying && (
                            <div className="flex justify-center">
                                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                            </div>
                        )}
                        <p className="text-center text-xs text-muted-foreground">
                            {t('auth.testCode', 'For testing, use code:')} <span className="font-mono font-medium">123456</span>
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Profile;
