import { v2 as cloudinary } from "cloudinary";
cloudinary.config({
  cloud_name: import.meta.env.VITE_cloud_name,
  api_key: import.meta.env.VITE_api_key,
  api_secret: import.meta.env.VITE_api_secret,
});

import { describe, expect, it } from "vitest";
import {
  getForageMushrooms,
  buildForageMushrooms,
  getMushroomImgPaths,
  tailoredNamePool,
} from "../serverSideUtils";

import { getMushroomNamesFromCloud } from "../../scripts/init";
import { z } from "zod";
import { isValidResult } from "../../server/routers/test/helpers";

const SNAPSHOT = {
  field: {},
  horse: {
    field: 20,
    medusa: 20,
    "agaricus-macrosporus": 10,
    "grey-spotted-amanita": 10,
  },
  medusa: { field: 10, horse: 10, "agaricus-macrosporus": 10 },
  prince: {},
  pavement: {
    horse: 40,
    "tawny-grisette": 20,
    "grey-spotted-amanita": 20,
    "blushing-wood-mushroom": 20,
  },
  "wood-mushroom": { horse: 20, "agaricus-macrosporus": 20 },
  "tawny-grisette": {},
  "orange-grisette": {
    "wood-mushroom": 5,
    "tawny-grisette": 5,
    "spring-fieldcap": 20,
    "grey-spotted-amanita": 20,
    "the-great-wood-mushroom": 5,
  },
  "spring-fieldcap": { "the-great-wood-mushroom": 20 },
  "agaricus-macrosporus": {
    field: 30,
    horse: 30,
    medusa: 30,
    "grey-spotted-amanita": 20,
  },
  "grey-spotted-amanita": { medusa: 5 },
  "blushing-wood-mushroom": {
    horse: 10,
    "agaricus-macrosporus": 10,
    "grey-spotted-amanita": 30,
  },
  "the-great-wood-mushroom": {},
};

describe("getMushroomNamesFromCloud returns an array of mushroom names", () => {
  it("array contains medusa", async () => {
    getMushroomNamesFromCloud().then((res) => expect(res).includes("medusa"));
  });
});

it("buildForageMushrooms returns test mushrooms with expected properties", async () => {
  const validationSchema = z.array(
    z.object({
      name: z.string().min(1),
      correctMatch: z.boolean(),
      src: z.string().url(),
    })
  );

  const result = await buildForageMushrooms(
    ["tawny-grisette", "grey-spotted-amanita", "blushing-wood-mushroom"],
    "horse",
    3
  );
  expect(isValidResult(result, validationSchema)).toBe(true);
});

describe("test getForageMushrooms", async () => {
  it("if maxIncorrect is set to 3, 4 mushrooms returned in total", async () => {
    await expect(getForageMushrooms([], 3, SNAPSHOT)).resolves.toHaveLength(4);
  });
});

describe("test getMushroomImgPaths", async () => {
  it("get all image paths returns strings containing cloudinary domain", async () =>
    getMushroomImgPaths("medusa", "low", 3).then((res) =>
      expect(res.every((i) => i.match(/cloudinary/))).toBe(true)
    ));
});

describe("test getMushroomSet", async () => {
  it("tailoredNamePool does not contain omitted mushroom name", async () => {
    const mushroomNamePool = Object.keys(SNAPSHOT);
    const omission = mushroomNamePool[0];
    const correctAnswer = mushroomNamePool[1];

    expect(
      tailoredNamePool(
        correctAnswer,
        mushroomNamePool,
        SNAPSHOT,
        mushroomNamePool.length,
        [omission]
      ).includes(omission)
    ).toEqual(false);
  });
});
