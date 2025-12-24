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
import Index from "./pages/Index";
import CampList from "./pages/CampList";
import CampDetail from "./pages/CampDetail";
import CategoryDetail from "./pages/CategoryDetail";
import Auth from "./pages/Auth";
import Gear from "./pages/Gear";
import Payment from "./pages/Payment";
import BookingConfirmation from "./pages/BookingConfirmation";
import Favorites from "./pages/Favorites";
import Community from "./pages/Community";
import CampToday from "./pages/CampToday";
import NotFound from "./pages/NotFound";
import About from "./pages/static/About";
import FAQ from "./pages/static/FAQ";
import StaticContact from "./pages/static/Contact";
import Terms from "./pages/static/Terms";
import Privacy from "./pages/static/Privacy";
import Profile from "./pages/Profile";
import Messages from "./pages/Messages";
import AccountLayout from "./pages/account/AccountLayout";
import PersonalInfo from "./pages/account/PersonalInfo";
import LoginSecurity from "./pages/account/LoginSecurity";
import PrivacySettings from "./pages/account/PrivacySettings";
import NotificationSettings from "./pages/account/NotificationSettings";
import PaymentSettings from "./pages/account/PaymentSettings";

// Host Pages
import HostLayout from "./pages/host/HostLayout";
import HostDashboard from "./pages/host/HostDashboard";
import HostCalendar from "./pages/host/HostCalendar";
import HostListings from "./pages/host/HostListings";
import HostMessages from "./pages/host/HostMessages";
import OnboardingLayout from "./pages/host/onboarding/OnboardingLayout";
import GetStarted from "./pages/host/onboarding/GetStarted";
import Step1Intro from "./pages/host/onboarding/Step1Intro";
import CampType from "./pages/host/onboarding/CampType";
import Location from "./pages/host/onboarding/Location";
import LocationConfirm from "./pages/host/onboarding/LocationConfirm";
import Environment from "./pages/host/onboarding/Environment";
import Capacity from "./pages/host/onboarding/Capacity";
import Zones from "./pages/host/onboarding/Zones";
import Step2Intro from "./pages/host/onboarding/Step2Intro";
import Facilities from "./pages/host/onboarding/Facilities";
import Photos from "./pages/host/onboarding/Photos";
import Title from "./pages/host/onboarding/Title";
import Description from "./pages/host/onboarding/Description";
import Step3Intro from "./pages/host/onboarding/Step3Intro";
import BookingType from "./pages/host/onboarding/BookingType";
import Pricing from "./pages/host/onboarding/Pricing";
import Discounts from "./pages/host/onboarding/Discounts";
import Contact from "./pages/host/onboarding/Contact";
import Review from "./pages/host/onboarding/Review";

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
                      <Route path="/register" element={<Auth />} />
                      <Route path="/login" element={<Auth />} />
                      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                      <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />

                      {/* Account Settings Routes */}
                      <Route path="/account" element={<ProtectedRoute><AccountLayout /></ProtectedRoute>}>
                        <Route index element={<PersonalInfo />} />
                        <Route path="login-security" element={<LoginSecurity />} />
                        <Route path="privacy" element={<PrivacySettings />} />
                        <Route path="notifications" element={<NotificationSettings />} />
                        <Route path="payments" element={<PaymentSettings />} />
                      </Route>

                      <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
                      <Route path="/community" element={<Community />} />
                      <Route path="/camp-today/:campId" element={<CampToday />} />

                      {/* Host Routes */}
                      <Route path="/host" element={<ProtectedRoute requireHost><HostLayout /></ProtectedRoute>}>
                        <Route index element={<HostDashboard />} />
                        <Route path="calendar" element={<HostCalendar />} />
                        <Route path="listings" element={<HostListings />} />
                        <Route path="messages" element={<HostMessages />} />
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
