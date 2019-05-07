import { CircuitElements } from './interfaceCircElement';
import { Wire } from "./wire";
import { Resistance } from "./resistance";
import { CurrentSource } from "./currentsource";
import { VoltageSource } from "./voltagesource";
import { Branch, branchCounter } from "./branch";
import { Mesh, meshCounter } from "./mesh";
import { Circuit } from "./circuit";
import * as math from 'mathjs';

export class CircuitGenerator {
    private circuit: Circuit;
    private circuitCurrentVector: math.MathType;
    private circuitVoltageVector: math.Matrix;
    private circuitResistanceMatrix: math.Matrix;
    private circuitInverzResistanceMatrix: math.MathType;
    private circuitResultingResistance: number = 0;
    private commonBranches: Branch[] = [];
    
    /**
     * Aramkor generalasaert felelos. Meghivja a halozat analizalasahoz szukseges fuggvenyeket.
     * Eredmenyul pedig megadja az altala generalt halozat thevenin helyettesiteset
     * @param type aramkor tipusa adott struktura alapjan 
     */
    public generateCircuit(type: number/*mesh: number, res: number, cur: number, volt: number, comm: number*/): void {
        switch (type) {
            //Egyszeru feszultsegoszto
            case 1: {
                this.circuit = new Circuit(2, 2, 0, 1, 1);
                for (var h = 0; h < this.circuit.getNumberOfMesh(); h++) {
                    this.circuit.setMeshes(new Mesh());
                    for (var i = 0; i < 4; i++){
                        this.circuit.getMeshes()[h].setBranches(new Branch(i,h));
                    }
                }
                this.circuit.getMeshes()[0].getBranches()[1].setBranchElements(new Resistance(this.randomIntNumber(1,20)));
                this.circuit.getMeshes()[0].getBranches()[2].setBranchElements(new Resistance(this.randomIntNumber(1,20)));
                this.circuit.getMeshes()[0].getBranches()[0].setBranchElements(new VoltageSource(this.randomIntNumber(5,50),this.randomBoolean()));
                //this.circuit.getMeshes()[0].getBranches()[2].setBranchElements(new VoltageSource(10,false));
                this.circuit.getMeshes()[0].getBranches()[2].setCommon(2);
                this.circuit.getMeshes()[1].getBranches()[0].setCommon(1);
                this.circuit.getMeshes()[1].getBranches()[0].setBranchElements(this.copyCommonElement(this.circuit.getMeshes()[0].getBranches()[2].getBranchElements()[0]));
                //this.circuit.getMeshes()[1].getBranches()[0].setBranchElements(this.copyCommonElement(this.circuit.getMeshes()[0].getBranches()[2].getBranchElements()[1]));
                this.circuit.getMeshes()[1].getBranches()[2].setTh2Pole(true);
                for (var i = 0; i < this.circuit.getMeshes().length; i++){
                    for(var j = 0; j < this.circuit.getMeshes()[i].getBranches().length; j++){
                        var mesh : Mesh =  this.circuit.getMeshes()[i]
                        mesh.setMeshVoltage(mesh.getBranches()[j]);
                        mesh.setMeshResistance(mesh.getBranches()[j]);
                    }
                }
                this.setCircuitVoltageVector(this.circuit);
                this.setCircuitResistanceMatrix(this.circuit);
                this.setCircuitCurrentVector(this.circuit);
                this.calculateResultingResistance(this.circuit);
                this.finalCalculateOfTheveninSubstitues(this.circuit);
                break;
            }
            //Kettos feszultsegoszto
            case 2: {
                this.circuit = new Circuit(3, 4, 0, 1, 2);
                for (var h = 0; h < this.circuit.getNumberOfMesh(); h++) {
                    this.circuit.setMeshes(new Mesh());
                    for (var i = 0; i < 4; i++){
                        this.circuit.getMeshes()[h].setBranches(new Branch(i,h));
                        
                    }
                }
                this.circuit.getMeshes()[0].getBranches()[0].setBranchElements(new VoltageSource(this.randomIntNumber(5,50),this.randomBoolean()));
                //this.circuit.getMeshes()[0].getBranches()[2].setBranchElements(new VoltageSource(this.randomIntNumber(5,50),this.randomBoolean()));
                this.circuit.getMeshes()[0].getBranches()[1].setBranchElements(new Resistance(this.randomIntNumber(1,20)));
                this.circuit.getMeshes()[0].getBranches()[2].setBranchElements(new Resistance(this.randomIntNumber(1,20)));
                this.circuit.getMeshes()[1].getBranches()[1].setBranchElements(new Resistance(this.randomIntNumber(1,20)));
                this.circuit.getMeshes()[1].getBranches()[2].setBranchElements(new Resistance(this.randomIntNumber(1,20)));
                //this.circuit.getMeshes()[2].getBranches()[1].setBranchElements(new Resistance(this.randomIntNumber(1,20)));
                //this.circuit.getMeshes()[2].getBranches()[2].setBranchElements(new Resistance(3));
                this.circuit.getMeshes()[0].getBranches()[2].setCommon(2);
                this.circuit.getMeshes()[1].getBranches()[0].setCommon(1);
                this.circuit.getMeshes()[1].getBranches()[2].setCommon(3);
                this.circuit.getMeshes()[2].getBranches()[0].setCommon(2);
                this.circuit.getMeshes()[1].getBranches()[0].setBranchElements(this.copyCommonElement(this.circuit.getMeshes()[0].getBranches()[2].getBranchElements()[0]));
                //this.circuit.getMeshes()[1].getBranches()[0].setBranchElements(this.copyCommonElement(this.circuit.getMeshes()[0].getBranches()[2].getBranchElements()[1]));
                this.circuit.getMeshes()[2].getBranches()[0].setBranchElements(this.copyCommonElement(this.circuit.getMeshes()[1].getBranches()[2].getBranchElements()[0]));
                this.circuit.getMeshes()[2].getBranches()[2].setTh2Pole(true);
                for (var i = 0; i < this.circuit.getMeshes().length; i++){
                    for(var j = 0; j < this.circuit.getMeshes()[i].getBranches().length; j++){
                        var mesh : Mesh =  this.circuit.getMeshes()[i]
                        mesh.setMeshVoltage(mesh.getBranches()[j]);
                        mesh.setMeshResistance(mesh.getBranches()[j]);
                    }
                }
                this.setCircuitVoltageVector(this.circuit);
                this.setCircuitResistanceMatrix(this.circuit);
                this.setCircuitCurrentVector(this.circuit);
                this.calculateResultingResistance(this.circuit);
                this.finalCalculateOfTheveninSubstitues(this.circuit);
                break;
            }
        }
    }

    public setCircuitCurrentVector(circuit: Circuit): void{
        this.circuitCurrentVector = math.matrix();
        this.circuitCurrentVector.resize([circuit.getNumberOfMesh(),1]);
        this.circuitCurrentVector = math.multiply(math.inv(this.circuitResistanceMatrix),this.circuitVoltageVector);
    }
    public setCircuitVoltageVector(circuit: Circuit): void{
        this.circuitVoltageVector = math.matrix();
        this.circuitVoltageVector.resize([circuit.getNumberOfMesh(),1]);
        for (var i = 0; i < circuit.getNumberOfMesh(); i++){
            this.circuitVoltageVector.subset(math.index(i, 0),circuit.getMeshes()[i].getMeshVoltage());
        }
    }
    public setCircuitResistanceMatrix(circuit: Circuit): void {
        this.circuitResistanceMatrix = math.matrix();
        this.circuitResistanceMatrix.resize([circuit.getNumberOfMesh(),circuit.getNumberOfMesh()]);
        for (var i = 0; i < circuit.getNumberOfMesh(); i++){
            for (var j = i; j < circuit.getNumberOfMesh(); j++){
                if (i === j){
                    this.circuitResistanceMatrix.subset(math.index(i, j),circuit.getMeshes()[i].getMeshResistance());
                } else {
                    for (var k = 0; k < circuit.getMeshes()[j].getBranches().length; k++){
                        if (circuit.getMeshes()[j].getBranches()[k].getCommon() > circuit.getMeshes()[j].getMeshNumber()){
                            if ((circuit.getMeshes()[j].getBranches()[k].getCommon()-circuit.getMeshes()[j].getMeshNumber()) === circuit.getMeshes()[i].getMeshNumber()){
                                this.circuitResistanceMatrix.subset(math.index(i, j),(circuit.getMeshes()[j].getBranches()[k].getBranchResistance()*-1));
                            }
                        }
                    }   
                    this.circuitResistanceMatrix.subset(math.index(j, i),this.circuitResistanceMatrix.subset(math.index(i, j)));
                }
            }
        }
    }
    public setCommonBranches(commonBranch: Branch): void{
        this.commonBranches.push(commonBranch);
    }
    public getCircuit(): Circuit {
        return this.circuit;
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
    public randomIntNumber(max: number, min: number): number {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
    public randomBoolean(): boolean {
        if ((Math.floor(Math.random() * 2) + 1) === 1) {
            return false;
        } else {
            return true;
        }
    }
    public copyCommonElement(element: CircuitElements): CircuitElements{
        var circuitelement: CircuitElements;
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
    public calculateResultingResistance(circuit: Circuit):void {
        var cloneCurrentVector : math.MathType = math.clone(this.circuitCurrentVector);
        var cloneVoltageVector: math.Matrix = math.clone(this.circuitVoltageVector);
        var cloneCircuit: Circuit = circuit.cloneCircuit(this.circuit);
        for (var i = 0; i < cloneCircuit.getNumberOfMesh(); i++){
            if (cloneCircuit.getMeshes()[i].getMeshVoltage() !== 0){
                cloneCircuit.getMeshes()[i].cloneMeshVoltage(0);
            }
            for (var j = 0; j < cloneCircuit.getMeshes()[i].getBranches().length; j++){
                if (cloneCircuit.getMeshes()[i].getBranches()[j].getTh2Pole()){
                    cloneCircuit.getMeshes()[i].cloneMeshVoltage(10);
                    this.setCircuitVoltageVector(cloneCircuit);
                    this.setCircuitCurrentVector(cloneCircuit);
                    var tempCircuitVector = this.circuitCurrentVector.valueOf();
                    this.circuitResultingResistance = +this.circuitVoltageVector.subset(math.index(i,0))/tempCircuitVector[i];
                    this.circuitVoltageVector = math.clone(cloneVoltageVector);
                    this.circuitCurrentVector = math.clone(cloneCurrentVector);
                }
            }
        }
    }
    public finalCalculateOfTheveninSubstitues(circuit: Circuit): void {
        circuit.setThevRes(this.circuitResultingResistance);
        for (var i = 0; i < circuit.getNumberOfMesh(); i++){
            for (var j = 0; j < circuit.getMeshes()[i].getBranches().length; j++){
                if (circuit.getMeshes()[i].getBranches()[j].getTh2Pole()){
                    var tempCircuitVector = this.circuitCurrentVector.valueOf();
                    console.log(tempCircuitVector.valueOf()[i]);
                    console.log(circuit.getThevRes());
                    circuit.setThevVolt(circuit.getThevRes()*tempCircuitVector.valueOf()[i]);
                    console.log(circuit.getThevVolt());
                }
            }

        }
    }
}
