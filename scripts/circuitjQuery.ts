//import * as $ from 'jquery';
//const host = "http://www.stud.u-szeged.hu/Pollai.Robert"
const host = "http://localhost:3000";
//const host = "http://192.168.1.12:3000";
let timer;
let timeout;
let setTimer = false;

$(document).ready(function () {
  $("#userresult").hide();
  let falstadlink;
  $("#generate").click(function(){
    let select = $("select").val();
    let checkID = $("#randomID").val()
    let generate = host+'/generate?type='+select;
    
    if ($("#userresult").is(":hidden") || timeout){
      //clearInterval(timer);
      timeout = false;
      $("#result").html('');
      $.get(generate, function(data, status){
        //console.log(JSON.parse(data));
        let responsedata = JSON.parse(data);
        falstadlink = '<b><a href="'+responsedata.link+'" target="_blank">Falstad</a></b>';
        //$("#result").html(falstadlink);
        $("#result").html("<h1>Ide jon majd a megjelenitese a halozatnak (CANVAS?)</h1>");
        $("#result").append('<hr/>');
        $("#randomID").val(responsedata.id);
        $("#userresult").show();
      });
      $("select").val("1");
      //if (setTimer){
        startTimer();
      //}
      
      /*let countdownMin = 0;
      let countdownSec = 9;
      timer = setInterval(() => {
        countdownSec--;
        if(countdownSec === -1){
          countdownMin--;
          countdownSec = 9;
        }
        if (countdownSec === 0 && countdownMin === 0){
          clearInterval(timer);
        }
        $('#timecount').text(countdownMin+' m '+countdownSec+ " s ");
      }, 1000);*/
      //console.log('elso generalas');
      
    } else {
      //let confirmation = confirm('Are you sure?');
      let confirmation = confirm('Biztos szeretnél újat generálni?');
      if (confirmation){
        //clearInterval(timer);
        //let checkID = $("#randomID").val()
        console.log('Uj generalas, eldobni valo id: '+checkID);
        $("#result").html('');
        $.get(generate+'&id='+checkID, function(data, status, err){
          console.log(status);
          console.log(err);
          //console.log(JSON.parse(data));
          let responsedata = JSON.parse(data);
          falstadlink = '<b><a href="'+responsedata.link+'" target="_blank">Falstad</a></b>';
          
          //$("#result").html(falstadlink);
          $("#result").html("<h1>Ide jon majd a megjelenitese a halozatnak (CANVAS?)</h1>");
          
          $("#result").append('<hr/>');
          $("#randomID").val(responsedata.id);
          $("#userresult").show();
        });
        $("select").val("1");
        //if (setTimer){
          startTimer();
        //}
        /*let countdownMin = 0;
        let countdownSec = 9;
        timer = setInterval(() => {
          countdownSec--;
          if(countdownSec === -1){
            countdownMin--;
            countdownSec = 9;
          }
          if (countdownSec === 0 && countdownMin === 0){
            clearInterval(timer);
          }
          $('#timecount').text(countdownMin+' m '+countdownSec+ " s ");
        }, 1000);*/
      }else {
        console.log('Marad');
      }
    }
    
  });
  $("#check").click (()=> {
    let url = host + "/check";
    let result = { thres: $("#thres").val(), thvolt: $("#thvolt").val(), id: $("#randomID").val()};
    
    console.log(result);
    $.post(url,result, (data) => {
        console.log(data);
        let responsedata = JSON.parse(data)
        
        if (responsedata.res && responsedata.volt){
          //let falstadlink = '<a href="'+responsedata.link+'" target="_blank">Falstad</a>';
          console.log(falstadlink);
          $("#result").html('');
          //$("#result").html("<h3>Check the right solution on the "+falstadlink+" page</h3>");
          $("#result").html("<h3>Feladat megoldásának ellenőrzése a "+falstadlink+" oldalon.</h3>");
          $("#userresult").hide();
          //alert('Correct solution!');
          alert('Helyes megoldás!');
          $("#thres").val("");
          $("#thvolt").val("");
          $("#randomID").val("");
        } 
        if (!responsedata.res && responsedata.volt){
          //alert('Incorrect resistance value!');
          alert('Rossz ellenállás érték!');
          $("#thres").val("");
        }
        if (responsedata.res && !responsedata.volt){
          //alert('Incorrect voltage value!');
          alert('Rossz feszültség érték!');
          $("#thvolt").val("");
        }
        if (!responsedata.res && !responsedata.volt){
          //alert('Incorrect solution!');
          alert('Helytelen megoldás!');
          $("#thres").val("");
          $("#thvolt").val("");
        }
    });
  });
});
function startTimer(){
  let countdownMin = 4;
  let countdownSec = 59;
  $("#check").prop("disabled", false);
  $('#timecount').text(countdownMin+' m '+countdownSec+ " s ");
  clearInterval(timer);
  timer = setInterval(() => {
    countdownSec--;
    if(countdownSec === -1){
      countdownMin--;
      countdownSec = 9;
    }
    if (countdownSec === 0 && countdownMin === 0){
      clearInterval(timer);
      $("#check").attr("disabled","disabled");
      timeout = true;
    }
    $('#timecount').text(countdownMin+' m '+countdownSec+ " s ");
  }, 1000);
  
}