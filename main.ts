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
    public start(type: number){
        let cg: CircuitGenerator = new CircuitGenerator();
        let can: CircuitAnalyzer = new CircuitAnalyzer();

        //can.setQuestionOrVoltmeterResistance(1500);
        //can.setConnectedVoltagesourceValue(12);
        //can.setConnectedVoltagesourceResistance(10);

        //let type = 5;
        let temptype = type;
        let measurementError: number[] = [];
        if (type === 2){
            temptype = cg.randomChoiseTwoNumber(2,2.1);
            //type = cg.randomChoiseTwoNumber(temp,3);
        }
        if (type === 6){
            temptype = cg.randomChoiseTwoNumber(4,5);
            can.setQuestionOrVoltmeterResistance(680000);
        }
        if (type === 7){
            temptype = cg.randomChoiseTwoNumber(4,5);
            can.setQuestionOrVoltmeterResistance(2000000);
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
        if (type === 7){
            console.log("can.getQuestionResVoltage(): "+can.getQuestionResVoltage())
            console.log("can.getResultOfTheveninVoltage(): "+can.getResultOfTheveninVoltage())
            measurementError = this.calculateMeasurementError(can.getQuestionResVoltage(),can.getResultOfTheveninVoltage());
            //console.log
        }
        console.log("can.getQuestionRes(): "+can.getQuestionRes())
        if (type < 6){
            this.scanPrefix(Math.abs(can.getResultOfTheveninVoltage()),"V");
            this.scanPrefix(Math.abs(can.getResultOfTheveninResistance()),"Ohm");
            this.results = {
                "thres": Number(can.getResultOfTheveninResistance()),
                "thvolt": Math.abs(Number(can.getResultOfTheveninVoltage())),
                "timestamp": new Date(),
            }
        } else {
            this.scanPrefix(Math.abs(can.getQuestionResCurrent()),"A");
            this.scanPrefix(Math.abs(can.getQuestionResVoltage()),"V");
            this.results = {
                "resCurrent": Math.abs(Number(can.getQuestionResCurrent())),
                "resVolt": Math.abs(Number(can.getQuestionResVoltage())),
                "absError": Number(measurementError[0]),
                "relativeError": Number(measurementError[1]),
                "timestamp": new Date(),
                
            }
        }
        //this.scanPrefix(can.getQuestionResCurrent(),"A");
        //console.log('Prefix Current: '+ this.currentPrefix);
        //console.log('Prefix Voltage: '+ this.voltegePrefix);
        //console.log('Prefix Ohm: '+ this.ohmPrefix);
        //this.scanPrefix(can.getQuestionResCurrent(),"V");
        if (can.getQuestionRes() !== undefined){
            console.log('A keresett ellenallas feszultsege: '+can.getQuestionResVoltage()+ ' V');
            console.log('A keresett ellenallason folyo aram: '+can.getQuestionResCurrent()+ ' A');
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
    public scanPrefix(ciruitresult: number, typeOfValue: string): void{
        let prefix: string = "";
        let prefixNumb: number = ciruitresult * 1000;
        if (prefixNumb < 1000000000 && prefixNumb > 10000000){
            prefix = "k";
        } 
        if (prefixNumb < 1000000000000 && prefixNumb > 1000000000){
            prefix = "M";
        } 
        if (prefixNumb < 1000 && prefixNumb > 1){
            prefix = "m";
        } 
        if (prefixNumb < 1 && prefixNumb > 0.001){
            prefix = "µ";
        } 
        if (prefixNumb < 0.001 && prefixNumb > 0.000001){
            prefix = "n";
        }
        if (prefixNumb < 0.000001 && prefixNumb > 0.000000001){
            prefix = "p";
        }  
        if (typeOfValue === "V"){
            this.voltegePrefix = prefix;
        }
        if (typeOfValue === "A"){
            this.currentPrefix = prefix;
        }
        if (typeOfValue === "Ohm"){
            this.ohmPrefix = prefix;
        }
        if (typeOfValue === "Volt"){
            this.measurementVoltPrefix = prefix;
        }
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