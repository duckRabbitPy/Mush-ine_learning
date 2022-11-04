import { mushine_round_metadata } from "../server/database/model";
import { TestMushroom, TrainingData } from "./server_side";

export function extractTrainingData(
  testMushrooms: TestMushroom[],
  trainingData: TrainingData[] | undefined
) {
  const trainingDataCopy = trainingData?.slice() ?? [];
  const trainingResult: TrainingData = {
    misidentifiedMushroom: null,
    weightingData: null,
  };

  const weightingObj: Record<string, number> = {};
  const testMushroomSlice = testMushrooms && testMushrooms.slice();
  testMushroomSlice?.forEach((mushroom) => {
    if (!mushroom.correctMatch) {
      weightingObj[mushroom.name as keyof typeof weightingObj] = 10;
    }
  });
  trainingResult.misidentifiedMushroom = testMushrooms?.filter(
    (m) => m.correctMatch
  )[0].name;

  trainingResult.weightingData = weightingObj;
  trainingDataCopy.push(trainingResult);

  return trainingDataCopy;
}

export function shuffleArrayCopy<Type>(unshuffledArr: Type[] | undefined) {
  if (!unshuffledArr) {
    return null;
  }
  const arr = unshuffledArr.slice();
  let currIndex = 0;
  for (const _item in arr) {
    let randomIndex = Math.floor(Math.random() * (currIndex + 1));
    [arr[currIndex], arr[randomIndex]] = [arr[randomIndex], arr[currIndex]];
    currIndex++;
  }

  return arr;
}

export type reducedAnswers = {
  correct: number;
  incorrect: number;
  percentageCorrect: number;
};

export function reduceAnswerCount(
  data:
    | Pick<
        mushine_round_metadata,
        "game_type" | "correct_answer" | "correct_mushroom"
      >[]
    | undefined
) {
  return data?.reduce((acc, curr) => {
    if (curr["correct_answer"] && !acc["correct"]) {
      acc["correct"] = 1;
    } else if (curr["correct_answer"]) {
      acc["correct"] += 1;
    }

    if (!curr["correct_answer"] === false && !acc["incorrect"]) {
      acc["incorrect"] = 1;
    } else if (curr["correct_answer"] === false) {
      acc["incorrect"] += 1;
    }

    acc["percentageCorrect"] =
      (acc["correct"] / (acc["incorrect"] + acc["correct"])) * 100;

    return acc;
  }, {} as reducedAnswers);
}

export function currLevelInfo(
  currXp: number | undefined,
  currLevel: number | undefined,
  score: number | undefined
) {
  if (!currXp || !currLevel) {
    // TODO handle starter and null cases better
    return { levelUp: false, xpToNextLevel: 0, boundaryAhead: 10000 };
  }

  const safeScore = score ?? 0;
  const levelBoundaries = [];

  for (let i = 1; i < currLevel + 1; i++) {
    levelBoundaries.push(Math.round(i * 100 * (i / 2)));
  }

  const boundaryAhead = levelBoundaries[currLevel - 1];

  if (boundaryAhead < currXp + (score ?? 0)) {
    const xpToNextLevel = levelBoundaries[currLevel + 1] - (currXp + safeScore);
    return { levelUp: true, xpToNextLevel, boundaryAhead };
  }

  const xpToNextLevel = boundaryAhead - currXp + safeScore;
  return { levelUp: false, xpToNextLevel, boundaryAhead };
}
