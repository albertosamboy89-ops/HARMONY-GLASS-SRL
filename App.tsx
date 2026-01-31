
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ClientsHistoryPage from './pages/ClientsHistoryPage';
import NewClientPage from './pages/NewClientPage';
import ExpenseManagementPage from './pages/ExpenseManagementPage';
import PaymentsPage from './pages/PaymentsPage';
import SettingsPage from './pages/SettingsPage';
import BusinessExpensesPage from './pages/BusinessExpensesPage';
import { Client } from './types';

const STORAGE_KEY = 'harmony_glass_clients_v4';
const HISTORY_KEY = 'harmony_glass_history_v4';
const SESSION_KEY = 'harmony_glass_session';
const USER_KEY = 'harmony_glass_username';

const App: React.FC = () => {
  const [userRole, setUserRole] = useState<'admin' | 'basic' | null>(() => {
    const saved = sessionStorage.getItem(SESSION_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  const [currentUser, setCurrentUser] = useState<string>(() => {
    return sessionStorage.getItem(USER_KEY) || '';
  });

  const [activeClients, setActiveClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
    return []; 
  });

  const [historyClients, setHistoryClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem(HISTORY_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);

  // Guardado persistente de datos de proyectos
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(activeClients));
  }, [activeClients]);

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(historyClients));
  }, [historyClients]);

  // Guardado de sesión
  useEffect(() => {
    if (userRole) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(userRole));
      sessionStorage.setItem(USER_KEY, currentUser);
    }
  }, [userRole, currentUser]);

  const handleLogin = (role: 'admin' | 'basic', username: string) => {
    setCurrentUser(username);
    setUserRole(role);
  };

  const handleLogout = () => {
    // Limpieza atómica de la sesión
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(USER_KEY);
    setUserRole(null);
    setCurrentUser('');
  };

  const handleAddClient = (newClient: Client) => {
    setActiveClients(prev => [newClient, ...prev]);
    setSelectedClientId(newClient.id);
  };

  const handleUpdateClient = (updatedClient: Client) => {
    setActiveClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
  };

  const handleDeleteActiveClient = (id: number) => {
    const clientToArchive = activeClients.find(c => c.id === id);
    if (!clientToArchive) return;

    const archivedClient: Client = {
      ...clientToArchive,
      status: "Finalizado",
      end: new Date().toLocaleDateString()
    };
    
    setHistoryClients(prev => [archivedClient, ...prev]);
    setActiveClients(prev => prev.filter(c => c.id !== id));
  };

  const handleDeleteHistoryClient = (id: number) => {
    setHistoryClients(prev => prev.filter(c => c.id !== id));
  };

  const getSelectedClient = () => {
    return activeClients.find(c => c.id === selectedClientId) || null;
  };

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="/dashboard" element={
          userRole ? (
            <DashboardPage 
              readonly={userRole === 'basic'} 
              clients={activeClients} 
              onSelectClient={setSelectedClientId} 
              onDeleteClient={userRole === 'admin' ? handleDeleteActiveClient : undefined}
            />
          ) : <Navigate to="/" />
        } />
        <Route path="/clients" element={
          userRole ? <ClientsHistoryPage archivedClients={historyClients} onDeleteHistory={userRole === 'admin' ? handleDeleteHistoryClient : undefined} /> : <Navigate to="/" />
        } />
        <Route path="/new-client" element={userRole === 'admin' ? <NewClientPage onAddClient={handleAddClient} /> : <Navigate to="/dashboard" />} />
        <Route path="/expense-management" element={
          userRole ? <ExpenseManagementPage readonly={userRole === 'basic'} clientData={getSelectedClient()} onUpdateClient={handleUpdateClient} /> : <Navigate to="/" />
        } />
        <Route path="/payments" element={userRole ? <PaymentsPage clients={activeClients} /> : <Navigate to="/" />} />
        <Route path="/business-expenses" element={userRole ? <BusinessExpensesPage username={currentUser} /> : <Navigate to="/" />} />
        <Route path="/settings" element={userRole ? <SettingsPage onLogout={handleLogout} role={userRole} /> : <Navigate to="/" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
