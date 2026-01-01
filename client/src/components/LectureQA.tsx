import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Loader2, MessageSquare, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface LectureQAProps {
  lectureId: number;
}

export function LectureQA({ lectureId }: LectureQAProps) {
  const { user } = useAuth();
  const [question, setQuestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: questions, isLoading, refetch } = trpc.questions.listByLecture.useQuery({ lectureId });
  const askMutation = trpc.questions.ask.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Please sign in to ask a question");
      return;
    }

    if (question.length < 10) {
      toast.error("Question must be at least 10 characters long");
      return;
    }

    setIsSubmitting(true);
    try {
      await askMutation.mutateAsync({
        lectureId,
        question,
      });
      toast.success("Your question has been submitted and will be reviewed by our team");
      setQuestion("");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to submit question");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-serif font-bold mb-2">Questions & Answers</h3>
        <p className="text-muted-foreground">
          Ask questions about this lecture and get answers from our instructors
        </p>
      </div>

      {/* Ask Question Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ask a Question</CardTitle>
          <CardDescription>
            {user
              ? "Your question will be reviewed before being published"
              : "Sign in to ask a question"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What would you like to know about this lecture?"
              rows={4}
              disabled={!user || isSubmitting}
            />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {question.length < 10 ? `${10 - question.length} more characters needed` : "Ready to submit"}
              </span>
              <Button type="submit" disabled={!user || isSubmitting || question.length < 10}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit Question
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Questions List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : questions && questions.length > 0 ? (
          questions.map((q) => (
            <Card key={q.id}>
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{q.userName}</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(q.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-foreground">{q.question}</p>
                  </div>
                </div>
              </CardHeader>
              {q.answer && (
                <CardContent>
                  <div className="pl-12 border-l-2 border-primary/20 ml-2">
                    <div className="pl-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-semibold text-primary">Instructor Response</span>
                        {q.answeredAt && (
                          <span className="text-xs text-muted-foreground">
                            {new Date(q.answeredAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <p className="text-muted-foreground">{q.answer}</p>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground text-center">
                No questions yet. Be the first to ask!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
