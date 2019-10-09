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
  
  //egyelore nem torlom , mert ezzel lehet a kivalasztott legordulonel esemenyt letrehozni
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
  refresingAndLoadingPage();
  $("#generate").click(function () {
    //$("canvas").width(300);
     // $("canvas").height(300);
      //clearCanvas();
      getTaskDescription();
      var generate;
      if ($("#usrCheck").is(":hidden") || timeout){
          //clearCanvas();
          generate = host + '/generate?type=' + select;
          $.get(generate, function (data, status) {
            console.log(JSON.parse(data));
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
              circuitResults = JSON.parse(data);
              removeTaskID = circuitResults.id;
              setPrefixOfResults(circuitResults,select);
              startTimer(select,circuitResults,prefixes);
              loadCanvas();
            });
          } 
      }
      timeout = false;
      $("select").val("1");
  });
  $("#checkUsrResult").click(function (e) {
    userSolutionCheck();    
    e.preventDefault();
  });
});
