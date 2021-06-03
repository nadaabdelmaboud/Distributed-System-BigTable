var io = require("socket.io")(3000);

io.on("connection", function (socket) {
  console.log("connected:", socket.client.id);

  socket.on("tabletStarting", function (data) {
    console.log("Tablet : ", data.tabletNumber, " started ");
    data = {
      metaData: {
        tablet1Documents: 533,
        tablet2Documents: 533,
        tablet3Documents: 533,
        tablet1KeyRange: {
          start: 1,
          end: 567,
        },
        tablet2KeyRange: {
          start: 568,
          end: 1169,
        },
        tablet3KeyRange: {
          start: 1170,
          end: 1759
        },
      },
    };
    //emit
    socket.emit("GetMetaData", data);
  });


  socket.on("clientStarting", () =>{
    console.log("client started ");
    data = {
      metaData: {
        tablet1Documents: 533,
        tablet2Documents: 533,
        tablet3Documents: 533,
        tablet1KeyRange: {
          start: 1,
          end: 567,
        },
        tablet2KeyRange: {
          start: 568,
          end: 1169,
        },
        tablet3KeyRange: {
          start: 1170,
          end: 1759
        },
      },
    };
    //emit
    socket.emit("GetMetaData", data);
  });
  socket.on("AddRowResponse", (data)=>{
    console.log("ol2off  ",data)
  });
  socket.on("DeleteRowResponse",(data)=>{
    console.log("hehehehehehehe " ,data);
  });
});
