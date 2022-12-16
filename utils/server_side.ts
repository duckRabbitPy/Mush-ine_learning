import { v2 as cloudinary } from "cloudinary";
import {
  Game_types,
  MushroomName as MushroomName,
  SummedWeights,
} from "../server/database/model";
import { CloudImage, SubfolderResult } from "../types";

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
  game_type: Game_types;
  correct_answer: boolean;
  correct_mushroom: MushroomName;
};

export async function getMushroomNames() {
  const images = (await cloudinary.api.sub_folders("mushroom_images")) as
    | {
        folders: SubfolderResult[];
      }
    | undefined;
  return images ? images.folders.map((i) => i.name) : [];
}

export async function buildForageMushrooms(
  mushroomNames: string[],
  number: number
): Promise<ForageMushroom[]> {
  let testMushroomArr = [];
  let count = 0;

  for (const mushroomName of mushroomNames.slice()) {
    if (count >= number) break;

    const images = (await cloudinary.api.resources({
      type: "upload",
      prefix: `mushroom_images/${mushroomName}`,
      max_results: 10,
    })) as { resources: CloudImage[] };

    const srcArr = images.resources.map((img: CloudImage) => {
      return img.url?.replace("upload", "upload/q_80");
    });

    const src = randomArrItem(srcArr);
    testMushroomArr.push({
      name: mushroomName,
      src: src || "/shroomschool.png",
      correctMatch: false,
    });

    count++;
  }

  return testMushroomArr;
}

export async function getMushroomImgPaths(
  mushroomName: string,
  max?: number
): Promise<string[]> {
  const images = (await cloudinary.api.resources({
    type: "upload",
    prefix: `mushroom_images/${mushroomName}`,
    max_results: max || 9,
  })) as { resources: CloudImage[] };

  const srcArr = images.resources
    .map((img: CloudImage) => {
      return img.url?.replace("upload", "upload/q_80");
    })
    .flatMap((f) => (f ? [f] : []));

  return srcArr;
}

export async function getForageMushrooms(
  omitArr: string[],
  maxIncorrect: number,
  snapshot: Record<MushroomName, SummedWeights> | null | undefined
) {
  const allMushroomNames = await getMushroomNames();

  const chosen = randomArrItem(allMushroomNames);
  const mushroomNamePool = allMushroomNames
    .filter((mushroomName) => !omitArr.includes(mushroomName))
    .filter((mushroom) => mushroom !== chosen);

  const tailoredMushroomPool = tailoredNamePool(
    chosen,
    mushroomNamePool,
    snapshot,
    maxIncorrect,
    omitArr
  );

  if (!tailoredMushroomPool.length) {
    return [];
  }
  const unselectedMushrooms = await buildForageMushrooms(
    tailoredMushroomPool,
    maxIncorrect
  );

  const selectedArr = await buildForageMushrooms([chosen], 1);
  const joinedMushrooms = [...selectedArr, ...unselectedMushrooms];

  const testMushrooms = joinedMushrooms.map((mushroom) => {
    if (mushroom.name === chosen) {
      return { ...mushroom, correctMatch: true };
    }
    return mushroom;
  });

  return shuffleArrayCopy(testMushrooms);
}

export async function getMushroomSet(
  omitArr: string[],
  numOptions: number,
  snapshot: Record<MushroomName, SummedWeights> | null | undefined
) {
  const allMushroomNames = await getMushroomNames();
  const mushroomNamePool = allMushroomNames.filter(
    (mushroomName) => !omitArr.includes(mushroomName)
  );

  if (!mushroomNamePool.length) {
    return null;
  }
  const correctMushroom = randomArrItem(mushroomNamePool);
  const mushroomImgSrcs = await getMushroomImgPaths(correctMushroom);

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

export function randomArrItem<Type>(arr: Type[]) {
  const min = 0;
  const max = Math.floor(arr.length - 1);
  const index = Math.floor(Math.random() * (max - min + 1)) + min;
  return arr[index];
}

export function shuffleArrayCopy<Type>(unshuffledArr: Type[]) {
  const arr = unshuffledArr.slice();
  let currIndex = 0;
  for (const _item in arr) {
    let randomIndex = Math.floor(Math.random() * (currIndex + 1));
    [arr[currIndex], arr[randomIndex]] = [arr[randomIndex], arr[currIndex]];
    currIndex++;
  }

  return arr;
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
  const ranked = Object.entries(misidentified)
    .sort(([, weightA], [, weightB]) => Number(weightB) - Number(weightA))
    .map((kvp) => kvp[0])
    .slice(0, Math.round(maxOptions / 2));

  const highRankedRemoved = mushroomNamePool.filter(
    (mushroom) => !ranked.includes(mushroom)
  );

  const tailoredArray = [...ranked, ...highRankedRemoved].filter(
    (mushroomName) => !omitArr.includes(mushroomName)
  );

  return tailoredArray.slice(0, maxOptions);
}
