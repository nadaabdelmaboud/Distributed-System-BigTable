var io = require("socket.io")(3000);

io.on("connection", function (socket) {
  console.log("connected:", socket.client.id);

  socket.on("tabletStarting", function (data) {
    console.log("Tablet : ", data.tabletNumber, " started ");
    data = {
      metaData: {
        tablet1Documents: 10,
        tablet2Documents: 10,
        tablet3Documents: 20,
        tablet1KeyRange: {
          start: 0,
          end: 10,
        },
        tablet2KeyRange: {
          start: 11,
          end: 20,
        },
        tablet3KeyRange: {
          start: 21,
          end: 40,
        },
      },
    };
    //emit
    socket.emit("GetMetaData", data);
  });
});
