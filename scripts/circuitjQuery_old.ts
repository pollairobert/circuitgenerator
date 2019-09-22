//import * as $ from 'jquery';
//const host = "http://www.stud.u-szeged.hu/Pollai.Robert"
const host = "http://localhost:3000";
//const host = "http://192.168.1.12:3000";
let timer;
let timeout;
let setTimer = false;
let thr;
let thv;
let prefixes = [];
let countdownMin;
let countdownSec;
let select;
let checkID;
let title;
let descript;
$(document).ready(function () {
  /*$('select').on('change', function() {
    //alert( $(this).find(":selected").val() );
    if ($(this).find(":selected").val() === "8"){
      $("#generateTask8").show();
      $("#generate").hide();
    } else {
      $("#generateTask8").hide();
      $("#generate").show();
    }
  });*/
  
  //console.log(prefixes);
  $("#userresult").hide();
  $("#userresult2").hide();
  $("#userresultVoltSource").hide();
  let falstadlink;
  $("#generate").click(function(){
    select = $("select").val();
    let decriptSelect = "type"+select;
    console.log(decriptSelect);
    $.ajax({
      dataType: 'json',
      url: 'descript/description.json',
      success: (data)=>{
        title = Object.keys(data[decriptSelect])[0];
        descript = data[decriptSelect][title];
       }
    });
    let generate = host+'/generate?type='+select;
    if (($("#userresult").is(":hidden") && $("#userresult2").is(":hidden") && $("#userresultVoltSource").is(":hidden"))  || timeout){
      console.log("ELSO GENERALAS");
      timeout = false;
      $("#result").html('');
      $("#content").html('');
      $("#timeoutorsolve").html('');
      $.get(generate, function(data, status){
        console.log(JSON.parse(data));
        let responsedata = JSON.parse(data);

        checkID = responsedata.id;

        prefixes = [];
        prefixes.push(responsedata.voltPrefix, responsedata.currentPrefix, responsedata.ohmPrefix);
        falstadlink = '<b><a href="'+responsedata.link+'" target="_blank">Falstad</a></b>';
        startTimer(select, falstadlink, responsedata, prefixes);
      });
      $("select").val("1");
    } else {
      let confirmation = confirm('Biztos szeretnél újat generálni?');
      if (confirmation){
        //clearInterval(timer);
        //let checkID = $("#randomID").val()
        console.log('Uj generalas, eldobni valo id: '+checkID);
        timeout = false;

        $("#result").html('');
        $("#content").html('');
        $.get(generate+'&id='+checkID, function(data, status, err){
          console.log(JSON.parse(data));
          let responsedata = JSON.parse(data);
          checkID = responsedata.id;
          prefixes = [];
          prefixes.push(responsedata.voltPrefix, responsedata.currentPrefix, responsedata.ohmPrefix);
          falstadlink = '<b><a href="'+responsedata.link+'" target="_blank">Falstad</a></b>';
          startTimer(select, falstadlink, responsedata, prefixes);
        });
        $("select").val("1");
      }else {
        console.log('Marad');
      }
    }
    
  });
  $("#check").click (()=> {
    let url = host + "/check";
    let result = { thres: $("#thres").val(), 
                   thvolt: $("#thvolt").val(), 
                   id: $("#randomID").val(), 
                   voltPrefix: prefixes[0], 
                   currentPrefix: prefixes[1], 
                   ohmPrefix: prefixes[2]};
    
    console.log('result kliens oldali checkben');
    console.log(result);
    $.post(url,result, (data) => {
        console.log(data);
        let responsedata = JSON.parse(data)
        
        if (responsedata.res && responsedata.volt){
          //let falstadlink = '<a href="'+responsedata.link+'" target="_blank">Falstad</a>';
          //console.log(falstadlink);
          //$("#result").html('');
          //$("#result").html("<h3>Check the right solution on the "+falstadlink+" page</h3>");
          $("#timeoutorsolve").append("<h3>Feladat megoldásának ellenőrzése a "+falstadlink+" oldalán.</h3>");
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
    let result = { resVolt: $("#resVolt").val(), //relativ hiba is ezen megy a 7-es tipusnal
                   resCurrent: $("#resCurrent").val(), //absulut hiba is ezen megy a 7-es tipusnal
                   id: $("#randomID2").val(), 
                   voltPrefix: prefixes[0], 
                   currentPrefix: prefixes[1], 
                   ohmPrefix: prefixes[2]

                  };
    
    console.log(result);
    $.post(url,result, (data) => {
        console.log(data);
        let responsedata = JSON.parse(data)
        
        if ((responsedata.current && responsedata.volt) || (responsedata.abs && responsedata.rel)){
          //let falstadlink = '<a href="'+responsedata.link+'" target="_blank">Falstad</a>';
          //console.log(falstadlink);
          //$("#result").html('');
          //$("#result").html("<h3>Check the right solution on the "+falstadlink+" page</h3>");
          $("#timeoutorsolve").append("<h3>Feladat megoldásának ellenőrzése a "+falstadlink+" oldalán.</h3>");
          clearInterval(timer);
          timeout = true;
          //$("#userresult2").hide();
          //alert('Correct solution!');
          
          $("#resCurrent").hide();
          $("#resVolt").hide();
          if (select === "7"){
            $("#resultAmp").html('<b>'+responsedata.absErr+'</b>').show();
            $("#resultVolt").html('<b>'+responsedata.relErr+'</b>').show();
          } else {
            $("#resultAmp").html('<b>'+responsedata.resCur+'</b>').show();
            $("#resultVolt").html('<b>'+responsedata.resVolt+'</b>').show();
          }
          
          $("#check2").hide();
          $("#timecount2").hide();
          $("#resCurrent").val("");
          $("#resVolt").val("");
          $("#randomID2").val("");
          alert('Helyes megoldás!');
        } 
        if (select === "7"){
          if (!responsedata.abs && responsedata.rel){
            //alert('Incorrect resistance value!');
            
            $("#resCurrent").val("");
            alert('Rossz abszolút hiba érték!');
          }
          if (responsedata.abs && !responsedata.rel){
            //alert('Incorrect voltage value!');
            
            $("#resVolt").val("");
            alert('Rossz relativ hiba érték!');
          }
          if (!responsedata.abs && !responsedata.rel){
            //alert('Incorrect solution!');
            
            $("#resVolt").val("");
            $("#resCurrent").val("");
            alert('Helytelen megoldás!');
          }
        } else {
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
        }
        
    });
  });
  
});
function startTimer(type,fslink,responsedata?, prefixes?){
  //console.log(fslink);
  countdownMin = 0;
  countdownSec = 20;
  $("#result").html('');
  $("#content").html('');
  $("#timeoutorsolve").html('');
  $(".usrButton").show();
  $(".usrCounter").show();
  $(".usrinput").show();
  $(".usrinput").val("");
  $(".result").hide();
  $("#content").append("<h2>"+title+"</h2>");
  $("#content").append("<p>"+descript+"</p>");
  $("#result").append('<hr/>');
  $("#result").append("<h1>Ide jon majd a megjelenitese a halozatnak (CANVAS?)</h1>");
  $("#result").append('<hr/>');
  if (type === "6" || type === "7"){
    //console.log("KIBASZOTT 6 vagy 7");
    $("#userresult2").show();
    $("#resCurrent").show();
    $("#resVolt").show();
    $("#userresult").hide();
    $("#userresultVoltSource").hide();
    $("#check2").prop("disabled", false);
    $('#timecount2').text(countdownMin+' m '+countdownSec+ " s ");
    $("#randomID2").val(responsedata.id);
    if (select === "7"){
      //console.log("KIBASZOTT 7");
      $("#resTaskCurrent").html("Abszolút hiba nagysága (<b style=\"color:red;\">"+prefixes[0]+"V</b>): ");
      $("#resTaskVolt").html("Relatív hiba nagysága (<b style=\"color:red;\">%</b>): ");
    } else {
      //console.log("KIBASZOTT 6");
      $("#resTaskCurrent").html("Ellenálláson folyó áram (<b style=\"color:red;\">"+prefixes[1]+"A</b>): ");
      $("#resTaskVolt").html("Ellenálláson eső feszültseg (<b style=\"color:red;\">"+prefixes[0]+"V</b>): ");
    }
  } else if (type === "8"){
    //console.log("KIBASZOTT 8");
    //$("#voltValue").show();
    $("#userresultVoltSource").show();
    $("#userresult2").hide();
    $("#userresult").hide();
    $("#check3").prop("disabled", false);
    $('#timecount3').text(countdownMin+' m '+countdownSec+ " s ");
    $("#randomID3").val(responsedata.id);
    $("#voltSourceTask").html("Kapocsfeszültség (<b style=\"color:red;\">"+prefixes[0]+"V</b>): ");
  } else {
    //console.log("KIBASZOTT MINDEN MAS");
    //$("#thres").show();
    //$("#thvolt").show();
    $("#userresult").show();
    $("#userresult2").hide();
    $("#userresultVoltSource").hide();
    $("#check").prop("disabled", false);
    $('#timecount').text(countdownMin+' m '+countdownSec+ " s ");
    $("#userresult").show();
    $("#randomID").val(responsedata.id);
    $("#thevTaskVolt").html("Thevenin feszültség (<b style=\"color:red;\">"+prefixes[0]+"V</b>): ");
    $("#thevTaskRes").html("Thevenin ellenállás (<b style=\"color:red;\">"+prefixes[2]+"Ω</b>): ");
  }
  //$("#check").prop("disabled", false);
  //$('#timecount').text(countdownMin+' m '+countdownSec+ " s ");
  clearInterval(timer);
  timer = setInterval(() => {
    countdownSec--;
    if(countdownSec === -1){
      countdownMin--;
      countdownSec = 9;
    }
    if (countdownSec === 0 && countdownMin === 0){
      clearInterval(timer);
      if (type === "6" || type === "7"){
        $("#check2").attr("disabled","disabled");
        $("#resCurrent").hide();
        $("#resVolt").hide();
        //$("#resultAmp").text('eredmeny').show();
        //$("#resultVolt").text('eredmeny').show();
        timeOutResult($("#randomID2").val(),type)
      } else if (type === "8"){
        $("#check3").attr("disabled","disabled");
        $('#voltValue').hide();
        timeOutResult($("#randomID3").val(),type)
      } else {
        $("#check").attr("disabled","disabled");
        $("#thres").hide();
        $("#thvolt").hide();
        timeOutResult($("#randomID").val(),type)
        //$("#resultTHRes").text('eredmeny').show();
        //$("#resultTHVolt").text('eredmeny').show();
        //$("#resultTHRes").show();
        //$("#resultTHVolt").show();
      }
      $("#timeoutorsolve").append("<h3>Hálózat megtekintése a "+fslink+" oldalán.</h3>");
      timeout = true;
    }
    if (type === "6" || type === "7"){
      $('#timecount2').text(countdownMin+' m '+countdownSec+ " s ");
    } if (type === "8"){
      $('#timecount3').text(countdownMin+' m '+countdownSec+ " s ");
    }else {
      $('#timecount').text(countdownMin+' m '+countdownSec+ " s ");
    }
    
  }, 1000);
  
}
function timeOutResult(id, type){
  let reqURL =  host+'/timeout?id='+id+'&voltPrefix='+prefixes[0]+'&currentPrefix='+prefixes[1]+'&type='+type+'&resPrefix='+prefixes[2];
  let result = { id: id, voltPrefix: prefixes[0], currentPrefix: prefixes[1], type: type, resPrefix: prefixes[2]};
  $(".result").val("");
  //$("#resultVolt").html("");
  //console.log(reqURL);
  $.post(reqURL, result, function(data, status, err){
    //let result = { id: id, voltPrefix: prefixes[0], currentPrefix: prefixes[1], type: type};
    //console.log(reqURL);
    let responsedata = JSON.parse(data);
    
    if (type === "6" || type === "7"){
      if (type === "7"){
        $("#resultAmp").html('<b>'+responsedata.resCur+'</b>').show();
        $("#resultVolt").html('<b>'+responsedata.resVolt+'</b>').show();
      }else {
        $("#resultAmp").html('<b>'+responsedata.resCur+'</b>').show();
        $("#resultVolt").html('<b>'+responsedata.resVolt+'</b>').show();
      }
      
    } else {
      $("#resultTHRes").html('<b>'+responsedata.circuitTHres+'</b>').show();
      $("#resultTHVolt").html('<b>'+responsedata.circuitTHvolt+'</b>').show();
    }
  });
}