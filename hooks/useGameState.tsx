import { useUser } from "@auth0/nextjs-auth0";
import { useState } from "react";
import { RoundMetadata, TrainingData } from "../utils/server_side";

export const baseDifficulty = {
  easy: 2,
  medium: 3,
  hard: 4,
  pro: 5,
} as const;

export const tileDifficulty = {
  easy: 6,
  medium: 7,
  hard: 8,
  pro: 9,
} as const;

export function useGameState() {
  const { user } = useUser();

  const [trainingResult, setTrainingResult] = useState<TrainingData[] | []>([]);
  const [roundMetaData, setRoundMetaData] = useState<RoundMetadata[] | []>([]);
  const [round, setRound] = useState(0);
  const [omitArr, setOmitArr] = useState<string[]>([]);
  const [inputAnswer, setInputAnswer] = useState<string | null>(null);
  const [progress, setProgress] = useState<boolean[]>([]);
  const [score, setScore] = useState(0);
  const [maxIncorrect, setDifficulty] = useState(baseDifficulty.medium);

  return {
    user,
    trainingResult,
    setTrainingResult,
    roundMetaData,
    round,
    setRound,
    setRoundMetaData,
    omitArr,
    setOmitArr,
    inputAnswer,
    setInputAnswer,
    progress,
    setProgress,
    score,
    setScore,
    maxIncorrect,
    setDifficulty,
  };
}
