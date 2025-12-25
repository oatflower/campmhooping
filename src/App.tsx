import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FavoritesProvider } from "./contexts/FavoritesContext";
import { ReviewsProvider } from "./contexts/ReviewsContext";
import { HostProvider } from "./contexts/HostContext";
import { DemoAuthProvider } from "./contexts/DemoAuthContext";
import { CurrencyProvider } from "./contexts/CurrencyContext";
import { AuthProvider } from './contexts/AuthContext';
import { ConsentProvider } from './contexts/ConsentContext';
import ErrorBoundary from "./components/ErrorBoundary";
import ConsentBanner from "./components/ConsentBanner";
import ProtectedRoute from "./components/ProtectedRoute";

// Only Index loaded eagerly for fast initial render
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Critical pages - lazy loaded for better bundle size
const CampList = lazy(() => import("./pages/CampList"));
const CampDetail = lazy(() => import("./pages/CampDetail"));
const Auth = lazy(() => import("./pages/Auth"));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

// Lazy loaded pages - split into separate chunks
const CategoryDetail = lazy(() => import("./pages/CategoryDetail"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Trips = lazy(() => import("./pages/Trips"));
const TripDetail = lazy(() => import("./pages/TripDetail"));
const Gear = lazy(() => import("./pages/Gear"));
const Payment = lazy(() => import("./pages/Payment"));
const BookingConfirmation = lazy(() => import("./pages/BookingConfirmation"));
const Favorites = lazy(() => import("./pages/Favorites"));
const Community = lazy(() => import("./pages/Community"));
const CampToday = lazy(() => import("./pages/CampToday"));
const Profile = lazy(() => import("./pages/Profile"));
const Messages = lazy(() => import("./pages/Messages"));
const WriteReview = lazy(() => import("./pages/WriteReview"));
const CheckIn = lazy(() => import("./pages/CheckIn"));
const Events = lazy(() => import("./pages/Events"));
const RecentlyViewed = lazy(() => import("./pages/RecentlyViewed"));
const ModifyBooking = lazy(() => import("./pages/ModifyBooking"));

// Static pages - rarely accessed
const About = lazy(() => import("./pages/static/About"));
const FAQ = lazy(() => import("./pages/static/FAQ"));
const StaticContact = lazy(() => import("./pages/static/Contact"));
const Terms = lazy(() => import("./pages/static/Terms"));
const Privacy = lazy(() => import("./pages/static/Privacy"));

// Account settings pages
const AccountLayout = lazy(() => import("./pages/account/AccountLayout"));
const PersonalInfo = lazy(() => import("./pages/account/PersonalInfo"));
const LoginSecurity = lazy(() => import("./pages/account/LoginSecurity"));
const PrivacySettings = lazy(() => import("./pages/account/PrivacySettings"));
const NotificationSettings = lazy(() => import("./pages/account/NotificationSettings"));
const PaymentSettings = lazy(() => import("./pages/account/PaymentSettings"));

// Host Pages - separate chunk for host features
const HostLayout = lazy(() => import("./pages/host/HostLayout"));
const HostDashboard = lazy(() => import("./pages/host/HostDashboard"));
const HostCalendar = lazy(() => import("./pages/host/HostCalendar"));
const HostListings = lazy(() => import("./pages/host/HostListings"));
const HostMessages = lazy(() => import("./pages/host/HostMessages"));
const HostEarnings = lazy(() => import("./pages/host/HostEarnings"));
const HostBookings = lazy(() => import("./pages/host/HostBookings"));
const HostReviews = lazy(() => import("./pages/host/HostReviews"));

// Host Onboarding - separate chunk
const OnboardingLayout = lazy(() => import("./pages/host/onboarding/OnboardingLayout"));
const GetStarted = lazy(() => import("./pages/host/onboarding/GetStarted"));
const Step1Intro = lazy(() => import("./pages/host/onboarding/Step1Intro"));
const CampType = lazy(() => import("./pages/host/onboarding/CampType"));
const Location = lazy(() => import("./pages/host/onboarding/Location"));
const LocationConfirm = lazy(() => import("./pages/host/onboarding/LocationConfirm"));
const Environment = lazy(() => import("./pages/host/onboarding/Environment"));
const Capacity = lazy(() => import("./pages/host/onboarding/Capacity"));
const Zones = lazy(() => import("./pages/host/onboarding/Zones"));
const Step2Intro = lazy(() => import("./pages/host/onboarding/Step2Intro"));
const Facilities = lazy(() => import("./pages/host/onboarding/Facilities"));
const Photos = lazy(() => import("./pages/host/onboarding/Photos"));
const Title = lazy(() => import("./pages/host/onboarding/Title"));
const Description = lazy(() => import("./pages/host/onboarding/Description"));
const Step3Intro = lazy(() => import("./pages/host/onboarding/Step3Intro"));
const BookingType = lazy(() => import("./pages/host/onboarding/BookingType"));
const Pricing = lazy(() => import("./pages/host/onboarding/Pricing"));
const Discounts = lazy(() => import("./pages/host/onboarding/Discounts"));
const Contact = lazy(() => import("./pages/host/onboarding/Contact"));
const Review = lazy(() => import("./pages/host/onboarding/Review"));

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ConsentProvider>
          <CurrencyProvider>
            <AuthProvider>
              <DemoAuthProvider>
                <HostProvider>
                  <FavoritesProvider>
                    <ReviewsProvider>
                      <BrowserRouter>
                    <Suspense fallback={<PageLoader />}>
                    <Routes>
                      {/* Camper Routes */}
                      <Route path="/" element={<Index />} />
                      <Route path="/camps" element={<CampList />} />
                      <Route path="/camps/:campId" element={<CampDetail />} />
                      <Route path="/category/:categoryId" element={<CategoryDetail />} />
                      <Route path="/gear" element={<Gear />} />
                      <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
                      <Route path="/booking-confirmation" element={<ProtectedRoute><BookingConfirmation /></ProtectedRoute>} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/auth/callback" element={<AuthCallback />} />
                      <Route path="/register" element={<Auth />} />
                      <Route path="/login" element={<Auth />} />
                      <Route path="/forgot-password" element={<ForgotPassword />} />
                      <Route path="/reset-password" element={<ResetPassword />} />
                      <Route path="/trips" element={<ProtectedRoute><Trips /></ProtectedRoute>} />
                      <Route path="/trips/:bookingId" element={<ProtectedRoute><TripDetail /></ProtectedRoute>} />
                      <Route path="/trips/:bookingId/modify" element={<ProtectedRoute><ModifyBooking /></ProtectedRoute>} />
                      <Route path="/review/:bookingId" element={<ProtectedRoute><WriteReview /></ProtectedRoute>} />
                      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                      <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
                      <Route path="/messages/:recipientId" element={<ProtectedRoute><Messages /></ProtectedRoute>} />

                      {/* Account Settings Routes */}
                      <Route path="/account" element={<ProtectedRoute><AccountLayout /></ProtectedRoute>}>
                        <Route index element={<PersonalInfo />} />
                        <Route path="login-security" element={<LoginSecurity />} />
                        <Route path="privacy" element={<PrivacySettings />} />
                        <Route path="notifications" element={<NotificationSettings />} />
                        <Route path="payments" element={<PaymentSettings />} />
                      </Route>

                      <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
                      <Route path="/recently-viewed" element={<RecentlyViewed />} />
                      <Route path="/community" element={<Community />} />
                      <Route path="/camp-today/:campId" element={<CampToday />} />
                      <Route path="/check-in/:bookingId" element={<ProtectedRoute><CheckIn /></ProtectedRoute>} />
                      <Route path="/events" element={<Events />} />

                      {/* Host Routes */}
                      <Route path="/host" element={<ProtectedRoute requireHost><HostLayout /></ProtectedRoute>}>
                        <Route index element={<HostDashboard />} />
                        <Route path="calendar" element={<HostCalendar />} />
                        <Route path="listings" element={<HostListings />} />
                        <Route path="messages" element={<HostMessages />} />
                        <Route path="earnings" element={<HostEarnings />} />
                        <Route path="reviews" element={<HostReviews />} />
                        <Route path="bookings" element={<HostBookings />} />
                      </Route>

                      {/* Host Onboarding Routes - Auth required, host role not required (they're becoming hosts) */}
                      <Route path="/host/onboarding" element={<ProtectedRoute><OnboardingLayout /></ProtectedRoute>}>
                        <Route index element={<GetStarted />} />
                        {/* Step 1: About your camp */}
                        <Route path="step1" element={<Step1Intro />} />
                        <Route path="camp-type" element={<CampType />} />
                        <Route path="location" element={<Location />} />
                        <Route path="location-confirm" element={<LocationConfirm />} />
                        <Route path="environment" element={<Environment />} />
                        <Route path="capacity" element={<Capacity />} />
                        <Route path="zones" element={<Zones />} />
                        {/* Step 2: Make it stand out */}
                        <Route path="step2" element={<Step2Intro />} />
                        <Route path="facilities" element={<Facilities />} />
                        <Route path="photos" element={<Photos />} />
                        <Route path="title" element={<Title />} />
                        <Route path="description" element={<Description />} />
                        {/* Step 3: Pricing & Publish */}
                        <Route path="step3" element={<Step3Intro />} />
                        <Route path="booking-type" element={<BookingType />} />
                        <Route path="pricing" element={<Pricing />} />
                        <Route path="discounts" element={<Discounts />} />
                        <Route path="contact" element={<Contact />} />
                        <Route path="review" element={<Review />} />
                      </Route>

                      <Route path="/about" element={<About />} />
                      <Route path="/faq" element={<FAQ />} />
                      <Route path="/terms" element={<Terms />} />
                      <Route path="/privacy" element={<Privacy />} />
                      <Route path="/contact" element={<StaticContact />} />
                      <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
                        <ConsentBanner />
                      </BrowserRouter>
                    </ReviewsProvider>
                  </FavoritesProvider>
                </HostProvider>
              </DemoAuthProvider>
            </AuthProvider>
          </CurrencyProvider>
        </ConsentProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
