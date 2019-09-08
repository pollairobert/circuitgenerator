import { CircuitGenerator } from './circuitgenerator';
import { Circuit } from './circuit';

var express=require('express');
var app=express();
app.get('/generate',function(req,res) {
    let type: number = +req.query.type;
    //console.log(typeof(type));

    //type = 2;
    let generator: CircuitGenerator = new CircuitGenerator();
    
    let response: Circuit = generator.generateCircuit(type);
    console.log(response);
    //console.log(typeof(type));
    res.end(JSON.stringify(response));
});
var server=app.listen(3000,function() {
    console.log('Listening....')
});