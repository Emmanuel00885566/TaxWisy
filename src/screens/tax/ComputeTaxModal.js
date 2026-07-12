import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { COLORS, FONTS, SIZES } from '../../utils/theme';
import Input from '../../components/Input';
import Button from '../../components/Button';

export default function ComputeTaxModal({ visible, onClose, onCompute, accountType }) {
  const [loading, setLoading] = useState(false);
  const isBusiness = accountType === 'business';
  const currentYear = new Date().getFullYear();

  const [form, setForm] = useState({
    taxType: isBusiness ? 'CIT' : 'PIT',
    startDate: `${currentYear}-01-01`,
    endDate: `${currentYear}-12-31`,
    turnover: '',
    month: 'December',
  });

  const [errors, setErrors] = useState({});

  const updateForm = (key, value) => setForm({ ...form, [key]: value });

  const months = [
    'January', 'February', 'March', 'April',
    'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December',
  ];

  const validate = () => {
    const newErrors = {};
    if (isBusiness && !form.turnover)
      newErrors.turnover = 'Turnover is required for CIT';
    if (!form.startDate) newErrors.startDate = 'Start date is required';
    if (!form.endDate) newErrors.endDate = 'End date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCompute = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await onCompute({
        taxType: form.taxType,
        startDate: form.startDate,
        endDate: form.endDate,
        turnover: Number(form.turnover),
        month: form.month,
        overrideBrackets: null,
        overrideCITRules: null,
      });
      onClose();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to compute tax');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />

        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <Text style={styles.title}>Compute Tax 📊</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Tax Type Badge */}
            <View style={styles.taxTypeRow}>
              <View style={[styles.taxTypeBadge,
                { backgroundColor: isBusiness ? COLORS.warningLight : COLORS.primaryLight }
              ]}>
                <Text style={[styles.taxTypeText,
                  { color: isBusiness ? COLORS.warning : COLORS.primary }
                ]}>
                  {isBusiness ? '🏢 Company Income Tax (CIT)' : '👤 Personal Income Tax (PIT)'}
                </Text>
              </View>
            </View>

            {/* Info Banner */}
            <View style={styles.infoBanner}>
              <Text style={styles.infoText}>
                {isBusiness
                  ? '📊 CIT Rate:\n• Below ₦100M turnover → 20% rate\n• ₦100M and above → 30% rate\n\n💡 Tax is calculated from your recorded income transactions.'
                  : '📊 PIT progressive brackets from 7% to 24%\nbased on your recorded annual income.'}
              </Text>
            </View>

            {/* Turnover — only for business */}
            {isBusiness && (
              <>
                <Input
                  label="Annual Turnover (₦) — Determines your tax rate"
                  placeholder="enter your total annual turnover"
                  value={form.turnover}
                  onChangeText={(text) => updateForm('turnover', text)}
                  keyboardType="numeric"
                  icon="₦"
                  error={errors.turnover}
                />
                <View style={styles.turnoverHint}>
                  <Text style={styles.turnoverHintText}>
                    ℹ️ Enter your total company turnover to determine if you pay 20% or 30% CIT
                  </Text>
                </View>
              </>
            )}

            {/* Date Range */}
            <Input
              label="Start Date"
              placeholder="YYYY-MM-DD"
              value={form.startDate}
              onChangeText={(text) => updateForm('startDate', text)}
              icon="📅"
              error={errors.startDate}
            />

            <Input
              label="End Date"
              placeholder="YYYY-MM-DD"
              value={form.endDate}
              onChangeText={(text) => updateForm('endDate', text)}
              icon="📅"
              error={errors.endDate}
            />

            {/* Month */}
            <Text style={styles.label}>Tax Month</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.monthsScroll}
            >
              {months.map((month) => (
                <TouchableOpacity
                  key={month}
                  style={[
                    styles.monthChip,
                    form.month === month && styles.monthChipActive,
                  ]}
                  onPress={() => updateForm('month', month)}
                >
                  <Text style={[
                    styles.monthText,
                    form.month === month && styles.monthTextActive,
                  ]}>
                    {month.slice(0, 3)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.buttonContainer}>
              <Button
                title="Compute My Tax"
                onPress={handleCompute}
                loading={loading}
              />
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: SIZES.radius.xl,
    borderTopRightRadius: SIZES.radius.xl,
    padding: SIZES.spacing.lg,
    paddingBottom: 40,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderBottomWidth: 0,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: SIZES.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.spacing.lg,
  },
  title: {
    fontSize: SIZES.xl,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: SIZES.radius.full,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  closeText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.md,
  },
  taxTypeRow: {
    marginBottom: SIZES.spacing.md,
  },
  taxTypeBadge: {
    borderRadius: SIZES.radius.md,
    padding: SIZES.spacing.md,
    alignItems: 'center',
  },
  taxTypeText: {
    fontSize: SIZES.md,
    fontFamily: FONTS.bold,
  },
  infoBanner: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius.md,
    padding: SIZES.spacing.md,
    marginBottom: SIZES.spacing.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.sm,
    fontFamily: FONTS.regular,
    lineHeight: 22,
  },
  turnoverHint: {
    backgroundColor: COLORS.warningLight,
    borderRadius: SIZES.radius.sm,
    padding: SIZES.spacing.sm,
    marginBottom: SIZES.spacing.md,
    marginTop: -SIZES.spacing.sm,
    borderWidth: 1,
    borderColor: COLORS.warning + '44',
  },
  turnoverHintText: {
    color: COLORS.warning,
    fontSize: SIZES.xs,
    fontFamily: FONTS.regular,
    lineHeight: 18,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: SIZES.sm,
    fontFamily: FONTS.semiBold,
    marginBottom: SIZES.spacing.sm,
    letterSpacing: 0.5,
  },
  monthsScroll: {
    marginBottom: SIZES.spacing.lg,
  },
  monthChip: {
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.xs,
    borderRadius: SIZES.radius.full,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SIZES.spacing.xs,
  },
  monthChipActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  monthText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.sm,
    fontFamily: FONTS.medium,
  },
  monthTextActive: {
    color: COLORS.primary,
    fontFamily: FONTS.semiBold,
  },
  buttonContainer: {
    marginTop: SIZES.spacing.sm,
  },
});