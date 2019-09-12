﻿import { CircuitGenerator } from './circuitgenerator'
import { CircuitElements } from './interfaceCircElement';
import { Wire } from "./wire";
import { Resistance } from "./resistance";
import { CurrentSource } from "./currentsource";
import { VoltageSource } from "./voltagesource";
import { Branch, branchCounter } from "./branch";
import { Mesh, meshCounter } from "./mesh";
import { Circuit } from "./circuit";
import * as math from 'mathjs';

/**
 * A dokumencacioban szereplo strukturaju egyenaramu halozatot reprezentalo aramkor analiziset vegzi el,
 * a Thevenin helyettesito kep figyelembe vetelevel. 
 * Egyelore csak passziv halozat analizisere alkalmas, azon belul is csak ellenallast es csak feszgent tartalmazora.
 */
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
    
    /**
     * Kivulrol ezt a metodust kell hivni az aramkor analizalasahoz, ez a belepesi pontja az osztalynak.
     * @param circuit aramkor obj.
     */
    public analyzeCircuit(circuit: Circuit): void{
        this.circuit = circuit;
        this.finalCalculateOfTheveninSubstitutes(this.circuit);
    }
    /**
     * Ellenallas matrix modszerevel kiszamolja a halozat aramvektorat, azaz a hurokaramokat.
     * @param circuit aramkor objektum
     */
    public calculateCurrentVector(circuit: Circuit): math.MathType{
        let currentVector: math.MathType = math.matrix();
        currentVector.resize([circuit.getNumberOfMesh(),1]);
        currentVector = math.multiply(math.inv(this.calculateResistanceMatrix(circuit)),this.calculateVoltageVector(circuit));
        return currentVector;
    }
    /**
     * Letrehozza az ellenallas matrix modszerhez szukseges feszultsegvektoret a hurokhoz tartozo feszultsegertekekbol.
     * @param circuit aramkor objektum
     */
    public calculateVoltageVector(circuit: Circuit): math.Matrix {
        let voltageVector = math.matrix();
        voltageVector.resize([circuit.getNumberOfMesh(),1]);
        for (let i = 0; i < circuit.getNumberOfMesh(); i++){
            voltageVector.subset(math.index(i, 0),circuit.getMeshes()[i].getMeshVoltage());
        }
        return voltageVector;
    }

    /**
     * A parameterben megadott aramkor objektum ellenallas-matrixat allitja elo.
     * Altalanos metodus, ami ami a dokumentacioban leirt modon generalt barmely halozathoz hasznalhato.
     * @param circuit aramkor objektumot var
     */
    public calculateResistanceMatrix(circuit: Circuit): math.Matrix {
        let resistanceMatrix: math.Matrix = math.matrix();
        resistanceMatrix.resize([circuit.getNumberOfMesh(),circuit.getNumberOfMesh()]);
        for (let i = 0; i < circuit.getNumberOfMesh(); i++){
            for (let j = i; j < circuit.getNumberOfMesh(); j++){
                if (i === j){
                    resistanceMatrix.subset(math.index(i, j),circuit.getMeshes()[i].getMeshResistance());
                } else {
                    let branches: Branch[] = circuit.getMeshes()[j].getBranches();
                    for (let k = 0; k < branches.length; k++){
                        if (branches[k].getCommon() > circuit.getMeshes()[j].getMeshNumber()){
                            if ((branches[k].getCommon()-circuit.getMeshes()[j].getMeshNumber()) === circuit.getMeshes()[i].getMeshNumber()){
                                resistanceMatrix.subset(math.index(i, j),(branches[k].getBranchResistance()*-1));
                            }
                        }
                    }   
                    resistanceMatrix.subset(math.index(j, i),resistanceMatrix.subset(math.index(i, j)));
                }
            }
        }
        return resistanceMatrix;
    }
    
    /**
     * Meghatarozza a parameterul kapott aramkor eredo ellenallasat a keresett 2 polus felol egy seged feszultseggenerator segitsegevel.
     * Szukseges a megfelelo objektumok klonozasa, mert maskeppen csak referenciaval dolgozna a rendszer, ami miatt 
     * az eddig kiszamolt ertekek felulirodnanak.
     * @param circuit aramkor objektumot var
     */
    public calculateCircuitResultingResistance(circuit: Circuit): number {
        let th2PoleMeshNumber: number;
        let th2PoleBranchType: number;
        let th2PoleNumberOfBranch: number;
        let commonAndTh2Pole: number;
        let cloneCircuit: Circuit = circuit.cloneCircuit(circuit);
        
        for (let i = 0; i < cloneCircuit.getNumberOfMesh(); i++){
            let clMeshes: Mesh[] = cloneCircuit.getMeshes();
            let branches: Branch[] = clMeshes[i].getBranches();
            if (clMeshes[i].getMeshVoltage() !== 0){
                clMeshes[i].clearMeshVoltage();
            }
            for (let j = 0; j < branches.length; j++){
                if (branches[j].getTh2Pole()){
                    let elements: CircuitElements[] = branches[j].getBranchElements();
                    if (branches[j].getCommon() !== clMeshes[i].getMeshNumber()){
                        commonAndTh2Pole = branches[j].getCommon();
                    }
                    for (let k = 0; k < elements.length; k++){
                        if (elements[k].getId() === 'R'){
                            this.questionOrVoltmeterResistance = elements[k].getResistance();
                            
                        }
                    }
                    
                    th2PoleBranchType = branches[j].getType();
                    th2PoleNumberOfBranch = j;
                    th2PoleMeshNumber = i+1;
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
     * Ellenallas szamolasahoz metodus Ohm torvenye alapjan. 
     * @param voltage feszultseg ertek
     * @param current aram ertek
     */
    public calculateResultingResistance(voltage: number, current: number):number{
        return voltage/current;
    }
    /**
     * Kotelezo parametere a circuit, ami egy halozat objektum.A tobbi parametertol fuggoen tudja a metodus, hogy pl. belso 2 polus van-e 
     * Ennek a halozatnak a megadott ket polusa kozotti rovidzarasi aramot adja vissza.
     * Az aramkor osszes agaban megadja az elenalasokom eso feszultseget es folyo aramot DE!!! A 2 POLUST ROVIDZARNAK TEKINTI, tehat 
     * olyan, mintha lenne plusz egy hurok a rendszerben, igy nem konkretan a megjelenitett halozat elem ertekeit adja vissza.
     * @param circuit teljes aramkor
     * @param commonAndTh2Pole kozos agban levo 2 polus
     * @param th2PoleBranchType 2 polust tartalmazo Branch tipusa
     * @param th2PoleNumberOfBranch  2 polsut tartalmazo branch sorszama az ot tartalmazo mesh-ben (tombindex)
     * @param th2PoleMeshNumber 2 polsut tartalmazo branch ebben a szamu mesh-ben van
     */
    public calculateTh2PoleBranchCurrent(circuit: Circuit, commonAndTh2Pole?: number, th2PoleBranchType?:number, th2PoleNumberOfBranch?: number, th2PoleMeshNumber?: number, quesRes?:number): number {
        let th2PoleCurrent: number;
        let currentVector: math.MathType;
        if (commonAndTh2Pole === undefined && th2PoleBranchType !== undefined && th2PoleNumberOfBranch !== undefined && th2PoleMeshNumber !== undefined){
            let branches: Branch[] = circuit.getMeshes()[th2PoleMeshNumber-1].getBranches();
            branches.splice(th2PoleNumberOfBranch,1,new Branch(th2PoleBranchType,th2PoleMeshNumber-1));
            branches[th2PoleNumberOfBranch].setBranchElements(new VoltageSource(10,false));
            branches[th2PoleNumberOfBranch].setTh2Pole(true);
            let mesh : Mesh =  circuit.getMeshes()[th2PoleMeshNumber-1];
            mesh.setMeshVoltage(mesh.getBranches()[th2PoleNumberOfBranch]);
            currentVector = this.calculateCurrentVector(circuit);
            
        } else if (commonAndTh2Pole === undefined && th2PoleBranchType === undefined && th2PoleNumberOfBranch === undefined && th2PoleMeshNumber === undefined){

            currentVector = this.calculateCurrentVector(circuit);
        }else {
            let branches: Branch[] = circuit.getMeshes()[th2PoleMeshNumber-1].getBranches();
            branches.splice(th2PoleNumberOfBranch,1,new Branch(th2PoleBranchType,th2PoleMeshNumber-1));
            branches[th2PoleNumberOfBranch].setCommon((commonAndTh2Pole - th2PoleMeshNumber));
            branches[th2PoleNumberOfBranch].setBranchElements(new VoltageSource(10,false));
            branches[th2PoleNumberOfBranch].setTh2Pole(true);
            let mesh : Mesh =  circuit.getMeshes()[th2PoleMeshNumber-1];
            mesh.setMeshVoltage(mesh.getBranches()[th2PoleNumberOfBranch]);
            for (let i = 0; i < circuit.getMeshes()[(commonAndTh2Pole - th2PoleMeshNumber)-1].getBranches().length; i++){
                let currentMesh : Mesh =  circuit.getMeshes()[(commonAndTh2Pole - th2PoleMeshNumber)-1];
                if (currentMesh.getBranches()[i].getCommon() === commonAndTh2Pole) {
                    currentMesh.getBranches()[i].setBranchElements(this.copyCommonElement(circuit.getMeshes()[th2PoleMeshNumber-1].getBranches()[th2PoleNumberOfBranch].getBranchElements()[0]));
                    mesh.setMeshVoltage(mesh.getBranches()[i]);
                }
            }
            currentVector = this.calculateCurrentVector(circuit);
        }
        
        for (let i = 0; i < circuit.getNumberOfMesh(); i++){
            let branches: Branch[] = circuit.getMeshes()[i].getBranches();
            for (let j = 0; j < branches.length; j++){
                let elements: CircuitElements[] = branches[j].getBranchElements();
                branches[j].setCurrent(currentVector);
                if (branches[j].getTh2Pole()){
                    th2PoleCurrent = branches[j].getCurrent();
                }
                for (let k = 0; k < elements.length; k++){
                    if (elements[k].getId() === 'R'){
                        elements[k].setCurrent(branches[j].getCurrent());
                        elements[k].setVoltage(0);
                    }
                }
            }
        }
        return th2PoleCurrent;
    }

    /**
     * A meromuszeres es a keresett ellenallasos feladattipushoz szukseges metodus, mely a mar megkapott thevenin helyettesites ertekeivel
     * egy szimpla egyszeru feszoszto keplettel kiszamolja a keresett ertekeket.
     * @param thRes 
     * @param thVoltage 
     * @param questRes 
     */
    public calculateQuestionResistancCurrentAndVoltage(thRes: number, thVoltage: number, questRes: number): void {
        this.questionOrVoltmeterResistanceVoltage = thVoltage * (questRes/(questRes+thRes));
        this.questionOrVoltmeterResistanceCurrent = this.questionOrVoltmeterResistanceVoltage / questRes;
    }

    /**
     * A generalt halozathoz csatlakoztatott masik feszgen (ismert V es belso R) hatasa utan kialakult kapocsfeszultseget szamolja ki 
     * @param theveninvoltage 
     * @param theveninresistance 
     * @param connvoltage 
     * @param connresistance 
     */
    public calculateConectedVoltagsourceAndInsideResistance(theveninvoltage: number, theveninresistance: number, connvoltage: number, connresistance: number): number {
        let connectedCircuit: Circuit = new Circuit([2,0,0,0,0]/*this.circuitParameterLimits(1)*/);
        let meshes: Mesh[] = connectedCircuit.getMeshes();
        for (let h = 0; h < connectedCircuit.getNumberOfMesh(); h++) {
            connectedCircuit.setMeshes(new Mesh());

            for (let i = 0; i < 4; i++){
                meshes[h].setBranches(new Branch(i,h));
            }
        }
        meshes[0].getBranches()[0].setBranchElements(new VoltageSource(math.abs(theveninvoltage),(theveninvoltage < 0 ? true : false)));
        meshes[0].getBranches()[1].setBranchElements(new Resistance(theveninresistance));
        meshes[1].getBranches()[2].setBranchElements(new VoltageSource(connvoltage,true));
        meshes[1].getBranches()[1].setBranchElements(new Resistance(connresistance));
        meshes[0].getBranches()[2].setCommon(2);
        meshes[1].getBranches()[0].setCommon(1);
        meshes[0].getBranches()[2].setTh2Pole(true);


        for (let i = 0; i < meshes.length; i++){
            for(let j = 0; j < meshes[i].getBranches().length; j++){
                let mesh : Mesh =  meshes[i];
                mesh.setMeshVoltage(mesh.getBranches()[j]);
                mesh.setMeshResistance(mesh.getBranches()[j]);
            }
        }
        connectedCircuit.setThevRes(this.calculateCircuitResultingResistance(connectedCircuit));
        connectedCircuit.setThevVolt(connectedCircuit.getThevRes()*this.calculateTh2PoleBranchCurrent(connectedCircuit));
        return connectedCircuit.getThevVolt();
    }

    /**
     * A kozos agakban szereplo aramkori elemek masolasat vegzi.
     * A generatoroknal forditja az iranyt, mivel a ket szomszedos hurokban maskepp hatnak.
     * @param element egy aramkori elemet var
     */
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

    /**
     * Az osztaly tulajdonsagokhoz tartozo GETTER es SETTER metodusok
     */

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