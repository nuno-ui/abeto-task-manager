'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Users } from 'lucide-react';

interface Team {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
}

export default function TeamPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await fetch('/api/teams');
      if (response.ok) {
        const data = await response.json();
        setTeams(data);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header title="Teams" />

      <div className="p-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-32 bg-zinc-900 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map(team => (
              <div
                key={team.id}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: team.color + '20' }}
                  >
                    <Users className="w-5 h-5" style={{ color: team.color }} />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{team.name}</h3>
                    <p className="text-xs text-zinc-500">{team.slug}</p>
                  </div>
                </div>
                {team.description && (
                  <p className="text-sm text-zinc-400">{team.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
