import { useTranslation } from 'react-i18next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const Contact = () => {
    const { t } = useTranslation();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate form submission
        alert("Message sent! (Simulation)");
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />
            <main className="flex-1 container py-12">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-3xl md:text-4xl font-bold mb-4">{t('footer.contactTitle', 'Get in Touch')}</h1>
                        <p className="text-muted-foreground text-lg">
                            Have questions or need help? We're here for you.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Contact Info */}
                        <div className="space-y-8">
                            <div className="bg-secondary/30 p-8 rounded-2xl space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-forest/10 flex items-center justify-center shrink-0">
                                        <Mail className="w-5 h-5 text-forest" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-1">Email Us</h3>
                                        <p className="text-muted-foreground text-sm mb-2">For general inquiries and support</p>
                                        <a href="mailto:hello@campthai.com" className="text-forest hover:underline">hello@campthai.com</a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-forest/10 flex items-center justify-center shrink-0">
                                        <Phone className="w-5 h-5 text-forest" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-1">Call Us</h3>
                                        <p className="text-muted-foreground text-sm mb-2">Mon-Fri from 9am to 6pm</p>
                                        <a href="tel:+662xxxxxxx" className="text-forest hover:underline">02-xxx-xxxx</a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-forest/10 flex items-center justify-center shrink-0">
                                        <MapPin className="w-5 h-5 text-forest" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-1">Office</h3>
                                        <p className="text-muted-foreground text-sm">
                                            123 Camping Road,<br />
                                            Chiang Mai, Thailand 50200
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Map Placeholder */}
                            <div className="bg-muted h-64 rounded-2xl flex items-center justify-center text-muted-foreground border border-border/50">
                                Map Integration Placeholder
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="bg-card border rounded-2xl p-8 shadow-sm">
                            <h2 className="text-xl font-semibold mb-6">Send us a message</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label htmlFor="name" className="text-sm font-medium">Name</label>
                                        <Input id="name" placeholder="John Doe" required />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="email" className="text-sm font-medium">Email</label>
                                        <Input id="email" type="email" placeholder="john@example.com" required />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                                    <Input id="subject" placeholder="How can we help?" required />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="message" className="text-sm font-medium">Message</label>
                                    <Textarea id="message" placeholder="Tell us more about your inquiry..." className="min-h-[150px]" required />
                                </div>
                                <Button type="submit" className="w-full bg-forest hover:bg-forest/90">
                                    <Send className="w-4 h-4 mr-2" />
                                    Send Message
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Contact;
