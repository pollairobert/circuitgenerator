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
import { Branch } from "./branch";
import { Mesh } from "./mesh";
import { Circuit } from "./circuit";

/**
 * Aramkor generalasat vegzo osztaly. 
 */
export class CircuitGenerator {
    private fs = require('fs');
    private circuitCoordinatesToFalstad: string[] = []; 
    private circuitResistorsDetails: string[] = [];
    private multiplyResistorInBranch: string[] = [];
    
    /**
     * Aramkor generalasaert felelos. Ezzel a metodussal kezdodik a teljes halozat generalasaert felelos tobbi metodus meghivasa.
     * Bizonyos feladatoknal lehetosege van a felhesznalonak sajat hurokszam beallitasara, ilyenkor a parameterben megadott hurokszam fog 
     * beallitasra kerulni.
     * @param type aramkor tipusa adott struktura alapjan 
     * @param pieceOfMesh felhasznalo altal megadott hurokszam (opcionalis)
     */
    public generateCircuit(type: number, pieceOfMesh? :number): Circuit{
        let circuit: Circuit;
        if (pieceOfMesh !== undefined){
            circuit = this.buildFinalCircuit(new Circuit(this.circuitParameterLimits(type, pieceOfMesh)),type);
        } else {
            circuit = this.buildFinalCircuit(new Circuit(this.circuitParameterLimits(type)),type);
        }
        this.setCircuitElementCoordinatesArrayToFalstadExport(circuit, type);
        return circuit;
    }
    /**
     * A parameternek megfeleloen megad egy olyan tombot, ami a halozat generalasahoz
     * szukseges hurkok, elemek, kozos agak darabszamat tartalmazza.
     * parameters = [[hurkok maximalis szama],
     *               [ellenallasok maximalis szama],
     *               [aramgeneratorok maximalis szama],
     *               [feszultseggeneratorok maximalis szama],
     * Egyelore nem minden parameter kerul felhasznalasra, de egy kesobbi bovites folyaman esetleg jol johetnek.
     * 
     * Bizonyos feladatoknal lehetosege van a felhesznalonak sajat hurokszam beallitasara, ilyenkor a parameterben megadott hurokszam fog 
     * beallitasra kerulni.
     * @param type ez a parameter reprezentalja a halozat 'nehezsegi' szintjet
     * @param pieceOfMesh felhasznalo altal megadott hurokszam (opcionalis)
     */
    public circuitParameterLimits(type: number, pieceOfMesh?: number): number[]{
        let parameters: number[] = [];
        let temptype: number = type;
        let minMesh: number = 3;
        let maxMesh: number = 5;
        if (type >= 4 && type < 8){
            temptype = 4;
        }
        if (type === 9){
            temptype = 1;
        }
        if (type === 10){
            temptype = 3;
        }
        if (pieceOfMesh !== undefined){
            temptype = 4;
            if (pieceOfMesh < 11){
                minMesh = pieceOfMesh;
                maxMesh = pieceOfMesh;
            } else {
                minMesh = 3;
                maxMesh = 10;
            }
        }
        switch (temptype){
            //Egyszeru feszoszto, csak feszgennel
            case 1: {
                parameters = [this.randomIntNumber(2,2),
                              this.randomIntNumber(4,2),
                              this.randomIntNumber(0,0),
                              this.randomIntNumber(1,1)];
                break;
            }
            //Egyszeru 2 hurkos halozat (feszoszto), 1-nel tobb generatorral
            case 1.1: {
                parameters = [this.randomIntNumber(2,2),
                              this.randomIntNumber(4,2),
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
            //Random hurokszamu feladatokhoz tartozo parameterlista
            case 4: {
                parameters = [this.randomIntNumber(maxMesh,minMesh),
                              this.randomIntNumber(15,4),
                              this.randomIntNumber(0,0),
                              this.randomIntNumber(20,12)];
                break;
            }
            default: {
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
         * Azokat az ag tipusokat es hozzajuk tartozo hurok szamokat tartalmazza, 
         * amielyekhez megengedtt a kovetkezo hurok csatlakoztatatsa.
         * A halozat epito algoritmus hasznalja.
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

        if (type === 1 || type === 1.1 || type === 9){
            randomCommonBranchPair = this.randomChoiseInAnyArray([[1,3],[2,0],[0,2]]);
        } else if (type === 2 || type === 3 || type === 3.1 || type ===10){
            randomCommonBranchPair = this.randomChoiseInAnyArray([[1,3],[2,0],[0,2]]);
        } else if (type === 2.1){
            randomCommonBranchPair = [1,3];
        } 
        let multiConnection: boolean = true;
        let meshes: Mesh[] = circuit.getMeshes();
        if (type <= 6 || type === 9 || type === 10){
            for (let h = 1; h <= numberOfMeshes; h++){
                let connectBranches: number[] = [];
                let choiseMeshNumber: number;
                let multiBranch: number[];
                if (type === 1 || type === 1.1 || type === 2 || type === 2.1 || type === 3 || type === 3.1 || type === 9 || type === 10){
                    if (h < numberOfMeshes){
                        choiseMeshNumber = (h+1); 
                        if (type === 2.1 && h > 1){
                            randomCommonBranchPair = this.randomChoiseTwoAnything([0,2],[2,0]);
                        }
                        connectBranches.push(randomCommonBranchPair[0],randomCommonBranchPair[1],choiseMeshNumber,h);
                        meshes[h-1].setCommonBranchesArray(connectBranches);
                        this.addConnectedBranchFromCommmonBranchesArrayElement(circuit,h,choiseMeshNumber);
                    } 
                } 
                if (type > 3.1 && type <= 6){
                    choiseMeshNumber = (h+1);
                    for (let i = 0; i < 4; i++) {
                        acceptebleCommonBranchArray.push([commonBranchPairs[i][0],commonBranchPairs[i][1],h]);
                    }
                    if (h === 1){
                        randomCommonBranchPair = this.randomChoiseInAnyArray(commonBranchPairs);
                        connectBranches.push(randomCommonBranchPair[0],randomCommonBranchPair[1],choiseMeshNumber,h);
                        meshes[h-1].setCommonBranchesArray(connectBranches);
                        this.addConnectedBranchFromCommmonBranchesArrayElement(circuit,h,choiseMeshNumber);
                        this.deleteNotAcceptableBranchInArray(circuit, acceptebleCommonBranchArray, h);
                    } else if (h < numberOfMeshes){
                        let choiseType: number;
                        this.deleteNotAcceptableBranchInArray(circuit, acceptebleCommonBranchArray,h);
                        multiBranch = this.searchMultipleBranchTypeInAcceptableCommonBranchArray(acceptebleCommonBranchArray);
                        multiConnection = this.randomBoolean();
                        if (multiConnection){
                            choiseType = this.randomChoiseInAnyArray(multiBranch);
                            let choiseTypeCounter: number = this.counterOfChoiseTypeMultibranch(acceptebleCommonBranchArray,choiseType);
                            for (let i = 0; i < choiseTypeCounter; i++){
                                for (let j = 0; j < acceptebleCommonBranchArray.length; j++){
                                    if (choiseType === acceptebleCommonBranchArray[j][0]){
                                        connectBranches.push(acceptebleCommonBranchArray[j][0],acceptebleCommonBranchArray[j][1],choiseMeshNumber,acceptebleCommonBranchArray[j][2]);
                                        meshes[acceptebleCommonBranchArray[j][2]-1].setCommonBranchesArray(connectBranches);
                                        this.addConnectedBranchFromCommmonBranchesArrayElement(circuit,acceptebleCommonBranchArray[j][2],choiseMeshNumber);
                                        this.deleteNotAcceptableBranchInArray(circuit, acceptebleCommonBranchArray,acceptebleCommonBranchArray[j][2]);
                                        connectBranches = [];
                                        break;
                                    }
                                }
                            }
                        } else {
                            let inverz = this.setInverzMultipleBranch(multiBranch);
                            choiseType = this.randomChoiseInAnyArray(inverz);
                            for (let j = 0; j < acceptebleCommonBranchArray.length; j++){
                                if (choiseType === acceptebleCommonBranchArray[j][0]){
                                    connectBranches.push(acceptebleCommonBranchArray[j][0],acceptebleCommonBranchArray[j][1],choiseMeshNumber,acceptebleCommonBranchArray[j][2]);
                                    meshes[acceptebleCommonBranchArray[j][2]-1].setCommonBranchesArray(connectBranches);
                                    this.addConnectedBranchFromCommmonBranchesArrayElement(circuit,acceptebleCommonBranchArray[j][2],choiseMeshNumber);
                                    this.deleteNotAcceptableBranchInArray(circuit, acceptebleCommonBranchArray,acceptebleCommonBranchArray[j][2]);
                                    connectBranches = [];
                                }
                            }
                        }
                    }
                    if (h === numberOfMeshes){
                        this.deleteNotAcceptableBranchInArray(circuit, acceptebleCommonBranchArray,h);
                    }
                }
            }
        }
        if (type <= 6 || type === 9 || type === 10){
            this.setCommonBranchesInCircuit(circuit);
            this.setThevenin2PoleInCircuit(circuit, type);
            this.setVoltageSourceInCircuit(circuit, type);
            this.setResistanceInCircuit(circuit, type);
            this.setCommonBranchesCloneElement(circuit);
        }
        
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
        if (type <= 10){ //EZ ITT KERDESES??? type <= 7 volt!!!!
            this.setAllSizeOfCircuit(circuit);
            this.setElementsCoordinate(circuit);
        }
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
            for (let i = 0; i < branches.length; i++){
                if (branches[i].getType() === commonBranchesArray[h][0]){
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
                if (branches[i].getType() === branches[i-1].getType()){
                    if (i < branches.length-1 && (branches[i].getType() !== branches[i+1].getType())){
                        branches.splice(i,1);
                    } else
                    if (i === branches.length-1){
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
        if (type === 4 || type === 5 ){
            tempType = 4;
        } 
        if (type ===9){
            tempType = 1;
        }
        if (type === 6){
            tempType = 4;
        }
        switch (tempType){
            case 1 : {
                if (msh1CommBrArray[0][0] === 1){
                    if (mesh1branches[0].getBranchElements()[0] !== undefined) {
                        mesh1branches[0].setBranchElements(new Resistance(this.randomE6Resistance()));
                        circuitResistanceNumber--;
                        mesh1branches[1].setBranchElements(new Resistance(this.randomE6Resistance()));
                        circuitResistanceNumber--;
                        if (circuitResistanceNumber > 0){
                            if (this.percentRandom(70)){
                                mesh1branches[1].setBranchElements(new Resistance(this.randomE6Resistance()));
                                circuitResistanceNumber--;
                            }
                            if (this.percentRandom(70)){
                                mesh1branches[2].setBranchElements(new Resistance(this.randomE6Resistance()));
                            }
                        }
                    } else {
                        mesh1branches[2].setBranchElements(new Resistance(this.randomE6Resistance()));
                        circuitResistanceNumber--;
                        mesh1branches[1].setBranchElements(new Resistance(this.randomE6Resistance()));
                        circuitResistanceNumber--;
                        if (circuitResistanceNumber > 0){
                            if (this.percentRandom(70)){
                                mesh1branches[1].setBranchElements(new Resistance(this.randomE6Resistance()));
                                circuitResistanceNumber--;
                            }
                            if (this.percentRandom(70)){
                                mesh1branches[2].setBranchElements(new Resistance(this.randomE6Resistance()));
                            }
                        }
                    }
                } else if (msh1CommBrArray[0][0] === 2){
                    mesh1branches[1].setBranchElements(new Resistance(this.randomE6Resistance()));
                    circuitResistanceNumber--;
                    mesh1branches[2].setBranchElements(new Resistance(this.randomE6Resistance()));
                    circuitResistanceNumber--;
                    if (circuitResistanceNumber > 0){
                        if (this.percentRandom(70)){
                            mesh1branches[this.randomChoiseTwoNumber(1,2)].setBranchElements(new Resistance(this.randomE6Resistance()));
                            circuitResistanceNumber--;
                        }
                        if (this.percentRandom(70)){
                            mesh1branches[3].setBranchElements(new Resistance(this.randomE6Resistance()));
                        }
                    }
                } else if (msh1CommBrArray[0][0] === 0){
                    mesh1branches[1].setBranchElements(new Resistance(this.randomE6Resistance()));
                    circuitResistanceNumber--;
                    mesh1branches[0].setBranchElements(new Resistance(this.randomE6Resistance()));
                    circuitResistanceNumber--;
                    if (circuitResistanceNumber > 0){
                        if (this.percentRandom(70)){
                            mesh1branches[3].setBranchElements(new Resistance(this.randomE6Resistance()));
                            mesh1branches[this.randomChoiseTwoNumber(0,1)].setBranchElements(new Resistance(this.randomE6Resistance()));
                            circuitResistanceNumber--;
                        }
                        if (this.percentRandom(70)){
                             mesh1branches[3].setBranchElements(new Resistance(this.randomE6Resistance()));
                        }
                    }
                }
                break;
            }
            case 1.1 : {
                if (msh1CommBrArray[0][0] === 1){
                    if (mesh1branches[0].getBranchElements()[0] !== undefined){
                        mesh1branches[0].setBranchElements(new Resistance(this.randomE6Resistance()));
                        circuitResistanceNumber--;
                        mesh1branches[1].setBranchElements(new Resistance(this.randomE6Resistance()));
                        circuitResistanceNumber--;
                        if (this.percentRandom(40)){
                            mesh1branches[2].setBranchElements(new Resistance(this.randomE6Resistance()));
                        }
                    } else {
                        mesh1branches[1].setBranchElements(new Resistance(this.randomE6Resistance()));
                        circuitResistanceNumber--;
                        mesh1branches[0].setBranchElements(new Resistance(this.randomE6Resistance()));
                        circuitResistanceNumber--;
                        if (this.percentRandom(40)){
                            mesh1branches[0].setBranchElements(new Resistance(this.randomE6Resistance()));
                        }
                    }
                    
                    
                    
                } else if (msh1CommBrArray[0][0] === 0 || msh1CommBrArray[0][0] === 2){
                    mesh1branches[0].setBranchElements(new Resistance(this.randomE6Resistance()));
                    circuitResistanceNumber--;
                    mesh1branches[2].setBranchElements(new Resistance(this.randomE6Resistance()));
                    circuitResistanceNumber--;
                    if (circuitResistanceNumber > 0){
                        if (this.percentRandom(70)){
                            mesh1branches[1].setBranchElements(new Resistance(this.randomE6Resistance()));
                            circuitResistanceNumber--;
                        }
                        if (this.percentRandom(40)){
                            mesh1branches[3].setBranchElements(new Resistance(this.randomE6Resistance()));
                            }
                    }
                } 
                break;
            }
            case 2: {
                for (let i = 0; i < circuit.getNumberOfMesh(); i++){
                    let branches: Branch[] = meshes[i].getBranches();
                    if (i < circuit.getNumberOfMesh()-1){
                        for (let j= 0; j < branches.length; j++){
                            let branchType: number = branches[j].getType();
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
                                if ((branchType === 0 || branchType === 1) && i === 0){
                                    branches[j].setBranchElements(new Resistance(this.randomE6Resistance()));
                                    circuitResistanceNumber--;
                                } else if ((branchType === 0 || branchType === 2) && i > 0) {
                                    branches[j].setBranchElements(new Resistance(this.randomE6Resistance()));
                                    circuitResistanceNumber--;
                                }
                            } else if (meshes[circuit.getNumberOfMesh()-1].getCommonBranchesArray()[0][0] === 2){
                                if ((branchType === 1 || branchType === 2) && i === 0){
                                    branches[j].setBranchElements(new Resistance(this.randomE6Resistance()));
                                    circuitResistanceNumber--;
                                } else if ((branchType === 0 || branchType === 2) && i > 0){
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
                                        } else {
                                            if (branchType === 0){
                                                if (circuitResistanceNumber > 3 && this.randomBoolean()){
                                                    branches[j].setBranchElements(new Resistance(this.randomE6Resistance()));
                                                }
                                            } else {
                                                branches[j].setBranchElements(new Resistance(this.randomE6Resistance()));
                                            }
                                        }
                                    }
                                } else {
                                    if (branchType === 1){
                                        branches[j].setBranchElements(new Resistance(this.randomE6Resistance()));
                                    } 
                                    if (branchType === 2){
                                        if (i === 0){
                                            branches[j].setBranchElements(new Resistance(this.randomE6Resistance()));
                                        } else {
                                            if (circuitResistanceNumber > 3 && this.randomBoolean()){
                                                branches[j].setBranchElements(new Resistance(this.randomE6Resistance()));
                                            }
                                        }
                                    }
                                }
                            } else if (meshes[i].getCommonBranchesArray()[0][0] === 0 || meshes[i].getCommonBranchesArray()[0][0] === 2){
                                if (i === 0){
                                    if (branchType === 2 || branchType === 0){
                                        branches[j].setBranchElements(new Resistance(this.randomE6Resistance()));
                                    }
                                } else if (branchType === 2 && meshes[i].getCommonBranchesArray()[0][0] === 0){
                                    branches[j].setBranchElements(new Resistance(this.randomE6Resistance()));
                                } else if (branchType === 0 && meshes[i].getCommonBranchesArray()[0][0] === 2){
                                    branches[j].setBranchElements(new Resistance(this.randomE6Resistance()));
                                } else if (branchType === 1){
                                    if (circuitResistanceNumber > 3 && this.randomBoolean()){
                                        branches[j].setBranchElements(new Resistance(this.randomE6Resistance()));
                                    }
                                }
                            } 
                        }
                    }
                }
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
                                    if (this.percentRandom(70)){
                                        branch.setBranchElements(new Resistance(this.randomE6Resistance()));
                                    }
                                    if (this.percentRandom(10) && !oneres){
                                        branch.setBranchElements(new Resistance(this.randomE6Resistance()));
                                    }
                                } else if (commBrArray[0][0] !== branch.getType() && (type === 4 ? h < circuit.getNumberOfMesh()-1 : /*((type === 5) ? true :*/ true)){
                                    if (branches[i].getCommon() !== meshes[h].getMeshNumber()){
                                        branch.setBranchElements(new Resistance(this.randomE6Resistance()));
                                    } else if (this.percentRandom(70)){
                                        branch.setBranchElements(new Resistance(this.randomE6Resistance()));
                                        }
                                    if (this.percentRandom(30)){
                                        branch.setBranchElements(new Resistance(this.randomE6Resistance()));
                                    }
                                }
                            }
                        }
                    }
                }
                break;
            }
            case 10: {
                let resistance: number = this.randomE6Resistance();
                if (msh1CommBrArray[0][0] === 1){
                    mesh1branches[1].setBranchElements(new Resistance(resistance));
                    mesh1branches[1].getBranchElements()[1].setNumber(2);
                    this.circuitResistorsDetails.push("R2 "+resistance);
                    if (this.randomChoiseTwoNumber(0,2) === 0){
                        mesh1branches[0].setBranchElements(new Resistance(resistance));
                        this.circuitResistorsDetails.push("R1 "+resistance);
                        if (mesh1branches[0].getBranchElements()[0].getId() !== "V"){
                            mesh1branches[0].getBranchElements()[0].setNumber(1);
                        } else {
                            mesh1branches[0].getBranchElements()[1].setNumber(1);
                        }
                        meshes[1].getBranches()[1].setBranchElements(new Resistance(0.1));
                        meshes[1].getBranches()[1].getBranchElements()[0].setNumber(3);
                    } else {
                        mesh1branches[2].setBranchElements(new Resistance(resistance));
                        this.circuitResistorsDetails.push("R1 "+resistance);
                        if (mesh1branches[2].getBranchElements()[0].getId() !== "V"){
                            mesh1branches[2].getBranchElements()[0].setNumber(1);
                        } else {
                            mesh1branches[2].getBranchElements()[1].setNumber(1);
                        }
                        meshes[1].getBranches()[1].setBranchElements(new Resistance(0.1));
                        meshes[1].getBranches()[1].getBranchElements()[0].setNumber(3);
                    }
                } else if (msh1CommBrArray[0][0] === 2 || msh1CommBrArray[0][0] === 0){
                    mesh1branches[0].setBranchElements(new Resistance(resistance));
                    mesh1branches[2].setBranchElements(new Resistance(resistance));
                    if (msh1CommBrArray[0][0] === 2){
                        meshes[1].getBranches()[2].setBranchElements(new Resistance(0.1));
                        meshes[1].getBranches()[2].getBranchElements()[0].setNumber(3);
                        mesh1branches[0].getBranchElements()[1].setNumber(1);
                        this.circuitResistorsDetails.push("R1 "+resistance);
                        mesh1branches[2].getBranchElements()[1].setNumber(2);
                        this.circuitResistorsDetails.push("R2 "+resistance);
                    } else if (msh1CommBrArray[0][0] === 0){
                        meshes[1].getBranches()[0].setBranchElements(new Resistance(0.1));
                        meshes[1].getBranches()[0].getBranchElements()[0].setNumber(3);
                        mesh1branches[2].getBranchElements()[1].setNumber(1);
                        this.circuitResistorsDetails.push("R1 "+resistance);
                        mesh1branches[0].getBranchElements()[1].setNumber(2);
                        this.circuitResistorsDetails.push("R2 "+resistance);
                    }
                } 
                break;
            }
            default: {
                break;
            }
        }
    }
    /**
     * Megfelelo feltelek figyelembe vetelevel hozzaadja az aramkorhoz a feszultseggenerator(oka)t.
     * 
     * @param circuit aramkor objektum
     * @param type feladat tipusa
     */
    public setVoltageSourceInCircuit(circuit: Circuit, type: number): void{
        let meshes: Mesh[] = circuit.getMeshes();
        let mesh1branches: Branch[] = meshes[0].getBranches();
        let msh1CommBrArray: number[][] = meshes[0].getCommonBranchesArray();
        let tempType:  number = type;
        if (type > 3.1 && type <=6){
            tempType = 4;
        } 
        if (type === 9){
            tempType = 1;
        }
        switch (tempType){
            case 1: {
                if (msh1CommBrArray[0][0] === 1){
                    if (this.randomChoiseTwoNumber(0,2) === 0){
                        mesh1branches[0].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),(type === 9 ? false :this.randomBoolean())));
                    } else {
                        mesh1branches[2].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),(type === 9 ? false :this.randomBoolean())));
                    }
                } else if (msh1CommBrArray[0][0] === 2){
                    mesh1branches[0].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),(type === 9 ? false :this.randomBoolean())));
                } else {
                    mesh1branches[2].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),(type === 9 ? false :this.randomBoolean())));
                }
                break;
            }
            case 1.1: {
                if (msh1CommBrArray[0][0] === 1){
                    mesh1branches[this.randomChoiseTwoNumber(0,2)].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                    mesh1branches[1].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                } else if (msh1CommBrArray[0][0] === 0 || msh1CommBrArray[0][0] === 2) {
                    mesh1branches[0].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                    mesh1branches[2].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                } 
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
                    mesh1branches[1].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(), this.randomBoolean()));
                    if (this.randomChoiseTwoNumber(0,2) === 0){
                        mesh1branches[0].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),(type === 10 ? false : this.randomBoolean())));
                    } else {
                        mesh1branches[2].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),(type === 10 ? false : this.randomBoolean())));
                    }
                } else if (msh1CommBrArray[0][0] === 2 || msh1CommBrArray[0][0] === 0){
                    mesh1branches[0].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                    mesh1branches[2].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                } 
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
                break;
            }
            case 4: {
                let maxVoltageSource: number = circuit.getParameters()[3];
                for (let h = 0; h < circuit.getNumberOfMesh(); h++){
                    let branches: Branch[] = meshes[h].getBranches();
                    let commBrArray: number[][] = meshes[h].getCommonBranchesArray();
                    let voltageSourceCounter: number = 0;
                    let percent: number = this.randomIntNumber(100,40);
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
                                    percent += 30;
                                }
                            } else if (commBrArray[0][0] !== branches[i].getType() && (type === 5 ? true : h < circuit.getNumberOfMesh()-1)){
                                if (maxVoltageSource > 0){
                                    if (this.percentRandom(percent)){
                                        branches[i].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                                        voltageSourceCounter++;
                                        maxVoltageSource--;
                                        percent = 1;
                                    }
                                }
                            }
                        }
                    }
                }
                break;
            }
            case 10: {
                let voltage: number = this.randomIntNumber(24,2);
                if (msh1CommBrArray[0][0] === 1){
                    mesh1branches[1].setBranchElements(new VoltageSource(voltage, false));
                    mesh1branches[1].getBranchElements()[0].setNumber(2);
                    if (this.randomChoiseTwoNumber(0,2) === 0){
                        mesh1branches[0].setBranchElements(new VoltageSource(voltage, false));
                        mesh1branches[0].getBranchElements()[0].setNumber(1);
                    } else {
                        mesh1branches[2].setBranchElements(new VoltageSource(voltage,false));
                        mesh1branches[2].getBranchElements()[0].setNumber(1);
                    }
                } else if (msh1CommBrArray[0][0] === 2 || msh1CommBrArray[0][0] === 0){
                    mesh1branches[0].setBranchElements(new VoltageSource(voltage,false));
                    mesh1branches[2].setBranchElements(new VoltageSource(voltage,false));
                    if (msh1CommBrArray[0][0] === 2){
                        mesh1branches[0].getBranchElements()[0].setNumber(1);
                        mesh1branches[2].getBranchElements()[0].setNumber(2);
                    } else {
                        mesh1branches[2].getBranchElements()[0].setNumber(1);
                        mesh1branches[0].getBranchElements()[0].setNumber(2);
                    }
                } 
                break;
            }
            default: {
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
        if (type <= 4 || type === 9 || type === 10){
            tempType = 1;
        }
        if (type === 6){
            tempType = this.randomChoiseTwoNumber(1,5);
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
                randomChoise = this.randomChoiseInAnyArray(tempArray);
                for (let i = 0; i < meshes[randomChoise[3]-1].getBranches().length; i++){
                    let branch = meshes[randomChoise[3]-1].getBranches()[i];
                    if (branch.getType() === randomChoise[0]){
                        branch.setTh2Pole(true);
                    }
                }
                break;
            }
            default: {
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

    /**
     * Beallitja a halozat osszes aganak es elemenek mertet a kesobbi megjeleniteshez.
     * @param circuit aramkor objektum
     */
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
    }
    /**
     * Beallitja az aramkor osszes elemenek a kezdo es a veg koordinatait.
     * A megjeleniteshez kellenek a koordinatak.
     * @param circuit aramkor objektum
     */
    public setElementsCoordinate(circuit: Circuit): void {
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
                        let coordinateArray: number[] = meshes[commBrArray[0][2]-1].getBranches()[0].getBranchElements()[0].getCoordinate();
                        if (commBrArray[0][0] === 0){
                            startPosition[0] = coordinateArray[0] + meshes[h-1].getMeshBranchesSize()[3];
                            startPosition[1] = coordinateArray[1];
                        }
                        if (commBrArray[0][0] === 1){
                            startPosition[1] = coordinateArray[1] + meshes[h].getMeshBranchesSize()[0];
                            startPosition[0] = coordinateArray[0];
                        }
                        if (commBrArray[0][0] === 2){
                            startPosition[0] = coordinateArray[0] - meshes[h].getMeshBranchesSize()[3];
                            startPosition[1] = coordinateArray[1];
                        }
                        if (commBrArray[0][0] === 3){
                            startPosition[1] = coordinateArray[1] - meshes[h-1].getMeshBranchesSize()[0];
                            startPosition[0] = coordinateArray[0];
                        }
                    } else
                    if (commBrArray[0][0] === commBrArray[1][0]){
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
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            startPosition[1] = maxY;
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
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            startPosition[0] = minX;
                            startPosition[1] += meshes[h].getMeshBranchesSize()[0];
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
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            startPosition[1] = maxY;
                            startPosition[0] -= meshes[h].getMeshBranchesSize()[3];
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
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            startPosition[0] = minX;
                        }
                    }
                }
            } 
            for (let i = 0; i < branches.length; i++){
                let elements: CircuitElements[] = branches[i].getBranchElements();
                for (let j = 0; j < elements.length; j++){
                    let type: number = branches[i].getType();
                    startX = startPosition[0];
                    startY = startPosition[1];
                    endX = startPosition[0] + (type === 1 ? elements[j].getElementSize() : (type === 3 ?  -elements[j].getElementSize() : 0));
                    endY = startPosition[1] + (type === 0 ? - elements[j].getElementSize() : (type === 2 ? elements[j].getElementSize() : 0));
                    elements[j].setCoordinate(startX,startY,endX,endY);
                    startPosition = [endX,endY];
                }
            }
        }
        this.deleteElementsCoordinateOfConnectedMesh(circuit);
    }
    /**
     * A megjeleniteshez a modell altal letrehozott aramkor nem megflelo, mivel ugy kezeli az egyes hurkokat mint kulonallo egysegeket, 
     * azaz a kozos agakbol ketto van, de megjeleniteni csak egyet kell.
     * ez a fuggveny vegzi el a megfelelo kozos ag torleset.
     * @param circuit aramkor objektum
     */
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
    
    /**
     * Megkeresi hogy ket csomopont kozotti agban melyik ellenallasok vannak.
     * @param circuitResDet aramkor ellenallasainak ertekesit es jeloleset tertelmazo tomb (pl. R3 2200)
     */
    public setMultiplyResistorInBranch(circuitResDet: string[]): void{
        var cloneCircResDet = circuitResDet.slice(0);
        cloneCircResDet.sort((a, b) => { return +b.split(" ")[2] - (+a.split(" ")[2])});
        var multitemp = [];
        for (let i = 0; i < cloneCircResDet.length; i++){
            var resistor = cloneCircResDet[i].split(" ");
            if ((resistor[1] !== resistor[2])){
                multitemp.push(resistor[2]);
            }
        }
        let temp = Array.from(new Set(multitemp));
        for (let h = 0; h < temp.length; h++){
            var multitmp = [temp[h]];
            for (let i = 0; i < cloneCircResDet.length; i++){
                var resistor = cloneCircResDet[i].split(" ");
                if (+temp[h] === +resistor[2]){
                    multitmp.push(resistor[0]);
                }
            }
            this.multiplyResistorInBranch.push(multitmp.join(" "));
        }
    }

    /**
     * Feltolt egy string tombot az aramkor elemeinel elmentettt adatokkal ugy, hogy az teljesen falstad export kompatibilis legyen.
     * Ez a tomb van felhasznalva a halozat sajat megjelenitesenel is.
     * @param circuit aramkor objektum
     * @param type feladat tipusa
     */
    public setCircuitElementCoordinatesArrayToFalstadExport(circuit: Circuit, type?: number):void{
        this.circuitCoordinatesToFalstad = [];
        let meshes: Mesh[] = circuit.getMeshes();
        let allResistanceCounter: number = 0;
        let allVoltageSourceCounter: number = 0;
        let task10inputVoltage: number;
        for (let h = 0; h < circuit.getNumberOfMesh(); h++){
            let branches: Branch[] = meshes[h].getBranches();
            let commonBranchRes;
            for (let j = 0; j < branches.length; j++){
                if (branches[j].getCommon() !== circuit.getMeshes()[h].getMeshNumber()){
                    commonBranchRes = branches[j].getBranchResistance();
                }
            }
            for (let i = 0;  i < branches.length; i++){
                let elements: CircuitElements[] = branches[i].getBranchElements();
                let isCommon: boolean = false;
                if (branches[i].getCommon() !== meshes[h].getMeshNumber()){
                    isCommon = true;
                }
                for (let j = 0; j < elements.length; j++){
                    if (elements[j].getCoordinate()[0] !== undefined){
                        let coordinate: number[] = elements[j].getCoordinate();
                        if (elements[j].getId() === 'W'){
                            if (branches[i].getTh2Pole()){
                                if (type === 6 || type === 5){
                                    if (isCommon){
                                        this.circuitCoordinatesToFalstad.push('p '+coordinate[0]+' '+coordinate[1]+' '+coordinate[2]+' '+coordinate[3]+' 1 0 com '+meshes[h].getMeshNumber()+''+branches[i].getType());
                                    }else{
                                        this.circuitCoordinatesToFalstad.push('p '+coordinate[0]+' '+coordinate[1]+' '+coordinate[2]+' '+coordinate[3]+' 1 0');
                                    }
                                } else {
                                    this.circuitCoordinatesToFalstad.push('p '+coordinate[0]+' '+coordinate[1]+' '+coordinate[2]+' '+coordinate[3]+' 1 0');
                                } 
                            } else {
                                if (isCommon){
                                    this.circuitCoordinatesToFalstad.push('w '+coordinate[0]+' '+coordinate[1]+' '+coordinate[2]+' '+coordinate[3]+' 0 com '+meshes[h].getMeshNumber()+''+branches[i].getType());
                                }else{
                                    this.circuitCoordinatesToFalstad.push('w '+coordinate[0]+' '+coordinate[1]+' '+coordinate[2]+' '+coordinate[3]+' 0');
                                }
                            }
                        }
                        if (elements[j].getId() === 'R'){
                            if (type < 10){
                                allResistanceCounter++;
                                branches[i].setResistanceOfBranch(allResistanceCounter);
                                elements[j].setNumber(allResistanceCounter);
                            }
                            let resistance: number = elements[j].getResistance();
                            if (type < 10){
                                if (branches[i].getCommon() !== circuit.getMeshes()[h].getMeshNumber()){
                                    this.circuitResistorsDetails.push("R"+allResistanceCounter+" "+elements[j].getResistance()+" "+branches[i].getBranchResistance());
                                } else {
                                    this.circuitResistorsDetails.push("R"+allResistanceCounter+" "+elements[j].getResistance()+" "+(meshes[h].getMeshResistance() - commonBranchRes));
                                }
                            }
                            if (isCommon){
                                this.circuitCoordinatesToFalstad.push('r '+coordinate[0]+' '+coordinate[1]+' '+coordinate[2]+' '+coordinate[3]+' 0 '+resistance+' '+elements[j].getNumber()+' com '+meshes[h].getMeshNumber()+''+branches[i].getType());
                            }else{
                                this.circuitCoordinatesToFalstad.push('r '+coordinate[0]+' '+coordinate[1]+' '+coordinate[2]+' '+coordinate[3]+' 0 '+resistance+' '+elements[j].getNumber());
                            }
                        }
                        if (elements[j].getId() === 'V'){
                            if (type < 10){
                                allVoltageSourceCounter++;
                                elements[j].setNumber(allVoltageSourceCounter);
                            }
                            let voltage: number;
                            if (elements[j].getDirection()){
                                voltage = -elements[j].getVoltage();
                            } else {
                                voltage = elements[j].getVoltage();
                            }
                            if (type === 10){
                                task10inputVoltage = Math.abs(voltage);
                            }
                            if (isCommon){
                                this.circuitCoordinatesToFalstad.push('v '+coordinate[0]+' '+coordinate[1]+' '+coordinate[2]+' '+coordinate[3]+' 0 0 40 '+voltage+' 0 0 0.5 '+elements[j].getNumber() + ' com '+meshes[h].getMeshNumber()+''+branches[i].getType());
                            }else{
                                this.circuitCoordinatesToFalstad.push('v '+coordinate[0]+' '+coordinate[1]+' '+coordinate[2]+' '+coordinate[3]+' 0 0 40 '+voltage+' 0 0 0.5 '+elements[j].getNumber());
                            }
                        }
                        if (elements[j].getId() === 'C'){
                            if (isCommon){
                                this.circuitCoordinatesToFalstad.push('c '+coordinate[0]+' '+coordinate[1]+' '+coordinate[2]+' '+coordinate[3]+' 0 com '+meshes[h].getMeshNumber()+''+branches[i].getType());
                            }else{
                                this.circuitCoordinatesToFalstad.push('c '+coordinate[0]+' '+coordinate[1]+' '+coordinate[2]+' '+coordinate[3]+' 0');
                            }
                        }
                    }
                }
            }
        }
        circuit.setExpOutVolt(this.randomIntNumber(task10inputVoltage-1,1));
        circuit.setNumberOfResistors(allResistanceCounter);
    }
    /**
     * A parameterek fuggvenyeben legeneralja a feladatok vegen elerhetove valo FALSTAD linket.
     * @param circuit aramkor objektum
     * @param type feladat tipusa (opcionalis)
     * @param res vagy a feszmero belso ellenallasa, vagy a generator ellenallasa
     * @param volt csatlakoztatott generator feszultsege
     */
    public generateFalstadLink(circuit: Circuit, type?: number, res?: number, volt?: number):string{
        let meshes: Mesh[] = circuit.getMeshes();
        let link: string = 'https://www.falstad.com/circuit/circuitjs.html?cct=$+1+0.000005+10.20027730826997+50+5+43';
        let positiveX:number = -Infinity, positiveY: number = -Infinity;
        let negativX:number = Infinity, negativY: number = Infinity;
        let offsetX: number;
        let ohmMeterCoord: number[] = [];
        let halfBranch: number;
        if ((type >= 1 && type < 6) || type === 9 || type === 10){
            let coordinates = this.circuitCoordinatesToFalstad;
            for(var i = 0; i < coordinates.length; i++){
                var branchCoordinates = coordinates[i].split(" ");
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
                            link +='%0Ar+'+coordinate[0]+'+'+coordinate[1]+'+'+coordinate[2]+'+'+coordinate[3]+'+0+'+resistance + (type === 10 ? '+'+elements[j].getNumber() : '');
                            if ((type >= 1 && type < 6) || type === 9 || type === 10){
                                link +='%0Ar+'+(coordinate[0]+offsetX)+'+'+coordinate[1]+'+'+(coordinate[2]+offsetX)+'+'+coordinate[3]+'+0+'+resistance + (type === 10 ? '+'+elements[j].getNumber() : '');
                            }
                        }
                        if (elements[j].getId() === 'V'){
                            let voltage: number;
                            if (elements[j].getDirection()){
                                voltage = -elements[j].getVoltage();
                            } else {
                                voltage = elements[j].getVoltage();
                            }
                            if ((type >= 1 && type < 6) || type === 9 || type === 10){
                                if (type !== 10){
                                    link +='%0Aw+'+(coordinate[0]+offsetX)+'+'+coordinate[1]+'+'+(coordinate[2]+offsetX)+'+'+coordinate[3]+'+0';
                                } else {
                                    if (branches[i].getCommon() !== meshes[h].getMeshNumber()){
                                        link +='%0Av+'+(coordinate[0]+offsetX)+'+'+coordinate[1]+'+'+(coordinate[2]+offsetX)+'+'+coordinate[3]+'+0+0+40+'+(-voltage)+'+0+0+0.5'+ (type === 10 ? '+'+elements[j].getNumber() : '');
                                    } else {
                                        link +='%0Av+'+(coordinate[0]+offsetX)+'+'+coordinate[1]+'+'+(coordinate[2]+offsetX)+'+'+coordinate[3]+'+0+0+40+'+voltage+'+0+0+0.5'+(type === 10 ? '+'+elements[j].getNumber() : '');
                                    }
                                }
                                link +='%0Av+'+coordinate[0]+'+'+coordinate[1]+'+'+coordinate[2]+'+'+coordinate[3]+'+0+0+40+'+voltage+'+0+0+0.5'+(type === 10 ? '+'+elements[j].getNumber() : '');
                            } else {
                                link +='%0Av+'+coordinate[0]+'+'+coordinate[1]+'+'+coordinate[2]+'+'+coordinate[3]+'+0+0+40+'+voltage+'+0+0+0.5';
                            }
                        }
                        if (elements[j].getId() === 'C'){
                            link +='%0Ac+'+coordinate[0]+'+'+coordinate[1]+'+'+coordinate[2]+'+'+coordinate[3]+'+0';
                        }
                        if (elements[j].getId() === 'W'){
                            if (branches[i].getTh2Pole()){
                                if (type === 6 || type === 8 || type === 7){
                                    if (branchType === 0 || branchType === 2){
                                        halfBranch = (Math.abs(coordinate[1] - coordinate[3]) / 2);
                                        link +='%0Aw+'+coordinate[0]+'+'+coordinate[1]+'+'+(coordinate[0] + (branchType === 0 ? -20 : 20) )+'+'+(coordinate[1] + (branchType === 0 ? -20 : 20))+'+0';
                                        link +='%0Aw+'+coordinate[2]+'+'+coordinate[3]+'+'+(coordinate[2] + (branchType === 0 ? -20 : 20) )+'+'+(coordinate[3] + (branchType === 0 ? 20 : -20))+'+0';
                                        link +='%0Ar+'+coordinate[0]+'+'+coordinate[1]+'+'+coordinate[2] + '+'+(coordinate[3] + (branchType === 0 ? halfBranch : -halfBranch ))+'+0+'+ res;
                                        link +='%0A'+(type === 6 ? "370" : type === 7 ? "s" : "v") +'+'+coordinate[2] + '+'+(coordinate[3] + (branchType === 0 ? halfBranch : -halfBranch ))+'+'+coordinate[2] + '+'+coordinate[3]+'+'+(type === 6 ? '+1+0' : type ===7 ? '+0+1+false' : '+0+0+40+'+(-volt)+'+0+0+0.5');
                                        link +='%0Ap+'+(coordinate[0] + (branchType === 0 ? -20 : 20) )+'+'+(coordinate[1] + (branchType === 0 ? -20 : 20))+'+'+(coordinate[2] + (branchType === 0 ? -20 : 20) )+'+'+(coordinate[3] + (branchType === 0 ? 20 : -20))+'+1+0';
                                        
                                    } else {
                                        halfBranch = (Math.abs(coordinate[0] - coordinate[2]) / 2);
                                        link +='%0Aw+'+coordinate[0]+'+'+coordinate[1]+'+'+(coordinate[0] + (branchType === 1? 20 : -20) )+'+'+(coordinate[1] + (branchType === 1 ? -20 : 20))+'+0';
                                        link +='%0Aw+'+coordinate[2]+'+'+coordinate[3]+'+'+(coordinate[2] + (branchType === 1 ? -20 : 20) )+'+'+(coordinate[3] + (branchType === 1 ? -20 : 20))+'+0';
                                        link +='%0Ar+'+coordinate[0]+'+'+coordinate[1]+'+'+(coordinate[2] + (branchType === 1 ? - halfBranch : halfBranch )) + '+'+coordinate[3]+'+0+'+ res;
                                        link +='%0A'+(type === 6 ? "370" : type === 7 ? "s" : "v") +'+'+(coordinate[2] + (branchType === 1 ? - halfBranch : halfBranch )) + '+'+coordinate[3]+'+'+coordinate[2] + '+'+coordinate[3]+'+'+(type === 6 ? '+1+0' : type ===7 ? '+0+1+false' : '+0+0+40+'+(-volt)+'+0+0+0.5');
                                        link +='%0Ap+'+(coordinate[0] + (branchType === 1 ? 20 : -20) )+'+'+(coordinate[1] + (branchType === 1 ? -20 : 20))+'+'+(coordinate[2] + (branchType === 1 ? -20 : 20) )+'+'+(coordinate[3] + (branchType === 1 ? -20 : 20))+'+1+0';
                                        
                                    }
                                } else if ((type >= 1 && type < 6) || type === 9 || type === 10){
                                    ohmMeterCoord.push(coordinate[0],coordinate[1],coordinate[2],coordinate[3])
                                    link +='%0Ap+'+coordinate[0]+'+'+coordinate[1]+'+'+coordinate[2]+'+'+coordinate[3]+'+1+0';
                                    if (type !== 10){
                                        link +='%0A216+'+(coordinate[0]+offsetX)+'+'+coordinate[1]+'+'+(coordinate[2]+offsetX)+'+'+coordinate[3]+'+0+0.0001';
                                    } else {
                                        link +='%0Ap+'+(coordinate[0]+offsetX)+'+'+coordinate[1]+'+'+(coordinate[2]+offsetX)+'+'+coordinate[3]+'+1+0';
                                    }

                                } else {
                                    link +='%0Ap+'+coordinate[0]+'+'+coordinate[1]+'+'+coordinate[2]+'+'+coordinate[3]+'+1+0';
                                }

                            } else {
                                if ((type >= 1 && type < 6) || type === 9 || type === 10){
                                    link +='%0Aw+'+(coordinate[0]+offsetX)+'+'+coordinate[1]+'+'+(coordinate[2]+offsetX)+'+'+coordinate[3]+'+0';
                                }
                                link +='%0Aw+'+coordinate[0]+'+'+coordinate[1]+'+'+coordinate[2]+'+'+coordinate[3]+'+0';
                            }
                        }
                    }
                }
            }
        }
        link +='%0A';
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
    /**
     * A generalasi folyamatban resztvevo fuggveny, amely akkor hivodik meg, ha a kovetkezo hurok, amit generalni fog a rendszer
     * tobb meglevo hurokkal is kozos aga lesz. Ilyenkor ez a fgv fogja megszamolni mennyi erintett ag fog szerepelni a kapcsolatban
     * @param array elfogadhato kapcsolati agakat tartalmazo tomb
     * @param choiseType csatlakozas tipusa, ahogy a kovetkezo hurok fog csatlakozni a mar legeneralt aramkorhoz
     */
    public counterOfChoiseTypeMultibranch(array: number[][], choiseType: number): number{
        let count: number = 0;
        for (let i = 0; i < array.length; i++){
            if (choiseType === array[i][0]){
                count++;
            }
        }
        return count;
    }

    /**
     * A generalasi folyamatban resztvevo fuggveny, amely torli a parameterul kapott elfogadhato kapcsolati agakat tartalmazo tomb azon
     * elemeit, amihez mar nem lehet csatlakozni, mivel csatlakozott mar hozza hurok.
     * @param circuit armkor obj.
     * @param array elfogadhato kapcsolati agakat tartalmazo tomb
     * @param meshnumber huroknak a szama
     */
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
    
    /**
     * Megkeresi azokat a kozos agakhoz tartozo parametereket a parameterul kapott elfogadhato kapcsolati agakat tartalmazo tombben,
     * amikhez lehetseges a egy hurokkal csatlakozni.
     * @param array elfogadhato kapcsolati agakat tartalmazo tomb
     */
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
    /**
     * Kivalogatja azokat az aghoz tartozo parametereket, amihez csak egyszeres kapcsolatot lehet letrehozni.
     * @param array elfogadhato kapcsolati agakat tartalmazo tomb
     */
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
     * Osztaly getter metodusok a propertykhez.
     */
    public getMultiplyResistorInBranch(): string[]{
        return this.multiplyResistorInBranch;
    }
    public getCircuitResistorsDetails():string[]{
        return this.circuitResistorsDetails;
    }
    public getCircuitCoordinatesToFalstad():string[]{
        return this.circuitCoordinatesToFalstad;
    }

    /**
     * Megadott intervallumu egesz szamokbol allo sorbol kivalaszt random 1-et.
     * @param max kivant legnagyobb lehetseges egesz szam
     * @param min kivant legkisebb lehetseges egesz szam
     */
    public randomIntNumber(max: number, min: number): number {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
    /**
     * Megadott intervallum kozott random kivalaszt egy egy tizedesjegyu szamot.
     * @param max kivant legnagyobb lehetseges szam
     * @param min kivant legkisebb lehetseges szam
     */
    public randomFloatNumber(max: number, min: number): number {
        return +(Math.random() * (max - min) + min).toFixed(1);
    }
    /**
     * Random igaz - hamis
     */
    public randomBoolean(): boolean {
        if ((Math.floor(Math.random() * 2) + 1) === 1) {
            return false;
        } else {
            return true;
        }
    }
    /**
     * Feszultseggenerator random ertekenek generalasahoz hasznalatos.
     */
    public randomVoltageSourceValue(int? : boolean, max?: number, min?: number): number {
        if (int){
            return this.randomIntNumber(max, min);
        } else {
            return this.randomFloatNumber(24, 0.1);
        }
        //return this.randomIntNumber(24, 1);
    }
    /**
     * Aramgenerator random ertekenek generalasahoz hasznalatos.
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

    /**
     * Random noveli, vagy csokkenti egyel az erteket amihez meghivjak 
     */
    public randomIncrementOrDecrement():number{
        let number: number;
        if ((Math.floor(Math.random() * 2) + 1) === 1) {
            number = 1;
        } else {
            number = (3-4);
        }
        return number;
    }

    /**
     * Ket megadott szam kozul random kivalaszt egyet
     * @param one 
     * @param two 
     */
    public randomChoiseTwoNumber(one: number, two: number):number{
        if (this.randomBoolean()) {
            return one;
        } else {
            return two;
        }
    }

    /**
     * Ket barmilyen megadott tipus kozul kivalaszt egyet random
     * @param one 
     * @param two 
     */
    public randomChoiseTwoAnything(one: any, two: any):any{
        if (this.randomBoolean()) {
            return one;
        } else {
            return two;
        }
    }
    
    /**
     * A parameterul kapott tomb elemei kozul random kivalaszt egyet
     * @param array
     */
    public randomChoiseInAnyArray(array: any): any{
        let result: any;
        result = array[Math.floor(Math.random()*array.length)]
        return result;
    }

    /**
     * A parameterul kapott tombbol kitorli a szinten parameterul kapott elemet, ha az benne van.
     * @param element tomb elem
     * @param array tomb
     */
    public removeElementInAnyArray(element: any, array: any): any{
        for (let i = 0; i < array.length; i++){
            if (JSON.stringify(element) === JSON.stringify(array[i])){
                array.splice(i,1);
            }
        }
        return array;
    }

    /**
     * Kivalasztja melyik a nagyobb ertek a parameterek kozul
     * @param num1 
     * @param num2 
     */
    public wichBiger(num1: number, num2: number): number{
        if (num1 >= num2){
            return num1;
        } else {
            return num2;
        }
    }
    /**
     * Kivalasztja a legkisebb szamot a parameterben megadott szam tombbol
     * @param array 
     */
    public choiseMinimumValueInNumberArray(array: number[]): number{
        let result: number = Infinity;
        for (let i = 0; i < array.length; i++){
            if (array[i] < result){
                result = array[i];
            }
        }
        return result;
    }
    
    /**
     * A parameterben megadott szazalek ertekben fog a fuggveny true-val visszaterni
     * @param percent szazalek
     */
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
