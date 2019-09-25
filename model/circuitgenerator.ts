/* 
 * The MIT License
 *
 * Copyright 2019 Robert Pollai <pollairobert at gmail.com>, University of Szeged, Department of Technical Informatics.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
import { CircuitElements } from './interfaceCircElement';
import { Wire } from "./wire";
import { Resistance } from "./resistance";
import { CurrentSource } from "./currentsource";
import { VoltageSource } from "./voltagesource";
import { Branch, branchCounter } from "./branch";
import { Mesh } from "./mesh";
import { Circuit } from "./circuit";
import * as math from 'mathjs';
import * as fs from 'fs';
import { CircuitAnalyzer } from './circuitanalyzer';

/**
 * Aramkor generalasat vegzo osztaly. 
 */
export class CircuitGenerator {
    private fs = require('fs');
    private circuitCoordinatesToFalstad: string[] = []; 
    //private resTask: boolean = false;
    /**
     * Aramkor generalasaert felelos. Ezzel a metodussal kezdodik a teljes halozat generalasaert felelos tobbi metodus meghivasa
     * @param type aramkor tipusa adott struktura alapjan 
     */
    public generateCircuit(type: number): Circuit{
        //console.log('meghivtak a generalosfugvt');
        let circuit: Circuit;
        circuit = this.buildFinalCircuit(new Circuit(this.circuitParameterLimits(type)),type);
        this.setCircuitElementCoordinatesArrayToFalstadExport(circuit);
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
        let temptype: number = type;
        if (type >= 4 && type < 8){
            temptype = 4;
        }
        switch (temptype){
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
                parameters = [this.randomIntNumber(15,4),
                              this.randomIntNumber(15,4),
                              this.randomIntNumber(0,0),
                              this.randomIntNumber(15,8)];
                break;
            }
            case 5: {
                parameters = [this.randomIntNumber(15,4),
                              this.randomIntNumber(15,4),
                              this.randomIntNumber(0,0),
                              this.randomIntNumber(15,8)];
                break;
            }
            case 6: {
                parameters = [this.randomIntNumber(30,30),
                              this.randomIntNumber(15,4),
                              this.randomIntNumber(0,0),
                              this.randomIntNumber(25,20)];
                break;
            }
            case 7: {
                parameters = [this.randomIntNumber(3,3),
                              this.randomIntNumber(15,4),
                              this.randomIntNumber(0,0),
                              this.randomIntNumber(2,2)];
                break;
            }
            case 9: {
                break;
            }
        }
        return parameters;
    }

    /**
     * A meg ures aramkor objektumban letrehozza a megfelelo szamu hurkot es azok agait, egy 'vazat'.
     * @param circuit aramkor obj.
     */
    public buildCircuitSkeleton(circuit: Circuit): void{
        let numberOfMesh: number = circuit.getNumberOfMesh();
        let meshes: Mesh[] = circuit.getMeshes();
        for (let h = 0; h < numberOfMesh; h++) {
            circuit.setMeshes(new Mesh());
            for (let i = 0; i < 4; i++){
                meshes[h].setBranches(new Branch(i,h));
            }
        }
    }
    
    /**
     * Az analizator szamara megfelelo strukturaju halozatot allitja elo a feladattipusnak megfeleloen.
     * Innen kerulnek meghivasra a kulonbozo aramkori elemek, 2 polus, kozos agak beallitasaert felelos metodusok.
     * @param circuit aramkor obj.
     * @param type feladat tipus szama
     */
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
        //console.log('randomCommonBranchPair: '+randomCommonBranchPair);
        //console.log('START - meshPieceArray: '+meshPieceArray);
        //console.log(typeof(meshPieceArray));
        let multiConnection: boolean = true;
        let meshes: Mesh[] = circuit.getMeshes();
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
                    //console.log('choiseMeshNumber: '+choiseMeshNumber);
                    //this.removeElementInAnyArray(choiseMeshNumber,tempPieceArray);
                    if (type === 2.1 && h > 1){
                        randomCommonBranchPair = this.randomChoiseTwoAnything([0,2],[2,0]);
                    }
                    connectBranches.push(randomCommonBranchPair[0],randomCommonBranchPair[1],choiseMeshNumber,h);
                    //.log('connectBranches - for: '+connectBranches);
                    
                    meshes[h-1].setCommonBranchesArray(connectBranches);
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
                    //console.log('randomCommonBranchPair a '+h+'. korben: '+randomCommonBranchPair);
                    connectBranches.push(randomCommonBranchPair[0],randomCommonBranchPair[1],choiseMeshNumber,h);
                    meshes[h-1].setCommonBranchesArray(connectBranches);
                    this.addConnectedBranchFromCommmonBranchesArrayElement(circuit,h,choiseMeshNumber);
                    this.deleteNotAcceptableBranchInArray(circuit, acceptebleCommonBranchArray, h);
                } else if (h < numberOfMeshes){
                    let choiseType: number;
                    //choiseMeshNumber = (h+1);
                    this.deleteNotAcceptableBranchInArray(circuit, acceptebleCommonBranchArray,h);
                    //console.log('acceptebleCommonBranchArray a '+h+'. kor elejen: '+acceptebleCommonBranchArray);
                    multiBranch = this.searchMultipleBranchTypeInAcceptableCommonBranchArray(acceptebleCommonBranchArray);
                    //console.log('multiBranch a '+h+'. korben: '+multiBranch);
                    multiConnection = this.randomBoolean();
                    //multiConnection = false;
                    //console.log('multiConnection a '+h+'. korben: '+multiConnection);
                    if (multiConnection){
                        choiseType = this.randomChoiseInAnyArray(multiBranch);
                        //console.log('choiseType a '+h+'. korben: '+choiseType);
                        let choiseTypeCounter: number = this.counterOfChoiseTypeMultibranch(acceptebleCommonBranchArray,choiseType);
                        for (let i = 0; i < choiseTypeCounter; i++){
                            for (let j = 0; j < acceptebleCommonBranchArray.length; j++){
                                if (choiseType === acceptebleCommonBranchArray[j][0]){
                                    connectBranches.push(acceptebleCommonBranchArray[j][0],acceptebleCommonBranchArray[j][1],choiseMeshNumber,acceptebleCommonBranchArray[j][2]);
                                    //console.log('connectBranches a '+h+'. korben(multiconnect): '+connectBranches);
                                    meshes[acceptebleCommonBranchArray[j][2]-1].setCommonBranchesArray(connectBranches);
                                    this.addConnectedBranchFromCommmonBranchesArrayElement(circuit,acceptebleCommonBranchArray[j][2],choiseMeshNumber);
                                    this.deleteNotAcceptableBranchInArray(circuit, acceptebleCommonBranchArray,acceptebleCommonBranchArray[j][2]);
                                    //console.log('acceptebleCommonBranchArray a '+h+'. korben, torles utan: '+acceptebleCommonBranchArray);
                                    connectBranches = [];
                                    break;
                                }
                            }
                        }
                        //multiBranch = [];
                        //multiBranch = this.searchMultipleBranchTypeInAcceptableCommonBranchArray(acceptebleCommonBranchArray);
                    } else {
                        let inverz = this.setInverzMultipleBranch(multiBranch);
                        //console.log('inverz a '+h+'. korben: '+inverz);
                        choiseType = this.randomChoiseInAnyArray(inverz);
                        //console.log('choiseType a '+h+'. korben: '+choiseType);
                        for (let j = 0; j < acceptebleCommonBranchArray.length; j++){
                            if (choiseType === acceptebleCommonBranchArray[j][0]){
                                connectBranches.push(acceptebleCommonBranchArray[j][0],acceptebleCommonBranchArray[j][1],choiseMeshNumber,acceptebleCommonBranchArray[j][2]);
                                //console.log('connectBranches a '+h+'. korben(nem multiconnect): '+connectBranches);
                                meshes[acceptebleCommonBranchArray[j][2]-1].setCommonBranchesArray(connectBranches);
                                this.addConnectedBranchFromCommmonBranchesArrayElement(circuit,acceptebleCommonBranchArray[j][2],choiseMeshNumber);
                                this.deleteNotAcceptableBranchInArray(circuit, acceptebleCommonBranchArray,acceptebleCommonBranchArray[j][2]);
                                //console.log('acceptebleCommonBranchArray a '+h+'. korben, torles utan: '+acceptebleCommonBranchArray);
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
                
                //console.log('acceptebleCommonBranchArray a '+h+'. kor vegen: '+acceptebleCommonBranchArray);
                //multiBranch = [];
                //multiBranch = this.searchMultipleBranchTypeInAcceptableCommonBranchArray(acceptebleCommonBranchArray);
                //console.log('multiBranch - vege: '+multiBranch);
                //multiBranch = this.searchMultipleBranchTypeInAcceptableCommonBranchArray(acceptebleCommonBranchArray);
            }
            
            
        }
        }
        if (type === 16){
            meshes[0].setCommonBranchesArray([2, 0, 2, 1]);
            meshes[0].setCommonBranchesArray([3, 1, 3, 1]);
            meshes[1].setCommonBranchesArray([0, 2, 1, 2]);
            meshes[1].setCommonBranchesArray([3, 1, 3, 2]);
            //meshes[1].setCommonBranchesArray([3, 1, 3, 2]);
            //meshes[2].setCommonBranchesArray([1, 3, 2, 3]);
            //meshes[1].setCommonBranchesArray([2, 0, 3, 2]);
            //meshes[1].setCommonBranchesArray([0, 2, 4, 2]);
            meshes[2].setCommonBranchesArray([1, 3, 1, 3]);
            meshes[2].setCommonBranchesArray([1, 3, 2, 3]);
            //meshes[3].setCommonBranchesArray([2, 0, 1, 4]);
            //meshes[3].setCommonBranchesArray([2, 0, 2, 4]);
            
        }
        if (type === 17) {
            meshes[0].setCommonBranchesArray([2, 0, 2, 1]);
            meshes[0].setCommonBranchesArray([3, 1, 3, 1]);
            meshes[1].setCommonBranchesArray([0, 2, 1, 2]);
            meshes[1].setCommonBranchesArray([1, 3, 1, 2]);
            meshes[2].setCommonBranchesArray([1, 3, 1, 3]);
            meshes[2].setCommonBranchesArray([1, 3, 2, 3]);
            meshes[2].getBranches().splice(1,0,new Branch(1,2));
            meshes[0].getBranches()[0].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
            meshes[0].getBranches()[0].setBranchElements(new Resistance(this.randomE6Resistance()));
            meshes[0].getBranches()[1].setBranchElements(new Resistance(this.randomE6Resistance()));
            meshes[0].getBranches()[3].setBranchElements(new Resistance(this.randomE6Resistance()));
            meshes[0].getBranches()[2].setBranchElements(new Resistance(this.randomE6Resistance()));

            meshes[1].getBranches()[2].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
            meshes[1].getBranches()[1].setBranchElements(new Resistance(this.randomE6Resistance()));
            //meshes[1].getBranches()[3].setBranchElements(new Resistance(this.randomE6Resistance()));
            meshes[1].getBranches()[0].setBranchElements(this.copyCommonElement(meshes[0].getBranches()[2].getBranchElements()[0]));
            
            meshes[2].getBranches()[1].setBranchElements(this.copyCommonElement(meshes[0].getBranches()[3].getBranchElements()[0]));
            //meshes[2].getBranches()[2].setBranchElements(this.copyCommonElement(meshes[1].getBranches()[3].getBranchElements()[0]));
            
            meshes[2].getBranches()[4].setBranchElements(new Resistance(this.randomE6Resistance()));
            meshes[2].getBranches()[4].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
            
            meshes[0].getBranches()[2].setCommon(2);
            meshes[1].getBranches()[0].setCommon(1);
            meshes[0].getBranches()[3].setCommon(3);
            meshes[2].getBranches()[1].setCommon(1);
            meshes[1].getBranches()[3].setCommon(3);
            meshes[2].getBranches()[2].setCommon(2);

            meshes[1].getBranches()[3].setTh2Pole(true);
            //this.setCommonBranchesInCircuit(circuit);

        }
        //console.log('acceptebleCommonBranchArray.length: ' +acceptebleCommonBranchArray.length);

        //console.log('acceptebleCommonBranchArray: ' +acceptebleCommonBranchArray);
        //console.log('acceptebleCommonBranchArray: ' +acceptebleCommonBranchArray);
        console.log();
        if (type <= 6){
            //this.setThevenin2PoleInCircuit(circuit, type);
            this.setCommonBranchesInCircuit(circuit);
            this.setThevenin2PoleInCircuit(circuit, type);
            this.setVoltageSourceInCircuit(circuit, type);
            this.setResistanceInCircuit(circuit, type);
            this.setCommonBranchesCloneElement(circuit);
            //this.setThevenin2PoleInCircuit(circuit, type);
        }
        
        /*if (type <= 3.1){
            //this.setVoltageSourceInCircuit(circuit, type);
            this.setResistanceInCircuit(circuit, type);
            this.setCommonBranchesCloneElement(circuit);
            //this.setThevenin2PoleInCircuit(circuit, type);
        }*/
        
        //this.setEmptyBranchInOtherSideOfCommonBranch(circuit);
        
        for (let h = 0; h < circuit.getNumberOfMesh(); h++){
            let branches: Branch[] = meshes[h].getBranches();
            for(let i = 0; i < branches.length; i++){
                let mesh : Mesh =  meshes[h];
                mesh.setMeshVoltage(mesh.getBranches()[i]);
                mesh.setMeshResistance(mesh.getBranches()[i]);
                if (mesh.getBranches()[i].getBranchElements()[0] === undefined){
                    mesh.getBranches()[i].setBranchElements(new Wire());
                }
            }
        }
        if (type <= 7){
            this.setAllSizeOfCircuit(circuit);
            this.setElementsCoordinate(circuit);
        }
        
        /*for (let i = 0; i < circuit.getNumberOfMesh(); i++){
            let branches: Branch[] = meshes[i].getBranches();
            //this.setCommonBranchesInMesh(circuit, meshes[i].getCommonBranchesArray());
            console.log(meshes[i].getCommonBranchesArray());
            //console.log(meshes[i].getMeshBranchesSize());
            //console.log(branches);
            //for (let j = 0; j < branches.length; j++){
                //console.log(branches[j].getBranchElements());
            //}
        }*/ 
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
        let meshes: Mesh[] = circuit.getMeshes();
        let baseComBrArray: number[][] = meshes[baseMesNumb-1].getCommonBranchesArray();
        let connMesh: Mesh = meshes[connectedMeshNumb-1];
        let connComBrArray: number[][] = connMesh.getCommonBranchesArray()
        for (let i = 0; i < baseComBrArray.length; i++){
            if (baseComBrArray[i][2] === connectedMeshNumb){
                if (connComBrArray.length > 0){
                    let existconnectedMeshNumb: boolean = false;
                    for (let j = 0; j < connComBrArray.length; j++){
                        if (connComBrArray[j][2] === baseMesNumb){
                            existconnectedMeshNumb = true;
                            break;
                        }
                    }
                    if (!existconnectedMeshNumb){
                        connMesh.setCommonBranchesArray([baseComBrArray[i][1],baseComBrArray[i][0],baseMesNumb,connectedMeshNumb]);
                    }
                } else {
                    connMesh.setCommonBranchesArray([baseComBrArray[i][1],baseComBrArray[i][0],baseMesNumb,connectedMeshNumb]);
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
        let meshes: Mesh[] = circuit.getMeshes();
        for (let h = 0; h < commonBranchesArray.length; h++){
            let branches: Branch[] = meshes[commonBranchesArray[h][3]-1].getBranches();
            //console.log('h:' +h);
            for (let i = 0; i < branches.length; i++){
                //console.log('i:' +i);
                if (branches[i].getType() === commonBranchesArray[h][0]){
                    //console.log('IF - 99');
                    //console.log('Az egyezo tipusu branch: '+branches[i].getType());
                    let tempBranch: Branch = new Branch(commonBranchesArray[h][0],commonBranchesArray[h][3]-1);
                    tempBranch.setCommon(commonBranchesArray[h][2]);
                    branches.splice(i,0,tempBranch);
                    break;
                }
            }
        }

        /**
         * A kozos branch tipusanak megfelelo, nem beallitott branch torlese.
         */
        let branches: Branch[] = meshes[commonBranchesArray[0][3]-1].getBranches();
        for (let i = 0; i < branches.length; i++){
            if (i > 0){
                //console.log('IF - 100');
                if (branches[i].getType() === branches[i-1].getType()){
                    //console.log('IF - 101');
                    if (i < branches.length-1 && (branches[i].getType() !== branches[i+1].getType())){
                        //console.log('IF - 102');
                        branches.splice(i,1);
                    } else
                    if (i === branches.length-1){
                        //console.log('IF - 103');
                        branches.splice(i,1);
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
        let meshes: Mesh[] = circuit.getMeshes();
        for (let i = 0; i < circuit.getNumberOfMesh(); i++){
            this.setCommonBranchesInMesh(circuit,meshes[i].getCommonBranchesArray());
        }
    }
    /**
     * Ellenallasok elhelyezeseert felelos.
     * @param circuit aramkor objektum
     * @param type feladat tipusanak megfelelo szam
     */
    public setResistanceInCircuit(circuit: Circuit, type: number): void{
        let meshes: Mesh[] = circuit.getMeshes();
        let mesh1branches: Branch[] = meshes[0].getBranches();
        let msh1CommBrArray: number[][] = meshes[0].getCommonBranchesArray();
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
                //console.log('RES 1');
                if (msh1CommBrArray[0][0] === 1){
                    //console.log('RES 1 - 1');
                    if (mesh1branches[0].getBranchElements()[0] !== undefined) {
                        mesh1branches[0].setBranchElements(new Resistance(this.randomE6Resistance()));
                        circuitResistanceNumber--;
                        mesh1branches[1].setBranchElements(new Resistance(this.randomE6Resistance()));
                        circuitResistanceNumber--;
                        //console.log('circuitResistanceNumber: '+circuitResistanceNumber);
                        if (circuitResistanceNumber > 0){
                            if (this.randomBoolean()){
                                //console.log('RES 1 - 2');
                                mesh1branches[1].setBranchElements(new Resistance(this.randomE6Resistance()));
                                circuitResistanceNumber--;
                            }
                        }
                    } else {
                        mesh1branches[2].setBranchElements(new Resistance(this.randomE6Resistance()));
                        circuitResistanceNumber--;
                        mesh1branches[1].setBranchElements(new Resistance(this.randomE6Resistance()));
                        circuitResistanceNumber--;
                        //console.log('circuitResistanceNumber: '+circuitResistanceNumber);
                        if (circuitResistanceNumber > 0){
                            if (this.randomBoolean()){
                                //console.log('RES 1 - 2');
                                mesh1branches[1].setBranchElements(new Resistance(this.randomE6Resistance()));
                                circuitResistanceNumber--;
                            }
                        }
                    }
                    
                } else if (msh1CommBrArray[0][0] === 2){
                    //console.log('RES 1 - 3');
                    mesh1branches[1].setBranchElements(new Resistance(this.randomE6Resistance()));
                    circuitResistanceNumber--;
                    mesh1branches[2].setBranchElements(new Resistance(this.randomE6Resistance()));
                    circuitResistanceNumber--;
                    //console.log('circuitResistanceNumber: '+circuitResistanceNumber);
                    if (circuitResistanceNumber > 0){
                        if (this.randomBoolean()){
                           // console.log('RES 1 - 4');
                            mesh1branches[this.randomChoiseTwoNumber(1,2)].setBranchElements(new Resistance(this.randomE6Resistance()));
                            circuitResistanceNumber--;
                            //console.log('circuitResistanceNumber: '+circuitResistanceNumber);
                        }
                    }
                } else if (msh1CommBrArray[0][0] === 0){
                    //console.log('RES 1 - 4.1');
                    mesh1branches[1].setBranchElements(new Resistance(this.randomE6Resistance()));
                    circuitResistanceNumber--;
                    mesh1branches[0].setBranchElements(new Resistance(this.randomE6Resistance()));
                    circuitResistanceNumber--;
                    //console.log('circuitResistanceNumber: '+circuitResistanceNumber);
                    if (circuitResistanceNumber > 0){
                        if (this.randomBoolean()){
                            //console.log('RES 1 - 4');
                            mesh1branches[this.randomChoiseTwoNumber(0,1)].setBranchElements(new Resistance(this.randomE6Resistance()));
                            circuitResistanceNumber--;
                            //console.log('circuitResistanceNumber: '+circuitResistanceNumber);
                        }
                    }
                }
                /*if (circuitResistanceNumber > 0){
                    console.log('RES 1 - 5');
                    let tempFor: number = circuitResistanceNumber;
                    for (let i = 0; i < tempFor; i++){
                        mesh1branches[this.randomChoiseTwoNumber(1,2)].setBranchElements(new Resistance(this.randomE6Resistance()));
                        circuitResistanceNumber--;
                        console.log('circuitResistanceNumber: '+circuitResistanceNumber);
                    }
                }*/
                
                break;
            }
            case 1.1 : {
                //console.log('RES 1');
                if (msh1CommBrArray[0][0] === 1){
                    //console.log('RES 1 - 1');
                    if (mesh1branches[0].getBranchElements()[0] !== undefined){
                        mesh1branches[0].setBranchElements(new Resistance(this.randomE6Resistance()));
                        circuitResistanceNumber--;
                        mesh1branches[1].setBranchElements(new Resistance(this.randomE6Resistance()));
                        circuitResistanceNumber--;
                    } else {
                        mesh1branches[1].setBranchElements(new Resistance(this.randomE6Resistance()));
                        circuitResistanceNumber--;
                        mesh1branches[2].setBranchElements(new Resistance(this.randomE6Resistance()));
                        circuitResistanceNumber--;
                    }
                    
                    
                    
                } else if (msh1CommBrArray[0][0] === 0 || msh1CommBrArray[0][0] === 2){
                    //console.log('RES 1 - 3');
                    mesh1branches[0].setBranchElements(new Resistance(this.randomE6Resistance()));
                    circuitResistanceNumber--;
                    mesh1branches[2].setBranchElements(new Resistance(this.randomE6Resistance()));
                    circuitResistanceNumber--;
                    //console.log('circuitResistanceNumber: '+circuitResistanceNumber);
                    if (circuitResistanceNumber > 0){
                        if (this.randomBoolean()){
                            //console.log('RES 1 - 4');
                            mesh1branches[1].setBranchElements(new Resistance(this.randomE6Resistance()));
                            circuitResistanceNumber--;
                            //console.log('circuitResistanceNumber: '+circuitResistanceNumber);
                        }
                    }
                } 
                /*if (circuitResistanceNumber > 0){
                    console.log('RES 1 - 5');
                    let tempFor: number = circuitResistanceNumber;
                    for (let i = 0; i < tempFor; i++){
                        mesh1branches[this.randomChoiseTwoNumber(1,2)].setBranchElements(new Resistance(this.randomE6Resistance()));
                        circuitResistanceNumber--;
                        console.log('circuitResistanceNumber: '+circuitResistanceNumber);
                    }
                }*/
                
                break;
            }
            case 2: {
                for (let i = 0; i < circuit.getNumberOfMesh(); i++){
                    let branches: Branch[] = meshes[i].getBranches();
                    if (i < circuit.getNumberOfMesh()-1){
                        for (let j= 0; j < branches.length; j++){
                            let branchType: number = branches[j].getType();
                            if (mesh1branches[0].getBranchElements()[0] !== undefined) {
                                
                            }
                            if (meshes[i].getCommonBranchesArray()[0][0] === 1 || meshes[i].getCommonBranchesArray()[0][0] === 3){
                                if (mesh1branches[0].getBranchElements()[0] !== undefined && mesh1branches[0].getBranchElements()[0].getId() === 'V') {
                                    if (branchType === 0 || branchType === 1){
                                        branches[j].setBranchElements(new Resistance(this.randomE6Resistance()));
                                        circuitResistanceNumber--;
                                    }
                                } else {
                                    if (branchType === 2 || branchType === 1){
                                        branches[j].setBranchElements(new Resistance(this.randomE6Resistance()));
                                        circuitResistanceNumber--;
                                    }
                                }
                                
                            } else if (meshes[i].getCommonBranchesArray()[0][0] === 0 || meshes[i].getCommonBranchesArray()[0][0] === 2){
                                if (mesh1branches[0].getBranchElements()[0] !== undefined && mesh1branches[0].getBranchElements()[0].getId() === 'V') {
                                    if (branchType === 1 || branchType === 2){
                                        branches[j].setBranchElements(new Resistance(this.randomE6Resistance()));
                                        circuitResistanceNumber--;
                                    }
                                } else {
                                    if (branchType === 0 || branchType === 1){
                                        branches[j].setBranchElements(new Resistance(this.randomE6Resistance()));
                                        circuitResistanceNumber--;
                                    }
                                }
                            }
                        }
                    }
                }
                //mesh1branches[1].setBranchElements(new Resistance(this.randomE6Resistance()));
                if (circuitResistanceNumber > 0){
                    if (mesh1branches[0].getBranchElements()[0] !== undefined) {
                        mesh1branches[0].setBranchElements(new Resistance(this.randomE6Resistance()));
                        circuitResistanceNumber--;    
                    } else {
                        mesh1branches[2].setBranchElements(new Resistance(this.randomE6Resistance()));
                        circuitResistanceNumber--;    
                    }
                }
                break;
            }
            case 2.1:{
                for (let i = 0; i < circuit.getNumberOfMesh(); i++){
                    let branches: Branch[] = meshes[i].getBranches();
                    if (i < circuit.getNumberOfMesh()-1){
                        for (let j= 0; j < branches.length; j++){
                            let branchType: number = branches[j].getType();
                            if (meshes[circuit.getNumberOfMesh()-1].getCommonBranchesArray()[0][0] === 0){
                                //console.log('UTOLSO 0-val');
                                if ((branchType === 0 || branchType === 1) && i === 0){
                                    branches[j].setBranchElements(new Resistance(this.randomE6Resistance()));
                                    circuitResistanceNumber--;
                                } else if ((branchType === 0 || branchType === 2) && i > 0) {
                                    branches[j].setBranchElements(new Resistance(this.randomE6Resistance()));
                                    circuitResistanceNumber--;
                                }
                            } else if (meshes[circuit.getNumberOfMesh()-1].getCommonBranchesArray()[0][0] === 2){
                                //console.log('UTOLSO 2-vel');
                                if ((branchType === 1 || branchType === 2) && i === 0){
                                    //console.log(i+' .HUROK, type: 1 v 2');
                                    branches[j].setBranchElements(new Resistance(this.randomE6Resistance()));
                                    circuitResistanceNumber--;
                                } else if ((branchType === 0 || branchType === 2) && i > 0){
                                    //console.log(i+' .HUROK, type: 0v 2');
                                    branches[j].setBranchElements(new Resistance(this.randomE6Resistance()));
                                    circuitResistanceNumber--;
                                }
                            }
                        }
                    }
                }
                if (circuitResistanceNumber > 0){
                    meshes[circuit.getNumberOfMesh()-2].getBranches()[1].setBranchElements(new Resistance(this.randomE6Resistance()));
                    circuitResistanceNumber--;    
                }
                break;
            }
            case 3: {
                for (let i = 0; i < circuit.getNumberOfMesh(); i++){
                    let branches: Branch[] = meshes[i].getBranches();
                    if (i < circuit.getNumberOfMesh()-1){
                        for (let j= 0; j < branches.length; j++){
                            let branchType: number = branches[j].getType();
                            if (meshes[i].getCommonBranchesArray()[0][0] === 1 || meshes[i].getCommonBranchesArray()[0][0] === 3){
                                if (mesh1branches[0].getBranchElements()[0] !== undefined && mesh1branches[0].getBranchElements()[0].getId() === 'V') {
                                    if (branchType === 0 || branchType === 1){
                                        if (i === 0 && branchType === 0 ){
                                            branches[j].setBranchElements(new Resistance(this.randomE6Resistance()));
                                            //circuitResistanceNumber--;
                                        } else {
                                            if (branchType === 0){
                                                if (circuitResistanceNumber > 3 && this.randomBoolean()){
                                                    branches[j].setBranchElements(new Resistance(this.randomE6Resistance()));
                                                    //circuitResistanceNumber--;
                                                }
                                            } else {
                                                branches[j].setBranchElements(new Resistance(this.randomE6Resistance()));
                                                //circuitResistanceNumber--;
                                            }
                                            
                                        }
                                        //branches[j].setBranchElements(new Resistance(this.randomE6Resistance()));
                                        //circuitResistanceNumber--;
                                    }
                                } else {
                                    if (branchType === 1){
                                        branches[j].setBranchElements(new Resistance(this.randomE6Resistance()));
                                        //circuitResistanceNumber--;
                                    } 
                                    if (branchType === 2){
                                        if (i === 0){
                                            branches[j].setBranchElements(new Resistance(this.randomE6Resistance()));
                                            //circuitResistanceNumber--;
                                        } else {
                                            if (circuitResistanceNumber > 3 && this.randomBoolean()){
                                                branches[j].setBranchElements(new Resistance(this.randomE6Resistance()));
                                                //circuitResistanceNumber--;
                                            }
                                        }
                                        //branches[j].setBranchElements(new Resistance(this.randomE6Resistance()));
                                        //circuitResistanceNumber--;
                                    }
                                }
                                
                            } else if (meshes[i].getCommonBranchesArray()[0][0] === 0 || meshes[i].getCommonBranchesArray()[0][0] === 2){
                                if (i === 0){
                                    if (branchType === 2 || branchType === 0){
                                        branches[j].setBranchElements(new Resistance(this.randomE6Resistance()));
                                        //circuitResistanceNumber--;
                                    }
                                    
                                } else if (branchType === 2 && meshes[i].getCommonBranchesArray()[0][0] === 0){
                                    branches[j].setBranchElements(new Resistance(this.randomE6Resistance()));
                                    //circuitResistanceNumber--;
                                } else if (branchType === 0 && meshes[i].getCommonBranchesArray()[0][0] === 2){
                                    branches[j].setBranchElements(new Resistance(this.randomE6Resistance()));
                                    //circuitResistanceNumber--;
                                } else if (branchType === 1){
                                    if (circuitResistanceNumber > 3 && this.randomBoolean()){
                                        branches[j].setBranchElements(new Resistance(this.randomE6Resistance()));
                                        //circuitResistanceNumber--;
                                    }
                                }
                            } 
                        }
                    }
                }
                /*mesh1branches[1].setBranchElements(new Resistance(this.randomE6Resistance()));
                if (circuitResistanceNumber > 0){
                    if (mesh1branches[0].getBranchElements()[0] !== undefined) {
                        mesh1branches[0].setBranchElements(new Resistance(this.randomE6Resistance()));
                        circuitResistanceNumber--;    
                    } else {
                        mesh1branches[2].setBranchElements(new Resistance(this.randomE6Resistance()));
                        circuitResistanceNumber--;    
                    }
                }*/
                break;
            }
            case 4: {
                for (let h = 0; h < circuit.getNumberOfMesh(); h++){
                    let branches: Branch[] = meshes[h].getBranches();
                    let commBrArray: number[][] = meshes[h].getCommonBranchesArray();
                    for (let i = 0; i < branches.length; i++){
                        
                        let branch = branches[i];
                        let elements: CircuitElements[] = branches[i].getBranchElements();
                        if (!branches[i].getTh2Pole()){
                        if (branch.getBranchElements()[0] !== undefined){
                            for (let j = 0; j < elements.length; j++) {
                                let elementJ = elements[j];
                                if (elementJ.getId() === 'V'){
                                    branch.setBranchElements(new Resistance(this.randomE6Resistance()));
                                }
                            }
                        } else {
                            
                            if (h === 0){
                                let oneres: boolean = false;
                                if (circuit.getNumberOfMesh() === 2 && commBrArray[0][0] === branch.getType()){
                                    branch.setBranchElements(new Resistance(this.randomE6Resistance()));
                                    oneres = true;
                                }
                                if (this.percentRandom(50)){
                                    branch.setBranchElements(new Resistance(this.randomE6Resistance()));
                                }
                                if (this.percentRandom(10) && !oneres){
                                    branch.setBranchElements(new Resistance(this.randomE6Resistance()));
                                }
                            } else if (commBrArray[0][0] !== branch.getType() && (type === 5 ? true : h < circuit.getNumberOfMesh()-1)){
                                //if (!branches[i].getTh2Pole()){
                                    if (branches[i].getCommon() !== meshes[h].getMeshNumber()){
                                        branch.setBranchElements(new Resistance(this.randomE6Resistance()));
                                    } else if (this.percentRandom(50)){
                                        if (branch.getType() !== commBrArray[0][0]){
                                            branch.setBranchElements(new Resistance(this.randomE6Resistance()));
                                        }
                                    }
                                    if (this.percentRandom(10)){
                                        if (branch.getType() !== commBrArray[0][0]){
                                            branch.setBranchElements(new Resistance(this.randomE6Resistance()));
                                        }
                                    }
                                //}
                            }
                        }
                        }
                    }
                }
                break;
            }
            case 16: {
                meshes[0].getBranches()[0].setBranchElements(new Resistance(this.randomE6Resistance()));
                meshes[0].getBranches()[1].setBranchElements(new Resistance(this.randomE6Resistance()));
                meshes[0].getBranches()[2].setBranchElements(new Resistance(this.randomE6Resistance()));
                meshes[1].getBranches()[3].setBranchElements(new Resistance(this.randomE6Resistance()));

                meshes[1].getBranches()[1].setBranchElements(new Resistance(this.randomE6Resistance()));
                meshes[1].getBranches()[2].setBranchElements(new Resistance(this.randomE6Resistance()));

                meshes[2].getBranches()[4].setBranchElements(new Resistance(this.randomE6Resistance()));

                //meshes[2].getBranches()[1].setBranchElements(new Resistance(this.randomE6Resistance()));
                //meshes[2].getBranches()[3].setBranchElements(new Resistance(this.randomE6Resistance()));
                //meshes[2].getBranches()[3].setBranchElements(new Resistance(this.randomE6Resistance()));
               // meshes[3].getBranches()[0].setBranchElements(new Resistance(this.randomE6Resistance()));
                /*meshes[1].getBranches()[2].setBranchElements(new Resistance(this.randomE6Resistance()));
                meshes[1].getBranches()[3].setBranchElements(new Resistance(this.randomE6Resistance()));
                meshes[2].getBranches()[1].setBranchElements(new Resistance(this.randomE6Resistance()));
                meshes[2].getBranches()[2].setBranchElements(new Resistance(this.randomE6Resistance()));
                meshes[2].getBranches()[2].setBranchElements(new Resistance(this.randomE6Resistance()));
                meshes[3].getBranches()[0].setBranchElements(new Resistance(this.randomE6Resistance()));*/
                break;
            }
        }
    }
    /**
     * Megfelelo feltelek figyelembe vetelevel hozzaadja az aramkorhoz a feszultseggenerator(oka)t.
     * @param circuit aramkor objektum
     */
    public setVoltageSourceInCircuit(circuit: Circuit, type: number): void{
        let meshes: Mesh[] = circuit.getMeshes();
        let mesh1branches: Branch[] = meshes[0].getBranches();
        let msh1CommBrArray: number[][] = meshes[0].getCommonBranchesArray();
        let tempType:  number = type;
        if (type > 3.1 && type <=5){
            tempType = 4;
        } 
        switch (tempType){
            case 1: {
                if (msh1CommBrArray[0][0] === 1){
                    if (this.randomChoiseTwoNumber(0,2) === 0){
                        mesh1branches[0].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                    } else {
                        mesh1branches[2].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                    }
                } else if (msh1CommBrArray[0][0] === 2){
                    mesh1branches[0].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                } else {
                    mesh1branches[2].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                }
                break;
            }
            case 1.1: {
                //mesh1branches[0].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                if (msh1CommBrArray[0][0] === 1){
                    mesh1branches[this.randomChoiseTwoNumber(0,2)].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                    mesh1branches[1].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                } else if (msh1CommBrArray[0][0] === 0 || msh1CommBrArray[0][0] === 2) {
                    mesh1branches[0].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                    mesh1branches[2].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                } 
                
                //mesh1branches[2].setBranchElements(new Resistance(this.randomE6Resistance()));
                //mesh1branches[1].setBranchElements(new Resistance(this.randomE6Resistance()));
                break;
            }
            case 2: {
                if (msh1CommBrArray[0][0] === 1){
                    if (this.randomChoiseTwoNumber(0,2) === 0){
                        mesh1branches[0].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                    } else {
                        mesh1branches[2].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                    }
                } else if (msh1CommBrArray[0][0] === 2){
                    mesh1branches[0].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                } else if (msh1CommBrArray[0][0] === 0){
                    mesh1branches[2].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                }
                //mesh1branches[0].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                break;
            }
            case 2.1: {
                if (meshes[circuit.getNumberOfMesh()-1].getCommonBranchesArray()[0][0] === 0){
                    mesh1branches[0].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                } else {
                    mesh1branches[2].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                }
                break;
            }
            case 3: {
                if (msh1CommBrArray[0][0] === 1){
                    mesh1branches[1].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                    if (this.randomChoiseTwoNumber(0,2) === 0){
                        mesh1branches[0].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                    } else {
                        mesh1branches[2].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                    }
                } else if (msh1CommBrArray[0][0] === 2 || msh1CommBrArray[0][0] === 0){
                    mesh1branches[0].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                    mesh1branches[2].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                } 
                //mesh1branches[0].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                break;
            }
            case 3.1: {
                if (msh1CommBrArray[0][0] === 1){
                    mesh1branches[1].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                    meshes[1].getBranches()[1].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                    if (this.randomChoiseTwoNumber(0,2) === 0){
                        mesh1branches[0].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                    } else {
                        mesh1branches[2].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                    }
                } else if (msh1CommBrArray[0][0] === 2 || msh1CommBrArray[0][0] === 0){
                    mesh1branches[0].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                    mesh1branches[2].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                    if (msh1CommBrArray[0][0] === 2){
                        meshes[1].getBranches()[2].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                    }else if (msh1CommBrArray[0][0] === 0){
                        meshes[1].getBranches()[0].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                    }

                } 
                //mesh1branches[0].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                break;
            }
            case 4: {
                let maxVoltageSource: number = circuit.getParameters()[3];
                //console.log('maxVoltageSource: ' +maxVoltageSource);
                for (let h = 0; h < circuit.getNumberOfMesh(); h++){
                    let branches: Branch[] = meshes[h].getBranches();
                    let commBrArray: number[][] = meshes[h].getCommonBranchesArray();
                    let voltageSourceCounter: number = 0;
                    let percent: number = this.randomIntNumber(100,1);
                    for (let i = 0; i < branches.length; i++){
                        if (!branches[i].getTh2Pole()){
                            if (h === 0){
                                if (this.percentRandom(percent)){
                                    branches[i].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                                    voltageSourceCounter++;
                                    maxVoltageSource--;
                                    percent = 0;
                                }
                                if (percent != 0){
                                    percent += 40;
                                }
                            } else if (commBrArray[0][0] !== branches[i].getType() && (type === 5 ? true : h < circuit.getNumberOfMesh()-1)){
                                
                                //if (!branches[i].getTh2Pole()){
                                    if (maxVoltageSource > 0){
                                        if (this.percentRandom(percent)){
                                            branches[i].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                                            voltageSourceCounter++;
                                            maxVoltageSource--;
                                            percent = 1;
                                        }
                                    }
                                //}
                            }
                        }
                    }
                    /*if (voltageSourceCounter === 0){
                        for (let i = 0; i < branches.length; i++){
                            if (commBrArray[0][0] !== branches[i].getType()){
                                if (branches[i].getCommon()-1 !== meshes[h].getMeshNumber()){
                                    branches[i].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                                }
                            }
                        }
                    }*/
                }
                break;
            }
            case 16: {
                meshes[0].getBranches()[0].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                meshes[1].getBranches()[2].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                meshes[2].getBranches()[4].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                
                //meshes[2].getBranches()[2].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                //meshes[3].getBranches()[1].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                
                break;
            }
        }
    }
    /**
     * Beallitja a feladdattipusnak megfeleloen, hogy melyik agban legyen a a thevenin 2 polus
     * @param circuit aramkor objektum
     * @param type feladattipus
     */
    public setThevenin2PoleInCircuit(circuit: Circuit, type: number): void{
        let meshes: Mesh[] = circuit.getMeshes();
        let tempType:  number = type;
        if (type <= 4){
            tempType = 1;
        }
        switch (tempType){
            case 1: {
                let lastMshBranches: Branch[] = meshes[circuit.getNumberOfMesh()-1].getBranches();
                for (let i = 0; i < lastMshBranches.length; i++){
                    if (lastMshBranches[i].getType() === meshes[circuit.getNumberOfMesh()-1].getCommonBranchesArray()[0][1]){
                        lastMshBranches[i].setTh2Pole(true);
                    }
                }
                break;
            }
            case 5: {
                let tempArray: number[][] = [];
                let randomChoise: number[] = [];
                for (let h = 0; h < circuit.getNumberOfMesh(); h++) {
                    let elementH = meshes[h];
                    if (elementH.getCommonBranchesArray()[elementH.getCommonBranchesArray().length-2] !== undefined){
                        if (elementH.getCommonBranchesArray()[meshes[h].getCommonBranchesArray().length-2][0] !== elementH.getCommonBranchesArray()[meshes[h].getCommonBranchesArray().length-1][0]){
                            tempArray.push(elementH.getCommonBranchesArray()[elementH.getCommonBranchesArray().length-1]);
                        }
                    }
                }
                //console.log('temparray:');
                //console.log(tempArray);
                randomChoise = this.randomChoiseInAnyArray(tempArray);
                //console.log('randomChoise:');
                //console.log(randomChoise);
                //for (let h = 0; h < circuit.getNumberOfMesh(); h++) {
                    //let elementH = meshes[h];
                    for (let i = 0; i < meshes[randomChoise[3]-1].getBranches().length; i++){
                        let branch = meshes[randomChoise[3]-1].getBranches()[i];
                        //console.log(branch.getCommon());
                        //console.log(branch.getType());
                        if (branch.getType() === randomChoise[0]){
                            branch.setTh2Pole(true);
                            //console.log(branch);
                        }
                    }
                //}
                break;
            }
            case 6: {
                meshes[0].getBranches()[3].setTh2Pole(true);
                break;
            }
        }
        
    }
    /**
     * Az aramkor kozos agaiban elhelyezett aramkori elemek clonozasa a megfelelo kozos branch-be.
     * @param circuit aramkor objektum
     */
    public setCommonBranchesCloneElement(circuit: Circuit): void{
        let meshes: Mesh[] = circuit.getMeshes();
        for (let h = 0; h < circuit.getNumberOfMesh(); h++){
            let branches: Branch[] = meshes[h].getBranches();
            let commBrArray: number[][] = meshes[h].getCommonBranchesArray();
            for (let i = 0; i < commBrArray.length; i++){
                let commonSum: number = commBrArray[i][2] + commBrArray[i][3];
                let idx: number = commBrArray[i][2]-1;
                let idxMshBrs: Branch[] = meshes[idx].getBranches();
                for (let j =0; j < branches.length; j++){
                    let branchType: number = branches[j].getType();
                    if (branchType === commBrArray[i][0]){
                        if (commonSum === branches[j].getCommon()){
                            if (branches[j].getBranchElements()[0] !== undefined){
                                for (let k = 0; k < idxMshBrs.length; k++){
                                    if (idxMshBrs[k].getType() === commBrArray[i][1]){
                                        if (commonSum === idxMshBrs[k].getCommon()){
                                            if (idxMshBrs[k].getBranchElements()[0] === undefined){
                                                for (let l = 0; l < branches[j].getBranchElements().length; l++){
                                                    idxMshBrs[k].setBranchElements(this.copyCommonElement(branches[j].getBranchElements()[l]));
                                                }
                                            }
                                        }
                                    }
                                }
                                //if (meshes[commBrArray[h][3]].)
                            } else {
                                for (let k = 0; k < idxMshBrs.length; k++){
                                    if (idxMshBrs[k].getType() === commBrArray[i][1]){
                                        if (commonSum === idxMshBrs[k].getCommon()){
                                            if (idxMshBrs[k].getBranchElements()[0] !== undefined){
                                                for (let l = 0; l < idxMshBrs[j].getBranchElements().length; l++){
                                                    branches[k].setBranchElements(this.copyCommonElement(idxMshBrs[j].getBranchElements()[l]));
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
        let meshes: Mesh[] = circuit.getMeshes();
        meshes[0].setMeshBranchesSizeAll(96,96,96,96);
        for (let h = 0; h < circuit.getNumberOfMesh(); h++){
            let branches: Branch[] = meshes[h].getBranches();
            let commBrArray: number[][] = meshes[h].getCommonBranchesArray();
            let typeCounter: number[] = [0,0,0,0];
            if (h > 0){
                for (let i = 0; i < commBrArray.length; i++){
                    let idx: number = commBrArray[i][2]-1;
                    if (commBrArray[i][2] < meshes[h].getMeshNumber()){
                        if (commBrArray[i][0] === 0){
                            meshes[h].getMeshBranchesSize()[0] += meshes[idx].getMeshBranchesSize()[2];
                            meshes[h].getMeshBranchesSize()[2] = meshes[h].getMeshBranchesSize()[0];
                        }
                        if (commBrArray[i][0] === 1){
                            meshes[h].getMeshBranchesSize()[1] += meshes[idx].getMeshBranchesSize()[3];
                            meshes[h].getMeshBranchesSize()[3] = meshes[h].getMeshBranchesSize()[1];
                        }
                        if (commBrArray[i][0] === 2){
                            meshes[h].getMeshBranchesSize()[2] += meshes[idx].getMeshBranchesSize()[0];
                            meshes[h].getMeshBranchesSize()[0] = meshes[h].getMeshBranchesSize()[2];
                        }
                        if (commBrArray[i][0] === 3){
                            meshes[h].getMeshBranchesSize()[3] += meshes[idx].getMeshBranchesSize()[1];
                            meshes[h].getMeshBranchesSize()[1] = meshes[h].getMeshBranchesSize()[3];
                        }
                    }
                }
                for (let i = 0; i < meshes[h].getMeshBranchesSize().length; i++){
                    if (meshes[h].getMeshBranchesSize()[i] === 0){
                        meshes[h].getMeshBranchesSize()[i] = 96;
                    }
                }
            }
            for (let i = 0; i < branches.length; i++){
                if (branches[i].getType() === 0){
                    typeCounter[0]++;
                }
                if (branches[i].getType() === 1){
                    typeCounter[1]++;
                }
                if (branches[i].getType() === 2){
                    typeCounter[2]++;
                }
                if (branches[i].getType() === 3){
                    typeCounter[3]++;
                }
            }
            for (let i = 0; i < branches.length; i++){
                let elements: CircuitElements[] = branches[i].getBranchElements();
                if (branches[i].getType() === 0){
                    branches[i].setBranchSize(meshes[h].getMeshBranchesSize()[0]/typeCounter[0]);
                    for (let j = 0; j < elements.length; j++){
                        elements[j].setElementSize(branches[i].getBrancSize()/elements.length);
                    }
                }
                if (branches[i].getType() === 1){
                    branches[i].setBranchSize(meshes[h].getMeshBranchesSize()[1]/typeCounter[1]);
                    for (let j = 0; j < elements.length; j++){
                        elements[j].setElementSize(branches[i].getBrancSize()/elements.length);
                    }
                }
                if (branches[i].getType() === 2){
                    branches[i].setBranchSize(meshes[h].getMeshBranchesSize()[2]/typeCounter[2]);
                    for (let j = 0; j < elements.length; j++){
                        elements[j].setElementSize(branches[i].getBrancSize()/elements.length);
                    }
                }
                if (branches[i].getType() === 3){
                    branches[i].setBranchSize(meshes[h].getMeshBranchesSize()[3]/typeCounter[3]);
                    for (let j = 0; j < elements.length; j++){
                        elements[j].setElementSize(branches[i].getBrancSize()/elements.length);
                    }
                }
               
            }
        }
        //meshes[5].getBranches()[0].getBranchElements()[0].setElementSize(33);

    }
    
    public setElementsCoordinate(circuit: Circuit): void {
        //let startPosition: number[] = [0,0];
        let meshes: Mesh[] = circuit.getMeshes();
        let startX: number;
        let startY: number;
        let endX: number;
        let endY: number;
        for (let h = 0; h < circuit.getNumberOfMesh(); h++){
            let branches: Branch[] = meshes[h].getBranches();
            let commBrArray: number[][] = meshes[h].getCommonBranchesArray();
            let startPosition: number[] = [0,0];
            if (h > 0){
                if (commBrArray[1] !== undefined || h === circuit.getNumberOfMesh()-1 || commBrArray.length === 1){
                    if ((commBrArray[1] === undefined) || (commBrArray[0][0] !== commBrArray[1][0]) || commBrArray.length === 1){
                        //console.log('IF 1');
                        let coordinateArray: number[] = meshes[commBrArray[0][2]-1].getBranches()[0].getBranchElements()[0].getCoordinate();
                        if (commBrArray[0][0] === 0){
                            //console.log('IF 11');
                            startPosition[0] = coordinateArray[0] + meshes[h-1].getMeshBranchesSize()[3];
                            startPosition[1] = coordinateArray[1];
                        }
                        if (commBrArray[0][0] === 1){
                            //console.log('IF 12');
                            startPosition[1] = coordinateArray[1] + meshes[h].getMeshBranchesSize()[0];
                            startPosition[0] = coordinateArray[0];
                        }
                        if (commBrArray[0][0] === 2){
                            //console.log('IF 13');
                            startPosition[0] = coordinateArray[0] - meshes[h].getMeshBranchesSize()[3];
                            startPosition[1] = coordinateArray[1];
                        }
                        if (commBrArray[0][0] === 3){
                            //console.log('IF 14');
                            startPosition[1] = coordinateArray[1] - meshes[h-1].getMeshBranchesSize()[0];
                            startPosition[0] = coordinateArray[0];
                        }
                    } else
                    if (commBrArray[0][0] === commBrArray[1][0]){
                       // console.log('IF 2');
                        startPosition = [0,0];
                        if (commBrArray[0][0] === 0){
                            let maxY: number = -Infinity;
                            for (let i = 0; i < commBrArray.length; i++){
                                let idx: number = commBrArray[i][2]-1;
                                let idxMshBrs: Branch[] = meshes[idx].getBranches();
                                if (commBrArray[i][0] === 0){
                                    for (let j = 0; j < idxMshBrs.length; j++){
                                        if (idxMshBrs[j].getType() === 2){
                                            for (let k = 0; k < idxMshBrs[j].getBranchElements().length; k++){
                                                if (idxMshBrs[j].getBranchElements()[k].getCoordinate()[3] >= maxY){
                                                    maxY = idxMshBrs[j].getBranchElements()[k].getCoordinate()[3];
                                                    startPosition[0] = idxMshBrs[j].getBranchElements()[k].getCoordinate()[2];
                                                    //console.log('IF 21');
                                                    //console.log('maxY: '+maxY);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            startPosition[1] = maxY;
                            //console.log('startPosition: '+startPosition);
                        }
                        if (commBrArray[0][0] === 1){
                            let maxY: number = -Infinity;
                            let minX: number = Infinity;
                            for (let i = 0; i < commBrArray.length; i++){
                                let idx: number = commBrArray[i][2]-1;
                                let idxMshBrs: Branch[] = meshes[idx].getBranches();
                                if (commBrArray[i][0] === 1){
                                    for (let j = 0; j < idxMshBrs.length; j++){
                                        if (idxMshBrs[j].getType() === 3){
                                            for (let k = 0; k < idxMshBrs[j].getBranchElements().length; k++){
                                                if (idxMshBrs[j].getBranchElements()[k].getCoordinate()[2] <= minX){
                                                    minX = idxMshBrs[j].getBranchElements()[k].getCoordinate()[2];
                                                    startPosition[1] = idxMshBrs[j].getBranchElements()[k].getCoordinate()[3];
                                                    //console.log('IF 22');
                                                    //console.log('minX: '+minX);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            startPosition[0] = minX;
                            startPosition[1] += meshes[h].getMeshBranchesSize()[0];
                            //console.log('startPosition: '+startPosition);
                        }
                        if (commBrArray[0][0] === 2){
                            let maxY: number = -Infinity;
                            let minX: number = Infinity;
                            for (let i = 0; i < commBrArray.length; i++){
                                let idx: number = commBrArray[i][2]-1;
                                let idxMshBrs: Branch[] = meshes[idx].getBranches();
                                if (commBrArray[i][0] === 2){
                                    for (let j = 0; j < idxMshBrs.length; j++){
                                        if (idxMshBrs[j].getType() === 0){
                                            for (let k = 0; k < idxMshBrs[j].getBranchElements().length; k++){
                                                if (idxMshBrs[j].getBranchElements()[k].getCoordinate()[1] >= maxY){
                                                    maxY = idxMshBrs[j].getBranchElements()[k].getCoordinate()[1];
                                                    startPosition[0] = idxMshBrs[j].getBranchElements()[k].getCoordinate()[0];
                                                    //console.log('IF 23');
                                                    //console.log('maxY: '+maxY);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            startPosition[1] = maxY;
                            startPosition[0] -= meshes[h].getMeshBranchesSize()[3];
                            //console.log('startPosition: '+startPosition);
                        }
                        if (commBrArray[0][0] === 3){
                            let maxY: number = -Infinity;
                            let minX: number = Infinity;
                            for (let i = 0; i < commBrArray.length; i++){
                                let idx: number = commBrArray[i][2]-1;
                                let idxMshBrs: Branch[] = meshes[idx].getBranches();
                                if (commBrArray[i][0] === 3){
                                    for (let j = 0; j < idxMshBrs.length; j++){
                                        if (idxMshBrs[j].getType() === 1){
                                            for (let k = 0; k < idxMshBrs[j].getBranchElements().length; k++){
                                                if (idxMshBrs[j].getBranchElements()[k].getCoordinate()[0] <= minX){
                                                    minX = idxMshBrs[j].getBranchElements()[k].getCoordinate()[0];
                                                    startPosition[1] = idxMshBrs[j].getBranchElements()[k].getCoordinate()[1];
                                                    //console.log('IF 24');
                                                    //console.log('minX: '+minX);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            startPosition[0] = minX;
                            //console.log('startPosition: '+startPosition);
                        }
                    }
                }
            } 
            for (let i = 0; i < branches.length; i++){
                let elements: CircuitElements[] = branches[i].getBranchElements();
                for (let j = 0; j < elements.length; j++){
                    //if (h === 0){
                    let type: number = branches[i].getType();
                    startX = startPosition[0];
                    startY = startPosition[1];
                    endX = startPosition[0] + (type === 1 ? elements[j].getElementSize() : (type === 3 ?  -elements[j].getElementSize() : 0));
                    endY = startPosition[1] + (type === 0 ? - elements[j].getElementSize() : (type === 2 ? elements[j].getElementSize() : 0));
                    elements[j].setCoordinate(startX,startY,endX,endY);
                    startPosition = [endX,endY];

                        /*if (branches[i].getType() === 0){
                            startX = startPosition[0];
                            startY = startPosition[1];
                            endX = startPosition[0];
                            endY = startPosition[1] - elements[j].getElementSize();
                            elements[j].setCoordinate(startX,startY,endX,endY);
                            startPosition = [endX,endY];
                        }
                        if (branches[i].getType() === 1){
                            startX = startPosition[0];
                            startY = startPosition[1];
                            endX = startPosition[0] + elements[j].getElementSize();
                            endY = startPosition[1];
                            elements[j].setCoordinate(startX,startY,endX,endY);
                            startPosition = [endX,endY];
                        }
                        if (branches[i].getType() === 2){
                            startX = startPosition[0];
                            startY = startPosition[1];
                            endX = startPosition[0];
                            endY = startPosition[1] + elements[j].getElementSize();
                            elements[j].setCoordinate(startX,startY,endX,endY);
                            startPosition = [endX,endY];
                        }
                        if (branches[i].getType() === 3){
                            startX = startPosition[0];
                            startY = startPosition[1];
                            endX = startPosition[0] - elements[j].getElementSize();
                            endY = startPosition[1];
                            elements[j].setCoordinate(startX,startY,endX,endY);
                            startPosition = [endX,endY];
                        }*/
                    //} 
                }
            }
            
                
            
            
        }
        this.deleteElementsCoordinateOfConnectedMesh(circuit);
    }
    public deleteElementsCoordinateOfConnectedMesh(circuit: Circuit): void{
        let meshes: Mesh[] = circuit.getMeshes();
        for (let h = 1; h < circuit.getNumberOfMesh(); h++){
            let branches: Branch[] = meshes[h].getBranches();
            let commBrArray: number[][] = meshes[h].getCommonBranchesArray();
            for (let i = 0; i < branches.length; i++){  
                let elements: CircuitElements[] = branches[i].getBranchElements();
                if (branches[i].getType() === commBrArray[0][0]){
                    for (let j = 0; j < elements.length; j++){
                        elements[j].deleteCoordinateArray();
                        elements[j].setElementSize(undefined);
                    }
                }
            }
        }
    }
    public getCircuitCoordinatesToFalstad():string[]{
        return this.circuitCoordinatesToFalstad;
    }
    public setCircuitElementCoordinatesArrayToFalstadExport(circuit: Circuit):void{
        this.circuitCoordinatesToFalstad = [];
        let meshes: Mesh[] = circuit.getMeshes();
        for (let h = 0; h < circuit.getNumberOfMesh(); h++){
            let branches: Branch[] = meshes[h].getBranches();
            for (let i = 0;  i < branches.length; i++){
                let elements: CircuitElements[] = branches[i].getBranchElements();
                for (let j = 0; j < elements.length; j++){
                    if (elements[j].getCoordinate()[0] !== undefined){
                        let coordinate: number[] = elements[j].getCoordinate();
                        if (elements[j].getId() === 'W'){
                            if (branches[i].getTh2Pole()){
                                this.circuitCoordinatesToFalstad.push('p '+coordinate[0]+' '+coordinate[1]+' '+coordinate[2]+' '+coordinate[3]+' 1 0');
                            } else {
                                this.circuitCoordinatesToFalstad.push('w '+coordinate[0]+' '+coordinate[1]+' '+coordinate[2]+' '+coordinate[3]+' 0');
                            }
                        }
                        if (elements[j].getId() === 'R'){
                            let resistance: number = elements[j].getResistance();
                            this.circuitCoordinatesToFalstad.push('r '+coordinate[0]+' '+coordinate[1]+' '+coordinate[2]+' '+coordinate[3]+' 0 '+resistance);
                        }
                        if (elements[j].getId() === 'V'){
                            let voltage: number;
                            if (elements[j].getDirection()){
                                voltage = -elements[j].getVoltage();
                            } else {
                                voltage = elements[j].getVoltage();
                            }
                            this.circuitCoordinatesToFalstad.push('v '+coordinate[0]+' '+coordinate[1]+' '+coordinate[2]+' '+coordinate[3]+' 0 0 40 '+voltage+' 0 0.5');
                        }
                        if (elements[j].getId() === 'C'){
                            this.circuitCoordinatesToFalstad.push('c '+coordinate[0]+' '+coordinate[1]+' '+coordinate[2]+' '+coordinate[3]+' 0');
                        }
                    }
                }
            }
        }
    }
    public generateFalstadLink(circuit: Circuit, type?: number, res?: number, volt?: number):string{
        let meshes: Mesh[] = circuit.getMeshes();
        let link: string = 'https://www.falstad.com/circuit/circuitjs.html?cct=$+1+0.000005+10.20027730826997+50+5+43';
        let positiveX:number = -Infinity, positiveY: number = -Infinity;
        let negativX:number = Infinity, negativY: number = Infinity;
        let offsetX: number;
        let ohmMeterCoord: number[] = [];
        let halfBranch: number;
        if (type >= 1 && type < 6){
            
            this.setCircuitElementCoordinatesArrayToFalstadExport(circuit);
            let coordinates = this.circuitCoordinatesToFalstad;
            
            for(var i = 0; i < coordinates.length; i++){
                var branchCoordinates = coordinates[i].split(" ");
                
                console.log("branchCoordinates[1]: "+typeof(branchCoordinates))
                if (+branchCoordinates[1] < negativX){
                    negativX = +branchCoordinates[1];
                } 
                if (+branchCoordinates[3] < negativX){
                    negativX = +branchCoordinates[3];
                }
                if (+branchCoordinates[2] < negativY){
                    negativY = +branchCoordinates[2];
                }
                if (+branchCoordinates[4] < negativY){
                    negativY = +branchCoordinates[4];
                }
                if (+branchCoordinates[1] > positiveX){
                    positiveX = +branchCoordinates[1];
                }
                if (+branchCoordinates[3] > positiveX){
                    positiveX = +branchCoordinates[3];
                }
                if (+branchCoordinates[2] > positiveY){
                    positiveY = +branchCoordinates[2];
                }
                if (+branchCoordinates[4] > positiveY){
                    positiveY = +branchCoordinates[4];
                }
            }
            offsetX = Math.abs(negativX - positiveX)+96;
            console.log("offsetX: "+offsetX)
            console.log("positiveX: "+positiveX)
            console.log("positiveY: "+positiveY)
        }
        
        for (let h = 0; h < circuit.getNumberOfMesh(); h++){
            let branches: Branch[] = meshes[h].getBranches();
            for (let i = 0;  i < branches.length; i++){
                let elements: CircuitElements[] = branches[i].getBranchElements();
                let branchType: number = branches[i].getType();
                for (let j = 0; j < elements.length; j++){
                    if (elements[j].getCoordinate()[0] !== undefined){
                        let coordinate: number[] = elements[j].getCoordinate();
                        
                        if (elements[j].getId() === 'R'){
                            let resistance: number = elements[j].getResistance();
                            link +='%0Ar+'+coordinate[0]+'+'+coordinate[1]+'+'+coordinate[2]+'+'+coordinate[3]+'+0+'+resistance;
                            if (type >= 1 && type < 6){
                                link +='%0Ar+'+(coordinate[0]+offsetX)+'+'+coordinate[1]+'+'+(coordinate[2]+offsetX)+'+'+coordinate[3]+'+0+'+resistance;
                            }
                        }
                        if (elements[j].getId() === 'V'){
                            let voltage: number;
                            if (elements[j].getDirection()){
                                voltage = -elements[j].getVoltage();
                            } else {
                                voltage = elements[j].getVoltage();
                            }
                            if (type >= 1 && type < 6){
                                link +='%0Aw+'+(coordinate[0]+offsetX)+'+'+coordinate[1]+'+'+(coordinate[2]+offsetX)+'+'+coordinate[3]+'+0';
                                link +='%0Av+'+coordinate[0]+'+'+coordinate[1]+'+'+coordinate[2]+'+'+coordinate[3]+'+0+0+40+'+voltage+'+0+0.5';
                                //link +='%0Aw+'+coordinate[0]+'+'+coordinate[1]+'+'+coordinate[2]+'+'+coordinate[3]+'+0';

                            } else {
                                link +='%0Av+'+coordinate[0]+'+'+coordinate[1]+'+'+coordinate[2]+'+'+coordinate[3]+'+0+0+40+'+voltage+'+0+0.5';
                            }
                        }
                        if (elements[j].getId() === 'C'){
                            link +='%0Ac+'+coordinate[0]+'+'+coordinate[1]+'+'+coordinate[2]+'+'+coordinate[3]+'+0';
                        }
                        if (elements[j].getId() === 'W'){
                            if (branches[i].getTh2Pole()){
                                if (type === 6 || type === 8){
                                    if (branchType === 0 || branchType === 2){
                                        halfBranch = (Math.abs(coordinate[1] - coordinate[3]) / 2);
                                        link +='%0Aw+'+coordinate[0]+'+'+coordinate[1]+'+'+(coordinate[0] + (branchType === 0 ? -20 : 20) )+'+'+(coordinate[1] + (branchType === 0 ? -20 : 20))+'+0';
                                        link +='%0Aw+'+coordinate[2]+'+'+coordinate[3]+'+'+(coordinate[2] + (branchType === 0 ? -20 : 20) )+'+'+(coordinate[3] + (branchType === 0 ? 20 : -20))+'+0';
                                        link +='%0Ap+'+(coordinate[0] + (branchType === 0 ? -20 : 20) )+'+'+(coordinate[1] + (branchType === 0 ? -20 : 20))+'+'+(coordinate[2] + (branchType === 0 ? -20 : 20) )+'+'+(coordinate[3] + (branchType === 0 ? 20 : -20))+'+1+0';
                                        link +='%0Ar+'+coordinate[0]+'+'+coordinate[1]+'+'+coordinate[2] + '+'+(coordinate[3] + (branchType === 0 ? halfBranch : -halfBranch ))+'+0+'+ res;
                                        link +='%0A'+(type === 6 ? "370" : "v") +'+'+coordinate[2] + '+'+(coordinate[3] + (branchType === 0 ? halfBranch : -halfBranch ))+'+'+coordinate[2] + '+'+coordinate[3]+'+'+(type === 6 ? '+1+0' : '+0+0+40+'+(-volt)+'+0+0.5');
                                        
                                    } else {
                                        halfBranch = (Math.abs(coordinate[0] - coordinate[2]) / 2);
                                        link +='%0Aw+'+coordinate[0]+'+'+coordinate[1]+'+'+(coordinate[0] + (branchType === 1? 20 : -20) )+'+'+(coordinate[1] + (branchType === 1 ? -20 : 20))+'+0';
                                        link +='%0Aw+'+coordinate[2]+'+'+coordinate[3]+'+'+(coordinate[2] + (branchType === 1 ? -20 : 20) )+'+'+(coordinate[3] + (branchType === 1 ? -20 : 20))+'+0';
                                        link +='%0Ap+'+(coordinate[0] + (branchType === 1 ? 20 : -20) )+'+'+(coordinate[1] + (branchType === 1 ? -20 : 20))+'+'+(coordinate[2] + (branchType === 1 ? -20 : 20) )+'+'+(coordinate[3] + (branchType === 1 ? -20 : 20))+'+1+0';
                                        link +='%0Ar+'+coordinate[0]+'+'+coordinate[1]+'+'+(coordinate[2] + (branchType === 1 ? - halfBranch : halfBranch )) + '+'+coordinate[3]+'+0+'+ res;
                                        link +='%0A'+(type === 6 ? "370" : "v") +'+'+(coordinate[2] + (branchType === 1 ? - halfBranch : halfBranch )) + '+'+coordinate[3]+'+'+coordinate[2] + '+'+coordinate[3]+'+'+(type === 6 ? '+1+0' : '+0+0+40+'+(-volt)+'+0+0.5');
                                        
                                    }
                                    console.log("halfBranch: " +halfBranch);
                                    //link +='%0Ar+'+coordinate[0]+'+'+coordinate[1]+'+'+coordinate[2]+'+'+coordinate[3]+'+0+'+ res;
                                } else if ((type >= 1 && type < 6)){
                                    ohmMeterCoord.push(coordinate[0],coordinate[1],coordinate[2],coordinate[3])
                                    link +='%0Ap+'+coordinate[0]+'+'+coordinate[1]+'+'+coordinate[2]+'+'+coordinate[3]+'+1+0';
                                    //link +='%0A216+'+coordinate[0]+'+'+coordinate[1]+'+'+coordinate[2]+'+'+coordinate[3]+'+32+0+0.001';
                                    link +='%0A216+'+(coordinate[0]+offsetX)+'+'+coordinate[1]+'+'+(coordinate[2]+offsetX)+'+'+coordinate[3]+'+0+0.0001';

                                } else if (type === 7){
                                    if (branchType === 0 || branchType === 2){
                                        //halfBranch = (Math.abs(coordinate[1] - coordinate[3]) / 2);
                                        link +='%0Aw+'+coordinate[0]+'+'+coordinate[1]+'+'+(coordinate[0] + (branchType === 0 ? -20 : 20) )+'+'+(coordinate[1] + (branchType === 0 ? -20 : 20))+'+0';
                                        link +='%0Aw+'+coordinate[2]+'+'+coordinate[3]+'+'+(coordinate[2] + (branchType === 0 ? -20 : 20) )+'+'+(coordinate[3] + (branchType === 0 ? 20 : -20))+'+0';
                                        link +='%0Ap+'+(coordinate[0] + (branchType === 0 ? -20 : 20) )+'+'+(coordinate[1] + (branchType === 0 ? -20 : 20))+'+'+(coordinate[2] + (branchType === 0 ? -20 : 20) )+'+'+(coordinate[3] + (branchType === 0 ? 20 : -20))+'+1+0';
                                        link +='%0Ar+'+coordinate[0]+'+'+coordinate[1]+'+'+coordinate[2]+'+'+coordinate[3]+'+0+'+res;
                                    } else {
                                        //halfBranch = (Math.abs(coordinate[0] - coordinate[2]) / 2);
                                        link +='%0Aw+'+coordinate[0]+'+'+coordinate[1]+'+'+(coordinate[0] + (branchType === 1? 20 : -20) )+'+'+(coordinate[1] + (branchType === 1 ? -20 : 20))+'+0';
                                        link +='%0Aw+'+coordinate[2]+'+'+coordinate[3]+'+'+(coordinate[2] + (branchType === 1 ? -20 : 20) )+'+'+(coordinate[3] + (branchType === 1 ? -20 : 20))+'+0';
                                        link +='%0Ap+'+(coordinate[0] + (branchType === 1 ? 20 : -20) )+'+'+(coordinate[1] + (branchType === 1 ? -20 : 20))+'+'+(coordinate[2] + (branchType === 1 ? -20 : 20) )+'+'+(coordinate[3] + (branchType === 1 ? -20 : 20))+'+1+0';
                                        link +='%0Ar+'+coordinate[0]+'+'+coordinate[1]+'+'+coordinate[2]+'+'+coordinate[3]+'+0+'+res;
                                    }
                                } else {
                                    link +='%0Ap+'+coordinate[0]+'+'+coordinate[1]+'+'+coordinate[2]+'+'+coordinate[3]+'+1+0';
                                }

                            } else {
                                if (type >= 1 && type < 6){
                                    link +='%0Aw+'+(coordinate[0]+offsetX)+'+'+coordinate[1]+'+'+(coordinate[2]+offsetX)+'+'+coordinate[3]+'+0';
                                }
                                link +='%0Aw+'+coordinate[0]+'+'+coordinate[1]+'+'+coordinate[2]+'+'+coordinate[3]+'+0';
                            }
                        }
                    }
                }
            }
        }
        /*if (type === 1){
            link +='%0A216+'+(ohmMeterCoord[0]+offsetX)+'+'+ohmMeterCoord[1]+'+'+(ohmMeterCoord[2]+offsetX)+'+'+ohmMeterCoord[3]+'+0+0.01'; 
        }*/
        link +='%0A';
        //console.log(link);
        return link;
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
        let meshes: Mesh[] = circuit.getMeshes();
        let commBrArray: number[][] = meshes[meshnumber-1].getCommonBranchesArray();
        for (let j = 0; j < commBrArray.length; j++){
            for (let i = 0; i < array.length; i++) {
                if (commBrArray[j][0] === array[i][0] && array[i][2] === commBrArray[j][3]) {
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
        return +(Math.random() * (max - min) + min).toFixed(1);
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
        return this.randomFloatNumber(24, 0.1);
        //return this.randomIntNumber(24, 1);
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
