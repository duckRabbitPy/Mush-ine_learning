import { v2 as cloudinary } from "cloudinary";
import {
  game_types,
  name_string,
  snapshotType,
} from "../server/database/model";
import { CloudImage, SubfolderResult } from "../types";

export type TestMushroom = {
  name: string;
  src: string;
  correctMatch: boolean;
};

export type TrainingData = {
  misidentifiedMushroom: string | null;
  weightingData: Record<string, number> | null;
};

export type RoundMetadata = {
  game_type: game_types;
  correct_answer: boolean;
  correct_mushroom: name_string;
};

export async function getCloudMushrooms() {
  const images = (await cloudinary.api.sub_folders("mushroom_images")) as
    | {
        folders: SubfolderResult[];
      }
    | undefined;
  return images ? images.folders.map((i) => i.name) : [];
}

async function buildTestMushrooms(
  mushroomNames: string[],
  number: number
): Promise<TestMushroom[]> {
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

    if (!srcArr) {
      testMushroomArr.push({
        name: mushroomName,
        src: "/shroomschool.png",
        correctMatch: false,
      });
    } else {
      const src = randomArrItem(srcArr);
      testMushroomArr.push({
        name: mushroomName,
        src: src || "/shroomschool.png",
        correctMatch: false,
      });
    }
    count++;
  }

  return testMushroomArr;
}

async function getAllMushroomImgPaths(mushroomName: string): Promise<string[]> {
  const images = (await cloudinary.api.resources({
    type: "upload",
    prefix: `mushroom_images/${mushroomName}`,
    max_results: 9,
  })) as { resources: CloudImage[] };

  const srcArr = images.resources
    .map((img: CloudImage) => {
      return img.url?.replace("upload", "upload/q_80");
    })
    .flatMap((f) => (f ? [f] : []));

  return srcArr;
}

export async function getTestMushrooms(omitArr: string[], max: number) {
  const allMushroomNames = await getCloudMushrooms();
  const mushroomNamePool = allMushroomNames.filter(
    (mushroomName) => !omitArr.includes(mushroomName)
  );

  if (!mushroomNamePool.length) {
    return [];
  }
  const unselectedMushrooms = await buildTestMushrooms(mushroomNamePool, max);
  const chosen = randomArrItem(unselectedMushrooms).name;

  const testMushrooms = unselectedMushrooms.map((mushroom) => {
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
  snapshot: Record<string, snapshotType> | null | undefined
) {
  const allMushroomNames = await getCloudMushrooms();
  const mushroomNamePool = allMushroomNames.filter(
    (mushroomName) => !omitArr.includes(mushroomName)
  );

  if (!mushroomNamePool.length) {
    return null;
  }
  const correctMushroom = randomArrItem(mushroomNamePool);
  const mushroomSet = await getAllMushroomImgPaths(correctMushroom);

  const correctIndex = mushroomNamePool.findIndex((x) => x === correctMushroom);
  mushroomNamePool.splice(correctIndex, 1);

  let optionsArr: string[] = [];
  let count = 0;

  const tailoredMushroomPool = tailoredNamePool(
    correctMushroom,
    mushroomNamePool,
    snapshot,
    numOptions
  );

  for (const _ of tailoredMushroomPool.slice()) {
    if (count >= numOptions - 1) {
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
    mushroomSet: shuffleArrayCopy(mushroomSet),
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
  snapshot: Record<string, snapshotType> | undefined | null,
  returnLength: number
) {
  if (!snapshot) {
    return mushroomNamePool;
  }
  const misidentified = snapshot[correctAnswer];
  const ranked = Object.entries(misidentified)
    .sort(([, weightA], [, weightB]) => Number(weightB) - Number(weightA))
    .map((kvp) => kvp[0]);

  const highRankedRemoved = mushroomNamePool.filter(
    (mushroom) => !ranked.includes(mushroom)
  );
  const tailoredArray = [...ranked, ...highRankedRemoved];
  return tailoredArray.slice(0, returnLength);
}
