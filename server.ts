import { CircuitGenerator } from './circuitgenerator';
import { Circuit } from './circuit';

var express=require('express');
var app=express();
app.get('/generate',function(req,res) {
    let circuit = new CircuitGenerator();
    
    let response = circuit.generateCircuit(1);
    console.log(response);
    res.end(JSON.stringify(response));
});
var server=app.listen(3000,function() {
    console.log('Listening....')
});