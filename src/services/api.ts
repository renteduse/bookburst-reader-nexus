
import { toast } from "@/components/ui/sonner";

// Base URL for our API
const API_BASE_URL = 'http://localhost:5000/api';

// Default headers for JSON requests
const defaultHeaders = {
  'Content-Type': 'application/json',
};

// Types for users
export interface User {
  _id: string;
  username: string;
  email: string;
  profilePicture?: string;
  createdAt: string;
}

export interface UserCredentials {
  email: string;
  password: string;
  username?: string;
}

// Types for books
export interface Book {
  _id: string;
  title: string;
  author: string;
  description: string;
  coverImage: string;
  isbn?: string;
  pageCount?: number;
  publishedDate?: string;
  publisher?: string;
  genre?: string[];
}

// Types for book status
export type ReadingStatus = 'reading' | 'finished' | 'want-to-read';

export interface BookShelfItem {
  _id: string;
  book: Book;
  user: string;
  status: ReadingStatus;
  rating?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Types for reviews
export interface Review {
  _id: string;
  book: Book;
  user: User;
  rating: number;
  content: string;
  recommend: boolean;
  createdAt: string;
}

// Function to handle errors
const handleApiError = (error: any) => {
  console.error('API Error:', error);
  const message = error.message || 'An unexpected error occurred';
  toast.error(message);
  throw error;
};

// Helper for making API requests
const apiRequest = async <T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> => {
  try {
    // Get token from localStorage
    const token = localStorage.getItem('bookburstToken');
    
    // Set authorization header if token exists
    const headers = {
      ...defaultHeaders,
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(options?.headers || {}),
    };
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }
    
    return data;
  } catch (error) {
    return handleApiError(error);
  }
};

// API methods for authentication
export const authAPI = {
  register: (credentials: UserCredentials) => 
    apiRequest<{ user: User; token: string }>('/users/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  
  login: (credentials: Omit<UserCredentials, 'username'>) => 
    apiRequest<{ user: User; token: string }>('/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  
  getProfile: () => 
    apiRequest<User>('/users/profile'),
  
  updateProfile: (profileData: Partial<User>) => 
    apiRequest<User>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }),
};

// API methods for book management
export const booksAPI = {
  searchBooks: (query: string) =>
    apiRequest<Book[]>(`/books/search?q=${encodeURIComponent(query)}`),
  
  getBookDetails: (bookId: string) =>
    apiRequest<Book>(`/books/${bookId}`),
  
  getTrendingBooks: (page = 1, limit = 10) =>
    apiRequest<{ books: Book[]; total: number; page: number; pages: number }>(
      `/books/trending?page=${page}&limit=${limit}`
    ),
};

// API methods for bookshelf management
export const bookshelfAPI = {
  getMyBooks: (status?: ReadingStatus, page = 1, limit = 10) => {
    const statusParam = status ? `&status=${status}` : '';
    return apiRequest<{ books: BookShelfItem[]; total: number; page: number; pages: number }>(
      `/bookshelf/my-books?page=${page}&limit=${limit}${statusParam}`
    );
  },
  
  addToBookshelf: (bookData: { bookId?: string; book?: Partial<Book>, status: ReadingStatus }) =>
    apiRequest<BookShelfItem>('/bookshelf', {
      method: 'POST',
      body: JSON.stringify(bookData),
    }),
  
  updateBookStatus: (bookshelfItemId: string, status: ReadingStatus) =>
    apiRequest<BookShelfItem>(`/bookshelf/${bookshelfItemId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
  
  updateBookRating: (bookshelfItemId: string, rating: number) =>
    apiRequest<BookShelfItem>(`/bookshelf/${bookshelfItemId}/rating`, {
      method: 'PUT',
      body: JSON.stringify({ rating }),
    }),
  
  updateBookNotes: (bookshelfItemId: string, notes: string) =>
    apiRequest<BookShelfItem>(`/bookshelf/${bookshelfItemId}/notes`, {
      method: 'PUT',
      body: JSON.stringify({ notes }),
    }),
  
  removeFromBookshelf: (bookshelfItemId: string) =>
    apiRequest(`/bookshelf/${bookshelfItemId}`, {
      method: 'DELETE',
    }),
};

// API methods for reviews
export const reviewsAPI = {
  getBookReviews: (bookId: string, page = 1, limit = 10) =>
    apiRequest<{ reviews: Review[]; total: number; page: number; pages: number }>(
      `/reviews/book/${bookId}?page=${page}&limit=${limit}`
    ),
  
  getUserReviews: (userId: string, page = 1, limit = 10) =>
    apiRequest<{ reviews: Review[]; total: number; page: number; pages: number }>(
      `/reviews/user/${userId}?page=${page}&limit=${limit}`
    ),
  
  createReview: (reviewData: { 
    bookId: string, 
    rating: number, 
    content: string,
    recommend: boolean 
  }) =>
    apiRequest<Review>('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    }),
  
  getRecentReviews: (page = 1, limit = 10) =>
    apiRequest<{ reviews: Review[]; total: number; page: number; pages: number }>(
      `/reviews/recent?page=${page}&limit=${limit}`
    ),
};

// API methods for user profiles
export const profileAPI = {
  getUserProfile: (userId: string) =>
    apiRequest<{ user: User; books: BookShelfItem[]; reviews: Review[] }>(
      `/users/${userId}/profile`
    ),
  
  getUserReadingHistory: (userId: string) =>
    apiRequest<{ history: { date: string; books: BookShelfItem[] }[] }>(
      `/users/${userId}/reading-history`
    ),
};

export const exploreAPI = {
  getTrending: (page = 1, limit = 10, genre?: string) => {
    const genreParam = genre ? `&genre=${encodeURIComponent(genre)}` : '';
    return apiRequest<{ books: Book[]; total: number; page: number; pages: number }>(
      `/explore/trending?page=${page}&limit=${limit}${genreParam}`
    );
  },
  
  getRecentReviews: (page = 1, limit = 10, genre?: string) => {
    const genreParam = genre ? `&genre=${encodeURIComponent(genre)}` : '';
    return apiRequest<{ reviews: Review[]; total: number; page: number; pages: number }>(
      `/explore/recent-reviews?page=${page}&limit=${limit}${genreParam}`
    );
  },
  
  getTopRated: (page = 1, limit = 10, genre?: string) => {
    const genreParam = genre ? `&genre=${encodeURIComponent(genre)}` : '';
    return apiRequest<{ books: Book[]; total: number; page: number; pages: number }>(
      `/explore/top-rated?page=${page}&limit=${limit}${genreParam}`
    );
  },
  
  getMostWishlisted: (page = 1, limit = 10, genre?: string) => {
    const genreParam = genre ? `&genre=${encodeURIComponent(genre)}` : '';
    return apiRequest<{ books: Book[]; total: number; page: number; pages: number }>(
      `/explore/most-wishlisted?page=${page}&limit=${limit}${genreParam}`
    );
  },
  
  getGenres: () =>
    apiRequest<string[]>('/explore/genres'),
};
