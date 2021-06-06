const Anime = require("./anime.queries.js");
const AnimeValidation = require("./anime.validation");
const AnimeService = {
  async setModels(){
    await Anime.setAnimeModel();
  },
  async findRows(rowKeys, tabletNum) {
    const isKeysValid = await AnimeValidation.validateRowKeys(rowKeys);
    if (isKeysValid == -1) return { data: [], myerr: "rowKey Doesn't Exist" ,err:[] };
    if (isKeysValid == -2) return { data: [], myerr: "",err:[] };
    if (isKeysValid == 0)
      return {
        data: [],
        myerr: `not all the rowKeys belong to tabletNo: ${tabletNum}`,
        err:[]
      };
    if (isKeysValid != tabletNum)
      return {
        data: [],
        myerr: `this rowKeys belongs to tablet number: ${isKeysValid}`,
        err:[]
      };
    const result = await Anime.findRows(rowKeys, tabletNum);
    return result;
  },
  async updateAnime(updateAnime, rowKey, tabletNum) {
    const isKeyValid = await AnimeValidation.validateRowKey(rowKey);
    if (isKeyValid == -1) return { data: false, err: "rowKey Doesn't Exist" };
    if (isKeyValid != tabletNum)
      return {
        data: false,
        err: `this rowKey belongs to tablet number: ${isKeyValid}`,
      };
    const isAnimeValid = await AnimeValidation.validateUpdateAnime(updateAnime);
    if (isAnimeValid.error)
      return { data: false, err: isAnimeValid.error.message };
    const DoesExist = await Anime.getAnimeById(rowKey,tabletNum);
    if(!DoesExist || DoesExist.length==0){
      return { data: false, err: "rowKey Doesn't Exist" }; 
    }
    const result = await Anime.updateAnime(updateAnime, rowKey, tabletNum);
    if (!result || result.length == 0)
      return { data: false, err: "problem updating Anime" };
    return { data: result, err: "" };
  },
  async createAnime(newAnimes, tabletNum) {
    const validResult = await AnimeValidation.validateAddAnimes(newAnimes);
    if (validResult.isValidAnimes.error)
      return { data: false, err: validResult.isValidAnimes.error.message };
    const result = await Anime.createAnime(validResult.newAnimes, tabletNum);
    if (result.length == 0)
      return { data: false, err: "problem creating Anime" };
    return { data: result, err: "" };
  },
  async deleteCells(columnFamily, rowKey, tabletNum) {
    const isKeyValid = await AnimeValidation.validateRowKey(rowKey);
    if (isKeyValid == -1) return { data: false, err: "rowKey Doesn't Exist" };
    if (isKeyValid != tabletNum)
      return {
        data: false,
        err: `this rowKey belongs to tablet number: ${isKeyValid}`,
      };
    const DoesExist = await Anime.getAnimeById(rowKey,tabletNum);
    if(!DoesExist || DoesExist.length==0){
      return { data: false, err: "rowKey Doesn't Exist" }; 
    }
    const result = await Anime.deleteCells(columnFamily, rowKey, tabletNum);
    if (!result || result.length == 0)
      return { data: false, err: "problem deleting cell" };
    return { data: result, err: "" };
  },
  async deleteRow(rowKeys, tabletNum) {
    const isKeyValid = await AnimeValidation.validateRowKeys(rowKeys);
    if (isKeyValid == -1) return { ids: [], myerr: "rowKey Doesn't Exist" ,err:rowKeys};
    const ids = await Anime.findbyanimeid(rowKeys, tabletNum);
    var err = (ids.length!=0)?rowKeys.filter((x) => ids.indexOf(x) === -1):rowKeys;
    err =(err.length!=0)?[...new Set(err)]:[];
    const result = await Anime.deleteRow(ids, tabletNum);
    if(result == 0)
      return{ids:[],err:rowKeys};
    return {ids:ids,err:err};
  },
};
module.exports = AnimeService;
