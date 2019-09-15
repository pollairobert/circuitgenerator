//import * as $ from 'jquery';

$(document).ready(function () {
  $("#userresult").hide();
  //ar select = $("option").val();
  //var generate = 'http://localhost:3000/generate?type='+select;
  $("#generate1").click( function (){
      $("#result").html('');
      var select = $("select").val();
      var generate = 'http://localhost:3000/generate?type='+select;
      var xmlHttp = new XMLHttpRequest();
      xmlHttp.open( "GET", generate, false ); 
      //var type = {'tasktype': select};
      
      //xmlHttp.setRequestHeader("Content-Type", "application/json");
      //type = JSON.stringify(type);
      xmlHttp.send('');
      //console.log(type);
      console.log(generate);
      //console.log(xmlHttp.responseText);
      console.log(JSON.parse(xmlHttp.responseText));
      var obj = JSON.parse(xmlHttp.responseText);
      for (let i = 0; i < obj[1].length; i++){
        $("#result").append(obj[1][i]+'<br>');
      }
      $("#result").append('<hr/>');
      $("#userresult").show();
      //return xmlHttp.responseText;
  });
  $("#generate").click(function(){
    $("#result").html('');
    var select = $("select").val();
    var generate = 'http://localhost:3000/generate?type='+select;
    $.get(generate, function(data, status){
      console.log(JSON.parse(data));
      var responsedata = JSON.parse(data);
      for (let i = 0; i < responsedata[1].length; i++){
        $("#result").append(responsedata[1][i]+'<br>');
      }
      $("#result").append('<hr/>');
      $("#userresult").show();
    });
    $("select").val("1");
  });
  $("#check").click (()=> {
    var url = "http://localhost:3000/check";
    var result = { thres: $("#thres").val(), thvolt: $("#thvolt").val()};
    console.log(result);
    $.post(url,result, (data) => {
        var responsedata = JSON.parse(data)
        if (responsedata.res && responsedata.volt){
          $("#result").html('');
          $("#userresult").hide();
          alert('Correct solution!');
        } 
        if (!responsedata.res && responsedata.volt){
          alert('Inorrect resistance value!');
          $("#thres").val("");
        }
        if (responsedata.res && !responsedata.volt){
          alert('Inorrect voltage value!');
          $("#thvolt").val("");
        }
        if (!responsedata.res && !responsedata.volt){
          alert('Inorrect solution!');
          $("#thres").val("");
          $("#thvolt").val("");
        }
        
    });
      /*var test = $("#inputtest").val();
      var url = 'http://localhost:3000/test';
      var xmlHttp = new XMLHttpRequest();
      xmlHttp.open( "POST", url, false );
      //test = {'test': test};
      xmlHttp.send(JSON.stringify(test));
      return xmlHttp.responseText;*/
  });
  //var select = $("option").val();
  //var generate = 'http://localhost:3000/generate';
  /*$("button").click(function () {
      //$("p").hide();
      console.log('click');
  });*/
  // jQuery methods go here...
});