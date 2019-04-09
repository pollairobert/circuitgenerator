import {CircuitElements} from "./interfaceCircElement";
import {Wire} from "./wire";
import {Resistance} from "./resistance";
import {CurrentSource} from "./currentsource";
import {VoltageSource} from "./voltagesource";
import {Branch, branchCounter} from "./branch";
import {Mesh, meshCounter} from "./mesh";
import { Circuit } from "./circuit";

export class CircuitGenerator {
    private circuit: Circuit;

    public generateCircuit(mesh: number, res: number, cur: number, volt: number, comm: number): void{
       this.circuit = new Circuit(mesh, res,cur,volt,comm);
       console.log('Hurkok szama a halozatban:'+ this.circuit.getMeshes()[0].getMaxMesh());
       for (var i=0; i < this.circuit.getMeshes().length; i++){
           console.log('Hurok szama: '+this.circuit.getMeshes()[i].getMeshNumber());
           console.log('Ag szam, orientacio, dir, elem, common');
           for (var j=0; j<this.circuit.getMeshes()[i].getBranches().length; j++){
                console.log('-' + this.circuit.getMeshes()[i].getBranches()[j].getBranchNumber()+
                           ', '+ this.circuit.getMeshes()[i].getBranches()[j].getOrientation()+
                           ', '+ this.circuit.getMeshes()[i].getBranches()[j].getDirection()+
                           ', '+ this.circuit.getMeshes()[i].getBranches()[j].getCommon());
                console.log('   Elemek:');
                for (var k=0; k<this.circuit.getMeshes()[i].getBranches()[j].getBranchElements().length; k++){
                    console.log('   -'+ this.circuit.getMeshes()[i].getBranches()[j].getBranchElements()[k].getId());
                }
           }
           
           //console.log(i);
       }
    }
}
