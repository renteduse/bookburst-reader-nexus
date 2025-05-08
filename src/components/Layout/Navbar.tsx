
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Search, Menu, BookOpen, User, LogOut } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const getUserInitials = () => {
    if (!user || !user.username) return 'BB';
    return user.username.substring(0, 2).toUpperCase();
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-bookburst-navy text-white">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-bookburst-amber" />
            <span className="font-serif text-xl font-bold">BookBurst</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                <form onSubmit={handleSearch} className="relative">
                  <Input
                    type="text"
                    placeholder="Search books..."
                    className="w-64 px-10 py-1 bg-white/10 border border-white/20 text-white placeholder:text-white/60 focus:bg-white/20"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Search className="absolute left-3 top-2 h-4 w-4 text-white/60" />
                </form>
                <Link to="/shelf" className="hover:text-bookburst-amber transition-colors">My Shelf</Link>
                <Link to="/explore" className="hover:text-bookburst-amber transition-colors">Explore</Link>
              </>
            ) : (
              <>
                <Link to="/explore" className="hover:text-bookburst-amber transition-colors">Explore</Link>
                <Link to="/about" className="hover:text-bookburst-amber transition-colors">About</Link>
              </>
            )}
          </div>

          {/* Auth/User Section */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user?.profilePicture} alt={user?.username} />
                      <AvatarFallback className="bg-bookburst-amber text-bookburst-navy">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate(`/profile/${user?._id}`)}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/shelf')}>
                    <BookOpen className="mr-2 h-4 w-4" />
                    My Bookshelf
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" className="hover:text-bookburst-amber">Log in</Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-bookburst-amber text-bookburst-navy hover:bg-bookburst-amber/90">Sign up</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-white" onClick={toggleMenu}>
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-3 py-4 space-y-4">
            {isAuthenticated ? (
              <>
                <form onSubmit={handleSearch} className="relative mb-4">
                  <Input
                    type="text"
                    placeholder="Search books..."
                    className="w-full px-10 py-2 bg-white/10 border border-white/20 text-white placeholder:text-white/60 focus:bg-white/20"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Search className="absolute left-3 top-3 h-4 w-4 text-white/60" />
                </form>
                <Link
                  to="/shelf"
                  className="block py-2 hover:text-bookburst-amber transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Shelf
                </Link>
                <Link
                  to="/explore"
                  className="block py-2 hover:text-bookburst-amber transition-colors" 
                  onClick={() => setIsMenuOpen(false)}
                >
                  Explore
                </Link>
                <Link
                  to={`/profile/${user?._id}`}
                  className="block py-2 hover:text-bookburst-amber transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Profile
                </Link>
                <button
                  className="block w-full text-left py-2 hover:text-bookburst-amber transition-colors"
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/explore"
                  className="block py-2 hover:text-bookburst-amber transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Explore
                </Link>
                <Link
                  to="/about"
                  className="block py-2 hover:text-bookburst-amber transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  About
                </Link>
                <Link
                  to="/login"
                  className="block py-2 hover:text-bookburst-amber transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="block py-2 hover:text-bookburst-amber transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
