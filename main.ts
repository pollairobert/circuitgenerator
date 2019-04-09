import { CircuitElements } from "./interfaceCircElement";
import { Wire } from "./wire";
import { Resistance } from "./resistance";
import { CurrentSource } from "./currentsource";
import { VoltageSource } from "./voltagesource";
import { Branch, branchCounter } from "./branch";
import { Mesh, meshCounter } from "./mesh";
import { Circuit } from "./circuit";
import { CircuitGenerator } from './circuitgenerator'

var c = new CircuitGenerator();
c.generateAndAnalyzeCircuit(3, 3, 0, 2, 0);
console.log(c.getCircuit());
console.log('Hurkok szama a halozatban: ' + c.getCircuit().getNumberOfMesh()/*c.getCircuit().getMeshNumb()*/);

for (var i = 0; i < c.getCircuit().getNumberOfMesh(); i++){
    console.log(c.getCircuit().getMeshes()[i].getMeshNumber());
}

/*for (var i = 0; i < c.getMaxMesh(); i++) {
    console.log('Hurok szama: ' + c.getCircuit().getMeshes()[i].getMeshNumber());
    console.log('Ag szam, orientacio, dir, common');
    for (var j = 0; j < c.getCircuit().getMeshes()[i].getBranches().length; j++) {
        console.log('-' + c.getCircuit().getMeshes()[i].getBranches()[j].getBranchNumber() +
            ', ' + c.getCircuit().getMeshes()[i].getBranches()[j].getOrientation() +
            ', ' + c.getCircuit().getMeshes()[i].getBranches()[j].getDirection() +
            ', ' + c.getCircuit().getMeshes()[i].getBranches()[j].getCommon());
        console.log('   Ag sorszama: '+ c.getCircuit().getMeshes()[i].getBranches()[j].getBranchNumber());
        console.log('   Elemek:');
        for (var k = 0; k < c.getCircuit().getMeshes()[i].getBranches()[j].getBranchElements().length; k++) {
            console.log('   -' + c.getCircuit().getMeshes()[i].getBranches()[j].getBranchElements()[k].getId()+
                          ', Feszultsege: ' + c.getCircuit().getMeshes()[i].getBranches()[j].getBranchElements()[k].getVoltage()+
                          ', Ellenallasa: ' + c.getCircuit().getMeshes()[i].getBranches()[j].getBranchElements()[k].getResistance());
        }
        console.log('   Ag ellenallasa:' + c.getCircuit().getMeshes()[i].getBranches()[j].getBranchResistance());
        console.log('   Ag feszultsege:' + c.getCircuit().getMeshes()[i].getBranches()[j].getBranchVoltage());
    }
    console.log('Hurok ellenallasa: ' + c.getCircuit().getMeshes()[i].getMeshResistance());
    console.log('Hurok feszultsege: ' + c.getCircuit().getMeshes()[i].getMeshVoltage());
    //console.log(i);
}*/


//c.getMeshes()[0].setBranches(c.getMeshes()[1].getBranches()[1]);
/*console.log('Hurkok szama a halozatban:'+ c.getMeshes()[0].getMaxMesh());
for (var i=0; i < c.getMeshes().length; i++){
    console.log('Hurok szama: '+c.getMeshes()[i].getMeshNumber());
    console.log('Ag szam, orientacio, dir, elem, common');
    for (var j=0; j<c.getMeshes()[i].getBranches().length; j++){
        console.log('-' + c.getMeshes()[i].getBranches()[j].getBranchNumber()+
                    ', '+ c.getMeshes()[i].getBranches()[j].getOrientation()+
                    ', '+ c.getMeshes()[i].getBranches()[j].getDirection()+
                    ', '+ c.getMeshes()[i].getBranches()[j].getBranchElements()[0].getId()+
                    ', '+ c.getMeshes()[i].getBranches()[j].getCommon());
    }

    //console.log(i);
}

//console.log(c.getMeshes().length);
//console.log(c.getMeshes()[3].getMeshNumber());
/*var w1: CircuitElements[] = [];
var x = new Wire();
var y = new Resistance(4);
var z = new VoltageSource(15, true);
var w = new CurrentSource(5,false);
//y.setCurrent(5);
y.setVoltage();
w1.push(w);
w1.push(z);
w1.push(x);
w1.push(y);*/
//var x: number[] = [5, 2, 8];
//var b = new Branch(true, true, 0);
/*b.setCurrent(x);
console.log(b.getCurrent());
console.log(b.getBranchElements()[0].getId());
b.setBranchElements(new Resistance(12));
b.setBranchElements(new Resistance(4));
console.log(b.getBranchResistance());
/*console.log('--R---A');
console.log('|   |  ');
console.log('+   |  ');
console.log('V   R  ');
console.log('-   |  ');
console.log('|   |  ');
console.log('------B');*/