import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Hexagon, 
  Menu, 
  X, 
  User, 
  LogOut, 
  Shield,
  LayoutDashboard,
  Compass,
  PlusCircle,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NotificationsDropdown } from "@/components/notifications/NotificationsDropdown";

export function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { 
      label: "Browse Paths", 
      href: "/browse", 
      icon: Compass,
      authRequired: false 
    },
    { 
      label: "Dashboard", 
      href: "/dashboard", 
      icon: LayoutDashboard,
      authRequired: true 
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container relative flex h-16 items-center justify-between">
        
        {/* --- Logo (Left) --- */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative flex items-center justify-center">
            <Hexagon className="h-8 w-8 text-primary fill-primary/10 transition-transform group-hover:rotate-12" />
            <span className="absolute text-[10px] font-extrabold text-primary">P</span>
          </div>
          <span className="font-display text-xl font-bold tracking-tight">PathHive</span>
        </Link>

        {/* --- Desktop Navigation (CENTERED) --- */}
        <nav className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-8">
          {navLinks.map((link) => {
            if (link.authRequired && !isAuthenticated) return null;
            
            const isActive = location.pathname === link.href;
            
            return (
              <Link 
                key={link.href}
                to={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary", 
                  isActive 
                    ? "text-foreground font-semibold" 
                    : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* --- Right Side (Auth & Actions) --- */}
        <div className="flex items-center gap-2 md:gap-4">
          
          {/* Notifications - Now visible on all screens */}
          {isAuthenticated && (
            <NotificationsDropdown />
          )}

          {/* User Menu - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <UserMenu user={user} isAdmin={isAdmin} onLogout={handleLogout} navigate={navigate} />
            ) : (
              <AuthButtons navigate={navigate} />
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* --- Mobile Menu (Drawer) --- */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background p-4 animate-in slide-in-from-top-5 shadow-lg">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => {
              if (link.authRequired && !isAuthenticated) return null;
              const isActive = location.pathname === link.href;
              
              return (
                <Link 
                  key={link.href}
                  to={link.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "hover:bg-accent text-muted-foreground"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}

            {/* Mobile Create Action */}
            {isAuthenticated && (
               <Link 
                 to="/create-path"
                 className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg hover:bg-accent text-muted-foreground"
                 onClick={() => setMobileMenuOpen(false)}
               >
                 <PlusCircle className="h-4 w-4" />
                 Create Path
               </Link>
            )}

            {isAdmin && (
              <Link 
                to="/admin" 
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg hover:bg-accent text-muted-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Shield className="h-4 w-4" />
                Admin Panel
              </Link>
            )}

            <div className="my-2 border-t border-border/50" />

            {isAuthenticated ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 px-4 py-2 mb-2">
                   <Avatar className="h-8 w-8 border border-border">
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback>{user?.fullName?.charAt(0)}</AvatarFallback>
                   </Avatar>
                   <div className="flex flex-col">
                      <span className="text-sm font-medium">{user?.fullName}</span>
                      <span className="text-xs text-muted-foreground">@{user?.username}</span>
                   </div>
                </div>
                
                {/* Mobile Profile Link */}
                <Button 
                   variant="ghost" 
                   className="justify-start"
                   onClick={() => { navigate(`/creator/${user?.id}`); setMobileMenuOpen(false); }}
                >
                   <User className="mr-2 h-4 w-4" /> Profile
                </Button>

                <Button 
                  variant="ghost" 
                  className="justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 mt-2">
                <Button variant="outline" onClick={() => { navigate("/login"); setMobileMenuOpen(false); }}>
                  Log in
                </Button>
                <Button onClick={() => { navigate("/register"); setMobileMenuOpen(false); }}>
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

// --- Helpers ---

function AuthButtons({ navigate }: { navigate: any }) {
  return (
    <>
      <Button variant="ghost" onClick={() => navigate("/login")}>
        Log in
      </Button>
      <Button onClick={() => navigate("/register")}>
        Get Started
      </Button>
    </>
  );
}

function UserMenu({ user, isAdmin, onLogout, navigate }: any) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9 border border-border transition-all hover:border-primary/50">
            <AvatarImage src={user?.avatar} alt={user?.fullName} />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {user?.fullName?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.fullName}</p>
            <p className="text-xs leading-none text-muted-foreground">@{user?.username}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => navigate("/dashboard")}>
          <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
        </DropdownMenuItem>
        
      
        <DropdownMenuItem onClick={() => navigate(`/creator/${user?.id}`)}>
          <User className="mr-2 h-4 w-4" /> Profile
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => navigate("/settings")}>
          <Settings className="mr-2 h-4 w-4" /> Settings
        </DropdownMenuItem>
        
        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/admin")}>
              <Shield className="mr-2 h-4 w-4 text-blue-500" /> Admin Panel
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onLogout} className="text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}