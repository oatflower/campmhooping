import { useTranslation } from 'react-i18next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Trees, Heart, MapPin, Users } from 'lucide-react';

const About = () => {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />
            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative py-20 md:py-32 bg-forest/5 overflow-hidden">
                    <div className="container relative z-10">
                        <div className="max-w-3xl mx-auto text-center space-y-6">
                            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
                                Connecting People with <span className="text-forest">Nature</span>
                            </h1>
                            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                                CampThai is Thailand's premier camping booking platform. We're on a mission to make the outdoors accessible to everyone, ensuring every trip is safe, memorable, and sustainable.
                            </p>
                        </div>
                    </div>
                    {/* Decorative background elements could go here */}
                </section>

                {/* Values Grid */}
                <section className="py-16 md:py-24">
                    <div className="container">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                            <div className="space-y-4 text-center">
                                <div className="w-16 h-16 rounded-2xl bg-forest/10 flex items-center justify-center mx-auto text-forest">
                                    <Trees className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold">Nature First</h3>
                                <p className="text-muted-foreground">
                                    We verify every campsite to ensure they meet our environmental and sustainability standards.
                                </p>
                            </div>
                            <div className="space-y-4 text-center">
                                <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center mx-auto text-orange-500">
                                    <Heart className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold">Community Driven</h3>
                                <p className="text-muted-foreground">
                                    Built by campers, for campers. Our reviews are real, and our community guidelines ensure respect for all.
                                </p>
                            </div>
                            <div className="space-y-4 text-center">
                                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto text-blue-500">
                                    <MapPin className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold">Curated Adventures</h3>
                                <p className="text-muted-foreground">
                                    From hidden gems to glamping luxury, we handpick the best outdoor experiences across Thailand.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="py-16 bg-secondary/30">
                    <div className="container">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                            <div>
                                <div className="text-4xl font-bold text-forest mb-2">500+</div>
                                <div className="text-sm text-muted-foreground">Active Campsites</div>
                            </div>
                            <div>
                                <div className="text-4xl font-bold text-forest mb-2">50k+</div>
                                <div className="text-sm text-muted-foreground">Happy Campers</div>
                            </div>
                            <div>
                                <div className="text-4xl font-bold text-forest mb-2">72</div>
                                <div className="text-sm text-muted-foreground">Provinces Covered</div>
                            </div>
                            <div>
                                <div className="text-4xl font-bold text-forest mb-2">4.8</div>
                                <div className="text-sm text-muted-foreground">Average Rating</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Join CTA */}
                <section className="py-20">
                    <div className="container text-center max-w-2xl mx-auto space-y-8">
                        <Users className="w-16 h-16 mx-auto text-muted-foreground/50" />
                        <h2 className="text-3xl font-bold">Join Our Team</h2>
                        <p className="text-muted-foreground">
                            We are always looking for passionate people to join our growing team. If you love the outdoors and technology, we'd love to hear from you.
                        </p>
                        <a href="mailto:careers@campthai.com" className="inline-block bg-forest text-white px-8 py-3 rounded-full font-medium hover:bg-forest/90 transition-colors">
                            View Openings
                        </a>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default About;
