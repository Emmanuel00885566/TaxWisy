import { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { COLORS, FONTS, SIZES } from '../../utils/theme';
import { AuthContext } from '../../context/AuthContext';
import taxService from '../../services/taxService';
import Header from '../../components/Header';
import TaxSummaryCard from '../../components/TaxSummaryCard';
import EmptyState from '../../components/EmptyState';
import Loader from '../../components/Loader';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import ComputeTaxModal from './ComputeTaxModal';

export default function TaxScreen() {
  const { user } = useContext(AuthContext);
  const [taxRecords, setTaxRecords] = useState([]);
  const [taxSummary, setTaxSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const userId = user?.userId || user?.id;
  const accountType = user?.account_type;

  const fetchTaxData = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [recordsResult, summaryResult] = await Promise.all([
        taxService.getRecords(userId),
        taxService.getSummary(userId),
      ]);
      console.log('📊 Records:', JSON.stringify(recordsResult));
      console.log('📊 Summary:', JSON.stringify(summaryResult));

      const records = recordsResult?.data || [];
      setTaxRecords(Array.isArray(records) ? records : []);
      setTaxSummary(summaryResult.data || null);
    } catch (error) {
      console.log('Error fetching tax data:', error);
    } finally {
      setLoading(false);
    }
  };

  // THIS WAS MISSING 👇
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTaxData();
    setRefreshing(false);
  };

  useEffect(() => {
    if (userId) fetchTaxData();
  }, [userId]);

  const handleCompute = async (data) => {
    try {
      const result = await taxService.compute(userId, data);
      console.log('Compute result:', JSON.stringify(result));
      if (result.success || result.data) {
        setTimeout(async () => {
          await fetchTaxData();
        }, 500);
        Alert.alert('Tax Computed! 🎉', 'Your tax has been calculated successfully.');
      } else {
        throw new Error(result.message || 'Failed to compute tax');
      }
    } catch (error) {
      throw error;
    }
  };

const handleMarkPaid = (taxId) => {
  Alert.alert(
    'Mark as Paid',
    'Confirm that you have paid this tax?',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes, Mark Paid',
        onPress: async () => {
          try {
            const record = taxRecords.find(r => r.id === taxId);
            const cleanAmount = record?.taxAmount
  ?.replace('₦', '')
  ?.replace(/,/g, '') // remove ALL commas not just first one
  || '0';
            const result = await taxService.markPaid(userId, taxId, {
              amount: cleanAmount,
              paidOn: new Date().toISOString().split('T')[0],
            });
            console.log('💰 Mark paid result:', JSON.stringify(result));

            if (result.success) {
              // Update local state immediately — don't wait for API
              setTaxRecords(prev =>
                prev.map(r =>
                  r.id === taxId
                    ? {
                        ...r,
                        paidStatus: 'paid',
                        paidOn: new Date().toLocaleDateString(),
                        paidAmount: record?.taxAmount || '₦0',
                      }
                    : r
                )
              );
              // Update summary counts locally too
              setTaxSummary(prev =>
                prev ? {
                  ...prev,
                  paid: (prev.paid || 0) + 1,
                  unpaid: Math.max((prev.unpaid || 0) - 1, 0),
                  paidAmount: (prev.paidAmount || 0) + Number(
                    record?.taxAmount?.replace('₦', '').replace(',', '') || 0
                  ),
                } : prev
              );
              Alert.alert('Success! ✅', 'Tax marked as paid.');
            } else {
              Alert.alert('Error', result.message || 'Failed to mark as paid');
            }
          } catch (error) {
            console.log('❌ Mark paid error:', error);
            Alert.alert('Error', 'Failed to mark tax as paid');
          }
        },
      },
    ]
  );
};

  const formatAmount = (amt) =>
    `₦${Number(amt || 0).toLocaleString('en-NG')}`;

  if (loading && !refreshing) return <Loader message="Loading tax records..." />;

  return (
    <View style={styles.container}>
      <Header
        title="Tax Records"
        subtitle="Your CIT & PIT calculations"
      />

      {/* Tax Overview Card */}
      {taxSummary && (
  <Card style={styles.overviewCard}>
    <Text style={styles.overviewTitle}>Tax Overview</Text>
    <View style={styles.overviewRow}>
      <View style={styles.overviewItem}>
        <Text style={styles.overviewAmount}>
          {formatAmount(taxSummary.paidAmount || 0)}
        </Text>
        <Text style={styles.overviewLabel}>Total Paid</Text>
      </View>
      <View style={styles.overviewDivider} />
      <View style={styles.overviewItem}>
        <Text style={[styles.overviewAmount, { color: COLORS.warning }]}>
          {taxSummary.unpaid || 0}
        </Text>
        <Text style={styles.overviewLabel}>Unpaid Records</Text>
      </View>
      <View style={styles.overviewDivider} />
      <View style={styles.overviewItem}>
        <Text style={[styles.overviewAmount, { color: COLORS.primary }]}>
          {taxSummary.totalRecords || 0}
        </Text>
        <Text style={styles.overviewLabel}>Total Records</Text>
      </View>
    </View>
  </Card>
)}

      {/* Tax Records List */}
      <FlatList
        data={taxRecords}
        keyExtractor={(item) => String(item.id || item.record_id)}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
        renderItem={({ item }) => (
  <Card style={styles.taxCard}>
    <View style={styles.taxCardTop}>
      <View>
        <Text style={styles.taxType}>
          {item.taxType || 'Tax Record'}
        </Text>
        <Text style={styles.taxPeriod}>
          {item.period || item.createdAt}
        </Text>
      </View>
      <Badge
        label={item.paidStatus || 'unpaid'}
        type={item.paidStatus || 'unpaid'}
      />
    </View>

    <View style={styles.taxDivider} />

    <View style={styles.taxCardRow}>
      <View style={styles.taxCardItem}>
        <Text style={styles.taxCardLabel}>Taxable Income</Text>
        <Text style={styles.taxCardValue}>
          {item.taxableIncome || '₦0'}
        </Text>
      </View>
      <View style={styles.taxCardItem}>
        <Text style={styles.taxCardLabel}>Tax Amount</Text>
        <Text style={[styles.taxCardValue, { color: COLORS.primary }]}>
          {item.taxAmount || '₦0'}
        </Text>
      </View>
    </View>

    {/* Meta info */}
    <View style={styles.taxDivider} />
    <View style={styles.taxCardRow}>
      <View style={styles.taxCardItem}>
        <Text style={styles.taxCardLabel}>Amount Paid</Text>
        <Text style={styles.taxCardValue}>
          {item.paidAmount || '₦0'}
        </Text>
      </View>
      <View style={styles.taxCardItem}>
        <Text style={styles.taxCardLabel}>Paid On</Text>
        <Text style={styles.taxCardValue}>
          {item.paidOn || 'Not Paid'}
        </Text>
      </View>
    </View>

    {item.paidStatus === 'unpaid' && (
      <TouchableOpacity
        style={styles.markPaidButton}
        onPress={() => handleMarkPaid(item.id)}
      >
        <Text style={styles.markPaidText}>Mark as Paid ✓</Text>
      </TouchableOpacity>
    )}
  </Card>
)}

        ListEmptyComponent={
          <EmptyState
            icon="📊"
            title="No tax records yet"
            message="Tap the button below to compute your tax based on your income and expenses"
          />
        }
      />

      {/* Compute Tax Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>Compute Tax</Text>
      </TouchableOpacity>

      <ComputeTaxModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onCompute={handleCompute}
        accountType={accountType}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  overviewCard: {
    marginHorizontal: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.md,
    borderColor: COLORS.primary + '33',
  },
  overviewTitle: {
    fontSize: SIZES.md,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SIZES.spacing.md,
  },
  overviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  overviewItem: {
    flex: 1,
    alignItems: 'center',
  },
  overviewAmount: {
    fontSize: SIZES.md,
    fontFamily: FONTS.bold,
    color: COLORS.expense,
    marginBottom: 4,
  },
  overviewLabel: {
    fontSize: SIZES.xs,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  overviewDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.border,
  },
  list: {
    paddingHorizontal: SIZES.spacing.lg,
    paddingBottom: 100,
  },
  taxCard: {
    marginBottom: SIZES.spacing.sm,
  },
  taxCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SIZES.spacing.sm,
  },
  taxType: {
    fontSize: SIZES.md,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  taxPeriod: {
    fontSize: SIZES.xs,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  taxDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: SIZES.spacing.sm,
  },
  taxCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  taxCardItem: {
    flex: 1,
  },
  taxCardLabel: {
    fontSize: SIZES.xs,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  taxCardValue: {
    fontSize: SIZES.md,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  markPaidButton: {
    marginTop: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.sm,
    borderRadius: SIZES.radius.md,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: 'center',
  },
  markPaidText: {
    color: COLORS.primary,
    fontSize: SIZES.sm,
    fontFamily: FONTS.semiBold,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    left: SIZES.spacing.lg,
    right: SIZES.spacing.lg,
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.spacing.md,
    borderRadius: SIZES.radius.md,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  fabText: {
    color: COLORS.background,
    fontSize: SIZES.md,
    fontFamily: FONTS.bold,
  },
});