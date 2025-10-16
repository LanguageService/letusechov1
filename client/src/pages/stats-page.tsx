import { useQuery } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TranslationStat {
  id: number;
  originalText: string;
  translatedText: string;
  originalLanguage: string;
  targetLanguage: string;
  transcriptionDuration: number | null;
  translationDuration: number | null;
  ttsDuration: number | null;
  createdAt: string;
}

const fetchStats = async (): Promise<TranslationStat[]> => {
  const response = await fetch('/api/stats');
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

const formatDuration = (duration: number | null) => {
  if (duration === null || duration === 0) return 'N/A';
  return `${(duration / 1000).toFixed(2)}s`;
};

export function StatsPage() {
  const { data: stats, isLoading, error } = useQuery<TranslationStat[]>({
    queryKey: ['translationStats'],
    queryFn: fetchStats,
  });

  if (isLoading) {
    return <div className="p-4 text-center">Loading statistics...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error loading statistics: {error.message}</div>;
  }

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6 text-foreground">Translation Latency Statistics</h1>
      <Card>
        <CardHeader>
          <CardTitle>Translation Log</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Original ({stats?.[0]?.originalLanguage})</TableHead>
                <TableHead>Translation ({stats?.[0]?.targetLanguage})</TableHead>
                <TableHead className="text-right">Transcription</TableHead>
                <TableHead className="text-right">Translation</TableHead>
                <TableHead className="text-right">TTS</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats?.map((stat) => {
                const total = (stat.transcriptionDuration || 0) + (stat.translationDuration || 0) + (stat.ttsDuration || 0);
                return (
                  <TableRow key={stat.id}>
                    <TableCell className="max-w-xs truncate">{stat.originalText}</TableCell>
                    <TableCell className="max-w-xs truncate">{stat.translatedText}</TableCell>
                    <TableCell className="text-right">{formatDuration(stat.transcriptionDuration)}</TableCell>
                    <TableCell className="text-right">{formatDuration(stat.translationDuration)}</TableCell>
                    <TableCell className="text-right">{formatDuration(stat.ttsDuration)}</TableCell>
                    <TableCell className="text-right font-semibold">{formatDuration(total)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
