import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';

const Privacy = () => {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />
            <main className="flex-1 container py-12 max-w-4xl">
                <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
                <p className="text-muted-foreground mb-8">
                    Compliant with Thailand's Personal Data Protection Act (PDPA) B.E. 2562 (2019)
                </p>

                <div className="prose prose-stone dark:prose-invert max-w-none space-y-8">
                    {/* Data Controller */}
                    <section>
                        <h2 className="text-xl font-semibold mb-3">1. Data Controller</h2>
                        <div className="text-muted-foreground space-y-2">
                            <p><strong>Company Name:</strong> Campii Connect Co., Ltd.</p>
                            <p><strong>Address:</strong> Bangkok, Thailand</p>
                            <p><strong>Data Protection Officer:</strong> privacy@campiiconnect.com</p>
                            <p>For any privacy-related inquiries or to exercise your rights, please contact our Data Protection Officer.</p>
                        </div>
                    </section>

                    {/* Information We Collect */}
                    <section>
                        <h2 className="text-xl font-semibold mb-3">2. Personal Data We Collect</h2>
                        <div className="text-muted-foreground space-y-4">
                            <p>We collect the following categories of personal data:</p>

                            <div className="pl-4 space-y-3">
                                <div>
                                    <h4 className="font-medium text-foreground">2.1 Identity Data</h4>
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li>Full name and display name</li>
                                        <li>Email address</li>
                                        <li>Phone number</li>
                                        <li>Profile photograph</li>
                                        <li>Date of birth (for age verification)</li>
                                    </ul>
                                </div>

                                <div>
                                    <h4 className="font-medium text-foreground">2.2 Location Data</h4>
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li>GPS coordinates (for camp locations)</li>
                                        <li>Search location preferences</li>
                                    </ul>
                                </div>

                                <div>
                                    <h4 className="font-medium text-foreground">2.3 Transaction Data</h4>
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li>Booking history and details</li>
                                        <li>Payment information (processed by secure payment providers)</li>
                                        <li>Transaction amounts and dates</li>
                                    </ul>
                                </div>

                                <div>
                                    <h4 className="font-medium text-foreground">2.4 Technical Data</h4>
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li>IP address</li>
                                        <li>Browser type and version</li>
                                        <li>Device information</li>
                                        <li>Usage patterns and preferences</li>
                                    </ul>
                                </div>

                                <div>
                                    <h4 className="font-medium text-foreground">2.5 Communication Data</h4>
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li>Messages between guests and hosts</li>
                                        <li>Reviews and ratings</li>
                                        <li>Support communications</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Legal Basis */}
                    <section>
                        <h2 className="text-xl font-semibold mb-3">3. Legal Basis for Processing</h2>
                        <div className="text-muted-foreground space-y-2">
                            <p>We process your personal data based on the following legal grounds:</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li><strong>Consent:</strong> When you explicitly agree to specific processing activities</li>
                                <li><strong>Contract:</strong> When processing is necessary to fulfill our booking services</li>
                                <li><strong>Legal Obligation:</strong> When required by law (e.g., tax records)</li>
                                <li><strong>Legitimate Interest:</strong> For platform security and fraud prevention</li>
                            </ul>
                        </div>
                    </section>

                    {/* Purpose of Processing */}
                    <section>
                        <h2 className="text-xl font-semibold mb-3">4. How We Use Your Data</h2>
                        <div className="text-muted-foreground space-y-2">
                            <p>We use your personal data for the following purposes:</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>To create and manage your account</li>
                                <li>To process and fulfill bookings</li>
                                <li>To facilitate communication between guests and hosts</li>
                                <li>To process payments securely</li>
                                <li>To provide customer support</li>
                                <li>To send service-related notifications</li>
                                <li>To improve our platform and user experience (with consent)</li>
                                <li>To send marketing communications (with consent)</li>
                                <li>To ensure platform safety and prevent fraud</li>
                            </ul>
                        </div>
                    </section>

                    {/* Data Sharing */}
                    <section>
                        <h2 className="text-xl font-semibold mb-3">5. Data Sharing</h2>
                        <div className="text-muted-foreground space-y-2">
                            <p>We share your data with:</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li><strong>Hosts:</strong> Your name and contact details when you make a booking</li>
                                <li><strong>Payment Processors:</strong> Payment information for transaction processing</li>
                                <li><strong>Service Providers:</strong> Third-party services that help operate our platform</li>
                                <li><strong>Legal Authorities:</strong> When required by law or legal process</li>
                            </ul>
                            <p className="mt-2 font-medium">We do not sell your personal data to third parties.</p>
                        </div>
                    </section>

                    {/* Third-Party Processors */}
                    <section>
                        <h2 className="text-xl font-semibold mb-3">6. Third-Party Service Providers</h2>
                        <div className="text-muted-foreground space-y-2">
                            <p>We work with the following categories of service providers:</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li><strong>Database Hosting:</strong> Supabase (data storage and authentication)</li>
                                <li><strong>Weather Services:</strong> Weather API providers (location-based weather data)</li>
                                <li><strong>Analytics:</strong> Usage analytics (with your consent)</li>
                            </ul>
                            <p className="mt-2">All third-party processors are bound by data processing agreements compliant with PDPA requirements.</p>
                        </div>
                    </section>

                    {/* Cross-Border Transfer */}
                    <section>
                        <h2 className="text-xl font-semibold mb-3">7. Cross-Border Data Transfer</h2>
                        <div className="text-muted-foreground space-y-2">
                            <p>Some of our service providers may process data outside of Thailand. When this occurs:</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>We ensure adequate protection measures are in place</li>
                                <li>Data is only transferred to countries with adequate data protection standards</li>
                                <li>We use standard contractual clauses where necessary</li>
                            </ul>
                        </div>
                    </section>

                    {/* Data Retention */}
                    <section>
                        <h2 className="text-xl font-semibold mb-3">8. Data Retention</h2>
                        <div className="text-muted-foreground space-y-2">
                            <p>We retain your data for the following periods:</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li><strong>Account Data:</strong> Until you delete your account, plus 30 days</li>
                                <li><strong>Booking Data:</strong> 24 hours after checkout (operational), 7 years (financial records)</li>
                                <li><strong>Messages:</strong> 24 hours after checkout</li>
                                <li><strong>Payment Records:</strong> 7 years (legal requirement)</li>
                                <li><strong>Reviews:</strong> Anonymized after account deletion</li>
                                <li><strong>Consent Records:</strong> 3 years after withdrawal</li>
                            </ul>
                        </div>
                    </section>

                    {/* Your Rights */}
                    <section>
                        <h2 className="text-xl font-semibold mb-3">9. Your Rights Under PDPA</h2>
                        <div className="text-muted-foreground space-y-2">
                            <p>You have the following rights regarding your personal data:</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li><strong>Right to Access:</strong> Request a copy of your personal data</li>
                                <li><strong>Right to Rectification:</strong> Correct inaccurate or incomplete data</li>
                                <li><strong>Right to Erasure:</strong> Request deletion of your personal data</li>
                                <li><strong>Right to Data Portability:</strong> Export your data in a machine-readable format</li>
                                <li><strong>Right to Restrict Processing:</strong> Limit how we use your data</li>
                                <li><strong>Right to Object:</strong> Object to certain processing activities</li>
                                <li><strong>Right to Withdraw Consent:</strong> Withdraw previously given consent at any time</li>
                            </ul>
                            <p className="mt-4">
                                To exercise your rights, visit your{' '}
                                <Link to="/account/privacy" className="text-primary underline">
                                    Privacy Settings
                                </Link>{' '}
                                or contact our Data Protection Officer.
                            </p>
                        </div>
                    </section>

                    {/* Data Security */}
                    <section>
                        <h2 className="text-xl font-semibold mb-3">10. Data Security</h2>
                        <div className="text-muted-foreground space-y-2">
                            <p>We implement appropriate security measures including:</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Encryption of data in transit (HTTPS/TLS)</li>
                                <li>Secure authentication mechanisms</li>
                                <li>Regular security assessments</li>
                                <li>Access controls and monitoring</li>
                                <li>Incident response procedures</li>
                            </ul>
                        </div>
                    </section>

                    {/* Cookies */}
                    <section>
                        <h2 className="text-xl font-semibold mb-3">11. Cookies and Local Storage</h2>
                        <div className="text-muted-foreground space-y-2">
                            <p>We use cookies and local storage for:</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li><strong>Essential:</strong> Required for platform functionality (always active)</li>
                                <li><strong>Preferences:</strong> Remembering your settings and favorites</li>
                                <li><strong>Analytics:</strong> Understanding usage patterns (with consent)</li>
                                <li><strong>Marketing:</strong> Personalized advertising (with consent)</li>
                            </ul>
                            <p className="mt-2">You can manage your preferences in our consent banner or Privacy Settings.</p>
                        </div>
                    </section>

                    {/* Children's Privacy */}
                    <section>
                        <h2 className="text-xl font-semibold mb-3">12. Children's Privacy</h2>
                        <div className="text-muted-foreground space-y-2">
                            <p>Our platform is not intended for users under 18 years of age. We do not knowingly collect personal data from children. If we become aware of such collection, we will delete the data promptly.</p>
                        </div>
                    </section>

                    {/* Complaints */}
                    <section>
                        <h2 className="text-xl font-semibold mb-3">13. Complaints</h2>
                        <div className="text-muted-foreground space-y-2">
                            <p>If you have concerns about our data practices, you may:</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Contact our Data Protection Officer at privacy@campiiconnect.com</li>
                                <li>Lodge a complaint with the Personal Data Protection Committee (PDPC) of Thailand</li>
                            </ul>
                            <p className="mt-2">
                                <strong>PDPC Contact:</strong><br />
                                Website: <a href="https://www.pdpc.or.th" className="text-primary underline" target="_blank" rel="noopener noreferrer">www.pdpc.or.th</a><br />
                                Email: pdpc@mdes.go.th
                            </p>
                        </div>
                    </section>

                    {/* Policy Updates */}
                    <section>
                        <h2 className="text-xl font-semibold mb-3">14. Policy Updates</h2>
                        <div className="text-muted-foreground space-y-2">
                            <p>We may update this Privacy Policy periodically. Significant changes will be communicated via email or platform notification. Continued use of our services after updates constitutes acceptance of the revised policy.</p>
                        </div>
                    </section>

                    <div className="pt-8 text-sm text-muted-foreground border-t space-y-2">
                        <p><strong>Last updated:</strong> December 2025</p>
                        <p><strong>Policy Version:</strong> 1.0</p>
                        <p>
                            <Link to="/account/privacy" className="text-primary underline">
                                Manage your privacy preferences
                            </Link>
                        </p>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Privacy;
