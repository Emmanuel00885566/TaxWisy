import { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { COLORS, FONTS, SIZES } from '../../utils/theme';
import { AuthContext } from '../../context/AuthContext';
import { TransactionContext } from '../../context/TransactionContext';
import incomeExpenseService from '../../services/incomeExpenseService';
import Header from '../../components/Header';
import TransactionCard from '../../components/TransactionCard';
import EmptyState from '../../components/EmptyState';
import Loader from '../../components/Loader';
import AddTransactionModal from './AddTransactionModal';
import EditTransactionModal from './EditTransactionModal';

export default function TransactionScreen() {
  const { user } = useContext(AuthContext);
  const {
    incomeExpenses = [],
    loading,
    loadingMore,
    hasMore,
    fetchIncomeExpenses,
    fetchSummary,
    addIncomeExpense,
    loadMoreIncomeExpenses,
  } = useContext(TransactionContext);

  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const userId = user?.userId || user?.id;

  useEffect(() => {
    if (userId) fetchIncomeExpenses(true);
  }, [userId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchIncomeExpenses(true);
    await fetchSummary();
    setRefreshing(false);
  };

  const handleAdd = async (data) => {
    try {
      await addIncomeExpense(data);
    } catch (error) {
      throw error;
    }
  };

  const handleEdit = async (id, data) => {
    try {
      await incomeExpenseService.update(userId, id, data);
      await fetchIncomeExpenses(true);
      await fetchSummary();
    } catch (error) {
      throw error;
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await incomeExpenseService.delete(userId, id);
              await fetchIncomeExpenses(true);
              await fetchSummary();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete transaction');
            }
          },
        },
      ]
    );
  };

  const handleTransactionPress = (transaction) => {
    Alert.alert(
      'Transaction Options',
      `${transaction.description}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: '✏️ Edit',
          onPress: () => {
            setSelectedTransaction(transaction);
            setEditModalVisible(true);
          },
        },
        {
          text: '🗑️ Delete',
          style: 'destructive',
          onPress: () => handleDelete(transaction.id),
        },
      ]
    );
  };

  const filteredData = (incomeExpenses || []).filter((item) => {
    const matchesFilter = filter === 'all' || item.type === filter;
    const matchesSearch =
      searchQuery === '' ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(item.amount).includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  const totalIncome = (incomeExpenses || [])
    .filter((i) => i.type === 'income')
    .reduce((sum, i) => sum + Number(i.amount), 0);

  const totalExpenses = (incomeExpenses || [])
    .filter((i) => i.type === 'expense')
    .reduce((sum, i) => sum + Number(i.amount), 0);

  const formatAmount = (amt) =>
    `₦${Number(amt || 0).toLocaleString('en-NG')}`;

  if (loading && !refreshing) return <Loader message="Loading transactions..." />;

  return (
    <View style={styles.container}>
      <Header
        title="Transactions"
        subtitle="Your income & expenses"
      />

      {/* Summary Row */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { borderColor: COLORS.income + '44' }]}>
          <Text style={styles.summaryLabel}>Total Income</Text>
          <Text style={[styles.summaryAmount, { color: COLORS.income }]}>
            {formatAmount(totalIncome)}
          </Text>
        </View>
        <View style={[styles.summaryCard, { borderColor: COLORS.expense + '44' }]}>
          <Text style={styles.summaryLabel}>Total Expenses</Text>
          <Text style={[styles.summaryAmount, { color: COLORS.expense }]}>
            {formatAmount(totalExpenses)}
          </Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search transactions..."
          placeholderTextColor={COLORS.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={styles.clearSearch}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {['all', 'income', 'expense'].map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterTab,
              filter === f && styles.filterTabActive,
            ]}
            onPress={() => setFilter(f)}
          >
            <Text style={[
              styles.filterText,
              filter === f && styles.filterTextActive,
            ]}>
              {f === 'all' ? `All (${incomeExpenses.length})` :
               f === 'income' ? `Income (${incomeExpenses.filter(i => i.type === 'income').length})` :
               `Expenses (${incomeExpenses.filter(i => i.type === 'expense').length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search results count */}
      {searchQuery.length > 0 && (
        <Text style={styles.searchResults}>
          {filteredData.length} result{filteredData.length !== 1 ? 's' : ''} for "{searchQuery}"
        </Text>
      )}

      {/* List */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => String(item.id || item.income_expense_id)}
        renderItem={({ item }) => (
          <TransactionCard
            transaction={item}
            onPress={() => handleTransactionPress(item)}
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
        onEndReached={() => {
          if (hasMore && !loadingMore && searchQuery === '') {
            loadMoreIncomeExpenses();
          }
        }}
        onEndReachedThreshold={0.3}
        ListFooterComponent={() => {
          if (loadingMore) {
            return (
              <View style={styles.loadingMore}>
                <ActivityIndicator color={COLORS.primary} size="small" />
                <Text style={styles.loadingMoreText}>Loading more...</Text>
              </View>
            );
          }
          if (!hasMore && incomeExpenses.length > 0) {
            return (
              <Text style={styles.noMoreText}>
                All {incomeExpenses.length} transactions loaded ✓
              </Text>
            );
          }
          return null;
        }}
        ListEmptyComponent={
          <EmptyState
            icon={searchQuery ? '🔍' : filter === 'income' ? '💰' : filter === 'expense' ? '💸' : '💳'}
            title={searchQuery ? 'No results found' : `No ${filter === 'all' ? 'transactions' : filter} yet`}
            message={searchQuery ? `No transactions match "${searchQuery}"` : 'Tap the + button to add your first record'}
          />
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {/* Add Modal */}
      <AddTransactionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAdd={handleAdd}
      />

      {/* Edit Modal */}
      <EditTransactionModal
        visible={editModalVisible}
        onClose={() => {
          setEditModalVisible(false);
          setSelectedTransaction(null);
        }}
        onEdit={handleEdit}
        transaction={selectedTransaction}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  summaryRow: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.spacing.lg,
    gap: SIZES.spacing.sm,
    marginBottom: SIZES.spacing.md,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius.md,
    padding: SIZES.spacing.md,
    borderWidth: 1,
  },
  summaryLabel: {
    color: COLORS.textSecondary,
    fontSize: SIZES.xs,
    fontFamily: FONTS.regular,
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: SIZES.lg,
    fontFamily: FONTS.bold,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SIZES.spacing.md,
    marginHorizontal: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.md,
    gap: SIZES.spacing.sm,
  },
  searchIcon: {
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: SIZES.md,
    fontFamily: FONTS.regular,
    paddingVertical: SIZES.spacing.md,
  },
  clearSearch: {
    color: COLORS.textSecondary,
    fontSize: SIZES.md,
    paddingLeft: SIZES.spacing.xs,
  },
  searchResults: {
    color: COLORS.textSecondary,
    fontSize: SIZES.sm,
    fontFamily: FONTS.regular,
    paddingHorizontal: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.sm,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.spacing.lg,
    gap: SIZES.spacing.xs,
    marginBottom: SIZES.spacing.md,
  },
  filterTab: {
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.xs,
    borderRadius: SIZES.radius.full,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterTabActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  filterText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.sm,
    fontFamily: FONTS.medium,
  },
  filterTextActive: {
    color: COLORS.primary,
    fontFamily: FONTS.semiBold,
  },
  list: {
    paddingHorizontal: SIZES.spacing.lg,
    paddingBottom: 100,
  },
  loadingMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.spacing.md,
    gap: SIZES.spacing.sm,
  },
  loadingMoreText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.sm,
    fontFamily: FONTS.regular,
  },
  noMoreText: {
    color: COLORS.textMuted,
    fontSize: SIZES.xs,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    padding: SIZES.spacing.md,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: SIZES.spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 28,
    color: COLORS.background,
    fontFamily: FONTS.bold,
    lineHeight: 32,
  },
});