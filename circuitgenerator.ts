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
    //private circuitInverzResistanceMatrix: math.MathType;
    private circuitResultingResistance: number = 0;
    private commonBranches: Branch[] = [];
    private args: number[] = [];
    private questionOrVoltmeterResistance: number ;
    private questionOrVoltmeterResistanceCurrent: number;
    private questionOrVoltmeterResistanceVoltage: number;

    private connectedVoltagesourceValue: number;
    private connectedVoltagesourceInsideResistance: number;
    private outpuVoltageWithconnectedVoltagesource: number;
    /*private th2PoleMeshNumber: number;
    private th2PoleBranchType: number;
    private th2PoleNumberOfBranch: number;
    private commonAndTh2Pole: number;*/
    public counter = 0;
    /**
     * Aramkor generalasaert felelos. Meghivja a halozat analizalasahoz szukseges fuggvenyeket.
     * Eredmenyul pedig megadja az altala generalt halozat thevenin helyettesiteset
     * @param type aramkor tipusa adott struktura alapjan 
     */
    public generateCircuit(type: number/*mesh: number, res: number, cur: number, volt: number, comm: number*/): void {
        //let parameters: number[] = this.circuitParameterLimits(type);
        this.circuit = this.buildFinalCircuit(new Circuit(this.circuitParameterLimits(type)),type);
        /*switch (type) {
            //Egyszeru feszultsegoszto
            case 1: {
                //this.circuit = new Circuit(2, 2, 0, 1, 1);
                this.circuit = new Circuit(this.circuitParameterLimits(type));
                for (let h = 0; h < this.circuit.getNumberOfMesh(); h++) {
                    this.circuit.setMeshes(new Mesh());
                    
                    //A 4 iranynak megfelelo branch-ek letrehozasa a mesh-en belul
                    for (let i = 0; i < 4; i++){
                        this.circuit.getMeshes()[h].setBranches(new Branch(i,h));
                    }
                }
                this.circuit.getMeshes()[0].getBranches()[1].setBranchElements(new Resistance(this.randomE6Resistance()));
                //this.circuit.getMeshes()[0].getBranches()[0].setBranchElements(new Resistance(2));
                //this.circuit.getMeshes()[0].getBranches()[1].setBranchElements(new Resistance(3));
                //this.circuit.getMeshes()[0].getBranches()[2].setBranchElements(new Resistance(8));
                //this.circuit.getMeshes()[0].getBranches()[2].setBranchElements(new Resistance(this.randomE6Resistance()));
                //this.circuit.getMeshes()[0].getBranches()[2].setBranchElements(new Resistance(18));
                this.circuit.getMeshes()[0].getBranches()[0].setBranchElements(new VoltageSource(this.randomIntNumber(1,24),this.randomBoolean()));
                //this.circuit.getMeshes()[0].getBranches()[0].setBranchElements(new VoltageSource(120,false));
                this.circuit.getMeshes()[0].getBranches()[2].setBranchElements(new Resistance(this.randomE6Resistance()));
                //this.circuit.getMeshes()[1].getBranches()[1].setBranchElements(new VoltageSource(90,true));
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
                this.finalCalculateOfTheveninSubstitutes(this.circuit);
                //let cloneCircuit: Circuit = this.circuit.cloneCircuit(this.circuit);
                ////console.log(cloneCircuit);
                //cloneCircuit.getMeshes().splice(1,1);
                //console.log(this.counter);
                break;
            }
            
        }*/
        this.finalCalculateOfTheveninSubstitutes(this.circuit);
    }
    //TESZTHEZ KELL CSAK EZ A METODUS
    public generateCircuit2(type: number){
        let parameters: number[] = [5,2,0,1,1];
        this.circuit = this.buildFinalCircuit2(new Circuit(parameters),type);
        this.finalCalculateOfTheveninSubstitutes(this.circuit);
    }
    /**
     * A parameternek megfeleloen megad egy olyan tombot, ami a halozat generalasahoz
     * szukseges hurkok, elemek, kozos agak darabszamat tartalmazza.
     * parameters = [[hurkok maximalis szama],
     *               [ellenallasok maximalis szama],
     *               [aramgeneratorok maximalis szama],
     *               [feszultseggeneratorok maximalis szama],
     *               [kozos agak maximalis szama]] Egyelore nem hasznalt.
     * @param type ez a parameter reprezentalja a halozat 'nehezsegi' szintjet
     */
    public circuitParameterLimits(type: number): number[]{
        //let parameters = new Array(5);
        let parameters: number[] = [];
        switch (type){
            //Egyszeru feszoszto, csak feszgennel
            case 1: {
                parameters = [this.randomIntNumber(2,2),
                              this.randomIntNumber(5,2),
                              this.randomIntNumber(0,0),
                              this.randomIntNumber(1,1),
                              this.randomIntNumber(2,2)];
                break;
            }
            //Egyszeru 2 hurkos halozat (feszoszto), 1-nel tobb generatorral
            case 2: {
                parameters = [this.randomIntNumber(2,2),
                              this.randomIntNumber(5,2),
                              this.randomIntNumber(0,0),
                              this.randomIntNumber(2,2),
                              this.randomIntNumber(2,2)];
                break;
            }
            case 3: {
                parameters = [this.randomIntNumber(2,2),
                              this.randomIntNumber(6,2),
                              this.randomIntNumber(0,0),
                              this.randomIntNumber(2,2),
                              this.randomIntNumber(2,2)];
                break;
            }
            case 4: {
                break;
            }
            case 5: {
                break;
            }
            case 6: {
                break;
            }
            case 7: {
                break;
            }
        }
        return parameters;
    }
    public buildFinalCircuit(circuit: Circuit, type: number): Circuit{
        let circParam: Object = circuit.getParameters();
        let meshPieceArray: number[] = [];
        //let connectBranches: number[] = [];
        let commonBranchPairs: number[][] = [[0,2], //balrol csatlakozo
                                             [1,3], //fentrol
                                             [2,0], //jobbrol
                                             [3,1]  //lentrol
                                            ];
        let numberOfMeshes = circuit.getNumberOfMesh();
        for (let h = 0; h < circuit.getNumberOfMesh(); h++) {
            circuit.setMeshes(new Mesh());
            for (let i = 0; i < 4; i++){
                circuit.getMeshes()[h].setBranches(new Branch(i,h));
            }
        }
        for (let h = 1; h <= circParam[0]; h++){
            meshPieceArray.push(h);
        } 
        console.log('START - meshPieceArray: '+meshPieceArray);
        //console.log(typeof(meshPieceArray));
        for (let h = 1; h <= numberOfMeshes; h++){

            this.removeElementInAnyArray(h,meshPieceArray);
            console.log('FOR - meshPieceArray: '+meshPieceArray+ ',for: '+h);
            //console.log(meshPieceArray);
            let tempBranchPairs: number[] = [];
            let connectBranches: number[] = [];
            let choiseMeshNumber: number;
            let randomCommonBranchPair: number[] = [];
            if ((type === 1 || type === 2) && h < numberOfMeshes) {
                console.log('IF-1');
                choiseMeshNumber = this.randomChoiseInAnyArray(meshPieceArray);
                randomCommonBranchPair = this.randomChoiseTwoAnything([1,3],[2,0]);
                //randomCommonBranchPair = this.randomChoiseInAnyArray(commonBranchPairs);
                console.log(choiseMeshNumber);
                //this.removeElementInAnyArray(choiseMeshNumber,meshPieceArray);
                connectBranches.push(randomCommonBranchPair[0],randomCommonBranchPair[1],choiseMeshNumber,h);
                circuit.getMeshes()[h-1].setCommonBranchesArray(connectBranches);
                console.log( circuit.getMeshes()[h-1].getCommonBranchesArray());
                this.addConnectedBranchFromCommmonBranchesArrayElement(circuit,h,choiseMeshNumber);
                console.log('Ellenallasok szama: '+ circParam[1]);
            } else {
                let tempPieceArray: number[] = meshPieceArray.slice();
                console.log('tempPieceArray: '+tempPieceArray);
                let randomFor: number = this.randomIntNumber(tempPieceArray.length,1)
                console.log('randomFor: '+randomFor);
                for (let i = 0; i < randomFor; i++){
                    console.log('For: '+i);
                    console.log('circuit.getMeshes()[h-1].getCommonBranchesArray(): '+circuit.getMeshes()[h-1].getCommonBranchesArray());
                    for (let j = 0; j < circuit.getMeshes()[h-1].getCommonBranchesArray().length; j++){
                        this.removeElementInAnyArray(circuit.getMeshes()[h-1].getCommonBranchesArray()[j][2],tempPieceArray);
                    }
                    console.log('tempPieceArray - for: '+tempPieceArray);
                    if (this.randomBoolean()){
                        choiseMeshNumber = this.randomChoiseInAnyArray(tempPieceArray);
                    } else {
                        choiseMeshNumber = undefined;
                    }
                    if (choiseMeshNumber !== undefined){
                        console.log('choiseMeshNumber: '+choiseMeshNumber);
                        this.removeElementInAnyArray(choiseMeshNumber,tempPieceArray);
                        
                        randomCommonBranchPair = this.randomChoiseInAnyArray(commonBranchPairs);
                        connectBranches.push(randomCommonBranchPair[0],randomCommonBranchPair[1],choiseMeshNumber,h);
                        console.log('connectBranches - for: '+connectBranches);
                        
                        circuit.getMeshes()[h-1].setCommonBranchesArray(connectBranches);
                        this.addConnectedBranchFromCommmonBranchesArrayElement(circuit,h,choiseMeshNumber);
                    }
                    
                    connectBranches = [];

                }
                if (circuit.getMeshes()[h-1].getCommonBranchesArray().length === 0){
                    choiseMeshNumber = this.randomChoiseInAnyArray(tempPieceArray);
                    randomCommonBranchPair = this.randomChoiseInAnyArray(commonBranchPairs);
                    connectBranches.push(randomCommonBranchPair[0],randomCommonBranchPair[1],choiseMeshNumber,h);
                    circuit.getMeshes()[h-1].setCommonBranchesArray(connectBranches);
                    this.addConnectedBranchFromCommmonBranchesArrayElement(circuit,h,choiseMeshNumber);
                }
            }
            meshPieceArray.push(h);
            
            //console.log(meshPieceArray);
        }
        //console.log(connectBranches);
        console.log();
        this.setCommonBranchesInCircuit(circuit);
        this.setVoltageSourceInCircuit(circuit, type);
        this.setResistanceInCircuit(circuit, type);
        this.setCommonBranchesCloneElement(circuit);
        this.setThevenin2PoleInCircuit(circuit, type);
        
        for (let i = 0; i < circuit.getNumberOfMesh(); i++){
            //this.setCommonBranchesInMesh(circuit, circuit.getMeshes()[i].getCommonBranchesArray());
            console.log(circuit.getMeshes()[i].getCommonBranchesArray());
            console.log(circuit.getMeshes()[i].getBranches());
        }
        for (let i = 0; i < circuit.getNumberOfMesh(); i++){
            for(let j = 0; j < circuit.getMeshes()[i].getBranches().length; j++){
                let mesh : Mesh =  circuit.getMeshes()[i];
                mesh.setMeshVoltage(mesh.getBranches()[j]);
                mesh.setMeshResistance(mesh.getBranches()[j]);
            }
        }
        return circuit;
    }

    public buildFinalCircuit3(circuit: Circuit, type: number): Circuit{
        //let circuit: Circuit;
        
        let circParam: Object = circuit.getParameters();
        let maxMesh: number = 1;
        let commonMeshesAndBranchTypes: number[][] = [];
        console.log('Kozos branch szamlalo: '+circParam[4]);
        //let validBranchIndexes: number[] = [];
        for (let h = 0; h < maxMesh; h++) {
            circuit.setMeshes(new Mesh());
            let actualMeshCommonBranch: number;
            //let copiedCommonBranches: number[] = [];
            let multiplyCommonMesh: boolean = true;//this.randomBoolean();
            let multiplyCommonBranch: boolean = this.randomBoolean();  
            console.log('Tobb kozos ag egy hurokban: '+multiplyCommonMesh);
            console.log('Agon belul tobb kozos ag: '+multiplyCommonBranch);
            let maxBranch: number = 4;
            if (multiplyCommonBranch && multiplyCommonMesh && circParam[4] > 1){
                console.log('IF - 1');
                //teljesen random a max branch, ami csak a kozos agak erteketol fugg, akar az osszes kozos ag is lehet az elso hurokban.
                //maxBranch = this.randomIntNumber((circParam[4] > 0 ? 4+circParam[4]-1 : 4),4); 
                //kontrolalva van, hogy max mennyi branch objektum lehet egy meshben
                do {
                    maxBranch = this.randomIntNumber((circParam[4] > 0 ? 4+circParam[4]-1 : 4),4); 
                    console.log('maxBranch: '+maxBranch);
                } while (maxBranch > 6);
            }
            console.log('MAXBRANCH: '+maxBranch);
            let otherEqBranchType: number;
            let otherMeshCounter: number;
            console.log(circuit.getMeshes()[h]);
            //console.log(commonMeshesAndBranchTypes[0]);
            if (commonMeshesAndBranchTypes[0] !== undefined){
                otherMeshCounter = commonMeshesAndBranchTypes[commonMeshesAndBranchTypes.length-1][0];
                console.log('IF - 2');
            } else {
                otherMeshCounter = circuit.getMeshes()[h].getMeshNumber();
                console.log('IF - 3');

            }
            
            //console.log(otherMeshCounter);
            let equalDirectionBranches: number[] = [];
            //Elso meshnel kell csak
            let copiedCommonBranches: number[] = [];
            
            for (let i = 0; i < maxBranch; i++){
                let randomBranch: number;
                if (i > 3){
                    console.log('IF - 4');
                    //otherEqBranchType = (i < 4 ? i : this.randomIntNumber(3,0));
                    //otherEqBranchType = this.randomIntNumber(3,0);
                    /*if (otherEqBranchType === actualMeshCommonBranch){
                        otherEqBranchType = (i < 4 ? i : this.randomIntNumber(3,0));
                    }*/
                    randomBranch = this.randomIntNumber(3,0);
                    circuit.getMeshes()[h].getBranches().splice(randomBranch+1,0,new Branch(randomBranch,h));
                    equalDirectionBranches.push(randomBranch);
                    //circuit.getMeshes()[h].setBranches(new Branch(this.randomIntNumber(3,0),h));
                } else {
                    console.log('IF - 5');
                    circuit.getMeshes()[h].setBranches(new Branch(i,h));
                }
                
            }
            console.log('equalDirectionBranches: '+equalDirectionBranches);
            if (commonMeshesAndBranchTypes[0] !== undefined){
                console.log('IF - 6');
                console.log('EZ MAR TUTI A 2 kor');
                for (let i = 0; i < commonMeshesAndBranchTypes.length; i++){
                    if (commonMeshesAndBranchTypes[i][0] === circuit.getMeshes()[h].getMeshNumber()){
                        console.log('IF - 7');
                        switch (commonMeshesAndBranchTypes[i][1]){
                            case 0: {
                                actualMeshCommonBranch = 2;
                                break;
                            }
                            case 1: {
                                actualMeshCommonBranch = 3;
                                break;
                            }
                            case 2: {
                                actualMeshCommonBranch = 0;
                                break;
                            }
                            case 3: {
                                actualMeshCommonBranch = 1;
                                break;
                            }
                        }
                        for (let j = 0; j < circuit.getMeshes()[h].getBranches().length; j++){
                            if (circuit.getMeshes()[h].getBranches()[j].getType() === actualMeshCommonBranch) {
                                console.log('IF - 8');
                                console.log('actualMeshCommonBranch: '+actualMeshCommonBranch);
                                copiedCommonBranches.push(j);
                                circuit.getMeshes()[h].getBranches()[j].setCommon(commonMeshesAndBranchTypes[i][3]);
                            }
                        }
                        console.log('Masolt Kozos brancek indexei: '+copiedCommonBranches);
                        if (commonMeshesAndBranchTypes[i+1] === undefined) {
                            commonMeshesAndBranchTypes.splice(i,1);
                        }
                        //commonMeshesAndBranchTypes.splice(i,1);
                    }
                    console.log('commonMeshesAndBranchTypes-1: '+commonMeshesAndBranchTypes);
                    if (commonMeshesAndBranchTypes[i+1] !== undefined) {
                        console.log('IF - 8.1');
                        let commonMeshes: number[] = [];
                        for (let i = 0; i < commonMeshesAndBranchTypes.length; i++){
                            if (i !== commonMeshesAndBranchTypes.length-1){
                                if (commonMeshesAndBranchTypes[i+1][0]-commonMeshesAndBranchTypes[i][0] === 1 && commonMeshesAndBranchTypes[i][1] === commonMeshesAndBranchTypes[i+1][1]){
                                    commonMeshes.push(commonMeshesAndBranchTypes[i][0]);
                                }
                            }else {
                                if (commonMeshesAndBranchTypes[i][0] - commonMeshes[commonMeshes.length-1] === 1) {
                                    commonMeshes.push(commonMeshesAndBranchTypes[i][0]);
                                } 
                            }
                            
                        }
                        console.log('commonMeshes: '+commonMeshes);
                        if (commonMeshesAndBranchTypes[i+1][0]-commonMeshesAndBranchTypes[i][0] === 1){
                            console.log('IF - 8.2');
                            if (commonMeshesAndBranchTypes[i][1] === commonMeshesAndBranchTypes[i+1][1]){
                                console.log('IF - 8.3');
                                if (commonMeshesAndBranchTypes[i][1] === 0){
                                    console.log('IF - 8.4');
                                    for (let j = 0; j < circuit.getMeshes()[h-1].getBranches().length; j++){

                                    }
                                }
                                if (commonMeshesAndBranchTypes[i][1] === 1){
                                    console.log('IF - 8.7');
                                    for (let j = 0; j < circuit.getMeshes()[h].getBranches().length; j++){
                                        if (circuit.getMeshes()[h].getBranches()[j].getType() === 1 && j%2 === 0) {
                                            console.log('IF - 8.8');
                                            copiedCommonBranches.push(j);
                                            circuit.getMeshes()[h].getBranches()[j].setCommon(commonMeshesAndBranchTypes[i+1][0]);
                                        }
                                        if (circuit.getMeshes()[h].getBranches()[j].getType() === 3 && j%2 !== 0) {
                                            console.log('IF - 8.9');
                                            copiedCommonBranches.push(j);
                                            circuit.getMeshes()[h].getBranches()[j].setCommon(commonMeshesAndBranchTypes[i][0]);
                                        }
                                    }
                                }
                                if (commonMeshesAndBranchTypes[i][1] === 2){
                                    console.log('IF - 8.10');
                                    for (let j = 0; j < circuit.getMeshes()[h].getBranches().length; j++){
                                        if (circuit.getMeshes()[h].getBranches()[j].getType() === 3 && j%2 === 0) {
                                            console.log('IF - 8.11');
                                            copiedCommonBranches.push(j);
                                            circuit.getMeshes()[h].getBranches()[j].setCommon(commonMeshesAndBranchTypes[i+1][0]);
                                        }
                                        if (circuit.getMeshes()[h].getBranches()[j].getType() === 1 && j%2 !== 0) {
                                            console.log('IF - 8.12');
                                            copiedCommonBranches.push(j);
                                            circuit.getMeshes()[h].getBranches()[j].setCommon(commonMeshesAndBranchTypes[i][0]);
                                        }
                                    }
                                }
                                if (commonMeshesAndBranchTypes[i][1] === 3){
                                    console.log('IF - 8.13');
                                    for (let j = 0; j < circuit.getMeshes()[h].getBranches().length; j++){
                                        if (circuit.getMeshes()[h].getBranches()[j].getType() === 0 && j%2 === 0) {
                                            console.log('IF - 8.14');
                                            copiedCommonBranches.push(j);
                                            circuit.getMeshes()[h].getBranches()[j].setCommon(commonMeshesAndBranchTypes[i+1][0]);
                                        }
                                        if (circuit.getMeshes()[h].getBranches()[j].getType() === 2 && j%2 !== 0) {
                                            console.log('IF - 8.15');
                                            copiedCommonBranches.push(j);
                                            circuit.getMeshes()[h].getBranches()[j].setCommon(commonMeshesAndBranchTypes[i][0]);
                                        }
                                    }
                                }
                            }
                        }
                        //commonMeshesAndBranchTypes.splice(i,1);
                    }
                    
                }
            } 
            console.log('copiedCommonBranches a mesh elejen');
            console.log(copiedCommonBranches);
            if (circParam[4] > 0) {
                //if (otherEqBranchType !== undefined){
                /*let validBranchIndexes: number[] = [];
                if (h > 0) {
                    for (let j = 0; j < circuit.getMeshes()[h].getBranches().length; j++){
                        for (let k = 0; k < copiedCommonBranches.length; k++){
                            if (copiedCommonBranches[k] !== j){
                                validBranchIndexes.push(j);
                            }
                        }
                    }
                }*/
                console.log('IF - 9');
                if (circuit.getMeshes()[h].getBranches().length > 4){
                    console.log('IF - 10');
                    let trueCount: number = 0;
                    let meshAndBranchType: number[];
                    let validBranchIndexes: number[] = [];
                    let randomBranch: number;
                    for (let i = 0; i < circuit.getMeshes()[h].getBranches().length; i++){
                        //if (otherEqBranchType === circuit.getMeshes()[h].getBranches()[i].getType()){
                        //if (equalDirectionBranches[0] !== undefined){ //Ez mindig igaz, ha 4-nel nagyobb a Branches tomb, tehat felesleges
                        if (h === 0 && circParam[4] > 0){
                            console.log('IF - 11');
                            for (let j = 0; j < equalDirectionBranches.length; j++){
                                if (circuit.getMeshes()[h].getBranches()[i].getType() === equalDirectionBranches[j] && circParam[4] > 0){
                                    console.log('IF - 12');
                                    otherMeshCounter++;
                                    circuit.getMeshes()[h].getBranches()[i].setCommon(otherMeshCounter);
                                    meshAndBranchType = [otherMeshCounter,circuit.getMeshes()[h].getBranches()[i].getType(),i,h+1];
                                    commonMeshesAndBranchTypes.push(meshAndBranchType);
                                    circParam[4]--;
                                    maxMesh++;
                                }
                            }
                        } else if (circParam[4] > 0){
                            console.log('IF - 13');
                            otherMeshCounter++;
                            for (let j = 0; j < circuit.getMeshes()[h].getBranches().length; j++){
                                for (let k = 0; k < copiedCommonBranches.length; k++){
                                    if (copiedCommonBranches[k] !== j){
                                        console.log('IF - 14');
                                        validBranchIndexes.push(j);
                                    }
                                }
                            }
                            randomBranch = validBranchIndexes[Math.floor(Math.random() * validBranchIndexes.length)];
                            meshAndBranchType = [otherMeshCounter,circuit.getMeshes()[h].getBranches()[randomBranch].getType(),randomBranch,h+1];
                            circuit.getMeshes()[h].getBranches()[i].setCommon(otherMeshCounter);
                            commonMeshesAndBranchTypes.push(meshAndBranchType);
                            circParam[4]--;
                            maxMesh++;
                        }
                        //} 
                        /*else {
                            if (this.randomBoolean()){
                                console.log('TRUE');
                                trueCount++;
                                //otherMeshCounter++;
                                if (h > 0){
                                    
                                    for (let j = 0; j < copiedCommonBranches.length; j++){
                                        if (circParam[4] > 0 && copiedCommonBranches[j] !== i ){
                                            //console.log(meshAndBranchType);
                                            otherMeshCounter++;
                                            meshAndBranchType = [otherMeshCounter,circuit.getMeshes()[h].getBranches()[i].getType(),i,h+1];
                                            circuit.getMeshes()[h].getBranches()[i].setCommon(otherMeshCounter);
                                            commonMeshesAndBranchTypes.push(meshAndBranchType);
                                            circParam[4]--;
                                            maxMesh++;
                                        }
                                    }   
                                } else {
                                    if (circParam[4] > 0){
                                        otherMeshCounter++;
                                        meshAndBranchType = [otherMeshCounter,circuit.getMeshes()[h].getBranches()[i].getType(),i,h+1];
                                        circuit.getMeshes()[h].getBranches()[i].setCommon(otherMeshCounter);
                                        commonMeshesAndBranchTypes.push(meshAndBranchType);
                                        circParam[4]--;
                                        maxMesh++;
                                    }
                                }
                                console.log('Kozos branch szamlalo: '+circParam[4]);
                            }
                        }*/
                    }
                    console.log('KOZOS TOMB, HA A BRANCH HOSSZABB 4-NEL ES VOLT TRUE A CIKLUSBAN: '+commonMeshesAndBranchTypes);

                    //if (trueCount === 0 || meshAndBranchType === undefined){
                    otherMeshCounter++;
                    //let randomBranch: number;
                    let noBranchMatch: boolean = false;
                    
                    if (h > 0 && circParam[4] > 0){
                        console.log('IF - 15');
                        for (let j = 0; j < circuit.getMeshes()[h].getBranches().length; j++){
                            for (let k = 0; k < copiedCommonBranches.length; k++){
                                if (copiedCommonBranches[k] !== j){
                                    console.log('IF - 16');
                                    validBranchIndexes.push(j);
                                }
                            }
                        }
                        randomBranch = validBranchIndexes[Math.floor(Math.random() * validBranchIndexes.length)];
                        console.log('randomBranch-1: '+randomBranch);
                        console.log('validBranchIndexes-1: '+validBranchIndexes);
                        console.log(validBranchIndexes);
                        console.log('copiedCommonBranches-1: '+copiedCommonBranches);
                        console.log(copiedCommonBranches);
                        /*do {
                            randomBranch = this.randomIntNumber(circuit.getMeshes()[h].getBranches().length-1,0);
                            console.log('randombranch1: '+randomBranch);
                            if (h > 0){
                                for (let j = 0; j < copiedCommonBranches.length; j++){
                                    if (copiedCommonBranches[j] === randomBranch){
                                        noBranchMatch = true;
                                        break;
                                    }
                                }
                            } 
                        
                        } while (noBranchMatch);*/
                    } else {
                        console.log('IF - 17');
                        for (let j = 0; j < circuit.getMeshes()[h].getBranches().length; j++){
                                if (circuit.getMeshes()[h].getBranches()[j].getCommon() === circuit.getMeshes()[h].getMeshNumber()){
                                    console.log('IF - 17.4');
                                    validBranchIndexes.push(j);
                                }
                            
                        }
                        randomBranch = validBranchIndexes[Math.floor(Math.random() * validBranchIndexes.length)];
                        console.log('randomBranch-1.5: '+randomBranch);
                    }
                    if (circParam[4] > 0){
                        console.log('IF - 17.5');

                        //let randomBranch: number = this.randomIntNumber(circuit.getMeshes()[h].getBranches().length-1,0);
                        meshAndBranchType = [otherMeshCounter,circuit.getMeshes()[h].getBranches()[randomBranch].getType(),randomBranch,h+1]
                        circuit.getMeshes()[h].getBranches()[randomBranch].setCommon(otherMeshCounter);
                        commonMeshesAndBranchTypes.push(meshAndBranchType);
                        circParam[4]--;
                        console.log('Kozos branch szamlalo: '+circParam[4]);
                        maxMesh++;
                        console.log('KOZOS TOMB, HA A BRANCH HOSSZABB 4-NEL ES NEM VOLT TRUE A CIKLUSBAN: '+commonMeshesAndBranchTypes);
                    }
                    
                    //}
                    
                    //console.log(commonMeshesAndBranchTypes);

                    //console.log(otherMeshCounter);
                } else {
                    console.log('IF - 18');
                    if (multiplyCommonMesh){
                        console.log('IF - 19');
                        let meshAndBranchType: number[];
                        let trueCount: number = 0;
                        let validBranchIndexes: number[] = [];
                        for (let i =0; i < circuit.getMeshes()[h].getBranches().length; i++){
                            if (this.randomBoolean()){
                                console.log('IF - 20');
                                trueCount++;
                                //otherMeshCounter++;
                                if (h > 0){
                                    console.log('IF - 21');
                                    for (let j = 0; j < copiedCommonBranches.length; j++){
                                        if (circParam[4] > 0 && copiedCommonBranches[j] !== i ){
                                            console.log('IF - 22');
                                            otherMeshCounter++;
                                            meshAndBranchType = [otherMeshCounter,circuit.getMeshes()[h].getBranches()[i].getType(),i,h+1];
                                            circuit.getMeshes()[h].getBranches()[i].setCommon(otherMeshCounter);
                                            commonMeshesAndBranchTypes.push(meshAndBranchType);
                                            circParam[4]--;
                                            maxMesh++;

                                        }
                                    }
                                } else {
                                    console.log('IF - 23');
                                    if (circParam[4] > 0){
                                        console.log('IF - 24');
                                        otherMeshCounter++;
                                        meshAndBranchType = [otherMeshCounter,circuit.getMeshes()[h].getBranches()[i].getType(),i,h+1];
                                        circuit.getMeshes()[h].getBranches()[i].setCommon(otherMeshCounter);
                                        commonMeshesAndBranchTypes.push(meshAndBranchType);
                                        circParam[4]--;
                                        maxMesh++;

                                    }
                                }
                                console.log('Kozos branch szamlalo: '+circParam[4]);
                                console.log('KOZOS TOMB, HA A BRANCH 4 ES VOLT TRUE A CIKLUSBAN: '+commonMeshesAndBranchTypes);
                            }
                        }
                        if (trueCount === 0 || meshAndBranchType === undefined){
                            console.log('IF - 25');
                            otherMeshCounter++;
                            let randomBranch: number;
                            let noBranchMatch: boolean = false;
                            if (h > 0){
                                console.log('IF - 26');
                                
                                for (let j = 0; j < circuit.getMeshes()[h].getBranches().length; j++){
                                    for (let k = 0; k < copiedCommonBranches.length; k++){
                                        if (copiedCommonBranches[k] !== j){
                                            console.log('IF - 27');
                                            validBranchIndexes.push(j);
                                        }
                                    }
                                }
                                randomBranch = validBranchIndexes[Math.floor(Math.random() * validBranchIndexes.length)];
                                console.log('randomBranch-2: '+randomBranch);
                                console.log('validBranchIndexes-2: '+validBranchIndexes);
                                console.log(validBranchIndexes);
                                console.log('copiedCommonBranches-2: '+copiedCommonBranches);
                                console.log(copiedCommonBranches);
                                /*do {
                                    randomBranch = this.randomIntNumber(circuit.getMeshes()[h].getBranches().length-1,0);
                                    console.log('randombranch2: '+randomBranch);
                                    if (h > 0){
                                        for (let j = 0; j < copiedCommonBranches.length; j++){
                                            if (copiedCommonBranches[j] === randomBranch){
                                                noBranchMatch = true;
                                                break;
                                            }
                                        }
                                    }
                                } while (noBranchMatch);*/
                            } else {
                                console.log('IF - 28');
                                randomBranch = this.randomIntNumber(circuit.getMeshes()[h].getBranches().length-1,0);
                            }
                            //let randomBranch: number = this.randomIntNumber(circuit.getMeshes()[h].getBranches().length-1,0);
                            meshAndBranchType = [otherMeshCounter,circuit.getMeshes()[h].getBranches()[randomBranch].getType(),randomBranch,h+1]
                            circuit.getMeshes()[h].getBranches()[randomBranch].setCommon(otherMeshCounter);
                            commonMeshesAndBranchTypes.push(meshAndBranchType);
                            circParam[4]--;
                            console.log('Kozos branch szamlalo: '+circParam[4]);
                            maxMesh++;
                            console.log('KOZOS TOMB, HA A BRANCH 4 ES nem VOLT TRUE A CIKLUSBAN: '+commonMeshesAndBranchTypes);
                        }
                    } else {
                        console.log('IF - 29');
                        otherMeshCounter++;
                        let meshAndBranchType: number[];
                        let randomBranch: number;
                        let noBranchMatch: boolean = false;
                        let validBranchIndexes: number[] = [];
                        if (h > 0){
                            console.log('IF - 30');
                            for (let j = 0; j < circuit.getMeshes()[h].getBranches().length; j++){
                                for (let k = 0; k < copiedCommonBranches.length; k++){
                                    if (copiedCommonBranches[k] !== j){
                                        console.log('IF - 31');
                                        validBranchIndexes.push(j);
                                    }
                                }
                            }
                            randomBranch = validBranchIndexes[Math.floor(Math.random() * validBranchIndexes.length)];
                            console.log('randomBranch-3: '+randomBranch);
                            console.log('validBranchIndexes-3: ');
                            console.log(validBranchIndexes);
                            console.log('copiedCommonBranches-3: '+copiedCommonBranches);
                            console.log(copiedCommonBranches);
                            /*do {
                                randomBranch = this.randomIntNumber(circuit.getMeshes()[h].getBranches().length-1,0);
                                console.log('randombranch(do-while): '+randomBranch);
                                if (h > 0){
                                    for (let j = 0; j < copiedCommonBranches.length; j++){
                                        if (copiedCommonBranches[j] === randomBranch){
                                            //console.log('randombranch(do-while): '+randomBranch);
                                            console.log('copiedCommonBranches[j]: '+copiedCommonBranches[j]);

                                            noBranchMatch = true;
                                            break;
                                        } 
                                    }
                                }
                            } while (noBranchMatch);*/
                        } else {
                            console.log('IF - 32');
                            randomBranch = this.randomIntNumber(circuit.getMeshes()[h].getBranches().length-1,0);
                            console.log('randombranch(do-while utan): '+randomBranch);

                        }
                        //let randomBranch: number = this.randomIntNumber(circuit.getMeshes()[h].getBranches().length-1,0);
                        meshAndBranchType = [otherMeshCounter,randomBranch,randomBranch,h+1];
                        //console.log(randomBranch);
                        
                        //console.log(circuit.getMeshes()[h].getBranches()[randomBranch]);
                        circuit.getMeshes()[h].getBranches()[randomBranch].setCommon(otherMeshCounter);
                        commonMeshesAndBranchTypes.push(meshAndBranchType);
                        circParam[4]--;
                        console.log('Kozos branch szamlalo: '+circParam[4]);
                        maxMesh++;
                        console.log('KOZOS TOMB, HA NEM VOLT TOBBSZOROS KOZOS BRANCH A MESHBEN: '+commonMeshesAndBranchTypes);
                        //console.log(commonMeshesAndBranchTypes);
                    }
                }
            //console.log(commonMeshesAndBranchTypes);

            } else {
                console.log('IF - 33');
                console.log('ELFOGYOTT A KOZOS BRANCH');
            }
            //CSAK A TESZTELESHEZ A KIIRATAS MIATT
            for (let i = 0; i < maxBranch; i++){
                console.log(circuit.getMeshes()[h].getBranches()[i]);
            }
        }
        
        //console.log(circuit);
        /*for (let h = 0; h < circuit.getNumberOfMesh(); h++) {
            circuit.setMeshes(new Mesh());
            
            //A 4 iranynak megfelelo branch-ek letrehozasa a mesh-en belul
            for (let i = 0; i < 4; i++){
                circuit.getMeshes()[h].setBranches(new Branch(i,h));
            }
        }
        circuit.getMeshes()[0].getBranches()[1].setBranchElements(new Resistance(this.randomE6Resistance()));
        circuit.getMeshes()[0].getBranches()[0].setBranchElements(new VoltageSource(this.randomIntNumber(1,24),this.randomBoolean()));
        circuit.getMeshes()[0].getBranches()[2].setBranchElements(new Resistance(this.randomE6Resistance()));
        circuit.getMeshes()[0].getBranches()[2].setCommon(2);
        circuit.getMeshes()[1].getBranches()[0].setCommon(1);
        circuit.getMeshes()[1].getBranches()[0].setBranchElements(this.copyCommonElement(circuit.getMeshes()[0].getBranches()[2].getBranchElements()[0]));
        circuit.getMeshes()[1].getBranches()[2].setTh2Pole(true);
        for (let i = 0; i < circuit.getMeshes().length; i++){
            for(let j = 0; j < circuit.getMeshes()[i].getBranches().length; j++){
                let mesh : Mesh =  circuit.getMeshes()[i];
                mesh.setMeshVoltage(mesh.getBranches()[j]);
                mesh.setMeshResistance(mesh.getBranches()[j]);
            }
        }*/
        console.log(commonMeshesAndBranchTypes);
        return circuit;
    }
    //TESZTHEZ!!!!!!
    public buildFinalCircuit2(circuit: Circuit, type: number): Circuit{
        for (let h = 0; h < circuit.getNumberOfMesh(); h++) {
            circuit.setMeshes(new Mesh());
            
            //A 4 iranynak megfelelo branch-ek letrehozasa a mesh-en belul
            for (let i = 0; i < 4; i++){
                circuit.getMeshes()[h].setBranches(new Branch(i,h));
            }
        }
        /*circuit.getMeshes()[0].getBranches().splice(2,0,new Branch(2,0));
        circuit.getMeshes()[3].getBranches().splice(0,0,new Branch(0,3));
        circuit.getMeshes()[3].getBranches().splice(0,0,new Branch(0,3));
        circuit.getMeshes()[4].getBranches().splice(3,0,new Branch(3,4));*/
        circuit.getMeshes()[0].setBranches(new Branch(2,0));
        circuit.getMeshes()[3].setBranches(new Branch(0,3));
        circuit.getMeshes()[3].setBranches(new Branch(0,3));
        circuit.getMeshes()[4].setBranches(new Branch(3,4));

        circuit.getMeshes()[0].getBranches()[2].setCommon(3);
        circuit.getMeshes()[0].getBranches()[3].setCommon(2);
        circuit.getMeshes()[0].getBranches()[1].setCommon(5);

        circuit.getMeshes()[1].getBranches()[0].setCommon(1);
        circuit.getMeshes()[1].getBranches()[1].setCommon(3);
        circuit.getMeshes()[1].getBranches()[2].setCommon(4);

        circuit.getMeshes()[2].getBranches()[0].setCommon(1);
        circuit.getMeshes()[2].getBranches()[1].setCommon(5);
        circuit.getMeshes()[2].getBranches()[2].setCommon(4);
        circuit.getMeshes()[2].getBranches()[3].setCommon(2);

        circuit.getMeshes()[3].getBranches()[0].setCommon(2);
        circuit.getMeshes()[3].getBranches()[1].setCommon(3);
        circuit.getMeshes()[3].getBranches()[2].setCommon(5);

        circuit.getMeshes()[4].getBranches()[2].setCommon(4);
        circuit.getMeshes()[4].getBranches()[3].setCommon(3);
        circuit.getMeshes()[4].getBranches()[4].setCommon(1);
        
        circuit.getMeshes()[0].getBranches()[0].setBranchElements(new VoltageSource(5,false));
        circuit.getMeshes()[0].getBranches()[0].setBranchElements(new Resistance(10));
        circuit.getMeshes()[0].getBranches()[1].setBranchElements(new Resistance(20));
        circuit.getMeshes()[0].getBranches()[2].setBranchElements(new VoltageSource(15,true));
        circuit.getMeshes()[0].getBranches()[3].setBranchElements(new Resistance(80));

        circuit.getMeshes()[1].getBranches()[0].setBranchElements(this.copyCommonElement(circuit.getMeshes()[0].getBranches()[3].getBranchElements()[0]));
        circuit.getMeshes()[1].getBranches()[1].setBranchElements(new Resistance(70));
        circuit.getMeshes()[1].getBranches()[2].setBranchElements(new VoltageSource(25,true));

        circuit.getMeshes()[2].getBranches()[0].setBranchElements(this.copyCommonElement(circuit.getMeshes()[0].getBranches()[2].getBranchElements()[0]));
        circuit.getMeshes()[2].getBranches()[1].setBranchElements(new Resistance(50));
        circuit.getMeshes()[2].getBranches()[2].setBranchElements(new Resistance(60));
        circuit.getMeshes()[2].getBranches()[3].setBranchElements(this.copyCommonElement(circuit.getMeshes()[1].getBranches()[1].getBranchElements()[0]));

        circuit.getMeshes()[3].getBranches()[0].setBranchElements(this.copyCommonElement(circuit.getMeshes()[1].getBranches()[2].getBranchElements()[0]));
        circuit.getMeshes()[3].getBranches()[1].setBranchElements(this.copyCommonElement(circuit.getMeshes()[2].getBranches()[2].getBranchElements()[0]));
        circuit.getMeshes()[3].getBranches()[2].setBranchElements(new Resistance(40));
        circuit.getMeshes()[3].getBranches()[4].setTh2Pole(true);

        circuit.getMeshes()[4].getBranches()[1].setBranchElements(new VoltageSource(10,false));
        circuit.getMeshes()[4].getBranches()[1].setBranchElements(new Resistance(30));
        circuit.getMeshes()[4].getBranches()[2].setBranchElements(this.copyCommonElement(circuit.getMeshes()[3].getBranches()[2].getBranchElements()[0]));
        circuit.getMeshes()[4].getBranches()[3].setBranchElements(this.copyCommonElement(circuit.getMeshes()[2].getBranches()[1].getBranchElements()[0]));
        circuit.getMeshes()[4].getBranches()[4].setBranchElements(this.copyCommonElement(circuit.getMeshes()[0].getBranches()[1].getBranchElements()[0]));
        for (let i = 0; i < circuit.getMeshes().length; i++){
            for(let j = 0; j < circuit.getMeshes()[i].getBranches().length; j++){
                let mesh : Mesh =  circuit.getMeshes()[i];
                mesh.setMeshVoltage(mesh.getBranches()[j]);
                mesh.setMeshResistance(mesh.getBranches()[j]);
            }
        }
        //console.log(commonMeshesAndBranchTypes);
        return circuit;
    }
    public meshGenerator(circui: Circuit): Mesh{
        return;
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
        let connectedCircuit: Circuit = new Circuit(this.circuitParameterLimits(1));
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
     * 
     * @param max 
     * @param min 
     */
    public randomIntNumber(max: number, min: number): number {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
    /**
     * 
     * @param max 
     * @param min 
     */
    public randomFloatNumber(max: number, min: number): number {
        return +(Math.random() * (max - min) + min).toFixed(2);
    }
    /**
     * 
     */
    public randomBoolean(): boolean {
        if ((Math.floor(Math.random() * 2) + 1) === 1) {
            return false;
        } else {
            return true;
        }
    }
    /**
     * 
     */
    public randomVoltageSourceValue(): number {
        return this.randomIntNumber(24, 1);
    }
    /**
     * 
     */
    public randomCurrentSourceValue(): number {
        return this.randomFloatNumber(1.40,0.01);
    }
    /**
     * Az E6-os ellenallas sorhoz tartozo ellenallas ertekek random generalasa,
     * 1K, 10K es 100K ertekekhez
     */
    public randomE6Resistance():number{
        let resistance: number[]=[1000,10000,100000];
        let e6base: number[] = [1,1.5,2.2,3.3,4.7,6.8];
        return e6base[this.randomIntNumber(5,0)]*resistance[this.randomIntNumber(2,0)];
    }
    public randomIncrementOrDecrement():number{
        let number: number;
        if ((Math.floor(Math.random() * 2) + 1) === 1) {
            number = 1;
        } else {
            number = (3-4);
        }
        return number;
    }

    public randomChangeXorYcooordinate():number{
        if ((Math.floor(Math.random() * 2) + 1) === 1) {
            return 1; //Y kordinata
        } else {
            return 0; //X kordinata
        }
    }
    public randomChoiseTwoNumber(one: number, two: number):number{
        if ((Math.floor(Math.random() * 2) + 1) === 1) {
            return one;
        } else {
            return two;
        }
    }
    public randomChoiseTwoAnything(one: any, two: any):any{
        if ((Math.floor(Math.random() * 2) + 1) === 1) {
            return one;
        } else {
            return two;
        }
    }
    
    public randomCoordinateArryElement(array: number[][]): number[]{
        let result: number[];
        result = array[Math.floor(Math.random() * array.length)];
        return result;
    }

    public randomChoiseInAnyArray(array: any): any{
        let result: any;
        result = array[Math.floor(Math.random()*array.length)]
        return result;
    }
    public removeElementInAnyArray(element: any, array: any): any{
        for (let i = 0; i < array.length; i++){
            if (JSON.stringify(element) === JSON.stringify(array[i])){
                array.splice(i,1);
            }
        }
        return array;
    }
    public wichBiger(num1: number, num2: number): number{
        if (num1 >= num2){
            return num1;
        } else {
            return num2;
        }
    }
    public addConnectedBranchFromCommmonBranchesArrayElement(circuit: Circuit, baseMesNumb: number, connectedMeshNumb: number, meshPieces?: number[]): void{
        for (let i = 0; i < circuit.getMeshes()[baseMesNumb-1].getCommonBranchesArray().length; i++){
            if (circuit.getMeshes()[baseMesNumb-1].getCommonBranchesArray()[i][2] === connectedMeshNumb){
                if (circuit.getMeshes()[connectedMeshNumb-1].getCommonBranchesArray().length > 0){
                    let existconnectedMeshNumb: boolean = false;
                    for (let j = 0; j < circuit.getMeshes()[connectedMeshNumb-1].getCommonBranchesArray().length; j++){
                        if (circuit.getMeshes()[connectedMeshNumb-1].getCommonBranchesArray()[j][2] === baseMesNumb){
                            existconnectedMeshNumb = true;
                            break;
                        }
                    }
                    if (!existconnectedMeshNumb){
                        circuit.getMeshes()[connectedMeshNumb-1].setCommonBranchesArray([circuit.getMeshes()[baseMesNumb-1].getCommonBranchesArray()[i][1],circuit.getMeshes()[baseMesNumb-1].getCommonBranchesArray()[i][0],baseMesNumb,connectedMeshNumb]);
                    }
                } else {
                    circuit.getMeshes()[connectedMeshNumb-1].setCommonBranchesArray([circuit.getMeshes()[baseMesNumb-1].getCommonBranchesArray()[i][1],circuit.getMeshes()[baseMesNumb-1].getCommonBranchesArray()[i][0],baseMesNumb,connectedMeshNumb]);
                }
           }
        }
    }
    /**
     * Az adott hurokhoz tartozo kozossegi ertekeket tartalmazo tomb alapjan, hozzaadja a hurokhoz a megfelelo
     * kozossegi ertekkel rendelkezo ag objektumokat az ag tipusanak megfelelo helyre. Tehat, ha 2-es tipusu ag objektum a kozossegi, 
     * akkor az 1-es tipusu ag utan illeszti be. Ha tobb ugyan olyan is van, mindig a legutolso lesz a kisebbik indexen a branch tombben.
     * @param circuit aramkor objektum, amin dolgozik
     * @param commonBranchesArray a hurokhoz tartozo kozossegi ertekek parametereit tartalmazo tomb
     */
    public setCommonBranchesInMesh(circuit: Circuit, commonBranchesArray: number[][]): void {
        for (let h = 0; h < commonBranchesArray.length; h++){
            console.log('h:' +h);
            for (let i = 0; i < circuit.getMeshes()[commonBranchesArray[h][3]-1].getBranches().length; i++){
                console.log('i:' +i);
                if (circuit.getMeshes()[commonBranchesArray[h][3]-1].getBranches()[i].getType() === commonBranchesArray[h][0]){
                    console.log('IF - 99');
                    console.log('Az egyezo tipusu branch: '+circuit.getMeshes()[commonBranchesArray[h][3]-1].getBranches()[i].getType());
                    let tempBranch: Branch = new Branch(commonBranchesArray[h][0],commonBranchesArray[h][3]-1);
                    tempBranch.setCommon(commonBranchesArray[h][2]);
                    circuit.getMeshes()[commonBranchesArray[h][3]-1].getBranches().splice(i,0,tempBranch);
                    break;
                }
            }
            /*let tempBranch: Branch = new Branch(commonBranchesArray[h][0],commonBranchesArray[h][3]-1);
            tempBranch.setCommon(commonBranchesArray[h][2]);
            circuit.getMeshes()[commonBranchesArray[h][3]-1].setBranches(tempBranch);*/
        }
        /**
         * A kozos branch tipusanak megfelelo, nem beallitott branch torlese.
         */
        //console.log(commonBranchesArray);
        //console.log(circuit.getMeshes()[commonBranchesArray[0][3]-1]);
        for (let i = 0; i < circuit.getMeshes()[commonBranchesArray[0][3]-1].getBranches().length; i++){
            if (i > 0){
                console.log('IF - 100');
                if (circuit.getMeshes()[commonBranchesArray[0][3]-1].getBranches()[i].getType() === circuit.getMeshes()[commonBranchesArray[0][3]-1].getBranches()[i-1].getType()){
                    console.log('IF - 101');
                    if (i < circuit.getMeshes()[commonBranchesArray[0][3]-1].getBranches().length-1 && (circuit.getMeshes()[commonBranchesArray[0][3]-1].getBranches()[i].getType() !== circuit.getMeshes()[commonBranchesArray[0][3]-1].getBranches()[i+1].getType())){
                        console.log('IF - 102');
                        circuit.getMeshes()[commonBranchesArray[0][3]-1].getBranches().splice(i,1);
                    } else
                    if (i === circuit.getMeshes()[commonBranchesArray[0][3]-1].getBranches().length-1){
                        console.log('IF - 103');
                        circuit.getMeshes()[commonBranchesArray[0][3]-1].getBranches().splice(i,1);
                    }
                }

            }
        }
    }
    /**
     * Beallitja a szukseges kozossegi ertekeket az egesz halozatban.
     * @param circuit aramkor objektum
     */
    public setCommonBranchesInCircuit(circuit: Circuit): void{
        for (let i = 0; i < circuit.getNumberOfMesh(); i++){
            this.setCommonBranchesInMesh(circuit,circuit.getMeshes()[i].getCommonBranchesArray());
        }
    }
    /**
     * Ellenallasok elhelyezeseert felelos.
     * @param circuit 
     * @param type 
     */
    public setResistanceInCircuit(circuit: Circuit, type: number): void{
        let circuitResistanceNumber: number = circuit.getParameters()[1];
        
        switch (type){
            case 1: {
                console.log('RES 1');
                if (circuit.getMeshes()[0].getCommonBranchesArray()[0][0] === 1){
                    console.log('RES 1 - 1');
                    circuit.getMeshes()[0].getBranches()[0].setBranchElements(new Resistance(this.randomE6Resistance()));
                    circuitResistanceNumber--;
                    circuit.getMeshes()[0].getBranches()[1].setBranchElements(new Resistance(this.randomE6Resistance()));
                    circuitResistanceNumber--;
                    if (this.randomBoolean()){
                        console.log('RES 1 - 2');
                        circuit.getMeshes()[0].getBranches()[2].setBranchElements(new Resistance(this.randomE6Resistance()));
                        circuitResistanceNumber--;
                    }
                } else {
                    console.log('RES 1 - 3');
                    if (this.randomBoolean()){
                        console.log('RES 1 - 4');
                        circuit.getMeshes()[0].getBranches()[0].setBranchElements(new Resistance(this.randomE6Resistance()));
                        circuitResistanceNumber--;
                    }
                    circuit.getMeshes()[0].getBranches()[1].setBranchElements(new Resistance(this.randomE6Resistance()));
                    circuitResistanceNumber--;
                    circuit.getMeshes()[0].getBranches()[2].setBranchElements(new Resistance(this.randomE6Resistance()));
                    circuitResistanceNumber--;
                }
                if (circuitResistanceNumber > 0){
                    console.log('RES 1 - 5');
                    for (let i = 0; i < circuitResistanceNumber; i++){
                        circuit.getMeshes()[0].getBranches()[this.randomChoiseTwoNumber(1,2)].setBranchElements(new Resistance(this.randomE6Resistance()));
                        circuitResistanceNumber--;
                    }
                }
                //circuit.getMeshes()[0].getBranches()[0].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                break;
            }
            case 2: {
                circuit.getMeshes()[0].getBranches()[0].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                for (let i = 0; i < circuit.getMeshes()[0].getBranches().length; i++){
                    if (circuit.getMeshes()[0].getBranches()[i].getType() === circuit.getMeshes()[0].getCommonBranchesArray()[0][0]){
                        circuit.getMeshes()[0].getBranches()[i].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean())); 
                        //circuit.getMeshes()[0].getBranches()[i].setBranchElements(new Resistance(this.randomE6Resistance())); 
                    }
                }
                //circuit.getMeshes()[0].getBranches()[2].setBranchElements(new Resistance(this.randomE6Resistance()));
                //circuit.getMeshes()[0].getBranches()[1].setBranchElements(new Resistance(this.randomE6Resistance()));
                break;
            }
        }
    }
    /**
     * Megfelelo feltelek figyelembe vetelevel hozzaadja az aramkorhoz a feszultseggenerator(oka)t.
     * @param circuit aramkor objektum
     */
    public setVoltageSourceInCircuit(circuit: Circuit, type: number): void{
        switch (type){
            case 1: {
                circuit.getMeshes()[0].getBranches()[0].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                break;
            }
            case 2: {
                circuit.getMeshes()[0].getBranches()[0].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                for (let i = 0; i < circuit.getMeshes()[0].getBranches().length; i++){
                    if (circuit.getMeshes()[0].getBranches()[i].getType() === circuit.getMeshes()[0].getCommonBranchesArray()[0][0]){
                        circuit.getMeshes()[0].getBranches()[i].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean())); 
                        //circuit.getMeshes()[0].getBranches()[i].setBranchElements(new Resistance(this.randomE6Resistance())); 
                    }
                }
                //circuit.getMeshes()[0].getBranches()[2].setBranchElements(new Resistance(this.randomE6Resistance()));
                //circuit.getMeshes()[0].getBranches()[1].setBranchElements(new Resistance(this.randomE6Resistance()));
                break;
            }
        }
    }
    public setThevenin2PoleInCircuit(circuit: Circuit, type: number): void{
        switch (type) {
            case 1: {
                //console.log('1111111111111111111111111111111');
                for (let i = 0; i < circuit.getMeshes()[circuit.getNumberOfMesh()-1].getBranches().length; i++){
                    if (circuit.getMeshes()[circuit.getNumberOfMesh()-1].getBranches()[i].getType() === circuit.getMeshes()[circuit.getNumberOfMesh()-1].getCommonBranchesArray()[0][1]){
                        circuit.getMeshes()[circuit.getNumberOfMesh()-1].getBranches()[i].setTh2Pole(true);
                    }
                }
                break;
            }
            case 2: {
                //console.log('22222222222222222222222222');
                for (let i = 0; i < circuit.getMeshes()[circuit.getNumberOfMesh()-1].getBranches().length; i++){
                    if (circuit.getMeshes()[circuit.getNumberOfMesh()-1].getBranches()[i].getType() === circuit.getMeshes()[circuit.getNumberOfMesh()-1].getCommonBranchesArray()[0][1]){
                        circuit.getMeshes()[circuit.getNumberOfMesh()-1].getBranches()[i].setTh2Pole(true);
                    }
                }
                break;
            }
        }
    }
    /**
     * Az aramkor kozos agaiban elhelyezett aramkori elemek clonozasa a megfelelo kozos branch-be.
     * @param circuit aramkor objektum
     */
    public setCommonBranchesCloneElement(circuit: Circuit): void{
        for (let h = 0; h < circuit.getNumberOfMesh(); h++){
            for (let i = 0; i < circuit.getMeshes()[h].getCommonBranchesArray().length; i++){
                let commonSum: number = circuit.getMeshes()[h].getCommonBranchesArray()[i][2] + circuit.getMeshes()[h].getCommonBranchesArray()[i][3];
                for (let j =0; j < circuit.getMeshes()[h].getBranches().length; j++){
                    if (circuit.getMeshes()[h].getBranches()[j].getType() === circuit.getMeshes()[h].getCommonBranchesArray()[i][0]){
                        if (commonSum === circuit.getMeshes()[h].getBranches()[j].getCommon()){
                            if (circuit.getMeshes()[h].getBranches()[j].getBranchElements()[0] !== undefined){
                                for (let k = 0; k < circuit.getMeshes()[circuit.getMeshes()[h].getCommonBranchesArray()[i][2]-1].getBranches().length; k++){
                                    if (circuit.getMeshes()[circuit.getMeshes()[h].getCommonBranchesArray()[i][2]-1].getBranches()[k].getType() === circuit.getMeshes()[h].getCommonBranchesArray()[i][1]){
                                        if (commonSum === circuit.getMeshes()[circuit.getMeshes()[h].getCommonBranchesArray()[i][2]-1].getBranches()[k].getCommon()){
                                            if (circuit.getMeshes()[circuit.getMeshes()[h].getCommonBranchesArray()[i][2]-1].getBranches()[k].getBranchElements()[0] === undefined){
                                                for (let l = 0; l < circuit.getMeshes()[h].getBranches()[j].getBranchElements().length; l++){
                                                    circuit.getMeshes()[circuit.getMeshes()[h].getCommonBranchesArray()[i][2]-1].getBranches()[k].setBranchElements(this.copyCommonElement(circuit.getMeshes()[h].getBranches()[j].getBranchElements()[l]));
                                                }
                                            }
                                        }
                                    }
                                }
                                //if (circuit.getMeshes()[circuit.getMeshes()[h].getCommonBranchesArray()[h][3]].)
                            } else {
                                for (let k = 0; k < circuit.getMeshes()[circuit.getMeshes()[h].getCommonBranchesArray()[i][2]-1].getBranches().length; k++){
                                    if (circuit.getMeshes()[circuit.getMeshes()[h].getCommonBranchesArray()[i][2]-1].getBranches()[k].getType() === circuit.getMeshes()[h].getCommonBranchesArray()[i][1]){
                                        if (commonSum === circuit.getMeshes()[circuit.getMeshes()[h].getCommonBranchesArray()[i][2]-1].getBranches()[k].getCommon()){
                                            if (circuit.getMeshes()[circuit.getMeshes()[h].getCommonBranchesArray()[i][2]-1].getBranches()[k].getBranchElements()[0] !== undefined){
                                                for (let l = 0; l < circuit.getMeshes()[circuit.getMeshes()[h].getCommonBranchesArray()[i][2]-1].getBranches()[j].getBranchElements().length; l++){
                                                    circuit.getMeshes()[h].getBranches()[k].setBranchElements(this.copyCommonElement(circuit.getMeshes()[circuit.getMeshes()[h].getCommonBranchesArray()[i][2]-1].getBranches()[j].getBranchElements()[l]));
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                
            }
        }
    }
    public setCommonBranches(commonBranch: Branch): void{
        this.commonBranches.push(commonBranch);
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
