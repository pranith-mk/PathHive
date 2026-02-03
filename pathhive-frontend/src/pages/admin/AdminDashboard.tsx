import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Users, 
  BookOpen, 
  Flag, 
  TrendingUp,
  Search,
  MoreVertical,
  Eye,
  Ban,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  ExternalLink,
  FileText
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { pathService } from "@/lib/pathService";
// Added 'Path' to imports
import { Report, AdminStats, User, Path } from "@/types/api"; 
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // 1. State
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [paths, setPaths] = useState<Path[]>([]); // <--- New Paths State
  const [loading, setLoading] = useState(true);

  // 2. Fetch Data on Mount
  useEffect(() => {
    if (!authLoading) {
      const hasAccess = user?.is_staff === true || user?.role === 'admin';

      if (!isAuthenticated || !hasAccess) {
        navigate("/"); 
        return;
      }

      const fetchAdminData = async () => {
        try {
          // Fetch Stats, Reports, Users, AND Paths
          const [statsData, reportsData, usersData, pathsData] = await Promise.all([
            pathService.getAdminStats(),
            pathService.getReports(),
            pathService.getUsers(),
            pathService.getAdminPaths() // <--- Fetch Real Paths
          ]);
          setStats(statsData);
          setReports(reportsData);
          setUsers(usersData);
          setPaths(pathsData); // <--- Set Real Paths
        } catch (error) {
          console.error("Failed to load admin data", error);
          toast({ title: "Error loading dashboard", variant: "destructive" });
        } finally {
          setLoading(false);
        }
      };

      fetchAdminData();
    }
  }, [isAuthenticated, user, authLoading, navigate, toast]);

  // 3. Actions
  const handleResolveReport = async (reportId: number) => {
    try {
      await pathService.resolveReport(reportId);
      setReports((prev) => prev.map(r => r.id === reportId ? { ...r, is_resolved: true } : r));
      toast({ title: "Report resolved" });
    } catch (error) {
      toast({ title: "Failed to resolve", variant: "destructive" });
    }
  };

  const handleDeleteUser = async (userId: string | number) => {
    if (!window.confirm("Are you sure? This user will be permanently deleted.")) return;
    try {
      await pathService.deleteUser(userId);
      setUsers((prev) => prev.filter(u => u.id !== userId));
      toast({ title: "User deleted successfully" });
    } catch (error) {
      toast({ title: "Failed to delete user", variant: "destructive" });
    }
  };

  // New Delete Path Handler
  const handleDeletePath = async (pathId: string) => {
    if (!window.confirm("Are you sure? This will delete the path and all its content.")) return;
    try {
      await pathService.deletePath(pathId);
      setPaths((prev) => prev.filter(p => p.id !== pathId));
      toast({ title: "Path deleted successfully" });
    } catch (error) {
      toast({ title: "Failed to delete path", variant: "destructive" });
    }
  };

  if (authLoading || loading) {
    return (
      <MainLayout showFooter={false}>
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout showFooter={false}>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage users, paths, and platform moderation
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Users", value: stats?.total_users?.toLocaleString() || "0", icon: Users, color: "text-info" },
            { label: "Total Paths", value: stats?.total_paths?.toLocaleString() || "0", icon: BookOpen, color: "text-success" },
            { label: "Pending Reports", value: stats?.pending_reports || "0", icon: Flag, color: "text-destructive" },
            { label: "Total Comments", value: stats?.total_comments?.toLocaleString() || "0", icon: TrendingUp, color: "text-primary" },
          ].map((stat, i) => (
            <div key={i} className="bg-card rounded-xl border p-5">
              <div className={`p-2 rounded-lg bg-secondary w-fit ${stat.color} mb-3`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-display font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="paths" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="paths">
              <BookOpen className="h-4 w-4 mr-2" />
              Paths
            </TabsTrigger>
            <TabsTrigger value="reports">
              <Flag className="h-4 w-4 mr-2" />
              Reports
              {stats && stats.pending_reports > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 px-1.5">
                  {stats.pending_reports}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <div className="bg-card rounded-xl border overflow-hidden">
              <div className="p-4 border-b flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search users..." className="pl-10" />
                </div>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            No users found.
                        </TableCell>
                      </TableRow>
                  ) : users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={u.avatar} />
                            <AvatarFallback>{u.username?.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{u.full_name || u.username}</p>
                            <p className="text-sm text-muted-foreground">{u.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={u.role === "admin" ? "default" : "secondary"} className="capitalize">
                          {u.role || 'user'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {u.is_active ? (
                          <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">
                            <XCircle className="h-3 w-3 mr-1" />
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => window.open(`mailto:${u.email}`)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Contact User
                            </DropdownMenuItem>
                            {u.id !== user?.id && (
                                <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteUser(u.id)}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete User
                                </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Paths Tab - REAL DATA */}
          <TabsContent value="paths">
            <div className="bg-card rounded-xl border overflow-hidden">
              <div className="p-4 border-b flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search paths..." className="pl-10" />
                </div>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Path</TableHead>
                    <TableHead>Creator</TableHead>
                    <TableHead>Enrollments</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paths.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            No paths found.
                        </TableCell>
                      </TableRow>
                  ) : paths.map((path) => (
                    <TableRow key={path.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-md bg-secondary/50 flex items-center justify-center">
                            <BookOpen className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium line-clamp-1">{path.title}</p>
                            <p className="text-sm text-muted-foreground">{path.steps?.length || 0} steps</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={path.creator?.avatar} />
                            <AvatarFallback className="text-xs">{path.creator?.username?.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{path.creator?.username || "Unknown"}</span>
                        </div>
                      </TableCell>
                      <TableCell>{path.enrollmentCount || 0}</TableCell>
                      <TableCell>
                        <Badge variant={path.is_published ? "default" : "secondary"}>
                          {path.is_published ? "Published" : "Draft"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/path/${path.id}`)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Path
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDeletePath(path.id)}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Path
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <div className="space-y-4">
              {reports.filter(r => !r.is_resolved).length === 0 ? (
                 <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed">
                    <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-3" />
                    <p className="text-muted-foreground">No pending reports! Good job.</p>
                 </div>
              ) : (
                reports.filter(r => !r.is_resolved).map((report) => (
                  <div key={report.id} className="bg-card rounded-xl border p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="h-4 w-4 text-destructive" />
                          <Badge variant="destructive" className="capitalize">{report.report_type}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(report.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <div className="bg-muted/50 p-3 rounded-md mb-3">
                           <p className="text-sm font-medium mb-1">Reason:</p>
                           <p className="text-sm text-foreground whitespace-pre-wrap">{report.reason}</p>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={undefined} />
                            <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                {report.reporter_name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          Reported by <span className="font-medium text-foreground">{report.reporter_name}</span>
                          
                          {report.report_type === 'path' && (
                              <>
                                <span className="mx-1">•</span>
                                <a href={`/path/${report.target_id}`} target="_blank" rel="noreferrer" className="flex items-center hover:text-primary transition-colors">
                                    View Content <ExternalLink className="h-3 w-3 ml-1" />
                                </a>
                              </>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 flex-col md:flex-row">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-success border-success/30 hover:bg-success/10 hover:text-success"
                            onClick={() => handleResolveReport(report.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}