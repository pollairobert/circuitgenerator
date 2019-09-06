import { CircuitElements } from './interfaceCircElement';
import { Wire } from "./wire";
import { Resistance } from "./resistance";
import { CurrentSource } from "./currentsource";
import { VoltageSource } from "./voltagesource";
import { Branch, branchCounter } from "./branch";
import { Mesh, meshCounter } from "./mesh";
import { Circuit } from "./circuit";
import * as math from 'mathjs';
import { CircuitAnalyzer } from './circuitanalyzer';

/**
 * Aramkor generalasat lehetove tevo osztaly. 
 */
export class CircuitGenerator {
    /**
     * Aramkor generalasaert felelos. 
     * @param type aramkor tipusa adott struktura alapjan 
     */
    public generateCircuit(type: number): Circuit{
        let circuit: Circuit;
        //let parameters: number[] = [2,2,0,1,1];
        circuit = this.buildFinalCircuit(new Circuit(this.circuitParameterLimits(type)),type);
        //let ca: CircuitAnalyzer = new CircuitAnalyzer();
        //ca.analyzeCircuit(circuit);
        //this.finalCalculateOfTheveninSubstitutes(this.circuit);
       return circuit;
    }
    /**
     * A parameternek megfeleloen megad egy olyan tombot, ami a halozat generalasahoz
     * szukseges hurkok, elemek, kozos agak darabszamat tartalmazza.
     * parameters = [[hurkok maximalis szama],
     *               [ellenallasok maximalis szama],
     *               [aramgeneratorok maximalis szama],
     *               [feszultseggeneratorok maximalis szama],
     *               [kozos agak maximalis szama]] Egyelore nem hasznalt.
     * @param type ez a parameter reprezentalja a halozat 'nehezsegi' szintjet
     */
    public circuitParameterLimits(type: number): number[]{
        //let parameters = new Array(5);
        let parameters: number[] = [];
        switch (type){
            //Egyszeru feszoszto, csak feszgennel
            case 1: {
                parameters = [this.randomIntNumber(2,2),
                              this.randomIntNumber(3,2),
                              this.randomIntNumber(0,0),
                              this.randomIntNumber(1,1),
                              this.randomIntNumber(2,2)];
                break;
            }
            //Egyszeru 2 hurkos halozat (feszoszto), 1-nel tobb generatorral
            case 1.1: {
                parameters = [this.randomIntNumber(2,2),
                              this.randomIntNumber(2,2),
                              this.randomIntNumber(0,0),
                              this.randomIntNumber(2,2),
                              this.randomIntNumber(2,2)];
                break;
            }
            //Kettos feszoszto egy feszgennel, parhuzamosan egymas utani halozatokkal
            case 2: {
                parameters = [this.randomIntNumber(3,3),
                              this.randomIntNumber(4,4),
                              this.randomIntNumber(0,0),
                              this.randomIntNumber(1,1),
                              this.randomIntNumber(2,2)];
                break;
            }
            //Kettos feszoszto kicsit mas elrendezesben
            case 2.1: {
                parameters = [this.randomIntNumber(3,3),
                              this.randomIntNumber(5,4),
                              this.randomIntNumber(0,0),
                              this.randomIntNumber(1,1),
                              this.randomIntNumber(2,2)];
                break;
            }
            //Kettos feszoszto alapra epulo, 2 feszgent tartalmazo aramkor
            case 3: {
                parameters = [this.randomIntNumber(3,3),
                              this.randomIntNumber(5,3),
                              this.randomIntNumber(0,0),
                              this.randomIntNumber(2,2),
                              this.randomIntNumber(2,2)];
                break;
            }
            //Kettos feszoszto alapra, 3 feszgent tartalmazo aramkor
            case 3.1: {
                parameters = [this.randomIntNumber(3,3),
                              this.randomIntNumber(5,3),
                              this.randomIntNumber(0,0),
                              this.randomIntNumber(3,3),
                              this.randomIntNumber(2,2)];
                break;
            }
            case 5: {
                break;
            }
            case 6: {
                break;
            }
            case 10: {
                parameters = [this.randomIntNumber(4,4),
                              this.randomIntNumber(5,3),
                              this.randomIntNumber(0,0),
                              this.randomIntNumber(3,3),
                              this.randomIntNumber(2,2)];
                break;
            }
        }
        return parameters;
    }
    public buildCircuitSkeleton(circuit: Circuit): void{
        let numberOfMesh: number = circuit.getNumberOfMesh();
        for (let h = 0; h < numberOfMesh; h++) {
            circuit.setMeshes(new Mesh());
            for (let i = 0; i < 4; i++){
                circuit.getMeshes()[h].setBranches(new Branch(i,h));
            }
        }
    }
    public buildFinalCircuit(circuit: Circuit, type: number): Circuit{
        let circParam: Object = circuit.getParameters();
        //let meshPieceArray: number[] = [];

        /**
         * [[sajat branch type, kapcsolodo branch type, sajt meshnumber]]
         */
        let acceptebleCommonBranchArray: number[][] = [];
        //let connectBranches: number[] = [];
        let commonBranchPairs: number[][] = [[0,2], //balrol csatlakozo
                                             [1,3], //fentrol
                                             [2,0], //jobbrol
                                             [3,1]  //lentrol
                                            ];
        let numberOfMeshes = circuit.getNumberOfMesh();
        this.buildCircuitSkeleton(circuit);
        /*for (let h = 0; h < circuit.getNumberOfMesh(); h++) {
            circuit.setMeshes(new Mesh());
            for (let i = 0; i < 4; i++){
                circuit.getMeshes()[h].setBranches(new Branch(i,h));
            }
        }*/
        for (let h = 1; h <= circParam[0]; h++){
            //meshPieceArray.push(h);
        } 
        let randomCommonBranchPair: number[] = [];
        if (type === 1 || type === 1.1){
            randomCommonBranchPair = this.randomChoiseInAnyArray([[1,3],[2,0],[0,2]]);
        } else if (type === 2 || type === 3 || type === 3.1){
            randomCommonBranchPair = this.randomChoiseInAnyArray([[1,3],[2,0],[0,2]]);
        } else if (type === 2.1){
            randomCommonBranchPair = [1,3];
        } else {
            randomCommonBranchPair = this.randomChoiseInAnyArray(commonBranchPairs);
        }
        console.log('randomCommonBranchPair: '+randomCommonBranchPair);
        //console.log('START - meshPieceArray: '+meshPieceArray);
        //console.log(typeof(meshPieceArray));
        for (let h = 1; h <= numberOfMeshes; h++){

            //this.removeElementInAnyArray(h,meshPieceArray);
            //console.log('FOR - meshPieceArray: '+meshPieceArray+ ',for: '+h);
            //console.log(meshPieceArray);
            //let tempBranchPairs: number[] = [];
            let connectBranches: number[] = [];
            let choiseMeshNumber: number;
            
            //let tempPieceArray: number[] = meshPieceArray.slice();
            ///console.log('tempPieceArray: '+tempPieceArray);
            let randomFor: number;
            if (type === 1 || type === 1.1 || type === 2 || type === 2.1 || type ===3 || type >= 3.1 ){
                randomFor = 1;
                if (h < numberOfMeshes){
                    choiseMeshNumber = (h+1); 
                    console.log('choiseMeshNumber: '+choiseMeshNumber);
                    //this.removeElementInAnyArray(choiseMeshNumber,tempPieceArray);
                    if (type === 2.1 && h > 1){
                        randomCommonBranchPair = this.randomChoiseTwoAnything([0,2],[2,0]);
                    }
                    connectBranches.push(randomCommonBranchPair[0],randomCommonBranchPair[1],choiseMeshNumber,h);
                    console.log('connectBranches - for: '+connectBranches);
                    
                    circuit.getMeshes()[h-1].setCommonBranchesArray(connectBranches);
                    this.addConnectedBranchFromCommmonBranchesArrayElement(circuit,h,choiseMeshNumber);
                } 
            } else {
                //randomFor = this.randomIntNumber(tempPieceArray.length,1)
            }
            
            console.log('randomFor: '+randomFor);
            /*for (let i = 0; i < randomFor; i++){
                console.log('For: '+i);
                console.log('circuit.getMeshes()[h-1].getCommonBranchesArray(): '+circuit.getMeshes()[h-1].getCommonBranchesArray());
                for (let j = 0; j < circuit.getMeshes()[h-1].getCommonBranchesArray().length; j++){
                    this.removeElementInAnyArray(circuit.getMeshes()[h-1].getCommonBranchesArray()[j][2],tempPieceArray);
                }
                console.log('tempPieceArray - for: '+tempPieceArray);
                if (type > 3.1){
                    if (h === 1) {
                        choiseMeshNumber = h+1;
                    } else {

                    }
                    if (h === 1){
                        if (this.randomBoolean()){
                            choiseMeshNumber = this.choiseMinimumValueInNumberArray(tempPieceArray);
                            this.removeElementInAnyArray(choiseMeshNumber,tempPieceArray);
                        } else {
                            choiseMeshNumber = undefined;
                        }
                    } else if (this.randomBoolean()){
                        choiseMeshNumber = this.randomChoiseInAnyArray(tempPieceArray);
                    } else {
                        choiseMeshNumber = undefined;
                    }
                }
                if (choiseMeshNumber !== undefined){
                    console.log('choiseMeshNumber: '+choiseMeshNumber);
                    this.removeElementInAnyArray(choiseMeshNumber,tempPieceArray);
                    if (type === 2.1 && h > 1){
                        randomCommonBranchPair = this.randomChoiseTwoAnything([0,2],[2,0]);
                    }
                    connectBranches.push(randomCommonBranchPair[0],randomCommonBranchPair[1],choiseMeshNumber,h);
                    console.log('connectBranches - for: '+connectBranches);
                    
                    circuit.getMeshes()[h-1].setCommonBranchesArray(connectBranches);
                    this.addConnectedBranchFromCommmonBranchesArrayElement(circuit,h,choiseMeshNumber);
                }
                
                connectBranches = [];

            }*/
            /*if (circuit.getMeshes()[h-1].getCommonBranchesArray().length === 0){
                if (h === 1){
                    choiseMeshNumber = this.choiseMinimumValueInNumberArray(tempPieceArray);
                } else {
                    choiseMeshNumber = this.randomChoiseInAnyArray(tempPieceArray);
                }
                connectBranches.push(randomCommonBranchPair[0],randomCommonBranchPair[1],choiseMeshNumber,h);
                circuit.getMeshes()[h-1].setCommonBranchesArray(connectBranches);
                this.addConnectedBranchFromCommmonBranchesArrayElement(circuit,h,choiseMeshNumber);
            }*/

            
            //meshPieceArray.push(h);
            
            //console.log(meshPieceArray);
        }
        //console.log(connectBranches);
        console.log();
        this.setCommonBranchesInCircuit(circuit);
        if (type <= 3.1){
            this.setVoltageSourceInCircuit(circuit, type);
            this.setResistanceInCircuit(circuit, type);
            this.setCommonBranchesCloneElement(circuit);
            this.setThevenin2PoleInCircuit(circuit, type);
        }
        
        //this.setEmptyBranchInOtherSideOfCommonBranch(circuit);
        
        for (let i = 0; i < circuit.getNumberOfMesh(); i++){
            for(let j = 0; j < circuit.getMeshes()[i].getBranches().length; j++){
                let mesh : Mesh =  circuit.getMeshes()[i];
                mesh.setMeshVoltage(mesh.getBranches()[j]);
                mesh.setMeshResistance(mesh.getBranches()[j]);
                if (mesh.getBranches()[j].getBranchElements()[0] === undefined){
                    mesh.getBranches()[j].setBranchElements(new Wire());
                }
            }
        }
        for (let i = 0; i < circuit.getNumberOfMesh(); i++){
            //this.setCommonBranchesInMesh(circuit, circuit.getMeshes()[i].getCommonBranchesArray());
            console.log(circuit.getMeshes()[i].getCommonBranchesArray());
            //console.log(circuit.getMeshes()[i].getBranches());
        }
        return circuit;
    }

        //TESZTHEZ!!!!!!
    public buildFinalCircuit2(circuit: Circuit, type: number): Circuit{
        for (let h = 0; h < circuit.getNumberOfMesh(); h++) {
            circuit.setMeshes(new Mesh());
            
            //A 4 iranynak megfelelo branch-ek letrehozasa a mesh-en belul
            for (let i = 0; i < 4; i++){
                circuit.getMeshes()[h].setBranches(new Branch(i,h));
            }
        }
        /*circuit.getMeshes()[0].getBranches().splice(2,0,new Branch(2,0));
        circuit.getMeshes()[3].getBranches().splice(0,0,new Branch(0,3));
        circuit.getMeshes()[3].getBranches().splice(0,0,new Branch(0,3));
        circuit.getMeshes()[4].getBranches().splice(3,0,new Branch(3,4));
        circuit.getMeshes()[0].setBranches(new Branch(2,0));
        circuit.getMeshes()[3].setBranches(new Branch(0,3));
        circuit.getMeshes()[3].setBranches(new Branch(0,3));
        circuit.getMeshes()[4].setBranches(new Branch(3,4));

        circuit.getMeshes()[0].getBranches()[2].setCommon(3);
        circuit.getMeshes()[0].getBranches()[3].setCommon(2);
        circuit.getMeshes()[0].getBranches()[1].setCommon(5);

        circuit.getMeshes()[1].getBranches()[0].setCommon(1);
        circuit.getMeshes()[1].getBranches()[1].setCommon(3);
        circuit.getMeshes()[1].getBranches()[2].setCommon(4);

        circuit.getMeshes()[2].getBranches()[0].setCommon(1);
        circuit.getMeshes()[2].getBranches()[1].setCommon(5);
        circuit.getMeshes()[2].getBranches()[2].setCommon(4);
        circuit.getMeshes()[2].getBranches()[3].setCommon(2);

        circuit.getMeshes()[3].getBranches()[0].setCommon(2);
        circuit.getMeshes()[3].getBranches()[1].setCommon(3);
        circuit.getMeshes()[3].getBranches()[2].setCommon(5);

        circuit.getMeshes()[4].getBranches()[2].setCommon(4);
        circuit.getMeshes()[4].getBranches()[3].setCommon(3);
        circuit.getMeshes()[4].getBranches()[4].setCommon(1);
        
        circuit.getMeshes()[0].getBranches()[0].setBranchElements(new VoltageSource(5,false));
        circuit.getMeshes()[0].getBranches()[0].setBranchElements(new Resistance(10));
        circuit.getMeshes()[0].getBranches()[1].setBranchElements(new Resistance(20));
        circuit.getMeshes()[0].getBranches()[2].setBranchElements(new VoltageSource(15,true));
        circuit.getMeshes()[0].getBranches()[3].setBranchElements(new Resistance(80));

        circuit.getMeshes()[1].getBranches()[0].setBranchElements(this.copyCommonElement(circuit.getMeshes()[0].getBranches()[3].getBranchElements()[0]));
        circuit.getMeshes()[1].getBranches()[1].setBranchElements(new Resistance(70));
        circuit.getMeshes()[1].getBranches()[2].setBranchElements(new VoltageSource(25,true));

        circuit.getMeshes()[2].getBranches()[0].setBranchElements(this.copyCommonElement(circuit.getMeshes()[0].getBranches()[2].getBranchElements()[0]));
        circuit.getMeshes()[2].getBranches()[1].setBranchElements(new Resistance(50));
        circuit.getMeshes()[2].getBranches()[2].setBranchElements(new Resistance(60));
        circuit.getMeshes()[2].getBranches()[3].setBranchElements(this.copyCommonElement(circuit.getMeshes()[1].getBranches()[1].getBranchElements()[0]));

        circuit.getMeshes()[3].getBranches()[0].setBranchElements(this.copyCommonElement(circuit.getMeshes()[1].getBranches()[2].getBranchElements()[0]));
        circuit.getMeshes()[3].getBranches()[1].setBranchElements(this.copyCommonElement(circuit.getMeshes()[2].getBranches()[2].getBranchElements()[0]));
        circuit.getMeshes()[3].getBranches()[2].setBranchElements(new Resistance(40));
        circuit.getMeshes()[3].getBranches()[4].setTh2Pole(true);

        circuit.getMeshes()[4].getBranches()[1].setBranchElements(new VoltageSource(10,false));
        circuit.getMeshes()[4].getBranches()[1].setBranchElements(new Resistance(30));
        circuit.getMeshes()[4].getBranches()[2].setBranchElements(this.copyCommonElement(circuit.getMeshes()[3].getBranches()[2].getBranchElements()[0]));
        circuit.getMeshes()[4].getBranches()[3].setBranchElements(this.copyCommonElement(circuit.getMeshes()[2].getBranches()[1].getBranchElements()[0]));
        circuit.getMeshes()[4].getBranches()[4].setBranchElements(this.copyCommonElement(circuit.getMeshes()[0].getBranches()[1].getBranchElements()[0]));*/
        circuit.getMeshes()[0].getBranches()[0].setBranchElements(new VoltageSource(120,false));
        circuit.getMeshes()[0].getBranches()[0].setBranchElements(new Resistance(2));
        circuit.getMeshes()[0].getBranches()[1].setBranchElements(new Resistance(3));
        circuit.getMeshes()[1].getBranches()[1].setBranchElements(new VoltageSource(90,true));
        circuit.getMeshes()[1].getBranches()[2].setBranchElements(new Resistance(5));
        circuit.getMeshes()[0].getBranches()[2].setCommon(2);
        circuit.getMeshes()[1].getBranches()[0].setCommon(1);
        circuit.getMeshes()[0].getBranches()[2].setTh2Pole(true);


        for (let i = 0; i < circuit.getMeshes().length; i++){
            for(let j = 0; j < circuit.getMeshes()[i].getBranches().length; j++){
                let mesh : Mesh =  circuit.getMeshes()[i];
                mesh.setMeshVoltage(mesh.getBranches()[j]);
                mesh.setMeshResistance(mesh.getBranches()[j]);
            }
        }
        //console.log(commonMeshesAndBranchTypes);
        return circuit;
    }
    
     /**
     * A kozos agakban szereplo aramkori elemek masolasat vegzi.
     * A generatoroknal forditja az iranyt, mivel a ket szomszedos hurokban maskepp hatnak.
     * @param element egy aramkori elemet var
     */
    public copyCommonElement(element: CircuitElements): CircuitElements{
        let circuitelement: CircuitElements;
        if (element.getId() === 'R') {
            circuitelement = new Resistance(element.getResistance());
        }
        if (element.getId() === 'V') {
            circuitelement = new VoltageSource(element.getVoltage(),!element.getDirection()); 
        }
        if (element.getId() === 'C') {
            circuitelement = new CurrentSource(element.getVoltage(),!element.getDirection());
        }
        return circuitelement;
    }
    /**
     * 
     * @param max 
     * @param min 
     */
    public randomIntNumber(max: number, min: number): number {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
    /**
     * 
     * @param max 
     * @param min 
     */
    public randomFloatNumber(max: number, min: number): number {
        return +(Math.random() * (max - min) + min).toFixed(2);
    }
    /**
     * 
     */
    public randomBoolean(): boolean {
        if ((Math.floor(Math.random() * 2) + 1) === 1) {
            return false;
        } else {
            return true;
        }
    }
    /**
     * 
     */
    public randomVoltageSourceValue(): number {
        return this.randomIntNumber(24, 1);
    }
    /**
     * 
     */
    public randomCurrentSourceValue(): number {
        return this.randomFloatNumber(1.40,0.01);
    }
    /**
     * Az E6-os ellenallas sorhoz tartozo ellenallas ertekek random generalasa,
     * 1K, 10K es 100K ertekekhez
     */
    public randomE6Resistance():number{
        let resistance: number[]=[1000,10000,100000];
        let e6base: number[] = [1,1.5,2.2,3.3,4.7,6.8];
        return e6base[this.randomIntNumber(5,0)]*resistance[this.randomIntNumber(2,0)];
    }
    public randomIncrementOrDecrement():number{
        let number: number;
        if ((Math.floor(Math.random() * 2) + 1) === 1) {
            number = 1;
        } else {
            number = (3-4);
        }
        return number;
    }

    public randomChangeXorYcooordinate():number{
        if ((Math.floor(Math.random() * 2) + 1) === 1) {
            return 1; //Y kordinata
        } else {
            return 0; //X kordinata
        }
    }
    public randomChoiseTwoNumber(one: number, two: number):number{
        if ((Math.floor(Math.random() * 2) + 1) === 1) {
            return one;
        } else {
            return two;
        }
    }
    public randomChoiseTwoAnything(one: any, two: any):any{
        if ((Math.floor(Math.random() * 2) + 1) === 1) {
            return one;
        } else {
            return two;
        }
    }
    
    public randomCoordinateArryElement(array: number[][]): number[]{
        let result: number[];
        result = array[Math.floor(Math.random() * array.length)];
        return result;
    }

    public randomChoiseInAnyArray(array: any): any{
        let result: any;
        result = array[Math.floor(Math.random()*array.length)]
        return result;
    }
    public removeElementInAnyArray(element: any, array: any): any{
        for (let i = 0; i < array.length; i++){
            if (JSON.stringify(element) === JSON.stringify(array[i])){
                array.splice(i,1);
            }
        }
        return array;
    }
    public wichBiger(num1: number, num2: number): number{
        if (num1 >= num2){
            return num1;
        } else {
            return num2;
        }
    }
    public choiseMinimumValueInNumberArray(array: number[]): number{
        let result: number = Infinity;
        for (let i = 0; i < array.length; i++){
            if (array[i] < result){
                result = array[i];
            }
        }
        return result;
    }
    /**
     * Beallitja az aktualis hurokhoz tartozo eppen aktualis commonBranchesArray elemben szereplo masik hurokban is a megfelelo commonBranchesArray elemet.
     * @param circuit aramkor objektum
     * @param baseMesNumb annak a huroknak a szama amiben generaltunk egy commonBranch elemet a tombbe
     * @param connectedMeshNumb a generalt commonBranch elemben szereplo masik hurok szama, amihez csatlakozik a base
     * @param meshPieces opcionalis, meg nem hasznalt.
     */
    public addConnectedBranchFromCommmonBranchesArrayElement(circuit: Circuit, baseMesNumb: number, connectedMeshNumb: number, meshPieces?: number[]): void{
        for (let i = 0; i < circuit.getMeshes()[baseMesNumb-1].getCommonBranchesArray().length; i++){
            if (circuit.getMeshes()[baseMesNumb-1].getCommonBranchesArray()[i][2] === connectedMeshNumb){
                if (circuit.getMeshes()[connectedMeshNumb-1].getCommonBranchesArray().length > 0){
                    let existconnectedMeshNumb: boolean = false;
                    for (let j = 0; j < circuit.getMeshes()[connectedMeshNumb-1].getCommonBranchesArray().length; j++){
                        if (circuit.getMeshes()[connectedMeshNumb-1].getCommonBranchesArray()[j][2] === baseMesNumb){
                            existconnectedMeshNumb = true;
                            break;
                        }
                    }
                    if (!existconnectedMeshNumb){
                        circuit.getMeshes()[connectedMeshNumb-1].setCommonBranchesArray([circuit.getMeshes()[baseMesNumb-1].getCommonBranchesArray()[i][1],circuit.getMeshes()[baseMesNumb-1].getCommonBranchesArray()[i][0],baseMesNumb,connectedMeshNumb]);
                    }
                } else {
                    circuit.getMeshes()[connectedMeshNumb-1].setCommonBranchesArray([circuit.getMeshes()[baseMesNumb-1].getCommonBranchesArray()[i][1],circuit.getMeshes()[baseMesNumb-1].getCommonBranchesArray()[i][0],baseMesNumb,connectedMeshNumb]);
                }
           }
        }
    }
    /**
     * Az adott hurokhoz tartozo kozossegi ertekeket tartalmazo tomb alapjan, hozzaadja a hurokhoz a megfelelo
     * kozossegi ertekkel rendelkezo ag objektumokat az ag tipusanak megfelelo helyre. Tehat, ha 2-es tipusu ag objektum a kozossegi, 
     * akkor az 1-es tipusu ag utan illeszti be. Ha tobb ugyan olyan is van, mindig a legutolso lesz a kisebbik indexen a branch tombben.
     * @param circuit aramkor objektum, amin dolgozik
     * @param commonBranchesArray a hurokhoz tartozo kozossegi ertekek parametereit tartalmazo tomb
     */
    public setCommonBranchesInMesh(circuit: Circuit, commonBranchesArray: number[][]): void {
        for (let h = 0; h < commonBranchesArray.length; h++){
            console.log('h:' +h);
            for (let i = 0; i < circuit.getMeshes()[commonBranchesArray[h][3]-1].getBranches().length; i++){
                console.log('i:' +i);
                if (circuit.getMeshes()[commonBranchesArray[h][3]-1].getBranches()[i].getType() === commonBranchesArray[h][0]){
                    console.log('IF - 99');
                    console.log('Az egyezo tipusu branch: '+circuit.getMeshes()[commonBranchesArray[h][3]-1].getBranches()[i].getType());
                    let tempBranch: Branch = new Branch(commonBranchesArray[h][0],commonBranchesArray[h][3]-1);
                    tempBranch.setCommon(commonBranchesArray[h][2]);
                    circuit.getMeshes()[commonBranchesArray[h][3]-1].getBranches().splice(i,0,tempBranch);
                    break;
                }
            }
            /*Ellentetes oldalon is letre hozza a branch-et, hogy szimetrikus legyen a megjeleniteshaz a mesh
            for (let i = 0; i < circuit.getMeshes()[commonBranchesArray[h][3]-1].getBranches().length; i++){
                console.log('i:' +i);
                if (circuit.getMeshes()[commonBranchesArray[h][3]-1].getBranches()[i].getType() === commonBranchesArray[h][1]){
                    console.log('IF - 991');
                    console.log('Az egyezo tipusu branch: '+circuit.getMeshes()[commonBranchesArray[h][3]-1].getBranches()[i].getType());
                    circuit.getMeshes()[commonBranchesArray[h][3]-1].getBranches().splice(i,0,new Branch(commonBranchesArray[h][1],commonBranchesArray[h][3]-1));
                    break;
                }
            }*/
            /*let tempBranch: Branch = new Branch(commonBranchesArray[h][0],commonBranchesArray[h][3]-1);
            tempBranch.setCommon(commonBranchesArray[h][2]);
            circuit.getMeshes()[commonBranchesArray[h][3]-1].setBranches(tempBranch);*/
        }
        /**
         * A kozos branch tipusanak megfelelo, nem beallitott branch torlese.
         */
        //console.log(commonBranchesArray);
        //console.log(circuit.getMeshes()[commonBranchesArray[0][3]-1]);
        for (let i = 0; i < circuit.getMeshes()[commonBranchesArray[0][3]-1].getBranches().length; i++){
            if (i > 0){
                console.log('IF - 100');
                if (circuit.getMeshes()[commonBranchesArray[0][3]-1].getBranches()[i].getType() === circuit.getMeshes()[commonBranchesArray[0][3]-1].getBranches()[i-1].getType()){
                    console.log('IF - 101');
                    if (i < circuit.getMeshes()[commonBranchesArray[0][3]-1].getBranches().length-1 && (circuit.getMeshes()[commonBranchesArray[0][3]-1].getBranches()[i].getType() !== circuit.getMeshes()[commonBranchesArray[0][3]-1].getBranches()[i+1].getType())){
                        console.log('IF - 102');
                        circuit.getMeshes()[commonBranchesArray[0][3]-1].getBranches().splice(i,1);
                    } else
                    if (i === circuit.getMeshes()[commonBranchesArray[0][3]-1].getBranches().length-1){
                        console.log('IF - 103');
                        circuit.getMeshes()[commonBranchesArray[0][3]-1].getBranches().splice(i,1);
                    }
                }

            }
        }
        
    }
    /**
     * Beallitja a szukseges kozossegi ertekeket az egesz halozatban.
     * @param circuit aramkor objektum
     */
    public setCommonBranchesInCircuit(circuit: Circuit): void{
        for (let i = 0; i < circuit.getNumberOfMesh(); i++){
            this.setCommonBranchesInMesh(circuit,circuit.getMeshes()[i].getCommonBranchesArray());
        }
    }
    /**
     * Ellenallasok elhelyezeseert felelos.
     * @param circuit aramkor objektum
     * @param type feladat tipusanak megfelelo szam
     */
    public setResistanceInCircuit(circuit: Circuit, type: number): void{
        let circuitResistanceNumber: number = circuit.getParameters()[1];
        let tempType:  number = type;
        if (type ===3 || type === 3.1){
            tempType = 3;
        } 
        switch (tempType){
            case 1 : {
                console.log('RES 1');
                if (circuit.getMeshes()[0].getCommonBranchesArray()[0][0] === 1){
                    console.log('RES 1 - 1');
                    if (circuit.getMeshes()[0].getBranches()[0].getBranchElements()[0] !== undefined) {
                        circuit.getMeshes()[0].getBranches()[0].setBranchElements(new Resistance(this.randomE6Resistance()));
                        circuitResistanceNumber--;
                        circuit.getMeshes()[0].getBranches()[1].setBranchElements(new Resistance(this.randomE6Resistance()));
                        circuitResistanceNumber--;
                        console.log('circuitResistanceNumber: '+circuitResistanceNumber);
                        if (circuitResistanceNumber > 0){
                            if (this.randomBoolean()){
                                console.log('RES 1 - 2');
                                circuit.getMeshes()[0].getBranches()[1].setBranchElements(new Resistance(this.randomE6Resistance()));
                                circuitResistanceNumber--;
                            }
                        }
                    } else {
                        circuit.getMeshes()[0].getBranches()[2].setBranchElements(new Resistance(this.randomE6Resistance()));
                        circuitResistanceNumber--;
                        circuit.getMeshes()[0].getBranches()[1].setBranchElements(new Resistance(this.randomE6Resistance()));
                        circuitResistanceNumber--;
                        console.log('circuitResistanceNumber: '+circuitResistanceNumber);
                        if (circuitResistanceNumber > 0){
                            if (this.randomBoolean()){
                                console.log('RES 1 - 2');
                                circuit.getMeshes()[0].getBranches()[1].setBranchElements(new Resistance(this.randomE6Resistance()));
                                circuitResistanceNumber--;
                            }
                        }
                    }
                    
                } else if (circuit.getMeshes()[0].getCommonBranchesArray()[0][0] === 2){
                    console.log('RES 1 - 3');
                    circuit.getMeshes()[0].getBranches()[1].setBranchElements(new Resistance(this.randomE6Resistance()));
                    circuitResistanceNumber--;
                    circuit.getMeshes()[0].getBranches()[2].setBranchElements(new Resistance(this.randomE6Resistance()));
                    circuitResistanceNumber--;
                    console.log('circuitResistanceNumber: '+circuitResistanceNumber);
                    if (circuitResistanceNumber > 0){
                        if (this.randomBoolean()){
                            console.log('RES 1 - 4');
                            circuit.getMeshes()[0].getBranches()[this.randomChoiseTwoNumber(1,2)].setBranchElements(new Resistance(this.randomE6Resistance()));
                            circuitResistanceNumber--;
                            console.log('circuitResistanceNumber: '+circuitResistanceNumber);
                        }
                    }
                } else if (circuit.getMeshes()[0].getCommonBranchesArray()[0][0] === 0){
                    console.log('RES 1 - 4.1');
                    circuit.getMeshes()[0].getBranches()[1].setBranchElements(new Resistance(this.randomE6Resistance()));
                    circuitResistanceNumber--;
                    circuit.getMeshes()[0].getBranches()[0].setBranchElements(new Resistance(this.randomE6Resistance()));
                    circuitResistanceNumber--;
                    console.log('circuitResistanceNumber: '+circuitResistanceNumber);
                    if (circuitResistanceNumber > 0){
                        if (this.randomBoolean()){
                            console.log('RES 1 - 4');
                            circuit.getMeshes()[0].getBranches()[this.randomChoiseTwoNumber(0,1)].setBranchElements(new Resistance(this.randomE6Resistance()));
                            circuitResistanceNumber--;
                            console.log('circuitResistanceNumber: '+circuitResistanceNumber);
                        }
                    }
                }
                /*if (circuitResistanceNumber > 0){
                    console.log('RES 1 - 5');
                    let tempFor: number = circuitResistanceNumber;
                    for (let i = 0; i < tempFor; i++){
                        circuit.getMeshes()[0].getBranches()[this.randomChoiseTwoNumber(1,2)].setBranchElements(new Resistance(this.randomE6Resistance()));
                        circuitResistanceNumber--;
                        console.log('circuitResistanceNumber: '+circuitResistanceNumber);
                    }
                }*/
                
                break;
            }
            case 1.1 : {
                console.log('RES 1');
                if (circuit.getMeshes()[0].getCommonBranchesArray()[0][0] === 1){
                    console.log('RES 1 - 1');
                    if (circuit.getMeshes()[0].getBranches()[0].getBranchElements()[0] !== undefined){
                        circuit.getMeshes()[0].getBranches()[0].setBranchElements(new Resistance(this.randomE6Resistance()));
                        circuitResistanceNumber--;
                        circuit.getMeshes()[0].getBranches()[1].setBranchElements(new Resistance(this.randomE6Resistance()));
                        circuitResistanceNumber--;
                    } else {
                        circuit.getMeshes()[0].getBranches()[1].setBranchElements(new Resistance(this.randomE6Resistance()));
                        circuitResistanceNumber--;
                        circuit.getMeshes()[0].getBranches()[2].setBranchElements(new Resistance(this.randomE6Resistance()));
                        circuitResistanceNumber--;
                    }
                    
                    
                    
                } else if (circuit.getMeshes()[0].getCommonBranchesArray()[0][0] === 0 || circuit.getMeshes()[0].getCommonBranchesArray()[0][0] === 2){
                    console.log('RES 1 - 3');
                    circuit.getMeshes()[0].getBranches()[0].setBranchElements(new Resistance(this.randomE6Resistance()));
                    circuitResistanceNumber--;
                    circuit.getMeshes()[0].getBranches()[2].setBranchElements(new Resistance(this.randomE6Resistance()));
                    circuitResistanceNumber--;
                    console.log('circuitResistanceNumber: '+circuitResistanceNumber);
                    if (circuitResistanceNumber > 0){
                        if (this.randomBoolean()){
                            console.log('RES 1 - 4');
                            circuit.getMeshes()[0].getBranches()[1].setBranchElements(new Resistance(this.randomE6Resistance()));
                            circuitResistanceNumber--;
                            console.log('circuitResistanceNumber: '+circuitResistanceNumber);
                        }
                    }
                } 
                /*if (circuitResistanceNumber > 0){
                    console.log('RES 1 - 5');
                    let tempFor: number = circuitResistanceNumber;
                    for (let i = 0; i < tempFor; i++){
                        circuit.getMeshes()[0].getBranches()[this.randomChoiseTwoNumber(1,2)].setBranchElements(new Resistance(this.randomE6Resistance()));
                        circuitResistanceNumber--;
                        console.log('circuitResistanceNumber: '+circuitResistanceNumber);
                    }
                }*/
                
                break;
            }
            case 2: {
                for (let i = 0; i < circuit.getNumberOfMesh(); i++){
                    if (i < circuit.getNumberOfMesh()-1){
                        for (let j= 0; j < circuit.getMeshes()[i].getBranches().length; j++){
                            if (circuit.getMeshes()[0].getBranches()[0].getBranchElements()[0] !== undefined) {
                                
                            }
                            if (circuit.getMeshes()[i].getCommonBranchesArray()[0][0] === 1 || circuit.getMeshes()[i].getCommonBranchesArray()[0][0] === 3){
                                if (circuit.getMeshes()[0].getBranches()[0].getBranchElements()[0] !== undefined && circuit.getMeshes()[0].getBranches()[0].getBranchElements()[0].getId() === 'V') {
                                    if (circuit.getMeshes()[i].getBranches()[j].getType() === 0 || circuit.getMeshes()[i].getBranches()[j].getType() === 1){
                                        circuit.getMeshes()[i].getBranches()[j].setBranchElements(new Resistance(this.randomE6Resistance()));
                                        circuitResistanceNumber--;
                                    }
                                } else {
                                    if (circuit.getMeshes()[i].getBranches()[j].getType() === 2 || circuit.getMeshes()[i].getBranches()[j].getType() === 1){
                                        circuit.getMeshes()[i].getBranches()[j].setBranchElements(new Resistance(this.randomE6Resistance()));
                                        circuitResistanceNumber--;
                                    }
                                }
                                
                            } else if (circuit.getMeshes()[i].getCommonBranchesArray()[0][0] === 0 || circuit.getMeshes()[i].getCommonBranchesArray()[0][0] === 2){
                                if (circuit.getMeshes()[0].getBranches()[0].getBranchElements()[0] !== undefined && circuit.getMeshes()[0].getBranches()[0].getBranchElements()[0].getId() === 'V') {
                                    if (circuit.getMeshes()[i].getBranches()[j].getType() === 1 || circuit.getMeshes()[i].getBranches()[j].getType() === 2){
                                        circuit.getMeshes()[i].getBranches()[j].setBranchElements(new Resistance(this.randomE6Resistance()));
                                        circuitResistanceNumber--;
                                    }
                                } else {
                                    if (circuit.getMeshes()[i].getBranches()[j].getType() === 0 || circuit.getMeshes()[i].getBranches()[j].getType() === 1){
                                        circuit.getMeshes()[i].getBranches()[j].setBranchElements(new Resistance(this.randomE6Resistance()));
                                        circuitResistanceNumber--;
                                    }
                                }
                            }
                        }
                    }
                }
                //circuit.getMeshes()[0].getBranches()[1].setBranchElements(new Resistance(this.randomE6Resistance()));
                if (circuitResistanceNumber > 0){
                    if (circuit.getMeshes()[0].getBranches()[0].getBranchElements()[0] !== undefined) {
                        circuit.getMeshes()[0].getBranches()[0].setBranchElements(new Resistance(this.randomE6Resistance()));
                        circuitResistanceNumber--;    
                    } else {
                        circuit.getMeshes()[0].getBranches()[2].setBranchElements(new Resistance(this.randomE6Resistance()));
                        circuitResistanceNumber--;    
                    }
                }
                break;
            }
            case 2.1:{
                for (let i = 0; i < circuit.getNumberOfMesh(); i++){
                    if (i < circuit.getNumberOfMesh()-1){
                        for (let j= 0; j < circuit.getMeshes()[i].getBranches().length; j++){
                            if (circuit.getMeshes()[circuit.getNumberOfMesh()-1].getCommonBranchesArray()[0][0] === 0){
                                console.log('UTOLSO 0-val');
                                if ((circuit.getMeshes()[i].getBranches()[j].getType() === 0 || circuit.getMeshes()[i].getBranches()[j].getType() === 1) && i === 0){
                                    circuit.getMeshes()[i].getBranches()[j].setBranchElements(new Resistance(this.randomE6Resistance()));
                                    circuitResistanceNumber--;
                                } else if ((circuit.getMeshes()[i].getBranches()[j].getType() === 0 || circuit.getMeshes()[i].getBranches()[j].getType() === 2) && i > 0) {
                                    circuit.getMeshes()[i].getBranches()[j].setBranchElements(new Resistance(this.randomE6Resistance()));
                                    circuitResistanceNumber--;
                                }
                            } else if (circuit.getMeshes()[circuit.getNumberOfMesh()-1].getCommonBranchesArray()[0][0] === 2){
                                console.log('UTOLSO 2-vel');
                                if ((circuit.getMeshes()[i].getBranches()[j].getType() === 1 || circuit.getMeshes()[i].getBranches()[j].getType() === 2) && i === 0){
                                    console.log(i+' .HUROK, type: 1 v 2');
                                    circuit.getMeshes()[i].getBranches()[j].setBranchElements(new Resistance(this.randomE6Resistance()));
                                    circuitResistanceNumber--;
                                } else if ((circuit.getMeshes()[i].getBranches()[j].getType() === 0 || circuit.getMeshes()[i].getBranches()[j].getType() === 2) && i > 0){
                                    console.log(i+' .HUROK, type: 0v 2');
                                    circuit.getMeshes()[i].getBranches()[j].setBranchElements(new Resistance(this.randomE6Resistance()));
                                    circuitResistanceNumber--;
                                }
                            }
                        }
                    }
                }
                if (circuitResistanceNumber > 0){
                    circuit.getMeshes()[circuit.getNumberOfMesh()-2].getBranches()[1].setBranchElements(new Resistance(this.randomE6Resistance()));
                    circuitResistanceNumber--;    
                }
                break;
            }
            case 3: {
                for (let i = 0; i < circuit.getNumberOfMesh(); i++){
                    if (i < circuit.getNumberOfMesh()-1){
                        for (let j= 0; j < circuit.getMeshes()[i].getBranches().length; j++){
                            if (circuit.getMeshes()[i].getCommonBranchesArray()[0][0] === 1 || circuit.getMeshes()[i].getCommonBranchesArray()[0][0] === 3){
                                if (circuit.getMeshes()[0].getBranches()[0].getBranchElements()[0] !== undefined && circuit.getMeshes()[0].getBranches()[0].getBranchElements()[0].getId() === 'V') {
                                    if (circuit.getMeshes()[i].getBranches()[j].getType() === 0 || circuit.getMeshes()[i].getBranches()[j].getType() === 1){
                                        if (i === 0 && circuit.getMeshes()[i].getBranches()[j].getType() === 0 ){
                                            circuit.getMeshes()[i].getBranches()[j].setBranchElements(new Resistance(this.randomE6Resistance()));
                                            //circuitResistanceNumber--;
                                        } else {
                                            if (circuit.getMeshes()[i].getBranches()[j].getType() === 0){
                                                if (circuitResistanceNumber > 3 && this.randomBoolean()){
                                                    circuit.getMeshes()[i].getBranches()[j].setBranchElements(new Resistance(this.randomE6Resistance()));
                                                    //circuitResistanceNumber--;
                                                }
                                            } else {
                                                circuit.getMeshes()[i].getBranches()[j].setBranchElements(new Resistance(this.randomE6Resistance()));
                                                //circuitResistanceNumber--;
                                            }
                                            
                                        }
                                        //circuit.getMeshes()[i].getBranches()[j].setBranchElements(new Resistance(this.randomE6Resistance()));
                                        //circuitResistanceNumber--;
                                    }
                                } else {
                                    if (circuit.getMeshes()[i].getBranches()[j].getType() === 1){
                                        circuit.getMeshes()[i].getBranches()[j].setBranchElements(new Resistance(this.randomE6Resistance()));
                                        //circuitResistanceNumber--;
                                    } 
                                    if (circuit.getMeshes()[i].getBranches()[j].getType() === 2){
                                        if (i === 0){
                                            circuit.getMeshes()[i].getBranches()[j].setBranchElements(new Resistance(this.randomE6Resistance()));
                                            //circuitResistanceNumber--;
                                        } else {
                                            if (circuitResistanceNumber > 3 && this.randomBoolean()){
                                                circuit.getMeshes()[i].getBranches()[j].setBranchElements(new Resistance(this.randomE6Resistance()));
                                                //circuitResistanceNumber--;
                                            }
                                        }
                                        //circuit.getMeshes()[i].getBranches()[j].setBranchElements(new Resistance(this.randomE6Resistance()));
                                        //circuitResistanceNumber--;
                                    }
                                }
                                
                            } else if (circuit.getMeshes()[i].getCommonBranchesArray()[0][0] === 0 || circuit.getMeshes()[i].getCommonBranchesArray()[0][0] === 2){
                                if (i === 0){
                                    if (circuit.getMeshes()[i].getBranches()[j].getType() === 2 || circuit.getMeshes()[i].getBranches()[j].getType() === 0){
                                        circuit.getMeshes()[i].getBranches()[j].setBranchElements(new Resistance(this.randomE6Resistance()));
                                        //circuitResistanceNumber--;
                                    }
                                    
                                } else if (circuit.getMeshes()[i].getBranches()[j].getType() === 2 && circuit.getMeshes()[i].getCommonBranchesArray()[0][0] === 0){
                                    circuit.getMeshes()[i].getBranches()[j].setBranchElements(new Resistance(this.randomE6Resistance()));
                                    //circuitResistanceNumber--;
                                } else if (circuit.getMeshes()[i].getBranches()[j].getType() === 0 && circuit.getMeshes()[i].getCommonBranchesArray()[0][0] === 2){
                                    circuit.getMeshes()[i].getBranches()[j].setBranchElements(new Resistance(this.randomE6Resistance()));
                                    //circuitResistanceNumber--;
                                } else if (circuit.getMeshes()[i].getBranches()[j].getType() === 1){
                                    if (circuitResistanceNumber > 3 && this.randomBoolean()){
                                        circuit.getMeshes()[i].getBranches()[j].setBranchElements(new Resistance(this.randomE6Resistance()));
                                        //circuitResistanceNumber--;
                                    }
                                }
                            } 
                        }
                    }
                }
                /*circuit.getMeshes()[0].getBranches()[1].setBranchElements(new Resistance(this.randomE6Resistance()));
                if (circuitResistanceNumber > 0){
                    if (circuit.getMeshes()[0].getBranches()[0].getBranchElements()[0] !== undefined) {
                        circuit.getMeshes()[0].getBranches()[0].setBranchElements(new Resistance(this.randomE6Resistance()));
                        circuitResistanceNumber--;    
                    } else {
                        circuit.getMeshes()[0].getBranches()[2].setBranchElements(new Resistance(this.randomE6Resistance()));
                        circuitResistanceNumber--;    
                    }
                }*/
                break;
            }
        }
    }
    /**
     * Megfelelo feltelek figyelembe vetelevel hozzaadja az aramkorhoz a feszultseggenerator(oka)t.
     * @param circuit aramkor objektum
     */
    public setVoltageSourceInCircuit(circuit: Circuit, type: number): void{
        switch (type){
            case 1: {
                if (circuit.getMeshes()[0].getCommonBranchesArray()[0][0] === 1){
                    if (this.randomChoiseTwoNumber(0,2) === 0){
                        circuit.getMeshes()[0].getBranches()[0].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                    } else {
                        circuit.getMeshes()[0].getBranches()[2].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                    }
                } else if (circuit.getMeshes()[0].getCommonBranchesArray()[0][0] === 2){
                    circuit.getMeshes()[0].getBranches()[0].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                } else {
                    circuit.getMeshes()[0].getBranches()[2].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                }
                break;
            }
            case 1.1: {
                //circuit.getMeshes()[0].getBranches()[0].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                if (circuit.getMeshes()[0].getCommonBranchesArray()[0][0] === 1){
                    circuit.getMeshes()[0].getBranches()[this.randomChoiseTwoNumber(0,2)].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                    circuit.getMeshes()[0].getBranches()[1].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                } else if (circuit.getMeshes()[0].getCommonBranchesArray()[0][0] === 0 || circuit.getMeshes()[0].getCommonBranchesArray()[0][0] === 2) {
                    circuit.getMeshes()[0].getBranches()[0].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                    circuit.getMeshes()[0].getBranches()[2].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                } 
                
                //circuit.getMeshes()[0].getBranches()[2].setBranchElements(new Resistance(this.randomE6Resistance()));
                //circuit.getMeshes()[0].getBranches()[1].setBranchElements(new Resistance(this.randomE6Resistance()));
                break;
            }
            case 2: {
                if (circuit.getMeshes()[0].getCommonBranchesArray()[0][0] === 1){
                    if (this.randomChoiseTwoNumber(0,2) === 0){
                        circuit.getMeshes()[0].getBranches()[0].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                    } else {
                        circuit.getMeshes()[0].getBranches()[2].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                    }
                } else if (circuit.getMeshes()[0].getCommonBranchesArray()[0][0] === 2){
                    circuit.getMeshes()[0].getBranches()[0].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                } else if (circuit.getMeshes()[0].getCommonBranchesArray()[0][0] === 0){
                    circuit.getMeshes()[0].getBranches()[2].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                }
                //circuit.getMeshes()[0].getBranches()[0].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                break;
            }
            case 2.1: {
                if (circuit.getMeshes()[circuit.getNumberOfMesh()-1].getCommonBranchesArray()[0][0] === 0){
                    circuit.getMeshes()[0].getBranches()[0].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                } else {
                    circuit.getMeshes()[0].getBranches()[2].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                }
                break;
            }
            case 3: {
                if (circuit.getMeshes()[0].getCommonBranchesArray()[0][0] === 1){
                    circuit.getMeshes()[0].getBranches()[1].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                    if (this.randomChoiseTwoNumber(0,2) === 0){
                        circuit.getMeshes()[0].getBranches()[0].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                    } else {
                        circuit.getMeshes()[0].getBranches()[2].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                    }
                } else if (circuit.getMeshes()[0].getCommonBranchesArray()[0][0] === 2 || circuit.getMeshes()[0].getCommonBranchesArray()[0][0] === 0){
                    circuit.getMeshes()[0].getBranches()[0].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                    circuit.getMeshes()[0].getBranches()[2].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                } 
                //circuit.getMeshes()[0].getBranches()[0].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                break;
            }
            case 3.1: {
                if (circuit.getMeshes()[0].getCommonBranchesArray()[0][0] === 1){
                    circuit.getMeshes()[0].getBranches()[1].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                    circuit.getMeshes()[1].getBranches()[1].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                    if (this.randomChoiseTwoNumber(0,2) === 0){
                        circuit.getMeshes()[0].getBranches()[0].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                    } else {
                        circuit.getMeshes()[0].getBranches()[2].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                    }
                } else if (circuit.getMeshes()[0].getCommonBranchesArray()[0][0] === 2 || circuit.getMeshes()[0].getCommonBranchesArray()[0][0] === 0){
                    circuit.getMeshes()[0].getBranches()[0].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                    circuit.getMeshes()[0].getBranches()[2].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                    if (circuit.getMeshes()[0].getCommonBranchesArray()[0][0] === 2){
                        circuit.getMeshes()[1].getBranches()[2].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                    }else if (circuit.getMeshes()[0].getCommonBranchesArray()[0][0] === 0){
                        circuit.getMeshes()[1].getBranches()[0].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                    }

                } 
                //circuit.getMeshes()[0].getBranches()[0].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                break;
            }
        }
    }
    /**
     * Beallitja a feladdattipusnak megfeleloen, hogy melyik agban legyen a a thevenin 2 polus
     * @param circuit aramkor objektum
     * @param type feladattipus
     */
    public setThevenin2PoleInCircuit(circuit: Circuit, type: number): void{
        if (type < 5){
            for (let i = 0; i < circuit.getMeshes()[circuit.getNumberOfMesh()-1].getBranches().length; i++){
                if (circuit.getMeshes()[circuit.getNumberOfMesh()-1].getBranches()[i].getType() === circuit.getMeshes()[circuit.getNumberOfMesh()-1].getCommonBranchesArray()[0][1]){
                    circuit.getMeshes()[circuit.getNumberOfMesh()-1].getBranches()[i].setTh2Pole(true);
                }
            }
        }
    }
    /**
     * Az aramkor kozos agaiban elhelyezett aramkori elemek clonozasa a megfelelo kozos branch-be.
     * @param circuit aramkor objektum
     */
    public setCommonBranchesCloneElement(circuit: Circuit): void{
        for (let h = 0; h < circuit.getNumberOfMesh(); h++){
            for (let i = 0; i < circuit.getMeshes()[h].getCommonBranchesArray().length; i++){
                let commonSum: number = circuit.getMeshes()[h].getCommonBranchesArray()[i][2] + circuit.getMeshes()[h].getCommonBranchesArray()[i][3];
                for (let j =0; j < circuit.getMeshes()[h].getBranches().length; j++){
                    if (circuit.getMeshes()[h].getBranches()[j].getType() === circuit.getMeshes()[h].getCommonBranchesArray()[i][0]){
                        if (commonSum === circuit.getMeshes()[h].getBranches()[j].getCommon()){
                            if (circuit.getMeshes()[h].getBranches()[j].getBranchElements()[0] !== undefined){
                                for (let k = 0; k < circuit.getMeshes()[circuit.getMeshes()[h].getCommonBranchesArray()[i][2]-1].getBranches().length; k++){
                                    if (circuit.getMeshes()[circuit.getMeshes()[h].getCommonBranchesArray()[i][2]-1].getBranches()[k].getType() === circuit.getMeshes()[h].getCommonBranchesArray()[i][1]){
                                        if (commonSum === circuit.getMeshes()[circuit.getMeshes()[h].getCommonBranchesArray()[i][2]-1].getBranches()[k].getCommon()){
                                            if (circuit.getMeshes()[circuit.getMeshes()[h].getCommonBranchesArray()[i][2]-1].getBranches()[k].getBranchElements()[0] === undefined){
                                                for (let l = 0; l < circuit.getMeshes()[h].getBranches()[j].getBranchElements().length; l++){
                                                    circuit.getMeshes()[circuit.getMeshes()[h].getCommonBranchesArray()[i][2]-1].getBranches()[k].setBranchElements(this.copyCommonElement(circuit.getMeshes()[h].getBranches()[j].getBranchElements()[l]));
                                                }
                                            }
                                        }
                                    }
                                }
                                //if (circuit.getMeshes()[circuit.getMeshes()[h].getCommonBranchesArray()[h][3]].)
                            } else {
                                for (let k = 0; k < circuit.getMeshes()[circuit.getMeshes()[h].getCommonBranchesArray()[i][2]-1].getBranches().length; k++){
                                    if (circuit.getMeshes()[circuit.getMeshes()[h].getCommonBranchesArray()[i][2]-1].getBranches()[k].getType() === circuit.getMeshes()[h].getCommonBranchesArray()[i][1]){
                                        if (commonSum === circuit.getMeshes()[circuit.getMeshes()[h].getCommonBranchesArray()[i][2]-1].getBranches()[k].getCommon()){
                                            if (circuit.getMeshes()[circuit.getMeshes()[h].getCommonBranchesArray()[i][2]-1].getBranches()[k].getBranchElements()[0] !== undefined){
                                                for (let l = 0; l < circuit.getMeshes()[circuit.getMeshes()[h].getCommonBranchesArray()[i][2]-1].getBranches()[j].getBranchElements().length; l++){
                                                    circuit.getMeshes()[h].getBranches()[k].setBranchElements(this.copyCommonElement(circuit.getMeshes()[circuit.getMeshes()[h].getCommonBranchesArray()[i][2]-1].getBranches()[j].getBranchElements()[l]));
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
    }

    /**
     * 
     * @param element   
     * @param array 
     */
    public addElementToAcceptableCommonBranchArray(element: number[], array: number[][]): void{
        if (array.length === 0){
            array.push(element);
        } else {
            for (let i = 0; i < array.length; i++){
                if (element[0] === array[i][0]){
                    array.splice(i, 0, element);
                }
            }
        }
    }
    /**
     * EGYELORE MEG KERDESES A HASZNALATA!!
     * szimetrikus hurkot hoz letre az altal, hogy minden olldalon ugyanannyi branchet hoz letre
     * @param circuit aramkor objektum
     */
    public setEmptyBranchInOtherSideOfCommonBranch(circuit: Circuit): void {

        for (let h = 0; h < circuit.getNumberOfMesh(); h++){
            console.log('IF - FOR h: ');
            let counterOf0Type: number = 0;
            let counterOf1Type: number = 0;
            let counterOf2Type: number = 0;
            let counterOf3Type: number = 0;
            let counterOfType: number[] = [0,0,0,0]
            for (let i = 0; i < circuit.getMeshes()[h].getBranches().length; i++){
                console.log('IF - FOR i -1: ');
                if (circuit.getMeshes()[h].getBranches()[i].getType() === 0){
                    counterOfType[0]++;
                }
                if (circuit.getMeshes()[h].getBranches()[i].getType() === 1){
                    counterOfType[1]++;
                }
                if (circuit.getMeshes()[h].getBranches()[i].getType() === 2){
                    counterOfType[2]++;
                }
                if (circuit.getMeshes()[h].getBranches()[i].getType() === 3){
                    counterOfType[3]++;
                }
            }
            console.log('counterOfType: '+counterOfType);
            for (let i = 0; i < counterOfType.length; i++){
                console.log('IF - FOR 1- 2: ');
                if (counterOfType[i] > 1){
                    if (i === 0){
                        if (counterOfType[2] < counterOfType[i]){
                            let forcount: number = counterOfType[i] - counterOfType[2];
                            for (let j = 0; j < circuit.getMeshes()[h].getBranches().length; j++){
                                console.log('IF - FOR j - 0: ');
                                if (circuit.getMeshes()[h].getBranches()[j].getType() === 2){
                                    for (let k = 0; k < forcount; k++){
                                        console.log('IF - FOR k - 0: ');
                                        circuit.getMeshes()[h].getBranches().splice(j,0,new Branch(2,h));
                                    }
                                    break;
                                }
                            }
                        }
                    }
                    if (i === 1){
                        if (counterOfType[3] < counterOfType[i]){
                            let forcount: number = counterOfType[i] - counterOfType[3];
                            for (let j = 0; j < circuit.getMeshes()[h].getBranches().length; j++){
                                console.log('IF - FOR j - 1: ');
                                if (circuit.getMeshes()[h].getBranches()[j].getType() === 3){
                                    for (let k = 0; k < forcount; k++){
                                        console.log('IF - FOR k - 1: ');
                                        circuit.getMeshes()[h].getBranches().splice(j,0,new Branch(3,h));
                                    }
                                    break;
                                }
                            }
                        }
                    }
                    if (i === 2){
                        if (counterOfType[0] < counterOfType[i]){
                            let forcount: number = counterOfType[i] - counterOfType[0];
                            for (let j = 0; j < circuit.getMeshes()[h].getBranches().length; j++){
                                console.log('IF - FOR j - 2: ');
                                if (circuit.getMeshes()[h].getBranches()[j].getType() === 0){
                                    for (let k = 0; k < forcount; k++){
                                        console.log('IF - FOR k - 2: ');
                                        circuit.getMeshes()[h].getBranches().splice(j,0,new Branch(0,h));
                                    }
                                    break;
                                }
                            }
                        }
                    }
                    if (i === 3){
                        if (counterOfType[1] < counterOfType[i]){
                            let forcount: number = counterOfType[i] - counterOfType[1];
                            for (let j = 0; j < circuit.getMeshes()[h].getBranches().length; j++){
                                console.log('IF - FOR j - 3: ');
                                if (circuit.getMeshes()[h].getBranches()[j].getType() === 1){
                                    for (let k = 0; k < forcount; k++){
                                        console.log('IF - FOR k - 3: ');
                                        circuit.getMeshes()[h].getBranches().splice(j,0,new Branch(1,h));
                                    }
                                    break;
                                }
                            }
                        }
                    }
                }
            }

        }
    }
    
    /**
     * A generalt aramkor a www.falstad.com oldalhoz megfelelo txt formatumba exportalasa a teszteles megkonnyitesere.
     */
    /*public exportCircuitToText(): void {
        let coordinateStep: number = 16;
        let branchSize: number = 12*coordinateStep;
        let elementSize: number;
        this.fs.truncate('proba.txt', 0,  function(err) {
            if (err) {
                return console.error(err);
            }});
        this.fs.appendFile('proba.txt', '$ 1 0.000005 10.20027730826997 50 5 43 \n',  function(err) {
            if (err) {
                return console.error(err);
            }});
        for (let h = 0; h < this.circuit.getNumberOfMesh(); h++){
            for (let i = 0;  i < this.circuit.getMeshes()[h].getBranches().length; i++){
                for (let j = 0; j < this.circuit.getMeshes()[h].getBranches()[i].getBranchElements().length; j++){
                    elementSize = branchSize/this.circuit.getMeshes()[h].getBranches()[i].getBranchElements().length;
                    if (this.circuit.getMeshes()[h].getBranches()[i].getBranchElements()[j].getId() === 'W'){
                        if (h === 0){
                            if (i === 0){

                            }
                        }
                    }
                    if (this.circuit.getMeshes()[h].getBranches()[i].getBranchElements()[j].getId() === 'R'){
                        
                    }
                    if (this.circuit.getMeshes()[h].getBranches()[i].getBranchElements()[j].getId() === 'C'){
                        
                    }
                }
            }
            this.fs.appendFile('proba.txt', 'I am cool!: '+h+ '\n' ,  function(err) {
                if (err) {
                    return console.error(err);
                }});
        }
        
    }*/
    
}
