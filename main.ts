import { CircuitElements } from "./interfaceCircElement";
import { Wire } from "./wire";
import { Resistance } from "./resistance";
import { CurrentSource } from "./currentsource";
import { VoltageSource } from "./voltagesource";
import { Branch, branchCounter } from "./branch";
import { Mesh, meshCounter } from "./mesh";
import { Circuit } from "./circuit";
import { CircuitGenerator } from './circuitgenerator'
import * as math from 'mathjs';


var c: CircuitGenerator = new CircuitGenerator();
c.setQuestionOrVoltmeterResistance(1000);
c.setConnectedVoltagesourceValue(12);
c.setConnectedVoltagesourceResistance(10);
let type = 2;
c.generateCircuit(type);
if (type === 10 || type === 2){

if (c.getCircuit().getNumberOfMesh() === 2){
    console.log('V01 = '+c.getCircuit().getMeshes()[0].getBranches()[0].getBranchElements()[0].getVoltage()+ ' V');
    console.log('R01 = '+c.getCircuit().getMeshes()[0].getBranches()[1].getBranchElements()[0].getResistance()+ ' Ohm');
    console.log('R02 = '+c.getCircuit().getMeshes()[0].getBranches()[2].getBranchElements()[0].getResistance()+ ' Ohm');
    console.log(' --------R01--------------------A');
    console.log(' |               |  ');
    if (c.getCircuit().getMeshes()[0].getBranches()[0].getBranchElements()[0].getDirection()){
        console.log(' -               |  ');
        console.log('V01             R02  ');
        console.log(' +               |  ');
    } else {
        console.log(' +               |  ');
        console.log('V01             R02  ');
        console.log(' -               |  ');
    }
    console.log(' |               |  ');
    console.log(' -------------------------------B');
}
if (c.getCircuit().getNumberOfMesh() === 3){
    var vscount: number = 0;
    for (var i = 0; i < 3; i++){
        for (var j =0; j < c.getCircuit().getMeshes()[i].getBranches().length; j++){
            for (var k =0; k < c.getCircuit().getMeshes()[i].getBranches()[j].getBranchElements().length; k++){
                if (c.getCircuit().getMeshes()[i].getBranches()[j].getBranchElements()[k].getId() === 'V'){
                    vscount++;
                }
            }
        }
    }
    if (vscount === 1){
        console.log('V01 = '+c.getCircuit().getMeshes()[0].getBranches()[0].getBranchElements()[0].getVoltage()+ ' V');
        console.log('R01 = '+c.getCircuit().getMeshes()[0].getBranches()[1].getBranchElements()[0].getResistance()+ ' Ohm');
        console.log('R02 = '+c.getCircuit().getMeshes()[0].getBranches()[2].getBranchElements()[0].getResistance()+ ' Ohm');
        console.log('R03 = '+c.getCircuit().getMeshes()[1].getBranches()[1].getBranchElements()[0].getResistance()+ ' Ohm');
        console.log('R04 = '+c.getCircuit().getMeshes()[1].getBranches()[2].getBranchElements()[0].getResistance()+ ' Ohm');
        console.log(' -------R01-------------R03--------------A');
        console.log(' |               |               |');
        if (c.getCircuit().getMeshes()[0].getBranches()[0].getBranchElements()[0].getDirection()){
            console.log(' -               |               |');
            console.log('V01             R02             R04');
            console.log(' +               |               |');
        } else {
            console.log(' +               |               |');
            console.log('V01             R02             R04');
            console.log(' -               |               |');
        }
        console.log(' |               |               |');
        console.log(' ----------------------------------------B');
    }
    if (vscount === 3){
        console.log('V01 = '+c.getCircuit().getMeshes()[0].getBranches()[0].getBranchElements()[0].getVoltage()+ ' V');
        console.log('V02 = '+c.getCircuit().getMeshes()[0].getBranches()[2].getBranchElements()[1].getVoltage()+ ' V');
        console.log('R01 = '+c.getCircuit().getMeshes()[0].getBranches()[1].getBranchElements()[0].getResistance()+ ' Ohm');
        console.log('R02 = '+c.getCircuit().getMeshes()[0].getBranches()[2].getBranchElements()[0].getResistance()+ ' Ohm');
        console.log('R03 = '+c.getCircuit().getMeshes()[1].getBranches()[1].getBranchElements()[0].getResistance()+ ' Ohm');
        console.log('R04 = '+c.getCircuit().getMeshes()[1].getBranches()[2].getBranchElements()[0].getResistance()+ ' Ohm');
        console.log(' -------R01-------------R03--------------A');
        console.log(' |               |               |');
        console.log(' |               |               |');
        console.log(' |              R02             R04');
        console.log(' |               |               |');
        if (c.getCircuit().getMeshes()[0].getBranches()[0].getBranchElements()[0].getDirection() && c.getCircuit().getMeshes()[1].getBranches()[0].getBranchElements()[1].getDirection()){
            console.log(' -               -               |');
            console.log('V01             V02              |');
            console.log(' +               +               |');
        } 
        if (!c.getCircuit().getMeshes()[0].getBranches()[0].getBranchElements()[0].getDirection() && c.getCircuit().getMeshes()[1].getBranches()[0].getBranchElements()[1].getDirection()){
            console.log(' +               -               |');
            console.log('V01             V02              |');
            console.log(' -               +               |');
        }
        if (c.getCircuit().getMeshes()[0].getBranches()[0].getBranchElements()[0].getDirection() && !c.getCircuit().getMeshes()[1].getBranches()[0].getBranchElements()[1].getDirection()){
            console.log(' -               +               |');
            console.log('V01             V02              |');
            console.log(' +               -               |');
        }
        if (!c.getCircuit().getMeshes()[0].getBranches()[0].getBranchElements()[0].getDirection() && !c.getCircuit().getMeshes()[1].getBranches()[0].getBranchElements()[1].getDirection()){
            console.log(' -               -               |');
            console.log('V01             V02              |');
            console.log(' +               +               |');
        }
        console.log(' |               |               |');
        console.log(' ----------------------------------------B');
    }
    if (vscount === 5){
        console.log('V01 = '+c.getCircuit().getMeshes()[0].getBranches()[0].getBranchElements()[0].getVoltage()+ ' V');
        console.log('V02 = '+c.getCircuit().getMeshes()[0].getBranches()[2].getBranchElements()[1].getVoltage()+ ' V');
        console.log('V03 = '+c.getCircuit().getMeshes()[2].getBranches()[0].getBranchElements()[1].getVoltage()+ ' V');
        console.log('R01 = '+c.getCircuit().getMeshes()[0].getBranches()[1].getBranchElements()[0].getResistance()+ ' Ohm');
        console.log('R02 = '+c.getCircuit().getMeshes()[0].getBranches()[2].getBranchElements()[0].getResistance()+ ' Ohm');
        console.log('R03 = '+c.getCircuit().getMeshes()[1].getBranches()[1].getBranchElements()[0].getResistance()+ ' Ohm');
        console.log('R04 = '+c.getCircuit().getMeshes()[1].getBranches()[2].getBranchElements()[0].getResistance()+ ' Ohm');
        console.log(' -------R01-------------R03--------------A');
        console.log(' |               |               |');
        console.log(' |               |               |');
        console.log(' |              R02             R04');
        console.log(' |               |               |');
        if (c.getCircuit().getMeshes()[0].getBranches()[0].getBranchElements()[0].getDirection() && c.getCircuit().getMeshes()[1].getBranches()[0].getBranchElements()[1].getDirection() && c.getCircuit().getMeshes()[2].getBranches()[0].getBranchElements()[1].getDirection()){
            console.log(' -               -               -');
            console.log('V01             V02             V03');
            console.log(' +               +               +');
        } 
        if (c.getCircuit().getMeshes()[0].getBranches()[0].getBranchElements()[0].getDirection() && c.getCircuit().getMeshes()[1].getBranches()[0].getBranchElements()[1].getDirection() && !c.getCircuit().getMeshes()[2].getBranches()[0].getBranchElements()[1].getDirection()){
            console.log(' -               -               +');
            console.log('V01             V02             V03');
            console.log(' +               +               -');
        }
        if (c.getCircuit().getMeshes()[0].getBranches()[0].getBranchElements()[0].getDirection() && !c.getCircuit().getMeshes()[1].getBranches()[0].getBranchElements()[1].getDirection() && c.getCircuit().getMeshes()[2].getBranches()[0].getBranchElements()[1].getDirection()){
            console.log(' -               +               -');
            console.log('V01             V02             V03');
            console.log(' +               -               +');
        }
        if (c.getCircuit().getMeshes()[0].getBranches()[0].getBranchElements()[0].getDirection() && !c.getCircuit().getMeshes()[1].getBranches()[0].getBranchElements()[1].getDirection() && !c.getCircuit().getMeshes()[2].getBranches()[0].getBranchElements()[1].getDirection()){
            console.log(' -               +               +');
            console.log('V01             V02             V03');
            console.log(' +               -               -');
        }
        if (!c.getCircuit().getMeshes()[0].getBranches()[0].getBranchElements()[0].getDirection() && c.getCircuit().getMeshes()[1].getBranches()[0].getBranchElements()[1].getDirection() && c.getCircuit().getMeshes()[2].getBranches()[0].getBranchElements()[1].getDirection()){
            console.log(' +               -               -');
            console.log('V01             V02             V03');
            console.log(' -               +               +');
        }
        if (!c.getCircuit().getMeshes()[0].getBranches()[0].getBranchElements()[0].getDirection() && c.getCircuit().getMeshes()[1].getBranches()[0].getBranchElements()[1].getDirection() && !c.getCircuit().getMeshes()[2].getBranches()[0].getBranchElements()[1].getDirection()){
            console.log(' +               -               +');
            console.log('V01             V02             V03');
            console.log(' -               +               -');
        }
        if (!c.getCircuit().getMeshes()[0].getBranches()[0].getBranchElements()[0].getDirection() && !c.getCircuit().getMeshes()[1].getBranches()[0].getBranchElements()[1].getDirection() && c.getCircuit().getMeshes()[2].getBranches()[0].getBranchElements()[1].getDirection()){
            console.log(' +               +               -');
            console.log('V01             V02             V03');
            console.log(' -               -               +');
        }
        if (!c.getCircuit().getMeshes()[0].getBranches()[0].getBranchElements()[0].getDirection() && !c.getCircuit().getMeshes()[1].getBranches()[0].getBranchElements()[1].getDirection() && !c.getCircuit().getMeshes()[2].getBranches()[0].getBranchElements()[1].getDirection()){
            console.log(' +               +               +');
            console.log('V01             V02             V03');
            console.log(' -               -               -');
        }
        console.log(' |               |               |');
        console.log(' ----------------------------------------B');
    }
}
}
let voltegeCount: number = 0;
let resistCount: number = 0;
for (let i = 0; i < c.getCircuit().getNumberOfMesh(); i++){
    for (let j = 0; j < c.getCircuit().getMeshes()[i].getBranches().length; j++){
        for (let k = 0; k < c.getCircuit().getMeshes()[i].getBranches()[j].getBranchElements().length; k++){
            if (c.getCircuit().getMeshes()[i].getBranches()[j].getBranchElements()[k].getId() === 'V'){
                voltegeCount++;
                console.log('V0'+voltegeCount+'= '+c.getCircuit().getMeshes()[i].getBranches()[j].getBranchElements()[k].getVoltage()+ ' V, irany: '+c.getCircuit().getMeshes()[i].getBranches()[j].getBranchElements()[k].getDirection());
            }
            if (c.getCircuit().getMeshes()[i].getBranches()[j].getBranchElements()[k].getId() === 'R'){
                resistCount++;
                console.log('R0'+resistCount+'= '+c.getCircuit().getMeshes()[i].getBranches()[j].getBranchElements()[k].getResistance()+ ' Ohm');
            }
        }
    }
}
console.log();
console.log('Az aramkor Thevenin ellenalasa: '+c.getCircuit().getThevRes().toFixed(4)+ ' Ohm');
console.log('Az aramkor Thevenin helyettesito feszultsege: '+c.getCircuit().getThevVolt().toFixed(4)+ ' V');
//console.log('A keresett ellenallas arama: '+c.getQuestionResCurrent().toFixed(4)+ ' A');
if (c.getQuestionRes() !== undefined){
    console.log('A mert feszultseg: '+c.getQuestionResVoltage().toFixed(4)+ ' V');
}
if (c.getOutputVoltageWithConnectedVoltageSource() !== undefined){
    console.log('A '+ c.getConnectedVoltagesourceValue()+ ' V-os es ' +c.getConnectedVoltagesourceResistance()+ ' Ohm belso ellenallasu feszgen csatlakoztatasa eseten:');
    console.log('A halozat kapocsfeszultseges a keresett pontok kozott: ' +c.getOutputVoltageWithConnectedVoltageSource());
}
//console.log(c.randomCurrentSourceValue());
//console.log(c.randomE6Resistance());
