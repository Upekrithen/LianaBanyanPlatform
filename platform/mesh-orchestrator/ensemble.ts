import { NodeAnswer, QuestionResult } from './types.js';

export function ensembleQuestion(
  qId: string,
  questionText: string,
  correctAnswer: string,
  nodeAnswers: NodeAnswer[]
): QuestionResult {
  // Count votes per answer
  const votes = new Map<string, number>();
  for (const ans of nodeAnswers) {
    const key = ans.answer.trim().toUpperCase();
    votes.set(key, (votes.get(key) ?? 0) + 1);
  }

  // Find plurality winner
  let winner = '';
  let maxVotes = 0;
  let tieCount = 0;

  for (const [answer, count] of votes.entries()) {
    if (count > maxVotes) {
      winner = answer;
      maxVotes = count;
      tieCount = 1;
    } else if (count === maxVotes) {
      tieCount++;
    }
  }

  const disagreement = votes.size > 1;
  // contested: true if all-different OR perfect tie (no plurality)
  const contested = tieCount > 1 || maxVotes === 1 && votes.size > 1;

  // Tie-breaking: fall back to first-node answer
  if (contested && nodeAnswers.length > 0) {
    winner = nodeAnswers[0].answer.trim().toUpperCase();
  }

  return {
    q_id: qId,
    question_text: questionText,
    correct_answer: correctAnswer,
    node_answers: nodeAnswers,
    ensemble_winner: winner,
    is_correct: winner === correctAnswer.trim().toUpperCase(),
    disagreement_flag: disagreement,
    contested
  };
}

export function scoreRun(results: QuestionResult[]): { correct: number; total: number; pct: number } {
  const correct = results.filter(r => r.is_correct).length;
  return {
    correct,
    total: results.length,
    pct: Math.round(correct / results.length * 1000) / 10
  };
}
