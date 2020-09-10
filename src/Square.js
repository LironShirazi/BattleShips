import React from 'react';
import './Square.css';

const Square = (props) => {
    // const disabledHandler = () => {
    //     if(props.status === 'pre-game' && 'player2') return;
    // }
        return (
             <button 
                // disabled={true}
                className="square" 
                onClick={props.onClick}
                style={{flex: '1 1 ' + (100/ Math.sqrt(props.boardSize)) +'%'}}
                disabled={props.disabled}  
             > 
            
            {props.value} 
            
             </button>
        );
    }


export default Square; 