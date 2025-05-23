import { Request, Response, NextFunction } from 'express';

interface PaginationOptions {
  page: number;
  pageSize: number;
  limit: number;
  offset: number;
}

// Parse pagination parameters from request query
export const getPaginationParams = (req: Request): PaginationOptions => {
  // Default values
  const defaultPageSize = 20;
  const maxPageSize = 100;
  
  // Parse page and pageSize from query parameters
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const requestedPageSize = parseInt(req.query.pageSize as string) || defaultPageSize;
  
  // Limit pageSize to prevent excessive data retrieval
  const pageSize = Math.min(requestedPageSize, maxPageSize);
  
  // Calculate offset for pagination
  const offset = (page - 1) * pageSize;
  
  return {
    page,
    pageSize,
    limit: pageSize,
    offset,
  };
};

// Format paginated response
export const formatPaginatedResponse = <T>(
  data: T[],
  totalCount: number,
  paginationOptions: PaginationOptions
) => {
  const { page, pageSize } = paginationOptions;
  const totalPages = Math.ceil(totalCount / pageSize);
  
  return {
    data,
    pagination: {
      totalCount,
      totalPages,
      currentPage: page,
      pageSize,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

// Optional middleware to handle pagination parameters
export const paginationMiddleware = (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  const pagination = getPaginationParams(req);
  
  // Attach pagination to request object for use in controllers
  (req as any).pagination = pagination;
  
  next();
}; 