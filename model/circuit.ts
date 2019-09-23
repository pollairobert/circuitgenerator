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
import { CircuitElements } from "./interfaceCircElement";
import { Wire } from "./wire";
import { Resistance } from "./resistance";
import { CurrentSource } from "./currentsource";
import { VoltageSource } from "./voltagesource";
import { Branch, branchCounter } from "./branch";
import { Mesh } from "./mesh";

export class Circuit {
    private meshes: Mesh[] = [];
    private numberOfMesh: number;
    private theveninResistance: number = 0;
    private theveninVoltage: number = 0;
    private numbOfResistance: number;
    private numbOfCurrentSource: number;
    private numbOfVoltageSource: number;
    private circuitParameters: number[];
    
    /**
     * Aramkor konstruktora, amely beallitja a szukseges ertkeit a prameterek alapjan
     * @param meshnumb az aramkorben letrehozott hurkok szama (technikai okok miatt a kivezetest is horokkent tarolja)
     * @param res aramkori ellanalasok darabszama
     * @param cur aramgeneratorok szama
     * @param volt feszultseggeneratorok szama
     * @param comm hurkok kozos againak szama (ez meg kerdeses, hogy marad-e)
     *
    constructor(meshnumb: number, res: number, cur: number, volt: number, comm: number) {
        this.numberOfMesh = meshnumb;
        this.numbOfResistance = res;
        this.numbOfCurrentSource = cur;
        this.numbOfVoltageSource = volt;
        this.numbOfCommonBranch = comm;
    }*/
    constructor(parameters: number[]){
        this.numberOfMesh = parameters[0];
        this.numbOfResistance = parameters[1];
        this.numbOfCurrentSource = parameters[2];
        this.numbOfVoltageSource = parameters[3];
        this.circuitParameters = parameters;
    }
    public setMeshes(mesh: Mesh): void {
        this.meshes.push(mesh);
    }
    public setThevRes(res: number): void {
        this.theveninResistance = res;
    }
    public setThevVolt(volt: number): void {
        this.theveninVoltage = volt;
    }
    private cloneCircuitMeshes(msh: Mesh): void {
        this.meshes.push(msh);
    }
    private cloneNumbOfMesh(num: number): void {
        this.numberOfMesh = num;
    }
    private cloneTheveninResistance(res: number): void {
        this.theveninResistance = res;
    }
    private cloneTheveninVoltage(volt: number): void {
        this.theveninVoltage = volt;
    } 
    private cloneNumbOfRes(num: number): void {
        this.numbOfResistance = num;
    }
    private cloneNumbOfCurrentSource(num: number): void {
        this.numbOfCurrentSource = num;
    }
    private cloneNumbOfVoltageSource(num: number): void {
        this.numbOfVoltageSource = num;
    }
    public cloneCircuit(circ: Circuit): Circuit {
        //var circuitClone: Circuit = new Circuit(circ.getNumberOfMesh(),circ.getNumbOfRes(),circ.getNumbOfCurrSource(),circ.getNumbOfVoltSource(),circ.getNumbOfCommonBranc());
        var circuitClone: Circuit = new Circuit(this.circuitParameters);
        for(var i = 0; i < circ.getMeshes().length; i++){
            circuitClone.cloneCircuitMeshes(circ.getMeshes()[i].cloneMesh(circ.getMeshes()[i]));
        }
        circuitClone.cloneNumbOfMesh(circ.getNumberOfMesh());
        circuitClone.cloneTheveninResistance(circ.getThevRes());
        circuitClone.cloneTheveninVoltage(circ.getThevVolt());
        circuitClone.cloneNumbOfRes(circ.getNumbOfRes());
        circuitClone.cloneNumbOfCurrentSource(circ.getNumbOfCurrSource());
        circuitClone.cloneNumbOfVoltageSource(circ.getNumbOfVoltSource());
        return circuitClone;
    }
    public setNumberOfMesh(number: number): void {
        this.numberOfMesh = number;
    }
    public getThevRes(): number {
        return this.theveninResistance;
    }
    public getThevVolt(): number {
        return this.theveninVoltage;
    }
    public getMeshes(): Mesh[] {
        return this.meshes;
    }
    public getNumberOfMesh(): number {
        return this.numberOfMesh;
    }
    public getNumbOfRes(): number{
        return this.numbOfResistance;
    }
    public getNumbOfVoltSource(): number{
        return this.numbOfVoltageSource;
    }
    public getNumbOfCurrSource(): number{
        return this.numbOfCurrentSource;
    }
    public getParameters(): Object{
        return this.circuitParameters;
    }
    
}