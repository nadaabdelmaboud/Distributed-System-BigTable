let connectToDB = require("./db.connection.js");
const animeModel = require('./anime.model.js');
const  Mongoose  = require("mongoose");
const Schema = Mongoose.Schema;
let AnimeModel3;
const connect = async function () {
  let mongoose3 = await connectToDB(3);
  console.log(mongoose3.config);
  AnimeModel3 = mongoose3.model("model3", new Schema(animeModel),"BigTable");
};
const Models={
  async getAnimeModel3(){
    return AnimeModel3;
  }
}
module.exports = {connect,Models};