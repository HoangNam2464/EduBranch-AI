/**
 * EduBranch AI — AI Reasoning / Challenge Support (FE-021, Figma 05.5 / 05.6 / 05.7).
 *
 * NON-NEGOTIABLE INVARIANTS (FND §6.1, feature-challenge-support.md):
 * 1. Hard cap: Maximum 2 rounds (Round 1 & Round 2). After Round 2 or conclusion, session is locked.
 * 2. Absolute zero grading: Never display scores, ratings, letter grades, or pass/fail decisions.
 * 3. Socratic counter-questions only, designed to probe assumptions and trade-offs.
 * 4. Strict Design System tokens & i18n useTranslation: No hardcoded hex colors, no raw text.
 */
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { Dialog, cx, FOCUS_RING } from "@/components/ds";
import { useShellTitle } from "@/layouts/shell/ShellTitleContext";
import { PATHS, buildPath } from "@/routes/paths";
import { SocraticDialoguePanel, ChallengeMessage } from "@/components/challenge/SocraticDialoguePanel";

export function ChallengeDialog({
  open,
  onClose,
  stepNumber,
  decision,
  originalReasoning,
}: {
  open: boolean;
  onClose: () => void;
  stepNumber: number;
  decision: string;
  originalReasoning?: string;
}) {
  const { t } = useTranslation();
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Initial Socratic counter-question for Round 1 via i18n
  const [messages, setMessages] = useState<ChallengeMessage[]>([
    {
      id: "initial-q1",
      round: 1,
      role: "ai",
      content: t("g5.challenge.q1Prompt"),
    },
  ]);

  const handleSubmitReply = async (replyText: string) => {
    setIsLoading(true);
    // Record student reply
    const studentMsg: ChallengeMessage = {
      id: `student-r${currentRound}-${Date.now()}`,
      round: currentRound,
      role: "student",
      content: replyText,
    };

    const nextMessages = [...messages, studentMsg];

    if (currentRound === 1) {
      // Transition to Round 2 with a final follow-up question via i18n
      const aiFollowUp: ChallengeMessage = {
        id: `ai-r2-${Date.now()}`,
        round: 2,
        role: "ai",
        content: t("g5.challenge.q2FollowUp"),
      };
      setMessages([...nextMessages, aiFollowUp]);
      setCurrentRound(2);
    } else {
      // Reached 2-round hard cap -> lock session
      setMessages(nextMessages);
      setIsCompleted(true);
    }
    setIsLoading(false);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      width={720}
      title={t("g5.challenge.title")}
      description={t("g5.challenge.description")}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label={t("g5.common.close")}
        className={cx(
          "absolute top-6 right-6 flex size-5 cursor-pointer items-center justify-center rounded-eb-sm text-ink-secondary hover:text-ink",
          FOCUS_RING
        )}
      >
        <X aria-hidden="true" size={20} absoluteStrokeWidth strokeWidth={1.33} />
      </button>

      <div className="pt-2">
        <SocraticDialoguePanel
          stepNumber={stepNumber}
          decisionText={decision}
          originalReasoning={originalReasoning}
          currentRound={currentRound}
          maxRounds={2}
          isCompleted={isCompleted}
          messages={messages}
          onSubmitReply={handleSubmitReply}
          onConcludeSession={onClose}
          isLoading={isLoading}
        />
      </div>
    </Dialog>
  );
}

/**
 * Standalone route PATHS.STUDENT.CHALLENGE (/student/cases/:caseId/challenge/:sessionId).
 */
export function ChallengeSupportPage() {
  const { t } = useTranslation();
  const { caseId = "" } = useParams();
  const navigate = useNavigate();
  useShellTitle(t("g5.challenge.title"));

  const [currentRound, setCurrentRound] = useState<number>(1);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [messages, setMessages] = useState<ChallengeMessage[]>([
    {
      id: "initial-q1",
      round: 1,
      role: "ai",
      content: t("g5.challenge.q1Prompt"),
    },
  ]);

  const handleReturn = () => {
    navigate(buildPath(PATHS.STUDENT.BRANCHING_PLAY, { caseId }));
  };

  const handleSubmitReply = async (replyText: string) => {
    setIsLoading(true);
    const studentMsg: ChallengeMessage = {
      id: `student-r${currentRound}-${Date.now()}`,
      round: currentRound,
      role: "student",
      content: replyText,
    };

    const nextMessages = [...messages, studentMsg];

    if (currentRound === 1) {
      const aiFollowUp: ChallengeMessage = {
        id: `ai-r2-${Date.now()}`,
        round: 2,
        role: "ai",
        content: t("g5.challenge.q2FollowUp"),
      };
      setMessages([...nextMessages, aiFollowUp]);
      setCurrentRound(2);
    } else {
      setMessages(nextMessages);
      setIsCompleted(true);
    }
    setIsLoading(false);
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 py-4">
      <SocraticDialoguePanel
        stepNumber={1}
        decisionText={t("g5.challenge.defaultDecision")}
        currentRound={currentRound}
        maxRounds={2}
        isCompleted={isCompleted}
        messages={messages}
        onSubmitReply={handleSubmitReply}
        onConcludeSession={handleReturn}
        isLoading={isLoading}
      />
    </div>
  );
}
