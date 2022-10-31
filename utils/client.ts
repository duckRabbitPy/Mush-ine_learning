import { TestMushroom, TrainingData } from "./server";

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
