import { useTranslation } from 'react-i18next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
    const { t } = useTranslation();

    const faqKeys = [
        'reservation',
        'pets',
        'cancellation',
        'safety',
        'gearRental',
        'becomeHost'
    ];

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />
            <main className="flex-1 container py-12 max-w-3xl">
                <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">{t('faq.title')}</h1>
                <div className="bg-card border rounded-xl p-6 md:p-8 shadow-sm">
                    <Accordion type="single" collapsible className="w-full">
                        {faqKeys.map((key, index) => (
                            <AccordionItem key={key} value={`item-${index}`}>
                                <AccordionTrigger className="text-left font-medium text-lg">
                                    {t(`faq.items.${key}.question`)}
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground leading-relaxed">
                                    {t(`faq.items.${key}.answer`)}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default FAQ;
