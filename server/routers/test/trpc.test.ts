/* eslint-disable import/prefer-default-export */
import { beforeEach, describe, expect, it } from "vitest";
import { z } from "zod";
import { freshDatabase, isValidResult } from "./helpers";
import { createTestContext } from "../../context";
import { v2 as cloudinary } from "cloudinary";
import { appRouter } from "../_app";

cloudinary.config({
  cloud_name: import.meta.env.VITE_cloud_name,
  api_key: import.meta.env.VITE_api_key,
  api_secret: import.meta.env.VITE_api_secret,
});

const userWithAuth = createTestContext({ withAuth: true });
const userNoAuth = createTestContext({ withAuth: false });

const TRAINING_DATA: GameData = {
  trainingData: [
    {
      misidentifiedMushroom: "field",
      weightingData: {
        horse: 10,
        medusa: 10,
      },
    },
  ],
  score: 100,
  roundMetaData: [
    {
      game_type: "forage",
      correct_answer: false,
      correct_mushroom: "horse",
    },
    {
      game_type: "forage",
      correct_answer: false,
      correct_mushroom: "blusher",
    },
    {
      game_type: "forage",
      correct_answer: true,
      correct_mushroom: "pavement",
    },
    {
      game_type: "forage",
      correct_answer: true,
      correct_mushroom: "oak-bolete",
    },
  ],
};

describe("Auth middleware", async () => {
  it("Error thrown if userNoAuth uses protected route", async () => {
    const caller = appRouter.createCaller(userNoAuth);
    expect(caller.getHeatMaps).rejects.toThrow("UNAUTHORIZED");
  });
});

describe("TRPC calls relying on Cloudinary calls", async () => {
  it("retrieveMushroomImgSrcs return correct number of images", async () => {
    const caller = appRouter.createCaller(userNoAuth);
    const result = await caller.retrieveMushroomImgSrcs([
      "horse",
      "medusa",
      "prince",
    ]);

    const validationSchema = z.object({
      horse: z.string().min(1),
      medusa: z.string().min(1),
      prince: z.string().min(1),
    });
    expect(isValidResult(result, validationSchema)).toEqual(true);
  });

  it("no auth required to call retrieveMushroomSet", async () => {
    const validationSchema = z.object({
      correctMushroom: z.string().min(1),
      mushroomImgSrcs: z.array(z.string()).min(1),
      options: z.array(z.string()).min(4),
    });

    const caller = appRouter.createCaller(userNoAuth);
    const result = await caller.retrieveMushroomSet({
      numOptions: 4,
      omitArr: [],
    });

    expect(isValidResult(result, validationSchema)).toEqual(true);
  });

  describe("can retreive valid mushrooms for forage game", async () => {
    const caller = appRouter.createCaller(userNoAuth);
    const result = await caller.retrieveForageMushrooms({
      omitArr: [],
      maxIncorrect: 3,
    });

    const validationSchema = z.object({
      correctMatch: z.boolean(),
      name: z.string().min(1),
      src: z.string().min(1),
    });

    it("all forage mushroom properties non null", async () => {
      expect(isValidResult(result[0], validationSchema)).toEqual(true);
    });

    it("one forage mushroom has correctMatch set to true", async () => {
      const hasCorrectMatch = result.some((mushroom) => mushroom.correctMatch);
      expect(hasCorrectMatch).toEqual(true);
    });

    it("remaining forage mushrooms have correctMatch set to false", async () => {
      const hasThreefalse =
        result.reduce((acc, curr) => {
          if (curr.correctMatch === false) {
            acc++;
          }
          return acc;
        }, 0) === 3;
      expect(hasThreefalse).toEqual(true);
    });
  });
});

describe("TRPC calls associated with in GameData", async () => {
  beforeEach(() => freshDatabase());
  const userId = userWithAuth.user.sub;

  if (!userId) throw new Error("No userId for test");

  it("training data stored and retreived in snapshot", async () => {
    const caller = appRouter.createCaller(userWithAuth);
    await caller.saveGameData(TRAINING_DATA);

    const validationSchema = z.object({
      horse: z.literal(10),
      medusa: z.literal(10),
    });

    const saveResult = await caller.saveLevelSnapShot();
    const result = saveResult?.snapshot["field"];
    expect(isValidResult(result, validationSchema)).toEqual(true);
  });

  it("XP stored and retrieved", async () => {
    const caller = appRouter.createCaller(userWithAuth);
    await caller.saveGameData(TRAINING_DATA);
    await caller.saveGameData(TRAINING_DATA);
    const validationSchema = z.literal(200);
    const result = await caller.retrieveUserXP();
    expect(isValidResult(result, validationSchema)).toEqual(true);
  });

  it("heatmap data stored and retrieved", async () => {
    const caller = appRouter.createCaller(userWithAuth);
    await caller.saveGameData(TRAINING_DATA);

    const validationSchema = z.object({
      correct_answer: z.boolean(),
      timestamp: z.date(),
    });

    const result = await caller.getHeatMaps();
    const singleEntry = result["blusher"][0];
    expect(isValidResult(singleEntry, validationSchema)).toEqual(true);
  });

  it("activity data stored and retrieved", async () => {
    const caller = appRouter.createCaller(userWithAuth);
    await caller.saveGameData(TRAINING_DATA);
    const validationSchema = z.record(z.number());
    const result = await caller.retrieveActivity();
    expect(isValidResult(result, validationSchema)).toEqual(true);
  });

  it("getStudyImages returns chosenMushroom name and images", async () => {
    const validationSchema = z.object({
      chosenMushroomName: z.union([z.literal("horse"), z.literal("medusa")]),
      studyImgSrcs: z.array(z.string()).nonempty(),
    });

    const caller = appRouter.createCaller(userWithAuth);
    await caller.saveGameData(TRAINING_DATA);

    const result = await caller.getStudyImages();
    expect(isValidResult(result, validationSchema)).toEqual(true);
  });

  it("roundMetaData stored and retrieved", async () => {
    const caller = appRouter.createCaller(userWithAuth);
    const validationSchema = z.object({
      forage: z.object({
        correct: z.literal(2),
        incorrect: z.literal(2),
        percentageCorrect: z.literal(50),
      }),
      multi: z.object({
        correct: z.literal(0),
        incorrect: z.literal(0),
        percentageCorrect: z.literal(0),
      }),
      tile: z.object({
        correct: z.literal(0),
        incorrect: z.literal(0),
        percentageCorrect: z.literal(0),
      }),
    });

    await caller.saveGameData(TRAINING_DATA);
    const result = await caller.retrieveRoundMetadata();

    expect(isValidResult(result, validationSchema)).toEqual(true);
  });
});
