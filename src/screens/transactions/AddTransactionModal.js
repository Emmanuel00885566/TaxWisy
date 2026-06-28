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
  FlatList,
} from 'react-native';
import { COLORS, FONTS, SIZES } from '../../utils/theme';
import Input from '../../components/Input';
import Button from '../../components/Button';

// Custom Picker Modal
function PickerModal({ visible, title, options, onSelect, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity style={pickerStyles.backdrop} onPress={onClose} />
      <View style={pickerStyles.container}>
        <View style={pickerStyles.header}>
          <Text style={pickerStyles.title}>{title}</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={pickerStyles.close}>✕</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={options}
          keyExtractor={(item) => String(item.value)}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={pickerStyles.option}
              onPress={() => {
                onSelect(item.value);
                onClose();
              }}
            >
              <Text style={pickerStyles.optionText}>{item.label}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </Modal>
  );
}

const pickerStyles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.card,
    borderTopLeftRadius: SIZES.radius.xl,
    borderTopRightRadius: SIZES.radius.xl,
    maxHeight: '50%',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderBottomWidth: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: SIZES.lg,
    fontFamily: FONTS.bold,
  },
  close: {
    color: COLORS.textSecondary,
    fontSize: SIZES.md,
  },
  option: {
    padding: SIZES.spacing.md,
    paddingHorizontal: SIZES.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  optionText: {
    color: COLORS.textPrimary,
    fontSize: SIZES.md,
    fontFamily: FONTS.regular,
  },
});

export default function AddTransactionModal({ visible, onClose, onAdd }) {
  const [type, setType] = useState('income');
  const [loading, setLoading] = useState(false);
  const [activePicker, setActivePicker] = useState(null);

  const today = new Date();
  const [form, setForm] = useState({
    amount: '',
    description: '',
    category: '',
    date: today.toISOString().split('T')[0],
    is_deductible: false,
  });
  const [errors, setErrors] = useState({});

  const updateForm = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  // Date parts
  const dateParts = form.date.split('-');
  const selectedYear = dateParts[0];
  const selectedMonth = dateParts[1];
  const selectedDay = dateParts[2];

  const months = [
    { label: 'January', value: '01' },
    { label: 'February', value: '02' },
    { label: 'March', value: '03' },
    { label: 'April', value: '04' },
    { label: 'May', value: '05' },
    { label: 'June', value: '06' },
    { label: 'July', value: '07' },
    { label: 'August', value: '08' },
    { label: 'September', value: '09' },
    { label: 'October', value: '10' },
    { label: 'November', value: '11' },
    { label: 'December', value: '12' },
  ];

  const currentYear = today.getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => ({
    label: String(currentYear - i),
    value: String(currentYear - i),
  }));

  const daysInMonth = new Date(
    Number(selectedYear),
    Number(selectedMonth),
    0
  ).getDate();

  const days = Array.from({ length: daysInMonth }, (_, i) => ({
    label: String(i + 1).padStart(2, '0'),
    value: String(i + 1).padStart(2, '0'),
  }));

  const getMonthName = (monthNum) => {
    const m = months.find((m) => m.value === monthNum);
    return m ? m.label.slice(0, 3) : monthNum;
  };

  const validate = () => {
    const newErrors = {};
    if (!form.amount) newErrors.amount = 'Amount is required';
    else if (isNaN(Number(form.amount))) newErrors.amount = 'Enter a valid amount';
    else if (Number(form.amount) <= 0) newErrors.amount = 'Amount must be greater than 0';
    if (!form.description) newErrors.description = 'Description is required';
    if (!form.category) newErrors.category = 'Category is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAdd = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await onAdd({
        type,
        amount: Number(form.amount),
        description: form.description,
        category: form.category,
        date: form.date,
        is_deductible: form.is_deductible,
      });
      setForm({
        amount: '',
        description: '',
        category: '',
        date: today.toISOString().split('T')[0],
        is_deductible: false,
      });
      setErrors({});
      onClose();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to add transaction');
    } finally {
      setLoading(false);
    }
  };

  const categories = type === 'income'
    ? ['Salary', 'Freelance', 'Business', 'Investment', 'Rental', 'Other']
    : ['Office Rent', 'Equipment', 'Software', 'Marketing', 'Transport', 'Utilities', 'Other'];

  return (
    <>
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
              <Text style={styles.title}>Add Transaction</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Type Toggle */}
              <View style={styles.typeToggle}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    type === 'income' && styles.typeButtonActive,
                    type === 'income' && { backgroundColor: COLORS.incomeLight },
                  ]}
                  onPress={() => setType('income')}
                >
                  <Text style={styles.typeEmoji}>💰</Text>
                  <Text style={[
                    styles.typeText,
                    type === 'income' && { color: COLORS.income },
                  ]}>Income</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    type === 'expense' && styles.typeButtonActive,
                    type === 'expense' && { backgroundColor: COLORS.expenseLight },
                  ]}
                  onPress={() => setType('expense')}
                >
                  <Text style={styles.typeEmoji}>💸</Text>
                  <Text style={[
                    styles.typeText,
                    type === 'expense' && { color: COLORS.expense },
                  ]}>Expense</Text>
                </TouchableOpacity>
              </View>

              {/* Amount */}
              <Input
                label="Amount (₦)"
                placeholder="0.00"
                value={form.amount}
                onChangeText={(text) => updateForm('amount', text)}
                keyboardType="numeric"
                icon="₦"
                error={errors.amount}
              />

              {/* Description */}
              <Input
                label="Description"
                placeholder="what is this for?"
                value={form.description}
                onChangeText={(text) => updateForm('description', text)}
                icon="📝"
                error={errors.description}
              />

              {/* Category */}
              <Text style={styles.label}>Category</Text>
              {form.category ? (
                <View style={styles.selectedCategory}>
                  <Text style={styles.selectedCategoryText}>
                    Selected: {form.category}
                  </Text>
                </View>
              ) : errors.category ? (
                <Text style={styles.errorText}>{errors.category}</Text>
              ) : null}

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoriesScroll}
              >
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryChip,
                      form.category === cat && styles.categoryChipActive,
                    ]}
                    onPress={() => updateForm('category', cat)}
                  >
                    <Text style={[
                      styles.categoryText,
                      form.category === cat && styles.categoryTextActive,
                    ]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Date Picker */}
              <Text style={styles.label}>Date</Text>
              <View style={styles.dateRow}>
                <TouchableOpacity
                  style={styles.dateSegment}
                  onPress={() => setActivePicker('day')}
                >
                  <Text style={styles.dateSegmentLabel}>Day</Text>
                  <Text style={styles.dateSegmentValue}>{selectedDay}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.dateSegment}
                  onPress={() => setActivePicker('month')}
                >
                  <Text style={styles.dateSegmentLabel}>Month</Text>
                  <Text style={styles.dateSegmentValue}>
                    {getMonthName(selectedMonth)}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.dateSegment}
                  onPress={() => setActivePicker('year')}
                >
                  <Text style={styles.dateSegmentLabel}>Year</Text>
                  <Text style={styles.dateSegmentValue}>{selectedYear}</Text>
                </TouchableOpacity>
              </View>

              {/* Is Deductible Toggle */}
              <TouchableOpacity
                style={styles.deductibleRow}
                onPress={() => updateForm('is_deductible', !form.is_deductible)}
              >
                <View>
                  <Text style={styles.deductibleLabel}>Tax Deductible</Text>
                  <Text style={styles.deductibleSub}>
                    Can this expense reduce your taxable income?
                  </Text>
                </View>
                <View style={[
                  styles.toggle,
                  form.is_deductible && styles.toggleActive,
                ]}>
                  <View style={[
                    styles.toggleThumb,
                    form.is_deductible && styles.toggleThumbActive,
                  ]} />
                </View>
              </TouchableOpacity>

              <View style={styles.buttonContainer}>
                <Button
                  title={`Add ${type === 'income' ? 'Income' : 'Expense'}`}
                  onPress={handleAdd}
                  loading={loading}
                />
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Day Picker */}
      <PickerModal
        visible={activePicker === 'day'}
        title="Select Day"
        options={days}
        onSelect={(val) => {
          const parts = form.date.split('-');
          parts[2] = val;
          updateForm('date', parts.join('-'));
        }}
        onClose={() => setActivePicker(null)}
      />

      {/* Month Picker */}
      <PickerModal
        visible={activePicker === 'month'}
        title="Select Month"
        options={months}
        onSelect={(val) => {
          const parts = form.date.split('-');
          parts[1] = val;
          updateForm('date', parts.join('-'));
        }}
        onClose={() => setActivePicker(null)}
      />

      {/* Year Picker */}
      <PickerModal
        visible={activePicker === 'year'}
        title="Select Year"
        options={years}
        onSelect={(val) => {
          const parts = form.date.split('-');
          parts[0] = val;
          updateForm('date', parts.join('-'));
        }}
        onClose={() => setActivePicker(null)}
      />
    </>
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
  typeToggle: {
    flexDirection: 'row',
    gap: SIZES.spacing.sm,
    marginBottom: SIZES.spacing.lg,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.spacing.xs,
    paddingVertical: SIZES.spacing.md,
    borderRadius: SIZES.radius.md,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  typeButtonActive: {
    borderColor: 'transparent',
  },
  typeEmoji: {
    fontSize: 18,
  },
  typeText: {
    fontSize: SIZES.md,
    fontFamily: FONTS.semiBold,
    color: COLORS.textSecondary,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: SIZES.sm,
    fontFamily: FONTS.semiBold,
    marginBottom: SIZES.spacing.sm,
    letterSpacing: 0.5,
  },
  categoriesScroll: {
    marginBottom: SIZES.spacing.md,
  },
  categoryChip: {
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.xs,
    borderRadius: SIZES.radius.full,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SIZES.spacing.xs,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  categoryText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.sm,
    fontFamily: FONTS.medium,
  },
  categoryTextActive: {
    color: COLORS.primary,
    fontFamily: FONTS.semiBold,
  },
  selectedCategory: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: SIZES.radius.sm,
    padding: SIZES.spacing.xs,
    marginBottom: SIZES.spacing.xs,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  selectedCategoryText: {
    color: COLORS.primary,
    fontSize: SIZES.sm,
    fontFamily: FONTS.semiBold,
  },
  errorText: {
    color: COLORS.error,
    fontSize: SIZES.xs,
    fontFamily: FONTS.regular,
    marginBottom: SIZES.spacing.sm,
  },
  dateRow: {
    flexDirection: 'row',
    gap: SIZES.spacing.sm,
    marginBottom: SIZES.spacing.md,
  },
  dateSegment: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SIZES.spacing.md,
    alignItems: 'center',
  },
  dateSegmentLabel: {
    color: COLORS.textSecondary,
    fontSize: SIZES.xs,
    fontFamily: FONTS.regular,
    marginBottom: 4,
  },
  dateSegmentValue: {
    color: COLORS.textPrimary,
    fontSize: SIZES.md,
    fontFamily: FONTS.bold,
  },
  deductibleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius.md,
    padding: SIZES.spacing.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SIZES.spacing.lg,
  },
  deductibleLabel: {
    color: COLORS.textPrimary,
    fontSize: SIZES.md,
    fontFamily: FONTS.semiBold,
    marginBottom: 2,
  },
  deductibleSub: {
    color: COLORS.textSecondary,
    fontSize: SIZES.xs,
    fontFamily: FONTS.regular,
    maxWidth: '80%',
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    padding: 2,
  },
  toggleActive: {
    backgroundColor: COLORS.primary,
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.textSecondary,
  },
  toggleThumbActive: {
    backgroundColor: COLORS.background,
    alignSelf: 'flex-end',
  },
  buttonContainer: {
    marginTop: SIZES.spacing.sm,
  },
});