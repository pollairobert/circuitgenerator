"use strict";
exports.__esModule = true;
exports.meshCounter = 1;
function resetMeshCounter() {
    exports.meshCounter = 1;
}
exports.resetMeshCounter = resetMeshCounter;
var Mesh = /** @class */ (function () {
    function Mesh( /*maxmesh: number, res: number, cur: number, volt: number, comm: number*/) {
        this.branches = [];
        this.meshResistance = 0;
        this.meshVoltage = 0;
        this.meshCurrent = 0;
        /**
         * 4 elmu tomboket tarol. Ezek a 4 elemu tombok hatarozzak meg a mesh viszonyat a kornyezo mesh-ekkel:
         * [az aktualis mesh branchtipusa, amihez masik branch csatlakozik,
         *  a csatlakozo branch tipusa,
         *  a mesh szama, amihez csatlakozik,
         *  az aktualis mesh szama
         * ]
         */
        this.commonBranchesArray = [];
        this.meshBranchesSize = [0, 0, 0, 0]; //a megfelelo tipusu branchekhez tartozo ertekek (0,1,2,3)
        //this.maxMeshNumb = maxmesh;
        this.meshNumber = exports.meshCounter;
        exports.meshCounter++;
    }
    Mesh.prototype.clearMeshVoltage = function () {
        this.meshVoltage = 0;
    };
    Mesh.prototype.setMeshResistance = function (branch) {
        this.meshResistance += branch.getBranchResistance();
    };
    Mesh.prototype.setMeshVoltage = function (branch) {
        this.meshVoltage += branch.getBranchVoltage();
    };
    Mesh.prototype.setMeshCurrent = function (current) {
        this.meshCurrent = current;
    };
    Mesh.prototype.setBranches = function (branch) {
        this.branches.push(branch);
        //this.meshResistance += branch.getBranchResistance();
        //this.meshVoltage += branch.getBranchVoltage();
    };
    Mesh.prototype.setCommonBranchesArray = function (array) {
        this.commonBranchesArray.push(array);
    };
    Mesh.prototype.cloneMeshNumber = function (mshnumb) {
        this.meshNumber = mshnumb;
    };
    Mesh.prototype.cloneMeshBranches = function (branch) {
        this.branches.push(branch);
    };
    Mesh.prototype.cloneMeshResistance = function (mshres) {
        this.meshResistance = mshres;
    };
    Mesh.prototype.cloneMeshVoltage = function (mshvolt) {
        this.meshVoltage = mshvolt;
    };
    Mesh.prototype.cloneMeshCurrent = function (mshcur) {
        this.meshCurrent = mshcur;
    };
    Mesh.prototype.cloneCommonBranchesArray = function (mshCBA) {
        this.commonBranchesArray = mshCBA;
    };
    Mesh.prototype.cloneMesh = function (msh) {
        var meshClone = new Mesh();
        meshClone.cloneMeshNumber(msh.getMeshNumber());
        for (var i = 0; i < msh.getBranches().length; i++) {
            meshClone.cloneMeshBranches(msh.getBranches()[i].cloneBranch(msh.getBranches()[i]));
        }
        meshClone.cloneMeshResistance(msh.getMeshResistance());
        meshClone.cloneMeshVoltage(msh.getMeshVoltage());
        meshClone.cloneMeshCurrent(msh.getMesCurrent());
        meshClone.cloneCommonBranchesArray(msh.getCommonBranchesArray());
        return meshClone;
    };
    Mesh.prototype.setMeshBranchesSize = function (branchType, size) {
        this.meshBranchesSize[branchType] = size;
    };
    Mesh.prototype.setMeshBranchesSizeAll = function (size0, size1, size2, size3) {
        this.meshBranchesSize = [size0, size1, size2, size3];
    };
    Mesh.prototype.getMeshBranchesSize = function () {
        return this.meshBranchesSize;
    };
    Mesh.prototype.getMeshNumber = function () {
        return this.meshNumber;
    };
    Mesh.prototype.getBranches = function () {
        return this.branches;
    };
    Mesh.prototype.getMesCurrent = function () {
        return this.meshCurrent;
    };
    Mesh.prototype.getMeshResistance = function () {
        return this.meshResistance;
    };
    Mesh.prototype.getMeshVoltage = function () {
        return this.meshVoltage;
    };
    Mesh.prototype.getCommonBranchesArray = function () {
        return this.commonBranchesArray;
    };
    return Mesh;
}());
exports.Mesh = Mesh;
