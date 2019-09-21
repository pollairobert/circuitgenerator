function startTimer(type, fslink, responsedata, prefixes) {
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
    $("#content").append("<h2>" + title + "</h2>");
    $("#content").append("<p>" + descript + "</p>");
    $("#result").append('<hr/>');
    $("#result").append("<h1>Ide jon majd a megjelenitese a halozatnak (CANVAS?)</h1>");
    $("#result").append('<hr/>');
    if (type === "6" || type === "7") {
        //console.log("KIBASZOTT 6 vagy 7");
        $("#userresult2").show();
        $("#resCurrent").show();
        $("#resVolt").show();
        $("#userresult").hide();
        $("#userresultVoltSource").hide();
        $("#check2").prop("disabled", false);
        $('#timecount2').text(countdownMin + ' m ' + countdownSec + " s ");
        $("#randomID2").val(responsedata.id);
        if (select === "7") {
            //console.log("KIBASZOTT 7");
            $("#resTaskCurrent").html("Abszolút hiba nagysága (<b style=\"color:red;\">" + prefixes[0] + "V</b>): ");
            $("#resTaskVolt").html("Relatív hiba nagysága (<b style=\"color:red;\">%</b>): ");
        }
        else {
            //console.log("KIBASZOTT 6");
            $("#resTaskCurrent").html("Ellenálláson folyó áram (<b style=\"color:red;\">" + prefixes[1] + "A</b>): ");
            $("#resTaskVolt").html("Ellenálláson eső feszültseg (<b style=\"color:red;\">" + prefixes[0] + "V</b>): ");
        }
    }
    else if (type === "8") {
        //console.log("KIBASZOTT 8");
        //$("#voltValue").show();
        $("#userresultVoltSource").show();
        $("#userresult2").hide();
        $("#userresult").hide();
        $("#check3").prop("disabled", false);
        $('#timecount3').text(countdownMin + ' m ' + countdownSec + " s ");
        $("#randomID3").val(responsedata.id);
        $("#voltSourceTask").html("Kapocsfeszültség (<b style=\"color:red;\">" + prefixes[0] + "V</b>): ");
    }
    else {
        //console.log("KIBASZOTT MINDEN MAS");
        //$("#thres").show();
        //$("#thvolt").show();
        $("#userresult").show();
        $("#userresult2").hide();
        $("#userresultVoltSource").hide();
        $("#check").prop("disabled", false);
        $('#timecount').text(countdownMin + ' m ' + countdownSec + " s ");
        $("#userresult").show();
        $("#randomID").val(responsedata.id);
        $("#thevTaskVolt").html("Thevenin feszültség (<b style=\"color:red;\">" + prefixes[0] + "V</b>): ");
        $("#thevTaskRes").html("Thevenin ellenállás (<b style=\"color:red;\">" + prefixes[2] + "Ω</b>): ");
    }
    //$("#check").prop("disabled", false);
    //$('#timecount').text(countdownMin+' m '+countdownSec+ " s ");
    clearInterval(timer);
    timer = setInterval(function () {
        countdownSec--;
        if (countdownSec === -1) {
            countdownMin--;
            countdownSec = 9;
        }
        if (countdownSec === 0 && countdownMin === 0) {
            clearInterval(timer);
            if (type === "6" || type === "7") {
                $("#check2").attr("disabled", "disabled");
                $("#resCurrent").hide();
                $("#resVolt").hide();
                //$("#resultAmp").text('eredmeny').show();
                //$("#resultVolt").text('eredmeny').show();
                timeOutResult($("#randomID2").val(), type);
            }
            else if (type === "8") {
                $("#check3").attr("disabled", "disabled");
                $('#voltValue').hide();
                timeOutResult($("#randomID3").val(), type);
            }
            else {
                $("#check").attr("disabled", "disabled");
                $("#thres").hide();
                $("#thvolt").hide();
                timeOutResult($("#randomID").val(), type);
                //$("#resultTHRes").text('eredmeny').show();
                //$("#resultTHVolt").text('eredmeny').show();
                //$("#resultTHRes").show();
                //$("#resultTHVolt").show();
            }
            $("#timeoutorsolve").append("<h3>Hálózat megtekintése a " + fslink + " oldalán.</h3>");
            timeout = true;
        }
        if (type === "6" || type === "7") {
            $('#timecount2').text(countdownMin + ' m ' + countdownSec + " s ");
        }
        if (type === "8") {
            $('#timecount3').text(countdownMin + ' m ' + countdownSec + " s ");
        }
        else {
            $('#timecount').text(countdownMin + ' m ' + countdownSec + " s ");
        }
    }, 1000);
}
function timeOutResult(id, type) {
    var reqURL = host + '/timeout?id=' + id + '&voltPrefix=' + prefixes[0] + '&currentPrefix=' + prefixes[1] + '&type=' + type + '&resPrefix=' + prefixes[2];
    var result = { id: id, voltPrefix: prefixes[0], currentPrefix: prefixes[1], type: type, resPrefix: prefixes[2] };
    $(".result").val("");
    //$("#resultVolt").html("");
    //console.log(reqURL);
    $.post(reqURL, result, function (data, status, err) {
        //let result = { id: id, voltPrefix: prefixes[0], currentPrefix: prefixes[1], type: type};
        //console.log(reqURL);
        var responsedata = JSON.parse(data);
        if (type === "6" || type === "7") {
            if (type === "7") {
                $("#resultAmp").html('<b>' + responsedata.resCur + '</b>').show();
                $("#resultVolt").html('<b>' + responsedata.resVolt + '</b>').show();
            }
            else {
                $("#resultAmp").html('<b>' + responsedata.resCur + '</b>').show();
                $("#resultVolt").html('<b>' + responsedata.resVolt + '</b>').show();
            }
        }
        else {
            $("#resultTHRes").html('<b>' + responsedata.circuitTHres + '</b>').show();
            $("#resultTHVolt").html('<b>' + responsedata.circuitTHvolt + '</b>').show();
        }
    });
}
