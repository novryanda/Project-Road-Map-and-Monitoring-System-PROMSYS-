"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCalendarEvents } from "@/hooks/use-dashboard";
import type { CalendarEvent } from "@/hooks/use-dashboard";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, FolderOpen, CheckSquare, Clock, Search, Filter, LayoutGrid, List } from "lucide-react";
import { TaskDetailDrawer } from "@/components/tasks/task-detail-drawer";
import { useProjects } from "@/hooks/use-projects";
import { toast } from "sonner";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const EVENT_COLORS: Record<string, string> = {
  ACTIVE: "bg-green-500",
  PLANNING: "bg-blue-500",
  ON_HOLD: "bg-orange-500",
  COMPLETED: "bg-emerald-500",
  CANCELLED: "bg-slate-400",
  TODO: "bg-slate-400",
  IN_PROGRESS: "bg-blue-500",
  SUBMITTED: "bg-purple-500",
  REVISION: "bg-yellow-500",
  DONE: "bg-green-500",
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"grid" | "timeline">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterProject, setFilterProject] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const startOfMonth = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const endOfMonth = `${year}-${String(month + 1).padStart(2, "0")}-${getDaysInMonth(year, month)}`;

  const { data: eventsRes = [], isLoading } = useCalendarEvents({ start: startOfMonth, end: endOfMonth });
  const { data: projectsRes } = useProjects(1, 100);
  const projects = projectsRes?.data || [];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDate(now.toISOString().split("T")[0]);
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  // Filter events
  const filteredEvents = useMemo(() => {
    return eventsRes.filter(ev => {
      const matchesSearch = ev.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesProject = filterProject === "all" || ev.projectId === filterProject;
      const matchesStatus = filterStatus === "all" || ev.status === filterStatus;
      const matchesType = filterType === "all" || ev.type === filterType;
      return matchesSearch && matchesProject && matchesStatus && matchesType;
    });
  }, [eventsRes, searchQuery, filterProject, filterStatus, filterType]);

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    for (const ev of filteredEvents) {
      const start = new Date(ev.start);
      const end = new Date(ev.end || ev.start);
      const d = new Date(start);
      d.setHours(0, 0, 0, 0);

      const endLimit = new Date(end);
      endLimit.setHours(0, 0, 0, 0);

      while (d <= endLimit) {
        const key = d.toISOString().split("T")[0];
        if (!map[key]) map[key] = [];
        if (!map[key].find((e) => e.id === ev.id)) {
          map[key].push(ev);
        }
        d.setDate(d.getDate() + 1);
      }
    }
    return map;
  }, [filteredEvents]);

  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const selectedDayEvents = selectedDate ? eventsByDate[selectedDate] || [] : [];

  const buttonLabel = useMemo(() => {
    if (!selectedDate) return "Today";
    const nowStr = new Date().toISOString().split("T")[0];
    if (selectedDate === nowStr) return "Today";

    const d = new Date(selectedDate + "T00:00:00");
    return d.toLocaleDateString("id-ID", { day: 'numeric', month: 'short' });
  }, [selectedDate]);

  const handleEventClick = (ev: CalendarEvent) => {
    if (ev.type === "task") {
      setSelectedTaskId(ev.id);
      setDetailOpen(true);
    } else {
      // For projects, we could navigate or show project details
      toast.info(`Project: ${ev.title}`);
    }
  };

  return (
    <div className="flex flex-col gap-8 p-6 md:p-10 bg-slate-50/50 min-h-screen">
      {/* Header & Controls */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Project Calendar</h1>
            <p className="text-sm text-slate-500 font-medium uppercase tracking-wider mt-1">Master timeline and task management</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-white border rounded-full p-1 shadow-sm">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="sm"
                className="rounded-full h-8 px-3 gap-2 text-xs font-bold transition-all"
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="h-3.5 w-3.5" /> Grid
              </Button>
              <Button
                variant={viewMode === 'timeline' ? 'secondary' : 'ghost'}
                size="sm"
                className="rounded-full h-8 px-3 gap-2 text-xs font-bold transition-all"
                onClick={() => setViewMode('timeline')}
              >
                <List className="h-3.5 w-3.5" /> Timeline
              </Button>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-4 bg-white/40 p-2 rounded-2xl border border-white/60 backdrop-blur-sm">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search events..."
              className="pl-9 h-10 bg-white border-slate-200 rounded-xl focus-visible:ring-blue-500/20 transition-all font-medium text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="h-6 w-px bg-slate-200 hidden md:block" />

          <div className="flex items-center gap-3 flex-wrap">
            <Select value={filterProject} onValueChange={setFilterProject}>
              <SelectTrigger className="h-10 w-[160px] bg-white rounded-xl border-slate-200 text-xs font-bold uppercase tracking-wider">
                <SelectValue placeholder="Project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="h-10 w-[120px] bg-white rounded-xl border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-600">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="project">Projects</SelectItem>
                <SelectItem value="task">Tasks</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="h-10 w-[120px] bg-white rounded-xl border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-600">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="PLANNING">Planning</SelectItem>
                <SelectItem value="ON_HOLD">On Hold</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="TODO">To Do</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="SUBMITTED">Submitted</SelectItem>
                <SelectItem value="REVISION">Revision</SelectItem>
                <SelectItem value="DONE">Done</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="ghost" size="sm" className="h-10 px-4 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-900" onClick={() => {
              setSearchQuery("");
              setFilterProject("all");
              setFilterStatus("all");
              setFilterType("all");
            }}>
              Reset
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4 items-start">
        {/* Calendar Grid Container */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white/80 backdrop-blur-xl overflow-hidden rounded-3xl">
            <CardHeader className="p-0 border-b border-slate-100 pb-0">
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-black text-slate-900 tabular-nums">
                    {MONTHS[month]} {year}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-slate-100" onClick={prevMonth}>
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-full px-5 font-bold border-slate-200 h-9 transition-all duration-300 min-w-[80px]" onClick={goToday}>
                    {buttonLabel}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-slate-100" onClick={nextMonth}>
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              {viewMode === 'grid' && (
                <div className="grid grid-cols-7 bg-slate-50/50">
                  {DAYS.map((d) => (
                    <div key={d} className="py-3 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                      {d}
                    </div>
                  ))}
                </div>
              )}
            </CardHeader>
            <CardContent className="p-0">
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-7 auto-rows-fr">
                  {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} className="min-h-[140px] bg-slate-50/10 border-r border-b border-slate-50" />
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
                        className={`group min-h-[140px] p-3 text-left transition-all relative border-r border-b border-slate-50 hover:bg-blue-50/20
                                    ${isSelected ? "bg-blue-50/40 ring-2 ring-inset ring-blue-500/10 z-10" : "bg-white"}
                                    `}
                        onClick={() => setSelectedDate(dateStr)}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className={`text-sm font-black tabular-nums transition-all 
                                        ${isToday ? "h-8 w-8 flex items-center justify-center bg-blue-600 text-white rounded-full shadow-lg shadow-blue-500/40 scale-110" :
                              isSelected ? "text-blue-600" : "text-slate-400 group-hover:text-slate-900"}
                                    `}>
                            {day}
                          </span>
                          {dayEvents.length > 0 && (
                            <Badge variant="secondary" className="h-5 min-w-[20px] px-1 shadow-none bg-slate-100 text-[10px] font-bold">
                              {dayEvents.length}
                            </Badge>
                          )}
                        </div>

                        <div className="space-y-1.5 overflow-hidden">
                          {dayEvents.slice(0, 4).map((ev) => (
                            <div
                              key={ev.id}
                              className="flex items-center gap-1.5 group/ev hover:translate-x-0.5 transition-transform"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEventClick(ev);
                              }}
                            >
                              <div className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${EVENT_COLORS[ev.status] || "bg-slate-300"}`} />
                              <span className="text-[10px] font-bold text-slate-600 truncate leading-none group-hover/ev:text-blue-600">
                                {ev.title}
                              </span>
                            </div>
                          ))}
                          {dayEvents.length > 4 && (
                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-tight pl-3 pt-1">
                              +{dayEvents.length - 4} items
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <div className="min-w-[1000px]">
                    {/* Timeline Header - Days */}
                    <div className="grid grid-cols-[200px_1fr] border-b border-slate-100 bg-slate-50/50">
                      <div className="p-4 border-r border-slate-100">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Project / Task</span>
                      </div>
                      <div className="grid" style={{ gridTemplateColumns: `repeat(${daysInMonth}, 1fr)` }}>
                        {Array.from({ length: daysInMonth }).map((_, i) => (
                          <div key={i} className={`py-4 text-center text-[10px] font-bold border-r border-slate-100/50 flex flex-col items-center gap-1
                                    ${(i + 1) === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear() ? "bg-blue-50/50" : ""}
                                `}>
                            <span className="text-slate-400">{DAYS[(new Date(year, month, i + 1)).getDay()].slice(0, 1)}</span>
                            <span className={i + 1 === new Date().getDate() ? "h-5 w-5 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-sm" : "text-slate-600"}>
                              {i + 1}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Timeline Rows */}
                    <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto scrollbar-hide">
                      {filteredEvents.length === 0 ? (
                        <div className="py-20 text-center text-slate-400 italic text-sm">
                          No events to display in timeline.
                        </div>
                      ) : (
                        filteredEvents.map((ev) => {
                          const start = new Date(ev.start);
                          const end = new Date(ev.end || ev.start);

                          // Calculate position
                          const startDay = start.getMonth() === month ? start.getDate() : 1;
                          const endDay = end.getMonth() === month ? end.getDate() : daysInMonth;

                          // Adjust for months outside current view
                          const isVisible = (start.getMonth() <= month && end.getMonth() >= month) ||
                            (start.getFullYear() < year && end.getFullYear() >= year) ||
                            (start.getFullYear() === year && end.getFullYear() > year);

                          if (!isVisible) return null;

                          const startIndex = Math.max(1, startDay);
                          const span = Math.max(1, endDay - startIndex + 1);

                          return (
                            <div key={ev.id} className="grid grid-cols-[200px_1fr] hover:bg-slate-50/30 transition-colors group">
                              <div className="p-4 border-r border-slate-100 flex flex-col gap-1 overflow-hidden">
                                <span className="text-[11px] font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors cursor-pointer" onClick={() => handleEventClick(ev)}>
                                  {ev.title}
                                </span>
                                <Badge variant="outline" className="w-fit text-[8px] font-black px-1.5 h-4 uppercase tracking-tighter opacity-60">
                                  {ev.type}
                                </Badge>
                              </div>
                              <div className="relative h-14" style={{ gridTemplateColumns: `repeat(${daysInMonth}, 1fr)` }}>
                                {/* Grid Background Lines */}
                                <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${daysInMonth}, 1fr)` }}>
                                  {Array.from({ length: daysInMonth }).map((_, i) => (
                                    <div key={i} className="border-r border-slate-50" />
                                  ))}
                                </div>

                                {/* Event Bar */}
                                <div
                                  className={`absolute top-1/2 -translate-y-1/2 h-6 rounded-lg shadow-sm flex items-center px-3 cursor-pointer hover:shadow-md transition-all z-10
                                                    ${EVENT_COLORS[ev.status] || "bg-slate-400"}
                                                    ${ev.type === 'project' ? 'h-8 opacity-100 ring-2 ring-white/20' : 'h-6 opacity-90'}
                                                `}
                                  style={{
                                    left: `${((startIndex - 1) / daysInMonth) * 100}%`,
                                    width: `${(span / daysInMonth) * 100}%`,
                                  }}
                                  onClick={() => handleEventClick(ev)}
                                >
                                  <span className="text-[9px] font-black text-white truncate drop-shadow-sm uppercase tracking-wide">
                                    {ev.title}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Detail Feed */}
        <div className="space-y-6">
          <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-slate-50/40 border-b border-slate-100 py-6">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-800 flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-white shadow-sm flex items-center justify-center text-blue-600">
                  <CalendarIcon className="h-5 w-5" />
                </div>
                {selectedDate
                  ? new Date(selectedDate + "T00:00:00").toLocaleDateString("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })
                  : "Daily Agenda"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {selectedDayEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center group">
                  <div className="h-20 w-20 rounded-[2rem] bg-slate-50 flex items-center justify-center text-slate-200 mb-5 transition-all group-hover:scale-110 group-hover:rotate-6">
                    <CalendarIcon className="h-10 w-10" />
                  </div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {selectedDate ? "No Events Scheduled" : "Select a day"}
                  </p>
                  <p className="text-[10px] text-slate-300 mt-2 italic px-8 leading-relaxed">
                    Check other dates or adjust your filters.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedDayEvents.map((ev) => (
                    <div
                      key={ev.id}
                      className="group relative bg-white border border-slate-100 p-4 rounded-2xl hover:border-blue-200 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer"
                      onClick={() => handleEventClick(ev)}
                    >
                      <div className={`absolute left-0 top-4 bottom-4 w-1 rounded-r-full shadow-[0_0_10px_rgba(0,0,0,0.1)] ${EVENT_COLORS[ev.status] || "bg-slate-300"}`} />

                      <div className="flex flex-col gap-2.5 pl-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                            {ev.type === "project" ? "Project Milestone" : "Task Item"}
                          </span>
                          <Badge variant="secondary" className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-tighter border-none
                              ${ev.status === 'ACTIVE' || ev.status === 'DONE' ? 'bg-green-100 text-green-700' :
                              ev.status === 'PLANNING' || ev.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                                'bg-slate-100 text-slate-600'}
                            `}>
                            {ev.status}
                          </Badge>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">
                          {ev.title}
                        </h4>
                        <div className="flex items-center gap-4 text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">
                          <div className="flex items-center gap-1.5">
                            <CalendarIcon className="h-3.5 w-3.5 text-blue-400" />
                            {new Date(ev.start).toLocaleDateString("id-ID", { day: 'numeric', month: 'short' })}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-orange-400" />
                            {new Date(ev.end || ev.start).toLocaleDateString("id-ID", { day: 'numeric', month: 'short' })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-2xl bg-slate-900 text-white rounded-3xl overflow-hidden p-8 flex flex-col gap-6 relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Filter className="h-32 w-32" />
            </div>
            <div>
              <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-6">Status Guide</h5>
              <div className="grid grid-cols-1 gap-4 relative z-10">
                {[
                  { label: 'Completed', color: 'bg-emerald-500' },
                  { label: 'In Progress', color: 'bg-blue-500' },
                  { label: 'Planning', color: 'bg-slate-400' },
                  { label: 'On Hold', color: 'bg-orange-500' }
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className={`h-2.5 w-2.5 rounded-full ${item.color} shadow-[0_0_10px_currentColor]`} />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800">
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed italic">
                Tip: Use multi-select filters to drill down into specific project timelines.
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Reusable Task Detail Drawer */}
      <TaskDetailDrawer
        taskId={selectedTaskId}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}
