module.exports = function(io) {
    var app = require('express');
    var router = app.Router();
    io.on('connection', function(socket) { 
      console.log("tesy")
    });
    io.emit("hello","hello")
    router.get('/register_rfid', function(req, res, next) {
        res.render('admin/register_rfid/view_registerRfid',{
            title: "Klinik App | RFID",  
        })
    });
    
  
    return router;
}