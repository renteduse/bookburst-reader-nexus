
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpen, Star, TrendingUp, User } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="bg-bookburst-cream">
      {/* Hero Section */}
      <section className="py-20">
        <div className="container px-4 mx-auto text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-bookburst-navy mb-6">
            About BookBurst
          </h1>
          <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto mb-10">
            BookBurst is a personal reading log and social discovery platform for book lovers.
            Track your reading journey, share insights, and discover new books without the noise of social media.
          </p>
        </div>
      </section>

      {/* Our Mission */}
      <section className="py-16 bg-white">
        <div className="container px-4 mx-auto">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-serif text-3xl font-bold text-bookburst-navy mb-6 text-center">
              Our Mission
            </h2>
            <p className="text-lg text-gray-700 mb-6">
              We created BookBurst because we believe that reading is both a personal journey and a shared experience. 
              Our mission is to provide readers with a focused space to:
            </p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <span className="bg-bookburst-amber/20 p-2 rounded-full mr-3 mt-1">
                  <BookOpen className="h-5 w-5 text-bookburst-navy" />
                </span>
                <div>
                  <span className="font-medium text-bookburst-navy">Organize personal reading</span> - 
                  Keep track of books you're reading, want to read, and have finished.
                </div>
              </li>
              <li className="flex items-start">
                <span className="bg-bookburst-amber/20 p-2 rounded-full mr-3 mt-1">
                  <Star className="h-5 w-5 text-bookburst-navy" />
                </span>
                <div>
                  <span className="font-medium text-bookburst-navy">Capture insights</span> - 
                  Write reviews and rate books to remember what resonated with you.
                </div>
              </li>
              <li className="flex items-start">
                <span className="bg-bookburst-amber/20 p-2 rounded-full mr-3 mt-1">
                  <TrendingUp className="h-5 w-5 text-bookburst-navy" />
                </span>
                <div>
                  <span className="font-medium text-bookburst-navy">Discover great reads</span> - 
                  Find new books through community trends and recommendations.
                </div>
              </li>
              <li className="flex items-start">
                <span className="bg-bookburst-amber/20 p-2 rounded-full mr-3 mt-1">
                  <User className="h-5 w-5 text-bookburst-navy" />
                </span>
                <div>
                  <span className="font-medium text-bookburst-navy">Connect meaningfully</span> - 
                  Focus on books and reading without the distractions of social media.
                </div>
              </li>
            </ul>
            <p className="text-lg text-gray-700 text-center italic">
              "Reading is to the mind what exercise is to the body."
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-bookburst-cream">
        <div className="container px-4 mx-auto">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-serif text-3xl font-bold text-bookburst-navy mb-6 text-center">
              Our Story
            </h2>
            <p className="text-lg text-gray-700 mb-6">
              BookBurst began as a passion project by a group of avid readers who were frustrated with existing 
              platforms. We wanted a clean, focused space to track our reading without the noise and distractions 
              of social media.
            </p>
            <p className="text-lg text-gray-700 mb-6">
              We built BookBurst to be the reading companion we've always wanted - simple enough to quickly add books, 
              rich enough to capture our thoughts, and social enough to discover new reads from like-minded readers.
            </p>
            <p className="text-lg text-gray-700 mb-8">
              Today, BookBurst is growing into a vibrant community of readers who share our vision of making reading 
              more organized, insightful, and connected.
            </p>
          </div>
        </div>
      </section>

      {/* Join Us CTA */}
      <section className="py-16 bg-gradient-to-r from-bookburst-amber/60 to-bookburst-burgundy/40">
        <div className="container px-4 mx-auto text-center">
          <h2 className="font-serif text-3xl font-bold text-bookburst-navy mb-6">
            Join Our Reading Community
          </h2>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            Ready to start tracking your reading journey and discovering new books?
            Join thousands of readers on BookBurst today.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/signup">
              <Button className="bg-bookburst-navy hover:bg-bookburst-navy/90 text-white px-8 py-6">
                Sign Up Free
              </Button>
            </Link>
            <Link to="/explore">
              <Button variant="outline" className="border-bookburst-navy text-bookburst-navy hover:bg-bookburst-navy hover:text-white px-8 py-6">
                Explore Books
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
