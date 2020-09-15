import hashId from './util/hashHelperFunction';

class Action {
    constructor(gameId, playerId, actionType, 
        actionCoords, actionResult, subFallId = null) {
                this.actionId = hashId();
                this.gameId = gameId;
                this.playerId = playerId;
                this.actionType = actionType;
                this.actionCoords = actionCoords;
                this.actionResult = actionResult; 
                this.subFallId = subFallId;
        }
}