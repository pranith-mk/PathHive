import { Link } from "react-router-dom";
import { Hexagon, Github, GraduationCap } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/30">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="relative">
                <Hexagon className="h-7 w-7 text-primary fill-primary/10" />
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-primary">
                  P
                </span>
              </div>
              <span className="font-display text-lg font-bold">PathHive</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              Curate, learn, and share knowledge paths. Build your skills with structured learning journeys.
            </p>
            <div className="flex gap-3">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/browse" className="hover:text-foreground transition-colors">Browse Paths</Link></li>
              <li><Link to="/create-path" className="hover:text-foreground transition-colors">Create Path</Link></li>
              <li><Link to="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link></li>
            </ul>
          </div>

          {/* Project Info */}
          <div>
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              Academic Project
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>St. Joseph's College (Autonomous) </li>
              <li>Devagiri, Calicut </li>
              <li>Department of Computer Science </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} PathHive. All rights reserved.</p>
          <p className="mt-1">Built by Pranith M K, Sabeel & Nevin Krishna</p>
        </div>
      </div>
    </footer>
  );
}