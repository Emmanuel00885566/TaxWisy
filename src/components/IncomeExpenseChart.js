import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { COLORS, FONTS, SIZES } from '../utils/theme';

const screenWidth = Dimensions.get('window').width;

export default function IncomeExpenseChart({ data }) {
  if (!data || data.length === 0) return null;

  const labels = data.map((d) => d.month);
  const incomeData = data.map((d) => d.income);
  const expenseData = data.map((d) => d.expenses);

  const chartData = {
    labels,
    datasets: [
      {
        data: incomeData,
        color: (opacity = 1) => `rgba(0, 212, 170, ${opacity})`,
        label: 'Income',
      },
    ],
  };

  const maxValue = Math.max(...incomeData, ...expenseData, 1);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Income vs Expenses</Text>
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.income }]} />
            <Text style={styles.legendText}>Income</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.expense }]} />
            <Text style={styles.legendText}>Expenses</Text>
          </View>
        </View>
      </View>

      {/* Income bars */}
      <BarChart
        data={chartData}
        width={screenWidth - SIZES.spacing.lg * 2 - 32}
        height={180}
        chartConfig={{
          backgroundColor: COLORS.card,
          backgroundGradientFrom: COLORS.card,
          backgroundGradientTo: COLORS.card,
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(0, 212, 170, ${opacity})`,
          labelColor: () => COLORS.textSecondary,
          style: { borderRadius: SIZES.radius.md },
          propsForBackgroundLines: {
            stroke: COLORS.border,
            strokeDasharray: '4',
          },
          propsForLabels: {
            fontFamily: FONTS.regular,
            fontSize: 10,
          },
          barPercentage: 0.6,
          formatYLabel: (val) => {
            const num = Number(val);
            if (num >= 1000000) return `₦${(num / 1000000).toFixed(0)}M`;
            if (num >= 1000) return `₦${(num / 1000).toFixed(0)}K`;
            return `₦${num}`;
          },
        }}
        style={styles.chart}
        showValuesOnTopOfBars={false}
        withInnerLines={true}
        fromZero={true}
        yAxisLabel=""
        yAxisSuffix=""
      />

      {/* Expense bars overlay using custom view */}
      <View style={styles.expenseRow}>
        {data.map((item, index) => {
          const expensePercent = maxValue > 0 ? (item.expenses / maxValue) * 100 : 0;
          return (
            <View key={index} style={styles.expenseBarContainer}>
              <View style={styles.expenseBarWrapper}>
                <View
                  style={[
                    styles.expenseBar,
                    { height: Math.max((expensePercent / 100) * 60, 2) },
                  ]}
                />
              </View>
              <Text style={styles.expenseLabel}>{item.month}</Text>
            </View>
          );
        })}
      </View>

      {/* Summary Row */}
      <View style={styles.summaryRow}>
        {data.map((item, index) => (
          <View key={index} style={styles.summaryItem}>
            <Text style={[styles.summaryAmount, { color: COLORS.income }]}>
              {item.income >= 1000000
                ? `₦${(item.income / 1000000).toFixed(1)}M`
                : item.income >= 1000
                ? `₦${(item.income / 1000).toFixed(0)}K`
                : `₦${item.income}`}
            </Text>
            <Text style={[styles.summaryAmount, { color: COLORS.expense }]}>
              {item.expenses >= 1000000
                ? `₦${(item.expenses / 1000000).toFixed(1)}M`
                : item.expenses >= 1000
                ? `₦${(item.expenses / 1000).toFixed(0)}K`
                : `₦${item.expenses}`}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.spacing.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SIZES.spacing.md,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.spacing.md,
  },
  title: {
    fontSize: SIZES.md,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  legend: {
    flexDirection: 'row',
    gap: SIZES.spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: SIZES.xs,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  chart: {
    borderRadius: SIZES.radius.md,
    marginLeft: -SIZES.spacing.md,
  },
  expenseRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 70,
    marginTop: -SIZES.spacing.md,
    paddingHorizontal: SIZES.spacing.md,
    marginBottom: SIZES.spacing.xs,
  },
  expenseBarContainer: {
    alignItems: 'center',
    flex: 1,
  },
  expenseBarWrapper: {
    height: 60,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  expenseBar: {
    width: 12,
    backgroundColor: COLORS.expense,
    borderRadius: 4,
    opacity: 0.8,
  },
  expenseLabel: {
    fontSize: 9,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SIZES.spacing.sm,
    marginTop: SIZES.spacing.xs,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
    gap: 2,
  },
  summaryAmount: {
    fontSize: 10,
    fontFamily: FONTS.semiBold,
  },
});