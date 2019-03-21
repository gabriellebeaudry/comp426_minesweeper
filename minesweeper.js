$(document).ready(function(){

    // create inputs for game parameters (size, mines)
    $('.header-section').append('<input id = "input_rows" type="int" placeholder="Number of Rows">');
    $('.header-section').append('<input id = "input_cols" type="int" placeholder="Number of Columns">');
    $('.header-section').append('<input id = "input_mines" type="int" placeholder="Number of Mines">');

    // button for playing the game 
    $('.header-section').append('<button id="play_button"> Ready to Play! </button>');
    // button for reloading the game 
    $('.header-section').append('<button id="start_over"> Start Over </button>'); 

    var inputRow; 
    var inputCol;  
    var inputMine; 
    var total; 

    var stopgame = false; 

    var timercounter = 0; 
    var timer; 
    var besttime = 10000; 
    var endtime; 



    function startTimer() { 
        timercounter = 0;
        timer = setInterval(function(){
            timercounter++; 
            document.getElementById("timerclass").innerHTML = "Timer: " + timercounter;
        }, 1000); 

    }


    $("#start_over").click(function()  {  
        revealMines(); 
        clearInterval(timer); 
        timercounter = 0; 
        document.getElementById("timerclass").innerHTML = "Timer: " + timercounter;
        $("#gameboard_table").remove(); 
        $("#play_button").prop("disabled", false);


    });  

    $("#play_button").click(function()  { 

        var index = 1; 

        var inputRow = document.getElementById("input_rows").value; 
        var inputCol = document.getElementById("input_cols").value; 
        var inputMine = parseInt(document.getElementById("input_mines").value); 
        var total = inputRow * inputCol; 


        document.getElementById("mines_left").innerHTML = "Mines left to find: " + inputMine;

        if (inputRow > 30 || inputRow < 8 || inputCol < 8 || inputCol > 40 || inputMine < 1 || inputMine > total) { 
            alert("Input parameter invalid!"); 

        }
        else { 
            startTimer(); 
            $("#play_button").prop("disabled", true); // can only press play once 

            $('#gameboard').append('<table id="gameboard_table" border="1" cellspacing="1" width="100%"> </table>'); // append table to gameboard div 

            var table = document.getElementById("gameboard_table"); 
            console.log("input Row: "+ inputRow);
            console.log("input Col: "+ inputCol); 
            console.log("total: "+ total); 

            //create table in double for loop 
            for (var i = 0; i < inputRow; i ++) { 
                var tr = document.createElement("tr"); 
                table.appendChild(tr);
                for (var k = 0; k < inputCol; k ++) { 
                    var currenttr = $(tr); 
                    var td = document.createElement("td"); 
                    currenttr.append(td); 

                    // add attributes to each td 
                    $(td).attr("col", $(td).index() + 1); 
                    $(td).attr("row", $(currenttr).index() + 1);
                    $(td).attr("index", index);  

                    var currentIndex = $(td).attr("index"); 
                    index ++

                }
            }

            // randomly place mines by index 
            for (var x = 0; x < inputMine; x++) { 
                var mineIndex = Math.floor(Math.random() * total) + 1; 

                var mine_is = $('*[index = "' + mineIndex + '" ]');
                while(mine_is.hasClass("mine")) { // handle duplicate indices 
                    var mineIndex = Math.floor(Math.random() * total);
                    var mine_is = $('*[index = "' + mineIndex + '" ]');
                } 
                mine_is.addClass("mine"); 
            }


            // count surrounding bombs for each cell 
            $("td").each(function() {
                var id = $(this).attr("index");
                var r = parseInt($(this).attr("row"));
                var c = parseInt($(this).attr("col"));
                var counterAdjBombs = 0;
 
                for(var i = -1; i < 2; i++) {
                    for(var j = -1; j < 2; j++) {
                        if(i === 0 && j === 0) { // case for reaching cell you selected 
                            continue;
                        }
                        let selector = $('td[row=' + (r + i) + '][col=' + (c + j) + ']');
                        if(selector.hasClass('mine')) {
                            counterAdjBombs++;
                        }
                    }
                }
                $(this).attr("adjSum", counterAdjBombs); // set the attr for that td 
               // $(this).attr("id", counterAdjBombs); // or do an id for quicker traversal 

            });
        } 
    }); //end of play button 


    // methods for flagging a button 
    var shiftPressed = false;
    $(document).keydown(function(event) {
        shiftPressed = event.keyCode==16;
    });
    $(document).keyup(function(event) {
        if( event.keyCode==16 ){ shiftPressed = false; }
    });
    $('.flagged').each(function(){ 
        // $(this).html('<b> flagged </b>'); 

        $(this).html('<img id="idflag" src=flag.jpg">'); 
    }); 

    var count_flagged = 0; 
    var minesLeft = 0; 
    //var minesLeft = (parseInt(inputMine) - count_flagged);
    console.log("global minesLeft is " + inputMine); 

    // upon clicking a td 
    $('#gameboard').on('click', 'td', function() {
        var r = parseInt($(this).attr("row"));  
        var c = parseInt($(this).attr("col"));
        var adjSumThis = parseInt($(this).attr("adjSum"));

        // flag 
        if(shiftPressed){
            if ($(this).hasClass("flagged")) { 
                $(this).removeClass("flagged");
                count_flagged --;
                console.log("minesLeft is " + minesLeft); 
                var minesLeft = parseInt(inputMine) - parseInt(count_flagged);
                console.log("mines_left is " + minesLeft); 
                document.getElementById("mines_left").innerHTML = "Mines left to find: " + minesLeft; 
                console.log("removed flagged")
            } else { 
                $(this).addClass("flagged"); 
                count_flagged ++; 
                console.log("count_flagged " + count_flagged); 
                minesLeft = inputMine - count_flagged;
                console.log("mines_left is " + parseInt(minesLeft)); 
                document.getElementById("mines_left").innerHTML = "Mines left to find: " + minesLeft;

                $(this).html('<img src="flag.jpeg">');
            }
        }
        
        
        
        if (!shiftPressed) { 

            if (!$(this).hasClass("flagged")) { 
                if ($(this).hasClass("mine") ) {
                    $(this).addClass("clickedmine"); 

                    alert("game over!");
                    revealMines(); 
                    stopTimer(); 

                    besttime = Math.min(besttime, endtime); 
                    document.getElementById("best_time").innerHTML = "Shortest Game Time: " + besttime; // error here 

                }




                // } 
                //neighbor case  
                else if (adjSumThis > 0) {
                    $(this).addClass("neighbor"); 
                    $(this).html(' <b>' +adjSumThis+ '</b>'); 
                } 

                // case for recursion 
                else if (adjSumThis === 0) {
                    console.log("BLANK CASE" );
                    $(this).addClass("checked");
                    let cellToPassIn = $('td[row=' + r + '][col=' + c + ']');
                    iterateAround(cellToPassIn);         
                }
            }
        } 
    });

    function stopTimer() { 
        clearInterval(timer); 
        endtime = timercounter; 
        timer = null; 

    }

    function revealMines() {
        $('.mine').each(function(){
            $(this).addClass("minefield"); 
            $(this).html('<img src="mine.jpeg">');
        });  

    } 


    // iterate through the cells around 
    var iterateAround = function(cellToPassIn) {
        var r = parseInt($(cellToPassIn).attr("row")); 
        var c = parseInt($(cellToPassIn).attr("col"));

        console.log("inputRow " + inputRow);
        console.log("inputCol " + inputCol);

        for(var i = -1; i < 2; i++) {
            for(var j = -1; j < 2; j++) {
                let $cellToCheck = $('td[row=' + (r + i) + '][col=' + (c + j) + ']');
                checkAdj($cellToCheck);
            }
        }

        // });
    } 


    function checkAdj($cellToCheck) { 
        console.log($cellToCheck); 
        var row = parseInt($cellToCheck.attr("row")); 
        var col = parseInt($cellToCheck.attr("col"));
        console.log("inside check Adj function ");
        var adjSumThis = $cellToCheck.attr('adjsum'); 

        if (row<1 || row > inputRow || col <1 || col > inputCol) { //coordinate out of bounds
            console.log("row is " + (row));
            console.log("col is " + (col));
            console.log("inputRow " + inputRow);
            console.log("inputCol " + inputCol);
            console.log("out of bounds")
            return;  
        }
        if ($cellToCheck.hasClass("checked") || $cellToCheck.hasClass("neighbor")) {
            console.log("cell to check is checked already or is a neighbor"); 
            return; }
        if ($cellToCheck.hasClass("flagged")) {
            console.log("flagged"); 
            return; }


        // if the cell is flagged!! 


        if ((parseInt($cellToCheck.attr('adjsum')) === 0)) { 
            console.log("inside check Adj function blank case");
            $cellToCheck.addClass("checked");  
            iterateAround($cellToCheck); 
        }

        else { 
            console.log("inside check Adj function else" ); 
            $cellToCheck.addClass("neighbor");
            $cellToCheck.html(' <b>' +adjSumThis+ '</b>');

        }
    }




}); //end of document ready function 

// TODO 

// timer on first click 
// bombs yet to be found 


//
//click play --> start timer 
//
//hit mine --> end timer 
//
//win game --> end timer, update best time 
//
//
//



// SCRATCH CODE 

//click function 
// $('#gameboard').on('click', 'td', function() { } 
// use setInterval(); for the timer 
//units in CSS https://www.w3schools.com/cssref/css_units.asp
// use @ for bombs 
