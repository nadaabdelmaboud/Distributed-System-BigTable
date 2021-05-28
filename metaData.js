const mongoose = require('mongoose');
const metaDataSchema = new mongoose.Schema({
    tablet1Documents:Number,
    tablet2Documents:Number,
    tablet1KeyRange:{
        start:Number,
        end:Number
    },
    tablet2KeyRange:{
        start:Number,
        end:Number
    },
})
const metaDataModel = mongoose.model("metadata",metaDataSchema)
module.exports=metaDataModel;