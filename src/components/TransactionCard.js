import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, SIZES } from '../utils/theme';
import Badge from './Badge';
import Card from './Card';

export default function TransactionCard({ transaction, onPress }) {
  const { type, amount, description, date } = transaction;
  const isIncome = type === 'income';

  const formatAmount = (amt) =>
    `₦${Number(amt).toLocaleString('en-NG')}`;

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-NG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Card>
        <View style={styles.row}>
          <View style={[
            styles.iconContainer,
            { backgroundColor: isIncome ? COLORS.incomeLight : COLORS.expenseLight }
          ]}>
            <Text style={styles.icon}>{isIncome ? '💰' : '💸'}</Text>
          </View>

          <View style={styles.details}>
            <Text style={styles.description} numberOfLines={1}>
              {description}
            </Text>
            <Text style={styles.date}>{formatDate(date)}</Text>
          </View>

          <View style={styles.right}>
            <Text style={[
              styles.amount,
              { color: isIncome ? COLORS.income : COLORS.expense }
            ]}>
              {isIncome ? '+' : '-'}{formatAmount(amount)}
            </Text>
            <Badge label={type} type={type} />
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.sm,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: SIZES.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: SIZES.lg,
  },
  details: {
    flex: 1,
  },
  description: {
    color: COLORS.textPrimary,
    fontSize: SIZES.md,
    fontFamily: FONTS.semiBold,
    marginBottom: 4,
  },
  date: {
    color: COLORS.textSecondary,
    fontSize: SIZES.sm,
    fontFamily: FONTS.regular,
  },
  right: {
    alignItems: 'flex-end',
    gap: SIZES.spacing.xs,
  },
  amount: {
    fontSize: SIZES.md,
    fontFamily: FONTS.bold,
  },
});