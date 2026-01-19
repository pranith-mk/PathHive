import { MainLayout } from "@/components/layout/MainLayout";
import { mockLearningPaths, mockUsers } from "@/data/mockData";
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
} from "lucide-react";

export default function AdminDashboard() {
  // Mock stats
  const stats = {
    totalUsers: 10542,
    totalPaths: 523,
    reportedPaths: 12,
    activeToday: 1247,
  };

  // Mock reported paths
  const reportedPaths = mockLearningPaths.slice(0, 3).map((p) => ({
    ...p,
    reportCount: Math.floor(Math.random() * 10) + 1,
    reportReason: ["Inappropriate content", "Spam", "Misleading information"][Math.floor(Math.random() * 3)],
  }));

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
            { label: "Total Users", value: stats.totalUsers.toLocaleString(), icon: Users, color: "text-info" },
            { label: "Total Paths", value: stats.totalPaths.toLocaleString(), icon: BookOpen, color: "text-success" },
            { label: "Reported", value: stats.reportedPaths, icon: Flag, color: "text-destructive" },
            { label: "Active Today", value: stats.activeToday.toLocaleString(), icon: TrendingUp, color: "text-primary" },
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
        <Tabs defaultValue="users" className="space-y-6">
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
              <Badge variant="destructive" className="ml-2 h-5 px-1.5">
                {stats.reportedPaths}
              </Badge>
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
                  {mockUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>{user.fullName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.fullName}</p>
                            <p className="text-sm text-muted-foreground">@{user.username}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.role === "admin" ? "default" : "secondary"} className="capitalize">
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.isActive ? (
                          <Badge variant="outline" className="text-success border-success/30">
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
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Ban className="h-4 w-4 mr-2" />
                              Suspend User
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete User
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

          {/* Paths Tab */}
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
                  {mockLearningPaths.map((path) => (
                    <TableRow key={path.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{path.title}</p>
                          <p className="text-sm text-muted-foreground">{path.steps.length} steps</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={path.creator?.avatar} />
                            <AvatarFallback className="text-xs">{path.creator?.fullName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{path.creator?.fullName}</span>
                        </div>
                      </TableCell>
                      <TableCell>{path.enrollmentCount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={path.isPublished ? "default" : "secondary"}>
                          {path.isPublished ? "Published" : "Draft"}
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
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View Path
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Ban className="h-4 w-4 mr-2" />
                              Unpublish
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
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
              {reportedPaths.map((path) => (
                <div key={path.id} className="bg-card rounded-xl border p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        <Badge variant="destructive">{path.reportCount} reports</Badge>
                        <Badge variant="outline">{path.reportReason}</Badge>
                      </div>
                      <h3 className="font-semibold text-lg mb-1">{path.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{path.description}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={path.creator?.avatar} />
                          <AvatarFallback className="text-xs">{path.creator?.fullName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        by {path.creator?.fullName}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Review
                      </Button>
                      <Button variant="outline" size="sm" className="text-success border-success/30 hover:bg-success/10">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Dismiss
                      </Button>
                      <Button variant="destructive" size="sm">
                        <Ban className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
