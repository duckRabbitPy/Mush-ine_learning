import { ForageMushroom, TrainingData } from "./serverSideFunctions";

export function extractTrainingData(
  testMushrooms: ForageMushroom[],
  trainingData: TrainingData[] | undefined
) {
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

  const trainingDataCopy = trainingData?.slice() ?? [];
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
        Mushine_round_metadata,
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
  currLevel: number | undefined
) {
  const levelBoundaries = generateLvlBoundaries();
  const boundaryAhead = levelBoundaries[currLevel ? currLevel + 1 : 0];
  const boundaryBehind =
    currLevel && currLevel > 0 ? levelBoundaries[currLevel] : 0;
  const xpToNextLevel = boundaryAhead - (currXp ?? 0);
  return { xpToNextLevel, boundaryAhead, boundaryBehind };
}

export function returnLvl(xp: number | undefined | null | void) {
  const XP = xp ?? 0;
  let levelBoundaries = generateLvlBoundaries();

  const level = levelBoundaries.reduce((acc, curr, i, arr) => {
    if (curr <= XP && XP < arr[i + 1]) {
      acc = i + 1;
    }
    return acc;
  }, 0);

  return level;
}

export function generateLvlBoundaries() {
  let levelBoundaries = [];
  for (let i = 1; i <= 99; i++) {
    levelBoundaries.push(Math.round(i * 100 * (i / 2)));
  }

  return levelBoundaries;
}

export function sortObjectByNumValues(obj: Record<string, number>) {
  return Object.entries(obj)
    .sort((a, b) => b[1] - a[1])
    .reduce((acc, curr) => {
      acc[`${curr[0]}` as keyof typeof acc] = curr[1];
      return acc;
    }, {} as Record<string, number>);
}

export function heatMapAccuracy(heatmap: TimeAndResult[]) {
  const numCorrect = heatmap.filter((result) => result.correct_answer).length;
  const numIncorrect = heatmap.filter(
    (result) => !result.correct_answer
  ).length;

  return Math.ceil((numCorrect / (numCorrect + numIncorrect)) * 100);
}

export function sortInsightData(
  chartData: [string, SummedWeights][] | undefined,
  heatmaps: Heatmaps | undefined,
  filter: InsightSortOptions
) {
  if (!heatmaps || !chartData) return chartData;

  return chartData.sort((a, b) => {
    if (filter === InsightSortOptions.Alphabetical) {
      return a[0].localeCompare(b[0]);
    }
    const heatmapA = heatmaps[a[0]];
    const accuracyA = heatMapAccuracy(heatmapA);

    const heatmapB = heatmaps[b[0]];
    const accuracyB = heatMapAccuracy(heatmapB);

    if (accuracyA < accuracyB)
      return filter === InsightSortOptions.HighAccuracyFirst ? 1 : -1;
    if (accuracyA > accuracyB)
      return filter === InsightSortOptions.HighAccuracyFirst ? -1 : 1;
    return 0;
  });
}

export function randomArrItem<Type>(arr: Type[]) {
  const min = 0;
  const max = Math.floor(arr.length - 1);
  const index = Math.floor(Math.random() * (max - min + 1)) + min;
  return arr[index];
}
