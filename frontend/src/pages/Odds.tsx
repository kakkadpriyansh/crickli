import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, DollarSign, AlertTriangle, RefreshCw } from 'lucide-react';
import { useOdds } from '../hooks/useCricketData';
import { OddsCardSkeleton } from '../components/LoadingSkeleton';
import { formatMatchDate, formatMatchTime, getTeamShortName, cn } from '../lib/utils';

const Odds: React.FC = () => {
  const [filters, setFilters] = useState({
    date_start: '',
    date_end: '',
    bm: '',
    market: ''
  });
  const { data, isLoading, error, refetch } = useOdds(filters);
  const [selectedOddsType, setSelectedOddsType] = useState('match_winner');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [previousOdds, setPreviousOdds] = useState<any>({});
  const [oddsChanges, setOddsChanges] = useState<any>({});
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      refetch();
    }, 30000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [refetch]);

  // Track odds changes for highlighting
  useEffect(() => {
    if (data && previousOdds) {
      const newChanges: any = {};
      const categories = data?.data?.scores?.category || [];
      const matches = categories.flatMap((category: any) => {
        const categoryMatches = category.matches?.match;
        if (categoryMatches) {
          const matchArray = Array.isArray(categoryMatches) ? categoryMatches : [categoryMatches];
          return matchArray;
        }
        return [];
      });

      matches.forEach((match: any) => {
        const matchId = match.id;
        const currentOdds = match.odds;
        const prevOdds = previousOdds[matchId];

        if (prevOdds && currentOdds) {
          Object.keys(currentOdds).forEach(oddsType => {
            if (prevOdds[oddsType] && currentOdds[oddsType]) {
              Object.keys(currentOdds[oddsType]).forEach(key => {
                const current = parseFloat(currentOdds[oddsType][key]);
                const previous = parseFloat(prevOdds[oddsType][key]);
                if (!isNaN(current) && !isNaN(previous) && current !== previous) {
                  newChanges[`${matchId}_${oddsType}_${key}`] = current > previous ? 'up' : 'down';
                }
              });
            }
          });
        }
      });

      setOddsChanges(newChanges);
      
      // Clear changes after 5 seconds
      setTimeout(() => {
        setOddsChanges({});
      }, 5000);
    }

    // Store current odds for next comparison
    if (data) {
      const categories = data?.data?.scores?.category || [];
      const matches = categories.flatMap((category: any) => {
        const categoryMatches = category.matches?.match;
        if (categoryMatches) {
          const matchArray = Array.isArray(categoryMatches) ? categoryMatches : [categoryMatches];
          return matchArray;
        }
        return [];
      });

      const oddsData: any = {};
      matches.forEach((match: any) => {
        if (match.id && match.odds) {
          oddsData[match.id] = match.odds;
        }
      });
      setPreviousOdds(oddsData);
    }
  }, [data]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Cricket Odds</h1>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <OddsCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Odds</h2>
          <p className="text-gray-600 mb-4">Failed to fetch cricket odds data</p>
          <button
            onClick={handleRefresh}
            className="btn btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Extract data from API response
  const categories = data?.data?.scores?.category || [];

  const matches = categories.flatMap((category: any) => {
    const categoryMatches = category.matches?.match;
    if (categoryMatches) {
      const matchArray = Array.isArray(categoryMatches) ? categoryMatches : [categoryMatches];
      return matchArray.map((match: any) => {
        // Transform odds data from Goalserve format
        const transformedOdds: any = {};
        
        if (match.odds?.type) {
          const oddsTypes = Array.isArray(match.odds.type) ? match.odds.type : [match.odds.type];
          
          oddsTypes.forEach((oddsType: any) => {
            const typeName = oddsType.value?.toLowerCase().replace(/\s+/g, '_') || 'unknown';
            
            if (oddsType.bookmaker) {
              const bookmakers = Array.isArray(oddsType.bookmaker) ? oddsType.bookmaker : [oddsType.bookmaker];
              
              // Find bet365 bookmaker or use first available
              const preferredBookmaker = bookmakers.find((bm: any) => bm.name?.toLowerCase() === 'bet365') || bookmakers[0];
              
              if (preferredBookmaker?.odd) {
                const odds = Array.isArray(preferredBookmaker.odd) ? preferredBookmaker.odd : [preferredBookmaker.odd];
                
                if (typeName.includes('3way') || typeName.includes('result') || typeName.includes('home/away')) {
                   // Match winner odds
                   transformedOdds.match_winner = {};
                   odds.forEach((odd: any) => {
                     if (odd.name?.toLowerCase() === 'home') {
                       transformedOdds.match_winner.team1 = parseFloat(odd.value) || 0;
                     } else if (odd.name?.toLowerCase() === 'away') {
                       transformedOdds.match_winner.team2 = parseFloat(odd.value) || 0;
                     }
                   });
                } else if (typeName.includes('toss')) {
                  // Toss winner odds
                  transformedOdds.toss_winner = {};
                  odds.forEach((odd: any) => {
                    if (odd.name?.toLowerCase().includes('team') || odd.name?.toLowerCase() === 'home') {
                      transformedOdds.toss_winner.team1 = parseFloat(odd.value) || 0;
                    } else if (odd.name?.toLowerCase() === 'away') {
                      transformedOdds.toss_winner.team2 = parseFloat(odd.value) || 0;
                    }
                  });
                } else if (typeName.includes('total') || typeName.includes('runs') || typeName.includes('1st_over')) {
                   // Total runs odds
                   transformedOdds.total_runs = {};
                   odds.forEach((odd: any) => {
                     if (odd.name?.toLowerCase().includes('over')) {
                       transformedOdds.total_runs.over = parseFloat(odd.value) || 0;
                       transformedOdds.total_runs.line = '6.5'; // Default line for 1st over
                     } else if (odd.name?.toLowerCase().includes('under')) {
                       transformedOdds.total_runs.under = parseFloat(odd.value) || 0;
                       transformedOdds.total_runs.line = '6.5'; // Default line for 1st over
                     }
                   });
                 }
              }
            }
          });
        }
        
        const result = {
           ...match,
           odds: transformedOdds,
           bookmaker: String(match.odds?.type?.[0]?.bookmaker?.[0]?.name || 'bet365'),
           categoryName: String(category.name || 'Unknown')
         };
         
         
         
         return result;
      });
    }
    return [];
  });

  // Remove duplicate matches based on match ID
  const uniqueMatches = matches.filter((match: any, index: number, self: any[]) => 
    index === self.findIndex((m: any) => m.id === match.id)
  );
  
  // Show all unique matches without filtering
  const filteredMatches = uniqueMatches;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cricket Odds</h1>
          <p className="text-gray-600">Live betting odds from top bookmakers</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className={cn(
            'btn flex items-center space-x-2 transition-all duration-200',
            isRefreshing
              ? 'bg-gray-100 text-gray-400'
              : 'bg-primary-100 text-primary-600 hover:bg-primary-200'
          )}
        >
          <RefreshCw className={cn('w-5 h-5', isRefreshing && 'animate-spin')} />
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>



      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Matches</p>
              <p className="text-2xl font-bold text-gray-900">{filteredMatches.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Live Odds</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredMatches.filter((match: any) => match.odds && Object.keys(match.odds).length > 0).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <RefreshCw className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Auto Refresh</p>
              <p className="text-2xl font-bold text-gray-900">30s</p>
            </div>
          </div>
        </div>
      </div>

      {/* Odds Cards */}
      {filteredMatches.length === 0 ? (
        <div className="text-center py-12">
          <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Matches Found</h3>
          <p className="text-gray-600">Try adjusting your filters to see more matches.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredMatches.map((match: any, index: number) => (
            <OddsCard
              key={`${match.categoryName}-${match.id || index}`}
              match={match}
              selectedOddsType={selectedOddsType}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Odds Card Component
interface OddsCardProps {
  match: any;
  selectedOddsType: string;
}

const OddsCard: React.FC<OddsCardProps> = ({ match, selectedOddsType }) => {
  const team1 = match.localteam || {};
  const team2 = match.visitorteam || {};
  const odds = match.odds || {};
  const selectedOdds = odds[selectedOddsType] || {};

  const getOddsDisplay = (oddsValue: number | string) => {
    if (!oddsValue || oddsValue === 'N/A' || oddsValue === '' || oddsValue === '0') {
      return 'Odds not available yet';
    }
    const numOdds = typeof oddsValue === 'string' ? parseFloat(oddsValue) : oddsValue;
    if (isNaN(numOdds) || numOdds === 0) {
      return 'Odds not available yet';
    }
    return numOdds.toFixed(2);
  };

  const getOddsColor = (oddsValue: number | string) => {
    if (!oddsValue || oddsValue === 'N/A' || oddsValue === '' || oddsValue === '0') {
      return 'text-gray-400';
    }
    const numOdds = typeof oddsValue === 'string' ? parseFloat(oddsValue) : oddsValue;
    if (isNaN(numOdds) || numOdds === 0) {
      return 'text-gray-400';
    }
    if (numOdds < 2) return 'text-green-600';
    if (numOdds < 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="card hover:shadow-md transition-all duration-200">
      {/* Match Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">
            {match.categoryName || 'Cricket Match'}
          </span>
          {match.type && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
              {match.type}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-1 text-green-600">
          <DollarSign className="w-4 h-4" />
          <span className="text-sm font-medium">Live Odds</span>
        </div>
      </div>

      {/* Match Info */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-center">
          <div className="font-medium text-gray-900">{team1.name || 'Team 1'}</div>
          <div className="text-xs text-gray-500 mt-1">
            {getTeamShortName(team1.name || 'T1')}
          </div>
        </div>
        
        <div className="text-center px-4">
          <div className="text-xs text-gray-500 mb-1">
            {formatMatchDate(match.date || match.time)}
          </div>
          <div className="text-xs bg-gray-100 px-2 py-1 rounded">
            {formatMatchTime(match.date || match.time)}
          </div>
        </div>
        
        <div className="text-center">
          <div className="font-medium text-gray-900">{team2.name || 'Team 2'}</div>
          <div className="text-xs text-gray-500 mt-1">
            {getTeamShortName(team2.name || 'T2')}
          </div>
        </div>
      </div>

      {/* Odds Display */}
      <div className="border-t border-gray-100 pt-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-700">
            {selectedOddsType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Odds
          </h4>
          {match.lastUpdated && (
            <span className="text-xs text-gray-500">
              Updated: {new Date(match.lastUpdated).toLocaleTimeString()}
            </span>
          )}
        </div>

        {/* Check if odds are available */}
        {!odds || Object.keys(odds).length === 0 || !selectedOdds || Object.keys(selectedOdds).length === 0 ? (
          <div className="text-center py-6 bg-gray-50 rounded-lg">
            <AlertTriangle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500 mb-1">No odds available</p>
            <p className="text-xs text-gray-400">
              Bookmakers update odds only for ongoing or upcoming matches
            </p>
          </div>
        ) : (
          selectedOddsType === 'match_winner' ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-700 mb-1">
                  {getTeamShortName(team1.name || 'Team 1')}
                </div>
                <div className={cn('text-lg font-bold', getOddsColor(selectedOdds.team1))}>
                  {getOddsDisplay(selectedOdds.team1)}
                </div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-700 mb-1">
                  {getTeamShortName(team2.name || 'Team 2')}
                </div>
                <div className={cn('text-lg font-bold', getOddsColor(selectedOdds.team2))}>
                  {getOddsDisplay(selectedOdds.team2)}
                </div>
              </div>
            </div>
          ) : selectedOddsType === 'toss_winner' ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-700 mb-1">
                  {getTeamShortName(team1.name || 'Team 1')}
                </div>
                <div className={cn('text-lg font-bold', getOddsColor(selectedOdds.team1))}>
                  {getOddsDisplay(selectedOdds.team1)}
                </div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-700 mb-1">
                  {getTeamShortName(team2.name || 'Team 2')}
                </div>
                <div className={cn('text-lg font-bold', getOddsColor(selectedOdds.team2))}>
                  {getOddsDisplay(selectedOdds.team2)}
                </div>
              </div>
            </div>
          ) : selectedOddsType === 'total_runs' ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-700 mb-1">Over</div>
                <div className="text-xs text-gray-500 mb-1">
                  {selectedOdds.line || 'N/A'} runs
                </div>
                <div className={cn('text-lg font-bold', getOddsColor(selectedOdds.over))}>
                  {getOddsDisplay(selectedOdds.over)}
                </div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-700 mb-1">Under</div>
                <div className="text-xs text-gray-500 mb-1">
                  {selectedOdds.line || 'N/A'} runs
                </div>
                <div className={cn('text-lg font-bold', getOddsColor(selectedOdds.under))}>
                  {getOddsDisplay(selectedOdds.under)}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="text-gray-500 text-sm">
                {selectedOdds && Object.keys(selectedOdds).length > 0 ? (
                  <div className="space-y-2">
                    {Object.entries(selectedOdds).map(([key, value]: [string, any]) => (
                      <div key={key} className="flex justify-between items-center">
                        <span className="capitalize">{key.replace('_', ' ')}</span>
                        <span className={cn('font-bold', getOddsColor(value))}>
                          {getOddsDisplay(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  'Odds not available for this market'
                )}
              </div>
            </div>
          )
        )}
      </div>

      {/* Additional Info */}
      {match.venue && (
        <div className="mt-4 pt-3 border-t border-gray-100 text-sm text-gray-600">
          <div className="flex items-center justify-between">
            <span>Venue: {match.venue}</span>
            {match.bookmaker && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                {match.bookmaker}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Odds;