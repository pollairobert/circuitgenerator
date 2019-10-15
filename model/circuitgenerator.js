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
    /**
     * Aramkor generalasaert felelos. Ezzel a metodussal kezdodik a teljes halozat generalasaert felelos tobbi metodus meghivasa.
     * Bizonyos feladatoknal lehetosege van a felhesznalonak sajat hurokszam beallitasara, ilyenkor a parameterben megadott hurokszam fog
     * beallitasra kerulni.
     * @param type aramkor tipusa adott struktura alapjan
     * @param pieceOfMesh felhasznalo altal megadott hurokszam (opcionalis)
     */
    CircuitGenerator.prototype.generateCircuit = function (type, pieceOfMesh) {
        var circuit;
        if (pieceOfMesh !== undefined) {
            circuit = this.buildFinalCircuit(new circuit_1.Circuit(this.circuitParameterLimits(type, pieceOfMesh)), type);
        }
        else {
            circuit = this.buildFinalCircuit(new circuit_1.Circuit(this.circuitParameterLimits(type)), type);
        }
        this.setCircuitElementCoordinatesArrayToFalstadExport(circuit, type);
        return circuit;
    };
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
    CircuitGenerator.prototype.circuitParameterLimits = function (type, pieceOfMesh) {
        var parameters = [];
        var temptype = type;
        var minMesh = 3;
        var maxMesh = 5;
        if (type >= 4 && type < 8) {
            temptype = 4;
        }
        if (type === 9) {
            temptype = 1;
        }
        if (type === 10) {
            temptype = 3;
        }
        if (pieceOfMesh !== undefined) {
            temptype = 4;
            if (pieceOfMesh < 11) {
                minMesh = pieceOfMesh;
                maxMesh = pieceOfMesh;
            }
            else {
                minMesh = 3;
                maxMesh = 10;
            }
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
            //Random hurokszamu feladatokhoz tartozo parameterlista
            case 4: {
                parameters = [this.randomIntNumber(maxMesh, minMesh),
                    this.randomIntNumber(15, 4),
                    this.randomIntNumber(0, 0),
                    this.randomIntNumber(20, 12)];
                break;
            }
            default: {
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
        var multiConnection = true;
        var meshes = circuit.getMeshes();
        if (type <= 6 || type === 9 || type === 10) {
            for (var h = 1; h <= numberOfMeshes; h++) {
                var connectBranches = [];
                var choiseMeshNumber = void 0;
                var multiBranch = void 0;
                if (type === 1 || type === 1.1 || type === 2 || type === 2.1 || type === 3 || type === 3.1 || type === 9 || type === 10) {
                    if (h < numberOfMeshes) {
                        choiseMeshNumber = (h + 1);
                        if (type === 2.1 && h > 1) {
                            randomCommonBranchPair = this.randomChoiseTwoAnything([0, 2], [2, 0]);
                        }
                        connectBranches.push(randomCommonBranchPair[0], randomCommonBranchPair[1], choiseMeshNumber, h);
                        meshes[h - 1].setCommonBranchesArray(connectBranches);
                        this.addConnectedBranchFromCommmonBranchesArrayElement(circuit, h, choiseMeshNumber);
                    }
                }
                if (type > 3.1 && type <= 6) {
                    choiseMeshNumber = (h + 1);
                    for (var i = 0; i < 4; i++) {
                        acceptebleCommonBranchArray.push([commonBranchPairs[i][0], commonBranchPairs[i][1], h]);
                    }
                    if (h === 1) {
                        randomCommonBranchPair = this.randomChoiseInAnyArray(commonBranchPairs);
                        connectBranches.push(randomCommonBranchPair[0], randomCommonBranchPair[1], choiseMeshNumber, h);
                        meshes[h - 1].setCommonBranchesArray(connectBranches);
                        this.addConnectedBranchFromCommmonBranchesArrayElement(circuit, h, choiseMeshNumber);
                        this.deleteNotAcceptableBranchInArray(circuit, acceptebleCommonBranchArray, h);
                    }
                    else if (h < numberOfMeshes) {
                        var choiseType = void 0;
                        this.deleteNotAcceptableBranchInArray(circuit, acceptebleCommonBranchArray, h);
                        multiBranch = this.searchMultipleBranchTypeInAcceptableCommonBranchArray(acceptebleCommonBranchArray);
                        multiConnection = this.randomBoolean();
                        if (multiConnection) {
                            choiseType = this.randomChoiseInAnyArray(multiBranch);
                            var choiseTypeCounter = this.counterOfChoiseTypeMultibranch(acceptebleCommonBranchArray, choiseType);
                            for (var i = 0; i < choiseTypeCounter; i++) {
                                for (var j = 0; j < acceptebleCommonBranchArray.length; j++) {
                                    if (choiseType === acceptebleCommonBranchArray[j][0]) {
                                        connectBranches.push(acceptebleCommonBranchArray[j][0], acceptebleCommonBranchArray[j][1], choiseMeshNumber, acceptebleCommonBranchArray[j][2]);
                                        meshes[acceptebleCommonBranchArray[j][2] - 1].setCommonBranchesArray(connectBranches);
                                        this.addConnectedBranchFromCommmonBranchesArrayElement(circuit, acceptebleCommonBranchArray[j][2], choiseMeshNumber);
                                        this.deleteNotAcceptableBranchInArray(circuit, acceptebleCommonBranchArray, acceptebleCommonBranchArray[j][2]);
                                        connectBranches = [];
                                        break;
                                    }
                                }
                            }
                        }
                        else {
                            var inverz = this.setInverzMultipleBranch(multiBranch);
                            choiseType = this.randomChoiseInAnyArray(inverz);
                            for (var j = 0; j < acceptebleCommonBranchArray.length; j++) {
                                if (choiseType === acceptebleCommonBranchArray[j][0]) {
                                    connectBranches.push(acceptebleCommonBranchArray[j][0], acceptebleCommonBranchArray[j][1], choiseMeshNumber, acceptebleCommonBranchArray[j][2]);
                                    meshes[acceptebleCommonBranchArray[j][2] - 1].setCommonBranchesArray(connectBranches);
                                    this.addConnectedBranchFromCommmonBranchesArrayElement(circuit, acceptebleCommonBranchArray[j][2], choiseMeshNumber);
                                    this.deleteNotAcceptableBranchInArray(circuit, acceptebleCommonBranchArray, acceptebleCommonBranchArray[j][2]);
                                    connectBranches = [];
                                }
                            }
                        }
                    }
                    if (h === numberOfMeshes) {
                        this.deleteNotAcceptableBranchInArray(circuit, acceptebleCommonBranchArray, h);
                    }
                }
            }
        }
        if (type <= 6 || type === 9 || type === 10) {
            this.setCommonBranchesInCircuit(circuit);
            this.setThevenin2PoleInCircuit(circuit, type);
            this.setVoltageSourceInCircuit(circuit, type);
            this.setResistanceInCircuit(circuit, type);
            this.setCommonBranchesCloneElement(circuit);
        }
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
            for (var i = 0; i < branches_1.length; i++) {
                if (branches_1[i].getType() === commonBranchesArray[h][0]) {
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
                if (branches[i].getType() === branches[i - 1].getType()) {
                    if (i < branches.length - 1 && (branches[i].getType() !== branches[i + 1].getType())) {
                        branches.splice(i, 1);
                    }
                    else if (i === branches.length - 1) {
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
        if (type === 6) {
            tempType = 4;
        }
        switch (tempType) {
            case 1: {
                if (msh1CommBrArray[0][0] === 1) {
                    if (mesh1branches[0].getBranchElements()[0] !== undefined) {
                        mesh1branches[0].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                        circuitResistanceNumber--;
                        mesh1branches[1].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                        circuitResistanceNumber--;
                        if (circuitResistanceNumber > 0) {
                            if (this.percentRandom(70)) {
                                mesh1branches[1].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                                circuitResistanceNumber--;
                            }
                            if (this.percentRandom(70)) {
                                mesh1branches[2].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                            }
                        }
                    }
                    else {
                        mesh1branches[2].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                        circuitResistanceNumber--;
                        mesh1branches[1].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                        circuitResistanceNumber--;
                        if (circuitResistanceNumber > 0) {
                            if (this.percentRandom(70)) {
                                mesh1branches[1].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                                circuitResistanceNumber--;
                            }
                            if (this.percentRandom(70)) {
                                mesh1branches[2].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                            }
                        }
                    }
                }
                else if (msh1CommBrArray[0][0] === 2) {
                    mesh1branches[1].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                    circuitResistanceNumber--;
                    mesh1branches[2].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                    circuitResistanceNumber--;
                    if (circuitResistanceNumber > 0) {
                        if (this.percentRandom(70)) {
                            mesh1branches[this.randomChoiseTwoNumber(1, 2)].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                            circuitResistanceNumber--;
                        }
                        if (this.percentRandom(70)) {
                            mesh1branches[3].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                        }
                    }
                }
                else if (msh1CommBrArray[0][0] === 0) {
                    mesh1branches[1].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                    circuitResistanceNumber--;
                    mesh1branches[0].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                    circuitResistanceNumber--;
                    if (circuitResistanceNumber > 0) {
                        if (this.percentRandom(70)) {
                            mesh1branches[3].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                            mesh1branches[this.randomChoiseTwoNumber(0, 1)].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                            circuitResistanceNumber--;
                        }
                        if (this.percentRandom(70)) {
                            mesh1branches[3].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                        }
                    }
                }
                break;
            }
            case 1.1: {
                if (msh1CommBrArray[0][0] === 1) {
                    if (mesh1branches[0].getBranchElements()[0] !== undefined) {
                        mesh1branches[0].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                        circuitResistanceNumber--;
                        mesh1branches[1].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                        circuitResistanceNumber--;
                        if (this.percentRandom(40)) {
                            mesh1branches[2].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                        }
                    }
                    else {
                        mesh1branches[1].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                        circuitResistanceNumber--;
                        mesh1branches[0].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                        circuitResistanceNumber--;
                        if (this.percentRandom(40)) {
                            mesh1branches[0].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                        }
                    }
                }
                else if (msh1CommBrArray[0][0] === 0 || msh1CommBrArray[0][0] === 2) {
                    mesh1branches[0].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                    circuitResistanceNumber--;
                    mesh1branches[2].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                    circuitResistanceNumber--;
                    if (circuitResistanceNumber > 0) {
                        if (this.percentRandom(70)) {
                            mesh1branches[1].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                            circuitResistanceNumber--;
                        }
                        if (this.percentRandom(40)) {
                            mesh1branches[3].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                        }
                    }
                }
                break;
            }
            case 2: {
                for (var i = 0; i < circuit.getNumberOfMesh(); i++) {
                    var branches = meshes[i].getBranches();
                    if (i < circuit.getNumberOfMesh() - 1) {
                        for (var j = 0; j < branches.length; j++) {
                            var branchType = branches[j].getType();
                            if (meshes[i].getCommonBranchesArray()[0][0] === 1 || meshes[i].getCommonBranchesArray()[0][0] === 3) {
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
                            else if (meshes[i].getCommonBranchesArray()[0][0] === 0 || meshes[i].getCommonBranchesArray()[0][0] === 2) {
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
                for (var i = 0; i < circuit.getNumberOfMesh(); i++) {
                    var branches = meshes[i].getBranches();
                    if (i < circuit.getNumberOfMesh() - 1) {
                        for (var j = 0; j < branches.length; j++) {
                            var branchType = branches[j].getType();
                            if (meshes[circuit.getNumberOfMesh() - 1].getCommonBranchesArray()[0][0] === 0) {
                                if ((branchType === 0 || branchType === 1) && i === 0) {
                                    branches[j].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                                    circuitResistanceNumber--;
                                }
                                else if ((branchType === 0 || branchType === 2) && i > 0) {
                                    branches[j].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                                    circuitResistanceNumber--;
                                }
                            }
                            else if (meshes[circuit.getNumberOfMesh() - 1].getCommonBranchesArray()[0][0] === 2) {
                                if ((branchType === 1 || branchType === 2) && i === 0) {
                                    branches[j].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                                    circuitResistanceNumber--;
                                }
                                else if ((branchType === 0 || branchType === 2) && i > 0) {
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
                for (var i = 0; i < circuit.getNumberOfMesh(); i++) {
                    var branches = meshes[i].getBranches();
                    if (i < circuit.getNumberOfMesh() - 1) {
                        for (var j = 0; j < branches.length; j++) {
                            var branchType = branches[j].getType();
                            if (meshes[i].getCommonBranchesArray()[0][0] === 1 || meshes[i].getCommonBranchesArray()[0][0] === 3) {
                                if (mesh1branches[0].getBranchElements()[0] !== undefined && mesh1branches[0].getBranchElements()[0].getId() === 'V') {
                                    if (branchType === 0 || branchType === 1) {
                                        if (i === 0 && branchType === 0) {
                                            branches[j].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                                        }
                                        else {
                                            if (branchType === 0) {
                                                if (circuitResistanceNumber > 3 && this.randomBoolean()) {
                                                    branches[j].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                                                }
                                            }
                                            else {
                                                branches[j].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                                            }
                                        }
                                    }
                                }
                                else {
                                    if (branchType === 1) {
                                        branches[j].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                                    }
                                    if (branchType === 2) {
                                        if (i === 0) {
                                            branches[j].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                                        }
                                        else {
                                            if (circuitResistanceNumber > 3 && this.randomBoolean()) {
                                                branches[j].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                                            }
                                        }
                                    }
                                }
                            }
                            else if (meshes[i].getCommonBranchesArray()[0][0] === 0 || meshes[i].getCommonBranchesArray()[0][0] === 2) {
                                if (i === 0) {
                                    if (branchType === 2 || branchType === 0) {
                                        branches[j].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                                    }
                                }
                                else if (branchType === 2 && meshes[i].getCommonBranchesArray()[0][0] === 0) {
                                    branches[j].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                                }
                                else if (branchType === 0 && meshes[i].getCommonBranchesArray()[0][0] === 2) {
                                    branches[j].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                                }
                                else if (branchType === 1) {
                                    if (circuitResistanceNumber > 3 && this.randomBoolean()) {
                                        branches[j].setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                                    }
                                }
                            }
                        }
                    }
                }
                break;
            }
            case 4: {
                for (var h = 0; h < circuit.getNumberOfMesh(); h++) {
                    var branches = meshes[h].getBranches();
                    var commBrArray = meshes[h].getCommonBranchesArray();
                    for (var i = 0; i < branches.length; i++) {
                        var branch = branches[i];
                        var elements = branches[i].getBranchElements();
                        if (!branches[i].getTh2Pole()) {
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
                                    if (this.percentRandom(70)) {
                                        branch.setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                                    }
                                    if (this.percentRandom(10) && !oneres) {
                                        branch.setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                                    }
                                }
                                else if (commBrArray[0][0] !== branch.getType() && (type === 4 ? h < circuit.getNumberOfMesh() - 1 : /*((type === 5) ? true :*/ true)) {
                                    if (branches[i].getCommon() !== meshes[h].getMeshNumber()) {
                                        branch.setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                                    }
                                    else if (this.percentRandom(70)) {
                                        branch.setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                                    }
                                    if (this.percentRandom(30)) {
                                        branch.setBranchElements(new resistance_1.Resistance(this.randomE6Resistance()));
                                    }
                                }
                            }
                        }
                    }
                }
                break;
            }
            case 10: {
                var resistance = this.randomE6Resistance();
                if (msh1CommBrArray[0][0] === 1) {
                    mesh1branches[1].setBranchElements(new resistance_1.Resistance(resistance));
                    mesh1branches[1].getBranchElements()[1].setNumber(2);
                    this.circuitResistorsDetails.push("R2 " + resistance);
                    if (this.randomChoiseTwoNumber(0, 2) === 0) {
                        mesh1branches[0].setBranchElements(new resistance_1.Resistance(resistance));
                        this.circuitResistorsDetails.push("R1 " + resistance);
                        if (mesh1branches[0].getBranchElements()[0].getId() !== "V") {
                            mesh1branches[0].getBranchElements()[0].setNumber(1);
                        }
                        else {
                            mesh1branches[0].getBranchElements()[1].setNumber(1);
                        }
                        meshes[1].getBranches()[1].setBranchElements(new resistance_1.Resistance(0.1));
                        meshes[1].getBranches()[1].getBranchElements()[0].setNumber(3);
                    }
                    else {
                        mesh1branches[2].setBranchElements(new resistance_1.Resistance(resistance));
                        this.circuitResistorsDetails.push("R1 " + resistance);
                        if (mesh1branches[2].getBranchElements()[0].getId() !== "V") {
                            mesh1branches[2].getBranchElements()[0].setNumber(1);
                        }
                        else {
                            mesh1branches[2].getBranchElements()[1].setNumber(1);
                        }
                        meshes[1].getBranches()[1].setBranchElements(new resistance_1.Resistance(0.1));
                        meshes[1].getBranches()[1].getBranchElements()[0].setNumber(3);
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
                }
                break;
            }
            default: {
                break;
            }
        }
    };
    /**
     * Megfelelo feltelek figyelembe vetelevel hozzaadja az aramkorhoz a feszultseggenerator(oka)t.
     *
     * @param circuit aramkor objektum
     * @param type feladat tipusa
     */
    CircuitGenerator.prototype.setVoltageSourceInCircuit = function (circuit, type) {
        var meshes = circuit.getMeshes();
        var mesh1branches = meshes[0].getBranches();
        var msh1CommBrArray = meshes[0].getCommonBranchesArray();
        var tempType = type;
        if (type > 3.1 && type <= 6) {
            tempType = 4;
        }
        if (type === 9) {
            tempType = 1;
        }
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
                if (msh1CommBrArray[0][0] === 1) {
                    mesh1branches[this.randomChoiseTwoNumber(0, 2)].setBranchElements(new voltagesource_1.VoltageSource(this.randomVoltageSourceValue(), this.randomBoolean()));
                    mesh1branches[1].setBranchElements(new voltagesource_1.VoltageSource(this.randomVoltageSourceValue(), this.randomBoolean()));
                }
                else if (msh1CommBrArray[0][0] === 0 || msh1CommBrArray[0][0] === 2) {
                    mesh1branches[0].setBranchElements(new voltagesource_1.VoltageSource(this.randomVoltageSourceValue(), this.randomBoolean()));
                    mesh1branches[2].setBranchElements(new voltagesource_1.VoltageSource(this.randomVoltageSourceValue(), this.randomBoolean()));
                }
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
                break;
            }
            case 4: {
                var maxVoltageSource = circuit.getParameters()[3];
                for (var h = 0; h < circuit.getNumberOfMesh(); h++) {
                    var branches = meshes[h].getBranches();
                    var commBrArray = meshes[h].getCommonBranchesArray();
                    var voltageSourceCounter = 0;
                    var percent = this.randomIntNumber(100, 40);
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
                                    percent += 30;
                                }
                            }
                            else if (commBrArray[0][0] !== branches[i].getType() && (type === 5 ? true : h < circuit.getNumberOfMesh() - 1)) {
                                if (maxVoltageSource > 0) {
                                    if (this.percentRandom(percent)) {
                                        branches[i].setBranchElements(new voltagesource_1.VoltageSource(this.randomVoltageSourceValue(), this.randomBoolean()));
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
                var voltage = this.randomIntNumber(24, 2);
                if (msh1CommBrArray[0][0] === 1) {
                    mesh1branches[1].setBranchElements(new voltagesource_1.VoltageSource(voltage, false));
                    mesh1branches[1].getBranchElements()[0].setNumber(2);
                    if (this.randomChoiseTwoNumber(0, 2) === 0) {
                        mesh1branches[0].setBranchElements(new voltagesource_1.VoltageSource(voltage, false));
                        mesh1branches[0].getBranchElements()[0].setNumber(1);
                    }
                    else {
                        mesh1branches[2].setBranchElements(new voltagesource_1.VoltageSource(voltage, false));
                        mesh1branches[2].getBranchElements()[0].setNumber(1);
                    }
                }
                else if (msh1CommBrArray[0][0] === 2 || msh1CommBrArray[0][0] === 0) {
                    mesh1branches[0].setBranchElements(new voltagesource_1.VoltageSource(voltage, false));
                    mesh1branches[2].setBranchElements(new voltagesource_1.VoltageSource(voltage, false));
                    if (msh1CommBrArray[0][0] === 2) {
                        mesh1branches[0].getBranchElements()[0].setNumber(1);
                        mesh1branches[2].getBranchElements()[0].setNumber(2);
                    }
                    else {
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
        if (type === 6) {
            tempType = this.randomChoiseTwoNumber(1, 5);
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
                randomChoise = this.randomChoiseInAnyArray(tempArray);
                for (var i = 0; i < meshes[randomChoise[3] - 1].getBranches().length; i++) {
                    var branch = meshes[randomChoise[3] - 1].getBranches()[i];
                    if (branch.getType() === randomChoise[0]) {
                        branch.setTh2Pole(true);
                    }
                }
                break;
            }
            default: {
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
    /**
     * Beallitja a halozat osszes aganak es elemenek mertet a kesobbi megjeleniteshez.
     * @param circuit aramkor objektum
     */
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
    };
    /**
     * Beallitja az aramkor osszes elemenek a kezdo es a veg koordinatait.
     * A megjeleniteshez kellenek a koordinatak.
     * @param circuit aramkor objektum
     */
    CircuitGenerator.prototype.setElementsCoordinate = function (circuit) {
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
                        var coordinateArray = meshes[commBrArray[0][2] - 1].getBranches()[0].getBranchElements()[0].getCoordinate();
                        if (commBrArray[0][0] === 0) {
                            startPosition[0] = coordinateArray[0] + meshes[h - 1].getMeshBranchesSize()[3];
                            startPosition[1] = coordinateArray[1];
                        }
                        if (commBrArray[0][0] === 1) {
                            startPosition[1] = coordinateArray[1] + meshes[h].getMeshBranchesSize()[0];
                            startPosition[0] = coordinateArray[0];
                        }
                        if (commBrArray[0][0] === 2) {
                            startPosition[0] = coordinateArray[0] - meshes[h].getMeshBranchesSize()[3];
                            startPosition[1] = coordinateArray[1];
                        }
                        if (commBrArray[0][0] === 3) {
                            startPosition[1] = coordinateArray[1] - meshes[h - 1].getMeshBranchesSize()[0];
                            startPosition[0] = coordinateArray[0];
                        }
                    }
                    else if (commBrArray[0][0] === commBrArray[1][0]) {
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
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            startPosition[1] = maxY;
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
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            startPosition[0] = minX;
                            startPosition[1] += meshes[h].getMeshBranchesSize()[0];
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
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            startPosition[1] = maxY;
                            startPosition[0] -= meshes[h].getMeshBranchesSize()[3];
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
            for (var i = 0; i < branches.length; i++) {
                var elements = branches[i].getBranchElements();
                for (var j = 0; j < elements.length; j++) {
                    var type = branches[i].getType();
                    startX = startPosition[0];
                    startY = startPosition[1];
                    endX = startPosition[0] + (type === 1 ? elements[j].getElementSize() : (type === 3 ? -elements[j].getElementSize() : 0));
                    endY = startPosition[1] + (type === 0 ? -elements[j].getElementSize() : (type === 2 ? elements[j].getElementSize() : 0));
                    elements[j].setCoordinate(startX, startY, endX, endY);
                    startPosition = [endX, endY];
                }
            }
        }
        this.deleteElementsCoordinateOfConnectedMesh(circuit);
    };
    /**
     * A megjeleniteshez a modell altal letrehozott aramkor nem megflelo, mivel ugy kezeli az egyes hurkokat mint kulonallo egysegeket,
     * azaz a kozos agakbol ketto van, de megjeleniteni csak egyet kell.
     * ez a fuggveny vegzi el a megfelelo kozos ag torleset.
     * @param circuit aramkor objektum
     */
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
    /**
     * Megkeresi hogy ket csomopont kozotti agban melyik ellenallasok vannak.
     * @param circuitResDet aramkor ellenallasainak ertekesit es jeloleset tertelmazo tomb (pl. R3 2200)
     */
    CircuitGenerator.prototype.setMultiplyResistorInBranch = function (circuitResDet) {
        var cloneCircResDet = circuitResDet.slice(0);
        cloneCircResDet.sort(function (a, b) { return +b.split(" ")[2] - (+a.split(" ")[2]); });
        var multitemp = [];
        for (var i = 0; i < cloneCircResDet.length; i++) {
            var resistor = cloneCircResDet[i].split(" ");
            if ((resistor[1] !== resistor[2])) {
                multitemp.push(resistor[2]);
            }
        }
        var temp = Array.from(new Set(multitemp));
        for (var h = 0; h < temp.length; h++) {
            var multitmp = [temp[h]];
            for (var i = 0; i < cloneCircResDet.length; i++) {
                var resistor = cloneCircResDet[i].split(" ");
                if (+temp[h] === +resistor[2]) {
                    multitmp.push(resistor[0]);
                }
            }
            this.multiplyResistorInBranch.push(multitmp.join(" "));
        }
    };
    /**
     * Feltolt egy string tombot az aramkor elemeinel elmentettt adatokkal ugy, hogy az teljesen falstad export kompatibilis legyen.
     * Ez a tomb van felhasznalva a halozat sajat megjelenitesenel is.
     * @param circuit aramkor objektum
     * @param type feladat tipusa
     */
    CircuitGenerator.prototype.setCircuitElementCoordinatesArrayToFalstadExport = function (circuit, type) {
        this.circuitCoordinatesToFalstad = [];
        var meshes = circuit.getMeshes();
        var allResistanceCounter = 0;
        var allVoltageSourceCounter = 0;
        var task10inputVoltage;
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
                var isCommon = false;
                if (branches[i].getCommon() !== meshes[h].getMeshNumber()) {
                    isCommon = true;
                }
                for (var j = 0; j < elements.length; j++) {
                    if (elements[j].getCoordinate()[0] !== undefined) {
                        var coordinate = elements[j].getCoordinate();
                        if (elements[j].getId() === 'W') {
                            if (branches[i].getTh2Pole()) {
                                if (type === 6 || type === 5) {
                                    if (isCommon) {
                                        this.circuitCoordinatesToFalstad.push('p ' + coordinate[0] + ' ' + coordinate[1] + ' ' + coordinate[2] + ' ' + coordinate[3] + ' 1 0 com ' + meshes[h].getMeshNumber() + '' + branches[i].getType());
                                    }
                                    else {
                                        this.circuitCoordinatesToFalstad.push('p ' + coordinate[0] + ' ' + coordinate[1] + ' ' + coordinate[2] + ' ' + coordinate[3] + ' 1 0');
                                    }
                                }
                                else {
                                    this.circuitCoordinatesToFalstad.push('p ' + coordinate[0] + ' ' + coordinate[1] + ' ' + coordinate[2] + ' ' + coordinate[3] + ' 1 0');
                                }
                            }
                            else {
                                if (isCommon) {
                                    this.circuitCoordinatesToFalstad.push('w ' + coordinate[0] + ' ' + coordinate[1] + ' ' + coordinate[2] + ' ' + coordinate[3] + ' 0 com ' + meshes[h].getMeshNumber() + '' + branches[i].getType());
                                }
                                else {
                                    this.circuitCoordinatesToFalstad.push('w ' + coordinate[0] + ' ' + coordinate[1] + ' ' + coordinate[2] + ' ' + coordinate[3] + ' 0');
                                }
                            }
                        }
                        if (elements[j].getId() === 'R') {
                            if (type < 10) {
                                allResistanceCounter++;
                                branches[i].setResistanceOfBranch(allResistanceCounter);
                                elements[j].setNumber(allResistanceCounter);
                            }
                            var resistance = elements[j].getResistance();
                            if (type < 10) {
                                if (branches[i].getCommon() !== circuit.getMeshes()[h].getMeshNumber()) {
                                    this.circuitResistorsDetails.push("R" + allResistanceCounter + " " + elements[j].getResistance() + " " + branches[i].getBranchResistance());
                                }
                                else {
                                    this.circuitResistorsDetails.push("R" + allResistanceCounter + " " + elements[j].getResistance() + " " + (meshes[h].getMeshResistance() - commonBranchRes));
                                }
                            }
                            if (isCommon) {
                                this.circuitCoordinatesToFalstad.push('r ' + coordinate[0] + ' ' + coordinate[1] + ' ' + coordinate[2] + ' ' + coordinate[3] + ' 0 ' + resistance + ' ' + elements[j].getNumber() + ' com ' + meshes[h].getMeshNumber() + '' + branches[i].getType());
                            }
                            else {
                                this.circuitCoordinatesToFalstad.push('r ' + coordinate[0] + ' ' + coordinate[1] + ' ' + coordinate[2] + ' ' + coordinate[3] + ' 0 ' + resistance + ' ' + elements[j].getNumber());
                            }
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
                            if (isCommon) {
                                this.circuitCoordinatesToFalstad.push('v ' + coordinate[0] + ' ' + coordinate[1] + ' ' + coordinate[2] + ' ' + coordinate[3] + ' 0 0 40 ' + voltage + ' 0 0 0.5 ' + elements[j].getNumber() + ' com ' + meshes[h].getMeshNumber() + '' + branches[i].getType());
                            }
                            else {
                                this.circuitCoordinatesToFalstad.push('v ' + coordinate[0] + ' ' + coordinate[1] + ' ' + coordinate[2] + ' ' + coordinate[3] + ' 0 0 40 ' + voltage + ' 0 0 0.5 ' + elements[j].getNumber());
                            }
                        }
                        if (elements[j].getId() === 'C') {
                            if (isCommon) {
                                this.circuitCoordinatesToFalstad.push('c ' + coordinate[0] + ' ' + coordinate[1] + ' ' + coordinate[2] + ' ' + coordinate[3] + ' 0 com ' + meshes[h].getMeshNumber() + '' + branches[i].getType());
                            }
                            else {
                                this.circuitCoordinatesToFalstad.push('c ' + coordinate[0] + ' ' + coordinate[1] + ' ' + coordinate[2] + ' ' + coordinate[3] + ' 0');
                            }
                        }
                    }
                }
            }
        }
        circuit.setExpOutVolt(this.randomIntNumber(task10inputVoltage - 1, 1));
        circuit.setNumberOfResistors(allResistanceCounter);
    };
    /**
     * A parameterek fuggvenyeben legeneralja a feladatok vegen elerhetove valo FALSTAD linket.
     * @param circuit aramkor objektum
     * @param type feladat tipusa (opcionalis)
     * @param res vagy a feszmero belso ellenallasa, vagy a generator ellenallasa
     * @param volt csatlakoztatott generator feszultsege
     */
    CircuitGenerator.prototype.generateFalstadLink = function (circuit, type, res, volt) {
        var meshes = circuit.getMeshes();
        var link = 'https://www.falstad.com/circuit/circuitjs.html?cct=$+1+0.000005+10.20027730826997+50+5+43';
        var positiveX = -Infinity, positiveY = -Infinity;
        var negativX = Infinity, negativY = Infinity;
        var offsetX;
        var ohmMeterCoord = [];
        var halfBranch;
        if ((type >= 1 && type < 6) || type === 9 || type === 10) {
            var coordinates = this.circuitCoordinatesToFalstad;
            for (var i = 0; i < coordinates.length; i++) {
                var branchCoordinates = coordinates[i].split(" ");
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
        }
        for (var h = 0; h < circuit.getNumberOfMesh(); h++) {
            var branches = meshes[h].getBranches();
            for (var i_1 = 0; i_1 < branches.length; i_1++) {
                var elements = branches[i_1].getBranchElements();
                var branchType = branches[i_1].getType();
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
                                    if (branches[i_1].getCommon() !== meshes[h].getMeshNumber()) {
                                        link += '%0Av+' + (coordinate[0] + offsetX) + '+' + coordinate[1] + '+' + (coordinate[2] + offsetX) + '+' + coordinate[3] + '+0+0+40+' + (-voltage) + '+0+0+0.5' + (type === 10 ? '+' + elements[j].getNumber() : '');
                                    }
                                    else {
                                        link += '%0Av+' + (coordinate[0] + offsetX) + '+' + coordinate[1] + '+' + (coordinate[2] + offsetX) + '+' + coordinate[3] + '+0+0+40+' + voltage + '+0+0+0.5' + (type === 10 ? '+' + elements[j].getNumber() : '');
                                    }
                                }
                                link += '%0Av+' + coordinate[0] + '+' + coordinate[1] + '+' + coordinate[2] + '+' + coordinate[3] + '+0+0+40+' + voltage + '+0+0+0.5' + (type === 10 ? '+' + elements[j].getNumber() : '');
                            }
                            else {
                                link += '%0Av+' + coordinate[0] + '+' + coordinate[1] + '+' + coordinate[2] + '+' + coordinate[3] + '+0+0+40+' + voltage + '+0+0+0.5';
                            }
                        }
                        if (elements[j].getId() === 'C') {
                            link += '%0Ac+' + coordinate[0] + '+' + coordinate[1] + '+' + coordinate[2] + '+' + coordinate[3] + '+0';
                        }
                        if (elements[j].getId() === 'W') {
                            if (branches[i_1].getTh2Pole()) {
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
                                }
                                else if ((type >= 1 && type < 6) || type === 9 || type === 10) {
                                    ohmMeterCoord.push(coordinate[0], coordinate[1], coordinate[2], coordinate[3]);
                                    link += '%0Ap+' + coordinate[0] + '+' + coordinate[1] + '+' + coordinate[2] + '+' + coordinate[3] + '+1+0';
                                    if (type !== 10) {
                                        link += '%0A216+' + (coordinate[0] + offsetX) + '+' + coordinate[1] + '+' + (coordinate[2] + offsetX) + '+' + coordinate[3] + '+0+0.0001';
                                    }
                                    else {
                                        link += '%0Ap+' + (coordinate[0] + offsetX) + '+' + coordinate[1] + '+' + (coordinate[2] + offsetX) + '+' + coordinate[3] + '+1+0';
                                    }
                                }
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
        link += '%0A';
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
    /**
     * A generalasi folyamatban resztvevo fuggveny, amely akkor hivodik meg, ha a kovetkezo hurok, amit generalni fog a rendszer
     * tobb meglevo hurokkal is kozos aga lesz. Ilyenkor ez a fgv fogja megszamolni mennyi erintett ag fog szerepelni a kapcsolatban
     * @param array elfogadhato kapcsolati agakat tartalmazo tomb
     * @param choiseType csatlakozas tipusa, ahogy a kovetkezo hurok fog csatlakozni a mar legeneralt aramkorhoz
     */
    CircuitGenerator.prototype.counterOfChoiseTypeMultibranch = function (array, choiseType) {
        var count = 0;
        for (var i = 0; i < array.length; i++) {
            if (choiseType === array[i][0]) {
                count++;
            }
        }
        return count;
    };
    /**
     * A generalasi folyamatban resztvevo fuggveny, amely torli a parameterul kapott elfogadhato kapcsolati agakat tartalmazo tomb azon
     * elemeit, amihez mar nem lehet csatlakozni, mivel csatlakozott mar hozza hurok.
     * @param circuit armkor obj.
     * @param array elfogadhato kapcsolati agakat tartalmazo tomb
     * @param meshnumber huroknak a szama
     */
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
    /**
     * Megkeresi azokat a kozos agakhoz tartozo parametereket a parameterul kapott elfogadhato kapcsolati agakat tartalmazo tombben,
     * amikhez lehetseges a egy hurokkal csatlakozni.
     * @param array elfogadhato kapcsolati agakat tartalmazo tomb
     */
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
    /**
     * Kivalogatja azokat az aghoz tartozo parametereket, amihez csak egyszeres kapcsolatot lehet letrehozni.
     * @param array elfogadhato kapcsolati agakat tartalmazo tomb
     */
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
    /**
     * Osztaly getter metodusok a propertykhez.
     */
    CircuitGenerator.prototype.getMultiplyResistorInBranch = function () {
        return this.multiplyResistorInBranch;
    };
    CircuitGenerator.prototype.getCircuitResistorsDetails = function () {
        return this.circuitResistorsDetails;
    };
    CircuitGenerator.prototype.getCircuitCoordinatesToFalstad = function () {
        return this.circuitCoordinatesToFalstad;
    };
    /**
     * Megadott intervallumu egesz szamokbol allo sorbol kivalaszt random 1-et.
     * @param max kivant legnagyobb lehetseges egesz szam
     * @param min kivant legkisebb lehetseges egesz szam
     */
    CircuitGenerator.prototype.randomIntNumber = function (max, min) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    };
    /**
     * Megadott intervallum kozott random kivalaszt egy egy tizedesjegyu szamot.
     * @param max kivant legnagyobb lehetseges szam
     * @param min kivant legkisebb lehetseges szam
     */
    CircuitGenerator.prototype.randomFloatNumber = function (max, min) {
        return +(Math.random() * (max - min) + min).toFixed(1);
    };
    /**
     * Random igaz - hamis
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
     * Feszultseggenerator random ertekenek generalasahoz hasznalatos.
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
     * Aramgenerator random ertekenek generalasahoz hasznalatos.
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
    /**
     * Random noveli, vagy csokkenti egyel az erteket amihez meghivjak
     */
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
    /**
     * Ket megadott szam kozul random kivalaszt egyet
     * @param one
     * @param two
     */
    CircuitGenerator.prototype.randomChoiseTwoNumber = function (one, two) {
        if (this.randomBoolean()) {
            return one;
        }
        else {
            return two;
        }
    };
    /**
     * Ket barmilyen megadott tipus kozul kivalaszt egyet random
     * @param one
     * @param two
     */
    CircuitGenerator.prototype.randomChoiseTwoAnything = function (one, two) {
        if (this.randomBoolean()) {
            return one;
        }
        else {
            return two;
        }
    };
    /**
     * A parameterul kapott tomb elemei kozul random kivalaszt egyet
     * @param array
     */
    CircuitGenerator.prototype.randomChoiseInAnyArray = function (array) {
        var result;
        result = array[Math.floor(Math.random() * array.length)];
        return result;
    };
    /**
     * A parameterul kapott tombbol kitorli a szinten parameterul kapott elemet, ha az benne van.
     * @param element tomb elem
     * @param array tomb
     */
    CircuitGenerator.prototype.removeElementInAnyArray = function (element, array) {
        for (var i = 0; i < array.length; i++) {
            if (JSON.stringify(element) === JSON.stringify(array[i])) {
                array.splice(i, 1);
            }
        }
        return array;
    };
    /**
     * Kivalasztja melyik a nagyobb ertek a parameterek kozul
     * @param num1
     * @param num2
     */
    CircuitGenerator.prototype.wichBiger = function (num1, num2) {
        if (num1 >= num2) {
            return num1;
        }
        else {
            return num2;
        }
    };
    /**
     * Kivalasztja a legkisebb szamot a parameterben megadott szam tombbol
     * @param array
     */
    CircuitGenerator.prototype.choiseMinimumValueInNumberArray = function (array) {
        var result = Infinity;
        for (var i = 0; i < array.length; i++) {
            if (array[i] < result) {
                result = array[i];
            }
        }
        return result;
    };
    /**
     * A parameterben megadott szazalek ertekben fog a fuggveny true-val visszaterni
     * @param percent szazalek
     */
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
