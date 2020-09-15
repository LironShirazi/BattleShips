import React from 'react';
import './StatusLog.css';

const StatusLog = (props) => {
    let phrase;
    switch(props.status) {
        default:
            phrase = 'Please place on the board:';
            break;
        case 'game-started':
            props.isPlayerOneTurn ?
              phrase = props.playerOneName :
              phrase = props.playerTwoName
        
            phrase += ", it's your turn, choose a spot to attack!";
            break;
        case 'player-won':
            phrase = props.winner + ' Won the game!'
            break;
    }
    return (
        <p>{phrase}</p>
    );
};

export default StatusLog;