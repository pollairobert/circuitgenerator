import { CircuitGenerator } from './circuitgenerator';
import { Circuit } from './circuit';
import { CircuitAnalyzer } from './circuitanalyzer';

const express=require('express');
const app=express();
const generator: CircuitGenerator = new CircuitGenerator();
const analyzer: CircuitAnalyzer = new CircuitAnalyzer();
let type: number = 2;
let circuit: Circuit;
let circuitCoordinateArray: string[];
let link: string;

app.use(express.static('index.html'));
app.get('/generate',function(req,res) {
    //let type: number = +req.query.type;
    //console.log(typeof(type));

    //type = 2;
    circuit = generator.generateCircuit(type);
    circuitCoordinateArray = [];
    link = generator.generateFalstadLink(circuit);
    circuitCoordinateArray = generator.getCircuitCoordinatesToFalstad();
    let response = {
        1: circuitCoordinateArray,
        2: link
    };
    //let response = coord;
    console.log(response);
    //console.log(typeof(type));
    res.end(JSON.stringify(response));
});
app.get('/result',function(req,res) {
    //let type: number = +req.query.type;
    //console.log(typeof(type));
    analyzer.analyzeCircuit(circuit);
    let thres = circuit.getThevRes();
    let thvolt = circuit.getThevVolt()
    let response = {
        1: thres,
        2: thvolt
    };
    console.log(response);
    //console.log(typeof(type));
    res.end(JSON.stringify(response));
});
var server=app.listen(3000,function() {
    console.log('Listening....')
});