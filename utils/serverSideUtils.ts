import { v2 as cloudinary } from "cloudinary";
import storedMushrooms from "../server/fileSystemData/mushroomNames.json";

import { randomArrItem, shuffleArrayCopy } from "./pureFunctions";

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
  low: "q_5",
  medium: "q_60",
  high: "q_80",
  highest: "q_100",
} as const;

export async function getStoredMushroomNames() {
  return storedMushrooms.mushroomNames;
}

export async function buildForageMushrooms(
  mushroomNames: string[],
  correctMatch: string,
  max: number
): Promise<ForageMushroom[]> {
  const options = shuffleArrayCopy(mushroomNames);
  options.unshift(correctMatch);

  const forageMushrooms = options.map((mushroomName, index) => {
    if (index > max) return null;
    return cloudinary.api
      .resources({
        type: "upload",
        prefix: `mushroom_images/${mushroomName}`,
        max_results: 1,
      })
      .then((cloudinaryResult: CloudinaryResult) => {
        return {
          name: mushroomName,
          src:
            cloudinaryResult.resources[0].url?.replace(
              "upload",
              "upload/q_80"
            ) || "/shroomschool.png",
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
  max?: number
): Promise<string[]> {
  const images: { resources: CloudImage[] } = await cloudinary.api.resources({
    type: "upload",
    prefix: `mushroom_images/${mushroomName}`,
    max_results: max || 9,
  });

  const srcArr = images.resources
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
  const allMushroomNames = await getStoredMushroomNames();

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
  const allMushroomNames = await getStoredMushroomNames();
  const mushroomNamePool = allMushroomNames.filter(
    (mushroomName) => !omitArr.includes(mushroomName)
  );

  if (!mushroomNamePool.length) {
    return null;
  }
  const correctMushroom = randomArrItem(mushroomNamePool);
  const mushroomImgSrcs = await getMushroomImgPaths(correctMushroom, "high");

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
