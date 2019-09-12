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
import { CircuitAnalyzer } from './circuitanalyzer';

/**
 * Aramkor generalasat lehetove tevo osztaly. 
 */
export class CircuitGenerator {
    private fs = require('fs');
    private circuitCoordinatesToFalstad: string[] = [];
    /**
     * Aramkor generalasaert felelos. 
     * @param type aramkor tipusa adott struktura alapjan 
     */
    public generateCircuit(type: number): Circuit{
        let circuit: Circuit;
        //let parameters: number[] = [2,2,0,1,1];
        circuit = this.buildFinalCircuit(new Circuit(this.circuitParameterLimits(type)),type);
        //circuit = this.buildFinalCircuit2(new Circuit(this.circuitParameterLimits(type)),type);
        //let ca: CircuitAnalyzer = new CircuitAnalyzer();
        //ca.analyzeCircuit(circuit);
        //this.finalCalculateOfTheveninSubstitutes(this.circuit);
       return circuit;
    }
    /**
     * A parameternek megfeleloen megad egy olyan tombot, ami a halozat generalasahoz
     * szukseges hurkok, elemek, kozos agak darabszamat tartalmazza.
     * parameters = [[hurkok maximalis szama],
     *               [ellenallasok maximalis szama],
     *               [aramgeneratorok maximalis szama],
     *               [feszultseggeneratorok maximalis szama],
     * @param type ez a parameter reprezentalja a halozat 'nehezsegi' szintjet
     */
    public circuitParameterLimits(type: number): number[]{
        //let parameters = new Array(5);
        let parameters: number[] = [];
        switch (type){
            //Egyszeru feszoszto, csak feszgennel
            case 1: {
                parameters = [this.randomIntNumber(2,2),
                              this.randomIntNumber(3,2),
                              this.randomIntNumber(0,0),
                              this.randomIntNumber(1,1)];
                break;
            }
            //Egyszeru 2 hurkos halozat (feszoszto), 1-nel tobb generatorral
            case 1.1: {
                parameters = [this.randomIntNumber(2,2),
                              this.randomIntNumber(2,2),
                              this.randomIntNumber(0,0),
                              this.randomIntNumber(2,2)];
                break;
            }
            //Kettos feszoszto egy feszgennel, parhuzamosan egymas utani halozatokkal
            case 2: {
                parameters = [this.randomIntNumber(3,3),
                              this.randomIntNumber(4,4),
                              this.randomIntNumber(0,0),
                              this.randomIntNumber(1,1)];
                break;
            }
            //Kettos feszoszto kicsit mas elrendezesben
            case 2.1: {
                parameters = [this.randomIntNumber(3,3),
                              this.randomIntNumber(5,4),
                              this.randomIntNumber(0,0),
                              this.randomIntNumber(1,1)];
                break;
            }
            //Kettos feszoszto alapra epulo, 2 feszgent tartalmazo aramkor
            case 3: {
                parameters = [this.randomIntNumber(3,3),
                              this.randomIntNumber(5,3),
                              this.randomIntNumber(0,0),
                              this.randomIntNumber(2,2)];
                break;
            }
            //Kettos feszoszto alapra, 3 feszgent tartalmazo aramkor
            case 3.1: {
                parameters = [this.randomIntNumber(3,3),
                              this.randomIntNumber(5,3),
                              this.randomIntNumber(0,0),
                              this.randomIntNumber(3,3)];
                break;
            }
            case 4: {
                parameters = [this.randomIntNumber(15,15),
                              this.randomIntNumber(15,4),
                              this.randomIntNumber(0,0),
                              this.randomIntNumber(12,8)];
                break;
            }
            case 5: {
                parameters = [this.randomIntNumber(3,3),
                              this.randomIntNumber(15,4),
                              this.randomIntNumber(0,0),
                              this.randomIntNumber(2,2)];
                break;
            }
            case 6: {
                parameters = [this.randomIntNumber(3,3),
                              this.randomIntNumber(15,4),
                              this.randomIntNumber(0,0),
                              this.randomIntNumber(2,2)];
                break;
            }
            case 6: {
                break;
            }
        }
        return parameters;
    }
    public buildCircuitSkeleton(circuit: Circuit): void{
        let numberOfMesh: number = circuit.getNumberOfMesh();
        for (let h = 0; h < numberOfMesh; h++) {
            circuit.setMeshes(new Mesh());
            for (let i = 0; i < 4; i++){
                circuit.getMeshes()[h].setBranches(new Branch(i,h));
            }
        }
    }
    public buildFinalCircuit(circuit: Circuit, type: number): Circuit{
        let circParam: Object = circuit.getParameters();

        /**
         * [[sajat branch type, kapcsolodo branch type, sajt meshnumber]]
         */
        let acceptebleCommonBranchArray: number[][] = [];
        let commonBranchPairs: number[][] = [[0,2], //balrol csatlakozo
                                             [1,3], //fentrol
                                             [2,0], //jobbrol
                                             [3,1]  //lentrol
                                            ];
        let numberOfMeshes = circuit.getNumberOfMesh();
        let randomCommonBranchPair: number[] = [];
        this.buildCircuitSkeleton(circuit);

        if (type === 1 || type === 1.1){
            randomCommonBranchPair = this.randomChoiseInAnyArray([[1,3],[2,0],[0,2]]);
        } else if (type === 2 || type === 3 || type === 3.1){
            randomCommonBranchPair = this.randomChoiseInAnyArray([[1,3],[2,0],[0,2]]);
        } else if (type === 2.1){
            randomCommonBranchPair = [1,3];
        } 
        console.log('randomCommonBranchPair: '+randomCommonBranchPair);
        //console.log('START - meshPieceArray: '+meshPieceArray);
        //console.log(typeof(meshPieceArray));
        let multiConnection: boolean = true;
        if (type < 6){
        for (let h = 1; h <= numberOfMeshes; h++){
            
            //this.removeElementInAnyArray(h,meshPieceArray);
            //console.log('FOR - meshPieceArray: '+meshPieceArray+ ',for: '+h);
            //console.log(meshPieceArray);
            //let tempBranchPairs: number[] = [];
            let connectBranches: number[] = [];
            let choiseMeshNumber: number;
            //let multiConnection: boolean;
            let multiBranch: number[];
            //let tempPieceArray: number[] = meshPieceArray.slice();
            ///console.log('tempPieceArray: '+tempPieceArray);
            //let randomFor: number;
            if (type === 1 || type === 1.1 || type === 2 || type === 2.1 || type === 3 || type == 3.1 ){
                //randomFor = 1;
                if (h < numberOfMeshes){
                    choiseMeshNumber = (h+1); 
                    console.log('choiseMeshNumber: '+choiseMeshNumber);
                    //this.removeElementInAnyArray(choiseMeshNumber,tempPieceArray);
                    if (type === 2.1 && h > 1){
                        randomCommonBranchPair = this.randomChoiseTwoAnything([0,2],[2,0]);
                    }
                    connectBranches.push(randomCommonBranchPair[0],randomCommonBranchPair[1],choiseMeshNumber,h);
                    console.log('connectBranches - for: '+connectBranches);
                    
                    circuit.getMeshes()[h-1].setCommonBranchesArray(connectBranches);
                    this.addConnectedBranchFromCommmonBranchesArrayElement(circuit,h,choiseMeshNumber);
                } 
            } else {
                //randomFor = this.randomIntNumber(tempPieceArray.length,1)
            }
            if (type > 3.1 && type <= 5){
                choiseMeshNumber = (h+1);
                for (let i = 0; i < 4; i++) {
                    acceptebleCommonBranchArray.push([commonBranchPairs[i][0],commonBranchPairs[i][1],h]);
                }
                //console.log('acceptebleCommonBranchArray - before: '+acceptebleCommonBranchArray);
                if (h === 1){
                    randomCommonBranchPair = this.randomChoiseInAnyArray(commonBranchPairs);
                    console.log('randomCommonBranchPair a '+h+'. korben: '+randomCommonBranchPair);
                    connectBranches.push(randomCommonBranchPair[0],randomCommonBranchPair[1],choiseMeshNumber,h);
                    circuit.getMeshes()[h-1].setCommonBranchesArray(connectBranches);
                    this.addConnectedBranchFromCommmonBranchesArrayElement(circuit,h,choiseMeshNumber);
                    this.deleteNotAcceptableBranchInArray(circuit, acceptebleCommonBranchArray, h);
                } else if (h < numberOfMeshes){
                    let choiseType: number;
                    //choiseMeshNumber = (h+1);
                    this.deleteNotAcceptableBranchInArray(circuit, acceptebleCommonBranchArray,h);
                    console.log('acceptebleCommonBranchArray a '+h+'. kor elejen: '+acceptebleCommonBranchArray);
                    multiBranch = this.searchMultipleBranchTypeInAcceptableCommonBranchArray(acceptebleCommonBranchArray);
                    console.log('multiBranch a '+h+'. korben: '+multiBranch);
                    multiConnection = this.randomBoolean();
                    //multiConnection = false;
                    console.log('multiConnection a '+h+'. korben: '+multiConnection);
                    if (multiConnection){
                        choiseType = this.randomChoiseInAnyArray(multiBranch);
                        console.log('choiseType a '+h+'. korben: '+choiseType);
                        let choiseTypeCounter: number = this.counterOfChoiseTypeMultibranch(acceptebleCommonBranchArray,choiseType);
                        for (let i = 0; i < choiseTypeCounter; i++){
                            for (let j = 0; j < acceptebleCommonBranchArray.length; j++){
                                if (choiseType === acceptebleCommonBranchArray[j][0]){
                                    connectBranches.push(acceptebleCommonBranchArray[j][0],acceptebleCommonBranchArray[j][1],choiseMeshNumber,acceptebleCommonBranchArray[j][2]);
                                    console.log('connectBranches a '+h+'. korben(multiconnect): '+connectBranches);
                                    circuit.getMeshes()[acceptebleCommonBranchArray[j][2]-1].setCommonBranchesArray(connectBranches);
                                    this.addConnectedBranchFromCommmonBranchesArrayElement(circuit,acceptebleCommonBranchArray[j][2],choiseMeshNumber);
                                    this.deleteNotAcceptableBranchInArray(circuit, acceptebleCommonBranchArray,acceptebleCommonBranchArray[j][2]);
                                    console.log('acceptebleCommonBranchArray a '+h+'. korben, torles utan: '+acceptebleCommonBranchArray);
                                    connectBranches = [];
                                    break;
                                }
                            }
                        }
                        //multiBranch = [];
                        //multiBranch = this.searchMultipleBranchTypeInAcceptableCommonBranchArray(acceptebleCommonBranchArray);
                    } else {
                        let inverz = this.setInverzMultipleBranch(multiBranch);
                        console.log('inverz a '+h+'. korben: '+inverz);
                        choiseType = this.randomChoiseInAnyArray(inverz);
                        console.log('choiseType a '+h+'. korben: '+choiseType);
                        for (let j = 0; j < acceptebleCommonBranchArray.length; j++){
                            if (choiseType === acceptebleCommonBranchArray[j][0]){
                                connectBranches.push(acceptebleCommonBranchArray[j][0],acceptebleCommonBranchArray[j][1],choiseMeshNumber,acceptebleCommonBranchArray[j][2]);
                                console.log('connectBranches a '+h+'. korben(nem multiconnect): '+connectBranches);
                                circuit.getMeshes()[acceptebleCommonBranchArray[j][2]-1].setCommonBranchesArray(connectBranches);
                                this.addConnectedBranchFromCommmonBranchesArrayElement(circuit,acceptebleCommonBranchArray[j][2],choiseMeshNumber);
                                this.deleteNotAcceptableBranchInArray(circuit, acceptebleCommonBranchArray,acceptebleCommonBranchArray[j][2]);
                                console.log('acceptebleCommonBranchArray a '+h+'. korben, torles utan: '+acceptebleCommonBranchArray);
                                connectBranches = [];
                            }
                        }
                        //multiBranch = this.searchMultipleBranchTypeInAcceptableCommonBranchArray(acceptebleCommonBranchArray);
                        //multiBranch = [];
                    }
                    //this.deleteNotAcceptableBranchInArray(circuit, acceptebleCommonBranchArray,h);
                }
                if (h === numberOfMeshes){
                    this.deleteNotAcceptableBranchInArray(circuit, acceptebleCommonBranchArray,h);
                }
                //multiBranch = this.searchMultipleBranchTypeInAcceptableCommonBranchArray(acceptebleCommonBranchArray);
                
                console.log('acceptebleCommonBranchArray a '+h+'. kor vegen: '+acceptebleCommonBranchArray);
                //multiBranch = [];
                //multiBranch = this.searchMultipleBranchTypeInAcceptableCommonBranchArray(acceptebleCommonBranchArray);
                //console.log('multiBranch - vege: '+multiBranch);
                //multiBranch = this.searchMultipleBranchTypeInAcceptableCommonBranchArray(acceptebleCommonBranchArray);
            }
            
            /*for (let i = 0; i < randomFor; i++){
                console.log('For: '+i);
                console.log('circuit.getMeshes()[h-1].getCommonBranchesArray(): '+circuit.getMeshes()[h-1].getCommonBranchesArray());
                for (let j = 0; j < circuit.getMeshes()[h-1].getCommonBranchesArray().length; j++){
                    this.removeElementInAnyArray(circuit.getMeshes()[h-1].getCommonBranchesArray()[j][2],tempPieceArray);
                }
                console.log('tempPieceArray - for: '+tempPieceArray);
                if (type > 3.1){
                    if (h === 1) {
                        choiseMeshNumber = h+1;
                    } else {

                    }
                    if (h === 1){
                        if (this.randomBoolean()){
                            choiseMeshNumber = this.choiseMinimumValueInNumberArray(tempPieceArray);
                            this.removeElementInAnyArray(choiseMeshNumber,tempPieceArray);
                        } else {
                            choiseMeshNumber = undefined;
                        }
                    } else if (this.randomBoolean()){
                        choiseMeshNumber = this.randomChoiseInAnyArray(tempPieceArray);
                    } else {
                        choiseMeshNumber = undefined;
                    }
                }
                if (choiseMeshNumber !== undefined){
                    console.log('choiseMeshNumber: '+choiseMeshNumber);
                    this.removeElementInAnyArray(choiseMeshNumber,tempPieceArray);
                    if (type === 2.1 && h > 1){
                        randomCommonBranchPair = this.randomChoiseTwoAnything([0,2],[2,0]);
                    }
                    connectBranches.push(randomCommonBranchPair[0],randomCommonBranchPair[1],choiseMeshNumber,h);
                    console.log('connectBranches - for: '+connectBranches);
                    
                    circuit.getMeshes()[h-1].setCommonBranchesArray(connectBranches);
                    this.addConnectedBranchFromCommmonBranchesArrayElement(circuit,h,choiseMeshNumber);
                }
                
                connectBranches = [];

            }*/
            /*if (circuit.getMeshes()[h-1].getCommonBranchesArray().length === 0){
                if (h === 1){
                    choiseMeshNumber = this.choiseMinimumValueInNumberArray(tempPieceArray);
                } else {
                    choiseMeshNumber = this.randomChoiseInAnyArray(tempPieceArray);
                }
                connectBranches.push(randomCommonBranchPair[0],randomCommonBranchPair[1],choiseMeshNumber,h);
                circuit.getMeshes()[h-1].setCommonBranchesArray(connectBranches);
                this.addConnectedBranchFromCommmonBranchesArrayElement(circuit,h,choiseMeshNumber);
            }*/

            
            //meshPieceArray.push(h);
            
            //console.log(meshPieceArray);
        }
        }
        console.log('acceptebleCommonBranchArray.length: ' +acceptebleCommonBranchArray.length);

        console.log('acceptebleCommonBranchArray: ' +acceptebleCommonBranchArray);
        //console.log('acceptebleCommonBranchArray: ' +acceptebleCommonBranchArray);
        console.log();
        if (type < 6){
            //this.setThevenin2PoleInCircuit(circuit, type);
            this.setCommonBranchesInCircuit(circuit);
            this.setVoltageSourceInCircuit(circuit, type);
            this.setResistanceInCircuit(circuit, type);
            this.setCommonBranchesCloneElement(circuit);
            this.setThevenin2PoleInCircuit(circuit, type);
        }
        
        /*if (type <= 3.1){
            //this.setVoltageSourceInCircuit(circuit, type);
            this.setResistanceInCircuit(circuit, type);
            this.setCommonBranchesCloneElement(circuit);
            //this.setThevenin2PoleInCircuit(circuit, type);
        }*/
        
        //this.setEmptyBranchInOtherSideOfCommonBranch(circuit);
        
        for (let i = 0; i < circuit.getNumberOfMesh(); i++){
            for(let j = 0; j < circuit.getMeshes()[i].getBranches().length; j++){
                let mesh : Mesh =  circuit.getMeshes()[i];
                mesh.setMeshVoltage(mesh.getBranches()[j]);
                mesh.setMeshResistance(mesh.getBranches()[j]);
                if (mesh.getBranches()[j].getBranchElements()[0] === undefined){
                    mesh.getBranches()[j].setBranchElements(new Wire());
                }
            }
        }
        this.setAllSizeOfCircuit(circuit);
        this.setElementsCoordinate(circuit);
        for (let i = 0; i < circuit.getNumberOfMesh(); i++){
            //this.setCommonBranchesInMesh(circuit, circuit.getMeshes()[i].getCommonBranchesArray());
            console.log(circuit.getMeshes()[i].getCommonBranchesArray());
            /*console.log(circuit.getMeshes()[i].getMeshBranchesSize());
            console.log(circuit.getMeshes()[i].getBranches());
            for (let j = 0; j < circuit.getMeshes()[i].getBranches().length; j++){
                console.log(circuit.getMeshes()[i].getBranches()[j].getBranchElements());
            }*/
        }
        return circuit;
    }

        //TESZTHEZ!!!!!!
    public buildFinalCircuit2(circuit: Circuit, type: number): Circuit{
        for (let h = 0; h < 5; h++) {
            circuit.setMeshes(new Mesh());
            
            //A 4 iranynak megfelelo branch-ek letrehozasa a mesh-en belul
            for (let i = 0; i < 4; i++){
                circuit.getMeshes()[h].setBranches(new Branch(i,h));
            }
        }
        circuit.getMeshes()[0].getBranches().splice(2,0,new Branch(2,0));
        circuit.getMeshes()[3].getBranches().splice(0,0,new Branch(0,3));
        circuit.getMeshes()[3].getBranches().splice(0,0,new Branch(0,3));
        circuit.getMeshes()[4].getBranches().splice(3,0,new Branch(3,4));
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
        /*circuit.getMeshes()[0].getBranches()[0].setBranchElements(new VoltageSource(120,false));
        circuit.getMeshes()[0].getBranches()[0].setBranchElements(new Resistance(2));
        circuit.getMeshes()[0].getBranches()[1].setBranchElements(new Resistance(3));
        circuit.getMeshes()[1].getBranches()[1].setBranchElements(new VoltageSource(90,true));
        circuit.getMeshes()[1].getBranches()[2].setBranchElements(new Resistance(5));
        circuit.getMeshes()[0].getBranches()[2].setCommon(2);
        circuit.getMeshes()[1].getBranches()[0].setCommon(1);*/
        circuit.getMeshes()[0].getBranches()[2].setTh2Pole(true);

        for (let i = 0; i < circuit.getNumberOfMesh(); i++){
            for(let j = 0; j < circuit.getMeshes()[i].getBranches().length; j++){
                let mesh : Mesh =  circuit.getMeshes()[i];
                mesh.setMeshVoltage(mesh.getBranches()[j]);
                mesh.setMeshResistance(mesh.getBranches()[j]);
                if (mesh.getBranches()[j].getBranchElements()[0] === undefined){
                    mesh.getBranches()[j].setBranchElements(new Wire());
                }
            }
        }
        //console.log(commonMeshesAndBranchTypes);
        return circuit;
    }
    
    /**
     * Beallitja az aktualis hurokhoz tartozo eppen aktualis commonBranchesArray elemben szereplo masik hurokban is a megfelelo commonBranchesArray elemet.
     * @param circuit aramkor objektum
     * @param baseMesNumb annak a huroknak a szama amiben generaltunk egy commonBranch elemet a tombbe
     * @param connectedMeshNumb a generalt commonBranch elemben szereplo masik hurok szama, amihez csatlakozik a base
     * @param meshPieces opcionalis, meg nem hasznalt.
     */
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
            /*Ellentetes oldalon is letre hozza a branch-et, hogy szimetrikus legyen a megjeleniteshaz a mesh
            for (let i = 0; i < circuit.getMeshes()[commonBranchesArray[h][3]-1].getBranches().length; i++){
                console.log('i:' +i);
                if (circuit.getMeshes()[commonBranchesArray[h][3]-1].getBranches()[i].getType() === commonBranchesArray[h][1]){
                    console.log('IF - 991');
                    console.log('Az egyezo tipusu branch: '+circuit.getMeshes()[commonBranchesArray[h][3]-1].getBranches()[i].getType());
                    circuit.getMeshes()[commonBranchesArray[h][3]-1].getBranches().splice(i,0,new Branch(commonBranchesArray[h][1],commonBranchesArray[h][3]-1));
                    break;
                }
            }*/
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
     * @param circuit aramkor objektum
     * @param type feladat tipusanak megfelelo szam
     */
    public setResistanceInCircuit(circuit: Circuit, type: number): void{
        let circuitResistanceNumber: number = circuit.getParameters()[1];
        let tempType:  number = type;
        if (type ===3 || type === 3.1){
            tempType = 3;
        }
        if (type === 4 || type === 5){
            tempType = 4;
        } 
        switch (tempType){
            case 1 : {
                console.log('RES 1');
                if (circuit.getMeshes()[0].getCommonBranchesArray()[0][0] === 1){
                    console.log('RES 1 - 1');
                    if (circuit.getMeshes()[0].getBranches()[0].getBranchElements()[0] !== undefined) {
                        circuit.getMeshes()[0].getBranches()[0].setBranchElements(new Resistance(this.randomE6Resistance()));
                        circuitResistanceNumber--;
                        circuit.getMeshes()[0].getBranches()[1].setBranchElements(new Resistance(this.randomE6Resistance()));
                        circuitResistanceNumber--;
                        console.log('circuitResistanceNumber: '+circuitResistanceNumber);
                        if (circuitResistanceNumber > 0){
                            if (this.randomBoolean()){
                                console.log('RES 1 - 2');
                                circuit.getMeshes()[0].getBranches()[1].setBranchElements(new Resistance(this.randomE6Resistance()));
                                circuitResistanceNumber--;
                            }
                        }
                    } else {
                        circuit.getMeshes()[0].getBranches()[2].setBranchElements(new Resistance(this.randomE6Resistance()));
                        circuitResistanceNumber--;
                        circuit.getMeshes()[0].getBranches()[1].setBranchElements(new Resistance(this.randomE6Resistance()));
                        circuitResistanceNumber--;
                        console.log('circuitResistanceNumber: '+circuitResistanceNumber);
                        if (circuitResistanceNumber > 0){
                            if (this.randomBoolean()){
                                console.log('RES 1 - 2');
                                circuit.getMeshes()[0].getBranches()[1].setBranchElements(new Resistance(this.randomE6Resistance()));
                                circuitResistanceNumber--;
                            }
                        }
                    }
                    
                } else if (circuit.getMeshes()[0].getCommonBranchesArray()[0][0] === 2){
                    console.log('RES 1 - 3');
                    circuit.getMeshes()[0].getBranches()[1].setBranchElements(new Resistance(this.randomE6Resistance()));
                    circuitResistanceNumber--;
                    circuit.getMeshes()[0].getBranches()[2].setBranchElements(new Resistance(this.randomE6Resistance()));
                    circuitResistanceNumber--;
                    console.log('circuitResistanceNumber: '+circuitResistanceNumber);
                    if (circuitResistanceNumber > 0){
                        if (this.randomBoolean()){
                            console.log('RES 1 - 4');
                            circuit.getMeshes()[0].getBranches()[this.randomChoiseTwoNumber(1,2)].setBranchElements(new Resistance(this.randomE6Resistance()));
                            circuitResistanceNumber--;
                            console.log('circuitResistanceNumber: '+circuitResistanceNumber);
                        }
                    }
                } else if (circuit.getMeshes()[0].getCommonBranchesArray()[0][0] === 0){
                    console.log('RES 1 - 4.1');
                    circuit.getMeshes()[0].getBranches()[1].setBranchElements(new Resistance(this.randomE6Resistance()));
                    circuitResistanceNumber--;
                    circuit.getMeshes()[0].getBranches()[0].setBranchElements(new Resistance(this.randomE6Resistance()));
                    circuitResistanceNumber--;
                    console.log('circuitResistanceNumber: '+circuitResistanceNumber);
                    if (circuitResistanceNumber > 0){
                        if (this.randomBoolean()){
                            console.log('RES 1 - 4');
                            circuit.getMeshes()[0].getBranches()[this.randomChoiseTwoNumber(0,1)].setBranchElements(new Resistance(this.randomE6Resistance()));
                            circuitResistanceNumber--;
                            console.log('circuitResistanceNumber: '+circuitResistanceNumber);
                        }
                    }
                }
                /*if (circuitResistanceNumber > 0){
                    console.log('RES 1 - 5');
                    let tempFor: number = circuitResistanceNumber;
                    for (let i = 0; i < tempFor; i++){
                        circuit.getMeshes()[0].getBranches()[this.randomChoiseTwoNumber(1,2)].setBranchElements(new Resistance(this.randomE6Resistance()));
                        circuitResistanceNumber--;
                        console.log('circuitResistanceNumber: '+circuitResistanceNumber);
                    }
                }*/
                
                break;
            }
            case 1.1 : {
                console.log('RES 1');
                if (circuit.getMeshes()[0].getCommonBranchesArray()[0][0] === 1){
                    console.log('RES 1 - 1');
                    if (circuit.getMeshes()[0].getBranches()[0].getBranchElements()[0] !== undefined){
                        circuit.getMeshes()[0].getBranches()[0].setBranchElements(new Resistance(this.randomE6Resistance()));
                        circuitResistanceNumber--;
                        circuit.getMeshes()[0].getBranches()[1].setBranchElements(new Resistance(this.randomE6Resistance()));
                        circuitResistanceNumber--;
                    } else {
                        circuit.getMeshes()[0].getBranches()[1].setBranchElements(new Resistance(this.randomE6Resistance()));
                        circuitResistanceNumber--;
                        circuit.getMeshes()[0].getBranches()[2].setBranchElements(new Resistance(this.randomE6Resistance()));
                        circuitResistanceNumber--;
                    }
                    
                    
                    
                } else if (circuit.getMeshes()[0].getCommonBranchesArray()[0][0] === 0 || circuit.getMeshes()[0].getCommonBranchesArray()[0][0] === 2){
                    console.log('RES 1 - 3');
                    circuit.getMeshes()[0].getBranches()[0].setBranchElements(new Resistance(this.randomE6Resistance()));
                    circuitResistanceNumber--;
                    circuit.getMeshes()[0].getBranches()[2].setBranchElements(new Resistance(this.randomE6Resistance()));
                    circuitResistanceNumber--;
                    console.log('circuitResistanceNumber: '+circuitResistanceNumber);
                    if (circuitResistanceNumber > 0){
                        if (this.randomBoolean()){
                            console.log('RES 1 - 4');
                            circuit.getMeshes()[0].getBranches()[1].setBranchElements(new Resistance(this.randomE6Resistance()));
                            circuitResistanceNumber--;
                            console.log('circuitResistanceNumber: '+circuitResistanceNumber);
                        }
                    }
                } 
                /*if (circuitResistanceNumber > 0){
                    console.log('RES 1 - 5');
                    let tempFor: number = circuitResistanceNumber;
                    for (let i = 0; i < tempFor; i++){
                        circuit.getMeshes()[0].getBranches()[this.randomChoiseTwoNumber(1,2)].setBranchElements(new Resistance(this.randomE6Resistance()));
                        circuitResistanceNumber--;
                        console.log('circuitResistanceNumber: '+circuitResistanceNumber);
                    }
                }*/
                
                break;
            }
            case 2: {
                for (let i = 0; i < circuit.getNumberOfMesh(); i++){
                    if (i < circuit.getNumberOfMesh()-1){
                        for (let j= 0; j < circuit.getMeshes()[i].getBranches().length; j++){
                            if (circuit.getMeshes()[0].getBranches()[0].getBranchElements()[0] !== undefined) {
                                
                            }
                            if (circuit.getMeshes()[i].getCommonBranchesArray()[0][0] === 1 || circuit.getMeshes()[i].getCommonBranchesArray()[0][0] === 3){
                                if (circuit.getMeshes()[0].getBranches()[0].getBranchElements()[0] !== undefined && circuit.getMeshes()[0].getBranches()[0].getBranchElements()[0].getId() === 'V') {
                                    if (circuit.getMeshes()[i].getBranches()[j].getType() === 0 || circuit.getMeshes()[i].getBranches()[j].getType() === 1){
                                        circuit.getMeshes()[i].getBranches()[j].setBranchElements(new Resistance(this.randomE6Resistance()));
                                        circuitResistanceNumber--;
                                    }
                                } else {
                                    if (circuit.getMeshes()[i].getBranches()[j].getType() === 2 || circuit.getMeshes()[i].getBranches()[j].getType() === 1){
                                        circuit.getMeshes()[i].getBranches()[j].setBranchElements(new Resistance(this.randomE6Resistance()));
                                        circuitResistanceNumber--;
                                    }
                                }
                                
                            } else if (circuit.getMeshes()[i].getCommonBranchesArray()[0][0] === 0 || circuit.getMeshes()[i].getCommonBranchesArray()[0][0] === 2){
                                if (circuit.getMeshes()[0].getBranches()[0].getBranchElements()[0] !== undefined && circuit.getMeshes()[0].getBranches()[0].getBranchElements()[0].getId() === 'V') {
                                    if (circuit.getMeshes()[i].getBranches()[j].getType() === 1 || circuit.getMeshes()[i].getBranches()[j].getType() === 2){
                                        circuit.getMeshes()[i].getBranches()[j].setBranchElements(new Resistance(this.randomE6Resistance()));
                                        circuitResistanceNumber--;
                                    }
                                } else {
                                    if (circuit.getMeshes()[i].getBranches()[j].getType() === 0 || circuit.getMeshes()[i].getBranches()[j].getType() === 1){
                                        circuit.getMeshes()[i].getBranches()[j].setBranchElements(new Resistance(this.randomE6Resistance()));
                                        circuitResistanceNumber--;
                                    }
                                }
                            }
                        }
                    }
                }
                //circuit.getMeshes()[0].getBranches()[1].setBranchElements(new Resistance(this.randomE6Resistance()));
                if (circuitResistanceNumber > 0){
                    if (circuit.getMeshes()[0].getBranches()[0].getBranchElements()[0] !== undefined) {
                        circuit.getMeshes()[0].getBranches()[0].setBranchElements(new Resistance(this.randomE6Resistance()));
                        circuitResistanceNumber--;    
                    } else {
                        circuit.getMeshes()[0].getBranches()[2].setBranchElements(new Resistance(this.randomE6Resistance()));
                        circuitResistanceNumber--;    
                    }
                }
                break;
            }
            case 2.1:{
                for (let i = 0; i < circuit.getNumberOfMesh(); i++){
                    if (i < circuit.getNumberOfMesh()-1){
                        for (let j= 0; j < circuit.getMeshes()[i].getBranches().length; j++){
                            if (circuit.getMeshes()[circuit.getNumberOfMesh()-1].getCommonBranchesArray()[0][0] === 0){
                                console.log('UTOLSO 0-val');
                                if ((circuit.getMeshes()[i].getBranches()[j].getType() === 0 || circuit.getMeshes()[i].getBranches()[j].getType() === 1) && i === 0){
                                    circuit.getMeshes()[i].getBranches()[j].setBranchElements(new Resistance(this.randomE6Resistance()));
                                    circuitResistanceNumber--;
                                } else if ((circuit.getMeshes()[i].getBranches()[j].getType() === 0 || circuit.getMeshes()[i].getBranches()[j].getType() === 2) && i > 0) {
                                    circuit.getMeshes()[i].getBranches()[j].setBranchElements(new Resistance(this.randomE6Resistance()));
                                    circuitResistanceNumber--;
                                }
                            } else if (circuit.getMeshes()[circuit.getNumberOfMesh()-1].getCommonBranchesArray()[0][0] === 2){
                                console.log('UTOLSO 2-vel');
                                if ((circuit.getMeshes()[i].getBranches()[j].getType() === 1 || circuit.getMeshes()[i].getBranches()[j].getType() === 2) && i === 0){
                                    console.log(i+' .HUROK, type: 1 v 2');
                                    circuit.getMeshes()[i].getBranches()[j].setBranchElements(new Resistance(this.randomE6Resistance()));
                                    circuitResistanceNumber--;
                                } else if ((circuit.getMeshes()[i].getBranches()[j].getType() === 0 || circuit.getMeshes()[i].getBranches()[j].getType() === 2) && i > 0){
                                    console.log(i+' .HUROK, type: 0v 2');
                                    circuit.getMeshes()[i].getBranches()[j].setBranchElements(new Resistance(this.randomE6Resistance()));
                                    circuitResistanceNumber--;
                                }
                            }
                        }
                    }
                }
                if (circuitResistanceNumber > 0){
                    circuit.getMeshes()[circuit.getNumberOfMesh()-2].getBranches()[1].setBranchElements(new Resistance(this.randomE6Resistance()));
                    circuitResistanceNumber--;    
                }
                break;
            }
            case 3: {
                for (let i = 0; i < circuit.getNumberOfMesh(); i++){
                    if (i < circuit.getNumberOfMesh()-1){
                        for (let j= 0; j < circuit.getMeshes()[i].getBranches().length; j++){
                            if (circuit.getMeshes()[i].getCommonBranchesArray()[0][0] === 1 || circuit.getMeshes()[i].getCommonBranchesArray()[0][0] === 3){
                                if (circuit.getMeshes()[0].getBranches()[0].getBranchElements()[0] !== undefined && circuit.getMeshes()[0].getBranches()[0].getBranchElements()[0].getId() === 'V') {
                                    if (circuit.getMeshes()[i].getBranches()[j].getType() === 0 || circuit.getMeshes()[i].getBranches()[j].getType() === 1){
                                        if (i === 0 && circuit.getMeshes()[i].getBranches()[j].getType() === 0 ){
                                            circuit.getMeshes()[i].getBranches()[j].setBranchElements(new Resistance(this.randomE6Resistance()));
                                            //circuitResistanceNumber--;
                                        } else {
                                            if (circuit.getMeshes()[i].getBranches()[j].getType() === 0){
                                                if (circuitResistanceNumber > 3 && this.randomBoolean()){
                                                    circuit.getMeshes()[i].getBranches()[j].setBranchElements(new Resistance(this.randomE6Resistance()));
                                                    //circuitResistanceNumber--;
                                                }
                                            } else {
                                                circuit.getMeshes()[i].getBranches()[j].setBranchElements(new Resistance(this.randomE6Resistance()));
                                                //circuitResistanceNumber--;
                                            }
                                            
                                        }
                                        //circuit.getMeshes()[i].getBranches()[j].setBranchElements(new Resistance(this.randomE6Resistance()));
                                        //circuitResistanceNumber--;
                                    }
                                } else {
                                    if (circuit.getMeshes()[i].getBranches()[j].getType() === 1){
                                        circuit.getMeshes()[i].getBranches()[j].setBranchElements(new Resistance(this.randomE6Resistance()));
                                        //circuitResistanceNumber--;
                                    } 
                                    if (circuit.getMeshes()[i].getBranches()[j].getType() === 2){
                                        if (i === 0){
                                            circuit.getMeshes()[i].getBranches()[j].setBranchElements(new Resistance(this.randomE6Resistance()));
                                            //circuitResistanceNumber--;
                                        } else {
                                            if (circuitResistanceNumber > 3 && this.randomBoolean()){
                                                circuit.getMeshes()[i].getBranches()[j].setBranchElements(new Resistance(this.randomE6Resistance()));
                                                //circuitResistanceNumber--;
                                            }
                                        }
                                        //circuit.getMeshes()[i].getBranches()[j].setBranchElements(new Resistance(this.randomE6Resistance()));
                                        //circuitResistanceNumber--;
                                    }
                                }
                                
                            } else if (circuit.getMeshes()[i].getCommonBranchesArray()[0][0] === 0 || circuit.getMeshes()[i].getCommonBranchesArray()[0][0] === 2){
                                if (i === 0){
                                    if (circuit.getMeshes()[i].getBranches()[j].getType() === 2 || circuit.getMeshes()[i].getBranches()[j].getType() === 0){
                                        circuit.getMeshes()[i].getBranches()[j].setBranchElements(new Resistance(this.randomE6Resistance()));
                                        //circuitResistanceNumber--;
                                    }
                                    
                                } else if (circuit.getMeshes()[i].getBranches()[j].getType() === 2 && circuit.getMeshes()[i].getCommonBranchesArray()[0][0] === 0){
                                    circuit.getMeshes()[i].getBranches()[j].setBranchElements(new Resistance(this.randomE6Resistance()));
                                    //circuitResistanceNumber--;
                                } else if (circuit.getMeshes()[i].getBranches()[j].getType() === 0 && circuit.getMeshes()[i].getCommonBranchesArray()[0][0] === 2){
                                    circuit.getMeshes()[i].getBranches()[j].setBranchElements(new Resistance(this.randomE6Resistance()));
                                    //circuitResistanceNumber--;
                                } else if (circuit.getMeshes()[i].getBranches()[j].getType() === 1){
                                    if (circuitResistanceNumber > 3 && this.randomBoolean()){
                                        circuit.getMeshes()[i].getBranches()[j].setBranchElements(new Resistance(this.randomE6Resistance()));
                                        //circuitResistanceNumber--;
                                    }
                                }
                            } 
                        }
                    }
                }
                /*circuit.getMeshes()[0].getBranches()[1].setBranchElements(new Resistance(this.randomE6Resistance()));
                if (circuitResistanceNumber > 0){
                    if (circuit.getMeshes()[0].getBranches()[0].getBranchElements()[0] !== undefined) {
                        circuit.getMeshes()[0].getBranches()[0].setBranchElements(new Resistance(this.randomE6Resistance()));
                        circuitResistanceNumber--;    
                    } else {
                        circuit.getMeshes()[0].getBranches()[2].setBranchElements(new Resistance(this.randomE6Resistance()));
                        circuitResistanceNumber--;    
                    }
                }*/
                break;
            }
            case 4: {
                for (let h = 0; h < circuit.getNumberOfMesh(); h++){
                    for (let i = 0; i < circuit.getMeshes()[h].getBranches().length; i++){
                        
                        let elementI = circuit.getMeshes()[h].getBranches()[i];
                        if (elementI.getBranchElements()[0] !== undefined){
                            for (let j = 0; j < circuit.getMeshes()[h].getBranches()[i].getBranchElements().length; j++) {
                                let elementJ = circuit.getMeshes()[h].getBranches()[i].getBranchElements()[j];
                                if (elementJ.getId() === 'V'){
                                    elementI.setBranchElements(new Resistance(this.randomE6Resistance()));
                                }
                            }
                        } else {
                            if (h === 0){
                                if (this.percentRandom(50)){
                                    elementI.setBranchElements(new Resistance(this.randomE6Resistance()));
                                }
                                if (this.percentRandom(10)){
                                    elementI.setBranchElements(new Resistance(this.randomE6Resistance()));
                                }
                            } else if (circuit.getMeshes()[h].getCommonBranchesArray()[0][0] !== elementI.getType() && (type === 5 ? true : h < circuit.getNumberOfMesh()-1)){
                                if (!circuit.getMeshes()[h].getBranches()[i].getTh2Pole()){
                                    if (circuit.getMeshes()[h].getBranches()[i].getCommon() !== circuit.getMeshes()[h].getMeshNumber()){
                                        elementI.setBranchElements(new Resistance(this.randomE6Resistance()));
                                    } else if (this.percentRandom(50)){
                                        if (elementI.getType() !== circuit.getMeshes()[h].getCommonBranchesArray()[0][0]){
                                            elementI.setBranchElements(new Resistance(this.randomE6Resistance()));
                                        }
                                    }
                                    if (this.percentRandom(10)){
                                        if (elementI.getType() !== circuit.getMeshes()[h].getCommonBranchesArray()[0][0]){
                                            elementI.setBranchElements(new Resistance(this.randomE6Resistance()));
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                break;
            }
        }
    }
    /**
     * Megfelelo feltelek figyelembe vetelevel hozzaadja az aramkorhoz a feszultseggenerator(oka)t.
     * @param circuit aramkor objektum
     */
    public setVoltageSourceInCircuit(circuit: Circuit, type: number): void{
        let tempType:  number = type;
        if (type > 3.1 && type <=5){
            tempType = 4;
        } 
        switch (tempType){
            case 1: {
                if (circuit.getMeshes()[0].getCommonBranchesArray()[0][0] === 1){
                    if (this.randomChoiseTwoNumber(0,2) === 0){
                        circuit.getMeshes()[0].getBranches()[0].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                    } else {
                        circuit.getMeshes()[0].getBranches()[2].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                    }
                } else if (circuit.getMeshes()[0].getCommonBranchesArray()[0][0] === 2){
                    circuit.getMeshes()[0].getBranches()[0].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                } else {
                    circuit.getMeshes()[0].getBranches()[2].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                }
                break;
            }
            case 1.1: {
                //circuit.getMeshes()[0].getBranches()[0].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                if (circuit.getMeshes()[0].getCommonBranchesArray()[0][0] === 1){
                    circuit.getMeshes()[0].getBranches()[this.randomChoiseTwoNumber(0,2)].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                    circuit.getMeshes()[0].getBranches()[1].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                } else if (circuit.getMeshes()[0].getCommonBranchesArray()[0][0] === 0 || circuit.getMeshes()[0].getCommonBranchesArray()[0][0] === 2) {
                    circuit.getMeshes()[0].getBranches()[0].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                    circuit.getMeshes()[0].getBranches()[2].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                } 
                
                //circuit.getMeshes()[0].getBranches()[2].setBranchElements(new Resistance(this.randomE6Resistance()));
                //circuit.getMeshes()[0].getBranches()[1].setBranchElements(new Resistance(this.randomE6Resistance()));
                break;
            }
            case 2: {
                if (circuit.getMeshes()[0].getCommonBranchesArray()[0][0] === 1){
                    if (this.randomChoiseTwoNumber(0,2) === 0){
                        circuit.getMeshes()[0].getBranches()[0].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                    } else {
                        circuit.getMeshes()[0].getBranches()[2].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                    }
                } else if (circuit.getMeshes()[0].getCommonBranchesArray()[0][0] === 2){
                    circuit.getMeshes()[0].getBranches()[0].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                } else if (circuit.getMeshes()[0].getCommonBranchesArray()[0][0] === 0){
                    circuit.getMeshes()[0].getBranches()[2].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                }
                //circuit.getMeshes()[0].getBranches()[0].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                break;
            }
            case 2.1: {
                if (circuit.getMeshes()[circuit.getNumberOfMesh()-1].getCommonBranchesArray()[0][0] === 0){
                    circuit.getMeshes()[0].getBranches()[0].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                } else {
                    circuit.getMeshes()[0].getBranches()[2].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                }
                break;
            }
            case 3: {
                if (circuit.getMeshes()[0].getCommonBranchesArray()[0][0] === 1){
                    circuit.getMeshes()[0].getBranches()[1].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                    if (this.randomChoiseTwoNumber(0,2) === 0){
                        circuit.getMeshes()[0].getBranches()[0].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                    } else {
                        circuit.getMeshes()[0].getBranches()[2].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                    }
                } else if (circuit.getMeshes()[0].getCommonBranchesArray()[0][0] === 2 || circuit.getMeshes()[0].getCommonBranchesArray()[0][0] === 0){
                    circuit.getMeshes()[0].getBranches()[0].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                    circuit.getMeshes()[0].getBranches()[2].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                } 
                //circuit.getMeshes()[0].getBranches()[0].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                break;
            }
            case 3.1: {
                if (circuit.getMeshes()[0].getCommonBranchesArray()[0][0] === 1){
                    circuit.getMeshes()[0].getBranches()[1].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                    circuit.getMeshes()[1].getBranches()[1].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                    if (this.randomChoiseTwoNumber(0,2) === 0){
                        circuit.getMeshes()[0].getBranches()[0].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                    } else {
                        circuit.getMeshes()[0].getBranches()[2].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                    }
                } else if (circuit.getMeshes()[0].getCommonBranchesArray()[0][0] === 2 || circuit.getMeshes()[0].getCommonBranchesArray()[0][0] === 0){
                    circuit.getMeshes()[0].getBranches()[0].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                    circuit.getMeshes()[0].getBranches()[2].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                    if (circuit.getMeshes()[0].getCommonBranchesArray()[0][0] === 2){
                        circuit.getMeshes()[1].getBranches()[2].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                    }else if (circuit.getMeshes()[0].getCommonBranchesArray()[0][0] === 0){
                        circuit.getMeshes()[1].getBranches()[0].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                    }

                } 
                //circuit.getMeshes()[0].getBranches()[0].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                break;
            }
            case 4: {
                let maxVoltageSource: number = circuit.getParameters()[3];
                console.log('maxVoltageSource: ' +maxVoltageSource);
                for (let h = 0; h < circuit.getNumberOfMesh(); h++){
                    let voltageSourceCounter: number = 0;
                    let percent: number = this.randomIntNumber(100,1);
                    for (let i = 0; i < circuit.getMeshes()[h].getBranches().length; i++){
                        if (h === 0){
                            if (this.percentRandom(percent)){
                                circuit.getMeshes()[h].getBranches()[i].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                                voltageSourceCounter++;
                                maxVoltageSource--;
                                percent = 0;
                            }
                        } else if (circuit.getMeshes()[h].getCommonBranchesArray()[0][0] !== circuit.getMeshes()[h].getBranches()[i].getType() && (type === 5 ? true : h < circuit.getNumberOfMesh()-1)){
                            
                            if (!circuit.getMeshes()[h].getBranches()[i].getTh2Pole()){
                                if (maxVoltageSource > 0){
                                    if (this.percentRandom(percent)){
                                        circuit.getMeshes()[h].getBranches()[i].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                                        voltageSourceCounter++;
                                        maxVoltageSource--;
                                        percent = 1;
                                    }
                                }
                            }
                        }
                    }
                    /*if (voltageSourceCounter === 0){
                        for (let i = 0; i < circuit.getMeshes()[h].getBranches().length; i++){
                            if (circuit.getMeshes()[h].getCommonBranchesArray()[0][0] !== circuit.getMeshes()[h].getBranches()[i].getType()){
                                if (circuit.getMeshes()[h].getBranches()[i].getCommon()-1 !== circuit.getMeshes()[h].getMeshNumber()){
                                    circuit.getMeshes()[h].getBranches()[i].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                                }
                            }
                        }
                    }*/
                }
            }
        }
    }
    /**
     * Beallitja a feladdattipusnak megfeleloen, hogy melyik agban legyen a a thevenin 2 polus
     * @param circuit aramkor objektum
     * @param type feladattipus
     */
    public setThevenin2PoleInCircuit(circuit: Circuit, type: number): void{
        let tempType:  number = type;
        if (type <= 4){
            tempType = 1;
        }
        switch (tempType){
            case 1: {
                for (let i = 0; i < circuit.getMeshes()[circuit.getNumberOfMesh()-1].getBranches().length; i++){
                    if (circuit.getMeshes()[circuit.getNumberOfMesh()-1].getBranches()[i].getType() === circuit.getMeshes()[circuit.getNumberOfMesh()-1].getCommonBranchesArray()[0][1]){
                        circuit.getMeshes()[circuit.getNumberOfMesh()-1].getBranches()[i].setTh2Pole(true);
                    }
                }
                break;
            }
            case 5: {
                let tempArray: number[][] = [];
                let randomChoise: number[] = [];
                for (let h = 0; h < circuit.getNumberOfMesh(); h++) {
                    let elementH = circuit.getMeshes()[h];
                    tempArray.push(elementH.getCommonBranchesArray()[elementH.getCommonBranchesArray().length-1]);
                }
                console.log('temparray:');
                console.log(tempArray);
                randomChoise = this.randomChoiseInAnyArray(tempArray);
                console.log('randomChoise:');
                console.log(randomChoise);
                //for (let h = 0; h < circuit.getNumberOfMesh(); h++) {
                    //let elementH = circuit.getMeshes()[h];
                    for (let i = 0; i < circuit.getMeshes()[randomChoise[2]-1].getBranches().length; i++){
                        let elementI = circuit.getMeshes()[randomChoise[2]-1].getBranches()[i];
                        if(elementI.getType() === randomChoise[0] && ((randomChoise[2] + randomChoise[3]) === elementI.getCommon())){
                            elementI.setTh2Pole(true);
                        }
                    }
                //}
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
    public setAllSizeOfCircuit(circuit: Circuit): void {
        circuit.getMeshes()[0].setMeshBranchesSizeAll(96,96,96,96);
        for (let h = 0; h < circuit.getNumberOfMesh(); h++){
            let typeCounter: number[] = [0,0,0,0];
            if (h > 0){
                for (let i = 0; i < circuit.getMeshes()[h].getCommonBranchesArray().length; i++){
                    if (circuit.getMeshes()[h].getCommonBranchesArray()[i][2] < circuit.getMeshes()[h].getMeshNumber()){
                        if (circuit.getMeshes()[h].getCommonBranchesArray()[i][0] === 0){
                            circuit.getMeshes()[h].getMeshBranchesSize()[0] += circuit.getMeshes()[circuit.getMeshes()[h].getCommonBranchesArray()[i][2]-1].getMeshBranchesSize()[2];
                            circuit.getMeshes()[h].getMeshBranchesSize()[2] = circuit.getMeshes()[h].getMeshBranchesSize()[0];
                        }
                        if (circuit.getMeshes()[h].getCommonBranchesArray()[i][0] === 1){
                            circuit.getMeshes()[h].getMeshBranchesSize()[1] += circuit.getMeshes()[circuit.getMeshes()[h].getCommonBranchesArray()[i][2]-1].getMeshBranchesSize()[3];
                            circuit.getMeshes()[h].getMeshBranchesSize()[3] = circuit.getMeshes()[h].getMeshBranchesSize()[1];
                        }
                        if (circuit.getMeshes()[h].getCommonBranchesArray()[i][0] === 2){
                            circuit.getMeshes()[h].getMeshBranchesSize()[2] += circuit.getMeshes()[circuit.getMeshes()[h].getCommonBranchesArray()[i][2]-1].getMeshBranchesSize()[0];
                            circuit.getMeshes()[h].getMeshBranchesSize()[0] = circuit.getMeshes()[h].getMeshBranchesSize()[2];
                        }
                        if (circuit.getMeshes()[h].getCommonBranchesArray()[i][0] === 3){
                            circuit.getMeshes()[h].getMeshBranchesSize()[3] += circuit.getMeshes()[circuit.getMeshes()[h].getCommonBranchesArray()[i][2]-1].getMeshBranchesSize()[1];
                            circuit.getMeshes()[h].getMeshBranchesSize()[1] = circuit.getMeshes()[h].getMeshBranchesSize()[3];
                        }
                    }
                }
                for (let i = 0; i < circuit.getMeshes()[h].getMeshBranchesSize().length; i++){
                    if (circuit.getMeshes()[h].getMeshBranchesSize()[i] === 0){
                        circuit.getMeshes()[h].getMeshBranchesSize()[i] = 96;
                    }
                }
            }
            for (let i = 0; i < circuit.getMeshes()[h].getBranches().length; i++){
                if (circuit.getMeshes()[h].getBranches()[i].getType() === 0){
                    typeCounter[0]++;
                }
                if (circuit.getMeshes()[h].getBranches()[i].getType() === 1){
                    typeCounter[1]++;
                }
                if (circuit.getMeshes()[h].getBranches()[i].getType() === 2){
                    typeCounter[2]++;
                }
                if (circuit.getMeshes()[h].getBranches()[i].getType() === 3){
                    typeCounter[3]++;
                }
            }
            for (let i = 0; i < circuit.getMeshes()[h].getBranches().length; i++){
                if (circuit.getMeshes()[h].getBranches()[i].getType() === 0){
                    circuit.getMeshes()[h].getBranches()[i].setBranchSize(circuit.getMeshes()[h].getMeshBranchesSize()[0]/typeCounter[0]);
                    for (let j = 0; j < circuit.getMeshes()[h].getBranches()[i].getBranchElements().length; j++){
                        circuit.getMeshes()[h].getBranches()[i].getBranchElements()[j].setElementSize(circuit.getMeshes()[h].getBranches()[i].getBrancSize()/circuit.getMeshes()[h].getBranches()[i].getBranchElements().length);
                    }
                }
                if (circuit.getMeshes()[h].getBranches()[i].getType() === 1){
                    circuit.getMeshes()[h].getBranches()[i].setBranchSize(circuit.getMeshes()[h].getMeshBranchesSize()[1]/typeCounter[1]);
                    for (let j = 0; j < circuit.getMeshes()[h].getBranches()[i].getBranchElements().length; j++){
                        circuit.getMeshes()[h].getBranches()[i].getBranchElements()[j].setElementSize(circuit.getMeshes()[h].getBranches()[i].getBrancSize()/circuit.getMeshes()[h].getBranches()[i].getBranchElements().length);
                    }
                }
                if (circuit.getMeshes()[h].getBranches()[i].getType() === 2){
                    circuit.getMeshes()[h].getBranches()[i].setBranchSize(circuit.getMeshes()[h].getMeshBranchesSize()[2]/typeCounter[2]);
                    for (let j = 0; j < circuit.getMeshes()[h].getBranches()[i].getBranchElements().length; j++){
                        circuit.getMeshes()[h].getBranches()[i].getBranchElements()[j].setElementSize(circuit.getMeshes()[h].getBranches()[i].getBrancSize()/circuit.getMeshes()[h].getBranches()[i].getBranchElements().length);
                    }
                }
                if (circuit.getMeshes()[h].getBranches()[i].getType() === 3){
                    circuit.getMeshes()[h].getBranches()[i].setBranchSize(circuit.getMeshes()[h].getMeshBranchesSize()[3]/typeCounter[3]);
                    for (let j = 0; j < circuit.getMeshes()[h].getBranches()[i].getBranchElements().length; j++){
                        circuit.getMeshes()[h].getBranches()[i].getBranchElements()[j].setElementSize(circuit.getMeshes()[h].getBranches()[i].getBrancSize()/circuit.getMeshes()[h].getBranches()[i].getBranchElements().length);
                    }
                }
               
            }
        }
        //circuit.getMeshes()[5].getBranches()[0].getBranchElements()[0].setElementSize(33);

    }
    
    public setElementsCoordinate(circuit: Circuit): void {
        //let startPosition: number[] = [0,0];
        let startX: number;
        let startY: number;
        let endX: number;
        let endY: number;
        for (let h = 0; h < circuit.getNumberOfMesh(); h++){
            let startPosition: number[] = [0,0];
            if (h > 0){
                if (circuit.getMeshes()[h].getCommonBranchesArray()[1] !== undefined || h === circuit.getNumberOfMesh()-1 || circuit.getMeshes()[h].getCommonBranchesArray().length === 1){
                    if ((circuit.getMeshes()[h].getCommonBranchesArray()[1] === undefined) || (circuit.getMeshes()[h].getCommonBranchesArray()[0][0] !== circuit.getMeshes()[h].getCommonBranchesArray()[1][0]) || circuit.getMeshes()[h].getCommonBranchesArray().length === 1){
                        console.log('IF 1');
                        if (circuit.getMeshes()[h].getCommonBranchesArray()[0][0] === 0){
                            console.log('IF 11');
                            startPosition[0] = circuit.getMeshes()[circuit.getMeshes()[h].getCommonBranchesArray()[0][2]-1].getBranches()[0].getBranchElements()[0].getCoordinate()[0] + circuit.getMeshes()[h-1].getMeshBranchesSize()[3];
                            startPosition[1] = circuit.getMeshes()[circuit.getMeshes()[h].getCommonBranchesArray()[0][2]-1].getBranches()[0].getBranchElements()[0].getCoordinate()[1];
                        }
                        if (circuit.getMeshes()[h].getCommonBranchesArray()[0][0] === 1){
                            console.log('IF 12');
                            startPosition[1] = circuit.getMeshes()[circuit.getMeshes()[h].getCommonBranchesArray()[0][2]-1].getBranches()[0].getBranchElements()[0].getCoordinate()[1] + circuit.getMeshes()[h].getMeshBranchesSize()[0];
                            startPosition[0] = circuit.getMeshes()[circuit.getMeshes()[h].getCommonBranchesArray()[0][2]-1].getBranches()[0].getBranchElements()[0].getCoordinate()[0];
                        }
                        if (circuit.getMeshes()[h].getCommonBranchesArray()[0][0] === 2){
                            console.log('IF 13');
                            startPosition[0] = circuit.getMeshes()[circuit.getMeshes()[h].getCommonBranchesArray()[0][2]-1].getBranches()[0].getBranchElements()[0].getCoordinate()[0] - circuit.getMeshes()[h].getMeshBranchesSize()[3];
                            startPosition[1] = circuit.getMeshes()[circuit.getMeshes()[h].getCommonBranchesArray()[0][2]-1].getBranches()[0].getBranchElements()[0].getCoordinate()[1];
                        }
                        if (circuit.getMeshes()[h].getCommonBranchesArray()[0][0] === 3){
                            console.log('IF 14');
                            startPosition[1] = circuit.getMeshes()[circuit.getMeshes()[h].getCommonBranchesArray()[0][2]-1].getBranches()[0].getBranchElements()[0].getCoordinate()[1] - circuit.getMeshes()[h-1].getMeshBranchesSize()[0];
                            startPosition[0] = circuit.getMeshes()[circuit.getMeshes()[h].getCommonBranchesArray()[0][2]-1].getBranches()[0].getBranchElements()[0].getCoordinate()[0];
                        }
                    } else
                    if (circuit.getMeshes()[h].getCommonBranchesArray()[0][0] === circuit.getMeshes()[h].getCommonBranchesArray()[1][0]){
                        console.log('IF 2');
                        startPosition = [0,0];
                        if (circuit.getMeshes()[h].getCommonBranchesArray()[0][0] === 0){
                            let maxY: number = -Infinity;
                            for (let i = 0; i < circuit.getMeshes()[h].getCommonBranchesArray().length; i++){
                                if (circuit.getMeshes()[h].getCommonBranchesArray()[i][0] === 0){
                                    for (let j = 0; j < circuit.getMeshes()[circuit.getMeshes()[h].getCommonBranchesArray()[i][2]-1].getBranches().length; j++){
                                        if (circuit.getMeshes()[circuit.getMeshes()[h].getCommonBranchesArray()[i][2]-1].getBranches()[j].getType() === 2){
                                            for (let k = 0; k < circuit.getMeshes()[circuit.getMeshes()[h].getCommonBranchesArray()[i][2]-1].getBranches()[j].getBranchElements().length; k++){
                                                if (circuit.getMeshes()[circuit.getMeshes()[h].getCommonBranchesArray()[i][2]-1].getBranches()[j].getBranchElements()[k].getCoordinate()[3] >= maxY){
                                                    maxY = circuit.getMeshes()[circuit.getMeshes()[h].getCommonBranchesArray()[i][2]-1].getBranches()[j].getBranchElements()[k].getCoordinate()[3];
                                                    startPosition[0] = circuit.getMeshes()[circuit.getMeshes()[h].getCommonBranchesArray()[i][2]-1].getBranches()[j].getBranchElements()[k].getCoordinate()[2];
                                                    console.log('IF 21');
                                                    console.log('maxY: '+maxY);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            startPosition[1] = maxY;
                            console.log('startPosition: '+startPosition);
                        }
                        if (circuit.getMeshes()[h].getCommonBranchesArray()[0][0] === 1){
                            let maxY: number = -Infinity;
                            let minX: number = Infinity;
                            for (let i = 0; i < circuit.getMeshes()[h].getCommonBranchesArray().length; i++){
                                if (circuit.getMeshes()[h].getCommonBranchesArray()[i][0] === 1){
                                    for (let j = 0; j < circuit.getMeshes()[circuit.getMeshes()[h].getCommonBranchesArray()[i][2]-1].getBranches().length; j++){
                                        if (circuit.getMeshes()[circuit.getMeshes()[h].getCommonBranchesArray()[i][2]-1].getBranches()[j].getType() === 3){
                                            for (let k = 0; k < circuit.getMeshes()[circuit.getMeshes()[h].getCommonBranchesArray()[i][2]-1].getBranches()[j].getBranchElements().length; k++){
                                                if (circuit.getMeshes()[circuit.getMeshes()[h].getCommonBranchesArray()[i][2]-1].getBranches()[j].getBranchElements()[k].getCoordinate()[2] <= minX){
                                                    minX = circuit.getMeshes()[circuit.getMeshes()[h].getCommonBranchesArray()[i][2]-1].getBranches()[j].getBranchElements()[k].getCoordinate()[2];
                                                    startPosition[1] = circuit.getMeshes()[circuit.getMeshes()[h].getCommonBranchesArray()[i][2]-1].getBranches()[j].getBranchElements()[k].getCoordinate()[3];
                                                    console.log('IF 22');
                                                    console.log('minX: '+minX);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            startPosition[0] = minX;
                            startPosition[1] += circuit.getMeshes()[h].getMeshBranchesSize()[0];
                            console.log('startPosition: '+startPosition);
                        }
                        if (circuit.getMeshes()[h].getCommonBranchesArray()[0][0] === 2){
                            let maxY: number = -Infinity;
                            let minX: number = Infinity;
                            for (let i = 0; i < circuit.getMeshes()[h].getCommonBranchesArray().length; i++){
                                if (circuit.getMeshes()[h].getCommonBranchesArray()[i][0] === 2){
                                    for (let j = 0; j < circuit.getMeshes()[circuit.getMeshes()[h].getCommonBranchesArray()[i][2]-1].getBranches().length; j++){
                                        if (circuit.getMeshes()[circuit.getMeshes()[h].getCommonBranchesArray()[i][2]-1].getBranches()[j].getType() === 0){
                                            for (let k = 0; k < circuit.getMeshes()[circuit.getMeshes()[h].getCommonBranchesArray()[i][2]-1].getBranches()[j].getBranchElements().length; k++){
                                                if (circuit.getMeshes()[circuit.getMeshes()[h].getCommonBranchesArray()[i][2]-1].getBranches()[j].getBranchElements()[k].getCoordinate()[1] >= maxY){
                                                    maxY = circuit.getMeshes()[circuit.getMeshes()[h].getCommonBranchesArray()[i][2]-1].getBranches()[j].getBranchElements()[k].getCoordinate()[1];
                                                    startPosition[0] = circuit.getMeshes()[circuit.getMeshes()[h].getCommonBranchesArray()[i][2]-1].getBranches()[j].getBranchElements()[k].getCoordinate()[0];
                                                    console.log('IF 23');
                                                    console.log('maxY: '+maxY);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            startPosition[1] = maxY;
                            startPosition[0] -= circuit.getMeshes()[h].getMeshBranchesSize()[3];
                            console.log('startPosition: '+startPosition);
                        }
                        if (circuit.getMeshes()[h].getCommonBranchesArray()[0][0] === 3){
                            let maxY: number = -Infinity;
                            let minX: number = Infinity;
                            for (let i = 0; i < circuit.getMeshes()[h].getCommonBranchesArray().length; i++){
                                if (circuit.getMeshes()[h].getCommonBranchesArray()[i][0] === 3){
                                    for (let j = 0; j < circuit.getMeshes()[circuit.getMeshes()[h].getCommonBranchesArray()[i][2]-1].getBranches().length; j++){
                                        if (circuit.getMeshes()[circuit.getMeshes()[h].getCommonBranchesArray()[i][2]-1].getBranches()[j].getType() === 1){
                                            for (let k = 0; k < circuit.getMeshes()[circuit.getMeshes()[h].getCommonBranchesArray()[i][2]-1].getBranches()[j].getBranchElements().length; k++){
                                                if (circuit.getMeshes()[circuit.getMeshes()[h].getCommonBranchesArray()[i][2]-1].getBranches()[j].getBranchElements()[k].getCoordinate()[0] <= minX){
                                                    minX = circuit.getMeshes()[circuit.getMeshes()[h].getCommonBranchesArray()[i][2]-1].getBranches()[j].getBranchElements()[k].getCoordinate()[0];
                                                    startPosition[1] = circuit.getMeshes()[circuit.getMeshes()[h].getCommonBranchesArray()[i][2]-1].getBranches()[j].getBranchElements()[k].getCoordinate()[1];
                                                    console.log('IF 24');
                                                    console.log('minX: '+minX);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            startPosition[0] = minX;
                            console.log('startPosition: '+startPosition);
                        }
                    }
                }
            } 
            for (let i = 0; i < circuit.getMeshes()[h].getBranches().length; i++){
                for (let j = 0; j < circuit.getMeshes()[h].getBranches()[i].getBranchElements().length; j++){
                    //if (h === 0){
                        if (circuit.getMeshes()[h].getBranches()[i].getType() === 0){
                            startX = startPosition[0];
                            startY = startPosition[1];
                            endX = startPosition[0];
                            endY = startPosition[1] - circuit.getMeshes()[h].getBranches()[i].getBranchElements()[j].getElementSize();
                            circuit.getMeshes()[h].getBranches()[i].getBranchElements()[j].setCoordinate(startX,startY,endX,endY);
                            startPosition = [endX,endY];
                        }
                        if (circuit.getMeshes()[h].getBranches()[i].getType() === 1){
                            startX = startPosition[0];
                            startY = startPosition[1];
                            endX = startPosition[0] + circuit.getMeshes()[h].getBranches()[i].getBranchElements()[j].getElementSize();
                            endY = startPosition[1];
                            circuit.getMeshes()[h].getBranches()[i].getBranchElements()[j].setCoordinate(startX,startY,endX,endY);
                            startPosition = [endX,endY];
                        }
                        if (circuit.getMeshes()[h].getBranches()[i].getType() === 2){
                            startX = startPosition[0];
                            startY = startPosition[1];
                            endX = startPosition[0];
                            endY = startPosition[1] + circuit.getMeshes()[h].getBranches()[i].getBranchElements()[j].getElementSize();
                            circuit.getMeshes()[h].getBranches()[i].getBranchElements()[j].setCoordinate(startX,startY,endX,endY);
                            startPosition = [endX,endY];
                        }
                        if (circuit.getMeshes()[h].getBranches()[i].getType() === 3){
                            startX = startPosition[0];
                            startY = startPosition[1];
                            endX = startPosition[0] - circuit.getMeshes()[h].getBranches()[i].getBranchElements()[j].getElementSize();
                            endY = startPosition[1];
                            circuit.getMeshes()[h].getBranches()[i].getBranchElements()[j].setCoordinate(startX,startY,endX,endY);
                            startPosition = [endX,endY];
                        }
                    //} 
                }
            }
            
                
            
            
        }
        this.deleteElementsCoordinateOfConnectedMesh(circuit);
    }
    public deleteElementsCoordinateOfConnectedMesh(circuit: Circuit): void{
        for (let h = 1; h < circuit.getNumberOfMesh(); h++){
            for (let i = 0; i < circuit.getMeshes()[h].getBranches().length; i++){
                if (circuit.getMeshes()[h].getBranches()[i].getType() === circuit.getMeshes()[h].getCommonBranchesArray()[0][0]){
                    for (let j = 0; j < circuit.getMeshes()[h].getBranches()[i].getBranchElements().length; j++){
                        circuit.getMeshes()[h].getBranches()[i].getBranchElements()[j].deleteCoordinateArray();
                        circuit.getMeshes()[h].getBranches()[i].getBranchElements()[j].setElementSize(undefined);
                    }
                }
            }
        }
    }
    public getCircuitCoordinatesToFalstad():string[]{
        return this.circuitCoordinatesToFalstad;
    }
    public setCircuitElementCoordinatesArrayToFalstadExport(circuit: Circuit):void{
        for (let h = 0; h < circuit.getNumberOfMesh(); h++){
            for (let i = 0;  i < circuit.getMeshes()[h].getBranches().length; i++){
                for (let j = 0; j < circuit.getMeshes()[h].getBranches()[i].getBranchElements().length; j++){
                    if (circuit.getMeshes()[h].getBranches()[i].getBranchElements()[j].getCoordinate()[0] !== undefined){
                        let coordinate: number[] = circuit.getMeshes()[h].getBranches()[i].getBranchElements()[j].getCoordinate();
                        if (circuit.getMeshes()[h].getBranches()[i].getBranchElements()[j].getId() === 'W'){
                            if (circuit.getMeshes()[h].getBranches()[i].getTh2Pole()){
                                this.circuitCoordinatesToFalstad.push('p '+coordinate[0]+' '+coordinate[1]+' '+coordinate[2]+' '+coordinate[3]+' 1 0');
                            } else {
                                this.circuitCoordinatesToFalstad.push('w '+coordinate[0]+' '+coordinate[1]+' '+coordinate[2]+' '+coordinate[3]+' 0');
                            }
                        }
                        if (circuit.getMeshes()[h].getBranches()[i].getBranchElements()[j].getId() === 'R'){
                            let resistance: number = circuit.getMeshes()[h].getBranches()[i].getBranchElements()[j].getResistance();
                            this.circuitCoordinatesToFalstad.push('r '+coordinate[0]+' '+coordinate[1]+' '+coordinate[2]+' '+coordinate[3]+' 0 '+resistance);
                        }
                        if (circuit.getMeshes()[h].getBranches()[i].getBranchElements()[j].getId() === 'V'){
                            let voltage: number;
                            if (circuit.getMeshes()[h].getBranches()[i].getBranchElements()[j].getDirection()){
                                voltage = -circuit.getMeshes()[h].getBranches()[i].getBranchElements()[j].getVoltage();
                            } else {
                                voltage = circuit.getMeshes()[h].getBranches()[i].getBranchElements()[j].getVoltage();
                            }
                            this.circuitCoordinatesToFalstad.push('v '+coordinate[0]+' '+coordinate[1]+' '+coordinate[2]+' '+coordinate[3]+' 0 0 40 '+voltage+' 0 0.5');
                        }
                        if (circuit.getMeshes()[h].getBranches()[i].getBranchElements()[j].getId() === 'C'){
                            this.circuitCoordinatesToFalstad.push('c '+coordinate[0]+' '+coordinate[1]+' '+coordinate[2]+' '+coordinate[3]+' 0');
                        }
                    }
                }
            }
        }
    }
    public generateFalstadLink(circuit: Circuit):void{
        let link: string = 'https://www.falstad.com/circuit/circuitjs.html?cct=$+1+0.000005+10.20027730826997+50+5+43';
        for (let h = 0; h < circuit.getNumberOfMesh(); h++){
            for (let i = 0;  i < circuit.getMeshes()[h].getBranches().length; i++){
                for (let j = 0; j < circuit.getMeshes()[h].getBranches()[i].getBranchElements().length; j++){
                    if (circuit.getMeshes()[h].getBranches()[i].getBranchElements()[j].getCoordinate()[0] !== undefined){
                        let coordinate: number[] = circuit.getMeshes()[h].getBranches()[i].getBranchElements()[j].getCoordinate();
                        if (circuit.getMeshes()[h].getBranches()[i].getBranchElements()[j].getId() === 'W'){
                            if (circuit.getMeshes()[h].getBranches()[i].getTh2Pole()){
                                link +='%0Ap+'+coordinate[0]+'+'+coordinate[1]+'+'+coordinate[2]+'+'+coordinate[3]+'+1+0';
                            } else {
                                link +='%0Aw+'+coordinate[0]+'+'+coordinate[1]+'+'+coordinate[2]+'+'+coordinate[3]+'+0';
                            }
                        }
                        if (circuit.getMeshes()[h].getBranches()[i].getBranchElements()[j].getId() === 'R'){
                            let resistance: number = circuit.getMeshes()[h].getBranches()[i].getBranchElements()[j].getResistance();
                            link +='%0Ar+'+coordinate[0]+'+'+coordinate[1]+'+'+coordinate[2]+'+'+coordinate[3]+'+0+'+resistance;
                        }
                        if (circuit.getMeshes()[h].getBranches()[i].getBranchElements()[j].getId() === 'V'){
                            let voltage: number;
                            if (circuit.getMeshes()[h].getBranches()[i].getBranchElements()[j].getDirection()){
                                voltage = -circuit.getMeshes()[h].getBranches()[i].getBranchElements()[j].getVoltage();
                            } else {
                                voltage = circuit.getMeshes()[h].getBranches()[i].getBranchElements()[j].getVoltage();
                            }
                            link +='%0Av+'+coordinate[0]+'+'+coordinate[1]+'+'+coordinate[2]+'+'+coordinate[3]+'+0+0+40+'+voltage+'+0+0.5';
                        }
                        if (circuit.getMeshes()[h].getBranches()[i].getBranchElements()[j].getId() === 'C'){
                            link +='%0Ac+'+coordinate[0]+'+'+coordinate[1]+'+'+coordinate[2]+'+'+coordinate[3]+'+0';
                        }
                    }
                }
            }
        }
        link +='%0A';
        console.log(link);
    }
    
    /**
     * A generalt aramkor a www.falstad.com oldalhoz megfelelo txt formatumba exportalasa.
     * @param circuitCoordinates az aramkor elemeinek koordinataival feltoltott tomb
     */
    public exportToFalstadTxt(circuitCoordinates: string[]): void{
        /*this.fs.truncate('falstad.txt', 0,  function(err) {
            if (err) {
                return console.error(err);
            }});*/
        this.fs.writeFile('falstad.txt', '$ 1 0.000005 10.20027730826997 50 5 43\n' ,  function(err) {
            if (err) {
                return console.error(err);
            }});
        for (let h = 0; h < circuitCoordinates.length; h++){
            this.fs.appendFile('falstad.txt', circuitCoordinates[h]+'\n' ,  function(err) {
                if (err) {
                    return console.error(err);
                }});
        }
    }
    
    public counterOfChoiseTypeMultibranch(array: number[][], choiseType: number): number{
        let count: number = 0;
        for (let i = 0; i < array.length; i++){
            if (choiseType === array[i][0]){
                count++;
            }
        }
        return count;
    }
    public deleteNotAcceptableBranchInArray(circuit: Circuit, array: number[][], meshnumber: number): void{
        for (let j = 0; j < circuit.getMeshes()[meshnumber-1].getCommonBranchesArray().length; j++){
            for (let i = 0; i < array.length; i++) {
                if (circuit.getMeshes()[meshnumber-1].getCommonBranchesArray()[j][0] === array[i][0] && array[i][2] === circuit.getMeshes()[meshnumber-1].getCommonBranchesArray()[j][3]) {
                    array.splice(i,1);
                    break;
                }
            }
        }
    }
        
    public searchMultipleBranchTypeInAcceptableCommonBranchArray(array: number[][]): number[]{
        let multipleBrancTypeArray: number[] = [];
        let counter: number[] = [0,0,0,0];
        for (let j = 0; j < array.length; j++){
            if (array[j][0] === 0){
                counter[0]++;
            }
            if (array[j][0] === 1){
                counter[1]++;
            }
            if (array[j][0] === 2){
                counter[2]++;
            }
            if (array[j][0] === 3){
                counter[3]++;
            }
        }
        for (let i = 0; i < counter.length; i++){
            if(counter[i] > 1){
                multipleBrancTypeArray.push(i);
            }
        }
        return multipleBrancTypeArray;
    }

    public setInverzMultipleBranch(array: number[]): number[]{
        let singleBranches: number[] = [0,1,2,3];
        for (let i = 0; i < array.length; i++){
            for (let j = 0; j < singleBranches.length; j++){
                if (array[i] === singleBranches[j]){
                    singleBranches.splice(j,1);
                    break;
                }
            }
        }
        return singleBranches;
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
        return Math.round(e6base[this.randomIntNumber(5,0)]*resistance[this.randomIntNumber(2,0)]);
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
    public choiseMinimumValueInNumberArray(array: number[]): number{
        let result: number = Infinity;
        for (let i = 0; i < array.length; i++){
            if (array[i] < result){
                result = array[i];
            }
        }
        return result;
    }
    
    public percentRandom(percent: number):boolean {
        let result: boolean;
        if (Math.random()*100 <= percent){
            result = true;
        } else {
            result = false;
        }
        return  result;
    }
}
