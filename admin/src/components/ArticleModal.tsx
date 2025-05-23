import { Fragment, useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import type { Article, ChatGPTResponse } from '../lib/api';
import { getArticleById } from '../lib/api';

interface ArticleModalProps {
  article: Article;
  open: boolean;
  onClose: () => void;
}

export default function ArticleModal({ article: initialArticle, open, onClose }: ArticleModalProps) {
  const [article, setArticle] = useState<Article>(initialArticle);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (open && initialArticle) {
      fetchFullArticle(initialArticle.id);
    }
  }, [open, initialArticle]);
  
  const fetchFullArticle = async (id: number) => {
    setLoading(true);
    try {
      const fullArticle = await getArticleById(id);
      setArticle(fullArticle);
    } catch (error) {
      console.error('Failed to fetch article details:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (!open) return null;
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold truncate max-w-3xl" title={article.title}>
            {loading ? 'Loading article...' : article.title}
          </h2>
          <Button variant="ghost" onClick={onClose}>
            ✕
          </Button>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">Loading article details...</div>
        ) : (
          <Fragment>
            <div className="p-4 border-b">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Published</p>
                  <p>{formatDate(article.publishedAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Scraped</p>
                  <p>{formatDate(article.scrapedAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Source URL</p>
                  <a 
                    href={article.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-600 hover:underline truncate block"
                  >
                    {article.url}
                  </a>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Processed</p>
                  <span className={`px-2 py-1 rounded text-xs ${article.isProcessed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {article.isProcessed ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
              <Tabs defaultValue="content">
                <div className="px-4 pt-2">
                  <TabsList>
                    <TabsTrigger value="content">Article Content</TabsTrigger>
                    <TabsTrigger 
                      value="chatgpt" 
                      disabled={!article.ChatGPTResponses || article.ChatGPTResponses.length === 0}
                    >
                      ChatGPT Analysis ({article.ChatGPTResponses?.length || 0})
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="content" className="p-4">
                  <div className="whitespace-pre-wrap">{article.content}</div>
                </TabsContent>
                
                <TabsContent value="chatgpt" className="p-4">
                  {article.ChatGPTResponses && article.ChatGPTResponses.length > 0 ? (
                    article.ChatGPTResponses.map((response: ChatGPTResponse) => (
                      <div key={response.id} className="mb-6 border rounded-lg p-4">
                        <div className="mb-2 pb-2 border-b">
                          <p className="text-sm text-gray-500">Processed at: {formatDate(response.processedAt)}</p>
                          <p className="text-sm text-gray-500">Prompt used:</p>
                          <div className="text-sm bg-gray-50 p-2 rounded mt-1">
                            {response.promptUsed}
                          </div>
                        </div>
                        <h3 className="font-medium mb-2">Response:</h3>
                        <div className="whitespace-pre-wrap">
                          {response.response}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>No ChatGPT responses available</p>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </Fragment>
        )}
      </div>
    </div>
  );
} 