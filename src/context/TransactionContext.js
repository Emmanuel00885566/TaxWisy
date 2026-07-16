import { createContext, useState, useContext } from 'react';
import { AuthContext } from './AuthContext';
import transactionService from '../services/transactionService';
import incomeExpenseService from '../services/incomeExpenseService';

export const TransactionContext = createContext();

export function TransactionProvider({ children }) {
  const { user } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [incomeExpenses, setIncomeExpenses] = useState([]);
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpenses: 0 });
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const LIMIT = 10;

  const userId = user?.userId || user?.id;

  const fetchTransactions = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const result = await transactionService.getAll(userId);
      const data = result?.transactions || result?.data || result || [];
      setTransactions(Array.isArray(data) ? data : []);
    } catch (error) {
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchIncomeExpenses = async (reset = true) => {
    if (!userId) return;
    if (reset) {
      setLoading(true);
      setPage(0);
    } else {
      setLoadingMore(true);
    }

    try {
      const currentPage = reset ? 0 : page;
      const result = await incomeExpenseService.getAll(userId, currentPage, LIMIT);

      let data = [];
      if (Array.isArray(result)) data = result;
      else if (Array.isArray(result?.data)) data = result.data;
      else if (Array.isArray(result?.records)) data = result.records;
      else if (Array.isArray(result?.incomeExpenses)) data = result.incomeExpenses;
      else if (result?.data && !Array.isArray(result.data)) data = [result.data];

      if (reset) {
        setIncomeExpenses(data);
        setPage(1);
      } else {
        setIncomeExpenses(prev => [...prev, ...data]);
        setPage(prev => prev + 1);
      }

      setHasMore(result?.hasMore || false);
    } catch (error) {
      if (reset) setIncomeExpenses([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreIncomeExpenses = async () => {
    if (!hasMore || loadingMore || loading) return;
    await fetchIncomeExpenses(false);
  };

  const fetchSummary = async () => {
    if (!userId) return;
    try {
      const result = await incomeExpenseService.getAll(userId, 0, 10000);
      let data = [];
      if (Array.isArray(result)) data = result;
      else if (Array.isArray(result?.data)) data = result.data;
      else if (result?.data && !Array.isArray(result.data)) data = [result.data];

      const totalIncome = data
        .filter((item) => item.type === 'income')
        .reduce((sum, item) => sum + Number(item.amount || 0), 0);

      const totalExpenses = data
        .filter((item) => item.type === 'expense')
        .reduce((sum, item) => sum + Number(item.amount || 0), 0);

      setSummary({ totalIncome, totalExpenses });
    } catch (error) {
      setSummary({ totalIncome: 0, totalExpenses: 0 });
    }
  };

  const addTransaction = async (data) => {
    try {
      const result = await transactionService.add(userId, data);
      await fetchTransactions();
      return result;
    } catch (error) {
      throw error;
    }
  };

  const deleteTransaction = async (transactionId) => {
    try {
      await transactionService.delete(userId, transactionId);
      await fetchTransactions();
    } catch (error) {
      throw error;
    }
  };

  const addIncomeExpense = async (data) => {
    try {
      const result = await incomeExpenseService.create(userId, data);
      await fetchIncomeExpenses(true);
      await fetchSummary();
      return result;
    } catch (error) {
      throw error;
    }
  };

  const deleteIncomeExpense = async (id) => {
    try {
      await incomeExpenseService.delete(userId, id);
      await fetchIncomeExpenses(true);
      await fetchSummary();
    } catch (error) {
      throw error;
    }
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        incomeExpenses,
        summary,
        loading,
        loadingMore,
        hasMore,
        fetchTransactions,
        fetchIncomeExpenses,
        fetchSummary,
        loadMoreIncomeExpenses,
        addTransaction,
        deleteTransaction,
        addIncomeExpense,
        deleteIncomeExpense,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
}