import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Cockpit from './pages/Cockpit';
import CRMPipeline from './pages/CRM';
import LMSBatches from './pages/LMS';
import FinanceHub from './pages/Finance';
import PTEEngine from './pages/PTE';
import ERPSpaces from './pages/ERP';
import GlobalReports from './pages/Reports';
import Attendance from './pages/Attendance';
import Students from './pages/Students';
import BranchManagement from './pages/BranchManagement';
import Payroll from './pages/Payroll';
import MaterialCenter from './pages/MaterialCenter';
import Assets from './pages/Assets';
import Automation from './pages/Automation';
import Reconciliation from './pages/Reconciliation';
// Accounting pages (same as accounting portal)
import Invoices from './pages/AdminInvoices';
import ExpenseManager from './pages/AdminExpenses';
import BudgetTracker from './pages/AdminBudget';
import Ledger from './pages/AdminLedger';
import Journal from './pages/AdminJournal';
import CashFlow from './pages/AdminCashFlow';
import ReportsHub from './pages/AdminReportsHub';
import POSFees from './pages/AdminPOSFees';
import LiquidAccounts from './pages/AdminLiquidAccounts';
import WebsiteManagement from './pages/WebsiteManagement';
import LoginPage from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import './styles/GlobalStyles.css';

const P = ({ title, children }) => (
  <ProtectedRoute><Layout title={title}>{children}</Layout></ProtectedRoute>
);

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router basename="/admin">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<ProtectedRoute><Navigate to="/dashboard" /></ProtectedRoute>} />
            <Route path="/dashboard" element={<P title="Operations Cockpit"><Cockpit /></P>} />
            <Route path="/reports" element={<P title="Enterprise Intelligence"><GlobalReports /></P>} />
            <Route path="/crm" element={<P title="CRM Pipeline"><CRMPipeline /></P>} />
            <Route path="/students" element={<P title="Student Directory"><Students /></P>} />
            <Route path="/lms" element={<P title="LMS Batch Deck"><LMSBatches /></P>} />
            <Route path="/pos" element={<P title="POS & Fee Management"><POSFees /></P>} />
            <Route path="/finance" element={<P title="Accounts Overview"><FinanceHub /></P>} />
            <Route path="/invoices" element={<P title="Invoice Management"><Invoices /></P>} />
            <Route path="/expenses" element={<P title="Expense Manager"><ExpenseManager /></P>} />
            <Route path="/budget" element={<P title="Budget Tracker"><BudgetTracker /></P>} />
            <Route path="/ledger" element={<P title="General Ledger"><Ledger /></P>} />
            <Route path="/journal" element={<P title="Journal Entry"><Journal /></P>} />
            <Route path="/cashflow" element={<P title="Cash Flow Report"><CashFlow /></P>} />
            <Route path="/finance-reports" element={<P title="Financial Reports"><ReportsHub /></P>} />
            <Route path="/liquid-accounts" element={<P title="Bank & Cash"><LiquidAccounts /></P>} />
            <Route path="/pte" element={<P title="PTE Practice Engine"><PTEEngine /></P>} />
            <Route path="/erp" element={<P title="ERP Spaces & Scheduling"><ERPSpaces /></P>} />
            <Route path="/assets" element={<P title="Asset Management"><Assets /></P>} />
            <Route path="/payroll" element={<P title="Staff & Payroll"><Payroll /></P>} />
            <Route path="/attendance" element={<P title="Attendance Registry"><Attendance /></P>} />
            <Route path="/branches" element={<P title="Branch Management"><BranchManagement /></P>} />
            <Route path="/materials" element={<P title="Material Center"><MaterialCenter /></P>} />
            <Route path="/automation" element={<P title="Automation Engine"><Automation /></P>} />
            <Route path="/reconciliation" element={<P title="Reconciliation Center"><Reconciliation /></P>} />
            <Route path="/website-management" element={<P title="Website Management"><WebsiteManagement /></P>} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
