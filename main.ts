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
            temptype = cg.randomChoiseInAnyArray(typeArray);
            //temptype = cg.randomChoiseTwoNumber(4,5);
            can.setQuestionOrVoltmeterResistance(680000);
        }
        if (type === 7){
            temptype = cg.randomChoiseInAnyArray(typeArray);
            //temptype = cg.randomChoiseTwoNumber(4,5);
            can.setQuestionOrVoltmeterResistance(2000000);
        }
        if (type === 8){
            temptype = cg.randomChoiseInAnyArray(typeArray);
            //temptype = cg.randomChoiseTwoNumber(4,5);
            can.setConnectedVoltagesourceValue(20);
            can.setConnectedVoltagesourceResistance(22000);

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
            id: randomID,
            thVolt: can.getResultOfTheveninVoltage(),
            thRes:can.getResultOfTheveninResistance(),
            resCurrent: can.getQuestionResCurrent(),
            resVolt: can.getQuestionResVoltage(),
            absError: measurementError[0],
            relError: measurementError[1],
            terminalVolt: can.getOutputVoltageWithConnectedVoltageSource(),
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