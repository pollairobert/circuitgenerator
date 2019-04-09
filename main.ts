import {CircuitElements} from "./interfaceCircElement";
import {Wire} from "./wire";
import {Resistance} from "./resistance";
import {CurrentSource} from "./currentsource";
import {VoltageSource} from "./voltagesource";
import {Branch, branchCounter} from "./branch";
import {Mesh, meshCounter} from "./mesh";
import { Circuit } from "./circuit";
import {CircuitGenerator} from './circuitgenerator'

var c = new CircuitGenerator();
c.generateCircuit(2,2,0,1,1);
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