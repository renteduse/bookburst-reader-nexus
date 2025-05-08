
import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-bookburst-cream px-4">
      <div className="text-center max-w-md">
        <BookOpen className="h-24 w-24 text-bookburst-amber mx-auto mb-6" />
        <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4 text-bookburst-navy">404</h1>
        <p className="text-xl text-gray-700 mb-6">
          Oops! We couldn't find the page you're looking for.
        </p>
        <p className="text-gray-600 mb-8">
          The page may have been moved, deleted, or maybe it was just a fictional chapter.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/">
            <Button className="bg-bookburst-amber text-bookburst-navy hover:bg-bookburst-amber/90">
              Back to Home
            </Button>
          </Link>
          <Link to="/explore">
            <Button variant="outline" className="border-bookburst-navy text-bookburst-navy">
              Explore Books
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
