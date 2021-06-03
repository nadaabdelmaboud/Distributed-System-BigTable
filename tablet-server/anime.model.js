const AnimeSchema ={
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
};

module.exports = AnimeSchema;