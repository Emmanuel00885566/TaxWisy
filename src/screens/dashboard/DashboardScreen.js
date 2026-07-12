import { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../utils/theme';
import { AuthContext } from '../../context/AuthContext';
import dashboardService from '../../services/dashboardService';
import Card from '../../components/Card';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import TransactionCard from '../../components/TransactionCard';
import TaxSummaryCard from '../../components/TaxSummaryCard';
import IncomeExpenseChart from '../../components/IncomeExpenseChart';

export default function DashboardScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const userId = user?.userId || user?.id;
  const firstName = user?.fullname?.split(' ')[0] || 'User';
  const isBusinessUser = user?.account_type === 'business';

  const fetchDashboard = async () => {
    if (!userId) return;
    try {
      const result = await dashboardService.getSummary(userId);
      if (result.success) {
        setDashboard(result.data);
      }
    } catch (error) {
      console.log('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [userId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboard();
    setRefreshing(false);
  };

  const formatAmount = (amt) =>
    `₦${Number(amt || 0).toLocaleString('en-NG')}`;

  const prepareChartData = () => {
    if (!dashboard) return [];

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();

    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      last6Months.push({
        month: months[monthIndex],
        monthIndex,
        income: 0,
        expenses: 0,
      });
    }

    const allTransactions = dashboard.recentTransactions || [];
    allTransactions.forEach((t) => {
      const date = new Date(t.date);
      const monthIndex = date.getMonth();
      const entry = last6Months.find((m) => m.monthIndex === monthIndex);
      if (entry) {
        if (t.type === 'income') entry.income += Number(t.amount);
        if (t.type === 'expense') entry.expenses += Number(t.amount);
      }
    });

    return last6Months;
  };

  const totalIncome = dashboard?.overview?.totalIncome || 0;
  const totalExpenses = dashboard?.overview?.totalExpenses || 0;
  const taxableIncome = dashboard?.overview?.taxableIncome || 0;
  const recentTransactions = dashboard?.recentTransactions || [];
  const latestTaxRecord = dashboard?.tax?.latestRecord || null;
  const unpaidTax = dashboard?.tax?.unpaidAmount || 0;
  const monthlyIncome = dashboard?.monthly?.income || 0;
  const monthlyExpenses = dashboard?.monthly?.expenses || 0;
  const currentMonth = dashboard?.monthly?.month || '';

  if (loading && !refreshing) return <Loader message="Loading dashboard..." />;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={COLORS.primary}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good day, {firstName} 👋</Text>
          <Text style={styles.subGreeting}>
            {isBusinessUser ? '🏢 Business Account (CIT)' : '👤 Individual Account (PIT)'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.notifButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.notifIcon}>👤</Text>
        </TouchableOpacity>
      </View>

      {/* Balance Overview Card */}
      <View style={styles.balanceCard}>
        <View style={styles.balanceGlow} />
        <Text style={styles.balanceLabel}>Total Taxable Income</Text>
        <Text style={styles.balanceAmount}>{formatAmount(taxableIncome)}</Text>
        <Text style={styles.balanceSub}>
          Based on your income and deductible expenses
        </Text>

        <View style={styles.balanceRow}>
          <View style={styles.balanceItem}>
            <View style={[styles.balanceDot, { backgroundColor: COLORS.income }]} />
            <View>
              <Text style={styles.balanceItemLabel}>Total Income</Text>
              <Text style={[styles.balanceItemAmount, { color: COLORS.income }]}>
                {formatAmount(totalIncome)}
              </Text>
            </View>
          </View>

          <View style={styles.balanceDivider} />

          <View style={styles.balanceItem}>
            <View style={[styles.balanceDot, { backgroundColor: COLORS.expense }]} />
            <View>
              <Text style={styles.balanceItemLabel}>Total Expenses</Text>
              <Text style={[styles.balanceItemAmount, { color: COLORS.expense }]}>
                {formatAmount(totalExpenses)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Monthly Summary */}
      <View style={styles.monthlyRow}>
        <Card style={styles.monthlyCard}>
          <Text style={styles.monthlyLabel}>This Month Income</Text>
          <Text style={[styles.monthlyAmount, { color: COLORS.income }]}>
            {formatAmount(monthlyIncome)}
          </Text>
          <Text style={styles.monthlyPeriod}>{currentMonth}</Text>
        </Card>
        <Card style={styles.monthlyCard}>
          <Text style={styles.monthlyLabel}>This Month Expenses</Text>
          <Text style={[styles.monthlyAmount, { color: COLORS.expense }]}>
            {formatAmount(monthlyExpenses)}
          </Text>
          <Text style={styles.monthlyPeriod}>{currentMonth}</Text>
        </Card>
      </View>

      {/* Income vs Expense Chart */}
      {dashboard && (
        <View style={styles.chartContainer}>
          <IncomeExpenseChart data={prepareChartData()} />
        </View>
      )}

      {/* Unpaid Tax Alert */}
      {unpaidTax > 0 && (
        <TouchableOpacity
          style={styles.taxAlert}
          onPress={() => navigation.navigate('Tax')}
        >
          <Text style={styles.taxAlertIcon}>⚠️</Text>
          <View style={styles.taxAlertText}>
            <Text style={styles.taxAlertTitle}>Unpaid Tax Due</Text>
            <Text style={styles.taxAlertAmount}>{formatAmount(unpaidTax)}</Text>
          </View>
          <Text style={styles.taxAlertArrow}>›</Text>
        </TouchableOpacity>
      )}

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.quickAction}
          onPress={() => navigation.navigate('Transactions')}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: COLORS.incomeLight }]}>
            <Text style={styles.quickActionEmoji}>💰</Text>
          </View>
          <Text style={styles.quickActionLabel}>Add Income</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickAction}
          onPress={() => navigation.navigate('Transactions')}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: COLORS.expenseLight }]}>
            <Text style={styles.quickActionEmoji}>💸</Text>
          </View>
          <Text style={styles.quickActionLabel}>Add Expense</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickAction}
          onPress={() => navigation.navigate('Tax')}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: COLORS.warningLight }]}>
            <Text style={styles.quickActionEmoji}>📊</Text>
          </View>
          <Text style={styles.quickActionLabel}>Compute Tax</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickAction}
          onPress={() => navigation.navigate('Reports')}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(124, 58, 237, 0.15)' }]}>
            <Text style={styles.quickActionEmoji}>📄</Text>
          </View>
          <Text style={styles.quickActionLabel}>Reports</Text>
        </TouchableOpacity>
      </View>

      {/* Latest Tax Record */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Tax Summary</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Tax')}>
            <Text style={styles.seeAll}>See All →</Text>
          </TouchableOpacity>
        </View>

        {latestTaxRecord ? (
          <TaxSummaryCard taxRecord={latestTaxRecord} />
        ) : (
          <Card>
            <View style={styles.emptyTax}>
              <Text style={styles.emptyTaxIcon}>📊</Text>
              <Text style={styles.emptyTaxTitle}>No tax records yet</Text>
              <Text style={styles.emptyTaxSub}>
                Add your income and expenses then compute your tax
              </Text>
              <TouchableOpacity
                style={styles.computeButton}
                onPress={() => navigation.navigate('Tax')}
              >
                <Text style={styles.computeButtonText}>Compute Tax Now</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}
      </View>

      {/* Recent Transactions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
            <Text style={styles.seeAll}>See All →</Text>
          </TouchableOpacity>
        </View>

        {recentTransactions.length > 0 ? (
          recentTransactions.map((transaction) => (
            <TransactionCard
              key={transaction.id}
              transaction={transaction}
              onPress={() => navigation.navigate('Transactions')}
            />
          ))
        ) : (
          <EmptyState
            icon="💳"
            title="No transactions yet"
            message="Start by adding your income and expenses"
            actionTitle="Add Transaction"
            onAction={() => navigation.navigate('Transactions')}
          />
        )}
      </View>

      {/* Nigerian Tax Info Banner */}
      <Card style={styles.infoBanner}>
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>💡</Text>
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>
              {isBusinessUser ? 'Company Income Tax (CIT)' : 'Personal Income Tax (PIT)'}
            </Text>
            <Text style={styles.infoSub}>
              {isBusinessUser
                ? 'CIT: 20% for turnover below ₦100M, 30% for ₦100M and above (FIRS)'
                : 'PIT: Progressive brackets from 7% to 24% per Nigeria PIT Act'}
            </Text>
          </View>
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingBottom: SIZES.spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.spacing.lg,
    paddingTop: 60,
    paddingBottom: SIZES.spacing.md,
  },
  greeting: {
    fontSize: SIZES.xxl,
    fontFamily: FONTS.extraBold,
    color: COLORS.textPrimary,
  },
  subGreeting: {
    fontSize: SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  notifButton: {
    width: 44,
    height: 44,
    borderRadius: SIZES.radius.full,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  notifIcon: {
    fontSize: 20,
  },
  balanceCard: {
    marginHorizontal: SIZES.spacing.lg,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius.xl,
    padding: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.md,
    overflow: 'hidden',
    ...SHADOWS.glow,
  },
  balanceGlow: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  balanceLabel: {
    fontSize: SIZES.sm,
    fontFamily: FONTS.medium,
    color: 'rgba(0,0,0,0.6)',
    marginBottom: SIZES.spacing.xs,
  },
  balanceAmount: {
    fontSize: SIZES.display,
    fontFamily: FONTS.extraBold,
    color: COLORS.background,
    marginBottom: SIZES.spacing.xs,
  },
  balanceSub: {
    fontSize: SIZES.xs,
    fontFamily: FONTS.regular,
    color: 'rgba(0,0,0,0.5)',
    marginBottom: SIZES.spacing.lg,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: SIZES.radius.md,
    padding: SIZES.spacing.md,
  },
  balanceItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.sm,
  },
  balanceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  balanceDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(0,0,0,0.2)',
    marginHorizontal: SIZES.spacing.sm,
  },
  balanceItemLabel: {
    fontSize: SIZES.xs,
    fontFamily: FONTS.regular,
    color: 'rgba(0,0,0,0.6)',
  },
  balanceItemAmount: {
    fontSize: SIZES.md,
    fontFamily: FONTS.bold,
  },
  monthlyRow: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.spacing.lg,
    gap: SIZES.spacing.sm,
    marginBottom: SIZES.spacing.md,
  },
  monthlyCard: {
    flex: 1,
    marginBottom: 0,
  },
  monthlyLabel: {
    fontSize: SIZES.xs,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  monthlyAmount: {
    fontSize: SIZES.lg,
    fontFamily: FONTS.bold,
    marginBottom: 2,
  },
  monthlyPeriod: {
    fontSize: SIZES.xs,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
  },
  chartContainer: {
    paddingHorizontal: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.md,
  },
  taxAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warningLight,
    borderRadius: SIZES.radius.md,
    padding: SIZES.spacing.md,
    marginHorizontal: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.md,
    borderWidth: 1,
    borderColor: COLORS.warning + '44',
    gap: SIZES.spacing.sm,
  },
  taxAlertIcon: {
    fontSize: 24,
  },
  taxAlertText: {
    flex: 1,
  },
  taxAlertTitle: {
    fontSize: SIZES.sm,
    fontFamily: FONTS.semiBold,
    color: COLORS.warning,
    marginBottom: 2,
  },
  taxAlertAmount: {
    fontSize: SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  taxAlertArrow: {
    color: COLORS.warning,
    fontSize: 22,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.lg,
    gap: SIZES.spacing.sm,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    gap: SIZES.spacing.xs,
  },
  quickActionIcon: {
    width: 52,
    height: 52,
    borderRadius: SIZES.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  quickActionEmoji: {
    fontSize: 24,
  },
  quickActionLabel: {
    fontSize: SIZES.xs,
    fontFamily: FONTS.semiBold,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.spacing.sm,
  },
  sectionTitle: {
    fontSize: SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  seeAll: {
    fontSize: SIZES.sm,
    fontFamily: FONTS.semiBold,
    color: COLORS.primary,
  },
  emptyTax: {
    alignItems: 'center',
    padding: SIZES.spacing.md,
    gap: SIZES.spacing.xs,
  },
  emptyTaxIcon: {
    fontSize: 36,
    marginBottom: SIZES.spacing.xs,
  },
  emptyTaxTitle: {
    fontSize: SIZES.md,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  emptyTaxSub: {
    fontSize: SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  computeButton: {
    marginTop: SIZES.spacing.sm,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SIZES.spacing.lg,
    paddingVertical: SIZES.spacing.sm,
    borderRadius: SIZES.radius.full,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  computeButtonText: {
    color: COLORS.primary,
    fontFamily: FONTS.semiBold,
    fontSize: SIZES.sm,
  },
  infoBanner: {
    marginHorizontal: SIZES.spacing.lg,
    borderColor: COLORS.primary + '33',
    backgroundColor: COLORS.primaryLight,
  },
  infoRow: {
    flexDirection: 'row',
    gap: SIZES.spacing.sm,
    alignItems: 'flex-start',
  },
  infoIcon: {
    fontSize: 24,
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    fontSize: SIZES.md,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    marginBottom: 4,
  },
  infoSub: {
    fontSize: SIZES.xs,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});