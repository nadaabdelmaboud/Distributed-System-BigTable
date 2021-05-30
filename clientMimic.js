var ioTablet = require('socket.io-client');
var socketTablet = ioTablet.connect("http://localhost:8080/", {
    reconnection: true
});

socketTablet.on('connect', function () {
    console.log('connected to Tablet');

    var data ={
        rowKeys: [
           "2"
        ]
    };
    
    var UpdateData= {
        Anime:{
            name : "Cowboy Bebop",
            genre : "Action",
            type : "Adventure"     
        },
        rowKey : "1"
    };

    var CreateRow ={
        Anime:{
            anime_id: "3",
            name: "Nihal Menna Hager",
            genre: "Females",
            type: "Students",
            episodes: "hahaha",
            rating: "5",
            members: "In Cairo University"
        }
    };

    var DeleteRow= {
        rowKey: "3"
    };

    var DeleteCells={
        columnFamilies : ["members"],
        rowKey: 3
    }
    
    /*socketTablet.emit('ReadRows', data);
    socketTablet.on('ReadRowsResponse',function(data){
       console.log('Data recieved in client (Read Rows):',data);
    });

    socketTablet.emit('Set', UpdateData);
    socketTablet.on('SetResponse',function(UpdateData){
        console.log('Data recieved in client (Update Row):',UpdateData);
    });

    socketTablet.emit('AddRow', CreateRow);
    socketTablet.on('AddRowResponse',function(CreateRow){
        console.log('Row Added in client (Add Row):',CreateRow);
    });
 
    socketTablet.emit('DeleteCells', DeleteCells);
    socketTablet.on('DeleteCellsResponse',function(DeleteCells){
       console.log('Row cells deleted in client (Delete row cells):',DeleteCells);
    });
    */
  
    socketTablet.emit('DeleteRow', DeleteRow);
    socketTablet.on('DeleteRowResponse',function(DeleteRow){
    console.log('Row deleted in client (Delete Row):',DeleteRow);
    });
})


