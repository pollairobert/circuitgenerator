//import * as $ from 'jquery';
//const host = "http://www.stud.u-szeged.hu/Pollai.Robert"
const host = "http://localhost:3000";
//const host = "http://192.168.1.12:3000";
let timer;
let timeout;
let setTimer = false;
//let fslink;
let thr;
let thv;
let prefixes = [];
$(document).ready(function () {
  /*$('select').on('change', function() {
    alert( $(this).find(":selected").val() );
  });*/
  
  console.log(prefixes);
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
    //console.log($('select').text());
    //let falstadlink;
    let selectedTask;
    let checkID;
    $("#resultAmp").hide();
    $("#resultVolt").hide();
    $("#resultTHRes").hide();
    $("#resultTHVolt").hide();
    $("#thres").val("");
    $("#thvolt").val("");
    $("#resCurrent").val("");
    $("#resVolt").val("");
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
    let generate = host+'/generate?type='+select;
    console.log(select);
    if (($("#userresult").is(":hidden") && $("#userresult2").is(":hidden"))  || timeout){
      //clearInterval(timer);
      if (select === "6"){
        $("#userresult").hide();
        $("#resCurrent").show();
        $("#resVolt").show();
        $("#check2").show();
        $("#timecount2").show();
      } else {
        $("#userresult2").hide();
        $("#thres").show();
        $("#thvolt").show();
        $("#check").show();
        $("#timecount").show();
      }
      
      timeout = false;
      $("#result").html('');
      $.get(generate, function(data, status){
        console.log('GET ben prefixes: '+prefixes);
        console.log(status);
        console.log(JSON.parse(data));
        let responsedata = JSON.parse(data);
        prefixes = [];
        prefixes.push(responsedata.voltPrefix, responsedata.currentPrefix);
        console.log('GET ben prefixes - ertekadas utan: '+prefixes);
        falstadlink = '<b><a href="'+responsedata.link+'" target="_blank">Falstad</a></b>';
        //fslink = falstadlink;
        //$("#result").html(falstadlink);
        
        $("#result").append("<h2>"+selectedTask+"</h2>");
        $("#result").append('<hr/>');
        $("#result").append("<h1>Ide jon majd a megjelenitese a halozatnak (CANVAS?)</h1>");
        $("#result").append('<hr/>');
        
        
        //$("#randomID").val(responsedata.id);
        if (select === "6"){
          $("#userresult2").show();
          $("#randomID2").val(responsedata.id);
          $("#resTaskCurrent").html("Ellenálláson folyó áram (<b style=\"color:red;\">"+prefixes[1]+"A</b>): ");
          $("#resTaskVolt").html("Ellenálláson eső feszültseg (<b style=\"color:red;\">"+prefixes[0]+"V</b>): ");
        } else {
          $("#userresult").show();
          $("#randomID").val(responsedata.id);
          $("#thevTaskVolt").html("Thevenin feszültség (<b style=\"color:red;\">"+prefixes[0]+"V</b>): ");
          //prefixes = undefined;
        }
        startTimer(select, falstadlink);
      });
      $("select").val("1");
      
    } else {
      if (select === "6"){
        if ($("#userresult").is(":hidden")){
          checkID = $("#randomID2").val();
          
        } else {
          checkID = $("#randomID").val();
          $("#userresult").hide();
        }
        $("#resCurrent").show();
        $("#resVolt").show();
        $("#check2").show();
        $("#timecount2").show();
        //checkID = $("#randomID").val()
      } else {
        if ($("#userresult2").is(":hidden")){
          checkID = $("#randomID").val();
        } else {
          checkID = $("#randomID2").val();
          $("#userresult2").hide();
        }
        $("#thres").show();
        $("#thvolt").show();
        $("#check").show();
        $("#timecount").show();
      }
      //let confirmation = confirm('Are you sure?');
      let confirmation = confirm('Biztos szeretnél újat generálni?');
      if (confirmation){
        //clearInterval(timer);
        //let checkID = $("#randomID").val()
        console.log('Uj generalas, eldobni valo id: '+checkID);
        $("#result").html('');
        $.get(generate+'&id='+checkID, function(data, status, err){
          console.log('GET ben prefixes: '+prefixes);
          console.log(status);
          //console.log(err);
          console.log(JSON.parse(data));
          let responsedata = JSON.parse(data);
          prefixes = [];
          prefixes.push(responsedata.voltPrefix, responsedata.currentPrefix);
          console.log('GET ben prefixes - ertekadas utan: '+prefixes);
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
            $("#resTaskCurrent").html("Ellenálláson folyó áram (<b style=\"color:red;\">"+prefixes[1]+"A</b>): ");
            $("#resTaskVolt").html("Ellenálláson eső feszültseg (<b style=\"color:red;\">"+prefixes[0]+"V</b>): ");
          } else {
            $("#userresult").show();
            $("#userresult2").hide();
            $("#randomID").val(responsedata.id);
            $("#thevTaskVolt").html("Thevenin feszültség (<b style=\"color:red;\">"+prefixes[0]+"V</b>): ");
          }
          startTimer(select, falstadlink);
        });
        $("select").val("1");
        //if (setTimer){
          //startTimer(select, falstadlink);
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
    let result = { thres: $("#thres").val(), thvolt: $("#thvolt").val(), id: $("#randomID").val(), voltPrefix: prefixes[0], currentPrefix: prefixes[1]};
    
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
          clearInterval(timer);
          timeout = true;
          //$("#userresult").hide();
          //alert('Correct solution!');
          $("#thres").hide();
          $("#thvolt").hide();
          $("#resultTHRes").html('<b>'+responsedata.circuitTHres+'</b>').show();
          $("#resultTHVolt").html('<b>'+responsedata.circuitTHvolt+'</b>').show();
          $("#check").hide();
          $("#timecount").hide();
          $("#thres").val("");
          $("#thvolt").val("");
          $("#randomID").val("");
          alert('Helyes megoldás!');
        } 
        if (!responsedata.res && responsedata.volt){
          //alert('Incorrect resistance value!');
          
          $("#thres").val("");
          alert('Rossz ellenállás érték!');
        }
        if (responsedata.res && !responsedata.volt){
          //alert('Incorrect voltage value!');
          
          $("#thvolt").val("");
          alert('Rossz feszültség érték!');
        }
        if (!responsedata.res && !responsedata.volt){
          //alert('Incorrect solution!');
          
          $("#thres").val("");
          $("#thvolt").val("");
          alert('Helytelen megoldás!');
        }
    });
  });
  $("#check2").click (()=> {
    let url = host + "/check2";
    let result = { resVolt: $("#resVolt").val(), resCurrent: $("#resCurrent").val(), id: $("#randomID2").val(), voltPrefix: prefixes[0], currentPrefix: prefixes[1]};
    
    console.log(result);
    $.post(url,result, (data) => {
        console.log(data);
        let responsedata = JSON.parse(data)
        
        if (responsedata.current && responsedata.volt){
          //let falstadlink = '<a href="'+responsedata.link+'" target="_blank">Falstad</a>';
          console.log(falstadlink);
          $("#result").html('');
          //$("#result").html("<h3>Check the right solution on the "+falstadlink+" page</h3>");
          $("#result").html("<h3>Feladat megoldásának ellenőrzése a "+falstadlink+" oldalán.</h3>");
          clearInterval(timer);
          timeout = true;
          //$("#userresult2").hide();
          //alert('Correct solution!');
          
          $("#resCurrent").hide();
          $("#resVolt").hide();
          $("#resultAmp").html('<b>'+responsedata.resCur+'</b>').show();
          $("#resultVolt").html('<b>'+responsedata.resVolt+'</b>').show();
          $("#check2").hide();
          $("#timecount2").hide();
          $("#resCurrent").val("");
          $("#resVolt").val("");
          $("#randomID2").val("");
          alert('Helyes megoldás!');
        } 
        if (!responsedata.current && responsedata.volt){
          //alert('Incorrect resistance value!');
          
          $("#resCurrent").val("");
          alert('Rossz áram érték!');
        }
        if (responsedata.current && !responsedata.volt){
          //alert('Incorrect voltage value!');
          
          $("#resVolt").val("");
          alert('Rossz feszültség érték!');
        }
        if (!responsedata.current && !responsedata.volt){
          //alert('Incorrect solution!');
          
          $("#resVolt").val("");
          $("#resCurrent").val("");
          alert('Helytelen megoldás!');
        }
    });
  });
});
function startTimer(type,fslink){
  //console.log(fslink);
  let countdownMin = 0;
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
        $("#resCurrent").hide();
        $("#resVolt").hide();
        //$("#resultAmp").text('eredmeny').show();
        //$("#resultVolt").text('eredmeny').show();
        timeOutResult($("#randomID2").val(),type)
      }else{
        $("#check").attr("disabled","disabled");
        $("#thres").hide();
        $("#thvolt").hide();
        timeOutResult($("#randomID").val(),type)
        //$("#resultTHRes").text('eredmeny').show();
        //$("#resultTHVolt").text('eredmeny').show();
        //$("#resultTHRes").show();
        //$("#resultTHVolt").show();
      }
      $("#result").html("<h3>Hálózat megtekintése a "+fslink+" oldalán.</h3>");
      timeout = true;
    }
    if (type === "6"){
      $('#timecount2').text(countdownMin+' m '+countdownSec+ " s ");
    } else {
      $('#timecount').text(countdownMin+' m '+countdownSec+ " s ");
    }
    
  }, 1000);
  
}
function timeOutResult(id, type){
  let reqURL =  host+'/timeout?id='+id+'&voltPrefix='+prefixes[0]+'&currentPrefix='+prefixes[1]+'&type='+type;
  let result = { id: id, voltPrefix: prefixes[0], currentPrefix: prefixes[1], type: type};
  //console.log(reqURL);
  $.post(reqURL, result, function(data, status, err){
    //let result = { id: id, voltPrefix: prefixes[0], currentPrefix: prefixes[1], type: type};
    //console.log(reqURL);
    console.log(status);
    console.log(err);
    let responsedata = JSON.parse(data);
    
    if (type === "6"){
      $("#resultAmp").html('<b>'+responsedata.resCur+'</b>').show();
      $("#resultVolt").html('<b>'+responsedata.resVolt+'</b>').show();
    } else {
      $("#resultTHRes").html('<b>'+responsedata.circuitTHres+'</b>').show();
      $("#resultTHVolt").html('<b>'+responsedata.circuitTHvolt+'</b>').show();
    }
  });
}