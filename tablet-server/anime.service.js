const Anime = require("./anime.queries.js");
const AnimeValidation = require("./anime.validation");
const AnimeService = {
  async setModels(){
    await Anime.setAnimeModel();
  },
  async findRows(rowKeys, tabletNum) {
    const isKeysValid = await AnimeValidation.validateRowKeys(rowKeys);
    if (isKeysValid == -1) return { data: false, err: "rowKey Doesn't Exist" };
    if (isKeysValid == 0)
      return {
        data: false,
        err: `not all the rowKeys belong to tabletNo: ${tabletNum}`,
      };
    if (isKeysValid != tabletNum)
      return {
        data: false,
        err: `this rowKeys belongs to tablet number: ${isKeysValid}`,
      };
    const result = await Anime.findRows(rowKeys, tabletNum);
    if (!result || result.length == 0)
      return { data: false, err: "problem retrieving data" };
    return { data: result, err: "" };
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
    const result = await Anime.updateAnime(updateAnime, rowKey, tabletNum);
    if (!result || result.length == 0)
      return { data: false, err: "problem updating Anime" };
    return { data: result, err: "" };
  },
  async createAnime(newAnime, tabletNum) {
    const validResult = await AnimeValidation.validateAddAnime(newAnime);
    if (validResult.isValidAnime.error)
      return { data: false, err: validResult.isValidAnime.error.message };
    const result = await Anime.createAnime(validResult.newAnime, tabletNum);
    if (!result || result.length == 0)
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
    const result = await Anime.deleteCells(columnFamily, rowKey, tabletNum);
    if (!result || result.length == 0)
      return { data: false, err: "problem deleting cell" };
    return { data: result, err: "" };
  },
  async deleteRow(rowKey, tabletNum) {
    const isKeyValid = await AnimeValidation.validateRowKey(rowKey);
    if (isKeyValid == -1) return { data: false, err: "rowKey Doesn't Exist" };
    if (isKeyValid != tabletNum)
      return {
        data: false,
        err: `this rowKey belongs to tablet number: ${isKeyValid}`,
      };
    const result = await Anime.deleteRow(rowKey, tabletNum);
    if (!result || result.length == 0)
      return { data: false, err: "problem deleting Anime" };
    return { data: result, err: "" };
  },
};
module.exports = AnimeService;
