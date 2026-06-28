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
import { TransactionContext } from '../../context/TransactionContext';
import taxService from '../../services/taxService';
import Card from '../../components/Card';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import TransactionCard from '../../components/TransactionCard';
import TaxSummaryCard from '../../components/TaxSummaryCard';

export default function DashboardScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const {
    transactions,
    summary,
    loading,
    fetchTransactions,
    fetchSummary,
  } = useContext(TransactionContext);

  const [taxRecords, setTaxRecords] = useState([]);
  const [taxLoading, setTaxLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const userId = user?.userId || user?.id;
  const firstName = user?.fullname?.split(' ')[0] || 'User';
  const isBusinessUser = user?.account_type === 'business';

  const fetchTaxRecords = async () => {
    if (!userId) return;
    setTaxLoading(true);
    try {
      const result = await taxService.getRecords(userId);
      setTaxRecords(result.data || []);
    } catch (error) {
      console.log('Tax records error:', error);
    } finally {
      setTaxLoading(false);
    }
  };

  useEffect(() => {
  if (!userId) return;
  
  const loadAll = async () => {
    try {
      await fetchTransactions();
      await fetchSummary();
      await fetchTaxRecords();
    } catch (error) {
      console.log('Dashboard load error:', error);
    }
  };
  loadAll();
}, [userId]);


  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchTransactions();
      await fetchSummary();
      await fetchTaxRecords();
    } catch (error) {
      console.log('Refresh error:', error);
    }
    setRefreshing(false);
  };

  const formatAmount = (amt) =>
    `₦${Number(amt || 0).toLocaleString('en-NG')}`;

  const totalIncome = summary?.totalIncome || 0;
  const totalExpenses = summary?.totalExpenses || 0;
  const taxableIncome = totalIncome - totalExpenses;
  const recentTransactions = transactions.slice(0, 5);
  const latestTaxRecord = taxRecords[0];

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

        {taxLoading ? (
          <Card>
            <Text style={styles.loadingText}>Computing tax...</Text>
          </Card>
        ) : latestTaxRecord ? (
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
              key={transaction.id || transaction.transaction_id}
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
    marginBottom: SIZES.spacing.lg,
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
  loadingText: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    padding: SIZES.spacing.md,
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