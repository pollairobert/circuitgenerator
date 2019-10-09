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

/**
 * A server oldali fuggvenyeket osszegyujto osztaly.
 */
export class Serverfunction{
    private fs = require('fs');
    private checkTimeToSolvedTask: number = 50*60*1000; //ennyi ideig hagyja meg a generateLOG fajlban a generalt de valamiert nem torolt (pl oldal ujratoltes) feladatot.
    
    public selectDescription(){
        
        //let valami = "IDE JON EGY VALTOZO";
        //let test = "itt kell "+valami+ " kivalasztodni";
        //let descript = this.fs.readFileSync('descript/description.json',"utf8");
        //descript = descript.trim()
        //console.log(descript);

        //let result = JSON.parse(descript);
        //let result2 = JSON.parse(result)
        /*this.fs.readFile('descript/description.json',"utf8", (err, data) => {
            if (err) throw err;
            let result = JSON.parse(data);
            console.log("student: "+data);
        });*/
    }

    /**
     * A kapott adatot (feladat informaciok) lementi a generateLOG.json fajlba.  
     * @param pushData a menteni kivant adat
     */
    public addDatatoJSONfile(pushData){
        let generateLOG = this.fs.readFileSync('generateLOG.json');

        if (generateLOG[0] === undefined){
            generateLOG = '{}';
        }
        let resultLOG = JSON.parse(generateLOG);
        resultLOG[pushData.id] = pushData;
        delete resultLOG[pushData.id].falstadTXT;
        delete resultLOG[pushData.id].link;
        delete resultLOG[pushData.id].id;
        let pushlogData = JSON.stringify(resultLOG, null, 2);

        this.fs.writeFileSync('generateLOG.json',pushlogData, (err) => {
            if (err) {
                return console.error(err);
            }
        });
        
    }

    /**
     * A megadott ID-val rendelkezo feladat torleset vegzi el a LOG fajlbol
     * (megoldott feladat, lejart ido, valamint idokorlatun tul tarolt feladatokra)
     * @param id feladat ID
     */
    public deleteDatatoJSONfile(id: string){
        let generateLOG = this.fs.readFileSync('generateLOG.json');
        let resultLOG = JSON.parse(generateLOG);
        delete resultLOG[id];
        let refreshlogData = JSON.stringify(resultLOG, null, 2);

        this.fs.writeFileSync('generateLOG.json',refreshlogData, (err) => {
            if (err){
                return console.error(err);
            }
        });
        
    }
    /**
     * Ezt a fuggvenyt egy idozitoben hivja a fuggveny, hogy a LOG-olt feladatok letrehozasanak idejet ellenorizze.
     * Ha pedig bent ragadt valamilyen okbol egy feladat a LOG fajlban, akkor az idokorlatot meghaladot torli.
     */
    public checkSolving(){
        let generateLOG = this.fs.readFileSync('generateLOG.json');
        let resultLOG = JSON.parse(generateLOG);
        let deleted: boolean = false;
        let difference; 
        
        if (Object.keys(resultLOG).length > 0){
            for (let key in resultLOG) {
                if (resultLOG.hasOwnProperty(key)) {
                    difference = this.timeDifference(new Date(),new Date(resultLOG[key].timestamp));
                    if (difference[0] > 0 || difference[1] > 0 || difference[2] > 5 /*|| difference[3] > 25 */ ){
                        deleted = true;
                        delete resultLOG[key];
                    }
                }
            }
            if (deleted){
                let refreshlogData = JSON.stringify(resultLOG, null, 2);
                this.fs.writeFileSync('generateLOG.json',refreshlogData, (err) => {
                    if (err) {
                        return console.error(err);
                    }
                });
                console.log('Idokorlaton tuli feladatok torolve!')
            } 
        } else {
            console.log('Kiadott feladatok listaja ures!');
        }
        return;
    }

    /**
     * Kiszamolja ket idopont kozott eltelt ido.
     * @param date1 egyik idopont
     * @param date2 masik idopont
     */
    public timeDifference(date1,date2) {
        let difference = date1 - date2;
        let daysDifference = Math.floor(difference/1000/60/60/24);
        difference -= daysDifference*1000*60*60*24
    
        let hoursDifference = Math.floor(difference/1000/60/60);
        difference -= hoursDifference*1000*60*60
    
        let minutesDifference = Math.floor(difference/1000/60);
        difference -= minutesDifference*1000*60
    
        let secondsDifference = Math.floor(difference/1000);
    
        return [daysDifference, hoursDifference, minutesDifference, secondsDifference];
    }

    /**
     * Megviszgalja server inditasakor, hogy letezik-e a generateLOG.json fajl es ha nem akkor letrehozza.
     */
    public checkExistTaskLOGfile(): void{
        if (!this.fs.existsSync('generateLOG.json')){
            this.fs.writeFileSync('generateLOG.json','{}', (err) => {
                if (err) {
                    return console.error(err);
                }
            });
        }
    }

    /**
     * Idozito, ami megadott idonkent lefuttatja a feladat ellenorzo fuggvenyt.
     */
    public intervalTimer(){
        setInterval(() =>this.checkSolving(),this.checkTimeToSolvedTask);
        //return setInterval(this.checkSolving(),this.checkTimeToSolvedTask);
    }
    /*public getCheckTime():number {
        return this.checkTimeToSolvedTask;
    }
    public getFs(){
        return this.fs;
    }*/
}