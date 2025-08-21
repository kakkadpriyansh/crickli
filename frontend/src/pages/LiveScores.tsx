import React from 'react';
import { RefreshCw, Clock, Users } from 'lucide-react';
import { useLiveScores, useInvalidateQueries } from '../hooks/useCricketData';
import { MatchCardSkeleton } from '../components/LoadingSkeleton';
import { getMatchStatus, formatMatchTime, getTeamShortName, formatScore } from '../lib/utils';
import { cn } from '../lib/utils';

const LiveScores: React.FC = () => {
  const { data, isLoading, error, isRefetching } = useLiveScores();
  const { invalidateLiveScores } = useInvalidateQueries();

  const handleRefresh = () => {
    invalidateLiveScores();
  };

  if (isLoading && !data) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Live Scores</h2>
          <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
        </div>
        {Array.from({ length: 3 }).map((_, index) => (
          <MatchCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Live Scores</h2>
          <button
            onClick={handleRefresh}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors tap-target"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
        <div className="card text-center py-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <RefreshCw className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load live scores</h3>
          <p className="text-gray-600 mb-4">Please check your connection and try again.</p>
          <button
            onClick={handleRefresh}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const categories = data?.data?.scores?.category || [];
  const allMatches: any[] = [];
  
  // Extract matches from all categories
  categories.forEach((category: any) => {
    if (category.match) {
      const matches = Array.isArray(category.match) ? category.match : [category.match];
      matches.forEach((match: any) => {
        allMatches.push({
          ...match,
          categoryName: category.name,
          categoryId: category.id
        });
      });
    }
  });
  
  const liveMatches = allMatches.filter((match: any) => {
    const status = match.status || '';
    return status.toLowerCase().includes('live') || status.toLowerCase().includes('in progress');
  });
  
  const recentMatches = allMatches.filter((match: any) => {
    const status = match.status || '';
    return !status.toLowerCase().includes('live') && !status.toLowerCase().includes('in progress');
  });

  return (
    <div className="p-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Live Scores</h2>
        <button
          onClick={handleRefresh}
          disabled={isRefetching}
          className={cn(
            'p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors tap-target',
            isRefetching && 'animate-spin'
          )}
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Live Matches */}
      {liveMatches.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <div className="live-indicator">LIVE</div>
            <span className="text-sm text-gray-600">{liveMatches.length} match{liveMatches.length !== 1 ? 'es' : ''}</span>
          </div>
          <div className="space-y-4">
            {liveMatches.map((match: any, index: number) => (
              <MatchCard key={`live-${index}`} match={match} isLive={true} />
            ))}
          </div>
        </div>
      )}

      {/* Recent Matches */}
      {recentMatches.length > 0 && (
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Recent Matches</span>
          </div>
          <div className="space-y-4">
            {recentMatches.slice(0, 10).map((match: any, index: number) => (
              <MatchCard key={`recent-${index}`} match={match} isLive={false} />
            ))}
          </div>
        </div>
      )}

      {/* No matches */}
      {allMatches.length === 0 && (
        <div className="card text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No matches available</h3>
          <p className="text-gray-600">Check back later for live cricket scores.</p>
        </div>
      )}
    </div>
  );
};

// Match Card Component
interface MatchCardProps {
  match: any;
  isLive: boolean;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, isLive }) => {
  const status = { label: match.status || 'Unknown', isLive: isLive, color: isLive ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800' };
  const team1 = match.localteam || {};
  const team2 = match.visitorteam || {};
  
  return (
    <div className={cn(
      'card transition-all duration-200 hover:shadow-md',
      isLive && 'border-l-4 border-l-red-500 bg-red-50/30'
    )}>
      {/* Match Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">
            {match.categoryName || 'Cricket Match'}
          </span>
          {match.type && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
              {match.type}
            </span>
          )}
        </div>
        <span className={cn(
          'px-2 py-1 rounded-full text-xs font-medium',
          status.color
        )}>
          {status.label}
        </span>
      </div>

      {/* Teams */}
      <div className="space-y-3">
        {/* Team 1 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-primary-700">
                {getTeamShortName(team1.name || 'T1')}
              </span>
            </div>
            <div>
              <div className="font-medium text-gray-900">{team1.name || 'Team 1'}</div>
              {team1.stat && (
                <div className="text-xs text-gray-500">{team1.stat}</div>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold text-lg text-gray-900">
              {team1.totalscore || '-'}
            </div>
          </div>
        </div>

        {/* Team 2 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-cricket-blue/10 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-cricket-blue">
                {getTeamShortName(team2.name || 'T2')}
              </span>
            </div>
            <div>
              <div className="font-medium text-gray-900">{team2.name || 'Team 2'}</div>
              {team2.stat && (
                <div className="text-xs text-gray-500">{team2.stat}</div>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold text-lg text-gray-900">
              {team2.totalscore || '-'}
            </div>
          </div>
        </div>
      </div>

      {/* Match Info */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{match.venue || 'Venue TBA'}</span>
          {match.time && (
            <span>{match.time}</span>
          )}
        </div>
        {match.comment?.post && (
          <div className="mt-2 text-sm font-medium text-gray-900">
            {match.comment.post}
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveScores;