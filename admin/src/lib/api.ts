const API_URL = 'http://localhost:4000/api';

export interface Article {
  id: number;
  title: string;
  url: string;
  content: string;
  publishedAt: string | null;
  scrapedAt: string;
  isProcessed: boolean;
  createdAt: string;
  updatedAt: string;
  processingAttempts: number;
  lastProcessingError: string | null;
  lastProcessingAttempt: string | null;
  ChatGPTResponses?: ChatGPTResponse[];
}

export interface ChatGPTResponse {
  id: number;
  articleId: number;
  response: string;
  promptUsed: string;
  processedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface PaginationMeta {
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface ApiResponse<T> {
  message?: string;
  newArticles?: number;
  sourcesProcessed?: number;
  articlesProcessed?: number;
  deletedCount?: number;
  deletedIds?: number[];
  deletedArticleId?: number;
}

// Get all articles with pagination
export async function getAllArticles(params: PaginationParams = {}): Promise<PaginatedResponse<Article>> {
  const { page = 1, pageSize = 20 } = params;
  const queryParams = new URLSearchParams({ page: page.toString(), pageSize: pageSize.toString() });
  
  const response = await fetch(`${API_URL}/articles?${queryParams}`);
  if (!response.ok) {
    throw new Error('Failed to fetch articles');
  }
  return response.json();
}

// Get collected articles with pagination
export async function getCollectedArticles(params: PaginationParams = {}): Promise<PaginatedResponse<Article>> {
  const { page = 1, pageSize = 20 } = params;
  const queryParams = new URLSearchParams({ page: page.toString(), pageSize: pageSize.toString() });
  
  const response = await fetch(`${API_URL}/articles/collected?${queryParams}`);
  if (!response.ok) {
    throw new Error('Failed to fetch collected articles');
  }
  return response.json();
}

// Get processed articles with pagination
export async function getProcessedArticles(params: PaginationParams = {}): Promise<PaginatedResponse<Article>> {
  const { page = 1, pageSize = 20 } = params;
  const queryParams = new URLSearchParams({ page: page.toString(), pageSize: pageSize.toString() });
  
  const response = await fetch(`${API_URL}/articles/processed?${queryParams}`);
  if (!response.ok) {
    throw new Error('Failed to fetch processed articles');
  }
  return response.json();
}

// Get article by ID
export async function getArticleById(id: number): Promise<Article> {
  const response = await fetch(`${API_URL}/articles/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch article with ID ${id}`);
  }
  return response.json();
}

// Trigger scraping
export async function triggerScrape(url?: string): Promise<ApiResponse<never>> {
  const response = await fetch(`${API_URL}/articles/scrape`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  });
  if (!response.ok) {
    throw new Error('Failed to trigger scraping');
  }
  return response.json();
}

// Trigger ChatGPT processing
export async function triggerChatGPTProcessing(): Promise<ApiResponse<never>> {
  const response = await fetch(`${API_URL}/articles/process`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Failed to trigger ChatGPT processing');
  }
  return response.json();
}

// Delete article
export async function deleteArticle(id: number): Promise<ApiResponse<never>> {
  const response = await fetch(`${API_URL}/articles/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(`Failed to delete article with ID ${id}`);
  }
  return response.json();
}

// Delete multiple articles
export async function deleteMultipleArticles(ids: number[]): Promise<ApiResponse<never>> {
  const response = await fetch(`${API_URL}/articles/delete-batch`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ids }),
  });
  if (!response.ok) {
    throw new Error('Failed to delete articles');
  }
  return response.json();
}

// Get admin system status
export async function getSystemStatus(): Promise<any> {
  const response = await fetch(`${API_URL}/admin/status`);
  if (!response.ok) {
    throw new Error('Failed to fetch system status');
  }
  return response.json();
}

// Get failed articles with pagination
export async function getFailedArticles(params: PaginationParams = {}): Promise<PaginatedResponse<Article>> {
  const { page = 1, pageSize = 20 } = params;
  const queryParams = new URLSearchParams({ page: page.toString(), pageSize: pageSize.toString() });
  
  const response = await fetch(`${API_URL}/admin/failed-articles?${queryParams}`);
  if (!response.ok) {
    throw new Error('Failed to fetch failed articles');
  }
  return response.json();
} 