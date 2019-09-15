//import * as $ from 'jquery';

$(document).ready(function () {
  $("#userresult").hide();
  //ar select = $("option").val();
  //var generate = 'http://localhost:3000/generate?type='+select;
  $("#generate").click( function (){
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
      console.log(JSON.parse(xmlHttp.responseText));
      var obj = JSON.parse(xmlHttp.responseText);
      for (let i = 0; i < obj[1].length; i++){
        $("#result").append(obj[1][i]+'<br>');
      }
      $("#result").append('<hr/>');
      $("#userresult").show();
      return xmlHttp.responseText;
  });
  $("#test").click (()=> {
    var url = "http://localhost:3000/test";
    var result = { thres: $("#thres").val(), thvolt: $("#thvolt").val()};
    console.log(result);
    $.post(url,result, (data) => {
      
        alert('test ok');
      
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