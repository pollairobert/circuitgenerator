﻿/* 
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

import { resetMeshCounter } from "./mesh";
import { Circuit } from './circuit';
import { CircuitGenerator } from './circuitgenerator';
import { CircuitAnalyzer } from './circuitanalyzer';

/**
 * Szerver oldalon a logika belepesi pontja.
 */
export class Main {
    private circuitCoordinateArray: string[];
    private falstadLink: string;
    private voltegePrefix: string;
    private currentPrefix: string;
    private ohmPrefix: string;
    private measurementVoltPrefix: string;
    private taskResults;
    
    /**
     * Ezzel a metodussal indul a halozat generalasa es megoldasa a feladattipusnak megfeleloen.
     * Majd itt kap erteket a szervertol kuldott valasz objektum is a halozatanalizis ertekeive,
     * hogy kliens oldalon elvegezheto legyen a felhasznalo altal beirt ertekek helyessegellenorzese.
     * A kliens-szerver kozotti keres-valasz kommunikacio csokkentese miatt dontottem a mellet, 
     * hogy a kliens oldalon tortenjen az ellenorzes. Igaz, hogy a valasz nincs encryptelve (meg),
     * de a cel a felhasznalonak is a gyakorlas, attol, hogy a bongeszo megfelelo funkcioival meg tudja
     * nezni a valasz objektum tartalmat konzolra iratas nelkul is.
     *
     * Lehetosege van a felhasznalonak bizonyos feladatoknal megadni a hurokszamot, akkor a fuggveny ezt a parametert is megkapja,
     * majd ennek megfeleloen hivja meg az aramkort letrehozo fuggvenyt.
     * @param type feladat tipusa
     * @param pieceOfMesh felhasznalo altal megadott hurokszam (opcionalis)
     */
    public start(type: number, pieceOfMesh? : number){
        let cg: CircuitGenerator = new CircuitGenerator();
        let can: CircuitAnalyzer = new CircuitAnalyzer();
        let circuit: Circuit;
        let typeArray: number[] = [2, 3, 3.1, 4, 5];
        let temptype = type;
        let measurementError: number[] = [];
        if (type === 2){
            temptype = cg.randomChoiseTwoNumber(2,2.1);
        }
        if (type === 6){
            temptype = 6;
            can.setQuestionOrVoltmeterResistance(cg.randomE6Resistance());
        }
        if (type === 7){
            temptype = cg.randomChoiseTwoNumber(4,5);
            can.setQuestionOrVoltmeterResistance(10000000);
        }
        if (type === 8){
            if (pieceOfMesh !== undefined){
                temptype = cg.randomChoiseTwoNumber(4,5);
            } else {
                temptype = cg.randomChoiseInAnyArray(typeArray);
            }
            can.setConnectedVoltagesourceValue(cg.randomVoltageSourceValue());
            can.setConnectedVoltagesourceResistance(cg.randomE6Resistance());
        }
        if (pieceOfMesh !== undefined){
            circuit = cg.generateCircuit(temptype, pieceOfMesh);
        } else {
            circuit = cg.generateCircuit(temptype);
        }
         
        if (type === 10){
            let paralellRes: number;
            let inputVoltage: number;
            let found: boolean[] = [false,false];
            for (let i = 0; i < circuit.getMeshes()[0].getBranches().length; i++){
                for (let j = 0; j < circuit.getMeshes()[0].getBranches()[i].getBranchElements().length; j++){
                    if (!found[0]){
                        if (circuit.getMeshes()[0].getBranches()[i].getBranchElements()[j].getId() === "V"){
                            found[0] = true;
                            inputVoltage = circuit.getMeshes()[0].getBranches()[i].getBranchElements()[j].getVoltage();
                        }
                    }
                    if (!found[1]){
                        if (circuit.getMeshes()[0].getBranches()[i].getBranchElements()[j].getId() === "R"){
                            found[1] = true;
                            paralellRes = circuit.getMeshes()[0].getBranches()[i].getBranchElements()[j].getResistance();
                        }
                    }
                }
            }
            let r3resistance: number = this.calculateTask10R3resistanceValue(paralellRes,inputVoltage,circuit.getExpOutVolt())
            for (let i = 0; i < circuit.getMeshes()[1].getBranches().length; i++){
                if (circuit.getMeshes()[1].getBranches()[i].getType() !== circuit.getMeshes()[1].getCommonBranchesArray()[0][0]){
                    for (let j = 0; j < circuit.getMeshes()[1].getBranches()[i].getBranchElements().length; j++){
                        if (circuit.getMeshes()[1].getBranches()[i].getBranchElements()[j].getId() === "R"){
                            circuit.getMeshes()[1].getBranches()[i].getBranchElements()[j].setResistance(r3resistance);
                        }
                    }
                }
            }
            cg.getCircuitResistorsDetails().push("R3 "+r3resistance);
        }
        can.analyzeCircuit(circuit);
        cg.setMultiplyResistorInBranch(cg.getCircuitResistorsDetails());
        this.circuitCoordinateArray = cg.getCircuitCoordinatesToFalstad();
         
        this.falstadLink = cg.generateFalstadLink(circuit, type, ((type === 6 || type ===7) ? can.getQuestionRes() : can.getConnectedVoltagesourceResistance()),can.getConnectedVoltagesourceValue());
        if (type === 7){
            measurementError = this.calculateMeasurementError(can.getQuestionResVoltage(),can.getResultOfTheveninVoltage());
        }
        let randomID = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        this.taskResults = {
            falstadTXT: this.getCircuitCoordinateArray(),
            link: this.getFalstadLink(),
            id: randomID,
            thVolt: can.getResultOfTheveninVoltage(),
            thRes:can.getResultOfTheveninResistance(),
            resCurrent: can.getQuestionResCurrent(),
            resVolt: can.getQuestionResVoltage(),
            absError: measurementError[0],
            relError: measurementError[1],
            terminalVolt: can.getOutputVoltageWithConnectedVoltageSource(),
            resValue: can.getQuestionRes(),
            connVSRes: can.getConnectedVoltagesourceResistance(),
            connVSVolt: can.getConnectedVoltagesourceValue(),
            resistorDetails: undefined,
            multiResInBranch: undefined,
            expectedOutVoltage: undefined,
            tasktime: undefined, 
            timestamp: new Date()
        }
        if (type >=4 && type < 9){
            this.taskResults["tasktime"] = this.calculateTaskTime(circuit);
        }
        if (type === 10){
            this.taskResults["expectedOutVoltage"] = circuit.getExpOutVolt();
        }
        if (type === 9 || type === 10){
            this.taskResults["resistorDetails"] = cg.getCircuitResistorsDetails();
            this.taskResults["multiResInBranch"] = cg.getMultiplyResistorInBranch();
        }
        resetMeshCounter();
    }
    /**
     * Csak es kizarolag az Aramkor keresese II. tipusu feladathoz tartozo R3 ellenallas erteket adja meg
     * a parameterek megfelelo szamolasaval. 
     * @param paralellResistorsValue parhozamosan kotott R1 es R2 ellenallasok erteke
     * @param inputVoltage a maximalis feszultseg, amit a bemenet hataroz meg.
     * @param expextedOutputVoltage elvart kimeneti feszultseg legnagyobb erteke. 
     */
    public calculateTask10R3resistanceValue(paralellResistorsValue: number, inputVoltage: number, expextedOutputVoltage: number, ): number {
        let resultingResistance: number = ((paralellResistorsValue*paralellResistorsValue)/(paralellResistorsValue+paralellResistorsValue));
        let r3resistance: number = ((resultingResistance*expextedOutputVoltage)/(inputVoltage-expextedOutputVoltage));
        return r3resistance;
    }

    /**
     * Kiszamolja es egy tombben eltarolja az abszolut es relativ hiba nagysagat a megfelelo feladattipusnal.
     * @param measuredVoltage mert ertek
     * @param realVoltage a halozat kimeneti erteke
     */
    public calculateMeasurementError(measuredVoltage: number, realVoltage: number): number[]{
        let measurementErr: number[] = [];
        let absolutError: number = Math.abs(measuredVoltage) - Math.abs(realVoltage);
        let relativeError: number = (Math.abs(absolutError)/Math.abs(measuredVoltage))*100;
        measurementErr.push(Math.abs(absolutError),relativeError);
        return measurementErr;
    }

    /**
     * A parameterul kapott aramkor hurokszamanak megfeleloen beallit egy standard idokrlatot a feladat megoldasahoz.
     * @param circuit aramkor objektum
     */
    public calculateTaskTime(circuit: Circuit): number{
        let time: number = 10 + ((circuit.getNumberOfMesh() - 3)*10);
        return time;
    }

    /**
     * Az osztaly propertykhez tartozo getter metodusok.
     */
    public getTaskResults(): Object{
        return this.taskResults;
    }
    public getVoltagePrefix(): string{
        return this.voltegePrefix;
    }
    public getCurrentPrefix(): string{
        return this.currentPrefix;
    }
    public getOhmPrefix(): string{
        return this.ohmPrefix;
    }
    public getMeasurementVoltPrefix(): string{
        return this.measurementVoltPrefix;
    }
    public getCircuitCoordinateArray(): string[]{
        return this.circuitCoordinateArray;
    }
    public getFalstadLink(): string{
        return this.falstadLink;
    }
}