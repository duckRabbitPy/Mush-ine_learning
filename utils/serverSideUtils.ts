import { randomArrItem, shuffleArrayCopy } from "./pureFunctions";
import {
  getCachedMushroomImages,
  getCachedMushroomNames,
} from "../server/database/model";

export type ForageMushroom = {
  name: string;
  src: string;
  correctMatch: boolean;
};

export type TrainingData = {
  misidentifiedMushroom: string | null;
  weightingData: Record<string, number> | null;
};

export type RoundMetadata = {
  game_type: Game_type;
  correct_answer: boolean;
  correct_mushroom: MushroomName;
};

export const ImageQuality = {
  low: "q_5,w_250",
  medium: "q_60,w_250",
  high: "q_80,w_250",
  highest: "q_100",
} as const;

export async function buildForageMushrooms(
  mushroomNames: string[],
  correctMatch: string,
  max: number
): Promise<ForageMushroom[]> {
  const options = shuffleArrayCopy(mushroomNames);
  options.unshift(correctMatch);

  const forageMushrooms = options.map((mushroomName, index) => {
    if (index > max) return null;
    return getMushroomImgPaths(mushroomName, "high", 9).then((srcArr) => {
      return {
        name: mushroomName,
        src: randomArrItem(srcArr) || "/shroomschool.png",
        correctMatch: mushroomName === correctMatch,
      };
    });
  });

  const testMushroomArr = await Promise.all(forageMushrooms);

  return testMushroomArr.flatMap((f) => (f ? [f] : []));
}

export async function getMushroomImgPaths(
  mushroomName: string,
  quality: keyof typeof ImageQuality,
  numVariations: number = 1
): Promise<string[]> {
  const allImages = await getCachedMushroomImages();
  if (!allImages) return [];

  const images = allImages
    .filter((image) => image?.folder?.includes(mushroomName))
    .splice(0, numVariations);

  const srcArr = images
    .map((img: CloudImage) => {
      return img.url?.replace("upload", `upload/${ImageQuality[quality]}`);
    })
    .flatMap((f) => (f ? [f] : []));

  return srcArr;
}

export async function getForageMushrooms(
  omitArr: string[],
  maxIncorrect: number,
  snapshot: Record<MushroomName, SummedWeights> | null | undefined
) {
  const allMushroomNames = await getCachedMushroomNames();
  if (!allMushroomNames) return null;

  const correctMatch = randomArrItem(allMushroomNames);

  const mushroomNamePool = allMushroomNames
    .filter((mushroomName) => !omitArr.includes(mushroomName))
    .filter((mushroom) => mushroom !== correctMatch);

  const tailoredMushroomPool = tailoredNamePool(
    correctMatch,
    mushroomNamePool,
    snapshot,
    maxIncorrect,
    omitArr
  );

  if (!tailoredMushroomPool.length) {
    return [];
  }

  const forageMushrooms = await buildForageMushrooms(
    tailoredMushroomPool,
    correctMatch,
    maxIncorrect
  );

  const testMushrooms = forageMushrooms.map((mushroom) => {
    return mushroom.name === correctMatch
      ? { ...mushroom, correctMatch: true }
      : { ...mushroom, correctMatch: false };
  });

  return shuffleArrayCopy(testMushrooms);
}

export async function getMushroomSet(
  omitArr: string[],
  numOptions: number,
  snapshot: Record<MushroomName, SummedWeights> | null | undefined
) {
  const allMushroomNames = await getCachedMushroomNames();
  if (!allMushroomNames) return null;
  const mushroomNamePool = allMushroomNames.filter(
    (mushroomName) => !omitArr.includes(mushroomName)
  );

  if (!mushroomNamePool.length) {
    return null;
  }

  const correctMushroom = randomArrItem(mushroomNamePool);
  const mushroomImgSrcs = await getMushroomImgPaths(correctMushroom, "high", 9);

  const correctIndex = mushroomNamePool.findIndex((x) => x === correctMushroom);
  mushroomNamePool.splice(correctIndex, 1);

  let optionsArr: string[] = [];
  let count = 0;

  const tailoredMushroomPool = tailoredNamePool(
    correctMushroom,
    mushroomNamePool,
    snapshot,
    numOptions,
    omitArr
  );

  for (const _ of tailoredMushroomPool.slice()) {
    if (count >= numOptions) {
      break;
    } else {
      const item = randomArrItem(tailoredMushroomPool);
      optionsArr.push(item);
      const index = tailoredMushroomPool.findIndex((x) => x === item);
      tailoredMushroomPool.splice(index, 1);
      count++;
    }
  }

  optionsArr.push(correctMushroom);
  const options = shuffleArrayCopy(optionsArr);

  return {
    correctMushroom,
    mushroomImgSrcs: shuffleArrayCopy(mushroomImgSrcs),
    options,
  };
}

export function tailoredNamePool(
  correctAnswer: string,
  mushroomNamePool: string[],
  snapshot: Record<MushroomName, SummedWeights> | undefined | null,
  maxOptions: number,
  omitArr: string[]
) {
  if (!snapshot) {
    return mushroomNamePool;
  }

  const misidentified = snapshot[correctAnswer];

  if (!misidentified) return mushroomNamePool;

  const ranked = Object.entries(misidentified)
    .sort(([, weightA], [, weightB]) => Number(weightB) - Number(weightA))
    .map(([mushroomName]) => mushroomName)
    .slice(0, Math.round(maxOptions / 2));

  const highRankedRemoved = mushroomNamePool.filter(
    (mushroom) => !ranked.includes(mushroom)
  );

  const tailoredArray = [...ranked, ...highRankedRemoved].filter(
    (mushroomName) => !omitArr.includes(mushroomName)
  );

  return tailoredArray.slice(0, maxOptions);
}
