import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Download, FileText, Loader2, Video } from "lucide-react";

export default function Lectures() {
  const { data: lectures, isLoading } = trpc.lectures.list.useQuery();

  const extractYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };

  const getFileIcon = (mimeType: string | null) => {
    if (!mimeType) return <FileText className="h-6 w-6" />;
    if (mimeType.startsWith("video/")) return <Video className="h-6 w-6" />;
    return <FileText className="h-6 w-6" />;
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
              Lecture Library
            </h1>
            <p className="text-xl text-primary-foreground/80">
              Access our collection of educational videos, slides, recordings, and supplementary resources.
            </p>
          </div>
        </div>
      </section>

      {/* Lectures Grid */}
      <section className="py-16">
        <div className="container">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : lectures && lectures.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No lectures available yet</h3>
                <p className="text-muted-foreground">Check back soon for new content</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lectures?.map((lecture) => {
                const youtubeId = lecture.videoUrl ? extractYouTubeId(lecture.videoUrl) : null;
                return (
                  <Card key={lecture.id} className="hover:shadow-lg transition-shadow flex flex-col">
                    <CardHeader>
                      {youtubeId ? (
                        <div className="mb-4 aspect-video rounded-lg overflow-hidden">
                          <iframe
                            src={`https://www.youtube.com/embed/${youtubeId}`}
                            title={lecture.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full"
                          />
                        </div>
                      ) : (
                        lecture.mimeType && (
                          <div className="flex items-start gap-3 mb-2">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                              {getFileIcon(lecture.mimeType)}
                            </div>
                          </div>
                        )
                      )}
                      <CardTitle className="line-clamp-2 text-lg">{lecture.title}</CardTitle>
                      <CardDescription className="line-clamp-3">
                        {lecture.description || "Educational resource"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-end">
                      <div className="space-y-2 text-sm text-muted-foreground mb-4">
                        {youtubeId && <div>Type: YouTube Video</div>}
                        {lecture.fileName && <div>Format: {lecture.fileName.split(".").pop()?.toUpperCase()}</div>}
                        {lecture.fileSize && <div>Size: {(lecture.fileSize / 1024 / 1024).toFixed(2)} MB</div>}
                        <div>Added: {new Date(lecture.createdAt).toLocaleDateString()}</div>
                      </div>
                      <div className="flex gap-2">
                        {lecture.videoUrl && (
                          <Button asChild className="flex-1">
                            <a href={lecture.videoUrl} target="_blank" rel="noopener noreferrer">
                              <Video className="mr-2 h-4 w-4" />
                              Watch on YouTube
                            </a>
                          </Button>
                        )}
                        {lecture.fileUrl && (
                          <Button asChild className="flex-1" variant={lecture.videoUrl ? "outline" : "default"}>
                            <a href={lecture.fileUrl} target="_blank" rel="noopener noreferrer">
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
