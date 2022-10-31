import { QueryResult } from "pg";
import { TrainingData } from "../../utils/server";

import db from "./connection";

type mushine_learning_user = {
  id: number;
  user_id: string;
  xp: number;
};

type mushine_training_weightings = {
  id: number;
  correct_mushroom: string;
  timestamp: string;
  misidentified_as: string;
  weight: number;
};

type mushine_level_snapshots = {
  level: number;
  user_id: string;
  snapshot: levelSnapshot;
};

type levelSnapshot = {
  user_id: string;
  level: number;
  snapshot: Record<string, snapshotType>;
};

type summedWeight = Record<string, number>;
type snapshotType = Record<string, summedWeight>;

export function createUser(user_id: string) {
  return db
    .query(
      "INSERT INTO mushine_learning_user (user_id, xp) VALUES ($1, 0) RETURNING *",
      [user_id]
    )
    .then((result: QueryResult<Pick<mushine_learning_user, "user_id">>) => {
      return result.rows[0].user_id;
    })
    .catch((error: Error) => console.log(error));
}

export async function updateScore(Score: number, user_id: string) {
  return db
    .query(
      "UPDATE mushine_learning_user SET xp = $1 WHERE user_id = $2 RETURNING xp;",
      [Score, user_id]
    )
    .then((result: QueryResult<Pick<mushine_learning_user, "xp">>) => {
      return result.rows[0].xp;
    })
    .catch((error: Error) => console.log(error));
}

export async function getScoreByUserId(user_id: string) {
  return db
    .query("SELECT xp FROM mushine_learning_user WHERE user_id = $1", [user_id])
    .then((result: QueryResult<Pick<mushine_learning_user, "xp">>) => {
      return result.rows[0].xp;
    })
    .catch((error: Error) => console.log(error));
}

export async function updateTrainingData(
  trainingData: TrainingData[],
  user_id: string
) {
  for (const lesson of trainingData) {
    if (lesson.weightingData) {
      const weightEntries = Object.entries(lesson.weightingData);

      for (const weightEntry of weightEntries) {
        const misidentified_as = weightEntry[0];
        const correct_mushroom = lesson.misidentifiedMushroom;
        const weight = weightEntry[1];
        await db
          .query(
            `INSERT INTO mushine_training_weightings (user_id, correct_mushroom, misidentified_as, weight, timestamp) VALUES ($1, $2, $3, $4, to_timestamp(${Date.now()} / 1000.0)) RETURNING *`,
            [user_id, correct_mushroom, misidentified_as, weight]
          )
          .then((result: QueryResult<mushine_training_weightings>) => {
            return result.rows[0];
          })
          .catch((error: Error) => console.log(error));
      }
    }
  }

  return trainingData;
}

export default async function getCommonConfusions(
  name: string,
  user_id: string
) {
  const misidentifiedArr = await db
    .query(
      `SELECT weight, misidentified_as FROM mushine_training_weightings WHERE correct_mushroom = $1 AND user_id = $2`,
      [name, user_id]
    )
    .then((result: QueryResult<mushine_training_weightings>) => {
      return result.rows;
    })
    .catch((error: Error) => console.log(error));

  if (!misidentifiedArr) return [];

  const ranked = Object.entries(aggregateWeightings(misidentifiedArr))
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => ({ misidentified_as: name }));

  return ranked.slice(0, 3);
}

export async function saveLevelSnapshot(
  storedMushrooms: string[],
  user_id: string
) {
  let snapshot: snapshotType = {};

  for (const mushroomName of storedMushrooms) {
    const shroomAndWeighting = await db
      .query(
        "SELECT weight, misidentified_as FROM mushine_training_weightings WHERE mushine_training_weightings.correct_mushroom = $1 AND user_id = $2",
        [mushroomName, user_id]
      )
      .then(
        (
          result: QueryResult<
            Pick<mushine_training_weightings, "weight" | "misidentified_as">
          >
        ) => {
          return aggregateWeightings(result.rows);
        }
      )
      .catch((error: Error) => console.log(error));

    snapshot[mushroomName as keyof typeof snapshot] = shroomAndWeighting ?? {};
  }

  const currLevel = await db
    .query(
      `SELECT level FROM mushine_level_snapshots WHERE user_id = $1 ORDER BY level DESC`,
      [user_id]
    )
    .then((result: QueryResult<Pick<mushine_level_snapshots, "level">>) => {
      return result.rows[0].level;
    })
    .catch((error: Error) => console.log(error));

  const newLevel = currLevel ? currLevel + 1 : 1;

  const savedSnapShot = await db.query(
    `INSERT into mushine_level_snapshots (level, user_id, snapshot) VALUES ($1, $2, $3) RETURNING level, snapshot`,
    [newLevel, user_id, snapshot]
  );

  return savedSnapShot.rows[0];
}

export async function getLevelSnapshot(level: number, user_id: string) {
  return await db
    .query(
      `SELECT snapshot, level FROM mushine_level_snapshots WHERE level = $1 AND user_id = $2`,
      [level, user_id]
    )
    .then((result: QueryResult<Pick<levelSnapshot, "snapshot" | "level">>) => {
      return result.rows[0];
    })
    .catch((error: Error) => console.log(error));
}

function aggregateWeightings(
  trainingWeightings: Pick<
    mushine_training_weightings,
    "weight" | "misidentified_as"
  >[]
) {
  const aggregated = trainingWeightings.reduce((acc: summedWeight, curr) => {
    if (acc[curr.misidentified_as] && acc[curr.misidentified_as]) {
      acc[curr.misidentified_as] += curr.weight;
    } else {
      acc[curr.misidentified_as] = curr.weight;
    }
    return acc;
  }, {});

  return aggregated;
}
