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
import { Branch } from "./branch";

export var meshCounter: number = 1;
export function resetMeshCounter(){
    meshCounter = 1;
}

export class Mesh {
    private meshNumber: number;
    private branches: Branch[] = [];
    private meshResistance: number = 0;
    private meshVoltage: number = 0;
    private meshCurrent: number = 0;

    /**
     * 4 elmu tomboket tarol. Ezek a 4 elemu tombok hatarozzak meg a mesh viszonyat a kornyezo mesh-ekkel:
     * [az aktualis mesh branchtipusa, amihez masik branch csatlakozik,
     *  a csatlakozo branch tipusa,
     *  a mesh szama, amihez csatlakozik,
     *  az aktualis mesh szama
     * ]
     */
    private commonBranchesArray: number[][] = []; 
    private meshBranchesSize: number[] = [0,0,0,0]; //a megfelelo tipusu branchekhez tartozo ertekek (0,1,2,3)

    constructor() {
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

    /**
     * A parameterben kapott hurok klonjat kesziti el.
     * @param msh hurok
     */
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