import Layout from "@/components/Layout";
import { LectureQA } from "@/components/LectureQA";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Download, Loader2 } from "lucide-react";
import { useParams } from "wouter";

export default function LectureDetail() {
  const params = useParams();
  const lectureId = parseInt(params.id || "0");
  
  const { data: lectures, isLoading } = trpc.lectures.list.useQuery();
  const lecture = lectures?.find((l) => l.id === lectureId);

  const extractYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!lecture) {
    return (
      <Layout>
        <div className="container py-16">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <h2 className="text-2xl font-bold mb-2">Lecture Not Found</h2>
              <p className="text-muted-foreground mb-4">The lecture you're looking for doesn't exist</p>
              <Button asChild>
                <a href="/lectures">Back to Lectures</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const youtubeId = lecture.videoUrl ? extractYouTubeId(lecture.videoUrl) : null;

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-12">
        <div className="container">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-serif font-bold mb-4">
              {lecture.title}
            </h1>
            {lecture.description && (
              <p className="text-lg text-primary-foreground/80">
                {lecture.description}
              </p>
            )}
            <div className="flex gap-4 mt-6 text-sm text-primary-foreground/70">
              <span>Added: {new Date(lecture.createdAt).toLocaleDateString()}</span>
              {lecture.fileSize && (
                <span>Size: {(lecture.fileSize / 1024 / 1024).toFixed(2)} MB</span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12">
        <div className="container max-w-5xl">
          <div className="space-y-8">
            {/* Video Player */}
            {youtubeId && (
              <div className="aspect-video rounded-lg overflow-hidden shadow-lg">
                <iframe
                  src={`https://www.youtube.com/embed/${youtubeId}`}
                  title={lecture.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            )}

            {/* Download Button */}
            {lecture.fileUrl && (
              <Card>
                <CardContent className="flex items-center justify-between p-6">
                  <div>
                    <h3 className="font-semibold mb-1">Download Lecture Materials</h3>
                    <p className="text-sm text-muted-foreground">
                      {lecture.fileName} • {lecture.fileSize ? `${(lecture.fileSize / 1024 / 1024).toFixed(2)} MB` : ""}
                    </p>
                  </div>
                  <Button asChild>
                    <a href={lecture.fileUrl} target="_blank" rel="noopener noreferrer">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </a>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Q&A Section */}
            <LectureQA lectureId={lecture.id} />
          </div>
        </div>
      </section>
    </Layout>
  );
}
