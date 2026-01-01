import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { FileUp, Loader2, Trash2, Upload, Video } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function AdminLectures() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState<"video" | "file">("video");
  const [uploading, setUploading] = useState(false);

  const { data: lectures, isLoading, refetch } = trpc.lectures.list.useQuery();
  const uploadMutation = trpc.lectures.upload.useMutation();
  const deleteMutation = trpc.lectures.delete.useMutation();

  // Redirect non-admin users
  if (!authLoading && (!user || user.role !== "admin")) {
    setLocation("/");
    return null;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      // Check file size (max 200MB)
      if (selectedFile.size > 200 * 1024 * 1024) {
        toast.error("File size must be less than 200MB");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!title) {
      toast.error("Please provide a title");
      return;
    }

    if (uploadType === "video" && !videoUrl) {
      toast.error("Please provide a YouTube URL");
      return;
    }

    if (uploadType === "file" && !file) {
      toast.error("Please select a file");
      return;
    }

    setUploading(true);
    try {
      if (uploadType === "video") {
        // Upload video URL only
        await uploadMutation.mutateAsync({
          title,
          description,
          videoUrl,
        });
      } else {
        // Upload file
        const reader = new FileReader();
        reader.onload = async (e) => {
          const base64Data = e.target?.result as string;
          const base64String = base64Data.split(",")[1];

          await uploadMutation.mutateAsync({
            title,
            description,
            fileData: base64String,
            fileName: file!.name,
            mimeType: file!.type,
            fileSize: file!.size,
          });

          toast.success("Lecture uploaded successfully");
          resetForm();
          refetch();
        };
        reader.readAsDataURL(file!);
        return;
      }

      toast.success("Lecture added successfully");
      resetForm();
      refetch();
    } catch (error) {
      toast.error("Failed to upload lecture");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setOpen(false);
    setTitle("");
    setDescription("");
    setVideoUrl("");
    setFile(null);
    setUploadType("video");
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this lecture?")) {
      return;
    }

    try {
      await deleteMutation.mutateAsync({ id });
      toast.success("Lecture deleted successfully");
      refetch();
    } catch (error) {
      toast.error("Failed to delete lecture");
      console.error(error);
    }
  };

  const extractYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-serif font-bold text-primary mb-2">Manage Lectures</h1>
            <p className="text-muted-foreground">Upload videos and educational content</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="lg">
                <Upload className="mr-2 h-5 w-5" />
                Add Lecture
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Add New Lecture</DialogTitle>
                <DialogDescription>
                  Add a YouTube video or upload a file (slides, PDF, etc.)
                </DialogDescription>
              </DialogHeader>
              <Tabs value={uploadType} onValueChange={(v) => setUploadType(v as "video" | "file")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="video">YouTube Video</TabsTrigger>
                  <TabsTrigger value="file">Upload File</TabsTrigger>
                </TabsList>
                <TabsContent value="video" className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Week 1: From Observation to Research Questions"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Brief description of the lecture content..."
                      rows={3}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="videoUrl">YouTube URL *</Label>
                    <Input
                      id="videoUrl"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                  </div>
                </TabsContent>
                <TabsContent value="file" className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title-file">Title *</Label>
                    <Input
                      id="title-file"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Introduction to Biostatistics"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description-file">Description</Label>
                    <Textarea
                      id="description-file"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Brief description..."
                      rows={3}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="file">File * (Max 200MB)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="file"
                        type="file"
                        onChange={handleFileChange}
                        accept=".pdf,.ppt,.pptx,.mp4,.mp3,.wav,.webm"
                      />
                      {file && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <FileUp className="h-4 w-4" />
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              <DialogFooter>
                <Button variant="outline" onClick={resetForm} disabled={uploading}>
                  Cancel
                </Button>
                <Button onClick={handleUpload} disabled={uploading}>
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    "Add Lecture"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {lectures && lectures.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Video className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No lectures yet</h3>
              <p className="text-muted-foreground mb-4">Add your first lecture to get started</p>
              <Button onClick={() => setOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Add Lecture
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lectures?.map((lecture) => {
              const youtubeId = lecture.videoUrl ? extractYouTubeId(lecture.videoUrl) : null;
              return (
                <Card key={lecture.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    {youtubeId && (
                      <div className="mb-4 aspect-video rounded-lg overflow-hidden">
                        <img
                          src={`https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`}
                          alt={lecture.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardTitle className="line-clamp-2">{lecture.title}</CardTitle>
                    <CardDescription className="line-clamp-3">
                      {lecture.description || "No description provided"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-muted-foreground mb-4">
                      {lecture.videoUrl && <div>Type: YouTube Video</div>}
                      {lecture.fileName && <div>File: {lecture.fileName}</div>}
                      {lecture.fileSize && <div>Size: {(lecture.fileSize / 1024 / 1024).toFixed(2)} MB</div>}
                      <div>Added: {new Date(lecture.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div className="flex gap-2">
                      {lecture.videoUrl && (
                        <Button variant="outline" size="sm" asChild className="flex-1">
                          <a href={lecture.videoUrl} target="_blank" rel="noopener noreferrer">
                            Watch
                          </a>
                        </Button>
                      )}
                      {lecture.fileUrl && (
                        <Button variant="outline" size="sm" asChild className="flex-1">
                          <a href={lecture.fileUrl} target="_blank" rel="noopener noreferrer">
                            Download
                          </a>
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(lecture.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
