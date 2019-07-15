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
                //this.calculateVoltageVector(this.circuit);
                //this.setCircuitResistanceMatrix(this.circuit);
                //this.circuitResistanceMatrix = this.calculateResistanceMatrix(this.circuit);
                //this.setCircuitCurrentVector(this.circuit);
                //this.calculateCircuitResultingResistance(this.circuit);
                this.finalCalculateOfTheveninSubstitutes(this.circuit);
                //let cloneCircuit: Circuit = this.circuit.cloneCircuit(this.circuit);
                //console.log(cloneCircuit);
                //cloneCircuit.getMeshes().splice(1,1);
                //console.log(cloneCircuit);
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
                //this.circuitResistanceMatrix = this.calculateResistanceMatrix(this.circuit);
                //this.setCircuitCurrentVector(this.circuit);
                //this.circuitCurrentVector = this.calculateCurrentVector(this.circuit);
                //this.calculateCircuitResultingResistance(this.circuit);
                this.finalCalculateOfTheveninSubstitutes(this.circuit);
                break;
            }
            //Teszt tipus
            case 3: {
                this.circuit = new Circuit(2, 3, 0, 1, 1);
                for (let h = 0; h < this.circuit.getNumberOfMesh(); h++) {
                    this.circuit.setMeshes(new Mesh());
                    for (let i = 0; i < 4; i++){
                        this.circuit.getMeshes()[h].setBranches(new Branch(i,h));
                        
                    }
                }
                this.circuit.getMeshes()[0].getBranches()[0].setBranchElements(new VoltageSource(this.randomIntNumber(5,50),this.randomBoolean()));
                this.circuit.getMeshes()[0].getBranches()[1].setBranchElements(new Resistance(this.randomIntNumber(1,20)));
                this.circuit.getMeshes()[0].getBranches()[2].setCommon(2);
                this.circuit.getMeshes()[1].getBranches()[0].setCommon(1);
                this.circuit.getMeshes()[0].getBranches()[2].setTh2Pole(true);
                //this.circuit.getMeshes()[1].getBranches()[0].setTh2Pole(true);
                this.circuit.getMeshes()[1].getBranches()[1].setBranchElements(new Resistance(this.randomIntNumber(1,20)));
                this.circuit.getMeshes()[1].getBranches()[2].setBranchElements(new Resistance(this.randomIntNumber(1,20)));
                for (let i = 0; i < this.circuit.getMeshes().length; i++){
                    for(let j = 0; j < this.circuit.getMeshes()[i].getBranches().length; j++){
                        let mesh : Mesh =  this.circuit.getMeshes()[i];
                        mesh.setMeshVoltage(mesh.getBranches()[j]);
                        mesh.setMeshResistance(mesh.getBranches()[j]);
                    }
                }
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
    
    public calculateCurrentVector(circuit: Circuit): math.MathType{
        let currentVector: math.MathType = math.matrix();
        currentVector.resize([circuit.getNumberOfMesh(),1]);
        currentVector = math.multiply(math.inv(this.calculateResistanceMatrix(circuit)),this.calculateVoltageVector(circuit));
        return currentVector;
    }
    public calculateVoltageVector(circuit: Circuit): math.Matrix {
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
    public calculateResistanceMatrix(circuit: Circuit): math.Matrix {
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
     * Meghatarozza az aramkor eredo ellenallasat a keresett 2 polus felol egy seged feszultseggenerator segitsegevel.
     * Szukseges a megfelelo objektumok klonozasa, mert maskeppen csak referenciaval dolgozna a rendszer, ami miatt 
     * az eddig kiszamolt ertekek felulirodnanak.
     * @param circuit aramkor objektumot var
     *
    public calculateCircuitResultingResistance(circuit: Circuit): void {
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
                    this.circuitResultingResistance = +this.calculateVoltageVector(circuit).subset(math.index(i,0))/tempCircuitVector[i];
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
    public calculateCircuitResultingResistance(circuit: Circuit): number {
        //let resultingResistance: number;
        let th2PoleMeshNumber: number;
        let th2PoleBranchType: number;
        let th2PoleNumberOfBranch: number;
        //let commonMeshesNumber: number;
        let commonAndTh2Pole: number;
        let th2PoleCounter: number = 0;
        let cloneCircuit: Circuit = circuit.cloneCircuit(this.circuit);
        
        for (let i = 0; i < cloneCircuit.getNumberOfMesh(); i++){
            if (cloneCircuit.getMeshes()[i].getMeshVoltage() !== 0){
                cloneCircuit.getMeshes()[i].clearMeshVoltage();
            }
            for (let j = 0; j < cloneCircuit.getMeshes()[i].getBranches().length; j++){
                if (cloneCircuit.getMeshes()[i].getBranches()[j].getTh2Pole()){
                    //th2PoleCounter++;
                    if (cloneCircuit.getMeshes()[i].getBranches()[j].getCommon() > cloneCircuit.getMeshes()[i].getMeshNumber()){
                        commonAndTh2Pole = cloneCircuit.getMeshes()[i].getBranches()[j].getCommon();
                    }
                    th2PoleBranchType = cloneCircuit.getMeshes()[i].getBranches()[j].getType();
                    th2PoleNumberOfBranch = j;
                    th2PoleMeshNumber = cloneCircuit.getMeshes()[i].getMeshNumber();
                   
                    /*cloneCircuit.getMeshes()[i].getBranches().splice(j,1,new Branch(th2PoleBranchType,i));
                    //cloneCircuit.getMeshes()[i].setBranches(new Branch(th2PoleBranchType,i));
                    cloneCircuit.getMeshes()[i].getBranches()[j].setBranchElements(new VoltageSource(10,false));
                    let mesh : Mesh =  cloneCircuit.getMeshes()[i];
                    mesh.setMeshVoltage(mesh.getBranches()[j]);*/
                    //th2PoleMeshesNumber += i;
                }
            }
        }
        if (commonAndTh2Pole === undefined){
            cloneCircuit.getMeshes()[th2PoleMeshNumber-1].getBranches().splice(th2PoleNumberOfBranch,1,new Branch(th2PoleBranchType,th2PoleMeshNumber-1));
            //cloneCircuit.getMeshes()[i].setBranches(new Branch(th2PoleBranchType,i));
            cloneCircuit.getMeshes()[th2PoleMeshNumber-1].getBranches()[th2PoleNumberOfBranch].setBranchElements(new VoltageSource(10,false));
            let mesh : Mesh =  cloneCircuit.getMeshes()[th2PoleMeshNumber-1];
            mesh.setMeshVoltage(mesh.getBranches()[th2PoleNumberOfBranch]);
        } else {
            //if (th2PoleBranchType === 2 || th2PoleBranchType === 0){
                cloneCircuit.getMeshes()[th2PoleMeshNumber-1].getBranches().splice(th2PoleNumberOfBranch,1,new Branch(th2PoleBranchType,th2PoleMeshNumber-1));
                cloneCircuit.getMeshes()[th2PoleMeshNumber-1].getBranches()[th2PoleNumberOfBranch].setBranchElements(new VoltageSource(10,false));
                let mesh : Mesh =  cloneCircuit.getMeshes()[th2PoleMeshNumber-1];
                mesh.setMeshVoltage(mesh.getBranches()[th2PoleNumberOfBranch]);
                for (let i = 0; i < cloneCircuit.getMeshes()[(commonAndTh2Pole - th2PoleMeshNumber)-1].getBranches().length; i++){
                    if (cloneCircuit.getMeshes()[(commonAndTh2Pole - th2PoleMeshNumber)-1].getBranches()[i].getCommon() === commonAndTh2Pole) {
                        cloneCircuit.getMeshes()[(commonAndTh2Pole - th2PoleMeshNumber)-1].getBranches()[i].setBranchElements(this.copyCommonElement(cloneCircuit.getMeshes()[th2PoleMeshNumber-1].getBranches()[th2PoleNumberOfBranch].getBranchElements()[0]));
                        let mesh : Mesh =  cloneCircuit.getMeshes()[(commonAndTh2Pole - th2PoleMeshNumber)-1];
                        mesh.setMeshVoltage(mesh.getBranches()[i]);
                    }
                }
            //}
            //if (th2PoleBranchType === 1 || th2PoleBranchType === 3){

            //}
        }
        console.log(cloneCircuit.getMeshes()[th2PoleMeshNumber-1].getMeshVoltage());
        console.log(cloneCircuit.getMeshes()[th2PoleMeshNumber-1].getBranches());
        console.log(cloneCircuit.getMeshes()[(commonAndTh2Pole - th2PoleMeshNumber)-1].getMeshVoltage());
        console.log(cloneCircuit.getMeshes()[(commonAndTh2Pole - th2PoleMeshNumber)-1].getBranches());
        //let tempCircuitVector = this.calculateCurrentVector(cloneCircuit).valueOf();
        //resultingResistance = +this.calculateVoltageVector(cloneCircuit).subset(math.index(th2PoleMeshNumber,0))/this.calculateCurrentVector(cloneCircuit).valueOf()[th2PoleMeshNumber];
        //return resultingResistance;
        console.log('Volatage vektor: '+this.calculateVoltageVector(cloneCircuit));
        console.log('Current vektor eredo ellenallashoz: '+this.calculateCurrentVector(cloneCircuit));
        console.log('Eredo ellenallas: '+this.calculateResultingResistance(10,(this.calculateCurrentVector(cloneCircuit).valueOf()[th2PoleMeshNumber-1]-this.calculateCurrentVector(cloneCircuit).valueOf()[th2PoleMeshNumber])));
        //return this.calculateResultingResistance(+this.calculateVoltageVector(cloneCircuit).subset(math.index(th2PoleMeshNumber-1,0)),this.calculateCurrentVector(cloneCircuit).valueOf()[th2PoleMeshNumber-1]);
        return this.calculateResultingResistance(10,(this.calculateCurrentVector(cloneCircuit).valueOf()[th2PoleMeshNumber-1]-this.calculateCurrentVector(cloneCircuit).valueOf()[th2PoleMeshNumber]));
        
        //return 0;
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
        circuit.setThevRes(this.calculateCircuitResultingResistance(circuit));
        for (let i = 0; i < circuit.getNumberOfMesh(); i++){
            for (let j = 0; j < circuit.getMeshes()[i].getBranches().length; j++){
                if (circuit.getMeshes()[i].getBranches()[j].getTh2Pole()){
                    th2PoleMeshNumber = i;
                    //let tempCircuitVector = this.circuitCurrentVector.valueOf();
                    //circuit.setThevVolt(circuit.getThevRes()*tempCircuitVector.valueOf()[i]);
                }
            }
        }
        console.log('Current vektor vegso szamitasnal: '+this.calculateCurrentVector(circuit));
        circuit.setThevVolt(circuit.getThevRes()*this.calculateCurrentVector(circuit).valueOf()[th2PoleMeshNumber]);
    }
    /**
     * Eredo ellenallas szamolasahoz metodus.
     * @param voltage 
     * @param current 
     */
    public calculateResultingResistance(voltage: number, current: number):number{
        return voltage/current;
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
