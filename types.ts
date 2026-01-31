
export interface Expense {
  id: number;
  item: string;
  ref: string;
  amount: number;
  icon: string;
}

// Added BusinessExpense interface used in BusinessExpensesPage.tsx
export interface BusinessExpense {
  id: number;
  item: string;
  amount: number;
  ref: string;
  icon: string;
  date: string;
  user: string;
}

export interface Client {
  id: number;
  name: string;
  desc: string;
  status: string;
  progress: string; // Clase de color de fondo Tailwind
  pct: string;
  start: string;
  end: string;
  color: string; // Clase de color de texto Tailwind
  total: number;
  phone?: string;
  location?: string;
  abonoPercent?: number;
  abonoTotal?: number; // Monto real abonado
  expenses?: Expense[]; // Lista de gastos registrados
}

export interface HistoryProject {
  title: string;
  type: string;
  cost: string;
  debt: string;
  debtColor: string;
}