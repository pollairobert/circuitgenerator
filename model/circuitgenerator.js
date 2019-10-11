"use strict";
exports.__esModule = true;
var wire_1 = require("./wire");
var resistance_1 = require("./resistance");
var currentsource_1 = require("./currentsource");
var voltagesource_1 = require("./voltagesource");
var branch_1 = require("./branch");
var mesh_1 = require("./mesh");
var circuit_1 = require("./circuit");
/**
 * Aramkor generalasat vegzo osztaly.
 */
var CircuitGenerator = /** @class */ (function () {
    function CircuitGenerator() {
        this.fs = require('fs');
        this.circuitCoordinatesToFalstad = [];
        this.circuitResistorsDetails = [];
        this.multiplyResistorInBranch = [];
    }
    //private resTask: boolean = false;
    /**
     * Aramkor generalasaert felelos. Ezzel a metodussal kezdodik a teljes halozat generalasaert felelos tobbi metodus meghivasa
     * @param type aramkor tipusa adott struktura alapjan
     */
    CircuitGenerator.prototype.generateCircuit = function (type) {
        //console.log('meghivtak a generalosfugvt');
        var circuit;
        circuit = this.buildFinalCircuit(new circuit_1.Circuit(this.circuitParameterLimits(type)), type);
        //if (type < 11) {
        this.setCircuitElementCoordinatesArrayToFalstadExport(circuit, type);
        //}
        return circuit;
    };
    /**
     * A parameternek megfeleloen megad egy olyan tombot, ami a halozat generalasahoz
     * szukseges hurkok, elemek, kozos agak darabszamat tartalmazza.
     * parameters = [[hurkok maximalis szama],
     *               [ellenallasok maximalis szama],
     *               [aramgeneratorok maximalis szama],
     *               [feszultseggeneratorok maximalis szama],
     * @param type ez a parameter reprezentalja a halozat 'nehezsegi' szintjet
     */
    CircuitGenerator.prototype.circuitParameterLimits = function (type) {
        //let parameters = new Array(5);
        var parameters = [];
        var temptype = type;
        if (type >= 4 && type < 8) {
            temptype = 4;
        }
        if (type === 9) {
            temptype = 1;
        }
        if (type === 10) {
            temptype = 3;
        }
        switch (temptype) {
            //Egyszeru feszoszto, csak feszgennel
            case 1: {
                parameters = [this.randomIntNumber(2, 2),
                    this.randomIntNumber(4, 2),
                    this.randomIntNumber(0, 0),
                    this.randomIntNumber(1, 1)];
                break;
            }
            //Egyszeru 2 hurkos halozat (feszoszto), 1-nel tobb generatorral
            case 1.1: {
                parameters = [this.randomIntNumber(2, 2),
                    this.randomIntNumber(4, 2),
                    this.randomIntNumber(0, 0),
                    this.randomIntNumber(2, 2)];
                break;
            }
            //Kettos feszoszto egy feszgennel, parhuzamosan egymas utani halozatokkal
            case 2: {
                parameters = [this.randomIntNumber(3, 3),
                    this.randomIntNumber(4, 4),
                    this.randomIntNumber(0, 0),
                    this.randomIntNumber(1, 1)];
                break;
            }
            //Kettos feszoszto kicsit mas elrendezesben
            case 2.1: {
                parameters = [this.randomIntNumber(3, 3),
                    this.randomIntNumber(5, 4),
                    this.randomIntNumber(0, 0),
                    this.randomIntNumber(1, 1)];
                break;
            }
            //Kettos feszoszto alapra epulo, 2 feszgent tartalmazo aramkor
            case 3: {
                parameters = [this.randomIntNumber(3, 3),
                    this.randomIntNumber(5, 3),
                    this.randomIntNumber(0, 0),
                    this.randomIntNumber(2, 2)];
                break;
            }
            //Kettos feszoszto alapra, 3 feszgent tartalmazo aramkor
            case 3.1: {
                parameters = [this.randomIntNumber(3, 3),
                    this.randomIntNumber(5, 3),
                    this.randomIntNumber(0, 0),
                    this.randomIntNumber(3, 3)];
                break;
            }
            case 4: {
                parameters = [this.randomIntNumber(8, 3),
                    this.randomIntNumber(15, 4),
                    this.randomIntNumber(0, 0),
                    this.randomIntNumber(15, 8)];
                break;
            }
            case 5: {
                parameters = [this.randomIntNumber(30, 30),
                    this.randomIntNumber(15, 4),
                    this.randomIntNumber(0, 0),
                    this.randomIntNumber(15, 8)];
                break;
            }
            case 6: {
                parameters = [this.randomIntNumber(30, 30),
                    this.randomIntNumber(15, 4),
                    this.randomIntNumber(0, 0),
                    this.randomIntNumber(25, 20)];
                break;
            }
            case 7: {
                parameters = [this.randomIntNumber(3, 3),
                    this.randomIntNumber(15, 4),
                    this.randomIntNumber(0, 0),
                    this.randomIntNumber(2, 2)];
                break;
            }
            case 9: {
                break;
            }
        }
        return parameters;
    };
    /**
     * A meg ures aramkor objektumban letrehozza a megfelelo szamu hurkot es azok agait, egy 'vazat'.
     * @param circuit aramkor obj.
     */
    CircuitGenerator.prototype.buildCircuitSkeleton = function (circuit) {
        var numberOfMesh = circuit.getNumberOfMesh();
        var meshes = circuit.getMeshes();
        for (var h = 0; h < numberOfMesh; h++) {
            circuit.setMeshes(new mesh_1.Mesh());
            for (var i = 0; i < 4; i++) {
                meshes[h].setBranches(new branch_1.Branch(i, h));
            }
        }
    };
    /**
     * Az analizator szamara megfelelo strukturaju halozatot allitja elo a feladattipusnak megfeleloen.
     * Innen kerulnek meghivasra a kulonbozo aramkori elemek, 2 polus, kozos agak beallitasaert felelos metodusok.
     * @param circuit aramkor obj.
     * @param type feladat tipus szama
     */
    CircuitGenerator.prototype.buildFinalCircuit = function (circuit, type) {
        var circParam = circuit.getParameters();
        //console.log("circParam: "+ circParam);
        /**
         * Azokat az ag tipusokat es hozzajuk tartozo hurok szamokat tartalmazza,
         * amielyekhez megengedtt a kovetkezo hurok csatlakoztatatsa.
         * A halozat epito algoritmus hasznalja.
         * [[sajat branch type, kapcsolodo branch type, sajt meshnumber]]
         */
        var acceptebleCommonBranchArray = [];
        var commonBranchPairs = [[0, 2],
            [1, 3],
            [2, 0],
            [3, 1] //lentrol
        ];
        var numberOfMeshes = circuit.getNumberOfMesh();
        var randomCommonBranchPair = [];
        this.buildCircuitSkeleton(circuit);
        if (type === 1 || type === 1.1 || type === 9) {
            randomCommonBranchPair = this.randomChoiseInAnyArray([[1, 3], [2, 0], [0, 2]]);
        }
        else if (type === 2 || type === 3 || type === 3.1 || type === 10) {
            randomCommonBranchPair = this.randomChoiseInAnyArray([[1, 3], [2, 0], [0, 2]]);
        }
        else if (type === 2.1) {
            randomCommonBranchPair = [1, 3];
        }
        //console.log('randomCommonBranchPair: '+randomCommonBranchPair);
        //console.log('START - meshPieceArray: '+meshPieceArray);
        //console.log(typeof(meshPieceArray));
        var multiConnection = true;
        var meshes = circuit.getMeshes();
        if (type < 6 || type === 9 || type === 10) {
            for (var h = 1; h <= numberOfMeshes; h++) {
                //this.removeElementInAnyArray(h,meshPieceArray);
                //console.log('FOR - meshPieceArray: '+meshPieceArray+ ',for: '+h);
                //console.log(meshPieceArray);
                //let tempBranchPairs: number[] = [];
                var connectBranches = [];
                var choiseMeshNumber = void 0;
                //let multiConnection: boolean;
                var multiBranch = void 0;
                //let tempPieceArray: number[] = meshPieceArray.slice();
                ///console.log('tempPieceArray: '+tempPieceArray);
                //let randomFor: number;
                if (type === 1 || type === 1.1 || type === 2 || type === 2.1 || type === 3 || type === 3.1 || type === 9 || type === 10) {
                    //randomFor = 1;
                    if (h < numberOfMeshes) {
                        choiseMeshNumber = (h + 1);
                        //console.log('choiseMeshNumber: '+choiseMeshNumber);
                        //this.removeElementInAnyArray(choiseMeshNumber,tempPieceArray);
                        if (type === 2.1 && h > 1) {
                            randomCommonBranchPair = this.randomChoiseTwoAnything([0, 2], [2, 0]);
                        }
                        connectBranches.push(randomCommonBranchPair[0], randomCommonBranchPair[1], choiseMeshNumber, h);
                        //.log('connectBranches - for: '+connectBranches);
                        meshes[h - 1].setCommonBranchesArray(connectBranches);
                        this.addConnectedBranchFromCommmonBranchesArrayElement(circuit, h, choiseMeshNumber);
                    }
                }
                else {
                    //randomFor = this.randomIntNumber(tempPieceArray.length,1)
                }
                if (type > 3.1 && type <= 5) {
                    choiseMeshNumber = (h + 1);
                    for (var i = 0; i < 4; i++) {
                        acceptebleCommonBranchArray.push([commonBranchPairs[i][0], commonBranchPairs[i][1], h]);
                    }
                    //console.log('acceptebleCommonBranchArray - before: '+acceptebleCommonBranchArray);
                    if (h === 1) {
                        randomCommonBranchPair = this.randomChoiseInAnyArray(commonBranchPairs);
                        //console.log('randomCommonBranchPair a '+h+'. korben: '+randomCommonBranchPair);
                        connectBranches.push(randomCommonBranchPair[0], randomCommonBranchPair[1], choiseMeshNumber, h);
                        meshes[h - 1].setCommonBranchesArray(connectBranches);
                        this.addConnectedBranchFromCommmonBranchesArrayElement(circuit, h, choiseMeshNumber);
                        this.deleteNotAcceptableBranchInArray(circuit, acceptebleCommonBranchArray, h);
                    }
                    else if (h < numberOfMeshes) {
                        var choiseType = void 0;
                        //choiseMeshNumber = (h+1);
                        this.deleteNotAcceptableBranchInArray(circuit, acceptebleCommonBranchArray, h);
                        //console.log('acceptebleCommonBranchArray a '+h+'. kor elejen: '+acceptebleCommonBranchArray);
                        multiBranch = this.searchMultipleBranchTypeInAcceptableCommonBranchArray(acceptebleCommonBranchArray);
                        //console.log('multiBranch a '+h+'. korben: '+multiBranch);
                        multiConnection = this.randomBoolean();
                        //multiConnection = false;
                        //console.log('multiConnection a '+h+'. korben: '+multiConnection);
                        if (multiConnection) {
                            choiseType = this.randomChoiseInAnyArray(multiBranch);
                            //console.log('choiseType a '+h+'. korben: '+choiseType);
                            var choiseTypeCounter = this.counterOfChoiseTypeMultibranch(acceptebleCommonBranchArray, choiseType);
                            for (var i = 0; i < choiseTypeCounter; i++) {
                                for (var j = 0; j < acceptebleCommonBranchArray.length; j++) {
                                    if (choiseType === acceptebleCommonBranchArray[j][0]) {
                                        connectBranches.push(acceptebleCommonBranchArray[j][0], acceptebleCommonBranchArray[j][1], choiseMeshNumber, acceptebleCommonBranchArray[j][2]);
                                        //console.log('connectBranches a '+h+'. korben(multiconnect): '+connectBranches);
                                        meshes[acceptebleCommonBranchArray[j][2] - 1].setCommonBranchesArray(connectBranches);
                                        this.addConnectedBranchFromCommmonBranchesArrayElement(circuit, acceptebleCommonBranchArray[j][2], choiseMeshNumber);
                                        this.deleteNotAcceptableBranchInArray(circuit, acceptebleCommonBranchArray, acceptebleCommonBranchArray[j][2]);
                                        //console.log('acceptebleCommonBranchArray a '+h+'. korben, torles utan: '+acceptebleCommonBranchArray);
                                        connectBranches = [];
                                        break;
                                    }
                                }
                            }
                            //multiBranch = [];
                            //multiBranch = this.searchMultipleBranchTypeInAcceptableCommonBranchArray(acceptebleCommonBranchArray);
                        }
                        else {
                            var inverz = this.setInverzMultipleBranch(multiBranch);
                            //console.log('inverz a '+h+'. korben: '+inverz);
                            choiseType = this.randomChoiseInAnyArray(inverz);
                            //console.log('choiseType a '+h+'. korben: '+choiseType);
                            for (var j = 0; j < acceptebleCommonBranchArray.length; j++) {
                                if (choiseType === acceptebleCommonBranchArray[j][0]) {
                                    connectBranches.push(acceptebleCommonBranchArray[j][0], acceptebleCommonBranchArray[j][1], choiseMeshNumber, acceptebleCommonBranchArray[j][2]);
                                    //console.log('connectBranches a '+h+'. korben(nem multiconnect): '+connectBranches);
                                    meshes[acceptebleCommonBranchArray[j][2] - 1].setCommonBranchesArray(connectBranches);
                                    this.addConnectedBranchFromCommmonBranchesArrayElement(circuit, acceptebleCommonBranchArray[j][2], choiseMeshNumber);
                                    this.deleteNotAcceptableBranchInArray(circuit, acceptebleCommonBranchArray, acceptebleCommonBranchArray[j][2]);
                                    //console.log('acceptebleCommonBranchArray a '+h+'. korben, torles utan: '+acceptebleCommonBranchArray);
                                    connectBranches = [];
                                }
                            }
                            //multiBranch = this.searchMultipleBranchTypeInAcceptableCommonBranchArray(acceptebleCommonBranchArray);
                            //multiBranch = [];
                        }
                        //this.deleteNotAcceptableBranchInArray(circuit, acceptebleCommonBranchArray,h);
                    }
                    if (h === numberOfMeshes) {
                        this.deleteNotAcceptableBranchInArray(circuit, acceptebleCommonBranchArray, h);
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
        if (type === 16) {
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
            meshes[2].getBranches().splice(1, 0, new branch_1.Branch(1, 2));
            meshes[0].getBranches()[0].setBranchElements(new voltagesource_1.VoltageSource(this.randomVoltageSourceValue(), this.randomBoolean()));
            meshes[0].getBranches()[0].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
            meshes[0].getBranches()[1].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
            meshes[0].getBranches()[3].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
            meshes[0].getBranches()[2].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
            meshes[1].getBranches()[2].setBranchElements(new voltagesource_1.VoltageSource(this.randomVoltageSourceValue(), this.randomBoolean()));
            meshes[1].getBranches()[1].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
            //meshes[1].getBranches()[3].setBranchElements(new Resistance(this.randomE6Resistance()));
            meshes[1].getBranches()[0].setBranchElements(this.copyCommonElement(meshes[0].getBranches()[2].getBranchElements()[0]));
            meshes[2].getBranches()[1].setBranchElements(this.copyCommonElement(meshes[0].getBranches()[3].getBranchElements()[0]));
            //meshes[2].getBranches()[2].setBranchElements(this.copyCommonElement(meshes[1].getBranches()[3].getBranchElements()[0]));
            meshes[2].getBranches()[4].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
            meshes[2].getBranches()[4].setBranchElements(new voltagesource_1.VoltageSource(this.randomVoltageSourceValue(), this.randomBoolean()));
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
        if (type <= 6 || type === 9 || type === 10) {
            //this.setThevenin2PoleInCircuit(circuit, type);
            this.setCommonBranchesInCircuit(circuit);
            this.setThevenin2PoleInCircuit(circuit, type);
            this.setVoltageSourceInCircuit(circuit, type);
            /*for (let i = 0; i < circuit.getNumberOfMesh(); i++){
                let branches: Branch[] = meshes[i].getBranches();
                //this.setCommonBranchesInMesh(circuit, meshes[i].getCommonBranchesArray());
                //console.log(meshes[i].getCommonBranchesArray());
                //console.log(meshes[i].getMeshBranchesSize());
                //console.log(branches);
                for (let j = 0; j < branches.length; j++){
                    //console.log(branches[j].getBranchElements());
                }
            }*/
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
        for (var h = 0; h < circuit.getNumberOfMesh(); h++) {
            var branches = meshes[h].getBranches();
            for (var i = 0; i < branches.length; i++) {
                var mesh = meshes[h];
                mesh.setMeshVoltage(mesh.getBranches()[i]);
                mesh.setMeshResistance(mesh.getBranches()[i]);
                if (mesh.getBranches()[i].getBranchElements()[0] === undefined) {
                    mesh.getBranches()[i].setBranchElements(new wire_1.Wire());
                }
            }
        }
        if (type <= 10) { //EZ ITT KERDESES??? type <= 7 volt!!!!
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
    };
    /**
     * Beallitja az aktualis hurokhoz tartozo eppen aktualis commonBranchesArray elemben szereplo masik hurokban is a megfelelo commonBranchesArray elemet.
     * @param circuit aramkor objektum
     * @param baseMesNumb annak a huroknak a szama amiben generaltunk egy commonBranch elemet a tombbe
     * @param connectedMeshNumb a generalt commonBranch elemben szereplo masik hurok szama, amihez csatlakozik a base
     * @param meshPieces opcionalis, meg nem hasznalt.
     */
    CircuitGenerator.prototype.addConnectedBranchFromCommmonBranchesArrayElement = function (circuit, baseMesNumb, connectedMeshNumb, meshPieces) {
        var meshes = circuit.getMeshes();
        var baseComBrArray = meshes[baseMesNumb - 1].getCommonBranchesArray();
        var connMesh = meshes[connectedMeshNumb - 1];
        var connComBrArray = connMesh.getCommonBranchesArray();
        for (var i = 0; i < baseComBrArray.length; i++) {
            if (baseComBrArray[i][2] === connectedMeshNumb) {
                if (connComBrArray.length > 0) {
                    var existconnectedMeshNumb = false;
                    for (var j = 0; j < connComBrArray.length; j++) {
                        if (connComBrArray[j][2] === baseMesNumb) {
                            existconnectedMeshNumb = true;
                            break;
                        }
                    }
                    if (!existconnectedMeshNumb) {
                        connMesh.setCommonBranchesArray([baseComBrArray[i][1], baseComBrArray[i][0], baseMesNumb, connectedMeshNumb]);
                    }
                }
                else {
                    connMesh.setCommonBranchesArray([baseComBrArray[i][1], baseComBrArray[i][0], baseMesNumb, connectedMeshNumb]);
                }
            }
        }
    };
    /**
     * Az adott hurokhoz tartozo kozossegi ertekeket tartalmazo tomb alapjan, hozzaadja a hurokhoz a megfelelo
     * kozossegi ertekkel rendelkezo ag objektumokat az ag tipusanak megfelelo helyre. Tehat, ha 2-es tipusu ag objektum a kozossegi,
     * akkor az 1-es tipusu ag utan illeszti be. Ha tobb ugyan olyan is van, mindig a legutolso lesz a kisebbik indexen a branch tombben.
     * @param circuit aramkor objektum, amin dolgozik
     * @param commonBranchesArray a hurokhoz tartozo kozossegi ertekek parametereit tartalmazo tomb
     */
    CircuitGenerator.prototype.setCommonBranchesInMesh = function (circuit, commonBranchesArray) {
        var meshes = circuit.getMeshes();
        for (var h = 0; h < commonBranchesArray.length; h++) {
            var branches_1 = meshes[commonBranchesArray[h][3] - 1].getBranches();
            //console.log('h:' +h);
            for (var i = 0; i < branches_1.length; i++) {
                //console.log('i:' +i);
                if (branches_1[i].getType() === commonBranchesArray[h][0]) {
                    //console.log('IF - 99');
                    //console.log('Az egyezo tipusu branch: '+branches[i].getType());
                    var tempBranch = new branch_1.Branch(commonBranchesArray[h][0], commonBranchesArray[h][3] - 1);
                    tempBranch.setCommon(commonBranchesArray[h][2]);
                    branches_1.splice(i, 0, tempBranch);
                    break;
                }
            }
        }
        /**
         * A kozos branch tipusanak megfelelo, nem beallitott branch torlese.
         */
        var branches = meshes[commonBranchesArray[0][3] - 1].getBranches();
        for (var i = 0; i < branches.length; i++) {
            if (i > 0) {
                //console.log('IF - 100');
                if (branches[i].getType() === branches[i - 1].getType()) {
                    //console.log('IF - 101');
                    if (i < branches.length - 1 && (branches[i].getType() !== branches[i + 1].getType())) {
                        //console.log('IF - 102');
                        branches.splice(i, 1);
                    }
                    else if (i === branches.length - 1) {
                        //console.log('IF - 103');
                        branches.splice(i, 1);
                    }
                }
            }
        }
    };
    /**
     * Beallitja a szukseges kozossegi ertekeket az egesz halozatban.
     * @param circuit aramkor objektum
     */
    CircuitGenerator.prototype.setCommonBranchesInCircuit = function (circuit) {
        var meshes = circuit.getMeshes();
        for (var i = 0; i < circuit.getNumberOfMesh(); i++) {
            this.setCommonBranchesInMesh(circuit, meshes[i].getCommonBranchesArray());
        }
    };
    /**
     * Ellenallasok elhelyezeseert felelos.
     * @param circuit aramkor objektum
     * @param type feladat tipusanak megfelelo szam
     */
    CircuitGenerator.prototype.setResistanceInCircuit = function (circuit, type) {
        var meshes = circuit.getMeshes();
        var mesh1branches = meshes[0].getBranches();
        var msh1CommBrArray = meshes[0].getCommonBranchesArray();
        var circuitResistanceNumber = circuit.getParameters()[1];
        var tempType = type;
        if (type === 3 || type === 3.1) {
            tempType = 3;
        }
        if (type === 4 || type === 5) {
            tempType = 4;
        }
        if (type === 9) {
            tempType = 1;
        }
        /*if (type === 10){
            tempType = 3;
        }*/
        switch (tempType) {
            case 1: {
                //console.log('RES 1');
                if (msh1CommBrArray[0][0] === 1) {
                    //console.log('RES 1 - 1');
                    if (mesh1branches[0].getBranchElements()[0] !== undefined) {
                        mesh1branches[0].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                        circuitResistanceNumber--;
                        mesh1branches[1].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                        circuitResistanceNumber--;
                        //console.log('circuitResistanceNumber: '+circuitResistanceNumber);
                        if (circuitResistanceNumber > 0) {
                            if (this.percentRandom(70)) {
                                //console.log('RES 1 - 2');
                                mesh1branches[1].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                                circuitResistanceNumber--;
                            }
                            if (this.percentRandom(70)) {
                                //console.log('RES 1 - 2');
                                mesh1branches[2].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                                //circuitResistanceNumber--;
                            }
                        }
                    }
                    else {
                        mesh1branches[2].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                        circuitResistanceNumber--;
                        mesh1branches[1].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                        circuitResistanceNumber--;
                        //console.log('circuitResistanceNumber: '+circuitResistanceNumber);
                        if (circuitResistanceNumber > 0) {
                            if (this.percentRandom(70)) {
                                //console.log('RES 1 - 2');
                                mesh1branches[1].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                                circuitResistanceNumber--;
                            }
                            if (this.percentRandom(70)) {
                                //console.log('RES 1 - 2');
                                mesh1branches[2].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                            }
                        }
                    }
                }
                else if (msh1CommBrArray[0][0] === 2) {
                    //console.log('RES 1 - 3');
                    mesh1branches[1].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                    circuitResistanceNumber--;
                    mesh1branches[2].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                    circuitResistanceNumber--;
                    //console.log('circuitResistanceNumber: '+circuitResistanceNumber);
                    if (circuitResistanceNumber > 0) {
                        if (this.percentRandom(70)) {
                            // console.log('RES 1 - 4');
                            mesh1branches[this.randomChoiseTwoNumber(1, 2)].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                            circuitResistanceNumber--;
                            //console.log('circuitResistanceNumber: '+circuitResistanceNumber);
                        }
                        if (this.percentRandom(70)) {
                            // console.log('RES 1 - 4');
                            mesh1branches[3].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                            //console.log('circuitResistanceNumber: '+circuitResistanceNumber);
                        }
                    }
                }
                else if (msh1CommBrArray[0][0] === 0) {
                    //console.log('RES 1 - 4.1');
                    mesh1branches[1].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                    circuitResistanceNumber--;
                    mesh1branches[0].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                    circuitResistanceNumber--;
                    //console.log('circuitResistanceNumber: '+circuitResistanceNumber);
                    if (circuitResistanceNumber > 0) {
                        if (this.percentRandom(70)) {
                            //console.log('RES 1 - 4');
                            mesh1branches[3].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                            mesh1branches[this.randomChoiseTwoNumber(0, 1)].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                            circuitResistanceNumber--;
                            //console.log('circuitResistanceNumber: '+circuitResistanceNumber);
                        }
                        if (this.percentRandom(70)) {
                            // console.log('RES 1 - 4');
                            mesh1branches[3].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
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
            case 1.1: {
                //console.log('RES 1');
                if (msh1CommBrArray[0][0] === 1) {
                    //console.log('RES 1 - 1');
                    if (mesh1branches[0].getBranchElements()[0] !== undefined) {
                        mesh1branches[0].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                        circuitResistanceNumber--;
                        mesh1branches[1].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                        circuitResistanceNumber--;
                        if (this.percentRandom(40)) {
                            //console.log('RES 1 - 2');
                            mesh1branches[2].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                            //circuitResistanceNumber--;
                        }
                    }
                    else {
                        mesh1branches[1].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                        circuitResistanceNumber--;
                        mesh1branches[0].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                        circuitResistanceNumber--;
                        if (this.percentRandom(40)) {
                            //console.log('RES 1 - 2');
                            mesh1branches[0].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                            //circuitResistanceNumber--;
                        }
                    }
                }
                else if (msh1CommBrArray[0][0] === 0 || msh1CommBrArray[0][0] === 2) {
                    //console.log('RES 1 - 3');
                    mesh1branches[0].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                    circuitResistanceNumber--;
                    mesh1branches[2].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                    circuitResistanceNumber--;
                    //console.log('circuitResistanceNumber: '+circuitResistanceNumber);
                    if (circuitResistanceNumber > 0) {
                        if (this.percentRandom(70)) {
                            //console.log('RES 1 - 4');
                            mesh1branches[1].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                            circuitResistanceNumber--;
                            //console.log('circuitResistanceNumber: '+circuitResistanceNumber);
                        }
                        if (this.percentRandom(40)) {
                            // console.log('RES 1 - 4');
                            mesh1branches[3].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
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
                for (var i_1 = 0; i_1 < circuit.getNumberOfMesh(); i_1++) {
                    var branches = meshes[i_1].getBranches();
                    if (i_1 < circuit.getNumberOfMesh() - 1) {
                        for (var j = 0; j < branches.length; j++) {
                            var branchType = branches[j].getType();
                            if (mesh1branches[0].getBranchElements()[0] !== undefined) {
                            }
                            if (meshes[i_1].getCommonBranchesArray()[0][0] === 1 || meshes[i_1].getCommonBranchesArray()[0][0] === 3) {
                                if (mesh1branches[0].getBranchElements()[0] !== undefined && mesh1branches[0].getBranchElements()[0].getId() === 'V') {
                                    if (branchType === 0 || branchType === 1) {
                                        branches[j].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                                        circuitResistanceNumber--;
                                    }
                                }
                                else {
                                    if (branchType === 2 || branchType === 1) {
                                        branches[j].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                                        circuitResistanceNumber--;
                                    }
                                }
                            }
                            else if (meshes[i_1].getCommonBranchesArray()[0][0] === 0 || meshes[i_1].getCommonBranchesArray()[0][0] === 2) {
                                if (mesh1branches[0].getBranchElements()[0] !== undefined && mesh1branches[0].getBranchElements()[0].getId() === 'V') {
                                    if (branchType === 1 || branchType === 2) {
                                        branches[j].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                                        circuitResistanceNumber--;
                                    }
                                }
                                else {
                                    if (branchType === 0 || branchType === 1) {
                                        branches[j].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                                        circuitResistanceNumber--;
                                    }
                                }
                            }
                        }
                    }
                }
                //mesh1branches[1].setBranchElements(new Resistance(this.randomE6Resistance()));
                if (circuitResistanceNumber > 0) {
                    if (mesh1branches[0].getBranchElements()[0] !== undefined) {
                        mesh1branches[0].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                        circuitResistanceNumber--;
                    }
                    else {
                        mesh1branches[2].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                        circuitResistanceNumber--;
                    }
                }
                break;
            }
            case 2.1: {
                for (var i_2 = 0; i_2 < circuit.getNumberOfMesh(); i_2++) {
                    var branches = meshes[i_2].getBranches();
                    if (i_2 < circuit.getNumberOfMesh() - 1) {
                        for (var j = 0; j < branches.length; j++) {
                            var branchType = branches[j].getType();
                            if (meshes[circuit.getNumberOfMesh() - 1].getCommonBranchesArray()[0][0] === 0) {
                                //console.log('UTOLSO 0-val');
                                if ((branchType === 0 || branchType === 1) && i_2 === 0) {
                                    branches[j].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                                    circuitResistanceNumber--;
                                }
                                else if ((branchType === 0 || branchType === 2) && i_2 > 0) {
                                    branches[j].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                                    circuitResistanceNumber--;
                                }
                            }
                            else if (meshes[circuit.getNumberOfMesh() - 1].getCommonBranchesArray()[0][0] === 2) {
                                //console.log('UTOLSO 2-vel');
                                if ((branchType === 1 || branchType === 2) && i_2 === 0) {
                                    //console.log(i+' .HUROK, type: 1 v 2');
                                    branches[j].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                                    circuitResistanceNumber--;
                                }
                                else if ((branchType === 0 || branchType === 2) && i_2 > 0) {
                                    //console.log(i+' .HUROK, type: 0v 2');
                                    branches[j].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                                    circuitResistanceNumber--;
                                }
                            }
                        }
                    }
                }
                if (circuitResistanceNumber > 0) {
                    meshes[circuit.getNumberOfMesh() - 2].getBranches()[1].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                    circuitResistanceNumber--;
                }
                break;
            }
            case 3: {
                for (var i_3 = 0; i_3 < circuit.getNumberOfMesh(); i_3++) {
                    var branches = meshes[i_3].getBranches();
                    if (i_3 < circuit.getNumberOfMesh() - 1) {
                        for (var j = 0; j < branches.length; j++) {
                            var branchType = branches[j].getType();
                            if (meshes[i_3].getCommonBranchesArray()[0][0] === 1 || meshes[i_3].getCommonBranchesArray()[0][0] === 3) {
                                if (mesh1branches[0].getBranchElements()[0] !== undefined && mesh1branches[0].getBranchElements()[0].getId() === 'V') {
                                    if (branchType === 0 || branchType === 1) {
                                        if (i_3 === 0 && branchType === 0) {
                                            branches[j].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                                            //circuitResistanceNumber--;
                                        }
                                        else {
                                            if (branchType === 0) {
                                                if (circuitResistanceNumber > 3 && this.randomBoolean()) {
                                                    branches[j].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                                                    //circuitResistanceNumber--;
                                                }
                                            }
                                            else {
                                                branches[j].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                                                //circuitResistanceNumber--;
                                            }
                                        }
                                        //branches[j].setBranchElements(new Resistance(this.randomE6Resistance()));
                                        //circuitResistanceNumber--;
                                    }
                                }
                                else {
                                    if (branchType === 1) {
                                        branches[j].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                                        //circuitResistanceNumber--;
                                    }
                                    if (branchType === 2) {
                                        if (i_3 === 0) {
                                            branches[j].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                                            //circuitResistanceNumber--;
                                        }
                                        else {
                                            if (circuitResistanceNumber > 3 && this.randomBoolean()) {
                                                branches[j].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                                                //circuitResistanceNumber--;
                                            }
                                        }
                                        //branches[j].setBranchElements(new Resistance(this.randomE6Resistance()));
                                        //circuitResistanceNumber--;
                                    }
                                }
                            }
                            else if (meshes[i_3].getCommonBranchesArray()[0][0] === 0 || meshes[i_3].getCommonBranchesArray()[0][0] === 2) {
                                if (i_3 === 0) {
                                    if (branchType === 2 || branchType === 0) {
                                        branches[j].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                                        //circuitResistanceNumber--;
                                    }
                                }
                                else if (branchType === 2 && meshes[i_3].getCommonBranchesArray()[0][0] === 0) {
                                    branches[j].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                                    //circuitResistanceNumber--;
                                }
                                else if (branchType === 0 && meshes[i_3].getCommonBranchesArray()[0][0] === 2) {
                                    branches[j].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                                    //circuitResistanceNumber--;
                                }
                                else if (branchType === 1) {
                                    if (circuitResistanceNumber > 3 && this.randomBoolean()) {
                                        branches[j].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
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
                for (var h = 0; h < circuit.getNumberOfMesh(); h++) {
                    var branches = meshes[h].getBranches();
                    var commBrArray = meshes[h].getCommonBranchesArray();
                    for (var i_4 = 0; i_4 < branches.length; i_4++) {
                        var branch = branches[i_4];
                        var elements = branches[i_4].getBranchElements();
                        if (!branches[i_4].getTh2Pole()) {
                            if (branch.getBranchElements()[0] !== undefined) {
                                for (var j = 0; j < elements.length; j++) {
                                    var elementJ = elements[j];
                                    if (elementJ.getId() === 'V') {
                                        branch.setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                                    }
                                }
                            }
                            else {
                                if (h === 0) {
                                    var oneres = false;
                                    if (circuit.getNumberOfMesh() === 2 && commBrArray[0][0] === branch.getType()) {
                                        branch.setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                                        oneres = true;
                                    }
                                    if (this.percentRandom(50)) {
                                        branch.setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                                    }
                                    if (this.percentRandom(10) && !oneres) {
                                        branch.setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                                    }
                                }
                                else if (commBrArray[0][0] !== branch.getType() && (type === 4 ? h < circuit.getNumberOfMesh() - 1 : ((type === 5) ? true : true))) {
                                    //if (!branches[i].getTh2Pole()){
                                    if (branches[i_4].getCommon() !== meshes[h].getMeshNumber()) {
                                        branch.setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                                    }
                                    else if (this.percentRandom(70)) {
                                        //if (branch.getType() !== commBrArray[0][0]){
                                        branch.setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                                        //}
                                    }
                                    if (this.percentRandom(30)) {
                                        // if (branch.getType() !== commBrArray[0][0]){
                                        branch.setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                                        // }
                                    }
                                    //}
                                }
                            }
                        }
                    }
                }
                break;
            }
            case 10: {
                console.log("10 -es feladat");
                var resistance = this.randomE6Resistance();
                if (msh1CommBrArray[0][0] === 1) {
                    mesh1branches[1].setBranchElements(new resistance_1.Resistance(resistance));
                    mesh1branches[1].getBranchElements()[1].setNumber(2);
                    this.circuitResistorsDetails.push("R2 " + resistance);
                    if (this.randomChoiseTwoNumber(0, 2) === 0) {
                        ///if (this.percentRandom(this.randomIntNumber(100,1))){
                        mesh1branches[0].setBranchElements(new resistance_1.Resistance(resistance));
                        this.circuitResistorsDetails.push("R1 " + resistance);
                        console.log("mesh1branches[0]");
                        console.log(mesh1branches[0]);
                        for (var i = 0; i < mesh1branches[0].getBranchElements.length; i++) {
                            console.log("mesh1branches[0].getBranchElements[i]: " + mesh1branches[0].getBranchElements[i]);
                        }
                        if (mesh1branches[0].getBranchElements()[0].getId() !== "V") {
                            mesh1branches[0].getBranchElements()[0].setNumber(1);
                        }
                        else {
                            mesh1branches[0].getBranchElements()[1].setNumber(1);
                        }
                        //mesh1branches[0].getBranchElements()[1].setNumber(2);
                        meshes[1].getBranches()[1].setBranchElements(new resistance_1.Resistance(0.1));
                        meshes[1].getBranches()[1].getBranchElements()[0].setNumber(3);
                        //} else {
                        //mesh1branches[0].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(true), false));
                        //mesh1branches[0].getBranchElements()[0].setNumber(1);
                        //}
                    }
                    else {
                        //if (this.percentRandom(this.randomIntNumber(100,1))){
                        mesh1branches[2].setBranchElements(new resistance_1.Resistance(resistance));
                        this.circuitResistorsDetails.push("R1 " + resistance);
                        console.log("mesh1branches[2]");
                        console.log(mesh1branches[2]);
                        for (var i = 0; i < mesh1branches[2].getBranchElements.length; i++) {
                            console.log("mesh1branches[2].getBranchElements[i]: " + mesh1branches[2].getBranchElements[i]);
                        }
                        if (mesh1branches[2].getBranchElements()[0].getId() !== "V") {
                            mesh1branches[2].getBranchElements()[0].setNumber(1);
                        }
                        else {
                            mesh1branches[2].getBranchElements()[1].setNumber(1);
                        }
                        //mesh1branches[2].getBranchElements()[1].setNumber(2);
                        meshes[1].getBranches()[1].setBranchElements(new resistance_1.Resistance(0.1));
                        meshes[1].getBranches()[1].getBranchElements()[0].setNumber(3);
                        //} else {
                        //mesh1branches[2].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(true), false));
                        //mesh1branches[2].getBranchElements()[0].setNumber(1);
                        //}
                    }
                }
                else if (msh1CommBrArray[0][0] === 2 || msh1CommBrArray[0][0] === 0) {
                    mesh1branches[0].setBranchElements(new resistance_1.Resistance(resistance));
                    mesh1branches[2].setBranchElements(new resistance_1.Resistance(resistance));
                    if (msh1CommBrArray[0][0] === 2) {
                        meshes[1].getBranches()[2].setBranchElements(new resistance_1.Resistance(0.1));
                        meshes[1].getBranches()[2].getBranchElements()[0].setNumber(3);
                        mesh1branches[0].getBranchElements()[1].setNumber(1);
                        this.circuitResistorsDetails.push("R1 " + resistance);
                        mesh1branches[2].getBranchElements()[1].setNumber(2);
                        this.circuitResistorsDetails.push("R2 " + resistance);
                    }
                    else if (msh1CommBrArray[0][0] === 0) {
                        meshes[1].getBranches()[0].setBranchElements(new resistance_1.Resistance(0.1));
                        meshes[1].getBranches()[0].getBranchElements()[0].setNumber(3);
                        mesh1branches[2].getBranchElements()[1].setNumber(1);
                        this.circuitResistorsDetails.push("R1 " + resistance);
                        mesh1branches[0].getBranchElements()[1].setNumber(2);
                        this.circuitResistorsDetails.push("R2 " + resistance);
                    }
                    //mesh1branches[msh1CommBrArray[0][0] === 0 ? 2 : 0].getBranchElements()[0].setNumber(1);
                }
                //mesh1branches[0].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                break;
            }
            case 16: {
                meshes[0].getBranches()[0].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                meshes[0].getBranches()[1].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                meshes[0].getBranches()[2].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                meshes[1].getBranches()[3].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                meshes[1].getBranches()[1].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                meshes[1].getBranches()[2].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                meshes[2].getBranches()[4].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
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
    };
    /**
     * Megfelelo feltelek figyelembe vetelevel hozzaadja az aramkorhoz a feszultseggenerator(oka)t.
     * @param circuit aramkor objektum
     */
    CircuitGenerator.prototype.setVoltageSourceInCircuit = function (circuit, type) {
        var meshes = circuit.getMeshes();
        var mesh1branches = meshes[0].getBranches();
        var msh1CommBrArray = meshes[0].getCommonBranchesArray();
        var tempType = type;
        if (type > 3.1 && type <= 5) {
            tempType = 4;
        }
        if (type === 9) {
            tempType = 1;
        }
        /*if (type === 10){
            tempType = 3;
        }*/
        switch (tempType) {
            case 1: {
                if (msh1CommBrArray[0][0] === 1) {
                    if (this.randomChoiseTwoNumber(0, 2) === 0) {
                        mesh1branches[0].setBranchElements(new voltagesource_1.VoltageSource(this.randomVoltageSourceValue(), (type === 9 ? false : this.randomBoolean())));
                    }
                    else {
                        mesh1branches[2].setBranchElements(new voltagesource_1.VoltageSource(this.randomVoltageSourceValue(), (type === 9 ? false : this.randomBoolean())));
                    }
                }
                else if (msh1CommBrArray[0][0] === 2) {
                    mesh1branches[0].setBranchElements(new voltagesource_1.VoltageSource(this.randomVoltageSourceValue(), (type === 9 ? false : this.randomBoolean())));
                }
                else {
                    mesh1branches[2].setBranchElements(new voltagesource_1.VoltageSource(this.randomVoltageSourceValue(), (type === 9 ? false : this.randomBoolean())));
                }
                break;
            }
            case 1.1: {
                //mesh1branches[0].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                if (msh1CommBrArray[0][0] === 1) {
                    mesh1branches[this.randomChoiseTwoNumber(0, 2)].setBranchElements(new voltagesource_1.VoltageSource(this.randomVoltageSourceValue(), this.randomBoolean()));
                    mesh1branches[1].setBranchElements(new voltagesource_1.VoltageSource(this.randomVoltageSourceValue(), this.randomBoolean()));
                }
                else if (msh1CommBrArray[0][0] === 0 || msh1CommBrArray[0][0] === 2) {
                    mesh1branches[0].setBranchElements(new voltagesource_1.VoltageSource(this.randomVoltageSourceValue(), this.randomBoolean()));
                    mesh1branches[2].setBranchElements(new voltagesource_1.VoltageSource(this.randomVoltageSourceValue(), this.randomBoolean()));
                }
                //mesh1branches[2].setBranchElements(new Resistance(this.randomE6Resistance()));
                //mesh1branches[1].setBranchElements(new Resistance(this.randomE6Resistance()));
                break;
            }
            case 2: {
                if (msh1CommBrArray[0][0] === 1) {
                    if (this.randomChoiseTwoNumber(0, 2) === 0) {
                        mesh1branches[0].setBranchElements(new voltagesource_1.VoltageSource(this.randomVoltageSourceValue(), this.randomBoolean()));
                    }
                    else {
                        mesh1branches[2].setBranchElements(new voltagesource_1.VoltageSource(this.randomVoltageSourceValue(), this.randomBoolean()));
                    }
                }
                else if (msh1CommBrArray[0][0] === 2) {
                    mesh1branches[0].setBranchElements(new voltagesource_1.VoltageSource(this.randomVoltageSourceValue(), this.randomBoolean()));
                }
                else if (msh1CommBrArray[0][0] === 0) {
                    mesh1branches[2].setBranchElements(new voltagesource_1.VoltageSource(this.randomVoltageSourceValue(), this.randomBoolean()));
                }
                //mesh1branches[0].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                break;
            }
            case 2.1: {
                if (meshes[circuit.getNumberOfMesh() - 1].getCommonBranchesArray()[0][0] === 0) {
                    mesh1branches[0].setBranchElements(new voltagesource_1.VoltageSource(this.randomVoltageSourceValue(), this.randomBoolean()));
                }
                else {
                    mesh1branches[2].setBranchElements(new voltagesource_1.VoltageSource(this.randomVoltageSourceValue(), this.randomBoolean()));
                }
                break;
            }
            case 3: {
                if (msh1CommBrArray[0][0] === 1) {
                    mesh1branches[1].setBranchElements(new voltagesource_1.VoltageSource(this.randomVoltageSourceValue(), this.randomBoolean()));
                    if (this.randomChoiseTwoNumber(0, 2) === 0) {
                        mesh1branches[0].setBranchElements(new voltagesource_1.VoltageSource(this.randomVoltageSourceValue(), (type === 10 ? false : this.randomBoolean())));
                    }
                    else {
                        mesh1branches[2].setBranchElements(new voltagesource_1.VoltageSource(this.randomVoltageSourceValue(), (type === 10 ? false : this.randomBoolean())));
                    }
                }
                else if (msh1CommBrArray[0][0] === 2 || msh1CommBrArray[0][0] === 0) {
                    mesh1branches[0].setBranchElements(new voltagesource_1.VoltageSource(this.randomVoltageSourceValue(), this.randomBoolean()));
                    mesh1branches[2].setBranchElements(new voltagesource_1.VoltageSource(this.randomVoltageSourceValue(), this.randomBoolean()));
                }
                //mesh1branches[0].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                break;
            }
            case 3.1: {
                if (msh1CommBrArray[0][0] === 1) {
                    mesh1branches[1].setBranchElements(new voltagesource_1.VoltageSource(this.randomVoltageSourceValue(), this.randomBoolean()));
                    meshes[1].getBranches()[1].setBranchElements(new voltagesource_1.VoltageSource(this.randomVoltageSourceValue(), this.randomBoolean()));
                    if (this.randomChoiseTwoNumber(0, 2) === 0) {
                        mesh1branches[0].setBranchElements(new voltagesource_1.VoltageSource(this.randomVoltageSourceValue(), this.randomBoolean()));
                    }
                    else {
                        mesh1branches[2].setBranchElements(new voltagesource_1.VoltageSource(this.randomVoltageSourceValue(), this.randomBoolean()));
                    }
                }
                else if (msh1CommBrArray[0][0] === 2 || msh1CommBrArray[0][0] === 0) {
                    mesh1branches[0].setBranchElements(new voltagesource_1.VoltageSource(this.randomVoltageSourceValue(), this.randomBoolean()));
                    mesh1branches[2].setBranchElements(new voltagesource_1.VoltageSource(this.randomVoltageSourceValue(), this.randomBoolean()));
                    if (msh1CommBrArray[0][0] === 2) {
                        meshes[1].getBranches()[2].setBranchElements(new voltagesource_1.VoltageSource(this.randomVoltageSourceValue(), this.randomBoolean()));
                    }
                    else if (msh1CommBrArray[0][0] === 0) {
                        meshes[1].getBranches()[0].setBranchElements(new voltagesource_1.VoltageSource(this.randomVoltageSourceValue(), this.randomBoolean()));
                    }
                }
                //mesh1branches[0].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                break;
            }
            case 4: {
                var maxVoltageSource = circuit.getParameters()[3];
                //console.log('maxVoltageSource: ' +maxVoltageSource);
                for (var h = 0; h < circuit.getNumberOfMesh(); h++) {
                    var branches = meshes[h].getBranches();
                    var commBrArray = meshes[h].getCommonBranchesArray();
                    var voltageSourceCounter = 0;
                    var percent = this.randomIntNumber(100, 1);
                    for (var i = 0; i < branches.length; i++) {
                        if (!branches[i].getTh2Pole()) {
                            if (h === 0) {
                                if (this.percentRandom(percent)) {
                                    branches[i].setBranchElements(new voltagesource_1.VoltageSource(this.randomVoltageSourceValue(), this.randomBoolean()));
                                    voltageSourceCounter++;
                                    maxVoltageSource--;
                                    percent = 0;
                                }
                                if (percent != 0) {
                                    percent += 40;
                                }
                            }
                            else if (commBrArray[0][0] !== branches[i].getType() && (type === 5 ? true : h < circuit.getNumberOfMesh() - 1)) {
                                //if (!branches[i].getTh2Pole()){
                                if (maxVoltageSource > 0) {
                                    if (this.percentRandom(percent)) {
                                        branches[i].setBranchElements(new voltagesource_1.VoltageSource(this.randomVoltageSourceValue(), this.randomBoolean()));
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
            case 10: {
                var voltage = this.randomIntNumber(24, 2);
                if (msh1CommBrArray[0][0] === 1) {
                    mesh1branches[1].setBranchElements(new voltagesource_1.VoltageSource(voltage, false));
                    mesh1branches[1].getBranchElements()[0].setNumber(2);
                    if (this.randomChoiseTwoNumber(0, 2) === 0) {
                        ///if (this.percentRandom(this.randomIntNumber(100,1))){
                        mesh1branches[0].setBranchElements(new voltagesource_1.VoltageSource(voltage, false));
                        mesh1branches[0].getBranchElements()[0].setNumber(1);
                        //} else {
                        //mesh1branches[0].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(true), false));
                        //mesh1branches[0].getBranchElements()[0].setNumber(1);
                        //}
                    }
                    else {
                        //if (this.percentRandom(this.randomIntNumber(100,1))){
                        mesh1branches[2].setBranchElements(new voltagesource_1.VoltageSource(voltage, false));
                        mesh1branches[2].getBranchElements()[0].setNumber(1);
                        //} else {
                        //mesh1branches[2].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(true), false));
                        //mesh1branches[2].getBranchElements()[0].setNumber(1);
                        //}
                    }
                }
                else if (msh1CommBrArray[0][0] === 2 || msh1CommBrArray[0][0] === 0) {
                    mesh1branches[0].setBranchElements(new voltagesource_1.VoltageSource(voltage, false));
                    //mesh1branches[msh1CommBrArray[0][0] === 2 ? 0 : 2].getBranchElements()[0].setNumber(1);
                    //mesh1branches[msh1CommBrArray[0][0] === 2 ? 2 : 0].getBranchElements()[0].setNumber(2);
                    mesh1branches[2].setBranchElements(new voltagesource_1.VoltageSource(voltage, false));
                    if (msh1CommBrArray[0][0] === 2) {
                        mesh1branches[0].getBranchElements()[0].setNumber(1);
                        mesh1branches[2].getBranchElements()[0].setNumber(2);
                    }
                    else {
                        mesh1branches[2].getBranchElements()[0].setNumber(1);
                        mesh1branches[0].getBranchElements()[0].setNumber(2);
                    }
                    //mesh1branches[msh1CommBrArray[0][0] === 0 ? 2 : 0].getBranchElements()[0].setNumber(1);
                }
                //mesh1branches[0].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                break;
            }
            case 16: {
                meshes[0].getBranches()[0].setBranchElements(new voltagesource_1.VoltageSource(this.randomVoltageSourceValue(), this.randomBoolean()));
                meshes[1].getBranches()[2].setBranchElements(new voltagesource_1.VoltageSource(this.randomVoltageSourceValue(), this.randomBoolean()));
                meshes[2].getBranches()[4].setBranchElements(new voltagesource_1.VoltageSource(this.randomVoltageSourceValue(), this.randomBoolean()));
                //meshes[2].getBranches()[2].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                //meshes[3].getBranches()[1].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                break;
            }
        }
    };
    /**
     * Beallitja a feladdattipusnak megfeleloen, hogy melyik agban legyen a a thevenin 2 polus
     * @param circuit aramkor objektum
     * @param type feladattipus
     */
    CircuitGenerator.prototype.setThevenin2PoleInCircuit = function (circuit, type) {
        var meshes = circuit.getMeshes();
        var tempType = type;
        if (type <= 4 || type === 9 || type === 10) {
            tempType = 1;
        }
        switch (tempType) {
            case 1: {
                var lastMshBranches = meshes[circuit.getNumberOfMesh() - 1].getBranches();
                for (var i = 0; i < lastMshBranches.length; i++) {
                    if (lastMshBranches[i].getType() === meshes[circuit.getNumberOfMesh() - 1].getCommonBranchesArray()[0][1]) {
                        lastMshBranches[i].setTh2Pole(true);
                    }
                }
                break;
            }
            case 5: {
                var tempArray = [];
                var randomChoise = [];
                for (var h = 0; h < circuit.getNumberOfMesh(); h++) {
                    var elementH = meshes[h];
                    if (elementH.getCommonBranchesArray()[elementH.getCommonBranchesArray().length - 2] !== undefined) {
                        if (elementH.getCommonBranchesArray()[meshes[h].getCommonBranchesArray().length - 2][0] !== elementH.getCommonBranchesArray()[meshes[h].getCommonBranchesArray().length - 1][0]) {
                            tempArray.push(elementH.getCommonBranchesArray()[elementH.getCommonBranchesArray().length - 1]);
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
                for (var i = 0; i < meshes[randomChoise[3] - 1].getBranches().length; i++) {
                    var branch = meshes[randomChoise[3] - 1].getBranches()[i];
                    //console.log(branch.getCommon());
                    //console.log(branch.getType());
                    if (branch.getType() === randomChoise[0]) {
                        branch.setTh2Pole(true);
                        //console.log(branch);
                    }
                }
                //}
                break;
            }
            case 6: {
                //meshes[0].getBranches()[3].setTh2Pole(true);
                break;
            }
        }
    };
    /**
     * Az aramkor kozos agaiban elhelyezett aramkori elemek clonozasa a megfelelo kozos branch-be.
     * @param circuit aramkor objektum
     */
    CircuitGenerator.prototype.setCommonBranchesCloneElement = function (circuit) {
        var meshes = circuit.getMeshes();
        for (var h = 0; h < circuit.getNumberOfMesh(); h++) {
            var branches = meshes[h].getBranches();
            var commBrArray = meshes[h].getCommonBranchesArray();
            for (var i = 0; i < commBrArray.length; i++) {
                var commonSum = commBrArray[i][2] + commBrArray[i][3];
                var idx = commBrArray[i][2] - 1;
                var idxMshBrs = meshes[idx].getBranches();
                for (var j = 0; j < branches.length; j++) {
                    var branchType = branches[j].getType();
                    if (branchType === commBrArray[i][0]) {
                        if (commonSum === branches[j].getCommon()) {
                            if (branches[j].getBranchElements()[0] !== undefined) {
                                for (var k = 0; k < idxMshBrs.length; k++) {
                                    if (idxMshBrs[k].getType() === commBrArray[i][1]) {
                                        if (commonSum === idxMshBrs[k].getCommon()) {
                                            if (idxMshBrs[k].getBranchElements()[0] === undefined) {
                                                for (var l = 0; l < branches[j].getBranchElements().length; l++) {
                                                    idxMshBrs[k].setBranchElements(this.copyCommonElement(branches[j].getBranchElements()[l]));
                                                }
                                            }
                                        }
                                    }
                                }
                                //if (meshes[commBrArray[h][3]].)
                            }
                            else {
                                for (var k = 0; k < idxMshBrs.length; k++) {
                                    if (idxMshBrs[k].getType() === commBrArray[i][1]) {
                                        if (commonSum === idxMshBrs[k].getCommon()) {
                                            if (idxMshBrs[k].getBranchElements()[0] !== undefined) {
                                                for (var l = 0; l < idxMshBrs[j].getBranchElements().length; l++) {
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
    };
    CircuitGenerator.prototype.setAllSizeOfCircuit = function (circuit) {
        var meshes = circuit.getMeshes();
        meshes[0].setMeshBranchesSizeAll(96, 96, 96, 96);
        for (var h = 0; h < circuit.getNumberOfMesh(); h++) {
            var branches = meshes[h].getBranches();
            var commBrArray = meshes[h].getCommonBranchesArray();
            var typeCounter = [0, 0, 0, 0];
            if (h > 0) {
                for (var i = 0; i < commBrArray.length; i++) {
                    var idx = commBrArray[i][2] - 1;
                    if (commBrArray[i][2] < meshes[h].getMeshNumber()) {
                        if (commBrArray[i][0] === 0) {
                            meshes[h].getMeshBranchesSize()[0] += meshes[idx].getMeshBranchesSize()[2];
                            meshes[h].getMeshBranchesSize()[2] = meshes[h].getMeshBranchesSize()[0];
                        }
                        if (commBrArray[i][0] === 1) {
                            meshes[h].getMeshBranchesSize()[1] += meshes[idx].getMeshBranchesSize()[3];
                            meshes[h].getMeshBranchesSize()[3] = meshes[h].getMeshBranchesSize()[1];
                        }
                        if (commBrArray[i][0] === 2) {
                            meshes[h].getMeshBranchesSize()[2] += meshes[idx].getMeshBranchesSize()[0];
                            meshes[h].getMeshBranchesSize()[0] = meshes[h].getMeshBranchesSize()[2];
                        }
                        if (commBrArray[i][0] === 3) {
                            meshes[h].getMeshBranchesSize()[3] += meshes[idx].getMeshBranchesSize()[1];
                            meshes[h].getMeshBranchesSize()[1] = meshes[h].getMeshBranchesSize()[3];
                        }
                    }
                }
                for (var i = 0; i < meshes[h].getMeshBranchesSize().length; i++) {
                    if (meshes[h].getMeshBranchesSize()[i] === 0) {
                        meshes[h].getMeshBranchesSize()[i] = 96;
                    }
                }
            }
            for (var i = 0; i < branches.length; i++) {
                if (branches[i].getType() === 0) {
                    typeCounter[0]++;
                }
                if (branches[i].getType() === 1) {
                    typeCounter[1]++;
                }
                if (branches[i].getType() === 2) {
                    typeCounter[2]++;
                }
                if (branches[i].getType() === 3) {
                    typeCounter[3]++;
                }
            }
            for (var i = 0; i < branches.length; i++) {
                var elements = branches[i].getBranchElements();
                if (branches[i].getType() === 0) {
                    branches[i].setBranchSize(meshes[h].getMeshBranchesSize()[0] / typeCounter[0]);
                    for (var j = 0; j < elements.length; j++) {
                        elements[j].setElementSize(branches[i].getBrancSize() / elements.length);
                    }
                }
                if (branches[i].getType() === 1) {
                    branches[i].setBranchSize(meshes[h].getMeshBranchesSize()[1] / typeCounter[1]);
                    for (var j = 0; j < elements.length; j++) {
                        elements[j].setElementSize(branches[i].getBrancSize() / elements.length);
                    }
                }
                if (branches[i].getType() === 2) {
                    branches[i].setBranchSize(meshes[h].getMeshBranchesSize()[2] / typeCounter[2]);
                    for (var j = 0; j < elements.length; j++) {
                        elements[j].setElementSize(branches[i].getBrancSize() / elements.length);
                    }
                }
                if (branches[i].getType() === 3) {
                    branches[i].setBranchSize(meshes[h].getMeshBranchesSize()[3] / typeCounter[3]);
                    for (var j = 0; j < elements.length; j++) {
                        elements[j].setElementSize(branches[i].getBrancSize() / elements.length);
                    }
                }
            }
        }
        //meshes[5].getBranches()[0].getBranchElements()[0].setElementSize(33);
    };
    CircuitGenerator.prototype.setElementsCoordinate = function (circuit) {
        //let startPosition: number[] = [0,0];
        var meshes = circuit.getMeshes();
        var startX;
        var startY;
        var endX;
        var endY;
        for (var h = 0; h < circuit.getNumberOfMesh(); h++) {
            var branches = meshes[h].getBranches();
            var commBrArray = meshes[h].getCommonBranchesArray();
            var startPosition = [0, 0];
            if (h > 0) {
                if (commBrArray[1] !== undefined || h === circuit.getNumberOfMesh() - 1 || commBrArray.length === 1) {
                    if ((commBrArray[1] === undefined) || (commBrArray[0][0] !== commBrArray[1][0]) || commBrArray.length === 1) {
                        //console.log('IF 1');
                        var coordinateArray = meshes[commBrArray[0][2] - 1].getBranches()[0].getBranchElements()[0].getCoordinate();
                        if (commBrArray[0][0] === 0) {
                            //console.log('IF 11');
                            startPosition[0] = coordinateArray[0] + meshes[h - 1].getMeshBranchesSize()[3];
                            startPosition[1] = coordinateArray[1];
                        }
                        if (commBrArray[0][0] === 1) {
                            //console.log('IF 12');
                            startPosition[1] = coordinateArray[1] + meshes[h].getMeshBranchesSize()[0];
                            startPosition[0] = coordinateArray[0];
                        }
                        if (commBrArray[0][0] === 2) {
                            //console.log('IF 13');
                            startPosition[0] = coordinateArray[0] - meshes[h].getMeshBranchesSize()[3];
                            startPosition[1] = coordinateArray[1];
                        }
                        if (commBrArray[0][0] === 3) {
                            //console.log('IF 14');
                            startPosition[1] = coordinateArray[1] - meshes[h - 1].getMeshBranchesSize()[0];
                            startPosition[0] = coordinateArray[0];
                        }
                    }
                    else if (commBrArray[0][0] === commBrArray[1][0]) {
                        // console.log('IF 2');
                        startPosition = [0, 0];
                        if (commBrArray[0][0] === 0) {
                            var maxY = -Infinity;
                            for (var i = 0; i < commBrArray.length; i++) {
                                var idx = commBrArray[i][2] - 1;
                                var idxMshBrs = meshes[idx].getBranches();
                                if (commBrArray[i][0] === 0) {
                                    for (var j = 0; j < idxMshBrs.length; j++) {
                                        if (idxMshBrs[j].getType() === 2) {
                                            for (var k = 0; k < idxMshBrs[j].getBranchElements().length; k++) {
                                                if (idxMshBrs[j].getBranchElements()[k].getCoordinate()[3] >= maxY) {
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
                        if (commBrArray[0][0] === 1) {
                            var maxY = -Infinity;
                            var minX = Infinity;
                            for (var i = 0; i < commBrArray.length; i++) {
                                var idx = commBrArray[i][2] - 1;
                                var idxMshBrs = meshes[idx].getBranches();
                                if (commBrArray[i][0] === 1) {
                                    for (var j = 0; j < idxMshBrs.length; j++) {
                                        if (idxMshBrs[j].getType() === 3) {
                                            for (var k = 0; k < idxMshBrs[j].getBranchElements().length; k++) {
                                                if (idxMshBrs[j].getBranchElements()[k].getCoordinate()[2] <= minX) {
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
                        if (commBrArray[0][0] === 2) {
                            var maxY = -Infinity;
                            var minX = Infinity;
                            for (var i = 0; i < commBrArray.length; i++) {
                                var idx = commBrArray[i][2] - 1;
                                var idxMshBrs = meshes[idx].getBranches();
                                if (commBrArray[i][0] === 2) {
                                    for (var j = 0; j < idxMshBrs.length; j++) {
                                        if (idxMshBrs[j].getType() === 0) {
                                            for (var k = 0; k < idxMshBrs[j].getBranchElements().length; k++) {
                                                if (idxMshBrs[j].getBranchElements()[k].getCoordinate()[1] >= maxY) {
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
                        if (commBrArray[0][0] === 3) {
                            var maxY = -Infinity;
                            var minX = Infinity;
                            for (var i = 0; i < commBrArray.length; i++) {
                                var idx = commBrArray[i][2] - 1;
                                var idxMshBrs = meshes[idx].getBranches();
                                if (commBrArray[i][0] === 3) {
                                    for (var j = 0; j < idxMshBrs.length; j++) {
                                        if (idxMshBrs[j].getType() === 1) {
                                            for (var k = 0; k < idxMshBrs[j].getBranchElements().length; k++) {
                                                if (idxMshBrs[j].getBranchElements()[k].getCoordinate()[0] <= minX) {
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
            for (var i = 0; i < branches.length; i++) {
                var elements = branches[i].getBranchElements();
                for (var j = 0; j < elements.length; j++) {
                    //if (h === 0){
                    var type = branches[i].getType();
                    startX = startPosition[0];
                    startY = startPosition[1];
                    endX = startPosition[0] + (type === 1 ? elements[j].getElementSize() : (type === 3 ? -elements[j].getElementSize() : 0));
                    endY = startPosition[1] + (type === 0 ? -elements[j].getElementSize() : (type === 2 ? elements[j].getElementSize() : 0));
                    elements[j].setCoordinate(startX, startY, endX, endY);
                    startPosition = [endX, endY];
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
    };
    CircuitGenerator.prototype.deleteElementsCoordinateOfConnectedMesh = function (circuit) {
        var meshes = circuit.getMeshes();
        for (var h = 1; h < circuit.getNumberOfMesh(); h++) {
            var branches = meshes[h].getBranches();
            var commBrArray = meshes[h].getCommonBranchesArray();
            for (var i = 0; i < branches.length; i++) {
                var elements = branches[i].getBranchElements();
                if (branches[i].getType() === commBrArray[0][0]) {
                    for (var j = 0; j < elements.length; j++) {
                        elements[j].deleteCoordinateArray();
                        elements[j].setElementSize(undefined);
                    }
                }
            }
        }
    };
    CircuitGenerator.prototype.getCircuitCoordinatesToFalstad = function () {
        return this.circuitCoordinatesToFalstad;
    };
    CircuitGenerator.prototype.setMultiplyResistorInBranch = function (circuitResDet) {
        //console.log("ciruitResDet sort elott: "+circuitResDet);
        var cloneCircResDet = circuitResDet.slice(0);
        cloneCircResDet.sort(function (a, b) { return +b.split(" ")[2] - (+a.split(" ")[2]); });
        //console.log("ciruitResDet sort utan: "+cloneCircResDet);
        var multitemp = [];
        for (var i = 0; i < cloneCircResDet.length; i++) {
            var resistor = cloneCircResDet[i].split(" ");
            //this.multiplyResistorInBranch.push(resistor[2]);
            if ((resistor[1] !== resistor[2]) /* && resistor[2] === cloneCircResDet[i+1].split(" ")[2]*/) {
                multitemp.push(resistor[2]);
                //this.multiplyResistorInBranch.push(resistor[2]+" "+ resistor[0]+" "+cloneCircResDet[i+1].split(" ")[0]);
                //multiplyResistorsInBranch[resistor[2]] = [resistor[0]];
                //multiplyResistorsInBranch[resistor[2]].push(ciruitResDet[i+1].split(" ")[0]);
            }
        }
        var temp = Array.from(new Set(multitemp));
        //console.log("multitemp: "+multitemp);
        //console.log("temp: "+temp);
        for (var h = 0; h < temp.length; h++) {
            var multitmp = [temp[h]];
            //ultitmp.push(temp[h]);
            for (var i = 0; i < cloneCircResDet.length; i++) {
                var resistor = cloneCircResDet[i].split(" ");
                //console.log("resistor: "+ resistor);
                if (+temp[h] === +resistor[2]) {
                    multitmp.push(resistor[0]);
                }
            }
            //console.log("multitmp: "+ multitmp);
            this.multiplyResistorInBranch.push(multitmp.join(" "));
        }
    };
    CircuitGenerator.prototype.setCircuitElementCoordinatesArrayToFalstadExport = function (circuit, type) {
        this.circuitCoordinatesToFalstad = [];
        var meshes = circuit.getMeshes();
        var allResistanceCounter = 0;
        var allVoltageSourceCounter = 0;
        var task10inputVoltage;
        //let task10outputVoltage: number
        for (var h = 0; h < circuit.getNumberOfMesh(); h++) {
            var branches = meshes[h].getBranches();
            var commonBranchRes = void 0;
            for (var j = 0; j < branches.length; j++) {
                if (branches[j].getCommon() !== circuit.getMeshes()[h].getMeshNumber()) {
                    commonBranchRes = branches[j].getBranchResistance();
                }
            }
            for (var i = 0; i < branches.length; i++) {
                var elements = branches[i].getBranchElements();
                //let branchResistanceCounter: number = 0;
                for (var j = 0; j < elements.length; j++) {
                    if (elements[j].getCoordinate()[0] !== undefined) {
                        var coordinate = elements[j].getCoordinate();
                        if (elements[j].getId() === 'W') {
                            if (branches[i].getTh2Pole()) {
                                //if (type === 10){
                                //let task10outputVoltage: number = this.randomIntNumber(task10inputVoltage-1,1);
                                //this.circuitCoordinatesToFalstad.push('p '+coordinate[0]+' '+coordinate[1]+' '+coordinate[2]+' '+coordinate[3]+' 1 0 '+task10outputVoltage);
                                //} else {
                                this.circuitCoordinatesToFalstad.push('p ' + coordinate[0] + ' ' + coordinate[1] + ' ' + coordinate[2] + ' ' + coordinate[3] + ' 1 0');
                                //}
                            }
                            else {
                                this.circuitCoordinatesToFalstad.push('w ' + coordinate[0] + ' ' + coordinate[1] + ' ' + coordinate[2] + ' ' + coordinate[3] + ' 0');
                            }
                        }
                        if (elements[j].getId() === 'R') {
                            //branchResistanceCounter++;
                            if (type < 10) {
                                allResistanceCounter++;
                                branches[i].setResistanceOfBranch(allResistanceCounter);
                                elements[j].setNumber(allResistanceCounter);
                            }
                            var resistance = elements[j].getResistance();
                            if (type < 10) {
                                if (branches[i].getCommon() !== circuit.getMeshes()[h].getMeshNumber()) {
                                    //console.log("circuit.getNumberOfMesh(): "+circuit.getNumberOfMesh());
                                    //console.log("branches[i].getCommon(): "+branches[i].getCommon());
                                    //console.log("a kozos ag ossz ellenallasa: "+branches[i].getBranchResistance());
                                    this.circuitResistorsDetails.push("R" + allResistanceCounter + " " + elements[j].getResistance() + " " + branches[i].getBranchResistance());
                                }
                                else {
                                    this.circuitResistorsDetails.push("R" + allResistanceCounter + " " + elements[j].getResistance() + " " + (meshes[h].getMeshResistance() - commonBranchRes));
                                }
                            }
                            this.circuitCoordinatesToFalstad.push('r ' + coordinate[0] + ' ' + coordinate[1] + ' ' + coordinate[2] + ' ' + coordinate[3] + ' 0 ' + resistance + ' ' + elements[j].getNumber());
                        }
                        if (elements[j].getId() === 'V') {
                            if (type < 10) {
                                allVoltageSourceCounter++;
                                elements[j].setNumber(allVoltageSourceCounter);
                            }
                            var voltage = void 0;
                            if (elements[j].getDirection()) {
                                voltage = -elements[j].getVoltage();
                            }
                            else {
                                voltage = elements[j].getVoltage();
                            }
                            if (type === 10) {
                                task10inputVoltage = Math.abs(voltage);
                            }
                            this.circuitCoordinatesToFalstad.push('v ' + coordinate[0] + ' ' + coordinate[1] + ' ' + coordinate[2] + ' ' + coordinate[3] + ' 0 0 40 ' + voltage + ' 0 0 0.5 ' + elements[j].getNumber());
                        }
                        if (elements[j].getId() === 'C') {
                            this.circuitCoordinatesToFalstad.push('c ' + coordinate[0] + ' ' + coordinate[1] + ' ' + coordinate[2] + ' ' + coordinate[3] + ' 0');
                        }
                    }
                }
            }
        }
        circuit.setExpOutVolt(this.randomIntNumber(task10inputVoltage - 1, 1));
        circuit.setNumberOfResistors(allResistanceCounter);
    };
    CircuitGenerator.prototype.generateFalstadLink = function (circuit, type, res, volt) {
        var meshes = circuit.getMeshes();
        var link = 'https://www.falstad.com/circuit/circuitjs.html?cct=$+1+0.000005+10.20027730826997+50+5+43';
        var positiveX = -Infinity, positiveY = -Infinity;
        var negativX = Infinity, negativY = Infinity;
        var offsetX;
        var ohmMeterCoord = [];
        var halfBranch;
        if ((type >= 1 && type < 6) || type === 9 || type === 10) {
            //this.setCircuitElementCoordinatesArrayToFalstadExport(circuit);
            var coordinates = this.circuitCoordinatesToFalstad;
            for (var i = 0; i < coordinates.length; i++) {
                var branchCoordinates = coordinates[i].split(" ");
                //console.log("branchCoordinates[1]: "+typeof(branchCoordinates))
                if (+branchCoordinates[1] < negativX) {
                    negativX = +branchCoordinates[1];
                }
                if (+branchCoordinates[3] < negativX) {
                    negativX = +branchCoordinates[3];
                }
                if (+branchCoordinates[2] < negativY) {
                    negativY = +branchCoordinates[2];
                }
                if (+branchCoordinates[4] < negativY) {
                    negativY = +branchCoordinates[4];
                }
                if (+branchCoordinates[1] > positiveX) {
                    positiveX = +branchCoordinates[1];
                }
                if (+branchCoordinates[3] > positiveX) {
                    positiveX = +branchCoordinates[3];
                }
                if (+branchCoordinates[2] > positiveY) {
                    positiveY = +branchCoordinates[2];
                }
                if (+branchCoordinates[4] > positiveY) {
                    positiveY = +branchCoordinates[4];
                }
            }
            offsetX = Math.abs(negativX - positiveX) + 96;
            //console.log("offsetX: "+offsetX)
            //console.log("positiveX: "+positiveX)
            // console.log("positiveY: "+positiveY)
        }
        for (var h = 0; h < circuit.getNumberOfMesh(); h++) {
            var branches = meshes[h].getBranches();
            for (var i_5 = 0; i_5 < branches.length; i_5++) {
                var elements = branches[i_5].getBranchElements();
                var branchType = branches[i_5].getType();
                for (var j = 0; j < elements.length; j++) {
                    if (elements[j].getCoordinate()[0] !== undefined) {
                        var coordinate = elements[j].getCoordinate();
                        if (elements[j].getId() === 'R') {
                            var resistance = elements[j].getResistance();
                            link += '%0Ar+' + coordinate[0] + '+' + coordinate[1] + '+' + coordinate[2] + '+' + coordinate[3] + '+0+' + resistance + (type === 10 ? '+' + elements[j].getNumber() : '');
                            if ((type >= 1 && type < 6) || type === 9 || type === 10) {
                                link += '%0Ar+' + (coordinate[0] + offsetX) + '+' + coordinate[1] + '+' + (coordinate[2] + offsetX) + '+' + coordinate[3] + '+0+' + resistance + (type === 10 ? '+' + elements[j].getNumber() : '');
                            }
                        }
                        if (elements[j].getId() === 'V') {
                            var voltage = void 0;
                            if (elements[j].getDirection()) {
                                voltage = -elements[j].getVoltage();
                            }
                            else {
                                voltage = elements[j].getVoltage();
                            }
                            if ((type >= 1 && type < 6) || type === 9 || type === 10) {
                                if (type !== 10) {
                                    link += '%0Aw+' + (coordinate[0] + offsetX) + '+' + coordinate[1] + '+' + (coordinate[2] + offsetX) + '+' + coordinate[3] + '+0';
                                }
                                else {
                                    if (branches[i_5].getCommon() !== meshes[h].getMeshNumber()) {
                                        link += '%0Av+' + (coordinate[0] + offsetX) + '+' + coordinate[1] + '+' + (coordinate[2] + offsetX) + '+' + coordinate[3] + '+0+0+40+' + (-voltage) + '+0+0+0.5' + (type === 10 ? '+' + elements[j].getNumber() : '');
                                    }
                                    else {
                                        link += '%0Av+' + (coordinate[0] + offsetX) + '+' + coordinate[1] + '+' + (coordinate[2] + offsetX) + '+' + coordinate[3] + '+0+0+40+' + voltage + '+0+0+0.5' + (type === 10 ? '+' + elements[j].getNumber() : '');
                                    }
                                }
                                link += '%0Av+' + coordinate[0] + '+' + coordinate[1] + '+' + coordinate[2] + '+' + coordinate[3] + '+0+0+40+' + voltage + '+0+0+0.5' + (type === 10 ? '+' + elements[j].getNumber() : '');
                                //link +='%0Aw+'+coordinate[0]+'+'+coordinate[1]+'+'+coordinate[2]+'+'+coordinate[3]+'+0';
                            }
                            else {
                                link += '%0Av+' + coordinate[0] + '+' + coordinate[1] + '+' + coordinate[2] + '+' + coordinate[3] + '+0+0+40+' + voltage + '+0+0+0.5';
                            }
                        }
                        if (elements[j].getId() === 'C') {
                            link += '%0Ac+' + coordinate[0] + '+' + coordinate[1] + '+' + coordinate[2] + '+' + coordinate[3] + '+0';
                        }
                        if (elements[j].getId() === 'W') {
                            if (branches[i_5].getTh2Pole()) {
                                if (type === 6 || type === 8 || type === 7) {
                                    if (branchType === 0 || branchType === 2) {
                                        halfBranch = (Math.abs(coordinate[1] - coordinate[3]) / 2);
                                        link += '%0Aw+' + coordinate[0] + '+' + coordinate[1] + '+' + (coordinate[0] + (branchType === 0 ? -20 : 20)) + '+' + (coordinate[1] + (branchType === 0 ? -20 : 20)) + '+0';
                                        link += '%0Aw+' + coordinate[2] + '+' + coordinate[3] + '+' + (coordinate[2] + (branchType === 0 ? -20 : 20)) + '+' + (coordinate[3] + (branchType === 0 ? 20 : -20)) + '+0';
                                        link += '%0Ar+' + coordinate[0] + '+' + coordinate[1] + '+' + coordinate[2] + '+' + (coordinate[3] + (branchType === 0 ? halfBranch : -halfBranch)) + '+0+' + res;
                                        link += '%0A' + (type === 6 ? "370" : type === 7 ? "s" : "v") + '+' + coordinate[2] + '+' + (coordinate[3] + (branchType === 0 ? halfBranch : -halfBranch)) + '+' + coordinate[2] + '+' + coordinate[3] + '+' + (type === 6 ? '+1+0' : type === 7 ? '+0+1+false' : '+0+0+40+' + (-volt) + '+0+0+0.5');
                                        link += '%0Ap+' + (coordinate[0] + (branchType === 0 ? -20 : 20)) + '+' + (coordinate[1] + (branchType === 0 ? -20 : 20)) + '+' + (coordinate[2] + (branchType === 0 ? -20 : 20)) + '+' + (coordinate[3] + (branchType === 0 ? 20 : -20)) + '+1+0';
                                    }
                                    else {
                                        halfBranch = (Math.abs(coordinate[0] - coordinate[2]) / 2);
                                        link += '%0Aw+' + coordinate[0] + '+' + coordinate[1] + '+' + (coordinate[0] + (branchType === 1 ? 20 : -20)) + '+' + (coordinate[1] + (branchType === 1 ? -20 : 20)) + '+0';
                                        link += '%0Aw+' + coordinate[2] + '+' + coordinate[3] + '+' + (coordinate[2] + (branchType === 1 ? -20 : 20)) + '+' + (coordinate[3] + (branchType === 1 ? -20 : 20)) + '+0';
                                        link += '%0Ar+' + coordinate[0] + '+' + coordinate[1] + '+' + (coordinate[2] + (branchType === 1 ? -halfBranch : halfBranch)) + '+' + coordinate[3] + '+0+' + res;
                                        link += '%0A' + (type === 6 ? "370" : type === 7 ? "s" : "v") + '+' + (coordinate[2] + (branchType === 1 ? -halfBranch : halfBranch)) + '+' + coordinate[3] + '+' + coordinate[2] + '+' + coordinate[3] + '+' + (type === 6 ? '+1+0' : type === 7 ? '+0+1+false' : '+0+0+40+' + (-volt) + '+0+0+0.5');
                                        link += '%0Ap+' + (coordinate[0] + (branchType === 1 ? 20 : -20)) + '+' + (coordinate[1] + (branchType === 1 ? -20 : 20)) + '+' + (coordinate[2] + (branchType === 1 ? -20 : 20)) + '+' + (coordinate[3] + (branchType === 1 ? -20 : 20)) + '+1+0';
                                    }
                                    //console.log("halfBranch: " +halfBranch);
                                    //link +='%0Ar+'+coordinate[0]+'+'+coordinate[1]+'+'+coordinate[2]+'+'+coordinate[3]+'+0+'+ res;
                                }
                                else if ((type >= 1 && type < 6) || type === 9 || type === 10) {
                                    ohmMeterCoord.push(coordinate[0], coordinate[1], coordinate[2], coordinate[3]);
                                    link += '%0Ap+' + coordinate[0] + '+' + coordinate[1] + '+' + coordinate[2] + '+' + coordinate[3] + '+1+0';
                                    //link +='%0A216+'+coordinate[0]+'+'+coordinate[1]+'+'+coordinate[2]+'+'+coordinate[3]+'+32+0+0.001';
                                    if (type !== 10) {
                                        link += '%0A216+' + (coordinate[0] + offsetX) + '+' + coordinate[1] + '+' + (coordinate[2] + offsetX) + '+' + coordinate[3] + '+0+0.0001';
                                    }
                                    else {
                                        link += '%0Ap+' + (coordinate[0] + offsetX) + '+' + coordinate[1] + '+' + (coordinate[2] + offsetX) + '+' + coordinate[3] + '+1+0';
                                    }
                                } /*else if (type === 7){
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
                                } */
                                else {
                                    link += '%0Ap+' + coordinate[0] + '+' + coordinate[1] + '+' + coordinate[2] + '+' + coordinate[3] + '+1+0';
                                }
                            }
                            else {
                                if ((type >= 1 && type < 6) || type === 9 || type === 10) {
                                    link += '%0Aw+' + (coordinate[0] + offsetX) + '+' + coordinate[1] + '+' + (coordinate[2] + offsetX) + '+' + coordinate[3] + '+0';
                                }
                                link += '%0Aw+' + coordinate[0] + '+' + coordinate[1] + '+' + coordinate[2] + '+' + coordinate[3] + '+0';
                            }
                        }
                    }
                }
            }
        }
        /*if (type === 1){
            link +='%0A216+'+(ohmMeterCoord[0]+offsetX)+'+'+ohmMeterCoord[1]+'+'+(ohmMeterCoord[2]+offsetX)+'+'+ohmMeterCoord[3]+'+0+0.01';
        }*/
        link += '%0A';
        //console.log(link);
        return link;
    };
    /**
     * A generalt aramkor a www.falstad.com oldalhoz megfelelo txt formatumba exportalasa.
     * @param circuitCoordinates az aramkor elemeinek koordinataival feltoltott tomb
     */
    CircuitGenerator.prototype.exportToFalstadTxt = function (circuitCoordinates) {
        /*this.fs.truncate('falstad.txt', 0,  function(err) {
            if (err) {
                return console.error(err);
            }});*/
        this.fs.writeFile('falstad.txt', '$ 1 0.000005 10.20027730826997 50 5 43\n', function (err) {
            if (err) {
                return console.error(err);
            }
        });
        for (var h = 0; h < circuitCoordinates.length; h++) {
            this.fs.appendFile('falstad.txt', circuitCoordinates[h] + '\n', function (err) {
                if (err) {
                    return console.error(err);
                }
            });
        }
    };
    CircuitGenerator.prototype.counterOfChoiseTypeMultibranch = function (array, choiseType) {
        var count = 0;
        for (var i = 0; i < array.length; i++) {
            if (choiseType === array[i][0]) {
                count++;
            }
        }
        return count;
    };
    CircuitGenerator.prototype.deleteNotAcceptableBranchInArray = function (circuit, array, meshnumber) {
        var meshes = circuit.getMeshes();
        var commBrArray = meshes[meshnumber - 1].getCommonBranchesArray();
        for (var j = 0; j < commBrArray.length; j++) {
            for (var i = 0; i < array.length; i++) {
                if (commBrArray[j][0] === array[i][0] && array[i][2] === commBrArray[j][3]) {
                    array.splice(i, 1);
                    break;
                }
            }
        }
    };
    CircuitGenerator.prototype.searchMultipleBranchTypeInAcceptableCommonBranchArray = function (array) {
        var multipleBrancTypeArray = [];
        var counter = [0, 0, 0, 0];
        for (var j = 0; j < array.length; j++) {
            if (array[j][0] === 0) {
                counter[0]++;
            }
            if (array[j][0] === 1) {
                counter[1]++;
            }
            if (array[j][0] === 2) {
                counter[2]++;
            }
            if (array[j][0] === 3) {
                counter[3]++;
            }
        }
        for (var i = 0; i < counter.length; i++) {
            if (counter[i] > 1) {
                multipleBrancTypeArray.push(i);
            }
        }
        return multipleBrancTypeArray;
    };
    CircuitGenerator.prototype.setInverzMultipleBranch = function (array) {
        var singleBranches = [0, 1, 2, 3];
        for (var i = 0; i < array.length; i++) {
            for (var j = 0; j < singleBranches.length; j++) {
                if (array[i] === singleBranches[j]) {
                    singleBranches.splice(j, 1);
                    break;
                }
            }
        }
        return singleBranches;
    };
    /**
    * A kozos agakban szereplo aramkori elemek masolasat vegzi.
    * A generatoroknal forditja az iranyt, mivel a ket szomszedos hurokban maskepp hatnak.
    * @param element egy aramkori elemet var
    */
    CircuitGenerator.prototype.copyCommonElement = function (element) {
        var circuitelement;
        if (element.getId() === 'R') {
            circuitelement = new resistance_1.Resistance(element.getResistance());
        }
        if (element.getId() === 'V') {
            circuitelement = new voltagesource_1.VoltageSource(element.getVoltage(), !element.getDirection());
        }
        if (element.getId() === 'C') {
            circuitelement = new currentsource_1.CurrentSource(element.getVoltage(), !element.getDirection());
        }
        return circuitelement;
    };
    CircuitGenerator.prototype.getMultiplyResistorInBranch = function () {
        return this.multiplyResistorInBranch;
    };
    CircuitGenerator.prototype.getCircuitResistorsDetails = function () {
        return this.circuitResistorsDetails;
    };
    /**
     *
     * @param max
     * @param min
     */
    CircuitGenerator.prototype.randomIntNumber = function (max, min) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    };
    /**
     *
     * @param max
     * @param min
     */
    CircuitGenerator.prototype.randomFloatNumber = function (max, min) {
        return +(Math.random() * (max - min) + min).toFixed(1);
    };
    /**
     *
     */
    CircuitGenerator.prototype.randomBoolean = function () {
        if ((Math.floor(Math.random() * 2) + 1) === 1) {
            return false;
        }
        else {
            return true;
        }
    };
    /**
     *
     */
    CircuitGenerator.prototype.randomVoltageSourceValue = function (int, max, min) {
        if (int) {
            return this.randomIntNumber(max, min);
        }
        else {
            return this.randomFloatNumber(24, 0.1);
        }
        //return this.randomIntNumber(24, 1);
    };
    /**
     *
     */
    CircuitGenerator.prototype.randomCurrentSourceValue = function () {
        return this.randomFloatNumber(1.40, 0.01);
    };
    /**
     * Az E6-os ellenallas sorhoz tartozo ellenallas ertekek random generalasa,
     * 1K, 10K es 100K ertekekhez
     */
    CircuitGenerator.prototype.randomE6Resistance = function () {
        var resistance = [1000, 10000, 100000];
        var e6base = [1, 1.5, 2.2, 3.3, 4.7, 6.8];
        return Math.round(e6base[this.randomIntNumber(5, 0)] * resistance[this.randomIntNumber(2, 0)]);
    };
    CircuitGenerator.prototype.randomIncrementOrDecrement = function () {
        var number;
        if ((Math.floor(Math.random() * 2) + 1) === 1) {
            number = 1;
        }
        else {
            number = (3 - 4);
        }
        return number;
    };
    CircuitGenerator.prototype.randomChoiseTwoNumber = function (one, two) {
        if ((Math.floor(Math.random() * 2) + 1) === 1) {
            return one;
        }
        else {
            return two;
        }
    };
    CircuitGenerator.prototype.randomChoiseTwoAnything = function (one, two) {
        if ((Math.floor(Math.random() * 2) + 1) === 1) {
            return one;
        }
        else {
            return two;
        }
    };
    CircuitGenerator.prototype.randomChoiseInAnyArray = function (array) {
        var result;
        result = array[Math.floor(Math.random() * array.length)];
        return result;
    };
    CircuitGenerator.prototype.removeElementInAnyArray = function (element, array) {
        for (var i = 0; i < array.length; i++) {
            if (JSON.stringify(element) === JSON.stringify(array[i])) {
                array.splice(i, 1);
            }
        }
        return array;
    };
    CircuitGenerator.prototype.wichBiger = function (num1, num2) {
        if (num1 >= num2) {
            return num1;
        }
        else {
            return num2;
        }
    };
    CircuitGenerator.prototype.choiseMinimumValueInNumberArray = function (array) {
        var result = Infinity;
        for (var i = 0; i < array.length; i++) {
            if (array[i] < result) {
                result = array[i];
            }
        }
        return result;
    };
    CircuitGenerator.prototype.percentRandom = function (percent) {
        var result;
        if (Math.random() * 100 <= percent) {
            result = true;
        }
        else {
            result = false;
        }
        return result;
    };
    return CircuitGenerator;
}());
exports.CircuitGenerator = CircuitGenerator;
