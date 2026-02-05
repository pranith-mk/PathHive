import { useState, useRef, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Loader2, Upload, User as UserIcon, Camera } from "lucide-react";
import { userService } from "@/lib/userService";

export default function Settings() {
  const { user, updateUser } = useAuth(); // You might need to add updateUser to your AuthContext
  const [isLoading, setIsLoading] = useState(false);
  
  // Form State
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  
  // Image State
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form with current user data
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
      setBio(user.bio || "");
      setAvatarPreview(user.avatar || null);
    }
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      // Create local preview URL
      const objectUrl = URL.createObjectURL(file);
      setAvatarPreview(objectUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const updatedUser = await userService.updateProfile({
        full_name: fullName,
        bio: bio,
        avatar: avatarFile
      });
      
      if (updatedUser.avatar) {
        updatedUser.avatar = `${updatedUser.avatar}?t=${new Date().getTime()}`;
      }

      // Update local context if your AuthContext supports it
      // If not, you might need to reload the page or fetch user again
      if (updateUser) {
        updateUser(updatedUser);
      }

      toast({
        title: "Profile Updated",
        description: "Your changes have been saved successfully.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="container py-10 max-w-2xl">
        <h1 className="text-3xl font-display font-bold mb-8">Settings</h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* --- Avatar Section --- */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
              <CardDescription>Click the image to upload a new photo.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
              <div 
                className="relative group cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-background shadow-sm group-hover:opacity-90 transition-opacity">
                  <AvatarImage src={avatarPreview || ""} className="object-cover" />
                  <AvatarFallback className="text-4xl bg-muted">
                    {fullName?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                {/* Overlay Icon */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="h-8 w-8" />
                </div>

                {/* Hidden Input */}
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>

              <div className="flex-1 space-y-2 text-center sm:text-left">
                <div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Change Photo
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Recommended: Square JPG, PNG, or GIF, at least 1000x1000 pixels.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* --- Personal Info Section --- */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your public profile details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input 
                  id="username" 
                  value={user?.username || ""} 
                  disabled 
                  className="bg-muted text-muted-foreground cursor-not-allowed" 
                />
                <p className="text-[10px] text-muted-foreground">Usernames cannot be changed.</p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="fullname">Full Name</Label>
                <Input 
                  id="fullname" 
                  placeholder="e.g. Jane Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea 
                  id="bio" 
                  placeholder="Tell us a little about yourself..."
                  className="min-h-[120px]"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {bio.length}/500 characters
                </p>
              </div>
            </CardContent>
          </Card>

          {/* --- Save Button --- */}
          <div className="flex justify-end gap-4">
            <Button variant="ghost" type="button" onClick={() => window.history.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="min-w-[120px]">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>

        </form>
      </div>
    </MainLayout>
  );
}