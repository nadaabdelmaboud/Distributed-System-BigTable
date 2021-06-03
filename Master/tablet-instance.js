const { connect } = require('mongodb');
const mongoose = require('mongoose');
const { updateMetaDate } = require('./metaData');
let tabletConnection;
let tabletConnection2;
let tabletConnection3;
const TabletInstance={
    async connect(connectionString,tabletId){
        if(tabletId==1){
        tabletConnection  = await mongoose.createConnection(connectionString,{ useUnifiedTopology: true ,useNewUrlParser: true});
        }
        else if(tabletId==2){
            tabletConnection2  = await mongoose.createConnection(connectionString,{ useUnifiedTopology: true ,useNewUrlParser: true});
        
        }
        else{
            tabletConnection3  = await mongoose.createConnection(connectionString,{ useUnifiedTopology: true ,useNewUrlParser: true});
        }

    },
    async disconnect(tabletId){
        if(tabletId==1){
        tabletConnection.close();
        }
        else if(tabletId==2){
            tabletConnection2.close();
        }
        else{
            tabletConnection3.close();
        }

    },
    async drop(tabletId){
        if(tabletId==1){
            (await tabletConnection).db.dropDatabase();
        }
            else if(tabletId==2){
                (await tabletConnection2).db.dropDatabase();
            }
            else{
                (await tabletConnection3).db.dropDatabase();

            }
    }, 
    async loadData(animeDocuments,tabletId){
        if(tabletId==1){
            await tabletConnection.db.collection("BigTable").insertMany(animeDocuments);
        }
            else if(tabletId==2){
                await tabletConnection2.db.collection("BigTable").insertMany(animeDocuments);
            }
            else{
                await tabletConnection3.db.collection("BigTable").insertMany(animeDocuments);
            }
    },
    async getUpdatedDocuments(ids,tabletId){
        if(tabletId==1){
         return await tabletConnection.db.collection("BigTable").find({
            'anime_id': { $in: ids}
         }).toArray().then(data=>{
            return data;
        });
    }
    else if(tabletId==2){
        return await tabletConnection2.db.collection("BigTable").find({
            'anime_id': { $in: ids}
         }).toArray().then(data=>{
            return data;
        });
    }
    else{
        return await tabletConnection3.db.collection("BigTable").find({
            'anime_id': { $in: ids}
         }).toArray().then(data=>{
            return data;
        });
    }
    }
}
module.exports=TabletInstance;