//import * as $ from 'jquery';
//const host = "http://www.stud.u-szeged.hu/Pollai.Robert"
const host = "http://localhost:3000";
//const host = "http://192.168.1.12:3000";
$(document).ready(function () {
  $("#userresult").hide();
  $("#generate").click(function(){
    let select = $("select").val();
    let checkID = $("#randomID").val()
    let generate = host+'/generate?type='+select;
    if ($("#userresult").is(":hidden")){
      $("#result").html('');
      $.get(generate, function(data, status){
        console.log(JSON.parse(data));
        let responsedata = JSON.parse(data);
        let falstadlink = '<a href="'+responsedata.link+'" target="_blank">Falstad link</a>';
        $("#result").html(falstadlink);
        $("#result").append('<hr/>');
        $("#randomID").val(responsedata.id);
        $("#userresult").show();
      });
      $("select").val("1");
      //console.log('elso generalas');
      
    } else {
      let confirmation = confirm('Are you sure?');
      if (confirmation){
        //let checkID = $("#randomID").val()
        console.log('Uj generalas, eldobni valo id: '+checkID);
        $("#result").html('');
        $.get(generate+'&id='+checkID, function(data, status, err){
          console.log(status);
          console.log(err);
          console.log(JSON.parse(data));
          let responsedata = JSON.parse(data);
          let falstadlink = '<a href="'+responsedata.link+'" target="_blank">Falstad link</a>';
          $("#result").html(falstadlink);
          $("#result").append('<hr/>');
          $("#randomID").val(responsedata.id);
          $("#userresult").show();
        });
        $("select").val("1");
      }else {
        console.log('Marad');
      }
    }
      /*let confirmation = confirm('Are you sure?');
      if (confirmation){
        if ($('#result').is(':empty')){
          console.log(typeof($("#result").val()));
        }
        $("#result").html('');
        let select = $("select").val();
        let checkID = $("#randomID").val()
        let generate = host+'/generate?type='+select+'&id='+checkID;
        $.get(generate, function(data, status){
          console.log(JSON.parse(data));
          let responsedata = JSON.parse(data);
          let falstadlink = '<a href="'+responsedata.link+'" target="_blank">Falstad link</a>';
          $("#result").html(falstadlink);
          $("#result").append('<hr/>');
          $("#randomID").val(responsedata.id);
          $("#userresult").show();
        });
        $("select").val("1");
      }
    } else {*/
      
     
    //}
    
  });
  $("#check").click (()=> {
    let url = host + "/check";
    let result = { thres: $("#thres").val(), thvolt: $("#thvolt").val(), id: $("#randomID").val()};
    
    console.log(result);
    $.post(url,result, (data) => {
        let responsedata = JSON.parse(data)
        if (responsedata.res && responsedata.volt){
          $("#result").html('');
          $("#userresult").hide();
          alert('Correct solution!');
          $("#thres").val("");
          $("#thvolt").val("");
          $("#randomID").val("");
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
  });
});