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
        let circuit: Circuit = cg.generateCircuit(temptype);

        //cg.setCircuitElementCoordinatesArrayToFalstadExport(circuit);
        //cg.exportToFalstadTxt(cg.getCircuitCoordinatesToFalstad())
        this.circuitCoordinateArray = cg.getCircuitCoordinatesToFalstad();
        this.falstadLink = cg.generateFalstadLink(circuit);
        can.analyzeCircuit(circuit);
        if (type === 7){
            measurementError = this.calculateMeasurementError(can.getQuestionResVoltage(),can.getResultOfTheveninVoltage());
            console.log("measurementError: "+measurementError);
        }
        let randomID = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        this.taskResults = {
            falstadTXT: this.getCircuitCoordinateArray(),
            link: this.getFalstadLink(),
            link2: "majd ide kellene egy ellenallasos link",
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
            timestamp: new Date()
        }
        console.log(this.taskResults);
        
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
        console.log(this.results);
        
        if (type >= 0){
            //can.analyzeCircuit(circuit);

            //console.log('Az aramkor Thevenin ellenalasa: '+circuit.getThevRes().toFixed(6)+ ' Ohm');
            console.log('Az aramkor Thevenin ellenalasa: '+can.getResultOfTheveninResistance()+ ' Ω');
            //console.log('Az aramkor Thevenin helyettesito feszultsege: '+circuit.getThevVolt().toFixed(6)+ ' V');
            console.log('Az aramkor Thevenin helyettesito feszultsege: '+can.getResultOfTheveninVoltage()+ ' V');
        }
        //console.log(circuit.getParameters());
        //console.log(cg.getCircuitCoordinatesToFalstad());
        
        resetMeshCounter();
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