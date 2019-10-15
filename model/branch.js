"use strict";
exports.__esModule = true;
exports.branchCounter = 1;
var Branch = /** @class */ (function () {
    /**
     * Konstruktor, beallitasra kerul az orientacio es az irany
     * @param type 4 tipus. 0: fel, 1: jobbra, 2: le, 3: balra
     * @param meshNumber az ot tartalmazo hurok szama-1 !!!!
     */
    function Branch(type, meshNumber) {
        this.current = 0;
        this.resistanceOfBranch = [];
        /**
         * alapesetben a kozossegi ertek az agat tartalmazo hurok szama.
         * Ha tobb hurokhoz tartozik a hurkok akkor azok szamanak osszege
         * */
        this.common = 0;
        this.branchResistance = 0;
        this.branchVoltage = 0;
        this.branchElements = [];
        this.thevenin2pole = false;
        this.branchSize = 0;
        this.type = type;
        this.meshNumber = (meshNumber + 1);
        this.common = this.meshNumber;
        switch (type) {
            case 0: {
                this.orientation = true;
                this.direction = true;
                break;
            }
            case 1: {
                this.orientation = false;
                this.direction = true;
                break;
            }
            case 2: {
                this.orientation = true;
                this.direction = false;
                break;
            }
            case 3: {
                this.orientation = false;
                this.direction = false;
                break;
            }
        }
        this.branchNumber = exports.branchCounter;
        exports.branchCounter++;
    }
    /**
     * Beallitja az ag allanallaserteket a megadott ertekre.
     * @param resNumber ertekadas
     */
    Branch.prototype.setResistanceOfBranch = function (resNumber) {
        this.resistanceOfBranch.push(resNumber);
    };
    /**
     * Agaram beallitasa az analizis soran meghatarozott aramvektor segitsegevel
     * @param currentVector aramvektor
     */
    Branch.prototype.setCurrent = function (currentVector) {
        var curVect = currentVector.valueOf();
        if (this.current === 0) {
            if (this.common === this.meshNumber) {
                this.current = curVect[this.meshNumber - 1];
            }
            else {
                this.current = curVect[this.meshNumber - 1] - curVect[(this.common - this.meshNumber) - 1];
            }
        }
    };
    /**
     * Az ag altal tarolt halozati elemek hozzaadasa.
     * A kulonbozo tipustol fuggoen beallitja az ag halozatanilizishez szukseges ertekeit (feszultseg, ellenallas).
     * @param element halozati elem
     */
    Branch.prototype.setBranchElements = function (element) {
        this.branchElements.push(element);
        if (element.getId() === 'R') {
            this.branchResistance += element.getResistance();
        }
        if (element.getId() === 'V') {
            if (element.getDirection() === true) {
                this.branchVoltage += (element.getVoltage() * (-1));
            }
            else {
                this.branchVoltage += element.getVoltage();
            }
        }
        if (element.getId() === 'C') {
            if (element.getDirection() === true) {
                this.branchVoltage += element.getVoltage();
            }
            else {
                this.branchVoltage += (element.getVoltage() * (-1));
            }
        }
    };
    /**
     * Beallitja az agat a keresett ket polusnak, amely felol helyettesitjuk a halozatot
     * @param pole true az ertek ha ez az ag lesz az
     */
    Branch.prototype.setTh2Pole = function (pole) {
        this.thevenin2pole = pole;
    };
    /**
     * Beallitja az agnak a kozossegi erteket ugy, hogy a csatlakozo ag hurokszamat hozzaadja a sajatjahoz
     * @param meshNum a csatlakozo hurok szama
     */
    Branch.prototype.setCommon = function (meshNum) {
        this.common += meshNum;
    };
    /**
     * Beallitja a parameterul kapot ertekre az ag hosszat. Megjeleniteskor van ra szukseg.
     * @param size A megjeleniteshez szokseges meret
     */
    Branch.prototype.setBranchSize = function (size) {
        this.branchSize = size;
    };
    /**
     * Torli az ag ellenallas erteket.
     */
    Branch.prototype.clearBranchResistance = function () {
        this.branchResistance = 0;
    };
    /**
     * Az objektum property-einek klonozasat vegzo fuggvenyek.
     */
    Branch.prototype.cloneSetCommon = function (com) {
        this.common = com;
    };
    Branch.prototype.cloneSetCurrent = function (curr) {
        this.current = curr;
    };
    Branch.prototype.cloneSetBranchResistant = function (res) {
        this.branchResistance = res;
    };
    Branch.prototype.cloneSetBranchVoltage = function (volt) {
        this.branchVoltage = volt;
    };
    Branch.prototype.cloneSetThev2Pole = function (pole) {
        this.thevenin2pole = pole;
    };
    Branch.prototype.cloneSetBrancElements = function (element) {
        this.branchElements.push(element);
    };
    Branch.prototype.cloneSetBranchNumber = function (brnumb) {
        this.branchNumber = brnumb;
    };
    Branch.prototype.cloneMeshNumber = function (num) {
        this.meshNumber = num;
    };
    /**
     * A parameterul kapott ag objektum teljas klonjat kesziti el.
     * @param branch klonozando ag objektum
     */
    Branch.prototype.cloneBranch = function (branch) {
        var branchClone = new Branch(branch.getType(), (branch.getMeshNumber() - 1));
        branchClone.cloneMeshNumber(branch.getMeshNumber());
        branchClone.cloneSetBranchNumber(branch.getBranchNumber());
        branchClone.cloneSetCurrent(branch.getCurrent());
        branchClone.cloneSetCommon(branch.getCommon());
        branchClone.cloneSetBranchResistant(branch.getBranchResistance());
        branchClone.cloneSetBranchVoltage(branch.getBranchVoltage());
        branchClone.cloneSetThev2Pole(branch.getTh2Pole());
        for (var i = 0; i < branch.getBranchElements().length; i++) {
            branchClone.cloneSetBrancElements(branch.getBranchElements()[i].cloneElements(branch.getBranchElements()[i]));
        }
        return branchClone;
    };
    /**
     * Osztaly getter metodusok a propertykhez.
     */
    Branch.prototype.getResistanceOfBranch = function () {
        return this.resistanceOfBranch;
    };
    Branch.prototype.getBranchNumber = function () {
        return this.branchNumber;
    };
    Branch.prototype.getOrientation = function () {
        return this.orientation;
    };
    Branch.prototype.getDirection = function () {
        return this.direction;
    };
    Branch.prototype.getCurrent = function () {
        return this.current;
    };
    Branch.prototype.getCommon = function () {
        return this.common;
    };
    Branch.prototype.getBranchElements = function () {
        return this.branchElements;
    };
    Branch.prototype.getBranchResistance = function () {
        return this.branchResistance;
    };
    Branch.prototype.getBranchVoltage = function () {
        return this.branchVoltage;
    };
    Branch.prototype.getMeshNumber = function () {
        return this.meshNumber;
    };
    Branch.prototype.getType = function () {
        return this.type;
    };
    Branch.prototype.getTh2Pole = function () {
        return this.thevenin2pole;
    };
    Branch.prototype.getBrancSize = function () {
        return this.branchSize;
    };
    return Branch;
}());
exports.Branch = Branch;
