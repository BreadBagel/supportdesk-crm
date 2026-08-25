import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { TicketsPage } from './pages/TicketsPage';
import { TicketDetailPage } from './pages/TicketDetailPage';
import { CustomersPage } from './pages/CustomersPage';
import { UsersPage } from './pages/UsersPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

function AppContent() {
  const { user, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [openCreateTicketDirectly, setOpenCreateTicketDirectly] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  if (isLoading) {
    return (
      <div id="app-loading" className="min-h-screen bg-[#0b0d14] text-white flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono text-slate-400">Loading SupportDesk CRM...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (isRegistering) {
      return <RegisterPage onSwitchToLogin={() => setIsRegistering(false)} />;
    }
    return <LoginPage onSwitchToRegister={() => setIsRegistering(true)} />;
  }

  const navigateToTicketDetail = (id: string) => {
    setSelectedTicketId(id);
    setCurrentTab('ticket-detail');
  };

  const navigateToTickets = () => {
    setSelectedTicketId(null);
    setCurrentTab('tickets');
  };

  const handleOpenCreateTicket = () => {
    setCurrentTab('tickets');
    setOpenCreateTicketDirectly(true);
  };

  const handleSelectTab = (tab: string) => {
    setSelectedTicketId(null);
    setCurrentTab(tab);
  };

  return (
    <div id="app-layout" className="min-h-screen bg-[#0b0d14] flex flex-col font-sans text-slate-100 antialiased selection:bg-purple-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar currentTab={currentTab} onSelectTab={handleSelectTab} />

      {/* Main Workspace Container */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto my-0 md:my-6 px-4 sm:px-6 lg:px-8 gap-6 animate-fade-in">
        {/* Navigation Sidebar */}
        <div className="hidden md:block">
          <Sidebar currentTab={currentTab} onSelectTab={handleSelectTab} />
        </div>

        {/* Main Workspace Page Content */}
        <main className="flex-1 min-w-0 py-4 md:py-0">
          {currentTab === 'dashboard' && (
            <DashboardPage
              onNavigateToTickets={navigateToTickets}
              onNavigateToTicketDetail={navigateToTicketDetail}
              onNavigateToCustomers={() => setCurrentTab('customers')}
              onOpenCreateTicketModal={handleOpenCreateTicket}
            />
          )}

          {currentTab === 'tickets' && (
            <TicketsPage
              onNavigateToDetail={navigateToTicketDetail}
              openCreateModalDirectly={openCreateTicketDirectly}
              onCloseCreateModalDirectly={() => setOpenCreateTicketDirectly(false)}
            />
          )}

          {currentTab === 'ticket-detail' && selectedTicketId && (
            <TicketDetailPage
              ticketId={selectedTicketId}
              onBack={navigateToTickets}
            />
          )}

          {currentTab === 'customers' && (
            <CustomersPage onNavigateToTicketDetail={navigateToTicketDetail} />
          )}

          {currentTab === 'users' && user.role === 'ADMIN' && (
            <UsersPage />
          )}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
