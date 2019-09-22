var description = {
  "type1": {
      "Egyszerű feszültségosztó": 
          "Old meg az A - B pontok közötti hálózat Thevenin helyattesítését!<br>Figyelj az eredmény megadásánál zárójelben szereplő prefixum szerinti értékadásra!<br>Legalább 3 tizedesjegy pontosságú legyen!"
          
  },
  "type1.1": {
      "Egyszerű feszültségosztó (2 generátor)": 
          "Old meg az A - B pontok közötti hálózat Thevenin helyattesítését!<br>Figyelj az eredmény megadásánál zárójelben szereplő prefixum szerinti értékadásra!<br>Legalább 3 tizedesjegy pontosságú legyen!"
  },
  "type2": {
      "Kettős feszültségosztó": 
          "Old meg az A - B pontok közötti hálózat Thevenin helyattesítését!<br>Figyelj az eredmény megadásánál zárójelben szereplő prefixum szerinti értékadásra!<br>Legalább 3 tizedesjegy pontosságú legyen!"
  },
  "type3": {
      "Kettős feszültségosztó (2 generátor)": 
          "Old meg az A - B pontok közötti hálózat Thevenin helyattesítését!<br>Figyelj az eredmény megadásánál zárójelben szereplő prefixum szerinti értékadásra!<br>Legalább 3 tizedesjegy pontosságú legyen!"
  },
  "type3.1": {
      "Kettős feszültségosztó (3 generátor)": 
          "Old meg az A - B pontok közötti hálózat Thevenin helyattesítését!<br>Figyelj az eredmény megadásánál zárójelben szereplő prefixum szerinti értékadásra!<br>Legalább 3 tizedesjegy pontosságú legyen!"
  },
  "type4": {
      "A hálózat KÜLSŐ 2 pólus közötti helyettesítése": 
          "Old meg az A - B pontok közötti összetett hálózat Thevenin helyattesítését!<br>Figyelj az eredmény megadásánál zárójelben szereplő prefixum szerinti értékadásra!<br>Legalább 3 tizedesjegy pontosságú legyen!"
  },
  "type5": {
      "A hálózat BELSŐ 2 pólus közötti helyettesítése": 
          "Old meg az A - B pontok közötti összetett hálózat Thevenin helyattesítését!<br>Figyelj az eredmény megadásánál zárójelben szereplő prefixum szerinti értékadásra!<br>Legalább 3 tizedesjegy pontosságú legyen!"
  },
  "type6": {
      "Ellenálláson eső feszültség és a rajta folyó áram megadása": 
          "Thevenin helyettesítés segíségével határozd meg a jelölt ellenalláson folyó áramot, valamint annak feszültségét!<br>Figyelj az eredmény megadásánál zárójelben szereplő prefixum szerinti értékadásra!<br>Legalább 3 tizedesjegy pontosságú legyen!"
  },
  "type7": {
      "Mérési hiba megadása": 
          "Adott egy 2 MΩ belső ellenállású feszültségmérő. Mekkora lesz az abszolút és relatív mérési hiba, ha az alábbi hálózat  A - B pontján mérjük meg a feszültséget?<br>Figyelj az eredmény megadásánál zárójelben szereplő prefixum szerinti értékadásra!<br>Legalább 3 tizedesjegy pontosságú legyen!"
  },
  "type8": {
      "Megadott belső ellenállású feszültséggenerátor beiktatása": 
          "Adott az alábbi belső ellenállású és feszültségű generátor. Add meg mekkora lesz az A és B pontok közötti kapocsfeszültség, ha rákötjük a generátort ezen pontokra.<br>Figyelj az eredmény megadásánál zárójelben szereplő prefixum szerinti értékadásra!<br>Legalább 3 tizedesjegy pontosságú legyen!"
  }
}
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
  canvas = document.getElementById('drawCircuit');
  ctx = canvas.getContext('2d');
  

  $("#usrCheck").hide();
  $("#drawCircuit").hide();
  $("#drawCircuit").closest();
  $("#hrUP").hide();
  $("#hrDown").hide();
  var falstadlink;
  $("#generate").click(function () {
      clearCanvas();
      select = $("select").val();
      var descriptSelect = "type" + select;
      /*$.ajax({
          dataType: 'json',
          url: 'descript/description.json',
          success: function (data) {
              title = Object.keys(data[decriptSelect])[0];
              descript = data[decriptSelect][title];
          }
      });*/
      $("#drawCircuit").closest();
      title = Object.keys(description[descriptSelect])[0];
      descript = description[descriptSelect][title];
      var generate;
      var regenerateTask = false;
      if ($("#usrCheck").is(":hidden") || timeout){
          generate = host + '/generate?type=' + select;
          
      } else {
          generate = host + '/generate?type=' + select + '&id=' + removeTaskID;
          var confirmation = confirm('Biztos szeretnél újat generálni?');
          if (confirmation) {
            regenerateTask = true;
            console.log('Uj generalas, eldobni valo id: ' + removeTaskID);
          } else {
            console.log('Marad');
          }
      }
      timeout = false;
        $.get(generate, function (data, status) {
          console.log(JSON.parse(data));
          console.log(generate);
          circuitResults = JSON.parse(data);
          removeTaskID = circuitResults.id;
          setPrefixOfResults(circuitResults,select);
          console.log(prefixes);
          startTimerTest(select,circuitResults,prefixes);
          loadCanvas();
        });
        $("select").val("1");
      
  });
  $("#checkUsrResult").click(function (e) { 
    //console.log(circuitResults);
    //console.log("checktest");
    var wrongElement1;
    var wrongElement2;
    checkResult(+$("#value1").val(),+$("#value2").val());
    if (+select > 0 && +select <= 5){
        wrongElement1 = " feszültség ";
        wrongElement2 = " ellenállás ";
    }
    if (+select === 6){
      wrongElement1 = " áram ";
      wrongElement2 = " feszültseg ";
    }
    if (+select === 7){
      wrongElement1 = " abszolút hiba ";
      wrongElement2 = " relatív hiba ";
    }
    if (+select === 8){
      wrongElement1 = " kapocsfeszültség  ";
      checkingUsrResult2 = true;
    }
    if (checkingUsrResult1 && checkingUsrResult2) {
      let linkOfFalstad = '<b><a href="' + circuitResults.link + '" target="_blank">Falstad</a></b>';
      $("#timeoutorsolve").html("<h3>Feladat megoldásának ellenőrzése a " + linkOfFalstad + " oldalán.</h3>");
      clearInterval(timer);
      timeout = true;
      $(".usrIN").hide();
      $(".resultOUT").show();
      $("#checkUsrResult").attr("disabled", "disabled");
      if (+select >0 && +select <=5 ){
        $("#out1").html("<b>" +Math.abs(setResultWithPrefix(circuitResults.thVolt,prefixes.thVoltPrefix))+"</b>");
        $("#out2").html("<b>" +Math.abs(setResultWithPrefix(circuitResults.thRes,prefixes.thResPrefix))+"</b>");
      }
      if (+select === 6){
          $("#out1").html("<b>" +Math.abs(setResultWithPrefix(circuitResults.resCurrent,prefixes.resCurrPrefix))+"</b>");
          $("#out2").html("<b>" +Math.abs(setResultWithPrefix(circuitResults.resVolt,prefixes.resVoltPrefix))+"</b>");
      }
      if (+select === 7){
          $("#out1").html("<b>" +Math.abs(setResultWithPrefix(circuitResults.absError,prefixes.absErrorPrefix))+"</b>");
          $("#out2").html("<b>" +circuitResults.relError+"</b>");
      }
      if (+select === 8){
          $("#out1").html("<b>" +Math.abs(setResultWithPrefix(circuitResults.terminalVolt,prefixes.terminalVoltPrefix))+"</b>");
          $("#out2").hide();
      }
      timeout = true;
      timeOutResult(removeTaskID,+select);
      alert('Helyes megoldás!');
    }
    if (!checkingUsrResult1 && checkingUsrResult2) {
      $("#value1").val("");
      alert("Rossz"+wrongElement1+"érték!");
    }
    if (checkingUsrResult1 && !checkingUsrResult2) {
      $("#value2").val("");
      alert("Rossz"+wrongElement2+"érték!");
    }
    if (!checkingUsrResult1 && !checkingUsrResult2) {
      $(".usrIN").val("");
      alert('Helytelen megoldás!');
    }
    e.preventDefault();
  });
  $("#clear").click(function (e) { 
    alert("canvas torles");
    clearCanvas();
    e.preventDefault();
    
  });
});