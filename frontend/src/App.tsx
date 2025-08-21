import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Activity, Calendar, Trophy, TrendingUp, Calculator as CalculatorIcon } from 'lucide-react';
import LiveScores from './pages/LiveScores';
import Upcoming from './pages/Upcoming';
import Series from './pages/Series';
import Odds from './pages/Odds';
import Calculator from './pages/Calculator';
import ErrorBoundary from './components/ErrorBoundary';
import { cn } from './lib/utils';

const tabs = [
  { id: 'live', label: 'Live', icon: Activity, path: '/live' },
  { id: 'upcoming', label: 'Upcoming', icon: Calendar, path: '/upcoming' },
  { id: 'series', label: 'Series', icon: Trophy, path: '/series' },
  { id: 'odds', label: 'Odds', icon: TrendingUp, path: '/odds' },
  { id: 'calculator', label: 'Calculator', icon: CalculatorIcon, path: '/calculator' },
];

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  // const { lastViewedSeries, setLastViewedSeries } = useAppStore();
  const [activeTab, setActiveTab] = useState('live');

  useEffect(() => {
    const currentTab = tabs.find(tab => location.pathname.startsWith(tab.path));
    if (currentTab) {
      setActiveTab(currentTab.id);
    }
  }, [location.pathname]);

  const handleTabClick = (tab: typeof tabs[0]) => {
    setActiveTab(tab.id);
    navigate(tab.path);
  };

  return (
    <ErrorBoundary>
      <div className="flex flex-col h-screen bg-gray-50 safe-area-top safe-area-bottom">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Cricket Live</h1>
            </div>
            <div className="live-indicator">
              LIVE
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/live" replace />} />
            <Route path="/live" element={<LiveScores />} />
            <Route path="/upcoming" element={<Upcoming />} />
            <Route path="/series" element={<Series />} />
            <Route path="/series/:seriesId" element={<Series />} />
            <Route path="/odds" element={<Odds />} />
            <Route path="/calculator" element={<Calculator />} />
            <Route path="*" element={<Navigate to="/live" replace />} />
          </Routes>
        </main>

        {/* Bottom Navigation */}
        <nav className="bg-white border-t border-gray-200 px-2 py-2">
          <div className="flex justify-around">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab)}
                  className={cn(
                    'flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors duration-200 tap-target',
                    isActive
                      ? 'bg-primary-100 text-primary-600'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <Icon className={cn('w-5 h-5 mb-1', isActive && 'text-primary-600')} />
                  <span className={cn('text-xs font-medium', isActive && 'text-primary-600')}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </ErrorBoundary>
  );
}

export default App;