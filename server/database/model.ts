import db from "./connection";

export function readTestString(): Promise<string> {
  return db
    .query("SELECT * from mushineLearning")
    .then((result: any) => {
      console.log(result.rows);
      return result.rows;
    })
    .catch((error: Error) => console.log(error));
}
