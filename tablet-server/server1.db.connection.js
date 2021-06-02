let connectToDB = require("./db.connection.js");
const animeModel = require('./anime.model.js');
module.exports.connect =  function () {
  let mongoose1 =  connectToDB(1);
  let mongoose2 =  connectToDB(2);
  const AnimeSchema1 = new mongoose1.Schema(animeModel);
  const AnimeSchema2 = new mongoose2.Schema(animeModel);
  const AnimeModel1 = mongoose1.model("model1", AnimeSchema1, "BigTable");
  const AnimeModel2 = mongoose2.model("model2", AnimeSchema2, "BigTable");
  return [AnimeModel1,AnimeModel2];
};
