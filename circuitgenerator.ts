import { CircuitElements } from "./interfaceCircElement";
import { Wire } from "./wire";
import { Resistance } from "./resistance";
import { CurrentSource } from "./currentsource";
import { VoltageSource } from "./voltagesource";
import { Branch, branchCounter } from "./branch";
import { Mesh, meshCounter } from "./mesh";
import { Circuit } from "./circuit";

export class CircuitGenerator {
    private circuit: Circuit;


    public generateAndAnalyzeCircuit(mesh: number, res: number, cur: number, volt: number, comm: number): void {

        switch (mesh) {
            case 1: {
                if (cur > 1) {
                    console.log("Egy hurok eseten 1-nel tobb aramgenerator nem lehet, mert sorosan nem kothetoek ossze.");
                    break;
                }
                if (res === 0 && volt > 0) {
                    console.log("Egy hurok eseten a feszultseggeneratorokra terhelest kell kotni sorosan (ellenallas).");
                    break;
                }
                if (cur === 0 && volt === 0) {
                    console.log("Egy hurok eseten kellene azert valamilyen generator.");
                    break;
                }
                if (comm > 0) {
                    console.log("Egy hurok eseten nincs kozos ag.");
                    break;
                }
                if (cur > 0 && volt > 0) {
                    console.log("Egy hurkban ne kossunk sorba aramgeneratort es feszultseggeneratort.");
                    break;
                }
                this.circuit = new Circuit(mesh, res, cur, volt, comm);

                for (var h = 0; h < mesh; h++) {
                    var count: number = 0;
                    this.circuit.setMeshes(new Mesh());
                    for (var i = 0; i < 2; i++) {
                        for (var j = 0; j < 2; j++) {
                            //if (this.meshNumber == 0 && this.maxMeshNumb == 2) {
                            if (i == 0 && j == 0) {
                                this.circuit.getMeshes()[h].setBranches(new Branch(false, false, h));
                                //for (var k = 0; k < this.circuit.getMeshes()[h].getBranches().length; k++) {
                                this.circuit.getMeshes()[h].getBranches()[0].setBranchElements(new Wire(), this.circuit.getMeshes()[h]);
                                //}
                            }
                            if (i == 0 && j == 1) {
                                this.circuit.getMeshes()[h].setBranches(new Branch(false, true, h));
                                for (var k = 0; k < res; k++) {
                                    this.circuit.getMeshes()[h].getBranches()[1].setBranchElements(new Resistance(Math.floor(Math.random() * 20.0) + 0.5), this.circuit.getMeshes()[h]);
                                }
                            }
                            if (i == 1 && j == 0) {
                                this.circuit.getMeshes()[h].setBranches(new Branch(true, false, h));
                                //this.branches[count].setCommon(this.meshNumber+1);
                                this.circuit.getMeshes()[h].getBranches()[2].setBranchElements(new Wire(), this.circuit.getMeshes()[h]);
                            }
                            if (i == 1 && j == 1) {
                                this.circuit.getMeshes()[h].setBranches(new Branch(true, true, h));
                                for (var k = 0; k < volt; k++) {
                                    this.circuit.getMeshes()[h].getBranches()[3].setBranchElements(new VoltageSource(Math.floor(Math.random() * 50) + 5, this.randomBoolean()), this.circuit.getMeshes()[h]);
                                }
                            }
                            count++;
                        }
                    }
                }
                this.circuit.getMeshes()[this.circuit.getMeshes().length-1].setMeshCurrent(this.meshCurrentSolver(this.circuit));
                this.circuit.setThevVolt(this.circuit.getMeshes()[this.circuit.getMeshes().length-1].getMeshVoltage());
                this.circuit.setThevRes(this.circuit.getMeshes()[this.circuit.getMeshes().length-1].getMeshResistance());
                break;
            }
            default: {
                this.circuit = new Circuit(mesh, res, cur, volt, comm);
                for (var h = 0; h < mesh; h++){
                    this.circuit.setMeshes(new Mesh());
                }
                break;
            } 
        }
       

    }
    public getCircuit(): Circuit {
        return this.circuit;
    }
    public randomBoolean(): boolean {
        if ((Math.floor(Math.random() * 2) + 1) === 1) {
            return false;
        } else {
            return true;
        }
    }
    public meshCurrentSolver(circuit: Circuit): number {
        var meshCurrent: number;
        if (circuit.getNumberOfMesh() === 1){
            meshCurrent = (circuit.getMeshes()[circuit.getNumberOfMesh()-1].getMeshVoltage())/(circuit.getMeshes()[circuit.getNumberOfMesh()-1].getMeshResistance())
        }
        if (meshCurrent < 0) {
            meshCurrent *=-1
        }
        return meshCurrent;
    }


}
