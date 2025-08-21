import React, { useState } from 'react';
import { useSquads, usePlayerProfile } from '../hooks/useCricketData';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Loader2, Search, User, Trophy, Target, Calendar } from 'lucide-react';

interface Player {
  id: string;
  name: string;
  role?: string;
  odi?: string;
  t20?: string;
  test?: string;
}

interface PlayerStats {
  matches: number;
  runs?: number;
  wickets?: number;
  average?: number;
  strikeRate?: number;
  economyRate?: number;
  bestBowling?: string;
}

interface PlayerProfile {
  id: string;
  name: string;
  country: string;
  role: string;
  battingStyle?: string;
  bowlingStyle?: string;
  dateOfBirth?: string;
  placeOfBirth?: string;
  stats?: {
    odi?: PlayerStats;
    t20?: PlayerStats;
    test?: PlayerStats;
  };
}

const PlayerCard: React.FC<{ player: Player; onViewProfile: (playerId: string) => void }> = ({ 
  player, 
  onViewProfile 
}) => {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" 
          onClick={() => onViewProfile(player.id)}>
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={`/api/placeholder/48/48`} alt={player.name} />
            <AvatarFallback>
              {player.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold text-sm">{player.name}</h3>
            {player.role && (
              <Badge variant="secondary" className="text-xs mt-1">
                {player.role}
              </Badge>
            )}
            <div className="flex space-x-2 mt-2">
              {player.odi && (
                <Badge variant="outline" className="text-xs">
                  ODI: {player.odi}
                </Badge>
              )}
              {player.t20 && (
                <Badge variant="outline" className="text-xs">
                  T20: {player.t20}
                </Badge>
              )}
              {player.test && (
                <Badge variant="outline" className="text-xs">
                  Test: {player.test}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const PlayerProfileModal: React.FC<{ 
  playerId: string; 
  onClose: () => void 
}> = ({ playerId, onClose }) => {
  const { data: profile, isLoading, error } = usePlayerProfile(playerId);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <CardContent className="p-6 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading player profile...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-6 text-center">
            <p className="text-red-500">Failed to load player profile</p>
            <Button onClick={onClose} className="mt-4">Close</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mock profile data structure based on API response
  const mockProfile: PlayerProfile = {
    id: playerId,
    name: profile?.player?.name || 'Unknown Player',
    country: profile?.player?.country || 'Unknown',
    role: profile?.player?.role || 'All-rounder',
    battingStyle: profile?.player?.batting_style || 'Right-hand bat',
    bowlingStyle: profile?.player?.bowling_style || 'Right-arm medium',
    dateOfBirth: profile?.player?.date_of_birth || '1990-01-01',
    placeOfBirth: profile?.player?.place_of_birth || 'Unknown',
    stats: {
      odi: {
        matches: profile?.player?.career?.odi?.matches || 0,
        runs: profile?.player?.career?.odi?.runs || 0,
        wickets: profile?.player?.career?.odi?.wickets || 0,
        average: profile?.player?.career?.odi?.average || 0,
        strikeRate: profile?.player?.career?.odi?.sr || 0,
      },
      t20: {
        matches: profile?.player?.career?.t20?.matches || 0,
        runs: profile?.player?.career?.t20?.runs || 0,
        wickets: profile?.player?.career?.t20?.wickets || 0,
        average: profile?.player?.career?.t20?.average || 0,
        strikeRate: profile?.player?.career?.t20?.sr || 0,
      },
      test: {
        matches: profile?.player?.career?.test?.matches || 0,
        runs: profile?.player?.career?.test?.runs || 0,
        wickets: profile?.player?.career?.test?.wickets || 0,
        average: profile?.player?.career?.test?.average || 0,
        strikeRate: profile?.player?.career?.test?.sr || 0,
      },
    },
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={`/api/placeholder/64/64`} alt={mockProfile.name} />
              <AvatarFallback className="text-lg">
                {mockProfile.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{mockProfile.name}</CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="secondary">{mockProfile.country}</Badge>
                <Badge variant="outline">{mockProfile.role}</Badge>
              </div>
            </div>
          </div>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold mb-2 flex items-center">
                <User className="h-4 w-4 mr-2" />
                Personal Information
              </h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Batting Style:</span> {mockProfile.battingStyle}</p>
                <p><span className="font-medium">Bowling Style:</span> {mockProfile.bowlingStyle}</p>
                <p><span className="font-medium">Date of Birth:</span> {mockProfile.dateOfBirth}</p>
                <p><span className="font-medium">Place of Birth:</span> {mockProfile.placeOfBirth}</p>
              </div>
            </div>
          </div>

          <Tabs defaultValue="odi" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="odi">ODI</TabsTrigger>
              <TabsTrigger value="t20">T20</TabsTrigger>
              <TabsTrigger value="test">Test</TabsTrigger>
            </TabsList>
            
            {['odi', 't20', 'test'].map((format) => {
              const stats = mockProfile.stats?.[format as keyof typeof mockProfile.stats];
              return (
                <TabsContent key={format} value={format} className="mt-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Trophy className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                        <p className="text-2xl font-bold">{stats?.matches || 0}</p>
                        <p className="text-sm text-gray-600">Matches</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Target className="h-6 w-6 mx-auto mb-2 text-green-500" />
                        <p className="text-2xl font-bold">{stats?.runs || 0}</p>
                        <p className="text-sm text-gray-600">Runs</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Target className="h-6 w-6 mx-auto mb-2 text-red-500" />
                        <p className="text-2xl font-bold">{stats?.wickets || 0}</p>
                        <p className="text-sm text-gray-600">Wickets</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Calendar className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                        <p className="text-2xl font-bold">{stats?.average?.toFixed(2) || '0.00'}</p>
                        <p className="text-sm text-gray-600">Average</p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

const Players: React.FC = () => {
  const [seriesId, setSeriesId] = useState('1015'); // Default series ID
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  
  const { data: squadsData, isLoading, error } = useSquads(seriesId);

  // Extract players from squads data
  const players: Player[] = React.useMemo(() => {
    if (!squadsData?.squads?.category?.team) return [];
    
    const allPlayers: Player[] = [];
    const teams = Array.isArray(squadsData.squads.category.team) 
      ? squadsData.squads.category.team 
      : [squadsData.squads.category.team];
    
    teams.forEach((team: any) => {
      if (team.player) {
        const players = Array.isArray(team.player) ? team.player : [team.player];
        players.forEach((player: any) => {
          allPlayers.push({
            id: player.name || Math.random().toString(), // name field contains the actual ID
            name: player.id || 'Unknown Player', // id field contains the actual name
            role: player.role,
            odi: player.odi,
            t20: player.t20,
            test: player.test,
          });
        });
      }
    });
    return allPlayers;
  }, [squadsData]);

  const filteredPlayers = players.filter(player =>
    player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (player.role && player.role.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleViewProfile = (playerId: string) => {
    setSelectedPlayerId(playerId);
  };

  const handleCloseProfile = () => {
    setSelectedPlayerId(null);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading players...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-red-500 mb-4">Failed to load players data</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">Cricket Players</h1>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search players by name or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Input
              placeholder="Series ID (e.g., 1015)"
              value={seriesId}
              onChange={(e) => setSeriesId(e.target.value)}
              className="w-40"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredPlayers.map((player) => (
          <PlayerCard
            key={player.id}
            player={player}
            onViewProfile={handleViewProfile}
          />
        ))}
      </div>

      {filteredPlayers.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">
              {searchTerm ? 'No players found matching your search.' : 'No players available.'}
            </p>
          </CardContent>
        </Card>
      )}

      {selectedPlayerId && (
        <PlayerProfileModal
          playerId={selectedPlayerId}
          onClose={handleCloseProfile}
        />
      )}
    </div>
  );
};

export default Players;