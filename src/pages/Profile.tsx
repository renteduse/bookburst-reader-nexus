
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { User, BookShelfItem, Review, profileAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/sonner';
import BookCard from '@/components/Books/BookCard';
import ReviewCard from '@/components/Reviews/ReviewCard';
import { BookOpen, Calendar } from 'lucide-react';

interface ReadingHistory {
  date: string;
  books: BookShelfItem[];
}

const Profile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser, isAuthenticated } = useAuth();
  
  const [user, setUser] = useState<User | null>(null);
  const [books, setBooks] = useState<BookShelfItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [readingHistory, setReadingHistory] = useState<ReadingHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  
  // Check if profile belongs to current user
  const isOwnProfile = isAuthenticated && currentUser?._id === id;
  
  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const data = await profileAPI.getUserProfile(id);
        setUser(data.user);
        setBooks(data.books);
        setReviews(data.reviews);
        document.title = `${data.user.username}'s Profile - BookBurst`;
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load user profile.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, [id]);
  
  // Fetch reading history when history tab is active
  const fetchReadingHistory = async () => {
    if (!id || isLoadingHistory) return;
    
    setIsLoadingHistory(true);
    try {
      const data = await profileAPI.getUserReadingHistory(id);
      setReadingHistory(data.history);
    } catch (error) {
      console.error('Error fetching reading history:', error);
      toast.error('Failed to load reading history.');
    } finally {
      setIsLoadingHistory(false);
    }
  };
  
  const getUserInitials = (username: string): string => {
    return username.substring(0, 2).toUpperCase();
  };
  
  const formatMonthYear = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center">
        <div className="text-center">
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center">
        <div className="text-center">
          <h2 className="font-serif text-2xl font-bold text-bookburst-navy mb-4">User not found</h2>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12">
        <div className="md:w-1/3 lg:w-1/4 text-center">
          <Avatar className="h-40 w-40 mx-auto">
            <AvatarImage src={user.profilePicture} alt={user.username} />
            <AvatarFallback className="bg-bookburst-amber text-bookburst-navy text-5xl">
              {getUserInitials(user.username)}
            </AvatarFallback>
          </Avatar>
          
          <h1 className="font-serif text-3xl font-bold text-bookburst-navy mt-6 mb-2">
            {user.username}
          </h1>
          
          <p className="text-gray-600 mb-4">
            Member since {new Date(user.createdAt).toLocaleDateString()}
          </p>
          
          <div className="flex justify-center space-x-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-bookburst-navy">{books.length}</p>
              <p className="text-sm text-gray-600">Books</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-bookburst-navy">{reviews.length}</p>
              <p className="text-sm text-gray-600">Reviews</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-bookburst-navy">
                {books.filter(b => b.status === 'finished').length}
              </p>
              <p className="text-sm text-gray-600">Finished</p>
            </div>
          </div>
        </div>
        
        <div className="md:w-2/3 lg:w-3/4 w-full">
          <Tabs defaultValue="bookshelf" className="w-full" 
            onValueChange={(value) => {
              if (value === 'history') fetchReadingHistory();
            }}
          >
            <TabsList className="mb-6 flex flex-wrap">
              <TabsTrigger value="bookshelf">Bookshelf</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="history">Reading History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="bookshelf" className="w-full">
              {books.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <BookOpen className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="font-serif text-2xl font-medium text-gray-600 mb-2">
                    No books yet
                  </h3>
                  <p className="text-gray-500">
                    {isOwnProfile 
                      ? "You haven't added any books to your shelf yet."
                      : `${user.username} hasn't added any books yet.`}
                  </p>
                </div>
              ) : (
                <div>
                  <h2 className="font-serif text-2xl font-semibold mb-4">Currently Reading</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-10">
                    {books
                      .filter((item) => item.status === 'reading')
                      .map((item) => (
                        <div key={item._id} className="flex flex-col h-full">
                          <BookCard book={item.book} rating={item.rating} />
                        </div>
                      ))}
                    {books.filter(item => item.status === 'reading').length === 0 && (
                      <div className="col-span-full text-center py-6 bg-gray-50 rounded-lg">
                        <p className="text-gray-500">
                          {isOwnProfile 
                            ? "You're not currently reading any books."
                            : `${user.username} isn't currently reading any books.`}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <h2 className="font-serif text-2xl font-semibold mb-4">Want to Read</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-10">
                    {books
                      .filter((item) => item.status === 'want-to-read')
                      .map((item) => (
                        <div key={item._id} className="flex flex-col h-full">
                          <BookCard book={item.book} rating={item.rating} showRating={false} />
                        </div>
                      ))}
                    {books.filter(item => item.status === 'want-to-read').length === 0 && (
                      <div className="col-span-full text-center py-6 bg-gray-50 rounded-lg">
                        <p className="text-gray-500">
                          {isOwnProfile 
                            ? "You don't have any books in your want to read list."
                            : `${user.username} doesn't have any books in their want to read list.`}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <h2 className="font-serif text-2xl font-semibold mb-4">Finished</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {books
                      .filter((item) => item.status === 'finished')
                      .map((item) => (
                        <div key={item._id} className="flex flex-col h-full">
                          <BookCard book={item.book} rating={item.rating} />
                        </div>
                      ))}
                    {books.filter(item => item.status === 'finished').length === 0 && (
                      <div className="col-span-full text-center py-6 bg-gray-50 rounded-lg">
                        <p className="text-gray-500">
                          {isOwnProfile 
                            ? "You haven't finished any books yet."
                            : `${user.username} hasn't finished any books yet.`}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="reviews" className="w-full">
              {reviews.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <BookOpen className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="font-serif text-2xl font-medium text-gray-600 mb-2">
                    No reviews yet
                  </h3>
                  <p className="text-gray-500">
                    {isOwnProfile 
                      ? "You haven't written any reviews yet."
                      : `${user.username} hasn't written any reviews yet.`}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {reviews.map((review) => (
                    <ReviewCard key={review._id} review={review} />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="history" className="w-full">
              {isLoadingHistory ? (
                <div className="flex justify-center items-center h-64">
                  <p>Loading reading history...</p>
                </div>
              ) : readingHistory.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Calendar className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="font-serif text-2xl font-medium text-gray-600 mb-2">
                    No reading history
                  </h3>
                  <p className="text-gray-500">
                    {isOwnProfile 
                      ? "You haven't finished any books yet."
                      : `${user.username} hasn't finished any books yet.`}
                  </p>
                </div>
              ) : (
                <div className="space-y-8">
                  {readingHistory.map((month) => (
                    <Card key={month.date}>
                      <CardHeader>
                        <CardTitle>{formatMonthYear(month.date)}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                          {month.books.map((item) => (
                            <div key={item._id} className="flex flex-col h-full">
                              <BookCard 
                                book={item.book} 
                                rating={item.rating}
                                compact={true}
                              />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;
