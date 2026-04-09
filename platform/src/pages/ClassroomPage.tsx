import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import LaunchConditionOverlay from "@/components/LaunchConditionOverlay";
import {
  BookOpen, GraduationCap, Search, Users, Clock, Video,
  Star, Calendar, DollarSign, Sparkles, Award, ArrowRight,
  Globe, Filter, CheckCircle2,
} from "lucide-react";

const SUBJECTS = [
  "Spanish", "English", "Math", "Music", "Art", "Cooking",
  "Science", "History", "French", "Mandarin", "Programming", "Business",
];

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface TeacherProfile {
  id: string;
  member_id: string;
  subjects: string[];
  qualifications: string;
  languages: string[];
  bio: string;
  hourly_rate: number;
  group_rate: number;
  zoom_link: string;
  pioneer_number: number | null;
  active: boolean;
}

interface ScheduleSlot {
  id: string;
  teacher_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  slot_type: string;
  group_class_title: string | null;
  max_students: number;
}

interface BookingDialogState {
  open: boolean;
  teacher: TeacherProfile | null;
  slot: ScheduleSlot | null;
  type: "individual" | "group_subscription";
}

export default function ClassroomPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [languageFilter, setLanguageFilter] = useState("all");
  const [expandedTeacher, setExpandedTeacher] = useState<string | null>(null);
  const [bookingDialog, setBookingDialog] = useState<BookingDialogState>({
    open: false, teacher: null, slot: null, type: "individual",
  });
  const [selectedCurrency, setSelectedCurrency] = useState("marks");

  const { data: teachers = [] } = useQuery({
    queryKey: ["teacher-profiles"],
    queryFn: async () => {
      const { data } = await supabase
        .from("teacher_profiles" as never)
        .select("*")
        .eq("active", true);
      return (data ?? []) as TeacherProfile[];
    },
  });

  const { data: schedules = [] } = useQuery({
    queryKey: ["teacher-schedules"],
    queryFn: async () => {
      const { data } = await supabase
        .from("teacher_schedule" as never)
        .select("*")
        .neq("slot_type", "unavailable");
      return (data ?? []) as ScheduleSlot[];
    },
  });

  const { data: bookingCounts = {} } = useQuery({
    queryKey: ["class-booking-counts"],
    queryFn: async () => {
      const { data } = await supabase
        .from("class_bookings" as never)
        .select("schedule_slot_id, status")
        .eq("status", "confirmed");
      const counts: Record<string, number> = {};
      (data ?? []).forEach((b: { schedule_slot_id: string }) => {
        counts[b.schedule_slot_id] = (counts[b.schedule_slot_id] || 0) + 1;
      });
      return counts;
    },
  });

  const filteredTeachers = useMemo(() => {
    return teachers.filter((t) => {
      if (search && !t.subjects.some((s) => s.toLowerCase().includes(search.toLowerCase()))
        && !t.bio?.toLowerCase().includes(search.toLowerCase())
        && !t.qualifications?.toLowerCase().includes(search.toLowerCase())) return false;
      if (subjectFilter !== "all" && !t.subjects.includes(subjectFilter)) return false;
      if (languageFilter !== "all" && !t.languages.includes(languageFilter)) return false;
      return true;
    });
  }, [teachers, search, subjectFilter, languageFilter]);

  const teacherSchedules = useMemo(() => {
    const map: Record<string, ScheduleSlot[]> = {};
    schedules.forEach((s) => {
      if (!map[s.teacher_id]) map[s.teacher_id] = [];
      map[s.teacher_id].push(s);
    });
    return map;
  }, [schedules]);

  const allLanguages = useMemo(() => {
    const langs = new Set<string>();
    teachers.forEach((t) => t.languages.forEach((l) => langs.add(l)));
    return Array.from(langs).sort();
  }, [teachers]);

  const handleBookSlot = (teacher: TeacherProfile, slot: ScheduleSlot) => {
    setBookingDialog({
      open: true,
      teacher,
      slot,
      type: slot.slot_type === "group_class" ? "group_subscription" : "individual",
    });
  };

  const confirmBooking = async () => {
    if (!user || !bookingDialog.teacher || !bookingDialog.slot) return;
    const rate = bookingDialog.type === "individual"
      ? bookingDialog.teacher.hourly_rate
      : bookingDialog.teacher.group_rate;
    const creatorAmount = +(rate * 0.833).toFixed(2);
    const platformAmount = +(rate - creatorAmount).toFixed(2);

    await supabase.from("class_bookings" as never).insert({
      student_id: user.id,
      teacher_id: bookingDialog.teacher.id,
      schedule_slot_id: bookingDialog.slot.id,
      booking_type: bookingDialog.type,
      booking_date: bookingDialog.type === "individual" ? new Date().toISOString().split("T")[0] : null,
      zoom_link: bookingDialog.teacher.zoom_link,
      amount_paid: rate,
      currency: selectedCurrency,
      creator_amount: creatorAmount,
      platform_amount: platformAmount,
    } as never);

    setBookingDialog({ open: false, teacher: null, slot: null, type: "individual" });
  };

  const totalStudents = Object.values(bookingCounts).reduce((a, b) => a + b, 0);

  return (
    <LaunchConditionOverlay initiativeSlug="didasko" initiativeName="Cooperative Classroom">
    <PortalPageLayout maxWidth="xl" xrayId="classroom-page">
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <div className="p-3 bg-indigo-600 rounded-full text-white">
          <GraduationCap className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-foreground dark:text-white">
            Cooperative Classroom
          </h1>
          <p className="text-lg text-muted-foreground dark:text-slate-400">
            Home Teaching via Zoom — Group Classes & 1-on-1 Tutoring
          </p>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        Teachers keep <strong className="text-indigo-600 dark:text-indigo-400">83.3%</strong> of every dollar.
        Platform hosts zero video. Zoom handles delivery.
      </p>

      {/* Stats Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="text-center">
          <CardContent className="pt-4 pb-3">
            <GraduationCap className="h-6 w-6 mx-auto mb-1 text-indigo-500" />
            <div className="text-2xl font-bold">{teachers.length}</div>
            <div className="text-xs text-muted-foreground">Active Teachers</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-4 pb-3">
            <BookOpen className="h-6 w-6 mx-auto mb-1 text-blue-500" />
            <div className="text-2xl font-bold">
              {schedules.filter((s) => s.slot_type === "group_class").length}
            </div>
            <div className="text-xs text-muted-foreground">Group Classes</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-4 pb-3">
            <Users className="h-6 w-6 mx-auto mb-1 text-emerald-500" />
            <div className="text-2xl font-bold">{totalStudents}</div>
            <div className="text-xs text-muted-foreground">Enrolled Students</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-4 pb-3">
            <Award className="h-6 w-6 mx-auto mb-1 text-amber-500" />
            <div className="text-2xl font-bold">
              {teachers.filter((t) => t.pioneer_number).length}/10
            </div>
            <div className="text-xs text-muted-foreground">Pioneer Slots</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search subjects, qualifications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={subjectFilter} onValueChange={setSubjectFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {SUBJECTS.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={languageFilter} onValueChange={setLanguageFilter}>
          <SelectTrigger className="w-[180px]">
            <Globe className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Languages</SelectItem>
            {allLanguages.map((l) => (
              <SelectItem key={l} value={l}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {user && (
          <Button
            variant="outline"
            className="gap-2 border-indigo-300 text-indigo-700 dark:border-indigo-700 dark:text-indigo-400"
            onClick={() => navigate("/classroom/setup")}
          >
            <Sparkles className="h-4 w-4" /> Become a Teacher
          </Button>
        )}
      </div>

      {/* Teacher Grid */}
      {filteredTeachers.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <GraduationCap className="h-16 w-16 mx-auto mb-4 text-muted-foreground/40" />
            <h3 className="text-xl font-semibold mb-2">No teachers yet</h3>
            <p className="text-muted-foreground mb-4">
              Be among the first 10 Home Teachers and earn 50 Marks/month for 12 months + a Pioneer Medallion.
            </p>
            {user && (
              <Button onClick={() => navigate("/classroom/setup")} className="bg-indigo-600 hover:bg-indigo-700">
                <Sparkles className="h-4 w-4 mr-2" /> Create Your Teacher Profile
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeachers.map((teacher) => {
            const slots = teacherSchedules[teacher.id] || [];
            const groupSlots = slots.filter((s) => s.slot_type === "group_class");
            const individualSlots = slots.filter((s) => s.slot_type === "individual");
            const isExpanded = expandedTeacher === teacher.id;

            return (
              <Card key={teacher.id} className="flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                        <GraduationCap className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Teacher</CardTitle>
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {teacher.subjects.slice(0, 3).map((s) => (
                            <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                          ))}
                          {teacher.subjects.length > 3 && (
                            <Badge variant="outline" className="text-xs">+{teacher.subjects.length - 3}</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    {teacher.pioneer_number && (
                      <Badge className="bg-amber-500 text-white text-xs">
                        Pioneer #{teacher.pioneer_number}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-3 pb-3">
                  {teacher.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{teacher.bio}</p>
                  )}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Globe className="h-3 w-3" />
                    {teacher.languages.join(", ")}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {teacher.hourly_rate && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-green-600" />
                        <span className="font-medium">${teacher.hourly_rate}</span>
                        <span className="text-xs text-muted-foreground">/hr</span>
                      </div>
                    )}
                    {teacher.group_rate && (
                      <div className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-blue-600" />
                        <span className="font-medium">${teacher.group_rate}</span>
                        <span className="text-xs text-muted-foreground">/mo</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 text-xs">
                    {groupSlots.length > 0 && (
                      <Badge variant="outline" className="text-blue-700 border-blue-300 dark:text-blue-400">
                        {groupSlots.length} group class{groupSlots.length !== 1 ? "es" : ""}
                      </Badge>
                    )}
                    {individualSlots.length > 0 && (
                      <Badge variant="outline" className="text-green-700 border-green-300 dark:text-green-400">
                        {individualSlots.length} open slot{individualSlots.length !== 1 ? "s" : ""}
                      </Badge>
                    )}
                  </div>

                  {/* Expanded Schedule */}
                  {isExpanded && slots.length > 0 && (
                    <div className="mt-3 space-y-2 border-t pt-3">
                      <h4 className="text-sm font-semibold flex items-center gap-1">
                        <Calendar className="h-4 w-4" /> Weekly Schedule
                      </h4>
                      {slots.sort((a, b) => a.day_of_week - b.day_of_week || a.start_time.localeCompare(b.start_time)).map((slot) => {
                        const enrolled = bookingCounts[slot.id] || 0;
                        const isFull = slot.slot_type === "group_class" && enrolled >= slot.max_students;
                        return (
                          <div
                            key={slot.id}
                            className={`flex items-center justify-between p-2 rounded-lg text-xs border ${
                              slot.slot_type === "group_class"
                                ? "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
                                : "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800"
                            }`}
                          >
                            <div>
                              <div className="font-medium">
                                {DAYS[slot.day_of_week]} {slot.start_time.slice(0, 5)}–{slot.end_time.slice(0, 5)}
                              </div>
                              {slot.group_class_title && (
                                <div className="text-muted-foreground">{slot.group_class_title}</div>
                              )}
                              {slot.slot_type === "group_class" && (
                                <div className="text-muted-foreground">
                                  {enrolled}/{slot.max_students} enrolled
                                </div>
                              )}
                            </div>
                            <Button
                              size="sm"
                              variant={slot.slot_type === "group_class" ? "default" : "outline"}
                              disabled={isFull || !user}
                              className={slot.slot_type === "group_class" ? "bg-blue-600 hover:bg-blue-700 text-xs" : "text-xs"}
                              onClick={() => handleBookSlot(teacher, slot)}
                            >
                              {slot.slot_type === "group_class"
                                ? isFull ? "Full" : "Subscribe"
                                : "Book"}
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pt-0">
                  <Button
                    variant="ghost"
                    className="w-full gap-2 text-sm"
                    onClick={() => setExpandedTeacher(isExpanded ? null : teacher.id)}
                  >
                    <Calendar className="h-4 w-4" />
                    {isExpanded ? "Hide Schedule" : "View Schedule"}
                    {!isExpanded && <ArrowRight className="h-3 w-3" />}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* CTA: How It Works */}
      <Card className="mt-10 border-2 border-indigo-200 dark:border-indigo-900 bg-indigo-50/30 dark:bg-indigo-950/10">
        <CardHeader>
          <CardTitle className="text-2xl text-indigo-900 dark:text-indigo-400">
            The $5 Classroom
          </CardTitle>
          <CardDescription className="text-base">
            Teaching from home, powered by cooperative economics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex gap-3 items-start">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 font-bold">1</div>
              <div>
                <h4 className="font-semibold mb-1">Teacher creates profile</h4>
                <p className="text-sm text-muted-foreground">
                  Set subjects, rates, schedule. Provide your own Zoom link. $5/year membership is all you need.
                </p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 font-bold">2</div>
              <div>
                <h4 className="font-semibold mb-1">Students browse & book</h4>
                <p className="text-sm text-muted-foreground">
                  Filter by subject, language, availability. Book 1-on-1 or subscribe to group classes.
                </p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 font-bold">3</div>
              <div>
                <h4 className="font-semibold mb-1">Teacher keeps 83.3%</h4>
                <p className="text-sm text-muted-foreground">
                  Pay with Marks, Credits, Joules, or Dollars. Zoom link revealed after payment.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="gap-3">
          <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2" onClick={() => navigate("/classroom/setup")}>
            <Sparkles className="h-4 w-4" /> Become a Home Teacher
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => navigate("/initiatives/didasko")}>
            <BookOpen className="h-4 w-4" /> About Didasko
          </Button>
        </CardFooter>
      </Card>

      {/* Booking Dialog */}
      <Dialog open={bookingDialog.open} onOpenChange={(open) => !open && setBookingDialog({ ...bookingDialog, open: false })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {bookingDialog.type === "group_subscription" ? "Subscribe to Group Class" : "Book Tutoring Session"}
            </DialogTitle>
            <DialogDescription>
              {bookingDialog.type === "group_subscription"
                ? `Monthly subscription to "${bookingDialog.slot?.group_class_title || "Group Class"}"`
                : `Individual session — ${bookingDialog.slot ? `${DAYS[bookingDialog.slot.day_of_week]} ${bookingDialog.slot.start_time.slice(0, 5)}–${bookingDialog.slot.end_time.slice(0, 5)}` : ""}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Rate:</span>
                <span className="ml-2 font-bold text-lg">
                  ${bookingDialog.type === "individual"
                    ? bookingDialog.teacher?.hourly_rate
                    : bookingDialog.teacher?.group_rate}
                </span>
                <span className="text-xs text-muted-foreground">
                  {bookingDialog.type === "individual" ? "/session" : "/month"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Teacher keeps:</span>
                <span className="ml-2 font-bold text-green-600">83.3%</span>
              </div>
            </div>

            {bookingDialog.type === "group_subscription" && bookingDialog.slot && (
              <div className="text-sm p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-1">
                  <Video className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Zoom link revealed after payment</span>
                </div>
                <div className="text-muted-foreground">
                  {DAYS[bookingDialog.slot.day_of_week]}s at {bookingDialog.slot.start_time.slice(0, 5)} — recurring monthly
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-2 block">Pay with:</label>
              <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="marks">Marks (zero fees)</SelectItem>
                  <SelectItem value="credits">Credits (zero fees)</SelectItem>
                  <SelectItem value="joules">Joules (zero fees)</SelectItem>
                  <SelectItem value="dollars">Dollars (Stripe processing fees apply)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>
                Internal currencies (Marks, Credits, Joules) incur zero processing fees.
                Dollar payments processed via Stripe with standard fees.
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setBookingDialog({ ...bookingDialog, open: false })}>
              Cancel
            </Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={confirmBooking}>
              {bookingDialog.type === "group_subscription" ? "Subscribe" : "Confirm Booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PortalPageLayout>
    </LaunchConditionOverlay>
  );
}
