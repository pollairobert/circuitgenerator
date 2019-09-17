import { CircuitElements } from "./interfaceCircElement";
import { Wire } from "./wire";
import { Resistance } from "./resistance";
import { CurrentSource } from "./currentsource";
import { VoltageSource } from "./voltagesource";
import { Branch, branchCounter } from "./branch";
import { meshCounter, resetMeshCounter } from "./mesh";
import { Circuit } from "./circuit";
import { CircuitGenerator } from './circuitgenerator';
import { CircuitAnalyzer } from './circuitanalyzer';
import * as math from 'mathjs';

export class Main {
    private results: any;
    private circuitCoordinateArray: string[];
    private falstadLink: string;
    public start(type: number){
        let cg: CircuitGenerator = new CircuitGenerator();
        let can: CircuitAnalyzer = new CircuitAnalyzer();

        //can.setQuestionOrVoltmeterResistance(1500);
        //can.setConnectedVoltagesourceValue(12);
        //can.setConnectedVoltagesourceResistance(10);

        //let type = 5;
        let temptype = type;
        if (type === 2){
            temptype = cg.randomChoiseTwoNumber(2,2.1);
            //type = cg.randomChoiseTwoNumber(temp,3);
        }
        if (type === 6){
            temptype = cg.randomChoiseTwoNumber(4,5);
            can.setQuestionOrVoltmeterResistance(1500);
        }
        let circuit: Circuit = cg.generateCircuit(temptype);

        /*for(let i = 0; i < circuit.getMeshes().length; i++ ){
            console.log();
            console.log((i+1)+'. HUROK');
            for (let j = 0; j < circuit.getMeshes()[i].getBranches().length; j++){
                console.log();
                console.log('BranchType: '+circuit.getMeshes()[i].getBranches()[j].getType());
                for (let k = 0; k < circuit.getMeshes()[i].getBranches()[j].getBranchElements().length; k++){
                    console.log();
                    console.log('ELEMENT: ');
                    console.log(circuit.getMeshes()[i].getBranches()[j].getBranchElements()[k]);
                }
            }
        }*/
        
        cg.setCircuitElementCoordinatesArrayToFalstadExport(circuit);
        //cg.exportToFalstadTxt(cg.getCircuitCoordinatesToFalstad())
        this.circuitCoordinateArray = cg.getCircuitCoordinatesToFalstad();
        this.falstadLink = cg.generateFalstadLink(circuit);
        can.analyzeCircuit(circuit);
        if (type < 6){
            this.results = {
                "thres": Number(can.getResultOfTheveninResistance()),
                "thvolt": Number(can.getResultOfTheveninVoltage()),
                "timestamp": new Date()
            }
        } else {

            this.results = {
                "resCurrent": Number(can.getQuestionResCurrent()),
                "resVolt": Number(can.getQuestionResVoltage()),
                "timestamp": new Date()
            }
        }
        if (can.getQuestionRes() !== undefined){
            console.log('A keresett ellenallas feszultsege: '+can.getQuestionResVoltage()+ ' V');
            console.log('A keresett ellenallason folyo aram: '+can.getQuestionResCurrent()+ ' A');
        }
        console.log(this.falstadLink);
        console.log(this.results);
        if (type <=0){
            

            for (let i = 0; i < circuit.getMeshes().length; i++){
                console.log('A(z) '+circuit.getMeshes()[i].getMeshNumber()+ '. HUROK ADATAI:');
                console.log('   Mesh ellenallasa (matrixhoz, a benne levo ellenallasok osszege): '+circuit.getMeshes()[i].getMeshResistance());
                console.log('   Mesh feszultsege (vektorhoz, generator ertekek elojelhelyes osszege): '+circuit.getMeshes()[i].getMeshVoltage());
                console.log('   Mesh-ben levo Branch-ek: ');
                console.log();

                for (let j = 0; j < circuit.getMeshes()[i].getBranches().length; j++){
                    let type;
                    switch (circuit.getMeshes()[i].getBranches()[j].getType()){
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
                    if (circuit.getMeshes()[i].getBranches()[j].getTh2Pole()){
                        console.log('           *****************************************');
                        console.log('           *ENNEK A BRANCH-NEK A KET VEGE A 2 POLUS*');
                        console.log('           *****************************************');
                    }
                    console.log('           Arama: '+circuit.getMeshes()[i].getBranches()[j].getCurrent());
                    console.log('           Common (kozossegi) erteke: '+circuit.getMeshes()[i].getBranches()[j].getCommon());
                    if (circuit.getMeshes()[i].getBranches()[j].getCommon() > circuit.getMeshes()[i].getMeshNumber()){
                        let commMesh = circuit.getMeshes()[i].getBranches()[j].getCommon()-circuit.getMeshes()[i].getMeshNumber();
                        console.log('           A(z) '+commMesh+ '. hurokkal kozos Branch.');
                    }
                    if (circuit.getMeshes()[i].getBranches()[j].getBranchElements()[0] !== undefined){
                        console.log('           Szama: '+circuit.getMeshes()[i].getBranches()[j].getBranchNumber());
                        console.log('           Ellenallasa (benne levo ellenallasok osszege): '+circuit.getMeshes()[i].getBranches()[j].getBranchResistance());
                        console.log('           Feszultsege (generator ertekek elojelhelyes osszege): '+circuit.getMeshes()[i].getBranches()[j].getBranchVoltage());
                        console.log('           Aramkori elemei: ');
                        console.log();
                        for (let k = 0; k < circuit.getMeshes()[i].getBranches()[j].getBranchElements().length; k++){
                            if (circuit.getMeshes()[i].getBranches()[j].getBranchElements()[k].getId() === 'R'){
                                console.log('               Ellenallas: '+circuit.getMeshes()[i].getBranches()[j].getBranchElements()[k].getResistance()+ ' Ohm');
                                console.log('                   Arama: '+circuit.getMeshes()[i].getBranches()[j].getBranchElements()[k].getCurrent());
                                console.log('                   Feszultesege: '+circuit.getMeshes()[i].getBranches()[j].getBranchElements()[k].getVoltage());
                            }
                            if (circuit.getMeshes()[i].getBranches()[j].getBranchElements()[k].getId() === 'V'){
                                let direction;
                                if (circuit.getMeshes()[i].getBranches()[j].getBranchElements()[k].getDirection()){
                                    switch (circuit.getMeshes()[i].getBranches()[j].getType()){
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
                                    switch (circuit.getMeshes()[i].getBranches()[j].getType()){
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

                                console.log('               Feszultseggenerator: '+math.abs(circuit.getMeshes()[i].getBranches()[j].getBranchElements()[k].getVoltage())+ ' V, '+direction);
                                console.log('                   Arama: '+circuit.getMeshes()[i].getBranches()[j].getBranchElements()[k].getCurrent());
                            }
                            if (circuit.getMeshes()[i].getBranches()[j].getBranchElements()[k].getId() === 'C'){
                                
                            }
                            
                        }
                    }
                    
                    
                    
                    console.log();
                }
                console.log();
            }



            console.log();
            //console.log('Az aramkor Thevenin ellenalasa: '+circuit.getThevRes().toFixed(6)+ ' Ohm');
            console.log('Az aramkor Thevenin ellenalasa: '+can.getResultOfTheveninResistance().toFixed(6)+ ' Ohm');
            //console.log('Az aramkor Thevenin helyettesito feszultsege: '+circuit.getThevVolt().toFixed(6)+ ' V');
            console.log('Az aramkor Thevenin helyettesito feszultsege: '+can.getResultOfTheveninVoltage().toFixed(6)+ ' V');

            //console.log('A keresett ellenallas arama: '+c.getQuestionResCurrent().toFixed(4)+ ' A');
            if (can.getQuestionRes() !== undefined){
                console.log('A mert feszultseg, vagy a keresett ellenallas feszultsege: '+can.getQuestionResVoltage().toFixed(6)+ ' V');
                console.log('A keresett ellenallason folyo aram: '+can.getQuestionResCurrent().toFixed(8)+ ' A');
            }
            if (can.getOutputVoltageWithConnectedVoltageSource() !== undefined){
                console.log('A '+ can.getConnectedVoltagesourceValue()+ ' V-os es ' +can.getConnectedVoltagesourceResistance()+ ' Ohm belso ellenallasu feszgen csatlakoztatasa eseten:');
                console.log('   A halozat kapocsfeszultseges a keresett pontok kozott: ' +can.getOutputVoltageWithConnectedVoltageSource());
            }

        }
        if (type <= 0){
            //can.analyzeCircuit(circuit);

            //console.log('Az aramkor Thevenin ellenalasa: '+circuit.getThevRes().toFixed(6)+ ' Ohm');
            console.log('Az aramkor Thevenin ellenalasa: '+can.getResultOfTheveninResistance().toFixed(6)+ ' Ohm');
            //console.log('Az aramkor Thevenin helyettesito feszultsege: '+circuit.getThevVolt().toFixed(6)+ ' V');
            console.log('Az aramkor Thevenin helyettesito feszultsege: '+can.getResultOfTheveninVoltage().toFixed(6)+ ' V');
        }
        //console.log(circuit.getParameters());
        //console.log(cg.getCircuitCoordinatesToFalstad());
        
        resetMeshCounter();
        //console.log(cg.percentRandom(10));
    }

    public getResults():any{
        return this.results;
    }
    public getCircuitCoordinateArray(): string[]{
        return this.circuitCoordinateArray;
    }
    public getFalstadLink(): string{
        return this.falstadLink;
    }
}