//import * as $ from 'jquery';
//const host = "http://www.stud.u-szeged.hu/Pollai.Robert"
const host = "http://localhost:3000";
//const host = "http://192.168.1.12:3000";
let timer;
let timeout;
let setTimer = false;
let fslink;
let thr;
let thv;
$(document).ready(function () {
  $("#userresult").hide();
  $("#userresult2").hide();
  let options = ['Egyszerű feszültségosztó',
      'Egyszerű feszültségosztó (2 generátor)',
      'Kettős feszültségosztó',
      'Kettős feszültségosztó (2 generátor)',
      'Kettős feszültségosztó (3 generátor)',
      'KÜLSŐ 2 pólus felőli helyettesítés (Random hálózat)',
      'BELSŐ 2 pólus felőli helyettesítés (Random hálózat)',
      'Ellenálláson eső feszültség és a rajta folyó áram megadása (Random hálózat)'
    ];
  let falstadlink;
  $("#generate").click(function(){
    let select = $("select").val();
    console.log($('select').text());
    let selectedTask;
    switch (select){
      case '1': {
        selectedTask = options[0];
        break;
      }
      case '1.1': {
        selectedTask = options[1];
        break;
      }
      case '2': {
        selectedTask = options[2];
        break;
      }
      case '3': {
        selectedTask = options[3];
        break;
      }
      case '3.1': {
        selectedTask = options[4];
        break;
      }
      case '4': {
        selectedTask = options[5];
        break;
      }
      case '5': {
        selectedTask = options[6];
        break;
      }
      case '6': {
        selectedTask = options[7];
        break;
      }
    }
    let checkID;
    
    if (select === "6"){
      if ($("#userresult").is(":hidden")){
        checkID = $("#randomID2").val()
      } else {
        checkID = $("#randomID").val()
      }
      //checkID = $("#randomID").val()
    } else {
      if ($("#userresult2").is(":hidden")){
        checkID = $("#randomID").val()
      } else {
        checkID = $("#randomID2").val()
      }
    }
    //let checkID = $("#randomID").val()
    let generate = host+'/generate?type='+select;
    console.log(select);
    if (($("#userresult").is(":hidden") && $("#userresult2").is(":hidden"))  || timeout){
      //clearInterval(timer);
      timeout = false;
      $("#result").html('');
      $.get(generate, function(data, status){
        console.log(status);
        console.log(JSON.parse(data));
        let responsedata = JSON.parse(data);
        falstadlink = '<b><a href="'+responsedata.link+'" target="_blank">Falstad</a></b>';
        fslink = falstadlink;
        //$("#result").html(falstadlink);
        
        $("#result").append("<h2>"+selectedTask+"</h2>");
          $("#result").append('<hr/>');
        $("#result").append("<h1>Ide jon majd a megjelenitese a halozatnak (CANVAS?)</h1>");
        $("#result").append('<hr/>');
        //$("#randomID").val(responsedata.id);
        if (select === "6"){
          $("#userresult2").show();
          $("#randomID2").val(responsedata.id);
        } else {
          $("#userresult").show();
          $("#randomID").val(responsedata.id);
        }
        
      });
      $("select").val("1");
      //if (setTimer){
        startTimer(select);
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
          console.log(JSON.parse(data));
          let responsedata = JSON.parse(data);
          falstadlink = '<b><a href="'+responsedata.link+'" target="_blank">Falstad</a></b>';
          
          //$("#result").html(falstadlink);
          $("#result").append("<h2>"+selectedTask+"</h2>");
          $("#result").append('<hr/>');
          $("#result").append("<h1>Ide jon majd a megjelenitese a halozatnak (CANVAS?)</h1>");
          
          $("#result").append('<hr/>');
          //$("#randomID").val(responsedata.id);
          if (select === "6"){
            $("#userresult2").show();
            $("#userresult").hide();
            $("#randomID2").val(responsedata.id);
          } else {
            $("#userresult").show();
            $("#userresult2").hide();
            $("#randomID").val(responsedata.id);
          }
        });
        $("select").val("1");
        //if (setTimer){
          startTimer(select);
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
          $("#result").html("<h3>Feladat megoldásának ellenőrzése a "+falstadlink+" oldalán.</h3>");
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
function startTimer(type){
  let countdownMin = 29;
  let countdownSec = 59;
  if (type === "6"){
    $("#check2").prop("disabled", false);
    $('#timecount2').text(countdownMin+' m '+countdownSec+ " s ");
  } else {
    $("#check").prop("disabled", false);
    $('#timecount').text(countdownMin+' m '+countdownSec+ " s ");
  }
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
      if (type === "6"){
        $("#check2").attr("disabled","disabled");
      }else{
        $("#check").attr("disabled","disabled");
      }
      $("#result").html("<h3>Megoldás megtekintése a "+fslink+" oldalán.</h3>");
      timeout = true;
    }
    if (type === "6"){
      $('#timecount2').text(countdownMin+' m '+countdownSec+ " s ");
    } else {
      $('#timecount').text(countdownMin+' m '+countdownSec+ " s ");
    }
    
  }, 1000);
  
}