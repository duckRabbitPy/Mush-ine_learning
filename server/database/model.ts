import db from "./connection";


function readTestString(){
    return db
    .query('SELECT * from mushineLearning')
    .then((result) => {
      return result.rows;
    })
    .catch((error) => console.log(error));

}