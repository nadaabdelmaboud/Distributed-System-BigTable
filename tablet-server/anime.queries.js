let AnimeModel = [];
const Models = require("./server1.db.connection").Models;
const Models3 = require("./server2.db.connection").Models;

const Tablet = {
  async setAnimeModel() {
    AnimeModel.push(await Models.getAnimeModel1());
    AnimeModel.push(await Models.getAnimeModel2());
    AnimeModel.push(await Models3.getAnimeModel3());
  },
  async findbyanimeid(rowKeys, tabletNum) {
    const result = await AnimeModel[tabletNum - 1].find({
      anime_id: { $in: rowKeys },
    },{anime_id:1 , _id:0});
    ids=[];
    if(result.length!=0){
      for (let i = 0; i < result.length; i++) {
        ids.push(result[i].anime_id);
      }
    }
    return ids;
  },
  async findRows(rowKeys, tabletNum) {
    console.log("rowKey:", rowKeys);
    const result = await AnimeModel[tabletNum - 1].find({
      anime_id: { $in: rowKeys },
    });
    if (!result || result.length == 0)
      return { data: [], err:(rowKeys.length!=0)?[...new Set(rowKeys)]:[], myerr: "No data retrieved" };
    ids = [];
    err = [];
    if (result.length != rowKeys.length) {
      for (let i = 0; i < result.length; i++) {
        ids.push(result[i].anime_id);
      }
      err = rowKeys.filter((x) => ids.indexOf(x) === -1);
      err = [...new Set(err)];
    }
    console.log("dataoutput", result, "ids", err);

    return { data: result, err: err, myerr: "" };
  },
  async updateAnime(Anime, rowKey, tabletNum) {
    const updatedAnime = await AnimeModel[tabletNum - 1].find({
      anime_id: rowKey,
    });
    if (!updatedAnime || updatedAnime.length == 0) return updatedAnime;
    const updatedRecord = updatedAnime[0];
    if (Anime.name) updatedRecord.name = Anime.name;
    if (Anime.genre) updatedRecord.genre = Anime.genre;
    if (Anime.type) updatedRecord.type = Anime.type;
    if (Anime.episodes) updatedRecord.episodes = Anime.episodes;
    if (Anime.rating) updatedRecord.rating = Anime.rating;
    if (Anime.members) updatedRecord.members = Anime.members;
    const result = await updatedRecord.save();
    return result;
  },
  async createAnime(Animes, tabletNum) {
    console.log("animes inside queries", Animes);
    const AnimesResult = await AnimeModel[tabletNum - 1].collection.insertMany(
      Animes
    );
    console.log("reuslt from db", AnimesResult.ops);
    var result = [];
    if (AnimesResult.ops && AnimesResult.ops.length != 0) {
      for (var i = 0; i < AnimesResult.ops.length; i++) {
        result.push(AnimesResult.ops[i].anime_id);
      }
    }
    console.log(result);
    return result;
  },
  async deleteCells(columnFamily, rowKey, tabletNum) {
    const fields = {};
    for (let i = 0; i < columnFamily.length; i++) {
      fields[columnFamily[i]] = 1;
    }
    const result = await AnimeModel[tabletNum - 1].updateOne(
      { anime_id: rowKey },
      { $unset: fields }
    );
    console.log(result);
    return result;
  },
  async getAnimeById(anime_id, tabletNum) {
    const data = await AnimeModel[tabletNum - 1].find({ anime_id: anime_id });
    return data;
  },
  async deleteRow(rowKeys, tabletNum) {
    const result = await AnimeModel[tabletNum - 1].deleteMany({
      anime_id: { $in: rowKeys },
    });
    return result.ok;
  },
};
module.exports = Tablet;
