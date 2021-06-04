let AnimeModel=[];
const Models = require('./server1.db.connection').Models;
const Models3 = require('./server2.db.connection').Models;

const Tablet = {
    async setAnimeModel(){
        AnimeModel.push(await Models.getAnimeModel1());
        AnimeModel.push(await Models.getAnimeModel2());
        AnimeModel.push(await Models3.getAnimeModel3());

    },

    async findRows(rowKeys,tabletNum){
        console.log(tabletNum,AnimeModel,AnimeModel[tabletNum-1]);
        const data = await AnimeModel[tabletNum-1].find({anime_id:{$in : rowKeys}});
        return data;
    },
    async updateAnime(Anime,rowKey,tabletNum){
        const updatedAnime = await AnimeModel[tabletNum-1].find({anime_id:rowKey});
        if(!updatedAnime || updatedAnime.length==0)
            return updatedAnime;
        const updatedRecord = updatedAnime[0];
        if(Anime.name) updatedRecord.name = Anime.name;
        if(Anime.genre) updatedRecord.genre = Anime.genre;
        if(Anime.type) updatedRecord.type = Anime.type;
        if(Anime.episodes) updatedRecord.episodes = Anime.episodes;
        if(Anime.rating) updatedRecord.rating = Anime.rating;
        if(Anime.members) updatedRecord.members = Anime.members;
        const result = await updatedRecord.save();
        return result;
    },
    async createAnime(Anime,tabletNum){
        const newAnime = new AnimeModel[tabletNum-1]({
            anime_id: Anime.anime_id,
            name: Anime.name,
            genre: Anime.genre,
            type: Anime.type,
            episodes: Anime.episodes,
            rating: Anime.rating,
            members: Anime.members                        
        });
        const result = await newAnime.save();
        return result;
    },
    async deleteCells(columnFamily,rowKey,tabletNum){
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
    async getAnimeById(anime_id,tabletNum){
        const data = await AnimeModel[tabletNum-1].find({anime_id:anime_id});
        return data;
    },
    async deleteRow(rowKey,tabletNum){
        const result = await AnimeModel[tabletNum-1].deleteOne({anime_id:rowKey});
        return result;
    }
     

};
module.exports = Tablet;