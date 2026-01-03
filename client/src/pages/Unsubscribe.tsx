import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Unsubscribe() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<"loading" | "success" | "error" | "already">("loading");
  const [message, setMessage] = useState("");
  const unsubscribeMutation = trpc.unsubscribe.unsubscribe.useMutation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const email = params.get("email");

    if (!id || !email) {
      setStatus("error");
      setMessage("Invalid unsubscribe link. Please check the link from your email.");
      return;
    }

    // Call unsubscribe API via tRPC
    unsubscribeMutation.mutate(
      {
        reminderId: parseInt(id),
        email: decodeURIComponent(email),
      },
      {
        onSuccess: (data) => {
          if (data.success) {
            if (data.message === "Already unsubscribed") {
              setStatus("already");
              setMessage("You have already unsubscribed from these reminders.");
            } else {
              setStatus("success");
              setMessage("You have been successfully unsubscribed from session reminders.");
            }
          } else {
            setStatus("error");
            setMessage(data.message || "Failed to unsubscribe. Please try again.");
          }
        },
        onError: () => {
          setStatus("error");
          setMessage("An error occurred. Please try again later.");
        },
      }
    );
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center">
        {status === "loading" && (
          <>
            <Loader2 className="w-16 h-16 mx-auto mb-4 text-blue-500 animate-spin" />
            <h1 className="text-2xl font-bold mb-2">Processing...</h1>
            <p className="text-muted-foreground">Please wait while we unsubscribe you from reminders.</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-500" />
            <h1 className="text-2xl font-bold mb-2">Unsubscribed Successfully</h1>
            <p className="text-muted-foreground mb-6">{message}</p>
            <p className="text-sm text-muted-foreground mb-6">
              You will no longer receive email reminders for this session. You can always subscribe again from the Programs page.
            </p>
            <Button onClick={() => setLocation("/programs")} className="w-full">
              View Programs
            </Button>
          </>
        )}

        {status === "already" && (
          <>
            <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-blue-500" />
            <h1 className="text-2xl font-bold mb-2">Already Unsubscribed</h1>
            <p className="text-muted-foreground mb-6">{message}</p>
            <Button onClick={() => setLocation("/programs")} className="w-full">
              View Programs
            </Button>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h1 className="text-2xl font-bold mb-2">Unsubscribe Failed</h1>
            <p className="text-muted-foreground mb-6">{message}</p>
            <div className="space-y-2">
              <Button onClick={() => setLocation("/programs")} className="w-full">
                View Programs
              </Button>
              <Button onClick={() => setLocation("/")} variant="outline" className="w-full">
                Go Home
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
