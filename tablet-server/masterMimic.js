var io = require('socket.io')(3000);

io.on('connection', function (socket) {
   console.log('connected:', socket.client.id);
   
   socket.on('tabletStarting', function (data){
       console.log('Tablet : ', data.tabletNumber, ' started ');   
       data = {
        metaData:{
            tablet1Documents: {
                tablet1Number:1,
                tablet1Start : 0,
                tablet1end : 10,
                tablet2Start : 11,
                tablet2End:20
            },
            tablet2Documents: {
                tablet2Number:2,
                tablet3Start : 21,
                tablet3end : 30
                }
            }
        };
       //emit 
       socket.emit('GetMetaData',data);
   });
});