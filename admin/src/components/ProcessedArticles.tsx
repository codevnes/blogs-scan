import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import type { Article, PaginationMeta, PaginationParams } from '../lib/api';
import { getProcessedArticles, deleteArticle, deleteMultipleArticles } from '../lib/api';
import ArticleModal from './ArticleModal';

export default function ProcessedArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticleIds, setSelectedArticleIds] = useState<number[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  
  useEffect(() => {
    fetchProcessedArticles();
  }, [currentPage, pageSize]);
  
  const fetchProcessedArticles = async () => {
    setLoading(true);
    try {
      const params: PaginationParams = {
        page: currentPage,
        pageSize: pageSize
      };
      const response = await getProcessedArticles(params);
      setArticles(response.data);
      setPagination(response.pagination);
    } catch (error) {
      toast.error('Failed to fetch processed articles');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteArticle = async (id: number) => {
    try {
      await deleteArticle(id);
      toast.success('Article deleted successfully');
      fetchProcessedArticles();
    } catch (error) {
      toast.error('Failed to delete article');
      console.error(error);
    }
  };
  
  const handleDeleteSelected = async () => {
    if (selectedArticleIds.length === 0) return;
    
    try {
      await deleteMultipleArticles(selectedArticleIds);
      toast.success(`${selectedArticleIds.length} articles deleted successfully`);
      setSelectedArticleIds([]);
      fetchProcessedArticles();
    } catch (error) {
      toast.error('Failed to delete selected articles');
      console.error(error);
    }
  };
  
  const toggleSelectArticle = (id: number) => {
    setSelectedArticleIds(prev => 
      prev.includes(id) 
        ? prev.filter(articleId => articleId !== id) 
        : [...prev, id]
    );
  };
  
  const handleViewArticle = (article: Article) => {
    setSelectedArticle(article);
    setShowModal(true);
  };
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };
  
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    setSelectedArticleIds([]);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Processed Articles</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => {
              setCurrentPage(1);
              fetchProcessedArticles();
            }}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDeleteSelected} 
            disabled={selectedArticleIds.length === 0}
          >
            Delete Selected ({selectedArticleIds.length})
          </Button>
        </div>
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <input 
                  type="checkbox" 
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedArticleIds(articles.map(article => article.id));
                    } else {
                      setSelectedArticleIds([]);
                    }
                  }}
                  checked={selectedArticleIds.length === articles.length && articles.length > 0}
                />
              </TableHead>
              <TableHead>Title</TableHead>
              <TableHead>ChatGPT Analysis</TableHead>
              <TableHead>Published At</TableHead>
              <TableHead>Processed At</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  Loading...
                </TableCell>
              </TableRow>
            ) : articles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  No processed articles found
                </TableCell>
              </TableRow>
            ) : (
              articles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell>
                    <input 
                      type="checkbox" 
                      checked={selectedArticleIds.includes(article.id)}
                      onChange={() => toggleSelectArticle(article.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="truncate max-w-xs" title={article.title}>
                      {article.title}
                    </div>
                  </TableCell>
                  <TableCell>
                    {article.ChatGPTResponses?.length || 0} responses
                  </TableCell>
                  <TableCell>{formatDate(article.publishedAt)}</TableCell>
                  <TableCell>
                    {article.ChatGPTResponses && article.ChatGPTResponses.length > 0
                      ? formatDate(article.ChatGPTResponses[0].processedAt)
                      : 'N/A'
                    }
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleViewArticle(article)}
                      >
                        View
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-600 hover:text-red-800"
                        onClick={() => handleDeleteArticle(article.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {articles.length} of {pagination.totalCount} articles
          </div>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1 || loading}
            >
              First
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!pagination.hasPrevPage || loading}
            >
              Previous
            </Button>
            <span className="px-3 py-1 text-sm">
              Page {currentPage} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!pagination.hasNextPage || loading}
            >
              Next
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.totalPages)}
              disabled={currentPage === pagination.totalPages || loading}
            >
              Last
            </Button>
          </div>
        </div>
      )}
      
      {showModal && selectedArticle && (
        <ArticleModal 
          article={selectedArticle} 
          open={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedArticle(null);
          }}
        />
      )}
    </div>
  );
} 