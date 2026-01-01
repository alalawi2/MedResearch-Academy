import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Loader2, MessageSquare, Send, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";

export default function AdminQuestions() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState<Record<number, boolean>>({});

  const { data: questions, isLoading, refetch } = trpc.questions.listAll.useQuery();
  const answerMutation = trpc.questions.answer.useMutation();
  const deleteMutation = trpc.questions.delete.useMutation();

  if (!isAdmin) {
    return (
      <div className="container py-12">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">Access denied. Admin only.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleAnswer = async (questionId: number, lectureId: number) => {
    const answer = answers[questionId];
    if (!answer || answer.length < 10) {
      toast.error("Answer must be at least 10 characters long");
      return;
    }

    setSubmitting({ ...submitting, [questionId]: true });
    try {
      await answerMutation.mutateAsync({
        questionId,
        answer,
      });
      toast.success("Answer published successfully");
      setAnswers({ ...answers, [questionId]: "" });
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to publish answer");
    } finally {
      setSubmitting({ ...submitting, [questionId]: false });
    }
  };

  const handleDelete = async (questionId: number) => {
    if (!confirm("Are you sure you want to delete this question?")) return;

    try {
      await deleteMutation.mutateAsync({ questionId });
      toast.success("Question deleted");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete question");
    }
  };

  const unansweredQuestions = questions?.filter(q => !q.answer) || [];
  const answeredQuestions = questions?.filter(q => q.answer) || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold mb-2">Manage Questions</h1>
          <p className="text-muted-foreground">
            Review and answer student questions. Only answered questions will be visible to the public.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Unanswered Questions */}
            <div>
              <h2 className="text-2xl font-serif font-bold mb-4">
                Pending Questions ({unansweredQuestions.length})
              </h2>
              {unansweredQuestions.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No pending questions</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {unansweredQuestions.map((q) => (
                    <Card key={q.id} className="border-l-4 border-l-yellow-500">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg mb-1">
                              <Link href={`/lectures/${q.lectureId}`} className="hover:underline">
                                {q.lectureTitle}
                              </Link>
                            </CardTitle>
                            <CardDescription>
                              Asked by {q.userName} on {new Date(q.createdAt).toLocaleDateString()}
                            </CardDescription>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(q.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 bg-muted rounded-lg">
                          <p className="font-medium mb-1">Question:</p>
                          <p>{q.question}</p>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Your Answer:</label>
                          <Textarea
                            value={answers[q.id] || ""}
                            onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                            placeholder="Type your answer here..."
                            rows={4}
                          />
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">
                              {(answers[q.id]?.length || 0) < 10
                                ? `${10 - (answers[q.id]?.length || 0)} more characters needed`
                                : "Ready to publish"}
                            </span>
                            <Button
                              onClick={() => handleAnswer(q.id, q.lectureId)}
                              disabled={submitting[q.id] || (answers[q.id]?.length || 0) < 10}
                            >
                              {submitting[q.id] ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Publishing...
                                </>
                              ) : (
                                <>
                                  <Send className="mr-2 h-4 w-4" />
                                  Publish Answer
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Answered Questions */}
            <div>
              <h2 className="text-2xl font-serif font-bold mb-4">
                Published Q&A ({answeredQuestions.length})
              </h2>
              {answeredQuestions.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No published Q&A yet</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {answeredQuestions.map((q) => (
                    <Card key={q.id} className="border-l-4 border-l-green-500">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg mb-1">
                              <Link href={`/lectures/${q.lectureId}`} className="hover:underline">
                                {q.lectureTitle}
                              </Link>
                            </CardTitle>
                            <CardDescription>
                              Asked by {q.userName} on {new Date(q.createdAt).toLocaleDateString()}
                            </CardDescription>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(q.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 bg-muted rounded-lg">
                          <p className="font-medium mb-1">Question:</p>
                          <p>{q.question}</p>
                        </div>
                        <div className="p-4 bg-primary/5 rounded-lg border-l-2 border-primary">
                          <p className="font-medium mb-1 text-primary">Your Answer:</p>
                          <p>{q.answer}</p>
                          {q.answeredAt && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Published on {new Date(q.answeredAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
