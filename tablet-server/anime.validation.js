const Joi = require("joi");
const { metaData,set} = require("./tabletMetaData.js");
const AnimeValidation = {
  async validateRowKey(rowKey) {
    return validateRowKey(rowKey);
  },
  async validateRowKeys(rowKeys) {
    let tablet = await validateRowKey(rowKeys[0]);
    for (let i = 1; i < rowKeys.length; i++) {
      tabletNum = await validateRowKey(rowKeys[i]);
      if(tabletNum == -1)return -1;
      if(tabletNum != tablet)return 0;
    }
    return tablet;
  },
  async validateUpdateAnime(Anime) {
    const schema = Joi.object({
      name: Joi.string().min(3),
      genre: Joi.string(),
      type: Joi.string(),
      episodes: Joi.string(),
      rating: Joi.string(),
      members: Joi.string(),
    });
    return schema.validate(Anime);
  },
  async validateAddAnime(Anime) {
    const schema = Joi.object({
      name: Joi.string().min(3).required(),
      genre: Joi.string().required(),
      type: Joi.string().required(),
      episodes: Joi.string().required(),
      rating: Joi.string().required(),
      members: Joi.string().required(),
    });
    const result = schema.validate(Anime);
    if(!result.error){
      Anime.anime_id = (metaData.tablet3KeyRange.end + 1).toString();
    }
    return result;
  },
};

function validateRowKey(rowKey) {
  anime_id = parseInt(rowKey);
  start1 = metaData.tablet1KeyRange.start;
  end1 = metaData.tablet1KeyRange.end;
  start2 = metaData.tablet2KeyRange.start;
  end2 = metaData.tablet2KeyRange.end;
  start3 = metaData.tablet3KeyRange.start;
  end3 = metaData.tablet3KeyRange.end;
  if (anime_id >= start1 && anime_id <= end1) return 1;
  else if (anime_id >= start2 && anime_id <= end2) return 2;
  else if (anime_id >= start3 && anime_id <= end3) return 3;
  else return -1;
}
module.exports = AnimeValidation;
