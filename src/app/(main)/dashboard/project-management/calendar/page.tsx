"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCalendarEvents } from "@/hooks/use-dashboard";
import type { CalendarEvent } from "@/hooks/use-dashboard";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, FolderOpen, CheckSquare } from "lucide-react";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const startOfMonth = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const endOfMonth = `${year}-${String(month + 1).padStart(2, "0")}-${getDaysInMonth(year, month)}`;

  const { data: events = [], isLoading } = useCalendarEvents({ start: startOfMonth, end: endOfMonth });

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => setCurrentDate(new Date());

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    for (const ev of events) {
      const start = new Date(ev.start);
      const end = new Date(ev.end || ev.start);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const key = d.toISOString().split("T")[0];
        if (!map[key]) map[key] = [];
        if (!map[key].find((e) => e.id === ev.id)) {
          map[key].push(ev);
        }
      }
    }
    return map;
  }, [events]);

  const today = new Date().toISOString().split("T")[0];

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const selectedEvents = selectedDate ? eventsByDate[selectedDate] || [] : [];

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground">Project timelines and task deadlines</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Calendar Grid */}
        <Card className="lg:col-span-2 border-none bg-white/50 backdrop-blur-md dark:bg-slate-900/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {MONTHS[month]} {year}
              </CardTitle>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={prevMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={goToday}>
                  Today
                </Button>
                <Button variant="ghost" size="sm" onClick={nextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-px">
              {DAYS.map((d) => (
                <div key={d} className="p-2 text-center text-xs font-medium text-muted-foreground">
                  {d}
                </div>
              ))}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-[80px] p-1" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const dayEvents = eventsByDate[dateStr] || [];
                const isToday = dateStr === today;
                const isSelected = dateStr === selectedDate;

                return (
                  <button
                    key={day}
                    className={`min-h-[80px] rounded-md border p-1 text-left transition-colors hover:bg-muted/50 ${
                      isToday ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20" : "border-transparent"
                    } ${isSelected ? "ring-2 ring-blue-500" : ""}`}
                    onClick={() => setSelectedDate(dateStr)}
                  >
                    <span className={`text-xs font-medium ${isToday ? "text-blue-600 dark:text-blue-400" : ""}`}>
                      {day}
                    </span>
                    <div className="mt-1 space-y-0.5">
                      {dayEvents.slice(0, 3).map((ev) => (
                        <div
                          key={ev.id}
                          className={`truncate rounded px-1 text-[10px] leading-tight ${
                            ev.type === "project"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                              : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          }`}
                        >
                          {ev.title}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <p className="text-[10px] text-muted-foreground">+{dayEvents.length - 3} more</p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Sidebar - Selected Day Events */}
        <Card className="border-none bg-white/50 backdrop-blur-md dark:bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              {selectedDate
                ? new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })
                : "Select a date"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                {selectedDate ? "No events on this date" : "Click a date to view events"}
              </p>
            ) : (
              <div className="space-y-3">
                {selectedEvents.map((ev) => (
                  <div key={ev.id} className="rounded-lg border p-3 space-y-1">
                    <div className="flex items-center gap-2">
                      {ev.type === "project" ? (
                        <FolderOpen className="h-4 w-4 text-blue-500" />
                      ) : (
                        <CheckSquare className="h-4 w-4 text-green-500" />
                      )}
                      <span className="text-sm font-medium">{ev.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {ev.type}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {ev.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(ev.start).toLocaleDateString()} — {new Date(ev.end).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
