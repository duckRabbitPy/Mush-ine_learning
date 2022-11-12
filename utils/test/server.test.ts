import { describe, expect, it } from "vitest";
import {
  getCloudMushrooms,
  getTestMushrooms,
  buildTestMushrooms,
} from "../server_side";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: import.meta.env.VITE_cloud_name,
  api_key: import.meta.env.VITE_api_key,
  api_secret: import.meta.env.VITE_api_secret,
});

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

describe("getCloudImages returns an array of mushroom names", () => {
  it("return array is array", async () => {
    getCloudMushrooms().then((res) => expect(Array.isArray(res)).toBe(true));
  });
  it("array has length", async () => {
    getCloudMushrooms().then((res) => expect(res.length).greaterThan(0));
  });
  it("array contains strings", async () => {
    getCloudMushrooms().then((res) => expect(res[0]).toBeTypeOf("string"));
  });
  it("array contains medusa", async () => {
    getCloudMushrooms().then((res) => expect(res).includes("medusa"));
  });
});

describe("test buildTestMushrooms", async () => {
  it("built test mushroom returns an object with 3 values", () => {
    buildTestMushrooms(
      ["tawny-grisette", "grey-spotted-amanita", "blushing-wood-mushroom"],
      3
    ).then((res) => {
      expect(
        res.every((testMushroom) => Object.values(testMushroom).length === 3)
      ).toBe(true);
    });
  });

  it("test mushrooms contain expected keys", async () => {
    const expectedKeys = ["name", "correctMatch", "src"];

    const hasExpectedKeys = await buildTestMushrooms(
      ["tawny-grisette", "grey-spotted-amanita", "blushing-wood-mushroom"],
      3
    ).then((res) =>
      res.every((testMushroom) =>
        expectedKeys.every((expectedKey) =>
          Object.keys(testMushroom).includes(expectedKey)
        )
      )
    );
    expect(hasExpectedKeys).toBe(true);
  });

  it("test mushrooms contain 3 non null/non-undefined values", async () => {
    const has3values = await buildTestMushrooms(
      ["tawny-grisette", "grey-spotted-amanita", "blushing-wood-mushroom"],
      3
    ).then((res) =>
      res.every(
        (testMushroom) =>
          Object.values(testMushroom).filter(
            (value) => value !== undefined || null
          ).length === 3
      )
    );
    expect(has3values).toBe(true);
  });
});

describe("if maxIncorrect is set to 3, 4 mushrooms returned in total", async () => {
  it("maxIncorrect 3, returns array of 4", async () => {
    await expect(
      getTestMushrooms([], 3, SNAPSHOT as any)
    ).resolves.toHaveLength(4);
  });
});
