import React, { useState } from 'react';
import { User, Search, TrendingUp, Award, Calendar, MapPin, X } from 'lucide-react';
import { usePlayerProfile } from '../hooks/useCricketData';
import { PlayerCardSkeleton } from '../components/LoadingSkeleton';
import { cn } from '../lib/utils';
import { useAppStore } from '../store/appStore';

const PlayerProfile: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { selectedPlayerId, setSelectedPlayerId } = useAppStore();
  
  const { data: playerData, isLoading: playerLoading, error: playerError } = usePlayerProfile(
    selectedPlayerId || ''
  );

  // Mock search function - in real app, this would call an API
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Mock search results
      const mockResults = [
        { id: 'virat-kohli', name: 'Virat Kohli', team: 'India', role: 'Batsman' },
        { id: 'rohit-sharma', name: 'Rohit Sharma', team: 'India', role: 'Batsman' },
        { id: 'ms-dhoni', name: 'MS Dhoni', team: 'India', role: 'Wicket Keeper' },
        { id: 'jasprit-bumrah', name: 'Jasprit Bumrah', team: 'India', role: 'Bowler' },
        { id: 'babar-azam', name: 'Babar Azam', team: 'Pakistan', role: 'Batsman' },
        { id: 'joe-root', name: 'Joe Root', team: 'England', role: 'Batsman' },
        { id: 'steve-smith', name: 'Steve Smith', team: 'Australia', role: 'Batsman' },
        { id: 'kane-williamson', name: 'Kane Williamson', team: 'New Zealand', role: 'Batsman' }
      ].filter(player => 
        player.name.toLowerCase().includes(query.toLowerCase()) ||
        player.team.toLowerCase().includes(query.toLowerCase())
      );
      
      setSearchResults(mockResults);
      setIsSearching(false);
    }, 500);
  };

  const handlePlayerSelect = (playerId: string) => {
    setSelectedPlayerId(playerId);
    setSearchQuery('');
    setSearchResults([]);
  };

  const clearSelection = () => {
    setSelectedPlayerId(null);
  };

  if (selectedPlayerId && playerLoading) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Player Profile</h2>
        </div>
        <PlayerCardSkeleton />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="card">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (selectedPlayerId && playerError) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Player Profile</h2>
          <button
            onClick={clearSelection}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors tap-target"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <div className="card text-center py-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load player</h3>
          <p className="text-gray-600 mb-4">Please check your connection and try again.</p>
          <button onClick={clearSelection} className="btn-secondary">
            Search Another Player
          </button>
        </div>
      </div>
    );
  }

  if (selectedPlayerId && playerData) {
    return (
      <PlayerDetails
        player={playerData.data}
        onBack={clearSelection}
      />
    );
  }

  return (
    <div className="p-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Player Profile</h2>
        <div className="flex items-center space-x-2">
          <User className="w-5 h-5 text-gray-500" />
          <span className="text-sm text-gray-600">Search Players</span>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search for players by name or team..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              handleSearch(e.target.value);
            }}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
            </div>
          )}
        </div>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Results</h3>
          <div className="space-y-3">
            {searchResults.map((player) => (
              <div
                key={player.id}
                onClick={() => handlePlayerSelect(player.id)}
                className="card hover:shadow-md transition-all duration-200 cursor-pointer tap-target"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{player.name}</h4>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>{player.team}</span>
                      <span>•</span>
                      <span>{player.role}</span>
                    </div>
                  </div>
                  <div className="text-gray-400">
                    <Search className="w-5 h-5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Popular Players */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Players</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: 'virat-kohli', name: 'Virat Kohli', team: 'India' },
            { id: 'babar-azam', name: 'Babar Azam', team: 'Pakistan' },
            { id: 'joe-root', name: 'Joe Root', team: 'England' },
            { id: 'steve-smith', name: 'Steve Smith', team: 'Australia' }
          ].map((player) => (
            <div
              key={player.id}
              onClick={() => handlePlayerSelect(player.id)}
              className="card hover:shadow-md transition-all duration-200 cursor-pointer tap-target text-center"
            >
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <User className="w-5 h-5 text-primary-600" />
              </div>
              <h4 className="font-medium text-gray-900 text-sm">{player.name}</h4>
              <p className="text-xs text-gray-600">{player.team}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {!searchQuery && searchResults.length === 0 && (
        <div className="card text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Search for Players</h3>
          <p className="text-gray-600">
            Use the search bar above to find detailed profiles of your favorite cricket players.
          </p>
        </div>
      )}

      {/* No Results */}
      {searchQuery && searchResults.length === 0 && !isSearching && (
        <div className="card text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No players found</h3>
          <p className="text-gray-600">
            Try searching with a different name or team.
          </p>
        </div>
      )}
    </div>
  );
};

// Player Details Component
interface PlayerDetailsProps {
  player: any;
  onBack: () => void;
}

const PlayerDetails: React.FC<PlayerDetailsProps> = ({ player, onBack }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'stats' | 'career'>('overview');

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'stats', label: 'Statistics' },
    { id: 'career', label: 'Career' }
  ] as const;

  return (
    <div className="p-4 pb-20">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors tap-target"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Player Profile</h2>
          <p className="text-sm text-gray-600">Detailed information</p>
        </div>
      </div>

      {/* Player Header */}
      <div className="card mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-primary-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900">
              {player?.name || 'Player Name'}
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
              <span>{player?.team || 'Team'}</span>
              <span>•</span>
              <span>{player?.role || 'Role'}</span>
              {player?.age && (
                <>
                  <span>•</span>
                  <span>{player.age} years</span>
                </>
              )}
            </div>
            {player?.battingStyle && player?.bowlingStyle && (
              <div className="flex items-center space-x-2 text-xs text-gray-500 mt-2">
                <span>{player.battingStyle} batsman</span>
                <span>•</span>
                <span>{player.bowlingStyle} bowler</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all tap-target',
              activeTab === tab.id
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {activeTab === 'overview' && (
          <OverviewTab player={player} />
        )}
        {activeTab === 'stats' && (
          <StatsTab player={player} />
        )}
        {activeTab === 'career' && (
          <CareerTab player={player} />
        )}
      </div>
    </div>
  );
};

// Overview Tab
const OverviewTab: React.FC<{ player: any }> = ({ player }) => {
  return (
    <div className="space-y-4">
      {/* Basic Info */}
      <div className="card">
        <h4 className="font-semibold text-gray-900 mb-3">Basic Information</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Full Name:</span>
            <div className="font-medium text-gray-900">{player?.fullName || player?.name || 'N/A'}</div>
          </div>
          <div>
            <span className="text-gray-600">Born:</span>
            <div className="font-medium text-gray-900">
              {player?.birthDate ? new Date(player.birthDate).toLocaleDateString() : 'N/A'}
            </div>
          </div>
          <div>
            <span className="text-gray-600">Birthplace:</span>
            <div className="font-medium text-gray-900">{player?.birthPlace || 'N/A'}</div>
          </div>
          <div>
            <span className="text-gray-600">Height:</span>
            <div className="font-medium text-gray-900">{player?.height || 'N/A'}</div>
          </div>
        </div>
      </div>

      {/* Playing Role */}
      <div className="card">
        <h4 className="font-semibold text-gray-900 mb-3">Playing Style</h4>
        <div className="grid grid-cols-1 gap-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Primary Role:</span>
            <span className="font-medium text-gray-900">{player?.role || 'N/A'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Batting Style:</span>
            <span className="font-medium text-gray-900">{player?.battingStyle || 'N/A'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Bowling Style:</span>
            <span className="font-medium text-gray-900">{player?.bowlingStyle || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Recent Form */}
      <div className="card">
        <h4 className="font-semibold text-gray-900 mb-3">Recent Form</h4>
        <div className="text-center py-4">
          <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600 text-sm">Recent performance data will be displayed here</p>
        </div>
      </div>
    </div>
  );
};

// Stats Tab
const StatsTab: React.FC<{ player: any }> = ({ player }) => {
  const formats = ['Test', 'ODI', 'T20I'];
  
  return (
    <div className="space-y-4">
      {formats.map((format) => (
        <div key={format} className="card">
          <h4 className="font-semibold text-gray-900 mb-3">{format} Statistics</h4>
          
          {/* Batting Stats */}
          <div className="mb-4">
            <h5 className="text-sm font-medium text-gray-700 mb-2">Batting</h5>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Matches:</span>
                <span className="font-medium">{player?.stats?.[format]?.batting?.matches || '0'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Runs:</span>
                <span className="font-medium">{player?.stats?.[format]?.batting?.runs || '0'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Average:</span>
                <span className="font-medium">{player?.stats?.[format]?.batting?.average || '0.00'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Strike Rate:</span>
                <span className="font-medium">{player?.stats?.[format]?.batting?.strikeRate || '0.00'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Highest Score:</span>
                <span className="font-medium">{player?.stats?.[format]?.batting?.highestScore || '0'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Centuries:</span>
                <span className="font-medium">{player?.stats?.[format]?.batting?.centuries || '0'}</span>
              </div>
            </div>
          </div>
          
          {/* Bowling Stats */}
          {player?.role?.toLowerCase().includes('bowler') && (
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-2">Bowling</h5>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Wickets:</span>
                  <span className="font-medium">{player?.stats?.[format]?.bowling?.wickets || '0'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Average:</span>
                  <span className="font-medium">{player?.stats?.[format]?.bowling?.average || '0.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Economy:</span>
                  <span className="font-medium">{player?.stats?.[format]?.bowling?.economy || '0.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Best Figures:</span>
                  <span className="font-medium">{player?.stats?.[format]?.bowling?.bestFigures || '0/0'}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Career Tab
const CareerTab: React.FC<{ player: any }> = ({ player }) => {
  return (
    <div className="space-y-4">
      {/* Career Highlights */}
      <div className="card">
        <h4 className="font-semibold text-gray-900 mb-3">Career Highlights</h4>
        <div className="space-y-3">
          {player?.achievements?.map((achievement: string, index: number) => (
            <div key={index} className="flex items-center space-x-3">
              <Award className="w-5 h-5 text-yellow-500 flex-shrink-0" />
              <span className="text-sm text-gray-700">{achievement}</span>
            </div>
          )) || (
            <div className="text-center py-4">
              <Award className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 text-sm">Career achievements will be displayed here</p>
            </div>
          )}
        </div>
      </div>

      {/* Career Timeline */}
      <div className="card">
        <h4 className="font-semibold text-gray-900 mb-3">Career Timeline</h4>
        <div className="space-y-3">
          {player?.careerTimeline?.map((event: any, index: number) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0" />
              <div>
                <div className="font-medium text-gray-900">{event.title}</div>
                <div className="text-sm text-gray-600">{event.date}</div>
                {event.description && (
                  <div className="text-sm text-gray-700 mt-1">{event.description}</div>
                )}
              </div>
            </div>
          )) || (
            <div className="text-center py-4">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 text-sm">Career timeline will be displayed here</p>
            </div>
          )}
        </div>
      </div>

      {/* Teams Played For */}
      <div className="card">
        <h4 className="font-semibold text-gray-900 mb-3">Teams</h4>
        <div className="space-y-2">
          {player?.teams?.map((team: any, index: number) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
              <div>
                <div className="font-medium text-gray-900">{team.name}</div>
                <div className="text-sm text-gray-600">{team.type}</div>
              </div>
              <div className="text-sm text-gray-600">
                {team.period}
              </div>
            </div>
          )) || (
            <div className="text-center py-4">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 text-sm">Team information will be displayed here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayerProfile;