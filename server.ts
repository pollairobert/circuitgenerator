import { CircuitGenerator } from './circuitgenerator';
import { Circuit } from './circuit';
import { CircuitAnalyzer } from './circuitanalyzer';

const path = require('path');
const express = require('express');
const app = express();
const bodyParser = require('body-parser')
const generator: CircuitGenerator = new CircuitGenerator();
//const analyzer: CircuitAnalyzer = new CircuitAnalyzer();


let circuitCoordinateArray: string[];
let link: string;
let results = {};
let type: number;
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
    let analyzer = new CircuitAnalyzer();
    let circuit: Circuit;
    type = req.query.type;
    console.log(type);
    circuit = generator.generateCircuit(+type);
    circuitCoordinateArray = [];
    link = generator.generateFalstadLink(circuit);
    circuitCoordinateArray = generator.getCircuitCoordinatesToFalstad();
    var response = {
        1: circuitCoordinateArray,
        2: link,
        3: Math.random()
    };
    analyzer.analyzeCircuit(circuit);
    
    //let response = coord;
    console.log(response);
    //console.log(typeof(type));
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

app.post('/test', (req, res) => {
    let analyzer = new CircuitAnalyzer();
    //analyzer.analyzeCircuit(circuit);
    let results = {
        thres: analyzer.getResultOfTheveninResistance(),
        thvolt: analyzer.getResultOfTheveninVoltage()
    }
    var posttest1 = req.body.thres;
    var posttest2 = req.body.thvolt;

    console.log(posttest1+ ' '+posttest2);
    console.log(results);
    let response = results;
    res.end(JSON.stringify(response));
    //circuit = undefined;
    analyzer = undefined;
});

var server=app.listen(3000,function() {
    console.log('Listening....')
});