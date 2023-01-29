import { assert, describe, expect, it } from "vitest";
import { InsightSortOptions } from "../../global_enums";
import {
  currLevelInfo,
  generateLvlBoundaries,
  heatMapAccuracy,
  returnLvl,
  sortInsightData,
} from "../pureFunctions";

const levelBoundaryMap = { ...generateLvlBoundaries() };

it("level boundary generator returns a sorted array of ascending values", () => {
  const boundaries = generateLvlBoundaries();
  const isAscending = boundaries.every(
    (x, y, arr) => y === 0 || x >= arr[y - 1]
  );
  expect(isAscending).toEqual(true);
});

it("heatMap accuracy determined by Time and Result data", () => {
  const accuracy = heatMapAccuracy([
    { correct_answer: true, timestamp: "2023-01-15T15:47:18.357Z" },
    { correct_answer: true, timestamp: "2023-01-15T16:47:18.357Z" },
    { correct_answer: false, timestamp: "2023-01-15T17:47:18.357Z" },
    { correct_answer: true, timestamp: "2023-01-15T18:47:18.357Z" },
  ]);
  assert.equal(accuracy, 75);
});

describe("sort insight data sorts in three different modes", () => {
  const chartData: [string, SummedWeights][] = [
    ["pavement", { medusa: 100, "oak-bolete": 200 }],
    ["prince", { horse: 500 }],
    ["horse", { blusher: 100, horse: 400, medusa: 1000 }],
    ["blusher", { prince: 100, horse: 400, medusa: 1000 }],
    ["medusa", { horse: 200 }],
  ];

  const heatMaps: Heatmaps = {
    pavement: [
      { correct_answer: true, timestamp: "2023-01-15T15:47:18.357Z" },
      { correct_answer: true, timestamp: "2023-01-15T16:47:18.357Z" },
      { correct_answer: false, timestamp: "2023-01-15T17:47:18.357Z" },
      { correct_answer: true, timestamp: "2023-01-15T18:47:18.357Z" },
    ],

    prince: [
      { correct_answer: false, timestamp: "2023-01-15T15:47:18.357Z" },
      { correct_answer: false, timestamp: "2023-01-15T16:47:18.357Z" },
      { correct_answer: false, timestamp: "2023-01-15T17:47:18.357Z" },
      { correct_answer: true, timestamp: "2023-01-15T18:47:18.357Z" },
    ],

    horse: [
      { correct_answer: true, timestamp: "2023-01-15T15:47:18.357Z" },
      { correct_answer: true, timestamp: "2023-01-15T16:47:18.357Z" },
      { correct_answer: true, timestamp: "2023-01-15T17:47:18.357Z" },
      { correct_answer: true, timestamp: "2023-01-15T18:47:18.357Z" },
    ],
    blusher: [
      { correct_answer: true, timestamp: "2023-01-15T15:47:18.357Z" },
      { correct_answer: true, timestamp: "2023-01-15T16:47:18.357Z" },
      { correct_answer: false, timestamp: "2023-01-15T17:47:18.357Z" },
      { correct_answer: true, timestamp: "2023-01-15T18:47:18.357Z" },
    ],
    medusa: [],
  };

  it("sorts alphabetically", () => {
    const result = sortInsightData(
      chartData,
      heatMaps,
      InsightSortOptions.Alphabetical
    );
    expect(result?.[0]?.[0]).toEqual("blusher");
  });

  it("sorts high accuracy first", () => {
    const result = sortInsightData(
      chartData,
      heatMaps,
      InsightSortOptions.HighAccuracyFirst
    );
    expect(result?.[0]?.[0]).toEqual("horse");
  });

  it("sorts low accuracy first", () => {
    const result = sortInsightData(
      chartData,
      heatMaps,
      InsightSortOptions.LowAccuracyFirst
    );
    console.log(result);
    expect(result?.[0]?.[0]).toEqual("prince");
  });

  it("(medusa) entry that lacks heatmap data is excluded from accuracy sorted results", () => {
    const result = sortInsightData(
      chartData,
      heatMaps,
      InsightSortOptions.LowAccuracyFirst
    );
    expect(result?.length).toEqual(4);
  });
});

describe("case curr level undefined", () => {
  const currXp = 0;
  const currLevel = undefined;
  it("boundary ahead correct", () => {
    const { boundaryAhead } = currLevelInfo(currXp, currLevel);
    assert.equal(boundaryAhead, levelBoundaryMap[0]);
  });

  it("correct boundary behind", () => {
    const { boundaryBehind } = currLevelInfo(currXp, currLevel);
    assert.equal(boundaryBehind, 0);
  });

  it("correct xpToNextLevel", () => {
    const { xpToNextLevel } = currLevelInfo(currXp, currLevel);
    assert.equal(xpToNextLevel, levelBoundaryMap[0] - currXp);
  });
});

describe("case curr level 0", () => {
  const currXp = 0;
  const currLevel = 0;

  it("boundary ahead correct", () => {
    const { boundaryAhead } = currLevelInfo(currXp, currLevel);
    assert.equal(boundaryAhead, levelBoundaryMap[0]);
  });

  it("correct boundary behind", () => {
    const { boundaryBehind } = currLevelInfo(currXp, currLevel);
    assert.equal(boundaryBehind, 0);
  });

  it("correct xpToNextLevel", () => {
    const { xpToNextLevel } = currLevelInfo(currXp, currLevel);
    assert.equal(xpToNextLevel, levelBoundaryMap[0] - currXp);
  });
});

describe("case curr level 3", () => {
  const currXp = 1190;
  const currLevel = 3;

  it("correct boundary ahead", () => {
    const { boundaryAhead } = currLevelInfo(currXp, currLevel);
    assert.equal(boundaryAhead, levelBoundaryMap[4]);
  });

  it("correct boundary behind", () => {
    const { boundaryBehind } = currLevelInfo(currXp, currLevel);
    assert.equal(boundaryBehind, levelBoundaryMap[3]);
  });

  it("correct xpToNextLevel", () => {
    const { xpToNextLevel } = currLevelInfo(currXp, currLevel);
    assert.equal(xpToNextLevel, levelBoundaryMap[4] - currXp);
  });
});

describe("case curr level 4", () => {
  const currXp = 1300;
  const currLevel = 4;
  it("boundary ahead correct", () => {
    const { boundaryAhead } = currLevelInfo(currXp, currLevel);
    assert.equal(boundaryAhead, levelBoundaryMap[5]);
  });

  it("correct boundary behind", () => {
    const { boundaryBehind } = currLevelInfo(currXp, currLevel);
    assert.equal(boundaryBehind, levelBoundaryMap[4]);
  });

  it("correct xpToNextLevel", () => {
    const { xpToNextLevel } = currLevelInfo(currXp, currLevel);
    assert.equal(xpToNextLevel, levelBoundaryMap[5] - currXp);
  });
});

describe("Level correctly determined based on XP", () => {
  it("level correct 0 xp", () => {
    const currXp = 0;
    const lvl = returnLvl(currXp);
    assert.equal(lvl, 0);
  });

  it("level correct with 51 xp", () => {
    const currXp = 51;
    const lvl = returnLvl(currXp);
    assert.equal(lvl, 1);
  });

  it("level correct 200 xp", () => {
    const currXp = 200;
    const lvl = returnLvl(currXp);
    assert.equal(lvl, 2);
  });

  it("level correct 450 xp", () => {
    const currXp = 450;
    const lvl = returnLvl(currXp);
    assert.equal(lvl, 3);
  });
});
