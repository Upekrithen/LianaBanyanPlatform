import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { useToast } from "@/hooks/use-toast";
import {
  GraduationCap, Save, Plus, Trash2, Clock, Users, Video,
  BookOpen, Globe, Award, Calendar, Sparkles, ArrowLeft, X,
} from "lucide-react";
import { PioneerBadge } from "@/components/PioneerBadge";
import { usePioneerAssignment } from "@/hooks/usePioneerAssignment";

const SUBJECTS = [
  "Spanish", "English", "Math", "Music", "Art", "Cooking",
  "Science", "History", "French", "Mandarin", "Programming", "Business",
  "Writing", "Reading", "Chemistry", "Physics", "Biology", "Economics",
];

const LANGUAGES = [
  "English", "Spanish", "French", "Mandarin", "Arabic", "Hindi",
  "Portuguese", "German", "Japanese", "Korean", "Tagalog", "Vietnamese",
];

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const TIME_SLOTS = Array.from({ length: 28 }, (_, i) => {
  const hour = Math.floor(i / 2) + 7;
  const min = i % 2 === 0 ? "00" : "30";
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour > 12 ? hour - 12 : hour;
  return { value: `${String(hour).padStart(2, "0")}:${min}:00`, label: `${displayHour}:${min} ${ampm}` };
});

interface ScheduleSlot {
  id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  slot_type: "group_class" | "individual" | "unavailable";
  group_class_title: string;
  max_students: number;
  isNew?: boolean;
}

export default function TeacherSetupPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { assignPioneer, isNewPioneer, pioneerNumber } = usePioneerAssignment("home_teacher");

  const [subjects, setSubjects] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>(["English"]);
  const [qualifications, setQualifications] = useState("");
  const [bio, setBio] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [groupRate, setGroupRate] = useState("");
  const [zoomLink, setZoomLink] = useState("");
  const [scheduleSlots, setScheduleSlots] = useState<ScheduleSlot[]>([]);
  const [activeTab, setActiveTab] = useState<"profile" | "schedule">("profile");

  const { data: existingProfile } = useQuery({
    queryKey: ["teacher-profile-mine", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("teacher_profiles" as never)
        .select("*")
        .eq("member_id", user!.id)
        .maybeSingle();
      return data as {
        id: string; subjects: string[]; qualifications: string; languages: string[];
        bio: string; hourly_rate: number; group_rate: number; zoom_link: string; pioneer_number: number | null;
      } | null;
    },
  });

  const { data: existingSchedule = [] } = useQuery({
    queryKey: ["teacher-schedule-mine", existingProfile?.id],
    enabled: !!existingProfile?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("teacher_schedule" as never)
        .select("*")
        .eq("teacher_id", existingProfile!.id);
      return (data ?? []) as ScheduleSlot[];
    },
  });

  useEffect(() => {
    if (existingProfile) {
      setSubjects(existingProfile.subjects || []);
      setLanguages(existingProfile.languages || ["English"]);
      setQualifications(existingProfile.qualifications || "");
      setBio(existingProfile.bio || "");
      setHourlyRate(existingProfile.hourly_rate?.toString() || "");
      setGroupRate(existingProfile.group_rate?.toString() || "");
      setZoomLink(existingProfile.zoom_link || "");
    }
  }, [existingProfile]);

  useEffect(() => {
    if (existingSchedule.length > 0) {
      setScheduleSlots(existingSchedule.map((s) => ({ ...s, isNew: false })));
    }
  }, [existingSchedule]);

  const saveProfile = useMutation({
    mutationFn: async () => {
      const profileData = {
        member_id: user!.id,
        subjects,
        qualifications,
        languages,
        bio,
        hourly_rate: hourlyRate ? parseFloat(hourlyRate) : null,
        group_rate: groupRate ? parseFloat(groupRate) : null,
        zoom_link: zoomLink || null,
      };

      let profileId = existingProfile?.id;

      if (existingProfile) {
        await supabase
          .from("teacher_profiles" as never)
          .update(profileData as never)
          .eq("id", existingProfile.id);
      } else {
        const { data } = await supabase
          .from("teacher_profiles" as never)
          .insert(profileData as never)
          .select("id")
          .single();
        profileId = (data as { id: string })?.id;
      }

      if (profileId) {
        const existingIds = existingSchedule.map((s) => s.id).filter(Boolean);
        const currentIds = scheduleSlots.filter((s) => s.id && !s.isNew).map((s) => s.id);
        const toDelete = existingIds.filter((id) => !currentIds.includes(id));

        if (toDelete.length > 0) {
          await supabase
            .from("teacher_schedule" as never)
            .delete()
            .in("id", toDelete);
        }

        const newSlots = scheduleSlots
          .filter((s) => s.isNew)
          .map(({ isNew, id, ...rest }) => ({ ...rest, teacher_id: profileId }));

        if (newSlots.length > 0) {
          await supabase.from("teacher_schedule" as never).insert(newSlots as never);
        }

        for (const slot of scheduleSlots.filter((s) => !s.isNew && s.id)) {
          const { id, isNew, ...rest } = slot;
          await supabase
            .from("teacher_schedule" as never)
            .update(rest as never)
            .eq("id", id);
        }
      }

      return profileId;
    },
    onSuccess: async () => {
      toast({ title: "Profile saved", description: "Your teacher profile and schedule have been updated." });
      queryClient.invalidateQueries({ queryKey: ["teacher-profile-mine"] });
      queryClient.invalidateQueries({ queryKey: ["teacher-schedule-mine"] });
      queryClient.invalidateQueries({ queryKey: ["teacher-profiles"] });
      if (isNewPioneer) await assignPioneer();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save profile. Please try again.", variant: "destructive" });
    },
  });

  const toggleSubject = (subject: string) => {
    setSubjects((prev) =>
      prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]
    );
  };

  const toggleLanguage = (lang: string) => {
    setLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  const addSlot = (type: "group_class" | "individual") => {
    setScheduleSlots((prev) => [
      ...prev,
      {
        day_of_week: 1,
        start_time: "09:00:00",
        end_time: "10:00:00",
        slot_type: type,
        group_class_title: type === "group_class" ? "New Group Class" : "",
        max_students: 15,
        isNew: true,
      },
    ]);
  };

  const updateSlot = (index: number, updates: Partial<ScheduleSlot>) => {
    setScheduleSlots((prev) => prev.map((s, i) => (i === index ? { ...s, ...updates } : s)));
  };

  const removeSlot = (index: number) => {
    setScheduleSlots((prev) => prev.filter((_, i) => i !== index));
  };

  const earningPreview = (() => {
    const groupClasses = scheduleSlots.filter((s) => s.slot_type === "group_class");
    const tutorSlots = scheduleSlots.filter((s) => s.slot_type === "individual");
    const weeklyGroup = groupClasses.length * 25 * (parseFloat(groupRate) || 0) * 0.833;
    const weeklyTutor = tutorSlots.length * (parseFloat(hourlyRate) || 0) * 4 * 0.833;
    return { weeklyGroup, weeklyTutor, total: weeklyGroup + weeklyTutor };
  })();

  if (!user) return null;

  return (
    <PortalPageLayout maxWidth="lg" xrayId="teacher-setup-page">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate("/classroom")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="p-3 bg-indigo-600 rounded-full text-white">
          <GraduationCap className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground dark:text-white">
            {existingProfile ? "Edit Teacher Profile" : "Become a Home Teacher"}
          </h1>
          <p className="text-muted-foreground">
            Teach from your living room via Zoom. Keep 83.3% of every dollar.
          </p>
        </div>
        {(existingProfile?.pioneer_number || pioneerNumber) && (
          <PioneerBadge role="home_teacher" className="ml-auto" />
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={activeTab === "profile" ? "default" : "outline"}
          className={activeTab === "profile" ? "bg-indigo-600 hover:bg-indigo-700" : ""}
          onClick={() => setActiveTab("profile")}
        >
          <GraduationCap className="h-4 w-4 mr-2" /> Profile
        </Button>
        <Button
          variant={activeTab === "schedule" ? "default" : "outline"}
          className={activeTab === "schedule" ? "bg-indigo-600 hover:bg-indigo-700" : ""}
          onClick={() => setActiveTab("schedule")}
        >
          <Calendar className="h-4 w-4 mr-2" /> Schedule
        </Button>
      </div>

      {activeTab === "profile" && (
        <div className="space-y-6">
          {/* Subjects */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-indigo-500" /> Subjects
              </CardTitle>
              <CardDescription>Select all subjects you can teach</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {SUBJECTS.map((subject) => (
                  <Badge
                    key={subject}
                    variant={subjects.includes(subject) ? "default" : "outline"}
                    className={`cursor-pointer transition-colors ${
                      subjects.includes(subject)
                        ? "bg-indigo-600 hover:bg-indigo-700"
                        : "hover:bg-indigo-100 dark:hover:bg-indigo-900/30"
                    }`}
                    onClick={() => toggleSubject(subject)}
                  >
                    {subject}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Languages */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-500" /> Languages
              </CardTitle>
              <CardDescription>Languages you can teach in</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map((lang) => (
                  <Badge
                    key={lang}
                    variant={languages.includes(lang) ? "default" : "outline"}
                    className={`cursor-pointer transition-colors ${
                      languages.includes(lang)
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "hover:bg-blue-100 dark:hover:bg-blue-900/30"
                    }`}
                    onClick={() => toggleLanguage(lang)}
                  >
                    {lang}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Bio & Qualifications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">About You</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Bio (500 chars max)</Label>
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value.slice(0, 500))}
                  placeholder="Tell students about yourself and your teaching style..."
                  rows={3}
                />
                <p className="text-xs text-muted-foreground mt-1">{bio.length}/500</p>
              </div>
              <div>
                <Label>Qualifications</Label>
                <Textarea
                  value={qualifications}
                  onChange={(e) => setQualifications(e.target.value)}
                  placeholder="Degrees, certifications, years of experience..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Rates & Zoom */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-500" /> Rates & Zoom
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Individual Tutoring Rate ($/hour)</Label>
                  <Input
                    type="number"
                    min="1"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    placeholder="25"
                  />
                  {hourlyRate && (
                    <p className="text-xs text-green-600 mt-1">
                      You keep ${(parseFloat(hourlyRate) * 0.833).toFixed(2)}/hr
                    </p>
                  )}
                </div>
                <div>
                  <Label>Group Class Rate ($/student/month)</Label>
                  <Input
                    type="number"
                    min="1"
                    value={groupRate}
                    onChange={(e) => setGroupRate(e.target.value)}
                    placeholder="25"
                  />
                  {groupRate && (
                    <p className="text-xs text-green-600 mt-1">
                      You keep ${(parseFloat(groupRate) * 0.833).toFixed(2)}/student/mo
                    </p>
                  )}
                </div>
              </div>
              <div>
                <Label className="flex items-center gap-2">
                  <Video className="h-4 w-4" /> Zoom Meeting Link
                </Label>
                <Input
                  value={zoomLink}
                  onChange={(e) => setZoomLink(e.target.value)}
                  placeholder="https://zoom.us/j/your-meeting-id"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Students only see this after payment. Free Zoom tier works.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Revenue Preview */}
          {(hourlyRate || groupRate) && (
            <Card className="border-green-200 dark:border-green-900 bg-green-50/30 dark:bg-green-950/10">
              <CardHeader>
                <CardTitle className="text-lg text-green-800 dark:text-green-400">
                  Monthly Earning Preview
                </CardTitle>
                <CardDescription>Based on your schedule and rates (you may earn)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                      ${earningPreview.weeklyGroup.toFixed(0)}
                    </div>
                    <div className="text-xs text-muted-foreground">Group Classes</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                      ${earningPreview.weeklyTutor.toFixed(0)}
                    </div>
                    <div className="text-xs text-muted-foreground">Tutoring</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-800 dark:text-green-300">
                      ${earningPreview.total.toFixed(0)}
                    </div>
                    <div className="text-xs text-muted-foreground">Total/month</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === "schedule" && (
        <div className="space-y-6">
          {/* Add Slot Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2 border-blue-300 text-blue-700 dark:border-blue-700 dark:text-blue-400" onClick={() => addSlot("group_class")}>
              <Plus className="h-4 w-4" /> Add Group Class
            </Button>
            <Button variant="outline" className="gap-2 border-green-300 text-green-700 dark:border-green-700 dark:text-green-400" onClick={() => addSlot("individual")}>
              <Plus className="h-4 w-4" /> Add Tutoring Slot
            </Button>
          </div>

          {/* Schedule Slots */}
          {scheduleSlots.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Calendar className="h-12 w-12 mx-auto mb-3 text-muted-foreground/40" />
                <p className="text-muted-foreground">
                  No schedule slots yet. Add group classes or individual tutoring slots.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {scheduleSlots.map((slot, index) => (
                <Card
                  key={slot.id || `new-${index}`}
                  className={
                    slot.slot_type === "group_class"
                      ? "border-blue-200 dark:border-blue-800"
                      : "border-green-200 dark:border-green-800"
                  }
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge
                        className={
                          slot.slot_type === "group_class"
                            ? "bg-blue-600"
                            : "bg-green-600"
                        }
                      >
                        {slot.slot_type === "group_class" ? (
                          <><Users className="h-3 w-3 mr-1" /> Group Class</>
                        ) : (
                          <><Clock className="h-3 w-3 mr-1" /> Individual Tutoring</>
                        )}
                      </Badge>
                      <Button variant="ghost" size="icon" onClick={() => removeSlot(index)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {slot.slot_type === "group_class" && (
                      <div>
                        <Label>Class Title</Label>
                        <Input
                          value={slot.group_class_title}
                          onChange={(e) => updateSlot(index, { group_class_title: e.target.value })}
                          placeholder="e.g., Tuesday Spanish Beginner"
                        />
                      </div>
                    )}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <Label>Day</Label>
                        <Select
                          value={String(slot.day_of_week)}
                          onValueChange={(v) => updateSlot(index, { day_of_week: parseInt(v) })}
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {DAYS.map((d, i) => (
                              <SelectItem key={i} value={String(i)}>{d}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Start</Label>
                        <Select
                          value={slot.start_time}
                          onValueChange={(v) => updateSlot(index, { start_time: v })}
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {TIME_SLOTS.map((t) => (
                              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>End</Label>
                        <Select
                          value={slot.end_time}
                          onValueChange={(v) => updateSlot(index, { end_time: v })}
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {TIME_SLOTS.map((t) => (
                              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {slot.slot_type === "group_class" && (
                        <div>
                          <Label>Max Students</Label>
                          <Input
                            type="number"
                            min="2"
                            max="100"
                            value={slot.max_students}
                            onChange={(e) => updateSlot(index, { max_students: parseInt(e.target.value) || 15 })}
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Visual Schedule Preview */}
          {scheduleSlots.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Weekly Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1 text-xs">
                  {DAYS.map((day, dayIndex) => {
                    const daySlots = scheduleSlots
                      .filter((s) => s.day_of_week === dayIndex)
                      .sort((a, b) => a.start_time.localeCompare(b.start_time));
                    return (
                      <div key={day} className="text-center">
                        <div className="font-medium mb-1 text-muted-foreground">{day.slice(0, 3)}</div>
                        {daySlots.length === 0 ? (
                          <div className="h-8 bg-muted/30 rounded" />
                        ) : (
                          daySlots.map((s, i) => (
                            <div
                              key={i}
                              className={`rounded p-1 mb-1 ${
                                s.slot_type === "group_class"
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                  : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              }`}
                            >
                              {s.start_time.slice(0, 5)}
                            </div>
                          ))
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Save Button */}
      <div className="mt-8 flex gap-3">
        <Button
          className="bg-indigo-600 hover:bg-indigo-700 gap-2 flex-1"
          disabled={subjects.length === 0 || saveProfile.isPending}
          onClick={() => saveProfile.mutate()}
        >
          <Save className="h-4 w-4" />
          {saveProfile.isPending ? "Saving..." : existingProfile ? "Update Profile" : "Create Teacher Profile"}
        </Button>
        <Button variant="outline" onClick={() => navigate("/classroom")}>
          Back to Classroom
        </Button>
      </div>
    </PortalPageLayout>
  );
}
