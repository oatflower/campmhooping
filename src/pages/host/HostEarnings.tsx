import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Wallet,
  CreditCard,
  Building2,
  ChevronRight,
  Info,
  Loader2
} from 'lucide-react';
import { getHostEarnings, HostEarningsSummary, HostEarningsRecord } from '@/services/bookingCrud';

// Transform API data to UI format
interface Transaction {
  id: string;
  type: string;
  amount: number;
  date: string;
  status: string;
  description: string;
  bankLast4?: string;
  guestName?: string;
}

const transformTransaction = (record: HostEarningsRecord): Transaction => ({
  id: record.id,
  type: 'earning',
  amount: record.amount,
  date: record.created_at,
  status: record.status,
  description: `Booking - ${record.booking?.camps?.name || 'Camp'}`,
  guestName: record.guest?.name,
});

const mockPayoutMethods = [
  {
    id: '1',
    type: 'bank',
    name: 'Kasikorn Bank',
    last4: '4521',
    isDefault: true,
  },
];

const HostEarnings = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [earnings, setEarnings] = useState<HostEarningsSummary>({
    available: 0,
    pending: 0,
    totalEarned: 0,
    thisMonth: 0,
    lastMonth: 0,
    transactions: [],
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Fetch earnings from API
  const fetchEarnings = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getHostEarnings();
      if (result.success && result.data) {
        setEarnings(result.data);
        setTransactions(result.data.transactions.map(transformTransaction));
      }
    } catch (error) {
      console.error('Error fetching earnings:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEarnings();
  }, [fetchEarnings]);

  const percentChange = earnings.lastMonth > 0
    ? ((earnings.thisMonth - earnings.lastMonth) / earnings.lastMonth) * 100
    : earnings.thisMonth > 0 ? 100 : 0;
  const isPositive = percentChange >= 0;

  return (
    <main className="container py-8 max-w-5xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">{t('hostEarnings.title', 'Earnings')}</h1>
            <p className="text-muted-foreground">{t('hostEarnings.subtitle', 'Track your income and payouts')}</p>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            {t('hostEarnings.exportReport', 'Export Report')}
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Available Balance */}
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-primary mb-2">
                <Wallet className="w-5 h-5" />
                <span className="text-sm font-medium">{t('hostEarnings.available', 'Available Balance')}</span>
              </div>
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              ) : (
                <p className="text-3xl font-bold text-primary">฿{earnings.available.toLocaleString()}</p>
              )}
              <Button size="sm" className="mt-4 w-full" variant="booking" disabled={earnings.available === 0}>
                {t('hostEarnings.requestPayout', 'Request Payout')}
              </Button>
            </CardContent>
          </Card>

          {/* Pending */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Clock className="w-5 h-5" />
                <span className="text-sm font-medium">{t('hostEarnings.pending', 'Pending')}</span>
              </div>
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <p className="text-3xl font-bold">฿{earnings.pending.toLocaleString()}</p>
              )}
              <p className="text-sm text-muted-foreground mt-2">
                {t('hostEarnings.pendingDesc', 'Will be available after check-out')}
              </p>
            </CardContent>
          </Card>

          {/* This Month */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Calendar className="w-5 h-5" />
                <span className="text-sm font-medium">{t('hostEarnings.thisMonth', 'This Month')}</span>
              </div>
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <p className="text-3xl font-bold">฿{earnings.thisMonth.toLocaleString()}</p>
              )}
              <div className={`flex items-center gap-1 mt-2 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span className="text-sm font-medium">{isPositive ? '+' : ''}{percentChange.toFixed(1)}%</span>
                <span className="text-sm text-muted-foreground ml-1">{t('hostEarnings.vsLastMonth', 'vs last month')}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">{t('hostEarnings.overviewTab', 'Overview')}</TabsTrigger>
            <TabsTrigger value="transactions">{t('hostEarnings.transactionsTab', 'Transactions')}</TabsTrigger>
            <TabsTrigger value="payouts">{t('hostEarnings.payoutsTab', 'Payout Methods')}</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  {t('hostEarnings.earningsSummary', 'Earnings Summary')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('hostEarnings.totalEarned', 'Total Earned')}</p>
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <p className="text-xl font-bold">฿{earnings.totalEarned.toLocaleString()}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('hostEarnings.avgPerBooking', 'Avg. per Booking')}</p>
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <p className="text-xl font-bold">
                        ฿{transactions.length > 0 ? Math.round(earnings.totalEarned / transactions.length).toLocaleString() : 0}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('hostEarnings.totalPayouts', 'Total Payouts')}</p>
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <p className="text-xl font-bold">฿{earnings.available.toLocaleString()}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('hostEarnings.completedBookings', 'Completed Bookings')}</p>
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <p className="text-xl font-bold">{transactions.filter(t => t.status === 'completed').length}</p>
                    )}
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Recent Activity */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">{t('hostEarnings.recentActivity', 'Recent Activity')}</h3>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('transactions')}>
                      {t('hostEarnings.viewAll', 'View All')}
                      <ArrowUpRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                  ) : transactions.length > 0 ? (
                    <div className="space-y-3">
                      {transactions.slice(0, 3).map((tx) => (
                        <TransactionRow key={tx.id} transaction={tx} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-8 text-muted-foreground">
                      {t('hostEarnings.noTransactions', 'No transactions yet')}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>{t('hostEarnings.allTransactions', 'All Transactions')}</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : transactions.length > 0 ? (
                  <div className="space-y-3">
                    {transactions.map((tx) => (
                      <TransactionRow key={tx.id} transaction={tx} />
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">
                    {t('hostEarnings.noTransactions', 'No transactions yet. Earnings will appear here after confirmed bookings.')}
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payout Methods Tab */}
          <TabsContent value="payouts">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t('hostEarnings.payoutMethods', 'Payout Methods')}</CardTitle>
                  <Button variant="outline" size="sm">
                    {t('hostEarnings.addMethod', 'Add Method')}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {mockPayoutMethods.length > 0 ? (
                  <div className="space-y-3">
                    {mockPayoutMethods.map((method) => (
                      <div
                        key={method.id}
                        className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{method.name}</p>
                            <p className="text-sm text-muted-foreground">••••{method.last4}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {method.isDefault && (
                            <Badge variant="secondary">{t('hostEarnings.default', 'Default')}</Badge>
                          )}
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="font-medium mb-2">{t('hostEarnings.noPayoutMethods', 'No payout methods')}</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      {t('hostEarnings.addPayoutMethodDesc', 'Add a bank account to receive payouts')}
                    </p>
                    <Button>{t('hostEarnings.addBankAccount', 'Add Bank Account')}</Button>
                  </div>
                )}

                {/* Info Box */}
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex gap-3">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    <p className="font-medium mb-1">{t('hostEarnings.payoutSchedule', 'Payout Schedule')}</p>
                    <p>{t('hostEarnings.payoutScheduleDesc', 'Payouts are processed within 3-5 business days after a guest checks out.')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </main>
  );
};

// Transaction Row Component
const TransactionRow = ({ transaction }: { transaction: Transaction }) => {
  const { t } = useTranslation();
  const isEarning = transaction.type === 'earning';
  const isPending = transaction.status === 'pending';

  return (
    <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          isEarning ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
        }`}>
          {isEarning ? <TrendingUp className="w-5 h-5" /> : <Wallet className="w-5 h-5" />}
        </div>
        <div>
          <p className="font-medium text-sm">{transaction.description}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(transaction.date).toLocaleDateString('th-TH', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className={`font-semibold ${isEarning ? 'text-green-600 dark:text-green-400' : 'text-foreground'}`}>
          {isEarning ? '+' : '-'}฿{transaction.amount.toLocaleString()}
        </p>
        <div className="flex items-center gap-1 justify-end">
          {isPending ? (
            <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
              <Clock className="w-3 h-3 mr-1" />
              {t('hostEarnings.pendingStatus', 'Pending')}
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              {t('hostEarnings.completedStatus', 'Completed')}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

export default HostEarnings;
