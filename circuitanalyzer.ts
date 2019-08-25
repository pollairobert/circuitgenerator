import { CircuitGenerator } from './circuitgenerator'
import { CircuitElements } from './interfaceCircElement';
import { Wire } from "./wire";
import { Resistance } from "./resistance";
import { CurrentSource } from "./currentsource";
import { VoltageSource } from "./voltagesource";
import { Branch, branchCounter } from "./branch";
import { Mesh, meshCounter } from "./mesh";
import { Circuit } from "./circuit";
import * as math from 'mathjs';
import * as fs from 'fs';

export class CircuitAnalyzer {
    private circuit: Circuit;
    private circuitCurrentVector: math.MathType;
    private circuitVoltageVector: math.Matrix;
    private circuitResistanceMatrix: math.Matrix;
    private circuitResultingResistance: number = 0;
    private questionOrVoltmeterResistance: number ;
    private questionOrVoltmeterResistanceCurrent: number;
    private questionOrVoltmeterResistanceVoltage: number;

    private connectedVoltagesourceValue: number;
    private connectedVoltagesourceInsideResistance: number;
    private outpuVoltageWithconnectedVoltagesource: number;
    
    public analyzeCircuit(circuit: Circuit): void{
        this.circuit = circuit;
        this.finalCalculateOfTheveninSubstitutes(this.circuit);
    }
    /**
     * Ellenallas matrix modszerevel kiszamolja a halozat aramvektorat, azaz a hurokaramokat.
     * @param circuit aramkor objektum
     */
    public calculateCurrentVector(circuit: Circuit): math.MathType{
        //this.counter++;
        ////console.log('**** calculateCurrentVector meghivva a calculateCircuitResultingResistance-bol ****');
        let currentVector: math.MathType = math.matrix();
        currentVector.resize([circuit.getNumberOfMesh(),1]);
        currentVector = math.multiply(math.inv(this.calculateResistanceMatrix(circuit)),this.calculateVoltageVector(circuit));
        //currentVector.valueOf
        ////console.log(currentVector);
        return currentVector;
    }
    /**
     * Letrehozza az ellenallas matrix modszerhez szukseges feszultsegvektoret a hurokhoz tartozo feszultsegertekekbol.
     * @param circuit aramkor objektum
     */
    public calculateVoltageVector(circuit: Circuit): math.Matrix {
        ////console.log('**** calculateVoltageVector meghivva a calculateCurrentVector-bol ****');

        let voltageVector = math.matrix();
        voltageVector.resize([circuit.getNumberOfMesh(),1]);
        for (let i = 0; i < circuit.getNumberOfMesh(); i++){
            voltageVector.subset(math.index(i, 0),circuit.getMeshes()[i].getMeshVoltage());
        }
        ////console.log(voltageVector);
        return voltageVector;
    }

    /**
     * A parameterben megadott aramkor objektum ellenallas-matrixat allitja elo.
     * Altalanos metodus, ami barmelyik halozathoz hasznalhato
     * @param circuit aramkor objektumot var
     */
    public calculateResistanceMatrix(circuit: Circuit): math.Matrix {
        ////console.log('**** calculateResistanceMatrix meghivva a calculateCurrentVector-bol ****');
        let resistanceMatrix: math.Matrix = math.matrix();
        resistanceMatrix.resize([circuit.getNumberOfMesh(),circuit.getNumberOfMesh()]);
        for (let i = 0; i < circuit.getNumberOfMesh(); i++){
            for (let j = i; j < circuit.getNumberOfMesh(); j++){
                if (i === j){
                    resistanceMatrix.subset(math.index(i, j),circuit.getMeshes()[i].getMeshResistance());
                } else {
                    for (let k = 0; k < circuit.getMeshes()[j].getBranches().length; k++){
                        if (circuit.getMeshes()[j].getBranches()[k].getCommon() > circuit.getMeshes()[j].getMeshNumber()){
                            if ((circuit.getMeshes()[j].getBranches()[k].getCommon()-circuit.getMeshes()[j].getMeshNumber()) === circuit.getMeshes()[i].getMeshNumber()){
                                resistanceMatrix.subset(math.index(i, j),(circuit.getMeshes()[j].getBranches()[k].getBranchResistance()*-1));
                            }
                        }
                    }   
                    resistanceMatrix.subset(math.index(j, i),resistanceMatrix.subset(math.index(i, j)));
                }
            }
        }
        //console.log(resistanceMatrix);
        return resistanceMatrix;
    }
    
    /**
     * Meghatarozza a parameterul kapott aramkor eredo ellenallasat a keresett 2 polus felol egy seged feszultseggenerator segitsegevel.
     * Szukseges a megfelelo objektumok klonozasa, mert maskeppen csak referenciaval dolgozna a rendszer, ami miatt 
     * az eddig kiszamolt ertekek felulirodnanak.
     * @param circuit aramkor objektumot var
     */
    public calculateCircuitResultingResistance(circuit: Circuit): number {
        //console.log('**** calculateCircuitResultingResistance meghivva a finalCalculateOfTheveninSubstitutes ****');
        let th2PoleMeshNumber: number;
        let th2PoleBranchType: number;
        let th2PoleNumberOfBranch: number;
        let commonAndTh2Pole: number;
        //let resistanceExistIndex: number;
        //let th2PoleCounter: number = 0;
        let cloneCircuit: Circuit = circuit.cloneCircuit(circuit);
        
        for (let i = 0; i < cloneCircuit.getNumberOfMesh(); i++){
            if (cloneCircuit.getMeshes()[i].getMeshVoltage() !== 0){
                cloneCircuit.getMeshes()[i].clearMeshVoltage();
            }
            for (let j = 0; j < cloneCircuit.getMeshes()[i].getBranches().length; j++){
                if (cloneCircuit.getMeshes()[i].getBranches()[j].getTh2Pole()){
                    ////console.log('van 2polusa a klonnak');
                    if (cloneCircuit.getMeshes()[i].getBranches()[j].getCommon() !== cloneCircuit.getMeshes()[i].getMeshNumber()){
                        commonAndTh2Pole = cloneCircuit.getMeshes()[i].getBranches()[j].getCommon();
                        //this.commonAndTh2Pole = cloneCircuit.getMeshes()[i].getBranches()[j].getCommon();
                        ////console.log('Kozos ag a 2 polus');
                    }
                    for (let k = 0; k < cloneCircuit.getMeshes()[i].getBranches()[j].getBranchElements().length; k++){
                        if (cloneCircuit.getMeshes()[i].getBranches()[j].getBranchElements()[k].getId() === 'R'){
                            this.questionOrVoltmeterResistance = cloneCircuit.getMeshes()[i].getBranches()[j].getBranchElements()[k].getResistance();
                            
                        }
                    }
                    
                    th2PoleBranchType = cloneCircuit.getMeshes()[i].getBranches()[j].getType();
                    th2PoleNumberOfBranch = j;
                    th2PoleMeshNumber = i+1;
                    //th2PoleMeshNumber = cloneCircuit.getMeshes()[i].getMeshNumber();
                    /*this.th2PoleBranchType = cloneCircuit.getMeshes()[i].getBranches()[j].getType();
                    this.th2PoleNumberOfBranch = j;
                    this.th2PoleMeshNumber = cloneCircuit.getMeshes()[i].getMeshNumber();*/
                }
            }
        }
        return this.calculateResultingResistance(10,this.calculateTh2PoleBranchCurrent(cloneCircuit,commonAndTh2Pole,th2PoleBranchType,th2PoleNumberOfBranch,th2PoleMeshNumber,this.questionOrVoltmeterResistance));
        
    }
    /**
     * Az aramkor vegso analiziseert felel. 
     * Meghatarozza a halozat Thevenin ellenallasat, majd a keresett 2 polus kozotti rovidzarasi aram segitsegevel
     * meghatarozza a thevenin helyettesito feszultseget a halozatnak.
     * @param circuit aramkor objektumot var
     */
    public finalCalculateOfTheveninSubstitutes(circuit: Circuit): void {
        //console.log('**** finalCalculateOfTheveninSubstitutes meghivva a generateCircuit-bol ****');
        //circuit.setThevRes(this.circuitResultingResistance);
        let tempRes: number;
        circuit.setThevRes(this.calculateCircuitResultingResistance(circuit));
        circuit.setThevVolt(circuit.getThevRes()*this.calculateTh2PoleBranchCurrent(circuit));
        
        if (this.questionOrVoltmeterResistance !== undefined){
            this.calculateQuestionResistancCurrentAndVoltage(circuit.getThevRes(),circuit.getThevVolt(),this.questionOrVoltmeterResistance);
        }
        if (this.connectedVoltagesourceInsideResistance !== undefined && this.connectedVoltagesourceValue !== undefined){
            this.outpuVoltageWithconnectedVoltagesource = this.calculateConectedVoltagsourceAndInsideResistance(circuit.getThevVolt(),circuit.getThevRes(),this.connectedVoltagesourceValue,this.connectedVoltagesourceInsideResistance);
        }
    }
    /**
     * Eredo ellenallas szamolasahoz metodus.
     * @param voltage 
     * @param current 
     */
    public calculateResultingResistance(voltage: number, current: number):number{
        //console.log('**** calculateResultingResistance meghivva a calculateCircuitResultingResistance-bol****');
        //console.log(voltage/current);
        return voltage/current;
    }
    /**
     * Kotelezo parametere a circuit, ami egy halozat objektum.A tobbi parametertol fuggoen tudja a metodus, hogy pl. belso 2 polus van-e 
     * Ennek a halozatnak a megadott ket polusa kozotti rovidzarasi aramot adja vissza.
     * Kiszamolja az aramkor osszes branch objektuman folyo aramot.
     * @param circuit teljes aramkor
     * @param commonAndTh2Pole kozos agban levo 2 polus
     * @param th2PoleBranchType 2 polust tartalmazo Branch tipusa
     * @param th2PoleNumberOfBranch  2 polsut tartalmazo branch sorszama az ot tartalmazo mesh-ben (tombindex)
     * @param th2PoleMeshNumber 2 polsut tartalmazo branch ebben a szamu mesh-ben van
     */
    public calculateTh2PoleBranchCurrent(circuit: Circuit, commonAndTh2Pole?: number, th2PoleBranchType?:number, th2PoleNumberOfBranch?: number, th2PoleMeshNumber?: number, quesRes?:number): number {
        //console.log('commonAndTh2Pole: '+commonAndTh2Pole);
        //console.log('th2PoleBranchType: '+th2PoleBranchType);
        //console.log('th2PoleNumberOfBranch: '+th2PoleNumberOfBranch);
        //console.log('th2PoleMeshNumber: '+th2PoleMeshNumber);
        let th2PoleCurrent: number;
        let currentVector: math.MathType;
        //console.log(commonAndTh2Pole);
        if (commonAndTh2Pole === undefined && th2PoleBranchType !== undefined && th2PoleNumberOfBranch !== undefined && th2PoleMeshNumber !== undefined){
            //console.log('COMMON AND 2 POLE UNDEFINED');
            circuit.getMeshes()[th2PoleMeshNumber-1].getBranches().splice(th2PoleNumberOfBranch,1,new Branch(th2PoleBranchType,th2PoleMeshNumber-1));
            //cloneCircuit.getMeshes()[i].setBranches(new Branch(th2PoleBranchType,i));
            circuit.getMeshes()[th2PoleMeshNumber-1].getBranches()[th2PoleNumberOfBranch].setBranchElements(new VoltageSource(10,false));
            circuit.getMeshes()[th2PoleMeshNumber-1].getBranches()[th2PoleNumberOfBranch].setTh2Pole(true);
            let mesh : Mesh =  circuit.getMeshes()[th2PoleMeshNumber-1];
            mesh.setMeshVoltage(mesh.getBranches()[th2PoleNumberOfBranch]);
            currentVector = this.calculateCurrentVector(circuit);
            
        } else if (commonAndTh2Pole === undefined && th2PoleBranchType === undefined && th2PoleNumberOfBranch === undefined && th2PoleMeshNumber === undefined){

            currentVector = this.calculateCurrentVector(circuit);
        }else {
            
            circuit.getMeshes()[th2PoleMeshNumber-1].getBranches().splice(th2PoleNumberOfBranch,1,new Branch(th2PoleBranchType,th2PoleMeshNumber-1));
            circuit.getMeshes()[th2PoleMeshNumber-1].getBranches()[th2PoleNumberOfBranch].setCommon((commonAndTh2Pole - th2PoleMeshNumber));
            circuit.getMeshes()[th2PoleMeshNumber-1].getBranches()[th2PoleNumberOfBranch].setBranchElements(new VoltageSource(10,false));
            circuit.getMeshes()[th2PoleMeshNumber-1].getBranches()[th2PoleNumberOfBranch].setTh2Pole(true);
            let mesh : Mesh =  circuit.getMeshes()[th2PoleMeshNumber-1];
            mesh.setMeshVoltage(mesh.getBranches()[th2PoleNumberOfBranch]);
            for (let i = 0; i < circuit.getMeshes()[(commonAndTh2Pole - th2PoleMeshNumber)-1].getBranches().length; i++){
                if (circuit.getMeshes()[(commonAndTh2Pole - th2PoleMeshNumber)-1].getBranches()[i].getCommon() === commonAndTh2Pole) {
                    circuit.getMeshes()[(commonAndTh2Pole - th2PoleMeshNumber)-1].getBranches()[i].setBranchElements(this.copyCommonElement(circuit.getMeshes()[th2PoleMeshNumber-1].getBranches()[th2PoleNumberOfBranch].getBranchElements()[0]));
                    let mesh : Mesh =  circuit.getMeshes()[(commonAndTh2Pole - th2PoleMeshNumber)-1];
                    mesh.setMeshVoltage(mesh.getBranches()[i]);
                }
            }
            currentVector = this.calculateCurrentVector(circuit);
            //console.log('CURRENT VEKTOR: '+currentVector);
        }
        //let currentVector: math.MathType = this.calculateCurrentVector(circuit);
        
        for (let i = 0; i < circuit.getNumberOfMesh(); i++){
            for (let j = 0; j < circuit.getMeshes()[i].getBranches().length; j++){
                circuit.getMeshes()[i].getBranches()[j].setCurrent(currentVector);
                if (circuit.getMeshes()[i].getBranches()[j].getTh2Pole()){
                    th2PoleCurrent = circuit.getMeshes()[i].getBranches()[j].getCurrent();
                    //console.log('EZ A 2 POLUS BRANCH ARAMA: '+ circuit.getMeshes()[i].getBranches()[j].getCurrent());
                }
                //console.log('Branch type: '+ circuit.getMeshes()[i].getBranches()[j].getType()+' Arama: '+circuit.getMeshes()[i].getBranches()[j].getCurrent()+ 'Branch number: ' +circuit.getMeshes()[i].getBranches()[j].getBranchNumber());
                for (let k = 0; k < circuit.getMeshes()[i].getBranches()[j].getBranchElements().length; k++){
                    if (circuit.getMeshes()[i].getBranches()[j].getBranchElements()[k].getId() === 'R'){
                        circuit.getMeshes()[i].getBranches()[j].getBranchElements()[k].setCurrent(circuit.getMeshes()[i].getBranches()[j].getCurrent());
                        circuit.getMeshes()[i].getBranches()[j].getBranchElements()[k].setVoltage(0);
                        //console.log('  Ellenallas arama: '+ circuit.getMeshes()[i].getBranches()[j].getBranchElements()[k].getCurrent());
                        //console.log('  Ellenallas feszultsege: '+ circuit.getMeshes()[i].getBranches()[j].getBranchElements()[k].getVoltage());
                    }
                }
                
                ////console.log('   Branch common: '+ circuit.getMeshes()[i].getBranches()[j].getCommon());
                ////console.log('   Branch common: '+ circuit.getMeshes()[i].getBranches()[j].getCommon());
            }
        }
        //console.log('2 POLE CURRENT: '+th2PoleCurrent);
        return th2PoleCurrent;
    }

    /**
     * 
     * @param thRes 
     * @param thVoltage 
     * @param questRes 
     */
    public calculateQuestionResistancCurrentAndVoltage(thRes: number, thVoltage: number, questRes: number): void {
        this.questionOrVoltmeterResistanceVoltage = thVoltage * (questRes/(questRes+thRes));
        this.questionOrVoltmeterResistanceCurrent = this.questionOrVoltmeterResistanceVoltage / questRes;
    }

    /**
     * 
     * @param theveninvoltage 
     * @param theveninresistance 
     * @param connvoltage 
     * @param connresistance 
     */
    public calculateConectedVoltagsourceAndInsideResistance(theveninvoltage: number, theveninresistance: number, connvoltage: number, connresistance: number): number {
        //let outputVoltage: number;
        //let connectedCircuit: Circuit = new Circuit(2,2,0,2,1);
        let connectedCircuit: Circuit = new Circuit([2,0,0,0,0]/*this.circuitParameterLimits(1)*/);
        for (let h = 0; h < connectedCircuit.getNumberOfMesh(); h++) {
            connectedCircuit.setMeshes(new Mesh());

            //A 4 iranynak megfelelo branch-ek letrehozasa a mesh-en belul
            for (let i = 0; i < 4; i++){
                connectedCircuit.getMeshes()[h].setBranches(new Branch(i,h));
            }
        }
        //if 
        connectedCircuit.getMeshes()[0].getBranches()[0].setBranchElements(new VoltageSource(math.abs(theveninvoltage),(theveninvoltage < 0 ? true : false)));
        connectedCircuit.getMeshes()[0].getBranches()[1].setBranchElements(new Resistance(theveninresistance));
        connectedCircuit.getMeshes()[1].getBranches()[2].setBranchElements(new VoltageSource(connvoltage,true));
        connectedCircuit.getMeshes()[1].getBranches()[1].setBranchElements(new Resistance(connresistance));
        connectedCircuit.getMeshes()[0].getBranches()[2].setCommon(2);
        connectedCircuit.getMeshes()[1].getBranches()[0].setCommon(1);
        connectedCircuit.getMeshes()[0].getBranches()[2].setTh2Pole(true);


        for (let i = 0; i < connectedCircuit.getMeshes().length; i++){
            for(let j = 0; j < connectedCircuit.getMeshes()[i].getBranches().length; j++){
                let mesh : Mesh =  connectedCircuit.getMeshes()[i];
                mesh.setMeshVoltage(mesh.getBranches()[j]);
                mesh.setMeshResistance(mesh.getBranches()[j]);
                ////console.log(mesh.getBranches()[j]);
            }
        }
        //console.log(connectedCircuit);
        connectedCircuit.setThevRes(this.calculateCircuitResultingResistance(connectedCircuit));
        //console.log('CONNECTED EREDO: ' +connectedCircuit.getThevRes());
        connectedCircuit.setThevVolt(connectedCircuit.getThevRes()*this.calculateTh2PoleBranchCurrent(connectedCircuit));
        //this.finalCalculateOfTheveninSubstitutes(connectedCircuit);
        return connectedCircuit.getThevVolt();
    }
    public copyCommonElement(element: CircuitElements): CircuitElements{
        let circuitelement: CircuitElements;
        if (element.getId() === 'R') {
            circuitelement = new Resistance(element.getResistance());
        }
        if (element.getId() === 'V') {
            circuitelement = new VoltageSource(element.getVoltage(),!element.getDirection()); 
        }
        if (element.getId() === 'C') {
            circuitelement = new CurrentSource(element.getVoltage(),!element.getDirection());
        }
        return circuitelement;
    }
    public setQuestionOrVoltmeterResistance(value: number): void{
        this.questionOrVoltmeterResistance = value;
    }
    public setConnectedVoltagesourceValue(value: number): void {
        this.connectedVoltagesourceValue = value;
    }
    public setConnectedVoltagesourceResistance(value: number): void {
        this.connectedVoltagesourceInsideResistance = value;
    }
    public getConnectedVoltagesourceValue(): number {
        return this.connectedVoltagesourceValue;
    }
    public getConnectedVoltagesourceResistance(): number {
        return this.connectedVoltagesourceInsideResistance;
    }
    public getOutputVoltageWithConnectedVoltageSource(): number{
        return this.outpuVoltageWithconnectedVoltagesource;
    }
    public getCircuitCurrentVector(): math.MathType{
        return this.circuitCurrentVector;
    }
    public getCircuitVoltageVector(): math.Matrix{
        return this.circuitVoltageVector;
    }
    public getCircuitResistanceMatrix(): math.Matrix{
        return this.circuitResistanceMatrix;
    }
    public getCircuitResultingResistance(): number {
        return this.circuitResultingResistance;
    }
    public getQuestionResVoltage(): number {
        return this.questionOrVoltmeterResistanceVoltage;
    }
    public getQuestionRes(): number {
        return this.questionOrVoltmeterResistance;
    }
    public getQuestionResCurrent(): number {
        return this.questionOrVoltmeterResistanceCurrent;
    }
}