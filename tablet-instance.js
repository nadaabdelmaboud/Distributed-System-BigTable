const { connect } = require('mongodb');
const mongoose = require('mongoose');
const { updateMetaDate } = require('./metaData');
let tabletConnection;
const TabletInstance={
    async connect(connectionString,isTablet2=false){
        tabletConnection  = await mongoose.createConnection(connectionString,{ useUnifiedTopology: true ,useNewUrlParser: true});
         mongoose.connection.once('open', async function () {
            await connection.db.collection("BigTable").createIndex("anime_id");
         });
         if(isTablet2){
            await connection.db.collection("BigTable2").createIndex("anime_id");
         }
    },
    async disconnect(){
        tabletConnection.close();
    },
    async loadData(animeDocuments,animeDocuments2){
        await tabletConnection.db.collection("BigTable").insertMany(animeDocuments);
        if(animeDocuments2){
        await tabletConnection.db.collection("BigTable2").insertMany(animeDocuments2);
        }
    },
    async getUpdatedDocuments(ids,isTablet3=false){
        if(!isTablet3){
         return await tabletConnection.db.collection("BigTable").find({
            'anime_id': { $in: ids}
         }).toArray().then(data=>{
            return data;
        });
    }
    return await tabletConnection.db.collection("BigTable2").find({
        'anime_id': { $in: ids}
     }).toArray().then(data=>{
        return data;
    });
    }
}
module.exports=TabletInstance;