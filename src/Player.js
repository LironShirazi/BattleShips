import hashId from './hashHelperFunction';

class Player {
    constructor(selfBoard, score = 0 ) {
        
        this.playerId = hashId();
        this.selfBoard = selfBoard;
        this.enemyBoard = new Board();
        this.score = score;
        
    }
    
    attack = (coords) => {
        this.enemyBoard.attack(coords);
    }
}