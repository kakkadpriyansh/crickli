import React, { useState } from 'react';
import { Trophy, Calendar, Users, BarChart3, ChevronRight } from 'lucide-react';
import { useTours, useSeriesFixtures, useSeriesSquads, useSeriesStandings } from '../hooks/useCricketData';
import { SeriesCardSkeleton, Skeleton } from '../components/LoadingSkeleton';
import { formatMatchDate, formatMatchTime, getTeamShortName, cn } from '../lib/utils';
import { useAppStore } from '../store/appStore';

const Series: React.FC = () => {
  const { data: toursData, isLoading: toursLoading, error: toursError } = useTours();
  const [selectedSeries, setSelectedSeries] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'fixtures' | 'squads' | 'standings'>('fixtures');
  const { lastViewedSeries, setLastViewedSeries } = useAppStore();

  // Fetch series details when a series is selected
  const { data: fixturesData, isLoading: fixturesLoading } = useSeriesFixtures(
    selectedSeries || ''
  );
  
  const { data: squadsData, isLoading: squadsLoading } = useSeriesSquads(
    selectedSeries || ''
  );
  
  const { data: standingsData, isLoading: standingsLoading } = useSeriesStandings(
    selectedSeries || ''
  );

  if (toursLoading) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Cricket Series</h2>
        </div>
        {Array.from({ length: 4 }).map((_, index) => (
          <SeriesCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (toursError) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Cricket Series</h2>
        <div className="card text-center py-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load series</h3>
          <p className="text-gray-600">Please check your connection and try again.</p>
        </div>
      </div>
    );
  }

  // Handle the tours data structure from API
  const toursResponse = toursData?.data?.fixtures?.category || [];
  const activeTours = Array.isArray(toursResponse) ? toursResponse.slice(0, 20) : [];

  const handleSeriesSelect = (seriesId: string) => {
    setSelectedSeries(seriesId);
    setLastViewedSeries(seriesId);
    setActiveTab('fixtures');
  };

  const handleBackToSeries = () => {
    setSelectedSeries(null);
  };

  if (selectedSeries) {
    return (
      <SeriesDetails
        seriesId={selectedSeries}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onBack={handleBackToSeries}
        fixturesData={fixturesData}
        squadsData={squadsData}
        standingsData={standingsData}
        fixturesLoading={fixturesLoading}
        squadsLoading={squadsLoading}
        standingsLoading={standingsLoading}
      />
    );
  }

  return (
    <div className="p-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Cricket Series</h2>
        <div className="flex items-center space-x-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <span className="text-sm text-gray-600">
            {activeTours.length} Active Series
          </span>
        </div>
      </div>

      {/* Series List */}
      {activeTours.length > 0 ? (
        <div className="space-y-4">
          {activeTours.map((tour: any, index: number) => (
            <SeriesCard
              key={tour.id || index}
              series={tour}
              onClick={() => handleSeriesSelect(tour.id || `series-${index}`)}
              isLastViewed={lastViewedSeries === (tour.id || `series-${index}`)}
            />
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No active series</h3>
          <p className="text-gray-600">
            Check back later for upcoming cricket series.
          </p>
        </div>
      )}
    </div>
  );
};

// Series Card Component
interface SeriesCardProps {
  series: any;
  onClick: () => void;
  isLastViewed?: boolean;
}

const SeriesCard: React.FC<SeriesCardProps> = ({ series, onClick, isLastViewed }) => {
  return (
    <div
      className={cn(
        'card hover:shadow-md transition-all duration-200 cursor-pointer tap-target',
        isLastViewed && 'ring-2 ring-primary-500 ring-opacity-50'
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="font-semibold text-gray-900">{series.name || 'Cricket Series'}</h3>
            {isLastViewed && (
              <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">
                Last Viewed
              </span>
            )}
          </div>
          
          <div className="space-y-1">
            {series.season && (
              <div className="flex items-center space-x-2">
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  {series.season}
                </span>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                  Active
                </span>
              </div>
            )}
            
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <Trophy className="w-4 h-4" />
              <span>International Tour</span>
            </div>
            
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>ID: {series.id}</span>
            </div>
            
            {(series.squads_file || series.table_file) && (
              <div className="flex items-center space-x-2 mt-2">
                {series.squads_file && (
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                    Squads Available
                  </span>
                )}
                {series.table_file && (
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                    Standings Available
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </div>
    </div>
  );
};

// Series Details Component
interface SeriesDetailsProps {
  seriesId: string;
  activeTab: 'fixtures' | 'squads' | 'standings';
  setActiveTab: (tab: 'fixtures' | 'squads' | 'standings') => void;
  onBack: () => void;
  fixturesData: any;
  squadsData: any;
  standingsData: any;
  fixturesLoading: boolean;
  squadsLoading: boolean;
  standingsLoading: boolean;
}

const SeriesDetails: React.FC<SeriesDetailsProps> = ({
  seriesId,
  activeTab,
  setActiveTab,
  onBack,
  fixturesData,
  squadsData,
  standingsData,
  fixturesLoading,
  squadsLoading,
  standingsLoading
}) => {
  const hasAnyData = fixturesData?.success || squadsData?.success || standingsData?.success;
  
  if (!fixturesLoading && !squadsLoading && !standingsLoading && !hasAnyData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
            <span>Back to Series</span>
          </button>
        </div>
        
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Series Details Unavailable</h3>
          <p className="text-gray-600">Detailed information for this series is currently not available.</p>
        </div>
      </div>
    );
  }
  const tabs = [
    { id: 'fixtures', label: 'Fixtures', icon: Calendar },
    { id: 'squads', label: 'Squads', icon: Users },
    { id: 'standings', label: 'Standings', icon: BarChart3 }
  ] as const;

  return (
    <div className="p-4 pb-20">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors tap-target"
        >
          <ChevronRight className="w-5 h-5 text-gray-600 rotate-180" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Series Details</h2>
          <p className="text-sm text-gray-600">Series ID: {seriesId}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-all tap-target',
                activeTab === tab.id
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {activeTab === 'fixtures' && (
          <FixturesTab data={fixturesData} loading={fixturesLoading} />
        )}
        {activeTab === 'squads' && (
          <SquadsTab data={squadsData} loading={squadsLoading} />
        )}
        {activeTab === 'standings' && (
          <StandingsTab data={standingsData} loading={standingsLoading} />
        )}
      </div>
    </div>
  );
};

// Fixtures Tab
const FixturesTab: React.FC<{ data: any; loading: boolean }> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-24" />
        ))}
      </div>
    );
  }

  const fixtures = Array.isArray(data?.data?.fixtures?.category?.match) ? data?.data?.fixtures?.category?.match : [];

  if (fixtures.length === 0) {
    return (
      <div className="card text-center py-8">
        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No fixtures available</h3>
        <p className="text-gray-600">Fixtures will be updated when available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {fixtures.map((fixture: any, index: number) => (
        <div key={index} className="card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">
              {fixture.type || 'Match'}
            </span>
            <span className="text-sm text-gray-600">
              {formatMatchDate(fixture.date)}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className="font-medium text-gray-900">
                {getTeamShortName(fixture.localteam?.name || 'Team 1')}
              </div>
            </div>
            
            <div className="text-center px-4">
              <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                {fixture.time || 'TBD'}
              </span>
            </div>
            
            <div className="text-center">
              <div className="font-medium text-gray-900">
                {getTeamShortName(fixture.visitorteam?.name || 'Team 2')}
              </div>
            </div>
          </div>
          
          {fixture.venue_name && (
            <div className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-600">
              {fixture.venue_name}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Squads Tab
const SquadsTab: React.FC<{ data: any; loading: boolean }> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, index) => (
          <Skeleton key={index} className="h-32" />
        ))}
      </div>
    );
  }

  const squads = Array.isArray(data?.data?.squads?.category?.team) ? data?.data?.squads?.category?.team : [];

  if (squads.length === 0) {
    return (
      <div className="card text-center py-8">
        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No squads available</h3>
        <p className="text-gray-600">Squad information will be updated when available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {squads.map((squad: any, index: number) => (
        <div key={index} className="card">
          <h3 className="font-semibold text-gray-900 mb-3">{squad.name}</h3>
          <div className="grid grid-cols-1 gap-2">
            {Array.isArray(squad.player) ? squad.player.map((player: any, playerIndex: number) => (
              <div key={playerIndex} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div>
                  <div className="font-medium text-gray-900">{player.name}</div>
                  {player.role && (
                    <div className="text-sm text-gray-600">{player.role}</div>
                  )}
                </div>
                {player.captain && (
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                    Captain
                  </span>
                )}
              </div>
            )) : (
              <div className="text-gray-600 text-center py-4">
                Player list not available
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// Standings Tab
const StandingsTab: React.FC<{ data: any; loading: boolean }> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48" />
      </div>
    );
  }

  const standings = Array.isArray(data?.data?.standings?.team) ? data?.data?.standings?.team : [];

  if (standings.length === 0) {
    return (
      <div className="card text-center py-8">
        <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No standings available</h3>
        <p className="text-gray-600">Standings will be updated as matches progress.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="font-semibold text-gray-900 mb-4">Points Table</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 font-medium text-gray-700">Team</th>
              <th className="text-center py-2 font-medium text-gray-700">P</th>
              <th className="text-center py-2 font-medium text-gray-700">W</th>
              <th className="text-center py-2 font-medium text-gray-700">L</th>
              <th className="text-center py-2 font-medium text-gray-700">Pts</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((team: any, index: number) => (
              <tr key={index} className="border-b border-gray-100 last:border-b-0">
                <td className="py-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {index + 1}
                    </span>
                    <span className="font-medium text-gray-900">{team.name}</span>
                  </div>
                </td>
                <td className="text-center py-3 text-gray-700">{team.games || 0}</td>
                <td className="text-center py-3 text-green-600 font-medium">{team.won || 0}</td>
                <td className="text-center py-3 text-red-600 font-medium">{team.lost || 0}</td>
                <td className="text-center py-3 font-bold text-gray-900">{team.points || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Series;