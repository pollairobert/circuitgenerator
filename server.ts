import { CircuitGenerator } from './circuitgenerator';
import { Circuit } from './circuit';

var express=require('express');
var app=express();
app.get('/generate',function(req,res) {
    let type = +req.query.type;
    //console.log(typeof(type));

    //type = 2;
    let circuit = new CircuitGenerator();
    
    let response = circuit.generateCircuit(type);
    console.log(response);
    //console.log(typeof(type));
    res.end(JSON.stringify(response));
});
var server=app.listen(3000,function() {
    console.log('Listening....')
});