const mongoose = require("mongoose");
const conf = require("./config.js");
module.exports = async function (tabletServerNum) {
  var connectionString =
    tabletServerNum == 1
      ? conf.tablet1
      : tabletServerNum == 2
      ? conf.tablet2
      : conf.tablet3;
  return await mongoose.createConnection(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  });
};
