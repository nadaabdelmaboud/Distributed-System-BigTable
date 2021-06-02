const mongoose = require("mongoose");
const AnimeSchema = new mongoose.Schema({
    anime_id : {
        type : String, 
        required : true
    },
    name : {
        type : String, 
        required : true
    },
    genre : {
        type : String, 
        required : true
    },
    type : {
        type : String, 
        required : true
    },
    episodes : {
        type : String, 
        required : true
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