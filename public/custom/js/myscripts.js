var socket = io();            

            $(window).resize(function () {
                drawChart();
            });
            $(window).ready(function () {
                $("body").css('background-color', 'white');
            });
       
            document.getElementById("hit").onclick = function () {
                var stockSymbol = document.getElementById("stockSymbol").value;
                console.log('stockSymbol');
                console.log(stockSymbol);
                socket.emit('newStockRequest',stockSymbol);
                //location.href = "/" + stockSymbol;
                console.log(location.href)
            };
            //        http://stackoverflow.com/questions/155188/trigger-a-button-click-with-javascript-on-the-enter-key-in-a-text-box
            document.getElementById("stockSymbol")
                .addEventListener("keyup", function (event) {
                    event.preventDefault();
                    if (event.keyCode == 13) {
                        document.getElementById("hit").click();
                    }
                });
