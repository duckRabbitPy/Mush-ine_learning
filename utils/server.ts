import { v2 as cloudinary } from "cloudinary";
import { CloudImage, SubfolderResult } from "../types";
import { randomArrItem } from "./client";

export type TestMushroom = {
  name: string;
  src: string;
  correctMatch: boolean;
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
  for (const mushroomName of mushroomNames) {
    if (count >= number) break;

    const images = (await cloudinary.api.resources({
      type: "upload",
      prefix: `mushroom_images/${mushroomName}`,
      max_results: 10,
    })) as { resources: CloudImage[] };

    const srcArr = images.resources.map((img: CloudImage) => img.url);

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
    .map((img: CloudImage) => img.url)
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

  return testMushrooms;
}

export async function getMushroomSet(omitArr: string[]) {
  const allMushroomNames = await getCloudMushrooms();
  const mushroomNamePool = allMushroomNames.filter(
    (mushroomName) => !omitArr.includes(mushroomName)
  );

  if (!mushroomNamePool.length) {
    return null;
  }
  const correctMushroom = randomArrItem(mushroomNamePool);
  const mushroomSet = await getAllMushroomImgPaths(correctMushroom);
  const otherOptions = allMushroomNames
    .filter((m) => m !== correctMushroom)
    .map((m, _, arr) => randomArrItem(arr))
    .slice(0, 3);

  return { correctMushroom, mushroomSet, otherOptions };
}
