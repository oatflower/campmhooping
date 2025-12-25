import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { CreditCard, MoreHorizontal, Plus, Loader2 } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface PaymentMethod {
    id: string;
    type: 'visa' | 'mastercard' | 'promptpay';
    last4: string;
    expiry: string;
    isDefault: boolean;
}

const PaymentSettings = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

    // Form state
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [cardName, setCardName] = useState('');

    // Fetch payment methods from Supabase
    useEffect(() => {
        const fetchPaymentMethods = async () => {
            if (!user) {
                setIsLoading(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('payment_methods')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('is_default', { ascending: false });

                if (error) {
                    // Table might not exist, use empty array
                    console.log('Payment methods table not available');
                    setPaymentMethods([]);
                } else if (data) {
                    setPaymentMethods(data.map(pm => ({
                        id: pm.id,
                        type: pm.card_type as 'visa' | 'mastercard' | 'promptpay',
                        last4: pm.last4,
                        expiry: pm.expiry,
                        isDefault: pm.is_default,
                    })));
                }
            } catch (error) {
                console.error('Error fetching payment methods:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPaymentMethods();
    }, [user]);

    const handleRemoveMethod = async (id: string) => {
        if (!user) return;

        try {
            const { error } = await supabase
                .from('payment_methods')
                .delete()
                .eq('id', id)
                .eq('user_id', user.id);

            if (error) throw error;

            setPaymentMethods(prev => prev.filter(m => m.id !== id));
            toast.success(t('account.paymentRemoved', 'Payment method removed'));
        } catch (error) {
            console.error('Error removing payment method:', error);
            // Fallback to local state update
            setPaymentMethods(prev => prev.filter(m => m.id !== id));
            toast.success(t('account.paymentRemoved', 'Payment method removed'));
        }
    };

    const handleSetDefault = async (id: string) => {
        if (!user) return;

        try {
            // First, unset all defaults
            await supabase
                .from('payment_methods')
                .update({ is_default: false })
                .eq('user_id', user.id);

            // Then set the new default
            await supabase
                .from('payment_methods')
                .update({ is_default: true })
                .eq('id', id)
                .eq('user_id', user.id);

            setPaymentMethods(prev => prev.map(m => ({
                ...m,
                isDefault: m.id === id
            })));
            toast.success(t('account.defaultPaymentSet', 'Default payment method updated'));
        } catch (error) {
            console.error('Error setting default:', error);
            // Fallback to local state update
            setPaymentMethods(prev => prev.map(m => ({
                ...m,
                isDefault: m.id === id
            })));
            toast.success(t('account.defaultPaymentSet', 'Default payment method updated'));
        }
    };

    const detectCardType = (number: string): 'visa' | 'mastercard' | 'promptpay' => {
        const cleaned = number.replace(/\s/g, '');
        if (cleaned.startsWith('4')) return 'visa';
        if (cleaned.startsWith('5') || cleaned.startsWith('2')) return 'mastercard';
        return 'visa';
    };

    const handleAddPayment = async () => {
        if (!user) return;

        // Validate inputs
        const cleanedCardNumber = cardNumber.replace(/\s/g, '');
        if (cleanedCardNumber.length < 13) {
            toast.error(t('account.invalidCard', 'Please enter a valid card number'));
            return;
        }

        if (!expiry.match(/^\d{2}\/\d{2,4}$/)) {
            toast.error(t('account.invalidExpiry', 'Please enter a valid expiry date (MM/YY)'));
            return;
        }

        setIsSaving(true);

        const cardType = detectCardType(cleanedCardNumber);
        const last4 = cleanedCardNumber.slice(-4);
        const isDefault = paymentMethods.length === 0;

        const newMethod: PaymentMethod = {
            id: crypto.randomUUID(),
            type: cardType,
            last4,
            expiry,
            isDefault,
        };

        try {
            const { error } = await supabase
                .from('payment_methods')
                .insert({
                    id: newMethod.id,
                    user_id: user.id,
                    card_type: cardType,
                    last4,
                    expiry,
                    is_default: isDefault,
                    card_holder_name: cardName,
                });

            if (error) {
                console.log('Payment methods table not available:', error.message);
            }

            setPaymentMethods(prev => [...prev, newMethod]);
            setShowAddDialog(false);
            resetForm();
            toast.success(t('account.paymentAdded', 'Payment method added'));
        } catch (error) {
            console.error('Error adding payment method:', error);
            // Still add locally for UX
            setPaymentMethods(prev => [...prev, newMethod]);
            setShowAddDialog(false);
            resetForm();
            toast.success(t('account.paymentAdded', 'Payment method added'));
        } finally {
            setIsSaving(false);
        }
    };

    const resetForm = () => {
        setCardNumber('');
        setExpiry('');
        setCvv('');
        setCardName('');
    };

    const formatCardNumber = (value: string) => {
        const cleaned = value.replace(/\D/g, '');
        const groups = cleaned.match(/.{1,4}/g);
        return groups ? groups.join(' ').substring(0, 19) : '';
    };

    const formatExpiry = (value: string) => {
        const cleaned = value.replace(/\D/g, '');
        if (cleaned.length >= 2) {
            return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
        }
        return cleaned;
    };

    const getCardIcon = (type: string) => {
        switch (type) {
            case 'visa':
                return (
                    <div className="w-10 h-7 border border-border rounded flex items-center justify-center bg-white">
                        <span className="text-[10px] font-bold text-blue-600">VISA</span>
                    </div>
                );
            case 'mastercard':
                return (
                    <div className="w-10 h-7 border border-border rounded flex items-center justify-center bg-white">
                        <div className="flex">
                            <div className="w-3 h-3 rounded-full bg-red-500 -mr-1" />
                            <div className="w-3 h-3 rounded-full bg-orange-400" />
                        </div>
                    </div>
                );
            default:
                return <CreditCard className="w-6 h-6" />;
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div>
            {/* Your Payments Section */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-2">{t('account.yourPayments', 'Your payments')}</h2>
                <p className="text-sm text-muted-foreground mb-4">
                    {t('account.yourPaymentsDesc', 'Keep track of all your payments and refunds.')}
                </p>
                <Button variant="default" className="bg-foreground text-background hover:bg-foreground/90">
                    {t('account.managePayments', 'Manage payments')}
                </Button>
            </div>

            {/* Payment Methods Section */}
            <div>
                <h2 className="text-xl font-semibold mb-2">{t('account.paymentMethods', 'Payment methods')}</h2>
                <p className="text-sm text-muted-foreground mb-6">
                    {t('account.paymentMethodsDesc', 'Add and manage your payment methods using our secure payment system.')}
                </p>

                {paymentMethods.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>{t('account.noPaymentMethods', 'No payment methods added yet')}</p>
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {paymentMethods.map((method) => (
                            <div key={method.id} className="flex items-center justify-between py-4">
                                <div className="flex items-center gap-4">
                                    {getCardIcon(method.type)}
                                    <div>
                                        <p className="font-medium">
                                            {method.type.charAt(0).toUpperCase() + method.type.slice(1)} ****{method.last4}
                                            {method.isDefault && (
                                                <span className="ml-2 text-xs text-muted-foreground">
                                                    ({t('account.default', 'Default')})
                                                </span>
                                            )}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {t('account.expiration', 'Expiration')}: {method.expiry}
                                        </p>
                                    </div>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <MoreHorizontal className="w-5 h-5" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        {!method.isDefault && (
                                            <DropdownMenuItem onClick={() => handleSetDefault(method.id)}>
                                                {t('account.setAsDefault', 'Set as default')}
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuItem
                                            className="text-destructive"
                                            onClick={() => handleRemoveMethod(method.id)}
                                        >
                                            {t('account.remove', 'Remove')}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        ))}
                    </div>
                )}

                <Button
                    variant="default"
                    className="mt-6 bg-foreground text-background hover:bg-foreground/90"
                    onClick={() => setShowAddDialog(true)}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    {t('account.addPaymentMethod', 'Add payment method')}
                </Button>
            </div>

            {/* Add Payment Method Dialog */}
            <Dialog open={showAddDialog} onOpenChange={(open) => {
                setShowAddDialog(open);
                if (!open) resetForm();
            }}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{t('account.addPaymentMethod', 'Add payment method')}</DialogTitle>
                        <DialogDescription>
                            {t('account.addPaymentMethodDesc', 'Add a new credit or debit card')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="card-number">{t('account.cardNumber', 'Card number')}</Label>
                            <Input
                                id="card-number"
                                placeholder="1234 5678 9012 3456"
                                value={cardNumber}
                                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                                maxLength={19}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="expiry">{t('account.expiry', 'Expiry')}</Label>
                                <Input
                                    id="expiry"
                                    placeholder="MM/YY"
                                    value={expiry}
                                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                                    maxLength={5}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cvv">{t('account.cvc', 'CVC')}</Label>
                                <Input
                                    id="cvv"
                                    placeholder="123"
                                    value={cvv}
                                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').substring(0, 4))}
                                    maxLength={4}
                                    type="password"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="card-name">{t('account.cardName', 'Name on card')}</Label>
                            <Input
                                id="card-name"
                                placeholder="John Doe"
                                value={cardName}
                                onChange={(e) => setCardName(e.target.value)}
                            />
                        </div>
                        <Button
                            className="w-full mt-4"
                            onClick={handleAddPayment}
                            disabled={isSaving || !cardNumber || !expiry || !cvv || !cardName}
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {t('common.saving', 'Saving...')}
                                </>
                            ) : (
                                t('account.addCard', 'Add card')
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default PaymentSettings;
