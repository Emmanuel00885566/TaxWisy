const TAX_YEAR = 2025;
const CIT_LOW_RATE = 0.20;
const CIT_HIGH_RATE = 0.30;
const CIT_THRESHOLD = 100000000;

let totalIncome = 0;
let totalExpenses = 0;
let taxableIncome = 0;

const greetUser = (fullname) => `Welcome back, ${fullname}!`;

const transactions = [
  { id: 1, type: "income", amount: 250000, description: "Freelance project" },
  { id: 2, type: "expense", amount: 50000, description: "Office rent" },
  { id: 3, type: "income", amount: 180000, description: "Consulting fee" },
  { id: 4, type: "expense", amount: 30000, description: "Software subscription" },
];

const incomes = transactions.filter((t) => t.type === "income");
const expenses = transactions.filter((t) => t.type === "expense");
const totalIncomeAmount = incomes.reduce((sum, t) => sum + t.amount, 0);
const totalExpenseAmount = expenses.reduce((sum, t) => sum + t.amount, 0);

const user = {
  userId: "673ef02c2b94a2",
  fullname: "Emmanuel Adeboye",
  email: "emmanuel@email.com",
  role: "individual",
  businessName: null,
};

const { fullname, role } = user;

const computeCIT = (turnover) => {
  if (turnover < CIT_THRESHOLD) {
    return turnover * CIT_LOW_RATE;
  } else {
    return turnover * CIT_HIGH_RATE;
  }
};

console.log(computeCIT(50000000));
console.log(computeCIT(150000000));