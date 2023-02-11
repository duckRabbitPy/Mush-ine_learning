import { useUser } from "@auth0/nextjs-auth0";
import { useState } from "react";
import { RoundMetadata, TrainingData } from "../utils/serverSideUtils";

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

  const [trainingData, setTrainingData] = useState<TrainingData[] | []>([]);
  const [roundMetaData, setRoundMetaData] = useState<RoundMetadata[] | []>([]);
  const [round, setRound] = useState(0);
  const [omitArr, setOmitArr] = useState<string[]>([]);
  const [inputAnswer, setInputAnswer] = useState<string | null>(null);
  const [progress, setProgress] = useState<boolean[]>([]);
  const [score, setScore] = useState(0);
  const [numImagesLoaded, setNumImagesLoaded] = useState(0);
  const [maxIncorrect, setMaxIncorrect] = useState<number>(
    baseDifficulty.medium
  );

  return {
    user,
    trainingData,
    setTrainingData,
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
    numImagesLoaded,
    setNumImagesLoaded,
    maxIncorrect,
    setMaxIncorrect,
  };
}
