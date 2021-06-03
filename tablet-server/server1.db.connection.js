let connectToDB = require("./db.connection.js");
const animeModel = require('./anime.model.js');
const  Mongoose  = require("mongoose");
const Schema = Mongoose.Schema;
let AnimeModel1;
let AnimeModel2;
const connect = async function () {
  let mongoose1 = await connectToDB(1);
  let mongoose2 = await connectToDB(2);
  console.log(mongoose1.config);
  console.log(mongoose2.config);
  AnimeModel1 = mongoose1.model("model1", new Schema(animeModel),"BigTable");
  AnimeModel2 = mongoose2.model("model1", new Schema(animeModel),"BigTable");
};
const Models={
  async getAnimeModel1(){
    return AnimeModel1;
  },
  async getAnimeModel2(){
    return AnimeModel2;
  }
}
module.exports = {connect,Models};
