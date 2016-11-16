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
    i                  = 0 ;

var stockSymbols = ["DAY"];
var dataforGoogleChart = [];


//
//var getData = function(req,res, next){
//  yahooFinance.historical({
//  symbol: req.params.stockSymbol,
//  from: '2016-10-01',
//  to: '2016-11-14',
//  // period: 'd'  // 'd' (daily), 'w' (weekly), 'm' (monthly), 'v' (dividends only)
//}, function (err, quotes) {
//  if (err) console.log("Error Message from routes.js:" + err );
//  else if (quotes.length===0) { 
//      //res.render('home',{"stocks":stocksGlobal, "prices" : JSON.stringify(addRowsArrayGlobal)});
//      next();
//  }
//  else if (quotes.length!==0 ){ 
//      console.log(quotes);
//      let j=1;
//      let k=0;
//      quotes.forEach(function(elem){   
//        let rArray      = [];
//          if (i===0  && stocksGlobal.indexOf(req.params.stockSymbol)===-1 ){ rArray.push(j); j++; 
//            rArray.push(elem.adjClose);
//            addRowsArrayGlobal.push(rArray)}
//          
//          else if (i!==0 && stocksGlobal.indexOf(req.params.stockSymbol)===-1 ) {
//            addRowsArrayGlobal[k].push(elem.adjClose);
//            k++;  
//          }
//      })
//      i++ ;
//  
//      if ( stocksGlobal.indexOf(req.params.stockSymbol)===-1 ){
//      stocksGlobal.push(req.params.stockSymbol)}
//     // console.log({"stocks": stocksGlobal, "prices":addRowsArrayGlobal });
////      http://stackoverflow.com/questions/33979290/pass-array-of-arrays-from-routes-to-view-node-js
//      if (quotes.length!==0 ){
//      //res.render('home',{"stocks":stocksGlobal, "prices" : JSON.stringify(addRowsArrayGlobal)});
//          next();
//      }
//      }
//});
//}

//var getData = function(req,res, next){
//  yahooFinance.historical({
//  symbol: req.params.stockSymbol,
//  from: '2016-11-07',
//  to: '2016-11-14',
//  // period: 'd'  // 'd' (daily), 'w' (weekly), 'm' (monthly), 'v' (dividends only)
//}, function (err, quotes) {
//  if (err) console.log("Error Message from routes.js:" + err );
//  else if (quotes.length===0) { 
//      //res.render('home',{"stocks":stocksGlobal, "prices" : JSON.stringify(addRowsArrayGlobal)});
//      
//  } //if it is the first time the function is called
//  else if (quotes.length!==0 && dataforGoogleChart.length===0){
//      dataforGoogleChart.push(['Date',req.params.stockSymbol]);
//      let j=1;
//      //console.log(quotes);
//      quotes.forEach(function(elem){
//          console.log('inside first loop');
//          var row = [];
//          row.push(j,elem.adjClose);
//          dataforGoogleChart.push(row);
//          j++;
//      });
//           
//  }
//   //if it is the not the first time the function is called
//  else if (quotes.length!==0 && dataforGoogleChart.length>0){ 
//      dataforGoogleChart[0].push(req.params.stockSymbol);
//      let j=1;
//      console.log(quotes);
//      console.log('inside second loop');
//      quotes.forEach(function(elem){
//          dataforGoogleChart[j].push(elem.adjClose);
//          j++;
//      });
//      
//      };           
//
//    console.log('data for google');
//    console.log(dataforGoogleChart);
//    next();
//  
//  });
//  
//}



var getData = function(stockSymbol){
  yahooFinance.historical({
  symbol: stockSymbol,
  from: '2016-11-07',
  to: '2016-11-14',
  // period: 'd'  // 'd' (daily), 'w' (weekly), 'm' (monthly), 'v' (dividends only)
}, function (err, quotes) {
  if (err) console.log("Error Message from routes.js:" + err );
  else if (quotes.length===0) { 
      //res.render('home',{"stocks":stocksGlobal, "prices" : JSON.stringify(addRowsArrayGlobal)});
      
  } //if it is the first time the function is called
  else if (quotes.length!==0 && dataforGoogleChart.length===0){
      dataforGoogleChart.push(['Date',stockSymbol]);
      let j=1;
      //console.log(quotes);
      quotes.forEach(function(elem){
          console.log('inside first loop');
          var row = [];
          row.push(j,elem.adjClose);
          dataforGoogleChart.push(row);
          j++;
      });
           
  }
   //if it is the not the first time the function is called
  else if (quotes.length!==0 && dataforGoogleChart.length>0){ 
      dataforGoogleChart[0].push(stockSymbol);
      let j=1;
      console.log(quotes);
      console.log('inside second loop');
      quotes.forEach(function(elem){
          dataforGoogleChart[j].push(elem.adjClose);
          j++;
      });
      
      };           
    console.log('data for google');
    console.log(dataforGoogleChart);
    io.sockets.emit('newStockDataAvailable', dataforGoogleChart); 
  });
  
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
    socket.emit('welcomeMessage',  stocksRequested); 
       socket.on('newStockRequest', function (newStock) {
           getData(newStock);
 
          // io.sockets.emit('newStockDataAvailable', newData);
    });
});
  

http.listen(PORT, function(){
    console.log('Express listening on port '+ PORT + '!');
});

  