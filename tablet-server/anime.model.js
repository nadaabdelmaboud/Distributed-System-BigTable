const mongoose = require("mongoose");
const AnimeSchema = new mongoose.Schema({
    anime_id : {
        type : String, 
        required : true
    },
    name : {
        type : String
    },
    genre : {
        type : String
    },
    type : {
        type : String
    },
    episodes : {
        type : String
    },
    rating:{
        type : String
    },
    members:{
        type : String
    }
});
const AnimeModel1 = mongoose.model('model1',AnimeSchema,'BigTable');
const AnimeModel2 = mongoose.model('model2',AnimeSchema,'BigTable');//change to the other package name

module.exports = [AnimeModel1,AnimeModel2];