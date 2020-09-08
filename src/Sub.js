import hashId from './hashHelperFunction';

class Sub {
    constructor(subSize) {
        this.subId = hashId();
        this.subSize = subSize;
        this.numHits = 0;
        this.idDead = true;
        this.subCoordsArr = new Array(subSize);
    }
    

     getHitsLeftToDead = () => {
        return this.subSize - this.numHits;
    }
  
}

export default Sub;