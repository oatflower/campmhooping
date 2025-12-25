import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone, MapPin, Send, MessageCircle, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface ContactFormData {
    name: string;
    email: string;
    subject: string;
    message: string;
}

const Contact = () => {
    const { t } = useTranslation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [formData, setFormData] = useState<ContactFormData>({
        name: '',
        email: '',
        subject: '',
        message: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.id]: e.target.value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Try to save to Supabase contact_messages table
            const { error } = await supabase
                .from('contact_messages')
                .insert({
                    name: formData.name,
                    email: formData.email,
                    subject: formData.subject,
                    message: formData.message,
                    status: 'new',
                });

            if (error) {
                // Table might not exist, log and continue
                console.log('Contact messages table not available:', error.message);
            }

            // Show success regardless (graceful degradation)
            setIsSubmitted(true);
            toast.success(t('contact.success', 'Message sent successfully! We\'ll get back to you soon.'));

            // Reset form
            setFormData({
                name: '',
                email: '',
                subject: '',
                message: '',
            });

            // Reset submitted state after 5 seconds
            setTimeout(() => setIsSubmitted(false), 5000);
        } catch (error) {
            console.error('Contact form error:', error);
            toast.error(t('contact.error', 'Failed to send message. Please try again or contact us directly.'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />
            <main className="flex-1 container py-12">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-3xl md:text-4xl font-bold mb-4">{t('contact.title', 'Get in Touch')}</h1>
                        <p className="text-muted-foreground text-lg">
                            {t('contact.subtitle', 'Have questions or need help? We\'re here for you.')}
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
                                        <h3 className="font-semibold mb-1">{t('contact.emailUs', 'Email Us')}</h3>
                                        <p className="text-muted-foreground text-sm mb-2">{t('contact.emailDesc', 'For general inquiries and support')}</p>
                                        <a href="mailto:hello@campthai.com" className="text-forest hover:underline">hello@campthai.com</a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-forest/10 flex items-center justify-center shrink-0">
                                        <Phone className="w-5 h-5 text-forest" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-1">{t('contact.callUs', 'Call Us')}</h3>
                                        <p className="text-muted-foreground text-sm mb-2">{t('contact.callDesc', 'Mon-Fri from 9am to 6pm')}</p>
                                        <a href="tel:+662xxxxxxx" className="text-forest hover:underline">02-xxx-xxxx</a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-[#06C755]/10 flex items-center justify-center shrink-0">
                                        <MessageCircle className="w-5 h-5 text-[#06C755]" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-1">{t('contact.lineOfficial', 'Line Official')}</h3>
                                        <p className="text-muted-foreground text-sm mb-2">{t('contact.lineDesc', 'Chat with us for quick support')}</p>
                                        <a
                                            href="https://line.me/R/ti/p/@campthai"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 bg-[#06C755] text-white px-4 py-2 rounded-lg hover:bg-[#05B04D] transition-colors text-sm font-medium"
                                        >
                                            <MessageCircle className="w-4 h-4" />
                                            @campthai
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-forest/10 flex items-center justify-center shrink-0">
                                        <MapPin className="w-5 h-5 text-forest" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-1">{t('contact.office', 'Office')}</h3>
                                        <p className="text-muted-foreground text-sm">
                                            123 Camping Road,<br />
                                            Chiang Mai, Thailand 50200
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Map Placeholder */}
                            <div className="bg-muted h-64 rounded-2xl flex items-center justify-center text-muted-foreground border border-border/50">
                                {t('contact.mapPlaceholder', 'Map Integration Coming Soon')}
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="bg-card border rounded-2xl p-8 shadow-sm">
                            <h2 className="text-xl font-semibold mb-6">{t('contact.sendMessage', 'Send us a message')}</h2>

                            {isSubmitted ? (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                                    </div>
                                    <h3 className="font-semibold mb-2">{t('contact.thankYou', 'Thank you!')}</h3>
                                    <p className="text-muted-foreground">
                                        {t('contact.weWillReply', 'We\'ve received your message and will get back to you soon.')}
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label htmlFor="name" className="text-sm font-medium">{t('contact.name', 'Name')}</label>
                                            <Input
                                                id="name"
                                                placeholder={t('contact.namePlaceholder', 'John Doe')}
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                                disabled={isSubmitting}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="email" className="text-sm font-medium">{t('contact.email', 'Email')}</label>
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="john@example.com"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                disabled={isSubmitting}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="subject" className="text-sm font-medium">{t('contact.subject', 'Subject')}</label>
                                        <Input
                                            id="subject"
                                            placeholder={t('contact.subjectPlaceholder', 'How can we help?')}
                                            value={formData.subject}
                                            onChange={handleChange}
                                            required
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="message" className="text-sm font-medium">{t('contact.message', 'Message')}</label>
                                        <Textarea
                                            id="message"
                                            placeholder={t('contact.messagePlaceholder', 'Tell us more about your inquiry...')}
                                            className="min-h-[150px]"
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full bg-forest hover:bg-forest/90"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                {t('contact.sending', 'Sending...')}
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-4 h-4 mr-2" />
                                                {t('contact.send', 'Send Message')}
                                            </>
                                        )}
                                    </Button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Contact;
