export type DesignRound = {
  id: string;
  title: string;
  status: string;
  startsAt: string;
  endsAt: string;
};

export type DesignEntry = {
  id: string;
  battleId: string;
  designerId: string;
  designerName: string;
  submissionUrl: string | null;
  votes: number;
  label: "Leading" | "Strong contender" | "Needs votes";
};

export type WinnerArchiveItem = {
  battleId: string;
  title: string;
  completedAt: string;
  winnerName: string;
};
