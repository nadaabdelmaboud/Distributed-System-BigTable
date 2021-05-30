const { connect } = require('mongodb');
const mongoose = require('mongoose');
const { updateMetaDate } = require('./metaData');
let tabletConnection;
const TabletInstance={
    async connect(connectionString){
        tabletConnection  = await mongoose.createConnection(connectionString,{ useUnifiedTopology: true ,useNewUrlParser: true});
         mongoose.connection.once('open', async function () {
            await connection.db.collection("BigTable").createIndex("anime_id");
         });
    },
    async disconnect(){
        tabletConnection.close();
    },
    async loadData(animeDocuments){
        await tabletConnection.db.collection("BigTable").insertMany(animeDocuments);
    },
    async getUpdatedDocuments(ids){
         return await tabletConnection.db.collection("BigTable").find({
            'anime_id': { $in: ids}
         }).toArray().then(data=>{
            return data;
        });
    }
}
module.exports=TabletInstance;