import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Calendar, Clock, Link as LinkIcon, Trash2, Video } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminSessions() {
  const { data: user } = trpc.auth.me.useQuery();
  const { data: upcomingSessions = [], refetch: refetchUpcoming } = trpc.sessions.getUpcoming.useQuery();
  const { data: pastSessions = [], refetch: refetchPast } = trpc.sessions.getPast.useQuery();
  const uploadLecture = trpc.lectures.upload.useMutation();
  const deleteLecture = trpc.lectures.delete.useMutation();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sessionDate, setSessionDate] = useState("");
  const [sessionTime, setSessionTime] = useState("");
  const [zoomLink, setZoomLink] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = user?.role === "admin";

  if (!isAdmin) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground">You must be an admin to access this page.</p>
        </div>
      </Layout>
    );
  }

  const handleScheduleSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !sessionDate || !sessionTime) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const dateTime = new Date(`${sessionDate}T${sessionTime}`);
      
      await uploadLecture.mutateAsync({
        title,
        description,
        videoUrl: videoUrl || undefined,
        sessionDate: dateTime.toISOString(),
        zoomLink: zoomLink || undefined,
      });

      toast.success("Session scheduled successfully!");
      setTitle("");
      setDescription("");
      setSessionDate("");
      setSessionTime("");
      setZoomLink("");
      setVideoUrl("");
      refetchUpcoming();
    } catch (error: any) {
      toast.error(error.message || "Failed to schedule session");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSession = async (id: number) => {
    if (!confirm("Are you sure you want to delete this session?")) return;
    
    try {
      await deleteLecture.mutateAsync({ id });
      toast.success("Session deleted");
      refetchUpcoming();
      refetchPast();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete session");
    }
  };

  const formatDateTime = (date: Date | string | null) => {
    if (!date) return "Not scheduled";
    const d = new Date(date);
    return d.toLocaleString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Layout>
      <div className="container py-12">
        <h1 className="text-4xl font-bold mb-8">Session Management</h1>

        {/* Schedule New Session */}
        <Card className="p-6 mb-12">
          <h2 className="text-2xl font-semibold mb-6">Schedule New Session</h2>
          <form onSubmit={handleScheduleSession} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Session Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Week 2: Research Methodology"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="videoUrl">YouTube URL (for recording)</Label>
                <Input
                  id="videoUrl"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of what will be covered..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="sessionDate">Date *</Label>
                <Input
                  id="sessionDate"
                  type="date"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sessionTime">Time *</Label>
                <Input
                  id="sessionTime"
                  type="time"
                  value={sessionTime}
                  onChange={(e) => setSessionTime(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="zoomLink">Zoom Link</Label>
                <Input
                  id="zoomLink"
                  value={zoomLink}
                  onChange={(e) => setZoomLink(e.target.value)}
                  placeholder="https://zoom.us/j/..."
                />
              </div>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
              {isSubmitting ? "Scheduling..." : "Schedule Session"}
            </Button>
          </form>
        </Card>

        {/* Upcoming Sessions */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Upcoming Sessions ({upcomingSessions.length})</h2>
          {upcomingSessions.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">
              No upcoming sessions scheduled
            </Card>
          ) : (
            <div className="grid gap-4">
              {upcomingSessions.map((session: any) => (
                <Card key={session.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">{session.title}</h3>
                      <p className="text-muted-foreground mb-4">{session.description}</p>
                      
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span>{formatDateTime(session.sessionDate)}</span>
                        </div>
                        
                        {session.zoomLink && (
                          <div className="flex items-center gap-2">
                            <LinkIcon className="h-4 w-4 text-primary" />
                            <a
                              href={session.zoomLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              Zoom Link
                            </a>
                          </div>
                        )}
                        
                        {session.videoUrl && (
                          <div className="flex items-center gap-2">
                            <Video className="h-4 w-4 text-primary" />
                            <a
                              href={session.videoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              Recording
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteSession(session.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Past Sessions */}
        <div>
          <h2 className="text-2xl font-semibold mb-6">Past Sessions ({pastSessions.length})</h2>
          {pastSessions.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">
              No past sessions
            </Card>
          ) : (
            <div className="grid gap-4">
              {pastSessions.map((session: any) => (
                <Card key={session.id} className="p-6 opacity-75">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">{session.title}</h3>
                      <p className="text-muted-foreground mb-4">{session.description}</p>
                      
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDateTime(session.sessionDate)}</span>
                        </div>
                        
                        {session.videoUrl && (
                          <div className="flex items-center gap-2">
                            <Video className="h-4 w-4" />
                            <a
                              href={session.videoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              Watch Recording
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteSession(session.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
