import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { 
  getCollectedArticles, 
  getProcessedArticles,
  triggerScrape,
  triggerChatGPTProcessing,
  getSystemStatus
} from '../lib/api';

export default function Dashboard() {
  const [isScrapingLoading, setIsScrapingLoading] = useState(false);
  const [isProcessingLoading, setIsProcessingLoading] = useState(false);
  const [stats, setStats] = useState({
    totalArticles: 0,
    processedArticles: 0,
    unprocessedArticles: 0,
    failedArticles: 0
  });
  const [scrapeUrl, setScrapeUrl] = useState('');
  
  useEffect(() => {
    fetchStats();
  }, []);
  
  const fetchStats = async () => {
    try {
      // Try to get system status first (more comprehensive stats)
      try {
        const systemStatus = await getSystemStatus();
        if (systemStatus && systemStatus.statistics) {
          const { totalArticles, processedArticles, unprocessedArticles, failedArticles } = systemStatus.statistics;
          setStats({
            totalArticles,
            processedArticles,
            unprocessedArticles,
            failedArticles
          });
          return;
        }
      } catch (error) {
        console.error("Couldn't fetch system status, falling back to article counts", error);
      }
      
      // Fallback to article counts if system status fails
      const collectedResponse = await getCollectedArticles();
      const processedResponse = await getProcessedArticles();
      
      setStats({
        totalArticles: collectedResponse.pagination.totalCount,
        processedArticles: processedResponse.pagination.totalCount,
        unprocessedArticles: collectedResponse.pagination.totalCount - processedResponse.pagination.totalCount,
        failedArticles: 0 // We don't have this info without the system status
      });
    } catch (error) {
      toast.error('Failed to fetch statistics');
      console.error(error);
    }
  };
  
  const handleScrape = async () => {
    setIsScrapingLoading(true);
    try {
      const result = await triggerScrape(scrapeUrl || undefined);
      toast.success(`Scraping completed: ${result.newArticles} new articles`);
      fetchStats();
    } catch (error) {
      toast.error('Scraping failed');
      console.error(error);
    } finally {
      setIsScrapingLoading(false);
      setScrapeUrl('');
    }
  };
  
  const handleProcess = async () => {
    setIsProcessingLoading(true);
    try {
      const result = await triggerChatGPTProcessing();
      toast.success(`Processing completed: ${result.articlesProcessed} articles`);
      fetchStats();
    } catch (error) {
      toast.error('Processing failed');
      console.error(error);
    } finally {
      setIsProcessingLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-lg border p-6">
          <h2 className="text-2xl font-semibold mb-2">Article Statistics</h2>
          <div className="space-y-2">
            <p className="flex justify-between">
              <span className="text-gray-500">Total Articles:</span>
              <span className="font-medium">{stats.totalArticles}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-gray-500">Processed Articles:</span>
              <span className="font-medium">{stats.processedArticles}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-gray-500">Unprocessed Articles:</span>
              <span className="font-medium">{stats.unprocessedArticles}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-gray-500">Failed Articles:</span>
              <span className="font-medium">{stats.failedArticles}</span>
            </p>
          </div>
        </div>
        
        <div className="rounded-lg border p-6">
          <h2 className="text-2xl font-semibold mb-4">Actions</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Scrape URL (optional)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://cafef.vn/..."
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                  value={scrapeUrl}
                  onChange={(e) => setScrapeUrl(e.target.value)}
                />
                <Button 
                  onClick={handleScrape} 
                  disabled={isScrapingLoading}
                >
                  {isScrapingLoading ? "Scraping..." : "Scrape Articles"}
                </Button>
              </div>
            </div>
            <div>
              <Button
                onClick={handleProcess}
                disabled={isProcessingLoading}
                variant="secondary"
                className="w-full"
              >
                {isProcessingLoading ? "Processing..." : "Process with ChatGPT"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 