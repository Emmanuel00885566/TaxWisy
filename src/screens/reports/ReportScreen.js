import { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, FONTS, SIZES } from '../../utils/theme';
import { AuthContext } from '../../context/AuthContext';
import { TransactionContext } from '../../context/TransactionContext';
import dashboardService from '../../services/dashboardService';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';

const BASE_URL = 'https://tax-tracker-backend.onrender.com/api';

export default function ReportScreen() {
  const { user } = useContext(AuthContext);
  const { summary, fetchSummary } = useContext(TransactionContext);
  const [dashboardData, setDashboardData] = useState(null);
  const [format, setFormat] = useState('pdf');
  const [reportType, setReportType] = useState('summary');
  const [fromDate, setFromDate] = useState('2026-01-01');
  const [toDate, setToDate] = useState('2026-12-31');
  const [loading, setLoading] = useState(false);

  const userId = user?.userId || user?.id;
  const isBusinessUser = user?.account_type === 'business';

  useEffect(() => {
    if (userId) {
      fetchSummary();
      dashboardService.getSummary(userId).then(result => {
        if (result.success) setDashboardData(result.data);
      });
    }
  }, [userId]);

  const formatAmount = (amt) =>
    `₦${Number(amt || 0).toLocaleString('en-NG')}`;

  const totalIncome = dashboardData?.overview?.totalIncome || summary?.totalIncome || 0;
  const totalExpenses = dashboardData?.overview?.totalExpenses || summary?.totalExpenses || 0;
  const taxableIncome = dashboardData?.overview?.taxableIncome || (totalIncome - totalExpenses);
  const unpaidTax = dashboardData?.tax?.unpaidAmount || 0;
  const totalTaxRecords = dashboardData?.tax?.totalRecords || 0;
  const paidTaxRecords = dashboardData?.tax?.paidRecords || 0;

  const handleDownload = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');

      if (!token) {
        Alert.alert('Error', 'Session expired. Please login again.');
        return;
      }

      const url = `${BASE_URL}/report/download?format=${format}&type=${reportType}&from=${fromDate}&to=${toDate}`;

      const fileExtension = format === 'pdf' ? 'pdf' : 'csv';
      const fileName = `taxwisy_report_${Date.now()}.${fileExtension}`;
      const fileUri = FileSystem.documentDirectory + fileName;

      const downloadResult = await FileSystem.downloadAsync(
        url,
        fileUri,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (downloadResult.status === 200) {
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(downloadResult.uri, {
            mimeType: format === 'pdf' ? 'application/pdf' : 'text/csv',
            dialogTitle: `TaxWisy ${format.toUpperCase()} Report`,
          });
        } else {
          Alert.alert('Downloaded! ✅', `Saved to: ${downloadResult.uri}`);
        }
      } else if (downloadResult.status === 403) {
        Alert.alert('Session Expired', 'Please logout and login again.');
      } else {
        Alert.alert('Error', `Download failed with status: ${downloadResult.status}`);
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Reports"
        subtitle="Download your tax summary"
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Financial Summary Card */}
        <Card style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Financial Summary</Text>
            <Badge
              label={isBusinessUser ? 'CIT' : 'PIT'}
              type="default"
            />
          </View>

          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Income</Text>
              <Text style={[styles.summaryAmount, { color: COLORS.income }]}>
                {formatAmount(totalIncome)}
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Expenses</Text>
              <Text style={[styles.summaryAmount, { color: COLORS.expense }]}>
                {formatAmount(totalExpenses)}
              </Text>
            </View>
          </View>

          <View style={styles.taxableRow}>
            <Text style={styles.taxableLabel}>Taxable Income</Text>
            <Text style={styles.taxableAmount}>{formatAmount(taxableIncome)}</Text>
          </View>
        </Card>

        {/* Tax Status Card */}
        <Card style={styles.taxStatusCard}>
          <Text style={styles.taxStatusTitle}>Tax Status</Text>
          <View style={styles.taxStatusRow}>
            <View style={styles.taxStatusItem}>
              <Text style={styles.taxStatusNumber}>{totalTaxRecords}</Text>
              <Text style={styles.taxStatusLabel}>Total Records</Text>
            </View>
            <View style={styles.taxStatusDivider} />
            <View style={styles.taxStatusItem}>
              <Text style={[styles.taxStatusNumber, { color: COLORS.primary }]}>
                {paidTaxRecords}
              </Text>
              <Text style={styles.taxStatusLabel}>Paid</Text>
            </View>
            <View style={styles.taxStatusDivider} />
            <View style={styles.taxStatusItem}>
              <Text style={[styles.taxStatusNumber, { color: COLORS.warning }]}>
                {formatAmount(unpaidTax)}
              </Text>
              <Text style={styles.taxStatusLabel}>Outstanding</Text>
            </View>
          </View>
        </Card>

        {/* Report Type */}
        <Text style={styles.sectionLabel}>Report Type</Text>
        <View style={styles.optionRow}>
          {['summary', 'detailed'].map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.optionButton,
                reportType === type && styles.optionButtonActive,
              ]}
              onPress={() => setReportType(type)}
            >
              <Text style={styles.optionEmoji}>
                {type === 'summary' ? '📋' : '📊'}
              </Text>
              <Text style={[
                styles.optionText,
                reportType === type && styles.optionTextActive,
              ]}>
                {type === 'summary' ? 'Summary' : 'Detailed'}
              </Text>
              <Text style={styles.optionSub}>
                {type === 'summary' ? 'Key figures only' : 'Full breakdown'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Format */}
        <Text style={styles.sectionLabel}>File Format</Text>
        <View style={styles.formatRow}>
          {['pdf', 'csv'].map((f) => (
            <TouchableOpacity
              key={f}
              style={[
                styles.formatButton,
                format === f && styles.formatButtonActive,
              ]}
              onPress={() => setFormat(f)}
            >
              <Text style={styles.formatEmoji}>
                {f === 'pdf' ? '📕' : '📗'}
              </Text>
              <Text style={[
                styles.formatText,
                format === f && styles.formatTextActive,
              ]}>
                {f.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Date Range */}
        <Text style={styles.sectionLabel}>Date Range</Text>
        <Card>
          <View style={styles.dateRow}>
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>From</Text>
              <View style={styles.dateButton}>
                <Text style={styles.dateValue}>{fromDate}</Text>
              </View>
            </View>
            <Text style={styles.dateArrow}>→</Text>
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>To</Text>
              <View style={styles.dateButton}>
                <Text style={styles.dateValue}>{toDate}</Text>
              </View>
            </View>
          </View>

          <View style={styles.presetRow}>
            {[
              { label: 'Q1 2026', from: '2026-01-01', to: '2026-03-31' },
              { label: 'Q2 2026', from: '2026-04-01', to: '2026-06-30' },
              { label: 'Q3 2026', from: '2026-07-01', to: '2026-09-30' },
              { label: 'Q4 2026', from: '2026-10-01', to: '2026-12-31' },
              { label: 'Full 2026', from: '2026-01-01', to: '2026-12-31' },
              { label: 'Full 2025', from: '2025-01-01', to: '2025-12-31' },
            ].map((preset) => (
              <TouchableOpacity
                key={preset.label}
                style={[
                  styles.presetChip,
                  fromDate === preset.from && toDate === preset.to
                    && styles.presetChipActive,
                ]}
                onPress={() => {
                  setFromDate(preset.from);
                  setToDate(preset.to);
                }}
              >
                <Text style={[
                  styles.presetText,
                  fromDate === preset.from && toDate === preset.to
                    && styles.presetTextActive,
                ]}>
                  {preset.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* What's included */}
        <Card style={styles.includesCard}>
          <Text style={styles.includesTitle}>📋 Report includes:</Text>
          {[
            'Total income and expenses',
            'Taxable income calculation',
            'Tax payable amount',
            `${isBusinessUser ? 'CIT' : 'PIT'} breakdown`,
            'Transaction history',
            'Tax payment status',
          ].map((item) => (
            <View key={item} style={styles.includeItem}>
              <Text style={styles.includeCheck}>✓</Text>
              <Text style={styles.includeText}>{item}</Text>
            </View>
          ))}
        </Card>

        <Button
          title={loading ? 'Generating Report...' : `Download ${format.toUpperCase()} Report 📥`}
          onPress={handleDownload}
          loading={loading}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingHorizontal: SIZES.spacing.lg,
    paddingBottom: SIZES.spacing.xxl,
  },
  summaryCard: {
    marginBottom: SIZES.spacing.md,
    borderColor: COLORS.primary + '33',
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.spacing.md,
  },
  summaryTitle: {
    fontSize: SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacing.md,
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: SIZES.xs,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: SIZES.lg,
    fontFamily: FONTS.bold,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.border,
    marginHorizontal: SIZES.spacing.md,
  },
  taxableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    borderRadius: SIZES.radius.md,
    padding: SIZES.spacing.md,
  },
  taxableLabel: {
    fontSize: SIZES.sm,
    fontFamily: FONTS.semiBold,
    color: COLORS.primary,
  },
  taxableAmount: {
    fontSize: SIZES.lg,
    fontFamily: FONTS.extraBold,
    color: COLORS.primary,
  },
  taxStatusCard: {
    marginBottom: SIZES.spacing.md,
    borderColor: COLORS.warning + '33',
  },
  taxStatusTitle: {
    fontSize: SIZES.md,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SIZES.spacing.md,
  },
  taxStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taxStatusItem: {
    flex: 1,
    alignItems: 'center',
  },
  taxStatusNumber: {
    fontSize: SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  taxStatusLabel: {
    fontSize: SIZES.xs,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  taxStatusDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.border,
  },
  sectionLabel: {
    fontSize: SIZES.md,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SIZES.spacing.sm,
    marginTop: SIZES.spacing.md,
  },
  optionRow: {
    flexDirection: 'row',
    gap: SIZES.spacing.sm,
    marginBottom: SIZES.spacing.md,
  },
  optionButton: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius.md,
    padding: SIZES.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 4,
  },
  optionButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  optionEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  optionText: {
    fontSize: SIZES.md,
    fontFamily: FONTS.bold,
    color: COLORS.textSecondary,
  },
  optionTextActive: {
    color: COLORS.primary,
  },
  optionSub: {
    fontSize: SIZES.xs,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
  },
  formatRow: {
    flexDirection: 'row',
    gap: SIZES.spacing.sm,
    marginBottom: SIZES.spacing.md,
  },
  formatButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.spacing.sm,
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius.md,
    padding: SIZES.spacing.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  formatButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  formatEmoji: {
    fontSize: 20,
  },
  formatText: {
    fontSize: SIZES.md,
    fontFamily: FONTS.bold,
    color: COLORS.textSecondary,
  },
  formatTextActive: {
    color: COLORS.primary,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SIZES.spacing.md,
  },
  dateItem: {
    flex: 1,
  },
  dateLabel: {
    fontSize: SIZES.xs,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  dateButton: {
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius.sm,
    padding: SIZES.spacing.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dateValue: {
    color: COLORS.textPrimary,
    fontSize: SIZES.sm,
    fontFamily: FONTS.medium,
  },
  dateArrow: {
    color: COLORS.textSecondary,
    fontSize: SIZES.lg,
    marginHorizontal: SIZES.spacing.sm,
    marginTop: SIZES.spacing.md,
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.spacing.xs,
  },
  presetChip: {
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.xs,
    borderRadius: SIZES.radius.full,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  presetChipActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  presetText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.xs,
    fontFamily: FONTS.medium,
  },
  presetTextActive: {
    color: COLORS.primary,
    fontFamily: FONTS.semiBold,
  },
  includesCard: {
    marginTop: SIZES.spacing.md,
    marginBottom: SIZES.spacing.lg,
  },
  includesTitle: {
    fontSize: SIZES.md,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SIZES.spacing.sm,
  },
  includeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.sm,
    marginBottom: SIZES.spacing.xs,
  },
  includeCheck: {
    color: COLORS.primary,
    fontSize: SIZES.md,
    fontFamily: FONTS.bold,
  },
  includeText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.sm,
    fontFamily: FONTS.regular,
  },
});