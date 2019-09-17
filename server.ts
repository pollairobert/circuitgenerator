import { CircuitGenerator } from './circuitgenerator';
import { Circuit } from './circuit';
import { CircuitAnalyzer } from './circuitanalyzer';
import { Main } from './main';
import * as math from 'mathjs';
import { finished } from 'stream';

const path = require('path');
const express = require('express');
const app = express();
const bodyParser = require('body-parser')

let fs = require('fs');
let chekTime = 5*60*1000;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));
app.use(express.static('scripts'));
app.get('/', (req,res)=> {
    res.sendFile(path.join(__dirname + '/index.html'));
});
app.get('/scripts/circuitjQuery.js', (req,res)=> {
    res.sendFile(path.join(__dirname + '/scripts/circuitjQuery.js'));
});
app.get('/generate', function (req, res) {
    let circuitCoordinateArray: string[];
    let link: string;
    let main = new Main();
    console.log('req.query.id: '+req.query.id);
    let type: number;
    let checkID: number;
    type = req.query.type;
    //checkID = req.query.id;
    
    if (req.query.id === undefined){
        console.log(req.query.id);
        //deleteData(req.query.id);
        main.start(+type);
        link = main.getFalstadLink();
        circuitCoordinateArray = main.getCircuitCoordinateArray();
        //let id = Math.random();
        let id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        let response = {
            array: circuitCoordinateArray,
            link: link,
            id: id
        };
        addDatatoJSONfile(main.getResults(),id);
        res.send(JSON.stringify(response));
    } else {
        deleteDatatoJSONfile(req.query.id);
        console.log(req.query.id);
        main.start(+type);
        link = main.getFalstadLink();
        circuitCoordinateArray = main.getCircuitCoordinateArray();
        //let id = Math.random();
        let id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        let response = {
            array: circuitCoordinateArray,
            link: link,
            id: id
        };
        
        addDatatoJSONfile(main.getResults(),id);
        res.send(JSON.stringify(response));
        console.log('nem megoldott feladat, ujrageneralas tortent');
    }
    //console.log(type);
    /*main.start(+type);
    link = main.getFalstadLink();
    circuitCoordinateArray = main.getCircuitCoordinateArray();
    //let id = Math.random();
    let id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    let response = {
        array: circuitCoordinateArray,
        link: link,
        id: id
    };
    addDatatoJSONfile(main.getResults(),id);
    res.send(JSON.stringify(response));*/
    
    
});

app.post('/check', (req, res) => {
    let id = req.body.id;
    console.log(id);
    let response = searchResults(+req.body.thres,+req.body.thvolt,id);
    if (response.res && response.volt){
        deleteDatatoJSONfile(id);
        console.log('data removed');
    }
    //console.log(response);
    //checkSolving();
    res.send(JSON.stringify(response));
});

function compareResults(userCalc: number, circuitResult: number){
    let resultTolerance: number[] = [+circuitResult.toFixed(3) - 0.005,+circuitResult.toFixed(3) + 0.005];
    console.log(resultTolerance);
    if (+userCalc.toFixed(3) >= resultTolerance[0] && +userCalc.toFixed(3) <= resultTolerance[1]){
        return true;
    } else {
        return false;
    }
}
function addDatatoJSONfile(pushData,id){
    console.log()
    if (!fs.existsSync('generateLOG.json')){
        fs.writeFileSync('generateLOG.json','{}', (err) => {
            if (err) {
                return console.error(err);
            }
        });
    }
    let generateLOG = fs.readFileSync('generateLOG.json');
    if (generateLOG[0] === undefined){
        console.log('Ures file volt');
        generateLOG = '{}';
    }
    let resultLOG = JSON.parse(generateLOG);
    resultLOG[id] = pushData;
    let pushlogData = JSON.stringify(resultLOG, null, 2);
    

    fs.writeFileSync('generateLOG.json',pushlogData, (err) => {
        if (err) {
            return console.error(err);
        }
    });
    
}
function deleteDatatoJSONfile(id: string){
    let generateLOG = fs.readFileSync('generateLOG.json');
    let resultLOG = JSON.parse(generateLOG);
    delete resultLOG[id];
    let refreshlogData = JSON.stringify(resultLOG, null, 2);
    fs.writeFileSync('generateLOG.json',refreshlogData, (err) => {
        if (err) {
            return console.error(err);
        }
    });
    
}
function deleteData(id: string){
    let generateLOG = fs.readFileSync('generateLOG.json');
    if (generateLOG[0] === undefined){
        console.log('Ures file volt');
        generateLOG = '{}';
    }
    let resultLOG = JSON.parse(generateLOG);
    delete resultLOG[id];
    let refreshlogData = JSON.stringify(resultLOG, null, 2);
    fs.writeFileSync('generateLOG.json',refreshlogData, (err) => {
        if (err) {
            return console.error(err);
        }
    });
    
}
function searchResults(usrThres, usrThvolt,id){
    let generateLOG = fs.readFileSync('generateLOG.json');
    let resultLOG = JSON.parse(generateLOG);
    //console.log(resultLOG[id]);
    let userThres: boolean = compareResults(usrThres, +resultLOG[id].thres);
    let userThvolt: boolean = compareResults(usrThvolt, +resultLOG[id].thvolt);
    return {
        res: userThres,
        volt: userThvolt
    };
}
function checkSolving(){
    let generateLOG = fs.readFileSync('generateLOG.json');
    let resultLOG = JSON.parse(generateLOG);
    let difference; 
    console.log('resultLOG elotte: ');
    console.log(resultLOG);
    for (let key in resultLOG) {
        if (resultLOG.hasOwnProperty(key)) {
            //timeDifference(new Date(),resultLOG[key].timestamp)
            difference = timeDifference(new Date(),new Date(resultLOG[key].timestamp));
            console.log(key+': '+difference[0]+ ' day '+difference[1]+ ' hour '+difference[2]+ ' minute '+difference[3]+ ' sec.');
            console.log(typeof(key))
            if (difference[0] > 0 || difference[1] > 0 || difference[2] > 10){
                console.log('van torolni vali');
                deleteDatatoJSONfile(key);
                
            }
            //console.log(key+': '+timeDifference(new Date(),new Date(resultLOG[key].timestamp)));

        }
    }
    console.log('resultLOG utana: ');
    console.log(resultLOG);
    setTimeout(() =>{
        let refreshlogData = JSON.stringify(resultLOG, null, 2);
        fs.writeFileSync('generateLOG.json',refreshlogData, (err) => {
            if (err) {
                return console.error(err);
            }
        });
    },100);
    console.log('Idokorlaton tuli feladatok torolve!')
}
function timeDifference(date1,date2) {
    let difference = date1 - date2;
    let daysDifference = Math.floor(difference/1000/60/60/24);
    difference -= daysDifference*1000*60*60*24

    let hoursDifference = Math.floor(difference/1000/60/60);
    difference -= hoursDifference*1000*60*60

    let minutesDifference = Math.floor(difference/1000/60);
    difference -= minutesDifference*1000*60

    let secondsDifference = Math.floor(difference/1000);

    //return daysDifference+ ' day '+hoursDifference+ ' hour '+minutesDifference+ ' minute '+secondsDifference+ ' sec.';
    return [daysDifference, hoursDifference, minutesDifference, secondsDifference];
}
setInterval(checkSolving, chekTime);
let port = process.env.PORT || 3000;
let server=app.listen(port,function() {
    console.log('Listening to '+port+' port');
});