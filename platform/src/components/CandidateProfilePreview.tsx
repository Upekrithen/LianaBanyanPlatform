import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ReputationDisplay } from './ReputationDisplay';
import { CheckCircle2, Award, Users, Briefcase, FileText, TrendingUp } from 'lucide-react';

interface CandidateProfilePreviewProps {
  // This is a preview/mockup component to show what data will be available
  // In real usage, this would receive actual data from reputation_scores, guild_members, etc.
}

export function CandidateProfilePreview({}: CandidateProfilePreviewProps) {
  // Mock data to illustrate what information will be available
  const mockCandidate = {
    name: "Jane Smith, CPA",
    email: "jane.smith@example.com",
    reputation: {
      level1Blocks: 3,
      level2Blocks: 4,
      level3Blocks: 2,
      stars: 1,
      suns: 0,
      totalInteractions: 87,
      positiveInteractions: 84,
      negativeInteractions: 3,
      overallScore: 4.7,
      qualityScore: 4.8,
      timelinessScore: 4.9,
      professionalismScore: 4.7,
      collaborationScore: 4.5,
      standardsScore: 4.8
    },
    guilds: [
      { name: "Accounting Professionals Guild", role: "Senior Member", joined: "2024-03" },
      { name: "Tax Strategy Collective", role: "Contributor", joined: "2024-06" }
    ],
    pastWork: [
      { project: "TechCo Manufacturing", role: "Financial Controller", duration: "6 months", outcome: "Successfully managed $2M budget" },
      { project: "GreenProduct Launch", role: "Tax Advisor", duration: "3 months", outcome: "Optimized tax structure saving 15%" }
    ],
    skills: ["GAAP Accounting", "Tax Strategy", "Financial Modeling", "Multi-Entity Structures", "Audit Management"],
    credentials: ["Active CPA License (CA, NY)", "MBA - Finance", "15+ years experience"],
    availability: "Available starting next month",
    preferredCompensation: "Mix of service credits (40%) and cash (60%)"
  };

  return (
    <div className="space-y-6">
      <Card className="border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-blue-600" />
            What You'll See During Interviews
          </CardTitle>
          <CardDescription>
            All pertinent information automatically compiled from the candidate's profile, reputation, and work history
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Candidate Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-lg font-bold">{mockCandidate.name}</div>
                <div className="text-sm text-muted-foreground">{mockCandidate.email}</div>
              </div>
              <Separator />
              <div>
                <div className="text-sm font-semibold mb-2">Credentials</div>
                {mockCandidate.credentials.map((cred) => (
                  <Badge key={cred} variant="secondary" className="mr-1 mb-1">
                    {cred}
                  </Badge>
                ))}
              </div>
              <div>
                <div className="text-sm font-semibold mb-1">Availability</div>
                <div className="text-sm text-muted-foreground">{mockCandidate.availability}</div>
              </div>
              <div>
                <div className="text-sm font-semibold mb-1">Preferred Compensation</div>
                <div className="text-sm text-muted-foreground">{mockCandidate.preferredCompensation}</div>
              </div>
            </CardContent>
          </Card>

          {/* Reputation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Award className="h-4 w-4" />
                Reputation Score
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ReputationDisplay {...mockCandidate.reputation} size="lg" />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Quality:</span>
                  <span className="font-medium">{mockCandidate.reputation.qualityScore}/5.0</span>
                </div>
                <div className="flex justify-between">
                  <span>Timeliness:</span>
                  <span className="font-medium">{mockCandidate.reputation.timelinessScore}/5.0</span>
                </div>
                <div className="flex justify-between">
                  <span>Professionalism:</span>
                  <span className="font-medium">{mockCandidate.reputation.professionalismScore}/5.0</span>
                </div>
                <div className="flex justify-between">
                  <span>Collaboration:</span>
                  <span className="font-medium">{mockCandidate.reputation.collaborationScore}/5.0</span>
                </div>
                <div className="flex justify-between">
                  <span>Standards:</span>
                  <span className="font-medium">{mockCandidate.reputation.standardsScore}/5.0</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Skills & Expertise
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {mockCandidate.skills.map((skill) => (
                  <Badge key={skill} variant="outline">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Guild Memberships */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                Guild Memberships
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockCandidate.guilds.map((guild) => (
                <div key={guild.name} className="p-3 border rounded-lg">
                  <div className="font-medium">{guild.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {guild.role} • Joined {guild.joined}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Past Work */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Past Contract Work (on LB)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockCandidate.pastWork.map((work) => (
                <div key={work.project} className="space-y-1">
                  <div className="font-medium">{work.project}</div>
                  <div className="text-sm text-muted-foreground">{work.role} • {work.duration}</div>
                  <div className="text-sm flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{work.outcome}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Interview Preparation */}
          <Card className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Ready for Your Interview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>✅ Complete work history with outcomes</div>
              <div>✅ Verified reputation scores from real projects</div>
              <div>✅ Guild affiliations and peer references</div>
              <div>✅ Skill validation from multiple sources</div>
              <div>✅ Compensation preferences clearly stated</div>
              <div>✅ Availability and timeline information</div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardContent className="py-6">
          <div className="text-sm text-center text-muted-foreground">
            All of this information is automatically compiled from the LB system - no manual resume review needed.
            You can focus your interview on culture fit, specific scenarios, and strategic alignment.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
