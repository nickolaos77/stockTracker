'use strict'
const express      = require('express'),
      app          = express(),
      http         = require('http').Server(app),
      io           = require('socket.io')(http),
      yahooFinance =  require('yahoo-finance'),
      PORT         = process.env.PORT || 3000;    

const handlebars      = require('express-handlebars').create({
        defaultLayout: 'main',
        helpers:{
            section:function(name,options){
                if(!this._sections) this._sections ={};
                this._sections[name] = options.fn(this);
                return null;
            }
        }
    });
var stocksGlobal       = [],
    addRowsArrayGlobal = [],
    i                  = 0 ,
    stockSymbols       = ["DAY"],
    dataforGoogleChart = [];
var getData = function(stockSymbol){
  yahooFinance.historical({
  symbol: stockSymbol,
  from: new Date(new Date().setDate(new Date().getDate() - 31)),
  to: new Date,
  // period: 'd'  // 'd' (daily), 'w' (weekly), 'm' (monthly), 'v' (dividends only)
}, function (err, quotes) {
  if (err) console.log("Error Message from routes.js:" + err );
  else if (quotes.length===0) { 
      
  } //if it is the first time the function is called
  else if (quotes.length!==0 && dataforGoogleChart.length===0){
      dataforGoogleChart.push(['Date',stockSymbol]);
      let j=1;
      quotes.forEach(function(elem){
          var row = [];
          var  d  = (  String(elem.date).slice(4,10) )
          row.push(d ,elem.adjClose);
          dataforGoogleChart.push(row);
          j++;
      });
           
  }
   //if it is the not the first time the function is called
  else if (quotes.length!==0 && dataforGoogleChart.length>0){ 
      dataforGoogleChart[0].push(stockSymbol);
      let j=1;
      quotes.forEach(function(elem){
          dataforGoogleChart[j].push(elem.adjClose);
          j++;
      });
      
      };           
    console.log('data for google');
    console.log(dataforGoogleChart);
    io.sockets.emit('newStockDataAvailable', dataforGoogleChart); 
  });
  if (!stockSymbol){
       io.sockets.emit('newStockDataAvailable', dataforGoogleChart);
  }
}

var stocksRequested = [];
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.use(express.static(__dirname+ '/public'));
//https://code.tutsplus.com/tutorials/real-time-chat-with-nodejs-socketio-and-expressjs--net-31708
app.get('/', function(req, res){
    console.log('stocks global root');
           console.log(stocksGlobal);
     res.render('home',{'data': JSON.stringify(dataforGoogleChart)}); 
} );

    io.on('connection', function(socket){
    console.log('User connected via socket.io!');
    socket.emit('newStockDataAvailable', dataforGoogleChart ); 
       socket.on('newStockRequest', function (newStock) {
           getData(newStock);
    });
});
  
http.listen(PORT, function(){
    console.log('Express listening on port '+ PORT + '!');
});