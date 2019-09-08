import { CircuitElements } from "./interfaceCircElement";
import { Wire } from "./wire";
import { Resistance } from "./resistance";
import { CurrentSource } from "./currentsource";
import { VoltageSource } from "./voltagesource";
import { Branch, branchCounter } from "./branch";

export var meshCounter: number = 1;
export class Mesh {
    private meshNumber: number;
    private branches: Branch[] = [];
    private meshResistance: number = 0;
    private meshVoltage: number = 0;
    private meshCurrent: number = 0;
    private commonBranchesArray: number[][] = [];
    private meshBranchesSize: number[] = [0,0,0,0]; //a megfelelo tipusu branchekhez tartozo ertekek (0,1,2,3)

    constructor(/*maxmesh: number, res: number, cur: number, volt: number, comm: number*/) {
        //this.maxMeshNumb = maxmesh;
        this.meshNumber = meshCounter;
        meshCounter++;
    }
    public clearMeshVoltage(): void{
        this.meshVoltage = 0;
    }
    public setMeshResistance(branch: Branch): void {
        this.meshResistance += branch.getBranchResistance();
    }

    public setMeshVoltage(branch: Branch): void {
        this.meshVoltage += branch.getBranchVoltage();
    }
    public setMeshCurrent(current: number): void {
        this.meshCurrent = current;
    }
    public setBranches(branch: Branch): void {
        this.branches.push(branch);
        //this.meshResistance += branch.getBranchResistance();
        //this.meshVoltage += branch.getBranchVoltage();
    }
    public setCommonBranchesArray(array: number[]): void{
        this.commonBranchesArray.push(array);
    }
    public cloneMeshNumber(mshnumb: number): void {
        this.meshNumber = mshnumb;
    }
    public cloneMeshBranches(branch: Branch): void {
        this.branches.push(branch);
    }
    public cloneMeshResistance(mshres: number): void {
        this.meshResistance = mshres;
    }
    public cloneMeshVoltage(mshvolt: number): void {
        this.meshVoltage = mshvolt;
    }
    public cloneMeshCurrent(mshcur: number): void {
        this.meshCurrent = mshcur;
    }
    public cloneCommonBranchesArray(mshCBA: number[][]): void{
        this.commonBranchesArray = mshCBA;
    }
    public cloneMesh(msh: Mesh): Mesh {
        var meshClone: Mesh = new Mesh();
        meshClone.cloneMeshNumber(msh.getMeshNumber());
        for (var i = 0; i < msh.getBranches().length; i++){
            meshClone.cloneMeshBranches(msh.getBranches()[i].cloneBranch(msh.getBranches()[i]));
        }
        meshClone.cloneMeshResistance(msh.getMeshResistance());
        meshClone.cloneMeshVoltage(msh.getMeshVoltage());
        meshClone.cloneMeshCurrent(msh.getMesCurrent());
        meshClone.cloneCommonBranchesArray(msh.getCommonBranchesArray());
        return meshClone;
    }
    public setMeshBranchesSize(branchType: number, size: number): void {
        this.meshBranchesSize[branchType] = size;
    }
    public setMeshBranchesSizeAll(size0: number,size1: number,size2: number,size3: number): void {
        this.meshBranchesSize = [size0,size1,size2,size3];
    }
    public getMeshBranchesSize(): number[]{
        return this.meshBranchesSize;
    }
    public getMeshNumber(): number {
        return this.meshNumber;
    }

    public getBranches(): Branch[] {
        return this.branches;
    }

    public getMesCurrent(): number {
        return this.meshCurrent;
    }
    
    public getMeshResistance(): number {
        return this.meshResistance;
    }

    public getMeshVoltage(): number {
        return this.meshVoltage;
    }
    public getCommonBranchesArray(): number[][]{
        return this.commonBranchesArray;
    }
}