import { CircuitGenerator } from './circuitgenerator';
import { Circuit } from './circuit';
import { CircuitAnalyzer } from './circuitanalyzer';
import { Main } from './main';
import * as math from 'mathjs';

const path = require('path');
const express = require('express');
const app = express();
const bodyParser = require('body-parser')
//const generator: CircuitGenerator = new CircuitGenerator();
//const analyzer: CircuitAnalyzer = new CircuitAnalyzer();


//let circuitCoordinateArray: string[];
//let link: string;
let results;
//let type: number;
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
    //let generator: CircuitGenerator = new CircuitGenerator();
    //let analyzer = new CircuitAnalyzer();
    //let circuit: Circuit;
    let circuitCoordinateArray: string[];
    let link: string;
    let main = new Main();
    console.log(main);
    let type: number;
    type = req.query.type;
    console.log(type);
    main.start(+type);
    //circuit = generator.generateCircuit(+type);
    //circuitCoordinateArray = [];
    link = main.getFalstadLink();
    circuitCoordinateArray = main.getCircuitCoordinateArray();
    results = main.getResults();
    var response = {
        1: circuitCoordinateArray,
        2: link,
        3: Math.random()
    };
    //analyzer.analyzeCircuit(circuit);
    //let results = {
    //    thres: analyzer.getResultOfTheveninResistance(),
     //   thvolt: analyzer.getResultOfTheveninVoltage()
    //}
    //let response = coord;
    console.log(results);
    //console.log(response);
    //console.log(typeof(type));
    //main = undefined;
    console.log(main);
    res.send(JSON.stringify(response));
    
});

app.get('/result',function(req,res) {
    //let type: number = +req.query.type;
    //console.log(typeof(type));
    
    //let x = analyzer.analyzeCircuit(circuit);
    /*let thres = circuit.getThevRes();
    let thvolt = circuit.getThevVolt()
    let response = {
        1: thres,
        2: thvolt
    };
    console.log(response);
    //console.log(typeof(type));
    res.end(JSON.stringify(response));*/
});

app.post('/check', (req, res) => {
    
    var userThres: boolean = compareResults(+req.body.thres, +results.thres);
    var userThvolt: boolean = compareResults(+req.body.thvolt, +results.thvolt);;
    //console.log(posttest1+ ' '+posttest2);
    
    let response = {
        res: userThres,
        volt: userThvolt
    };
    console.log(response);
    res.send(JSON.stringify(response));
    //res.send(true);
    //circuit = undefined;
    //analyzer = undefined;
});

function compareResults(userCalc: number, circuitResult: number){
    let resultTolerance: number[] = [+circuitResult.toFixed(3) - 0.005,+circuitResult.toFixed(3) + 0.005];
    console.log(resultTolerance);
    //userCalc.toFixed(3);
    if (+userCalc.toFixed(3) >= resultTolerance[0] && +userCalc.toFixed(3) <= resultTolerance[1]){
        return true;
    } else {
        return false;
    }
}

var server=app.listen(3000,function() {
    console.log('Listening....')
});