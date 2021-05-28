const { connect } = require('mongodb');
const mongoose = require('mongoose');
let masterConnection;
const TabletInstance={
    async connect(connectionString){
        masterConnection  = await mongoose.createConnection(connectionString,{ useUnifiedTopology: true ,useNewUrlParser: true});
        // mongoose.connection.once('open', async function () {
        //     connection.db.collection("BigTable",async function(err, collection){
        //         await collection.createIndex("anime_id");
        //     });
        
        // });
    },
    async loadData(animeDocuments){
        await masterConnection.db.collection("BigTable").insertMany(animeDocuments);
    }
}
module.exports=TabletInstance;