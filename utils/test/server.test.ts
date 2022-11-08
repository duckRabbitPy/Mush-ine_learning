import { describe, expect, it } from "vitest";
import { getTestMushrooms } from "../server_side";
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

describe("if maxIncorrect is set to 3, 4 mushrooms returned in total", async () => {
  it("maxIncorrect 3, returns array of 4", async () => {
    await expect(
      getTestMushrooms([], 3, SNAPSHOT as any)
    ).resolves.toHaveLength(4);
  });
});
