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
c.setQuestionOrVoltmeterResistance(1000000);
c.setConnectedVoltagesourceValue(12);
c.setConnectedVoltagesourceResistance(10);
let type = 1;
///let x: number[];
//console.log(x.length);
//let x = [2,3,4,5,6];
//let x = ['macska','gyoker'];
/*let y = c.randomChoiseInAnyArray(x);
console.log(y);
console.log(c.removeElementInAnyArray(y,x));*/


c.generateCircuit(type);
//c.generateCircuit2(type);
console.log();
c.exportCircuitToText();
console.log(72%16);
for (let i = 0; i < c.getCircuit().getMeshes().length; i++){
    console.log('A(z) '+c.getCircuit().getMeshes()[i].getMeshNumber()+ '. HUROK ADATAI:');
    console.log('   Mesh ellenallasa (matrixhoz, a benne levo ellenallasok osszege): '+c.getCircuit().getMeshes()[i].getMeshResistance());
    console.log('   Mesh feszultsege (vektorhoz, generator ertekek elojelhelyes osszege): '+c.getCircuit().getMeshes()[i].getMeshVoltage());
    console.log('   Mesh-ben levo Branch-ek: ');
    console.log();

    for (let j = 0; j < c.getCircuit().getMeshes()[i].getBranches().length; j++){
        let type;
        switch (c.getCircuit().getMeshes()[i].getBranches()[j].getType()){
            case 0:{
                type='↑';
                break;
            }
            case 1:{
                type='→';
                break;
            }
            case 2:{
                type='↓';
                break;
            }
            case 3:{
                type='←';
                break;
            }
        }
        console.log('       '+j+'.(branches tomb indexe) Branch iranya (ez a felvett hurokarammal egyezik): '+type);
        if (c.getCircuit().getMeshes()[i].getBranches()[j].getTh2Pole()){
            console.log('           *****************************************');
            console.log('           *ENNEK A BRANCH-NEK A KET VEGE A 2 POLUS*');
            console.log('           *****************************************');
        }
        console.log('           Arama: '+c.getCircuit().getMeshes()[i].getBranches()[j].getCurrent());
        console.log('           Common (kozossegi) erteke: '+c.getCircuit().getMeshes()[i].getBranches()[j].getCommon());
        if (c.getCircuit().getMeshes()[i].getBranches()[j].getCommon() > c.getCircuit().getMeshes()[i].getMeshNumber()){
            let commMesh = c.getCircuit().getMeshes()[i].getBranches()[j].getCommon()-c.getCircuit().getMeshes()[i].getMeshNumber();
            console.log('           A(z) '+commMesh+ '. hurokkal kozos Branch.');
        }
        if (c.getCircuit().getMeshes()[i].getBranches()[j].getBranchElements()[0] !== undefined){
            console.log('           Szama: '+c.getCircuit().getMeshes()[i].getBranches()[j].getBranchNumber());
            console.log('           Ellenallasa (benne levo ellenallasok osszege): '+c.getCircuit().getMeshes()[i].getBranches()[j].getBranchResistance());
            console.log('           Feszultsege (generator ertekek elojelhelyes osszege): '+c.getCircuit().getMeshes()[i].getBranches()[j].getBranchVoltage());
            console.log('           Aramkori elemei: ');
            console.log();
            for (let k = 0; k < c.getCircuit().getMeshes()[i].getBranches()[j].getBranchElements().length; k++){
                if (c.getCircuit().getMeshes()[i].getBranches()[j].getBranchElements()[k].getId() === 'R'){
                    console.log('               Ellenallas: '+c.getCircuit().getMeshes()[i].getBranches()[j].getBranchElements()[k].getResistance()+ ' Ohm');
                    console.log('                   Arama: '+c.getCircuit().getMeshes()[i].getBranches()[j].getBranchElements()[k].getCurrent());
                    console.log('                   Feszultesege: '+c.getCircuit().getMeshes()[i].getBranches()[j].getBranchElements()[k].getVoltage());
                }
                if (c.getCircuit().getMeshes()[i].getBranches()[j].getBranchElements()[k].getId() === 'V'){
                    let direction;
                    if (c.getCircuit().getMeshes()[i].getBranches()[j].getBranchElements()[k].getDirection()){
                        switch (c.getCircuit().getMeshes()[i].getBranches()[j].getType()){
                            case 0:{
                                direction='↑';
                                break;
                            }
                            case 1:{
                                direction='→';
                                break;
                            }
                            case 2:{
                                direction='↓';
                                break;
                            }
                            case 3:{
                                direction='←';
                                break;
                            }
                        }
                    } else {
                        switch (c.getCircuit().getMeshes()[i].getBranches()[j].getType()){
                            case 0:{
                                direction = '↓';
                                break;
                            }
                            case 1:{
                                direction='←';
                                break;
                            }
                            case 2:{
                                direction='↑';
                                break;
                            }
                            case 3:{
                                direction='→';
                                break;
                            }
                        }
                    }

                    console.log('               Feszultseggenerator: '+math.abs(c.getCircuit().getMeshes()[i].getBranches()[j].getBranchElements()[k].getVoltage())+ ' V, '+direction);
                    console.log('                   Arama: '+c.getCircuit().getMeshes()[i].getBranches()[j].getBranchElements()[k].getCurrent());
                }
                if (c.getCircuit().getMeshes()[i].getBranches()[j].getBranchElements()[k].getId() === 'C'){
                    
                }
                
            }
        }
        
        
        
        console.log();
    }
    console.log();
}



console.log();
console.log('Az aramkor Thevenin ellenalasa: '+c.getCircuit().getThevRes().toFixed(6)+ ' Ohm');
console.log('Az aramkor Thevenin helyettesito feszultsege: '+c.getCircuit().getThevVolt().toFixed(6)+ ' V');
//console.log('A keresett ellenallas arama: '+c.getQuestionResCurrent().toFixed(4)+ ' A');
if (c.getQuestionRes() !== undefined){
    console.log('A mert feszultseg: '+c.getQuestionResVoltage().toFixed(6)+ ' V');
}
if (c.getOutputVoltageWithConnectedVoltageSource() !== undefined){
    console.log('A '+ c.getConnectedVoltagesourceValue()+ ' V-os es ' +c.getConnectedVoltagesourceResistance()+ ' Ohm belso ellenallasu feszgen csatlakoztatasa eseten:');
    console.log('A halozat kapocsfeszultseges a keresett pontok kozott: ' +c.getOutputVoltageWithConnectedVoltageSource());
}
/*console.log(c.getCircuit().getNumberOfMesh());
console.log(c.getCircuit().getNumbOfRes());
console.log(c.getCircuit().getNumbOfCurrSource());
console.log(c.getCircuit().getNumbOfVoltSource());
console.log(c.getCircuit().getNumbOfCommonBranc());*/
console.log(c.getCircuit().getParameters());
/*for (let i = 0; i < randomFor; i++){
    randomFor = c.randomIntNumber(10,i);
    console.log(i);
}*/

//console.log(c.randomCurrentSourceValue());
//console.log(c.randomE6Resistance());
