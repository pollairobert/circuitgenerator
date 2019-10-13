/* 
 * The MIT License
 *
 * Copyright 2019 Robert Pollai <pollairobert at gmail.com>, University of Szeged, Department of Technical Informatics.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

$(document).ready(function () {
  //console.log("$(\"#usrSetTime\").val():" +$("#usrSetTime").val());
  //$("#usrSetTime").val("");
  stdTime = 5
  $("#task").val("1");
  $("#stdTime").html(stdTime);
  //$("#usrSetTime").val(stdTime);
  $('#meshSelect').change(function() {
    // this will contain a reference to the checkbox   
    if (this.checked) {
      //alert("sajat ido")
      $("#meshChoise").show();
      //$("#labst").hide();
        // the checkbox is now checked 
    } else {
      $("#meshChoise").hide();
      //$("#labst").show();
        // the checkbox is now no longer checked
    }
  });
  $('#setTime').change(function() {
    // this will contain a reference to the checkbox   
    if (this.checked) {
      //alert("sajat ido")
      $("#usrSetTime").show();
      //$("#labst").hide();
        // the checkbox is now checked 
    } else {
      $("#usrSetTime").hide();
      //$("#labst").show();
        // the checkbox is now no longer checked
    }
  });

  //egyelore nem torlom , mert ezzel lehet a kivalasztott legordulonel esemenyt letrehozni
  $("#task").on('change', function() {
    //stdTime;
    $("#usrSetTime").hide();
    //$("#usrSetTime").val("1");
    $(".checkbox").prop("checked", false);
    $("#meshChoise").val("rnd");
    $("#meshChoise").hide();
    var selected = +$(this).find(":selected").val();
    //alert( $(this).find(":selected").val() );
    if (selected === 1 || selected === 1.1){
      stdTime = 5;
      tempStdTime = stdTime;
      $("#usrSetTime").val(stdTime);
    }
    if (selected === 2 || selected === 3 || selected === 3.1){
      stdTime = 10;
      tempStdTime = stdTime;
      $("#usrSetTime").val(stdTime);
    }
    if (selected >= 4 && selected < 9){
      
      //stdTime = "10 - 30";
      $("#meshSelect").show();
      $("#labms").show();
    } else {
      $("#meshSelect").hide();
      $("#labms").hide();
      $("#meshChoise").hide();
    }
    if (selected === 9){
      stdTime = 10;
      tempStdTime = stdTime;
      $("#usrSetTime").val(stdTime);
    }
    if (selected === 10){
      stdTime = 15;
      tempStdTime = stdTime;
      $("#usrSetTime").val(stdTime);
    }
    if (selected >= 4 && selected < 9){
      $("#stdTime").html("10 - 30");
    } else {
      $("#stdTime").html(stdTime);
    }

  });
  refresingAndLoadingPage();
  $("#generate").click(function () {
    //$("canvas").width(300);
     // $("canvas").height(300);
      //clearCanvas();
      console.log("$(\"#usrSetTime\").val() generate:" +$("#usrSetTime").val());
      getTaskDescription();
      var generate;
      if ($("#usrCheck").is(":hidden") || timeout){
          //clearCanvas();
          generate = host + '/generate?type=' + select;
          $.get(generate, function (data, status) {
            console.log(JSON.parse(data));
            console.log("stdTime:" +stdTime);

            circuitResults = JSON.parse(data);
            removeTaskID = circuitResults.id;
            setPrefixOfResults(circuitResults,select);
            startTimer(select,circuitResults,prefixes);
            
            loadCanvas();
          });
      } else {
          generate = host + '/generate?type=' + select + '&id=' + removeTaskID;
          var confirmation = confirm('Biztos szeretnél újat generálni?');
          if (confirmation) {
            //clearCanvas();
            $.get(generate, function (data, status) {
              console.log(JSON.parse(data));
              console.log("stdTime:" +stdTime);
              circuitResults = JSON.parse(data);
              removeTaskID = circuitResults.id;
              setPrefixOfResults(circuitResults,select);
              startTimer(select,circuitResults,prefixes);
              loadCanvas();
            });
          } 
      }
      timeout = false;
      $(".checkbox").prop("checked", false);
      $("#meshChoise").val("rnd");
      $("#meshChoise").hide();
      $("#usrSetTime").hide();
      
      console.log("stdTime a generalasban a req res utan:" +stdTime);
      //$("#usrSetTime").val(stdTime);
      //$("#setTime").show();
      //$("#labst").show();
      //$('input:checkbox').removeAttr('checked');
      //$("task").val("1");
  });
  $("#checkUsrResult").click(function (e) {
    userSolutionCheck();    
    e.preventDefault();
  });
});
