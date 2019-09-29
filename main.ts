/* 
 * The MIT License
 *
 * Copyright 2019 Robert Pollai <pollairobert at gmail.com>, University of Szeged, Department of Technical Informatics.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
/*import { CircuitElements } from "./interfaceCircElement";
import { Wire } from "./wire";
import { Resistance } from "./resistance";
import { CurrentSource } from "./currentsource";
import { VoltageSource } from "./voltagesource";
import { Branch, branchCounter } from "./branch";*/
import { meshCounter, resetMeshCounter } from "./model/mesh";
import { Circuit } from "./model/circuit";
import { CircuitGenerator } from './model/circuitgenerator';
import { CircuitAnalyzer } from './model/circuitanalyzer';
import * as math from 'mathjs';

export class Main {
    private results: any;
    private circuitCoordinateArray: string[];
    private falstadLink: string;
    private voltegePrefix: string;
    private currentPrefix: string;
    private ohmPrefix: string;
    private measurementVoltPrefix: string;
    private taskResults;
    public start(type: number){
        let cg: CircuitGenerator = new CircuitGenerator();
        let can: CircuitAnalyzer = new CircuitAnalyzer();
        let typeArray: number[] = [2, 3, 3.1, 4, 5];
        let temptype = type;
        let measurementError: number[] = [];
        if (type === 2){
            temptype = cg.randomChoiseTwoNumber(2,2.1);
            //type = cg.randomChoiseTwoNumber(temp,3);
        }
        if (type === 6){
            //temptype = cg.randomChoiseInAnyArray(typeArray);
            temptype = cg.randomChoiseTwoNumber(4,5);
            can.setQuestionOrVoltmeterResistance(cg.randomE6Resistance());
        }
        if (type === 7){
            //temptype = cg.randomChoiseInAnyArray(typeArray);
            temptype = cg.randomChoiseTwoNumber(4,5);
            can.setQuestionOrVoltmeterResistance(2000000);
        }
        if (type === 8){
            temptype = cg.randomChoiseInAnyArray(typeArray);
            //temptype = cg.randomChoiseTwoNumber(4,5);
            can.setConnectedVoltagesourceValue(cg.randomVoltageSourceValue());
            can.setConnectedVoltagesourceResistance(cg.randomE6Resistance());
        }
        if (type === 9) {
            //temptype = 1;
        }
        let circuit: Circuit = cg.generateCircuit(temptype);

        //cg.setCircuitElementCoordinatesArrayToFalstadExport(circuit);
        //cg.exportToFalstadTxt(cg.getCircuitCoordinatesToFalstad())
        this.circuitCoordinateArray = cg.getCircuitCoordinatesToFalstad();
        
        can.analyzeCircuit(circuit);
        cg.setMultiplyResistorInBranch(cg.getCircuitResistorsDetails());
        this.falstadLink = cg.generateFalstadLink(circuit, type, ((type === 6 || type ===7) ? can.getQuestionRes() : can.getConnectedVoltagesourceResistance()),can.getConnectedVoltagesourceValue());
        if (type === 7){
            measurementError = this.calculateMeasurementError(can.getQuestionResVoltage(),can.getResultOfTheveninVoltage());
            console.log("measurementError: "+measurementError);
        }
        let randomID = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        this.taskResults = {
            falstadTXT: this.getCircuitCoordinateArray(),
            link: this.getFalstadLink(),
            id: randomID,
            thVolt: can.getResultOfTheveninVoltage(),
            thRes:can.getResultOfTheveninResistance(),
            resCurrent: can.getQuestionResCurrent(),
            resVolt: can.getQuestionResVoltage(),
            absError: measurementError[0],
            relError: measurementError[1],
            terminalVolt: can.getOutputVoltageWithConnectedVoltageSource(),
            resValue: can.getQuestionRes(),
            connVSRes: can.getConnectedVoltagesourceResistance(),
            connVSVolt: can.getConnectedVoltagesourceValue(),
            resistorDetails: cg.getCircuitResistorsDetails(),
            multiResInBranch: cg.getMultiplyResistorInBranch(),
            timestamp: new Date()
        }
        //console.log(this.taskResults);
        
        //this.scanPrefix(can.getQuestionResCurrent(),"A");
        //console.log('Prefix Current: '+ this.currentPrefix);
        //console.log('Prefix Voltage: '+ this.voltegePrefix);
        //console.log('Prefix Ohm: '+ this.ohmPrefix);
        //this.scanPrefix(can.getQuestionResCurrent(),"V");
        if (can.getQuestionRes() !== undefined){
            console.log('A keresett ellenallas feszultsege: '+can.getQuestionResVoltage()+ ' V');
            console.log('A keresett ellenallason folyo aram: '+can.getQuestionResCurrent()+ ' A');
        }
        if (can.getOutputVoltageWithConnectedVoltageSource() !== undefined){
            console.log('   A halozat kapocsfeszultseges a keresett pontok kozott: ' +can.getOutputVoltageWithConnectedVoltageSource());
        }
        //console.log(this.falstadLink);
        //console.log(this.results);
        
        if (type >= 1){
            //can.analyzeCircuit(circuit);

            //console.log('Az aramkor Thevenin ellenalasa: '+circuit.getThevRes().toFixed(6)+ ' Ohm');
            console.log('Az aramkor Thevenin ellenalasa: '+can.getResultOfTheveninResistance()+ ' Ω');
            //console.log('Az aramkor Thevenin helyettesito feszultsege: '+circuit.getThevVolt().toFixed(6)+ ' V');
            console.log('Az aramkor Thevenin helyettesito feszultsege: '+can.getResultOfTheveninVoltage()+ ' V');
        }
        //console.log(circuit.getParameters());
        //console.log(cg.getCircuitCoordinatesToFalstad());
        
        resetMeshCounter();
        if (type < 10){
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
                        console.log('           Agban levo ellenallasok szamai: '+circuit.getMeshes()[i].getBranches()[j].getResistanceOfBranch());
                        console.log('           Aramkori elemei: ');
                        console.log();
                        for (let k = 0; k < circuit.getMeshes()[i].getBranches()[j].getBranchElements().length; k++){
                            if (circuit.getMeshes()[i].getBranches()[j].getBranchElements()[k].getId() === 'R'){
                                console.log('               Ellenallas: '+circuit.getMeshes()[i].getBranches()[j].getBranchElements()[k].getResistance()+ ' Ohm');
                                console.log('                   Szama: '+circuit.getMeshes()[i].getBranches()[j].getBranchElements()[k].getNumber());
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
    }
    
        console.log('Az aramkor '+ circuit.getNumbOfRes()+' db ellenallast tartalmaz.');
    
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
    
    
    //if (type > 4){
        //can.analyzeCircuituit(circuit);
    
        //console.log('Az aramkor Thevenin ellenalasa: '+circuit.getThevRes().toFixed(6)+ ' Ohm');
        console.log('Az aramkor Thevenin ellenalasa: '+can.getResultOfTheveninResistance().toFixed(6)+ ' Ohm');
        //console.log('Az aramkor Thevenin helyettesito feszultsege: '+circuit.getThevVolt().toFixed(6)+ ' V');
        console.log('Az aramkor Thevenin helyettesito feszultsege: '+can.getResultOfTheveninVoltage().toFixed(6)+ ' V');
    //}
        //console.log(cg.percentRandom(10));
    }
    public calculateMeasurementError(measuredVoltage: number, realVoltage: number): number[]{
        let measurementErr: number[] = [];
        let absolutError: number = Math.abs(measuredVoltage) - Math.abs(realVoltage);
        let relativeError: number = (Math.abs(absolutError)/Math.abs(measuredVoltage))*100;
        measurementErr.push(Math.abs(absolutError),relativeError);
        return measurementErr;
    }
    
    public getTaskResults(): Object{
        return this.taskResults;
    }
    public getVoltagePrefix(): string{
        return this.voltegePrefix;
    }
    public getCurrentPrefix(): string{
        return this.currentPrefix;
    }
    public getOhmPrefix(): string{
        return this.ohmPrefix;
    }
    public getMeasurementVoltPrefix(): string{
        return this.measurementVoltPrefix;
    }
    /*public getResults():any{
        return this.results;
    }*/
    public getCircuitCoordinateArray(): string[]{
        return this.circuitCoordinateArray;
    }
    public getFalstadLink(): string{
        return this.falstadLink;
    }
}