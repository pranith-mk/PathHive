import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Hexagon, 
  Menu, 
  X, 
  User, 
  BookOpen, 
  PlusCircle, 
  Settings, 
  LogOut,
  Shield
} from "lucide-react";
import { useState } from "react";
import { NotificationsDropdown } from "@/components/notifications/NotificationsDropdown";

export function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative">
            <Hexagon className="h-8 w-8 text-primary fill-primary/10 transition-transform group-hover:scale-110" />
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-primary">
              P
            </span>
          </div>
          <span className="font-display text-xl font-bold">PathHive</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link 
            to="/browse" 
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Browse Paths
          </Link>
          {isAuthenticated && (
            <>
              <Link 
                to="/dashboard" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Dashboard
              </Link>
              <Link 
                to="/create" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Create Path
              </Link>
            </>
          )}
        </nav>

        {/* Auth Section */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated && <NotificationsDropdown />}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10 border-2 border-primary/20">
                    <AvatarImage src={user?.avatar} alt={user?.fullName} />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {user?.fullName?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center gap-2 p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback>{user?.fullName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <p className="text-sm font-medium">{user?.fullName}</p>
                    <p className="text-xs text-muted-foreground">@{user?.username}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                  <BookOpen className="mr-2 h-4 w-4" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/create")}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Path
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/admin")}>
                      <Shield className="mr-2 h-4 w-4" />
                      Admin Panel
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" onClick={() => navigate("/login")}>
                Log in
              </Button>
              <Button variant="hero" onClick={() => navigate("/register")}>
                Get Started
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background animate-slide-up">
          <nav className="container py-4 flex flex-col gap-2">
            <Link 
              to="/browse" 
              className="px-4 py-2 text-sm font-medium hover:bg-secondary rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              Browse Paths
            </Link>
            {isAuthenticated ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="px-4 py-2 text-sm font-medium hover:bg-secondary rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/create" 
                  className="px-4 py-2 text-sm font-medium hover:bg-secondary rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Create Path
                </Link>
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    className="px-4 py-2 text-sm font-medium hover:bg-secondary rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin Panel
                  </Link>
                )}
                <Button 
                  variant="ghost" 
                  className="justify-start text-destructive"
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </Button>
              </>
            ) : (
              <div className="flex flex-col gap-2 px-4 pt-2">
                <Button variant="outline" onClick={() => navigate("/login")}>
                  Log in
                </Button>
                <Button variant="hero" onClick={() => navigate("/register")}>
                  Get Started
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
