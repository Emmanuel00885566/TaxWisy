import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, SIZES } from '../utils/theme';
import Badge from './Badge';
import Card from './Card';

export default function TaxSummaryCard({ taxRecord }) {
  const {
    taxType,
    taxableIncome,
    taxAmount,
    paidStatus,
    period,
    createdAt,
  } = taxRecord;

  return (
    <Card style={styles.card}>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.taxType}>{taxType || 'Tax Record'}</Text>
          <Text style={styles.period}>{period || createdAt}</Text>
        </View>
        <Badge
          label={paidStatus || 'unpaid'}
          type={paidStatus || 'unpaid'}
        />
      </View>

      <View style={styles.divider} />

      <View style={styles.row}>
        <View style={styles.item}>
          <Text style={styles.value}>{taxableIncome || '₦0'}</Text>
          <Text style={styles.label}>Taxable Income</Text>
        </View>
        <View style={styles.item}>
          <Text style={[styles.value, { color: COLORS.primary }]}>
            {taxAmount || '₦0'}
          </Text>
          <Text style={styles.label}>Tax Owed</Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderColor: COLORS.primaryLight,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SIZES.spacing.sm,
  },
  taxType: {
    color: COLORS.textPrimary,
    fontSize: SIZES.lg,
    fontFamily: FONTS.bold,
    marginBottom: 4,
  },
  period: {
    color: COLORS.textSecondary,
    fontSize: SIZES.xs,
    fontFamily: FONTS.regular,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: SIZES.spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  item: {
    flex: 1,
  },
  value: {
    color: COLORS.textPrimary,
    fontSize: SIZES.lg,
    fontFamily: FONTS.bold,
    marginBottom: 4,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: SIZES.sm,
    fontFamily: FONTS.regular,
  },
});