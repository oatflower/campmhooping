import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Search,
  Tent,
  Star,
  Music,
  TreePine,
  Moon,
  Camera,
  Heart,
  Loader2
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileBottomNav from '@/components/MobileBottomNav';
import { format, parseISO, isFuture, isPast, addDays, addWeeks } from 'date-fns';
import { th } from 'date-fns/locale';
import { supabase } from '@/lib/supabase';

interface CampEvent {
  id: string;
  title: string;
  description: string;
  campId: string;
  campName: string;
  campImage: string;
  location: string;
  startDate: string;
  endDate: string;
  startTime: string;
  price: number;
  maxParticipants: number;
  currentParticipants: number;
  category: 'camping' | 'music' | 'workshop' | 'stargazing' | 'photography' | 'wellness';
  tags: string[];
  hostName: string;
  hostAvatar: string;
  isFavorite?: boolean;
}

// Generate dynamic dates based on current date
const generateDynamicEvents = (): CampEvent[] => {
  const today = new Date();

  return [
    {
      id: 'E001',
      title: 'Full Moon Camping & Stargazing',
      description: 'Join us for a magical night under the stars. Expert astronomers will guide you through the constellations.',
      campId: '1',
      campName: 'Mountain View Camp',
      campImage: '/placeholder.svg',
      location: 'เชียงใหม่',
      startDate: format(addDays(today, 7), 'yyyy-MM-dd'),
      endDate: format(addDays(today, 8), 'yyyy-MM-dd'),
      startTime: '16:00',
      price: 1500,
      maxParticipants: 30,
      currentParticipants: 18,
      category: 'stargazing',
      tags: ['ดูดาว', 'คืนพระจันทร์เต็มดวง', 'ธรรมชาติ'],
      hostName: 'อาจารย์สมชาย',
      hostAvatar: '/placeholder.svg',
    },
    {
      id: 'E002',
      title: 'Camping & Acoustic Music Night',
      description: 'Enjoy live acoustic performances around the campfire with local artists.',
      campId: '2',
      campName: 'Riverside Camp',
      campImage: '/placeholder.svg',
      location: 'กาญจนบุรี',
      startDate: format(addDays(today, 14), 'yyyy-MM-dd'),
      endDate: format(addDays(today, 15), 'yyyy-MM-dd'),
      startTime: '15:00',
      price: 1200,
      maxParticipants: 50,
      currentParticipants: 35,
      category: 'music',
      tags: ['ดนตรีสด', 'แคมป์ไฟ', 'ริมแม่น้ำ'],
      hostName: 'วงดนตรี Forest Band',
      hostAvatar: '/placeholder.svg',
    },
    {
      id: 'E003',
      title: 'Wildlife Photography Workshop',
      description: 'Learn wildlife photography techniques from a National Geographic photographer.',
      campId: '3',
      campName: 'Forest Camp',
      campImage: '/placeholder.svg',
      location: 'ขอนแก่น',
      startDate: format(addWeeks(today, 3), 'yyyy-MM-dd'),
      endDate: format(addDays(addWeeks(today, 3), 2), 'yyyy-MM-dd'),
      startTime: '06:00',
      price: 3500,
      maxParticipants: 15,
      currentParticipants: 12,
      category: 'photography',
      tags: ['ถ่ายภาพ', 'สัตว์ป่า', 'workshop'],
      hostName: 'ช่างภาพวิชัย',
      hostAvatar: '/placeholder.svg',
    },
    {
      id: 'E004',
      title: 'Yoga & Meditation Retreat',
      description: 'A weekend retreat focusing on yoga, meditation, and connecting with nature.',
      campId: '4',
      campName: 'Peaceful Valley Camp',
      campImage: '/placeholder.svg',
      location: 'นครราชสีมา',
      startDate: format(addWeeks(today, 4), 'yyyy-MM-dd'),
      endDate: format(addDays(addWeeks(today, 4), 2), 'yyyy-MM-dd'),
      startTime: '14:00',
      price: 4500,
      maxParticipants: 20,
      currentParticipants: 8,
      category: 'wellness',
      tags: ['โยคะ', 'สมาธิ', 'ธรรมชาติบำบัด'],
      hostName: 'ครูโยคะ นิดา',
      hostAvatar: '/placeholder.svg',
    },
    // Past events for testing
    {
      id: 'E005',
      title: 'Winter Camping Festival',
      description: 'Annual winter camping festival with activities and workshops.',
      campId: '5',
      campName: 'Highland Camp',
      campImage: '/placeholder.svg',
      location: 'เชียงราย',
      startDate: format(addDays(today, -14), 'yyyy-MM-dd'),
      endDate: format(addDays(today, -12), 'yyyy-MM-dd'),
      startTime: '10:00',
      price: 2500,
      maxParticipants: 100,
      currentParticipants: 85,
      category: 'camping',
      tags: ['เทศกาล', 'แคมป์ปิ้ง', 'ฤดูหนาว'],
      hostName: 'CampThai Team',
      hostAvatar: '/placeholder.svg',
    },
  ];
};

const categoryIcons: Record<string, React.ReactNode> = {
  camping: <Tent className="w-4 h-4" />,
  music: <Music className="w-4 h-4" />,
  workshop: <TreePine className="w-4 h-4" />,
  stargazing: <Moon className="w-4 h-4" />,
  photography: <Camera className="w-4 h-4" />,
  wellness: <Star className="w-4 h-4" />,
};

const categoryLabels: Record<string, string> = {
  camping: 'Camping',
  music: 'Music',
  workshop: 'Workshop',
  stargazing: 'Stargazing',
  photography: 'Photography',
  wellness: 'Wellness',
};

const Events = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'th' ? th : undefined;

  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [events, setEvents] = useState<CampEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch events from Supabase or use dynamic mock data
  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        // Try to fetch from Supabase first
        const { data, error } = await supabase
          .from('events')
          .select(`
            id,
            title,
            description,
            camp_id,
            start_date,
            end_date,
            start_time,
            price,
            max_participants,
            current_participants,
            category,
            tags,
            host_name,
            host_avatar,
            camps (
              id,
              name,
              images,
              province
            )
          `)
          .order('start_date', { ascending: true });

        if (error) {
          // Table might not exist yet, use mock data
          console.log('Events table not found, using mock data');
          setEvents(generateDynamicEvents());
        } else if (data && data.length > 0) {
          // Transform Supabase data
          const transformedEvents: CampEvent[] = data.map((event: Record<string, unknown>) => ({
            id: event.id as string,
            title: event.title as string,
            description: event.description as string || '',
            campId: event.camp_id as string,
            campName: (event.camps as Record<string, unknown>)?.name as string || 'Camp',
            campImage: ((event.camps as Record<string, unknown>)?.images as string[])?.[0] || '/placeholder.svg',
            location: (event.camps as Record<string, unknown>)?.province as string || '',
            startDate: event.start_date as string,
            endDate: event.end_date as string,
            startTime: event.start_time as string || '14:00',
            price: event.price as number || 0,
            maxParticipants: event.max_participants as number || 20,
            currentParticipants: event.current_participants as number || 0,
            category: event.category as CampEvent['category'] || 'camping',
            tags: event.tags as string[] || [],
            hostName: event.host_name as string || 'Host',
            hostAvatar: event.host_avatar as string || '/placeholder.svg',
          }));
          setEvents(transformedEvents);
        } else {
          // No data, use mock
          setEvents(generateDynamicEvents());
        }
      } catch {
        // Fallback to mock data
        setEvents(generateDynamicEvents());
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const upcomingEvents = useMemo(() =>
    events.filter(e => isFuture(parseISO(e.startDate))),
    [events]
  );

  const pastEvents = useMemo(() =>
    events.filter(e => isPast(parseISO(e.endDate))),
    [events]
  );

  const filteredEvents = useMemo(() => {
    const sourceEvents = activeTab === 'upcoming' ? upcomingEvents : pastEvents;
    return sourceEvents.filter(event => {
      const matchesSearch = !searchQuery ||
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.campName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = !selectedCategory || event.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [activeTab, upcomingEvents, pastEvents, searchQuery, selectedCategory]);

  const EventCard = ({ event }: { event: CampEvent }) => {
    const spotsLeft = event.maxParticipants - event.currentParticipants;
    const isAlmostFull = spotsLeft <= 5;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate(`/events/${event.id}`)}
        className="bg-card rounded-xl overflow-hidden shadow-sm border border-border cursor-pointer hover:shadow-md transition-shadow"
      >
        {/* Image */}
        <div className="relative h-40">
          <img
            src={event.campImage}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

          {/* Category Badge */}
          <div className="absolute top-3 left-3">
            <Badge className="bg-white/90 text-foreground gap-1">
              {categoryIcons[event.category]}
              {categoryLabels[event.category]}
            </Badge>
          </div>

          {/* Favorite Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Toggle favorite
            }}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center"
          >
            <Heart className={`w-4 h-4 ${event.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
          </button>

          {/* Date Badge */}
          <div className="absolute bottom-3 left-3">
            <div className="bg-white rounded-lg px-3 py-1.5 text-center">
              <p className="text-xs font-bold text-primary">
                {format(parseISO(event.startDate), 'd', { locale })}
              </p>
              <p className="text-xs text-muted-foreground">
                {format(parseISO(event.startDate), 'MMM', { locale })}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-foreground line-clamp-2 mb-2">{event.title}</h3>

          <div className="space-y-1 text-sm text-muted-foreground mb-3">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>{event.campName}, {event.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{event.startTime}</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-3">
            {event.tags.slice(0, 3).map((tag, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <div>
              <p className="text-lg font-bold text-primary">฿{event.price.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{t('events.perPerson', '/person')}</p>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-1 text-sm">
                <Users className="w-3 h-3" />
                <span>{event.currentParticipants}/{event.maxParticipants}</span>
              </div>
              {isAlmostFull && (
                <p className="text-xs text-red-500 font-medium">
                  {t('events.spotsLeft', { count: spotsLeft }, `Only ${spotsLeft} spots left!`)}
                </p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const categories = ['camping', 'music', 'stargazing', 'photography', 'wellness', 'workshop'];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />

      <main className="container py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{t('events.title', 'Camping Events')}</h1>
          <p className="text-muted-foreground">{t('events.subtitle', 'Join unique camping experiences and meet fellow campers')}</p>
        </div>

        {/* Search & Filter */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t('events.searchPlaceholder', 'Search events...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            <Button
              variant={selectedCategory === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(null)}
              className="flex-shrink-0"
            >
              {t('events.all', 'All')}
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="flex-shrink-0 gap-1"
              >
                {categoryIcons[category]}
                {categoryLabels[category]}
              </Button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'upcoming' | 'past')}>
          <TabsList className="mb-6">
            <TabsTrigger value="upcoming" className="gap-2">
              {t('events.upcoming', 'Upcoming')}
              <Badge variant="secondary">{upcomingEvents.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="past">
              {t('events.past', 'Past Events')}
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <TabsContent value={activeTab} className="mt-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : filteredEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">
                    {activeTab === 'upcoming'
                      ? t('events.noUpcoming', 'No upcoming events')
                      : t('events.noPast', 'No past events')}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {t('events.checkBackLater', 'Check back later for new events')}
                  </p>
                </div>
              )}
            </TabsContent>
          </AnimatePresence>
        </Tabs>

        {/* Host CTA */}
        <div className="mt-12 p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl text-center">
          <h3 className="text-xl font-bold mb-2">{t('events.hostEvent', 'Want to host an event?')}</h3>
          <p className="text-muted-foreground mb-4">
            {t('events.hostEventDesc', 'Share your passion with the camping community')}
          </p>
          <Button variant="booking">
            {t('events.createEvent', 'Create an Event')}
          </Button>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default Events;
