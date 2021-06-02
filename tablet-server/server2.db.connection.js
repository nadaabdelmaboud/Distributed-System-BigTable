let connectToDB = require("./db.connection.js");
const animeModel = require("./anime.model.js");
module.exports.connect = function () {
  let mongoose3 = connectToDB(3);
  const AnimeSchema3 = new mongoose3.Schema(animeModel);
  const AnimeModel3 = mongoose3.model("model3", AnimeSchema3, "BigTable");
  return [AnimeModel3];
};
