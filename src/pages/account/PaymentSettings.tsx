import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { CreditCard, MoreHorizontal, Plus } from 'lucide-react';
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

interface PaymentMethod {
    id: string;
    type: 'visa' | 'mastercard' | 'promptpay';
    last4: string;
    expiry: string;
    isDefault: boolean;
}

const PaymentSettings = () => {
    const { t } = useTranslation();
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
        { id: '1', type: 'visa', last4: '8893', expiry: '02/2026', isDefault: true },
    ]);

    const handleRemoveMethod = (id: string) => {
        setPaymentMethods(prev => prev.filter(m => m.id !== id));
        toast.success(t('account.paymentRemoved', 'Payment method removed'));
    };

    const handleSetDefault = (id: string) => {
        setPaymentMethods(prev => prev.map(m => ({
            ...m,
            isDefault: m.id === id
        })));
        toast.success(t('account.defaultPaymentSet', 'Default payment method updated'));
    };

    const handleAddPayment = () => {
        // Mock adding a new payment method
        const newMethod: PaymentMethod = {
            id: Date.now().toString(),
            type: 'mastercard',
            last4: Math.floor(1000 + Math.random() * 9000).toString(),
            expiry: '12/2027',
            isDefault: false
        };
        setPaymentMethods(prev => [...prev, newMethod]);
        setShowAddDialog(false);
        toast.success(t('account.paymentAdded', 'Payment method added'));
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

                <div className="divide-y divide-border">
                    {paymentMethods.map((method) => (
                        <div key={method.id} className="flex items-center justify-between py-4">
                            <div className="flex items-center gap-4">
                                {getCardIcon(method.type)}
                                <div>
                                    <p className="font-medium">
                                        {method.type.charAt(0).toUpperCase() + method.type.slice(1)} {method.last4}
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
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
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
                            <Input id="card-number" placeholder="1234 5678 9012 3456" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="expiry">{t('account.expiry', 'Expiry')}</Label>
                                <Input id="expiry" placeholder="MM/YY" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cvv">{t('account.cvc', 'CVC')}</Label>
                                <Input id="cvv" placeholder="123" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="card-name">{t('account.cardName', 'Name on card')}</Label>
                            <Input id="card-name" placeholder="John Doe" />
                        </div>
                        <Button className="w-full mt-4" onClick={handleAddPayment}>
                            {t('account.addCard', 'Add card')}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default PaymentSettings;
