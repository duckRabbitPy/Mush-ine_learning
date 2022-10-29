import { QueryResult } from "pg";
import { TrainingData } from "../../pages/forage";
import db from "./connection";

export function readTestString(): Promise<string> {
  return db
    .query("SELECT * from mushineLearning")
    .then((result) => {
      return result.rows[0].testStrings;
    })
    .catch((error: Error) => console.log(error));
}

export function writeTestString(testString: string): Promise<string> {
  return db
    .query(
      "INSERT INTO mushineLearning (testStrings) VALUES ($1) RETURNING *",
      [testString]
    )
    .then((result) => {
      return result.rows[0].testStrings;
    })
    .catch((error: Error) => console.log(error));
}

type mushine_learning_user = {
  id: number;
  user_id: string;
  xp: number;
};

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
      "UPDATE mushine_learning_user SET xp = $1 where user_id = $2 RETURNING xp;",
      [Score, user_id]
    )
    .then((result: QueryResult<Pick<mushine_learning_user, "xp">>) => {
      return result.rows[0].xp;
    })
    .catch((error: Error) => console.log(error));
}

export async function getScoreByUserId(user_id: string) {
  return db
    .query("SELECT xp from mushine_learning_user where user_id = $1", [user_id])
    .then((result: QueryResult<Pick<mushine_learning_user, "xp">>) => {
      return result.rows[0].xp;
    })
    .catch((error: Error) => console.log(error));
}

type mushine_training_weightings = {
  id: number;
  correct_mushroom: string;
  timestamp: string;
  misidentified_as: string;
  weight: string;
};

export async function updateTrainingData(
  trainingData: TrainingData[],
  user_id: string
) {
  for (const lesson of trainingData) {
    if (lesson.weightingData) {
      const weightEntries = Object.entries(lesson.weightingData);

      for (const weightEntry of weightEntries) {
        const misidentified_as = lesson.misidentified_as;
        const correct_mushroom = weightEntry[0];
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
      `select misidentified_as from mushine_training_weightings where correct_mushroom = $1 AND user_id = $2`,
      [name, user_id]
    )
    .then((result: QueryResult<mushine_training_weightings>) => {
      return result.rows;
    })
    .catch((error: Error) => console.log(error));

  if (!misidentifiedArr) return [];

  return misidentifiedArr.slice(0, 3);
}

type summedWeight = Record<string, number>;
type snapshotType = Record<string, summedWeight>;

export async function saveLevelSnapshot(
  storedMushrooms: string[],
  user_id: string
) {
  let snapshot: snapshotType = {};
  console.log("snapshotting");

  for (const mushroomName of storedMushrooms) {
    const shroomAndWeighting = await db
      .query(
        "SELECT weight, misidentified_as FROM mushine_training_weightings WHERE mushine_training_weightings.correct_mushroom = $1 and user_id = $2",
        [mushroomName, user_id]
      )
      .then(
        (
          result: QueryResult<
            Pick<mushine_training_weightings, "weight" | "misidentified_as">
          >
        ) => {
          return result.rows.reduce((acc: any, curr) => {
            if (
              acc[curr.misidentified_as] &&
              acc[curr.misidentified_as].weight
            ) {
              acc[curr.misidentified_as].weight += curr.weight;
            } else {
              acc[curr.misidentified_as] = curr.weight;
            }
            return acc;
          }, {});
        }
      )
      .catch((error: Error) => console.log(error));

    snapshot[mushroomName as keyof typeof snapshot] = shroomAndWeighting;
  }

  const savedSnapShot = await db.query(
    `INSERT into mushine_level_snapshots (level, user_id, snapshot) VALUES ($1, $2, $3) RETURNING level, snapshot`,
    ["1", user_id, snapshot]
  );

  return savedSnapShot.rows[0];
}

type levelSnapshot = {
  user_id: string;
  level: number;
  snapshot: Record<string, snapshotType>;
};
export async function getLevelSnapshot(level: number, user_id: string) {
  return await db
    .query(
      `SELECT snapshot, level from mushine_level_snapshots WHERE level = $1 AND user_id = $2`,
      [level, user_id]
    )
    .then((result: QueryResult<Pick<levelSnapshot, "snapshot" | "level">>) => {
      return result.rows[0];
    })
    .catch((error: Error) => console.log(error));
}
