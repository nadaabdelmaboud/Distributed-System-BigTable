var ioTablet = require("socket.io-client");
var socketTablet = ioTablet.connect("http://localhost:8080/", {
  reconnection: true,
});

socketTablet.on("connect", function () {
  console.log("connected to Tablet");

  var ReadRow = {
    rowKeys: ["1"],
  };

  var UpdateData = {
    Anime: {
      name: "Cowboy Bebop",
      genre: "Action",
      type: "Adventure",
    },
    rowKey: "1",
  };

  var CreateRow = {
    Anime: {
      name: "Nihal Menna Hager",
      genre: "Females",
      type: "Students",
      episodes: "hahaha",
      rating: "5",
      members: "In Cairo University",
    },
  };

  var DeleteRow = {
    rowKey: "41",
  };

  var DeleteCells = {
    columnFamilies: ["rating", "episodes"],
    rowKey: "41",
  };

  socketTablet.emit("ReadRows", ReadRow);
  socketTablet.on("ReadRowsResponse", function (data) {
    console.log("Data recieved in client (Read Rows):", data);
  });

  /*socketTablet.emit("Set", UpdateData);
  socketTablet.on("SetResponse", function (data) {
    console.log("Data recieved in client (Update Row):", data);
  });

  socketTablet.emit("AddRow", CreateRow);
  socketTablet.on("AddRowResponse", function (data) {
    console.log("Row Added in client (Add Row):", data);
  });

  socketTablet.emit("DeleteCells", DeleteCells);
  socketTablet.on("DeleteCellsResponse", function (data) {
    console.log("Row cells deleted in client (Delete row cells):", data);
  });

  socketTablet.emit("DeleteRow", DeleteRow);
  socketTablet.on("DeleteRowResponse", function (data) {
    console.log("Row deleted in client (Delete Row):", data);
  });*/
});
