import { useUser } from "@auth0/nextjs-auth0";
import { useState } from "react";
import { RoundMetadata, TrainingData } from "../utils/server_side";

export function useGameState() {
  const { user } = useUser();

  const [trainingResult, setTrainingResult] = useState<TrainingData[] | []>([]);
  const [roundMetaData, setRoundMetaData] = useState<RoundMetadata[] | []>([]);
  const [round, setRound] = useState(0);
  const [omitArr, setOmitArr] = useState<string[]>([]);
  const [inputAnswer, setInputAnswer] = useState<string | null>(null);
  const [progress, setProgress] = useState<boolean[]>([]);
  const [score, setScore] = useState(0);

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
  };
}
