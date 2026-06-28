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

  const userId = user?.userId || user?.id;

  const fetchTransactions = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const result = await transactionService.getAll(userId);
      const data = result?.transactions || result?.data || result || [];
      setTransactions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log('Error fetching transactions:', error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchIncomeExpenses = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const result = await incomeExpenseService.getAll(userId);
      let data = [];
      if (Array.isArray(result)) data = result;
      else if (Array.isArray(result?.data)) data = result.data;
      else if (Array.isArray(result?.records)) data = result.records;
      else if (Array.isArray(result?.incomeExpenses)) data = result.incomeExpenses;
      else if (result?.data && !Array.isArray(result.data)) data = [result.data];
      setIncomeExpenses(data);
    } catch (error) {
      console.log('Error fetching income/expenses:', error);
      setIncomeExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    if (!userId) return;
    try {
      const result = await incomeExpenseService.getAll(userId);
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
      console.log('Error fetching summary:', error);
      setSummary({ totalIncome: 0, totalExpenses: 0 });
    }
  };

  const addTransaction = async (data) => {
    try {
      const result = await transactionService.add(userId, data);
      await fetchTransactions();
      return result;
    } catch (error) {
      console.log('Error adding transaction:', error);
      throw error;
    }
  };

  const deleteTransaction = async (transactionId) => {
    try {
      await transactionService.delete(userId, transactionId);
      await fetchTransactions();
    } catch (error) {
      console.log('Error deleting transaction:', error);
      throw error;
    }
  };

  const addIncomeExpense = async (data) => {
    try {
      const result = await incomeExpenseService.create(userId, data);
      await fetchIncomeExpenses();
      await fetchSummary();
      return result;
    } catch (error) {
      console.log('Error adding income/expense:', error);
      throw error;
    }
  };

  const deleteIncomeExpense = async (id) => {
    try {
      await incomeExpenseService.delete(userId, id);
      await fetchIncomeExpenses();
      await fetchSummary();
    } catch (error) {
      console.log('Error deleting income/expense:', error);
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
        fetchTransactions,
        fetchIncomeExpenses,
        fetchSummary,
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