import { CircuitElements } from "./interfaceCircElement";
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
    private circuitCurrentVector: math.Matrix;
    private circuitVoltageVector: math.Matrix;
    private circuitResistanceMatrix: math.Matrix;

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
                this.circuit.getMeshes()[0].getBranches()[1].setBranchElements(new Resistance(this.randomIntNumber(0,15)));
                this.circuit.getMeshes()[0].getBranches()[2].setBranchElements(new Resistance(this.randomIntNumber(0,15)));
                this.circuit.getMeshes()[0].getBranches()[0].setBranchElements(new VoltageSource(this.randomIntNumber(10,50),this.randomBoolean()));
                this.circuit.getMeshes()[0].getBranches()[2].setCommon(1);
                this.circuit.getMeshes()[1].getBranches()[0].setCommon(0);
                this.circuit.getMeshes()[1].getBranches()[0].setBranchElements(this.circuit.getMeshes()[0].getBranches()[2].getBranchElements()[0]);
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
                break;
            }
        }
    }

    /*public setCircuitCurrentVector(resistMatrix: math.Matrix, voltageVektor: math.Matrix): void{
        this.circuitCurrentVector = math.matrix();
        var res: Array<Number>;
        res = math.multiply(math.inv(this.circuitResistanceMatrix),this.circuitVoltageVector);
        this.circuitCurrentVector.resize([circuit.getNumberOfMesh(),1]);
        for (var i = 0; i < circuit.getNumberOfMesh(); i++){
            this.circuitCurrentVector.subset(math.index(i, 0),circuit.getMeshes()[i].getMesCurrent());
        }
    }*/
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
            this.circuitResistanceMatrix.subset(math.index(i, i),circuit.getMeshes()[i].getMeshResistance());
            this.circuitResistanceMatrix.subset(math.index(i, (circuit.getNumberOfMesh()-1)-i),(circuit.getMeshes()[i].getMeshResistance()*-1));
            /*for (var j = 0; j < circuit.getNumberOfMesh(); j++){
                this.circuitResistanceMatrix.subset(math.index(i, j),circuit.getMeshes()[j].getMeshResistance()*-1);
               // this.circuitResistanceMatrix.subset(math.index(circuit.getMeshes().length-i, j),circuit.getMeshes()[i].getMeshResistance());
            }*/
        }
    }
    public getCircuit(): Circuit {
        return this.circuit;
    }
    public getCircuitCurrentVector(): math.Matrix{
        return this.circuitCurrentVector;
    }
    public getCircuitVoltageVector(): math.Matrix{
        return this.circuitVoltageVector;
    }
    public getCircuitResistanceMatrix(): math.Matrix{
        return this.circuitResistanceMatrix;
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



}
