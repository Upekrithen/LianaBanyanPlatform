import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Brain, ArrowRight, Check, X, RotateCcw, Award } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { PortalPageLayout } from '@/components/PortalPageLayout';

// Mock data for spaced repetition items
const FLASHCARDS = [
  { id: 1, question: "What is the Liana Banyan platform margin?", answer: "Cost + 20%", category: "Economics" },
  { id: 2, question: "What percentage does the creator keep?", answer: "83.3%", category: "Economics" },
  { id: 3, question: "What are the three currencies?", answer: "Credits, Marks, Joules", category: "System" },
  { id: 4, question: "What is the break-even threshold for physical manufacturing?", answer: "300 Members", category: "Manufacturing" },
  { id: 5, question: "What is a Joule?", answer: "A forever-stamp surplus token", category: "System" },
];

export default function Academy() {
  const navigate = useNavigate();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionProgress, setSessionProgress] = useState(0);
  const [marksEarned, setMarksEarned] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);

  const currentCard = FLASHCARDS[currentCardIndex];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleResponse = (quality: "easy" | "hard" | "fail") => {
    // In a real app, this would use the SuperMemo-2 (SM-2) or Leitner algorithm
    // to schedule the next review date in the database.

    let marksToAdd = 0;
    if (quality === "easy") marksToAdd = 2;
    if (quality === "hard") marksToAdd = 1;

    setMarksEarned(prev => prev + marksToAdd);

    if (marksToAdd > 0) {
      toast.success(`+${marksToAdd} Marks earned for retrieval practice!`);
    }

    const nextIndex = currentCardIndex + 1;
    setSessionProgress((nextIndex / FLASHCARDS.length) * 100);

    if (nextIndex < FLASHCARDS.length) {
      setCurrentCardIndex(nextIndex);
      setIsFlipped(false);
    } else {
      setSessionComplete(true);
    }
  };

  const restartSession = () => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setSessionProgress(0);
    setSessionComplete(false);
  };

  return (
    <PortalPageLayout maxWidth="lg" xrayId="academy">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Brain className="h-8 w-8 text-primary" />
            The Academy
          </h1>
          <p className="text-muted-foreground">Expanding Retrieval Practice Engine (Innovation #1558)</p>
        </div>
        <div className="flex items-center gap-4 bg-muted/50 p-3 rounded-lg border border-border/50">
          <div className="text-sm">
            <span className="text-muted-foreground">Session Marks:</span>
            <span className="font-bold text-amber-500 ml-2">+{marksEarned}</span>
          </div>
        </div>
      </div>

      {!sessionComplete ? (
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Card {currentCardIndex + 1} of {FLASHCARDS.length}</span>
              <span>{Math.round(sessionProgress)}% Complete</span>
            </div>
            <Progress value={sessionProgress} className="h-2" />
          </div>

          <Card className="min-h-[300px] flex flex-col relative overflow-hidden transition-all duration-500">
            <div className="absolute top-4 right-4">
              <Badge variant="outline">{currentCard.category}</Badge>
            </div>

            <CardContent className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              {!isFlipped ? (
                <div className="space-y-6 animate-in fade-in zoom-in duration-300">
                  <h2 className="text-2xl font-medium leading-relaxed">{currentCard.question}</h2>
                  <Button size="lg" onClick={handleFlip} className="mt-8 gap-2">
                    Reveal Answer <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-8 animate-in fade-in zoom-in duration-300 w-full">
                  <div className="space-y-2 pb-6 border-b border-border/50">
                    <p className="text-sm text-muted-foreground">Question:</p>
                    <p className="text-lg">{currentCard.question}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Answer:</p>
                    <h2 className="text-3xl font-bold text-primary">{currentCard.answer}</h2>
                  </div>
                </div>
              )}
            </CardContent>

            {isFlipped && (
              <CardFooter className="bg-muted/30 p-6 flex flex-col gap-4 border-t">
                <p className="text-sm text-center text-muted-foreground w-full">How well did you remember this?</p>
                <div className="grid grid-cols-3 gap-4 w-full">
                  <Button variant="outline" className="border-red-500/50 hover:bg-red-500/10 text-red-600" onClick={() => handleResponse("fail")}>
                    <X className="h-4 w-4 mr-2" /> Forgot
                  </Button>
                  <Button variant="outline" className="border-amber-500/50 hover:bg-amber-500/10 text-amber-600" onClick={() => handleResponse("hard")}>
                    <RotateCcw className="h-4 w-4 mr-2" /> Hard
                  </Button>
                  <Button variant="outline" className="border-green-500/50 hover:bg-green-500/10 text-green-600" onClick={() => handleResponse("easy")}>
                    <Check className="h-4 w-4 mr-2" /> Easy
                  </Button>
                </div>
              </CardFooter>
            )}
          </Card>
        </div>
      ) : (
        <Card className="max-w-2xl mx-auto text-center py-12">
          <CardContent className="space-y-6">
            <div className="mx-auto w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
              <Award className="h-10 w-10 text-green-500" />
            </div>
            <h2 className="text-3xl font-bold">Session Complete!</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              You've completed your retrieval practice for today. The algorithm has scheduled your next reviews based on your performance.
            </p>
            <div className="text-2xl font-bold text-amber-500 py-4">
              Total Earned: +{marksEarned} Marks
            </div>
            <div className="flex justify-center gap-4 pt-4">
              <Button variant="outline" onClick={restartSession}>Review Again</Button>
              <Button onClick={() => navigate("/dashboard")}>Return to Dashboard</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </PortalPageLayout>
  );
}
