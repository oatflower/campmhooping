import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Terms = () => {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />
            <main className="flex-1 container py-12 max-w-4xl">
                <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
                <div className="prose prose-stone dark:prose-invert max-w-none space-y-8">
                    <section>
                        <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
                        <p className="text-muted-foreground">
                            By accessing and using CampThai, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">2. Description of Service</h2>
                        <p className="text-muted-foreground">
                            CampThai provides a platform for users to discover and book camping sites ("Camps") and for campsite owners ("Hosts") to list their properties. We act as an intermediary to facilitate these bookings.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">3. User Conduct</h2>
                        <p className="text-muted-foreground">
                            You agree to use the service only for lawful purposes. You are prohibited from posting or transmitting to or from this site any unlawful, threatening, libelous, defamatory, obscene, or pornographic material.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">4. Booking and Cancellation</h2>
                        <p className="text-muted-foreground">
                            Bookings are subject to the specific cancellation policy selected by the Host. CampThai may charge a service fee for successful bookings, which is non-refundable unless otherwise stated.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">5. Liability Disclaimer</h2>
                        <p className="text-muted-foreground">
                            CampThai is not responsible for the condition of the campsites or the actions of Hosts or Campers. Camping involves inherent risks, and by using our service, you acknowledge and assume these risks.
                        </p>
                    </section>

                    <div className="pt-8 text-sm text-muted-foreground border-t">
                        Last updated: December 2025
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Terms;
