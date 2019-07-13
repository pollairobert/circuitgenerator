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
                for (let h = 0; h < this.circuit.getNumberOfMesh(); h++) {
                    this.circuit.setMeshes(new Mesh());

                    //A 4 iranynak megfelelo branch-ek letrehozasa a mesh-en belul
                    for (let i = 0; i < 4; i++){
                        this.circuit.getMeshes()[h].setBranches(new Branch(i,h));
                    }
                }
                this.circuit.getMeshes()[0].getBranches()[1].setBranchElements(new Resistance(this.randomIntNumber(1,20)));
                this.circuit.getMeshes()[0].getBranches()[2].setBranchElements(new Resistance(this.randomIntNumber(1,20)));
                this.circuit.getMeshes()[0].getBranches()[0].setBranchElements(new VoltageSource(this.randomIntNumber(5,50),this.randomBoolean()));
                //this.circuit.getMeshes()[0].getBranches()[2].setBranchElements(new VoltageSource(this.randomIntNumber(5,50),this.randomBoolean()));
                this.circuit.getMeshes()[0].getBranches()[2].setCommon(2);
                this.circuit.getMeshes()[1].getBranches()[0].setCommon(1);
                this.circuit.getMeshes()[1].getBranches()[0].setBranchElements(this.copyCommonElement(this.circuit.getMeshes()[0].getBranches()[2].getBranchElements()[0]));
                //this.circuit.getMeshes()[1].getBranches()[0].setBranchElements(this.copyCommonElement(this.circuit.getMeshes()[0].getBranches()[2].getBranchElements()[1]));
                this.circuit.getMeshes()[1].getBranches()[2].setTh2Pole(true);
                for (let i = 0; i < this.circuit.getMeshes().length; i++){
                    for(let j = 0; j < this.circuit.getMeshes()[i].getBranches().length; j++){
                        let mesh : Mesh =  this.circuit.getMeshes()[i];
                        mesh.setMeshVoltage(mesh.getBranches()[j]);
                        mesh.setMeshResistance(mesh.getBranches()[j]);
                    }
                }
                //this.setCircuitVoltageVector(this.circuit);
                //this.setVoltageVector(this.circuit);
                //this.setCircuitResistanceMatrix(this.circuit);
                //this.circuitResistanceMatrix = this.setResistanceMatrix(this.circuit);
                //this.setCircuitCurrentVector(this.circuit);
                //this.calculateResultingResistance(this.circuit);
                this.finalCalculateOfTheveninSubstitutes(this.circuit);
                break;
            }
            //Kettos feszultsegoszto
            case 2: {
                this.circuit = new Circuit(3, 4, 0, 1, 2);
                for (let h = 0; h < this.circuit.getNumberOfMesh(); h++) {
                    this.circuit.setMeshes(new Mesh());
                    for (let i = 0; i < 4; i++){
                        this.circuit.getMeshes()[h].setBranches(new Branch(i,h));
                        
                    }
                }
                
                this.circuit.getMeshes()[0].getBranches()[1].setBranchElements(new Resistance(this.randomIntNumber(1,20)));
                this.circuit.getMeshes()[0].getBranches()[2].setBranchElements(new Resistance(this.randomIntNumber(1,20)));
                this.circuit.getMeshes()[1].getBranches()[1].setBranchElements(new Resistance(this.randomIntNumber(1,20)));
                this.circuit.getMeshes()[1].getBranches()[2].setBranchElements(new Resistance(this.randomIntNumber(1,20)));
                this.circuit.getMeshes()[0].getBranches()[0].setBranchElements(new VoltageSource(this.randomIntNumber(5,50),this.randomBoolean()));
                this.circuit.getMeshes()[0].getBranches()[2].setBranchElements(new VoltageSource(this.randomIntNumber(5,50),this.randomBoolean()));//2. feszgen
                this.circuit.getMeshes()[1].getBranches()[2].setBranchElements(new VoltageSource(this.randomIntNumber(5,50),this.randomBoolean()));//3. feszgen
                //this.circuit.getMeshes()[2].getBranches()[1].setBranchElements(new Resistance(this.randomIntNumber(1,20)));
                //this.circuit.getMeshes()[2].getBranches()[2].setBranchElements(new Resistance(3));
                this.circuit.getMeshes()[0].getBranches()[2].setCommon(2);
                this.circuit.getMeshes()[1].getBranches()[0].setCommon(1);
                this.circuit.getMeshes()[1].getBranches()[2].setCommon(3);
                this.circuit.getMeshes()[2].getBranches()[0].setCommon(2);
                this.circuit.getMeshes()[1].getBranches()[0].setBranchElements(this.copyCommonElement(this.circuit.getMeshes()[0].getBranches()[2].getBranchElements()[0]));
                this.circuit.getMeshes()[1].getBranches()[0].setBranchElements(this.copyCommonElement(this.circuit.getMeshes()[0].getBranches()[2].getBranchElements()[1]));//2.feszgen
                this.circuit.getMeshes()[2].getBranches()[0].setBranchElements(this.copyCommonElement(this.circuit.getMeshes()[1].getBranches()[2].getBranchElements()[0]));
                this.circuit.getMeshes()[2].getBranches()[0].setBranchElements(this.copyCommonElement(this.circuit.getMeshes()[1].getBranches()[2].getBranchElements()[1]));//3.feszgen
                this.circuit.getMeshes()[2].getBranches()[2].setTh2Pole(true);
                for (let i = 0; i < this.circuit.getMeshes().length; i++){
                    for(let j = 0; j < this.circuit.getMeshes()[i].getBranches().length; j++){
                        let mesh : Mesh =  this.circuit.getMeshes()[i];
                        mesh.setMeshVoltage(mesh.getBranches()[j]);
                        mesh.setMeshResistance(mesh.getBranches()[j]);
                    }
                }
                //this.setCircuitVoltageVector(this.circuit);
                
                //this.setCircuitResistanceMatrix(this.circuit);
                //this.circuitResistanceMatrix = this.setResistanceMatrix(this.circuit);
                //this.setCircuitCurrentVector(this.circuit);
                //this.circuitCurrentVector = this.setCurrentVector(this.circuit);
                //this.calculateResultingResistance(this.circuit);
                this.finalCalculateOfTheveninSubstitutes(this.circuit);
                break;
            }
        }
    }
    /*
    public setCircuitCurrentVector(circuit: Circuit): void{
        this.circuitCurrentVector = math.matrix();
        this.circuitCurrentVector.resize([circuit.getNumberOfMesh(),1]);
        this.circuitCurrentVector = math.multiply(math.inv(this.circuitResistanceMatrix),this.circuitVoltageVector);
    }
    public setCircuitVoltageVector(circuit: Circuit): void{
        this.circuitVoltageVector = math.matrix();
        this.circuitVoltageVector.resize([circuit.getNumberOfMesh(),1]);
        for (let i = 0; i < circuit.getNumberOfMesh(); i++){
            this.circuitVoltageVector.subset(math.index(i, 0),circuit.getMeshes()[i].getMeshVoltage());
        }
    }
    */
    
    public setCurrentVector(circuit: Circuit): math.MathType{
        let currentVector: math.MathType = math.matrix();
        currentVector.resize([circuit.getNumberOfMesh(),1]);
        currentVector = math.multiply(math.inv(this.setResistanceMatrix(circuit)),this.setVoltageVector(circuit));
        return currentVector;
    }
    public setVoltageVector(circuit: Circuit): math.Matrix {
        let voltageVector = math.matrix();
        voltageVector.resize([circuit.getNumberOfMesh(),1]);
        for (let i = 0; i < circuit.getNumberOfMesh(); i++){
            voltageVector.subset(math.index(i, 0),circuit.getMeshes()[i].getMeshVoltage());
        }
        return voltageVector;
    }

    /**
     * Feltolti a modellhez szukseges ellenallas-matrixot, ami egy negyzete es szimmetrikus matrix lesz.
     * @param circuit aramkor objektumot var
     *
    public setCircuitResistanceMatrix(circuit: Circuit): void {
        this.circuitResistanceMatrix = math.matrix();
        this.circuitResistanceMatrix.resize([circuit.getNumberOfMesh(),circuit.getNumberOfMesh()]);
        for (let i = 0; i < circuit.getNumberOfMesh(); i++){
            for (let j = i; j < circuit.getNumberOfMesh(); j++){
                if (i === j){
                    this.circuitResistanceMatrix.subset(math.index(i, j),circuit.getMeshes()[i].getMeshResistance());
                } else {
                    for (let k = 0; k < circuit.getMeshes()[j].getBranches().length; k++){
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
    */
    /**
     * A parameterben megadott aramkor objektum ellenallas-matrixat allitja elo.
     * Altalanos metodus, ami barmelyik halozathoz hasznalhato
     * @param circuit aramkor objektumot var
     */
    public setResistanceMatrix(circuit: Circuit): math.Matrix {
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
        return resistanceMatrix;
    }
    
    /**
     * Meghatarozza az aramkor eredo ellenallasat a keresett 2 polus felol egy seged feszultseggenerator segitsegevel.
     * Szukseges a megfelelo objektumok klonozasa, mert maskeppen csak referenciaval dolgozna a rendszer, ami miatt 
     * az eddig kiszamolt ertekek felulirodnanak.
     * @param circuit aramkor objektumot var
     *
    public calculateResultingResistance(circuit: Circuit): void {
        let cloneCurrentVector : math.MathType = math.clone(this.circuitCurrentVector);
        let cloneVoltageVector: math.Matrix = math.clone(this.circuitVoltageVector);
        let cloneCircuit: Circuit = circuit.cloneCircuit(this.circuit);
        for (let i = 0; i < cloneCircuit.getNumberOfMesh(); i++){
            if (cloneCircuit.getMeshes()[i].getMeshVoltage() !== 0){
                cloneCircuit.getMeshes()[i].cloneMeshVoltage(0);
            }
            for (let j = 0; j < cloneCircuit.getMeshes()[i].getBranches().length; j++){
                if (cloneCircuit.getMeshes()[i].getBranches()[j].getTh2Pole()){
                    cloneCircuit.getMeshes()[i].cloneMeshVoltage(10);
                    this.setCircuitVoltageVector(cloneCircuit);
                    this.setCircuitCurrentVector(cloneCircuit);
                    let tempCircuitVector = this.circuitCurrentVector.valueOf();
                    //this.circuitResultingResistance = +this.circuitVoltageVector.subset(math.index(i,0))/tempCircuitVector[i];
                    this.circuitResultingResistance = +this.setVoltageVector(circuit).subset(math.index(i,0))/tempCircuitVector[i];
                    this.circuitVoltageVector = math.clone(cloneVoltageVector);
                    this.circuitCurrentVector = math.clone(cloneCurrentVector);
                }
            }
        }
    }*/
    /**
     * Meghatarozza a parameterul kapott aramkor eredo ellenallasat a keresett 2 polus felol egy seged feszultseggenerator segitsegevel.
     * Szukseges a megfelelo objektumok klonozasa, mert maskeppen csak referenciaval dolgozna a rendszer, ami miatt 
     * az eddig kiszamolt ertekek felulirodnanak.
     * @param circuit aramkor objektumot var
     */
    public calculateResultingResistance(circuit: Circuit): number {
        let resultingResistance: number;
        let th2PoleMeshNumber: number;
        //let cloneCurrentVector : math.MathType = math.clone(this.circuitCurrentVector);
        //let cloneVoltageVector: math.Matrix = math.clone(this.circuitVoltageVector);
        let cloneCircuit: Circuit = circuit.cloneCircuit(this.circuit);
        for (let i = 0; i < cloneCircuit.getNumberOfMesh(); i++){
            if (cloneCircuit.getMeshes()[i].getMeshVoltage() !== 0){
                cloneCircuit.getMeshes()[i].cloneMeshVoltage(0);
            }
            for (let j = 0; j < cloneCircuit.getMeshes()[i].getBranches().length; j++){
                if (cloneCircuit.getMeshes()[i].getBranches()[j].getTh2Pole()){
                    cloneCircuit.getMeshes()[i].cloneMeshVoltage(10);
                    th2PoleMeshNumber = i;
                }
            }
        }
        //let tempCircuitVector = this.setCurrentVector(cloneCircuit).valueOf();
        resultingResistance = +this.setVoltageVector(cloneCircuit).subset(math.index(th2PoleMeshNumber,0))/this.setCurrentVector(cloneCircuit).valueOf()[th2PoleMeshNumber];
        return resultingResistance;
    }
    /**
     * Az aramkor vegso analiziseert felel. 
     * Meghatarozza a halozat Thevenin ellenallasat, majd a keresett 2 polus kozotti rovidzarasi aram segitsegevel
     * meghatarozza a thevenin helyettesito feszultseget a halozatnak.
     * @param circuit aramkor objektumot var
     */
    public finalCalculateOfTheveninSubstitutes(circuit: Circuit): void {
        //circuit.setThevRes(this.circuitResultingResistance);
        let th2PoleMeshNumber: number;
        circuit.setThevRes(this.calculateResultingResistance(circuit));
        for (let i = 0; i < circuit.getNumberOfMesh(); i++){
            for (let j = 0; j < circuit.getMeshes()[i].getBranches().length; j++){
                if (circuit.getMeshes()[i].getBranches()[j].getTh2Pole()){
                    th2PoleMeshNumber = i;
                    //let tempCircuitVector = this.circuitCurrentVector.valueOf();
                    //circuit.setThevVolt(circuit.getThevRes()*tempCircuitVector.valueOf()[i]);
                }
            }

        }
        circuit.setThevVolt(circuit.getThevRes()*this.setCurrentVector(circuit).valueOf()[th2PoleMeshNumber]);
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
}
