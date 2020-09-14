import hashId from './hashHelperFunction';

class Sub {
    constructor(size, coordsArr) {
        this.subId = hashId();
        this.subSize = size;
        this.numHits = 0;
        this.idDead = false;
        this.subCoordsArr = coordsArr;
    }

    setSubSize(subSize) {
        this.subSize = subSize;
    }
    
     getHitsLeftToDead = () => {
        return this.subSize - this.numHits;
    }
    // getSubFromIndex(index) {
    //     this.subCoordsArr.forEach(coord => {
    //         if(coord === index) return this.Sub;
    //     })
    // }

    // setSubCoords(subId, coords) {
    //     if (subId === this.subId) {
    //         this.subCoordsArr = coords;
    //         this.isDead = false;
    //     }

        // this.subs.forEach(singleSub => {
        //     coords.forEach(coord => {
        //         if(singleSub.subCoordsArr.includes(coord)) {
        //             console.log('Sub already located on those coordinates.');
        //             return;
        //         } 
        //     })        
        // });
        // this.subs[sub].subCoordsArr = coords; // TO CHECK - if its illigle subs[sub]
        // this.subs[sub].isDead = false; // Sub is alive when coords is set.
    // }
  
}

export default Sub;