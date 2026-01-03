import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bell, Check } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface ReminderDialogProps {
  lectureId: number;
  sessionTitle: string;
}

export default function ReminderDialog({ lectureId, sessionTitle }: ReminderDialogProps) {
  const [email, setEmail] = useState("");
  const [open, setOpen] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const subscribeMutation = trpc.sessions.subscribeReminder.useMutation({
    onSuccess: () => {
      setSubscribed(true);
      toast.success("Reminder set!", {
        description: "You'll receive email reminders 24 hours and 1 hour before the session.",
      });
      setTimeout(() => {
        setOpen(false);
        setEmail("");
        setSubscribed(false);
      }, 2000);
    },
    onError: (error) => {
      toast.error("Failed to set reminder", {
        description: error.message,
      });
    },
  });

  const handleSubscribe = () => {
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    subscribeMutation.mutate({ lectureId, email });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="gap-2 border-accent/30 hover:bg-accent/10"
        >
          <Bell className="h-4 w-4" />
          Get Reminder
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-accent" />
            Session Reminder
          </DialogTitle>
          <DialogDescription>
            Get email reminders for <span className="font-semibold">{sessionTitle}</span>
          </DialogDescription>
        </DialogHeader>
        
        {!subscribed ? (
          <>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSubscribe();
                    }
                  }}
                />
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  24-hour advance reminder
                </p>
                <p className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  1-hour advance reminder
                </p>
                <p className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  Session details and Zoom link
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button 
                onClick={handleSubscribe} 
                disabled={subscribeMutation.isPending}
                className="w-full"
              >
                {subscribeMutation.isPending ? "Setting up..." : "Set Reminder"}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="py-8 text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-lg font-semibold mb-2">All set!</p>
            <p className="text-sm text-muted-foreground">
              You'll receive reminders at {email}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
