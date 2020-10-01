import React from 'react';
import './StatusLog.css';
import Button from '@material-ui/core/Button';
import CircularProgress  from '@material-ui/core/CircularProgress';


const StatusLog = (props) => {
    let phrase;
    switch(props.status) {
        default: 
        case 'game-init':
            phrase = <Button
                        variant="contained" 
                        color="secondary"     
                        onClick={props.onClickStartGame}>
                            Start game!
                      </Button>;
            break;
        case 'waiting': 
            phrase =  <div className="waiting"><CircularProgress color="secondary" /> <span>Waiting for opponent...</span></div>
            break;
        case 'pre-game':
            phrase = <span className="pre-game">Please place subs on the board:</span>;
            break;
        case 'ready': 
            phrase = <Button
                        variant="contained" 
                        color="secondary"     
                        onClick={props.onClickReady}>
                            Ready to play?
                     </Button>;
            break;
        case 'game-started':
            props.isPlayerOneTurn ?
              phrase = props.playerOneName :
              phrase = props.playerTwoName
        
            phrase += ", it's your turn, choose a spot to attack!";
            break;
        case 'player-won':
            phrase = <div className="status_log"> 
                        <span>{props.isWinner ? `${props.playerOneName}, You Won`: `${props.playerTwoName}, You Lose`} the game!</span>  
                        <span>Your score is: {props.score}   &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 
                            {props.playerTwoName}'s score is: {props.enemyScore}
                        </span> 
                        <Button 
                            variant="contained" 
                            color="secondary" 
                            onClick={() => {props.playAgainOnClick()}}    
                        >
                         Play Again?
                        </Button>
                    </div>;
            break;
    }
    return (
        <span style={{'padding': '18px'}}>{phrase}</span>
    );
};

export default StatusLog;