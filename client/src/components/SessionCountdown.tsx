import { useEffect, useState } from "react";
import { Calendar, Clock } from "lucide-react";

interface SessionCountdownProps {
  sessionDate: Date | string;
  title: string;
}

export default function SessionCountdown({ sessionDate, title }: SessionCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = new Date(sessionDate).getTime();
      const difference = target - now;

      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      return null;
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [sessionDate]);

  if (!timeLeft) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Session has started or ended</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-8 border border-primary/20">
      <div className="flex items-center justify-center gap-2 mb-4">
        <Clock className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Next Session</h3>
      </div>
      
      <p className="text-center text-muted-foreground mb-6">{title}</p>
      
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-4xl font-bold text-primary mb-1">
            {timeLeft.days}
          </div>
          <div className="text-sm text-muted-foreground">Days</div>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold text-primary mb-1">
            {timeLeft.hours}
          </div>
          <div className="text-sm text-muted-foreground">Hours</div>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold text-primary mb-1">
            {timeLeft.minutes}
          </div>
          <div className="text-sm text-muted-foreground">Minutes</div>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold text-primary mb-1">
            {timeLeft.seconds}
          </div>
          <div className="text-sm text-muted-foreground">Seconds</div>
        </div>
      </div>
      
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Calendar className="h-4 w-4" />
        <span>
          {new Date(sessionDate).toLocaleString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
}
