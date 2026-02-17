"use client";

import {
  Calendar,
  dateFnsLocalizer,
  type ToolbarProps,
} from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useEffect, useState } from "react";
import {
  format,
  parse,
  startOfWeek,
  getDay,
  addMonths,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import { enUS } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/dist/client/components/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getCalendarData } from "@/lib/api/rentals";

const locales = { "en-US": enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  isMore?: boolean;
  dateKey: string;
  rentalId?: string;
};

type CalendarBooking = {
  label: string;
  rentalId: string;
};

type CalendarDayData = {
  date: string;
  bookings: CalendarBooking[];
  moreCount: number;
};

function CustomToolbar(toolbar: ToolbarProps<CalendarEvent>) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="brand"
          onClick={() =>
            toolbar.onNavigate("DATE", addMonths(toolbar.date, -1))
          }
          className="rounded-md border border-gray-300 px-3 py-1 text-sm font-medium text-gray-700 cursor-pointer"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="brand"
          onClick={() => toolbar.onNavigate("TODAY")}
          className="rounded-md border border-gray-300 px-3 py-1 text-sm font-medium text-gray-700 cursor-pointer"
        >
          Today
        </Button>
        <Button
          type="button"
          variant="brand"
          onClick={() => toolbar.onNavigate("DATE", addMonths(toolbar.date, 1))}
          className="rounded-md border border-gray-300 px-3 py-1 text-sm font-medium text-gray-700 cursor-pointer"
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <h2 className="text-xl font-semibold text-gray-900">{toolbar.label}</h2>
    </div>
  );
}

export default function CalendarPage() {
  const [calendarData, setCalendarData] = useState<CalendarDayData[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarHeight, setCalendarHeight] = useState(760);
  const router = useRouter();

  useEffect(() => {
    const fetchEvents = async () => {
      const monthStart = format(startOfMonth(currentDate), "yyyy-MM-dd");
      const monthEnd = format(endOfMonth(currentDate), "yyyy-MM-dd");
      const res = await getCalendarData(monthStart, monthEnd);

      setCalendarData(res.data);

      const transformed: CalendarEvent[] = [];

      res.data.forEach((day: CalendarDayData) => {
        const date = new Date(day.date);

        day.bookings.slice(0, 3).forEach((booking, index) => {
          transformed.push({
            id: `${day.date}-${index}`,
            title: booking.label,
            start: date,
            end: date,
            dateKey: day.date,
            rentalId: booking.rentalId,
          });
        });

        if (day.moreCount > 0) {
          transformed.push({
            id: `${day.date}-more`,
            title: `+${day.moreCount} more`,
            start: date,
            end: date,
            isMore: true,
            dateKey: day.date,
          });
        }
      });

      setEvents(transformed);
    };

    fetchEvents();
  }, [currentDate]);

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <Calendar
        onSelectEvent={(event) => {
          if (event.isMore) {
            setSelectedDate(event.dateKey);
          } else if (event.rentalId) {
            router.push(`/protected/rentals/${event.rentalId}`);
          }
        }}
        localizer={localizer}
        events={events}
        components={{ toolbar: CustomToolbar }}
        eventPropGetter={(event) =>
          event.title.startsWith("+")
            ? {
                style: {
                  backgroundColor: "transparent",
                  border: "none",
                  color: "#3174ad",
                  padding: 0,
                },
              }
            : {}
        }
        date={currentDate}
        onNavigate={(date) => setCurrentDate(date)}
        onRangeChange={(range) => {
          const visibleDays = Array.isArray(range)
            ? range.length
            : range?.start && range?.end
              ? Math.ceil(
                  (range.end.getTime() - range.start.getTime()) /
                    (1000 * 60 * 60 * 24) +
                    1,
                )
              : 35;
          const weekCount = Math.max(
            4,
            Math.min(6, Math.ceil(visibleDays / 7)),
          );

          // Keep date cells readable even in 6-week months.
          setCalendarHeight(140 + weekCount * 120);
        }}
        startAccessor="start"
        endAccessor="end"
        views={["month"]}
        defaultView="month"
        style={{ height: calendarHeight }}
        popup={false}
      />

      <Dialog open={!!selectedDate} onOpenChange={() => setSelectedDate(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bookings on {selectedDate}</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 mt-4">
            {calendarData
              .find((d) => d.date === selectedDate)
              ?.bookings.map((booking) => (
                <div
                  key={booking.rentalId}
                  onClick={() => {
                    setSelectedDate(null);
                    router.push(`/protected/rentals/${booking.rentalId}`);
                  }}
                  className="cursor-pointer rounded-lg border p-3 hover:bg-[#17cf91]/10 transition"
                >
                  {booking.label}
                </div>
              ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
