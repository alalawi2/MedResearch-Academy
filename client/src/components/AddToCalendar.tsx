import { Button } from "@/components/ui/button";
import { Calendar, Download } from "lucide-react";
import { createEvent, EventAttributes } from "ics";
import { toast } from "sonner";

interface AddToCalendarProps {
  title: string;
  description?: string;
  location?: string;
  startDate: Date | string;
  duration?: number; // in minutes, default 60
}

export default function AddToCalendar({
  title,
  description,
  location,
  startDate,
  duration = 60,
}: AddToCalendarProps) {
  const handleAddToCalendar = () => {
    const start = new Date(startDate);
    const event: EventAttributes = {
      start: [
        start.getFullYear(),
        start.getMonth() + 1,
        start.getDate(),
        start.getHours(),
        start.getMinutes(),
      ],
      duration: { minutes: duration },
      title,
      description,
      location,
      status: "CONFIRMED",
      busyStatus: "BUSY",
    };

    createEvent(event, (error, value) => {
      if (error) {
        console.error(error);
        toast.error("Failed to create calendar event");
        return;
      }

      // Create a blob and download it
      const blob = new Blob([value], { type: "text/calendar;charset=utf-8" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.setAttribute("download", `${title.replace(/[^a-z0-9]/gi, "_")}.ics`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Calendar event downloaded! Open it to add to your calendar.");
    });
  };

  const handleGoogleCalendar = () => {
    const start = new Date(startDate);
    const end = new Date(start.getTime() + duration * 60000);
    
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/-|:|\.\d\d\d/g, "");
    };

    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: title,
      dates: `${formatDate(start)}/${formatDate(end)}`,
      details: description || "",
      location: location || "",
    });

    window.open(`https://calendar.google.com/calendar/render?${params.toString()}`, "_blank");
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={handleGoogleCalendar} variant="outline" size="sm">
        <Calendar className="h-4 w-4 mr-2" />
        Google Calendar
      </Button>
      <Button onClick={handleAddToCalendar} variant="outline" size="sm">
        <Download className="h-4 w-4 mr-2" />
        Download .ics
      </Button>
    </div>
  );
}
