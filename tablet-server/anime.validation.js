const Joi = require("joi");
const { metaData, set } = require("./tabletMetaData.js");
const AnimeValidation = {
  async validateRowKey(rowKey) {
    return validateRowKey(rowKey);
  },
  async validateRowKeys(rowKeys) {
    if(rowKeys.length==0)return -2;
    let tablet = await validateRowKey(rowKeys[0]);
    for (let i = 1; i < rowKeys.length; i++) {
      tabletNum = await validateRowKey(rowKeys[i]);
      if (tabletNum == -1) return -1;
      if (tabletNum != tablet) return 0;
    }
    return tablet;
  },
  async seperateId(rowKeys) {
    var ids1 = [];
    var ids2 = [];
    for (let i = 0; i < rowKeys.length; i++) {
      tabletNum = await validateRowKey(rowKeys[i]);
      if (tabletNum == 1) ids1.push(rowKeys[i]);
      if (tabletNum == 2) ids2.push(rowKeys[i]);
    }
    return { ids1: ids1, ids2: ids2 };
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
  async validateAddAnimes(Animes) {
    const schema = Joi.object({
      name: Joi.string().min(3).required(),
      genre: Joi.string().required(),
      type: Joi.string().required(),
      episodes: Joi.string().required(),
      rating: Joi.string().required(),
      members: Joi.string().required(),
    });
    
    var result = { error: { message :"No Anime Info Was Send"} };
    var newId = metaData.tablet3KeyRange.end;
    for(let i=0;i<Animes.length;i++){
      result = schema.validate(Animes[i]);
      if (!result.error) {
        newId+=1;
        Animes[i].anime_id = (newId).toString();
      }
      else{
        return { isValidAnimes: result, newAnimes: Animes };    
      }
    }
    metaData.tablet3KeyRange.end = newId;
    return { isValidAnimes: result, newAnimes: Animes };
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
