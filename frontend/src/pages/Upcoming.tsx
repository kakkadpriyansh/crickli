import React, { useState } from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { useSchedule } from '../hooks/useCricketData';
import { MatchCardSkeleton } from '../components/LoadingSkeleton';
import { formatMatchDate, formatMatchTime, getTeamShortName, getMatchStatus } from '../lib/utils';
import { cn } from '../lib/utils';

const Upcoming: React.FC = () => {
  const { data, isLoading, error } = useSchedule();
  const [selectedFormat, setSelectedFormat] = useState<string>('all');
  const [selectedDays, setSelectedDays] = useState<number>(365); // Next 365 days

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Upcoming Matches</h2>
        </div>
        {Array.from({ length: 5 }).map((_, index) => (
          <MatchCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Upcoming Matches</h2>
        <div className="card text-center py-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load schedule</h3>
          <p className="text-gray-600">Please check your connection and try again.</p>
        </div>
      </div>
    );
  }

  const categories = data?.data?.fixtures?.category || [];
  
  // Extract all matches from all categories
  const allMatches = categories.flatMap((category: any) => {
    const matches = Array.isArray(category.match) ? category.match : [category.match].filter(Boolean);
    return matches.map((match: any) => ({
      ...match,
      competition: category.name,
      seriesId: category.id
    }));
  });
  
  const upcomingMatches = allMatches.filter((match: any) => {
    // Parse date in DD.MM.YYYY format
    const [day, month, year] = match.date.split('.');
    const [hours, minutes] = (match.time || '00:00').split(':');
    const matchDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes));
    
    const now = new Date();
    const daysFromNow = new Date(now.getTime() + selectedDays * 24 * 60 * 60 * 1000);
    
    const isInTimeRange = matchDate >= now && matchDate <= daysFromNow;
    const isFormatMatch = selectedFormat === 'all' || match.type?.toLowerCase() === selectedFormat.toLowerCase();
    
    return isInTimeRange && isFormatMatch;
  });

  // Group matches by date
  const groupedMatches = upcomingMatches.reduce((groups: any, match: any) => {
    const date = formatMatchDate(match.date);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(match);
    return groups;
  }, {});
  


  const formats = ['all', 'Test', 'ODI', 'T20', 'T10'];
  const dayOptions = [7, 30, 90, 180, 365];

  return (
    <div className="p-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Upcoming Matches</h2>
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-gray-500" />
          <span className="text-sm text-gray-600">
            Next {selectedDays} day{selectedDays !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
      


      {/* Filters */}
      <div className="mb-6 space-y-4">
        {/* Format Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Format
          </label>
          <div className="flex flex-wrap gap-2">
            {formats.map((format) => (
              <button
                key={format}
                onClick={() => setSelectedFormat(format)}
                className={cn(
                  'px-3 py-1 rounded-full text-sm font-medium transition-colors tap-target',
                  selectedFormat === format
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                {format === 'all' ? 'All Formats' : format}
              </button>
            ))}
          </div>
        </div>

        {/* Days Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Time Period
          </label>
          <div className="flex flex-wrap gap-2">
            {dayOptions.map((days) => (
              <button
                key={days}
                onClick={() => setSelectedDays(days)}
                className={cn(
                  'px-3 py-1 rounded-full text-sm font-medium transition-colors tap-target',
                  selectedDays === days
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                {days === 1 ? 'Today' : `${days} days`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Matches by Date */}
      {Object.keys(groupedMatches).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedMatches).map(([date, dateMatches]: [string, any]) => (
            <div key={date}>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-2 h-2 bg-primary-600 rounded-full" />
                <h3 className="text-lg font-semibold text-gray-900">{date}</h3>
                <span className="text-sm text-gray-500">({dateMatches.length} match{dateMatches.length !== 1 ? 'es' : ''})</span>
              </div>
              <div className="space-y-3 ml-4">
                {dateMatches.map((match: any, index: number) => (
                  <UpcomingMatchCard key={`${date}-${index}`} match={match} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No upcoming matches</h3>
          <p className="text-gray-600 mb-4">
            No matches found for the selected criteria.
          </p>
          <button
            onClick={() => {
              setSelectedFormat('all');
              setSelectedDays(30);
            }}
            className="btn-secondary"
          >
            Show All Matches
          </button>
        </div>
      )}
    </div>
  );
};

// Upcoming Match Card Component
interface UpcomingMatchCardProps {
  match: any;
}

const UpcomingMatchCard: React.FC<UpcomingMatchCardProps> = ({ match }) => {
  const localTeam = match.localteam || {};
  const visitorTeam = match.visitorteam || {};
  const matchTime = formatMatchTime(match.time || '00:00');
  const matchDate = formatMatchDate(match.date || new Date().toISOString());
  
  return (
    <div className="card hover:shadow-md transition-all duration-200">
      {/* Match Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">
            {match.competition || 'Cricket Match'}
          </span>
          {match.type && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
              {match.type}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-3 text-blue-600">
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">{matchDate}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">{matchTime}</span>
          </div>
        </div>
      </div>

      {/* Teams */}
      <div className="space-y-3">
        {/* Local Team */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-primary-700">
              {getTeamShortName(localTeam.name || 'T1')}
            </span>
          </div>
          <div className="flex-1">
            <div className="font-medium text-gray-900">{localTeam.name || 'Team 1'}</div>
          </div>
        </div>

        {/* VS */}
        <div className="flex items-center justify-center">
          <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">
            VS
          </span>
        </div>

        {/* Visitor Team */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-cricket-blue/10 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-cricket-blue">
              {getTeamShortName(visitorTeam.name || 'T2')}
            </span>
          </div>
          <div className="flex-1">
            <div className="font-medium text-gray-900">{visitorTeam.name || 'Team 2'}</div>
          </div>
        </div>
      </div>

      {/* Match Info */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <MapPin className="w-4 h-4" />
            <span>{match.venue?.name || 'Venue TBA'}</span>
          </div>
          {match.toss && (
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
              Toss: {match.toss}
            </span>
          )}
        </div>
        {match.weather && (
          <div className="mt-2 text-xs text-gray-500">
            Weather: {match.weather}
          </div>
        )}
      </div>
    </div>
  );
};

export default Upcoming;