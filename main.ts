import { CircuitElements } from "./interfaceCircElement";
import { Wire } from "./wire";
import { Resistance } from "./resistance";
import { CurrentSource } from "./currentsource";
import { VoltageSource } from "./voltagesource";
import { Branch, branchCounter } from "./branch";
import { Mesh, meshCounter } from "./mesh";
import { Circuit } from "./circuit";
import { CircuitGenerator } from './circuitgenerator';
import { CircuitAnalyzer } from './circuitanalyzer';
import * as math from 'mathjs';

let c: CircuitGenerator = new CircuitGenerator();
let can: CircuitAnalyzer = new CircuitAnalyzer();

can.setQuestionOrVoltmeterResistance(10000000);
can.setConnectedVoltagesourceValue(12);
can.setConnectedVoltagesourceResistance(10);

let type = 4;

let circ: Circuit = c.generateCircuit(type);

/*for(let i = 0; i < circ.getMeshes().length; i++ ){
    console.log();
    console.log((i+1)+'. HUROK');
    for (let j = 0; j < circ.getMeshes()[i].getBranches().length; j++){
        console.log();
        console.log('BranchType: '+circ.getMeshes()[i].getBranches()[j].getType());
        for (let k = 0; k < circ.getMeshes()[i].getBranches()[j].getBranchElements().length; k++){
            console.log();
            console.log('ELEMENT: ');
            console.log(circ.getMeshes()[i].getBranches()[j].getBranchElements()[k]);
        }
    }
}*/
c.setCircuitElementCoordinatesArrayToFalstadExport(circ);
//c.exportToFalstadTxt(c.getCircuitCoordinatesToFalstad())

if (type <=6){
    can.analyzeCircuit(circ);

    for (let i = 0; i < circ.getMeshes().length; i++){
        console.log('A(z) '+circ.getMeshes()[i].getMeshNumber()+ '. HUROK ADATAI:');
        console.log('   Mesh ellenallasa (matrixhoz, a benne levo ellenallasok osszege): '+circ.getMeshes()[i].getMeshResistance());
        console.log('   Mesh feszultsege (vektorhoz, generator ertekek elojelhelyes osszege): '+circ.getMeshes()[i].getMeshVoltage());
        console.log('   Mesh-ben levo Branch-ek: ');
        console.log();

        for (let j = 0; j < circ.getMeshes()[i].getBranches().length; j++){
            let type;
            switch (circ.getMeshes()[i].getBranches()[j].getType()){
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
            if (circ.getMeshes()[i].getBranches()[j].getTh2Pole()){
                console.log('           *****************************************');
                console.log('           *ENNEK A BRANCH-NEK A KET VEGE A 2 POLUS*');
                console.log('           *****************************************');
            }
            console.log('           Arama: '+circ.getMeshes()[i].getBranches()[j].getCurrent());
            console.log('           Common (kozossegi) erteke: '+circ.getMeshes()[i].getBranches()[j].getCommon());
            if (circ.getMeshes()[i].getBranches()[j].getCommon() > circ.getMeshes()[i].getMeshNumber()){
                let commMesh = circ.getMeshes()[i].getBranches()[j].getCommon()-circ.getMeshes()[i].getMeshNumber();
                console.log('           A(z) '+commMesh+ '. hurokkal kozos Branch.');
            }
            if (circ.getMeshes()[i].getBranches()[j].getBranchElements()[0] !== undefined){
                console.log('           Szama: '+circ.getMeshes()[i].getBranches()[j].getBranchNumber());
                console.log('           Ellenallasa (benne levo ellenallasok osszege): '+circ.getMeshes()[i].getBranches()[j].getBranchResistance());
                console.log('           Feszultsege (generator ertekek elojelhelyes osszege): '+circ.getMeshes()[i].getBranches()[j].getBranchVoltage());
                console.log('           Aramkori elemei: ');
                console.log();
                for (let k = 0; k < circ.getMeshes()[i].getBranches()[j].getBranchElements().length; k++){
                    if (circ.getMeshes()[i].getBranches()[j].getBranchElements()[k].getId() === 'R'){
                        console.log('               Ellenallas: '+circ.getMeshes()[i].getBranches()[j].getBranchElements()[k].getResistance()+ ' Ohm');
                        console.log('                   Arama: '+circ.getMeshes()[i].getBranches()[j].getBranchElements()[k].getCurrent());
                        console.log('                   Feszultesege: '+circ.getMeshes()[i].getBranches()[j].getBranchElements()[k].getVoltage());
                    }
                    if (circ.getMeshes()[i].getBranches()[j].getBranchElements()[k].getId() === 'V'){
                        let direction;
                        if (circ.getMeshes()[i].getBranches()[j].getBranchElements()[k].getDirection()){
                            switch (circ.getMeshes()[i].getBranches()[j].getType()){
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
                            switch (circ.getMeshes()[i].getBranches()[j].getType()){
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

                        console.log('               Feszultseggenerator: '+math.abs(circ.getMeshes()[i].getBranches()[j].getBranchElements()[k].getVoltage())+ ' V, '+direction);
                        console.log('                   Arama: '+circ.getMeshes()[i].getBranches()[j].getBranchElements()[k].getCurrent());
                    }
                    if (circ.getMeshes()[i].getBranches()[j].getBranchElements()[k].getId() === 'C'){
                        
                    }
                    
                }
            }
            
            
            
            console.log();
        }
        console.log();
    }



    console.log();
    console.log('Az aramkor Thevenin ellenalasa: '+circ.getThevRes().toFixed(6)+ ' Ohm');
    console.log('Az aramkor Thevenin helyettesito feszultsege: '+circ.getThevVolt().toFixed(6)+ ' V');

    //console.log('A keresett ellenallas arama: '+c.getQuestionResCurrent().toFixed(4)+ ' A');
    if (can.getQuestionRes() !== undefined){
        console.log('A mert feszultseg: '+can.getQuestionResVoltage().toFixed(6)+ ' V');
    }
    if (can.getOutputVoltageWithConnectedVoltageSource() !== undefined){
        console.log('A '+ can.getConnectedVoltagesourceValue()+ ' V-os es ' +can.getConnectedVoltagesourceResistance()+ ' Ohm belso ellenallasu feszgen csatlakoztatasa eseten:');
        console.log('   A halozat kapocsfeszultseges a keresett pontok kozott: ' +can.getOutputVoltageWithConnectedVoltageSource());
    }

}
console.log(circ.getParameters());
c.generateFalstadLink(circ);
console.log(c.percentRandom(10));
