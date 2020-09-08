import React from 'react';
import './Square.css';

const Square = (props) => {
    

        return (
             <button 
                className="square" 
                onClick={props.onClick}
                style={{flex: '1 1 ' + (100/ Math.sqrt(props.boardSize)) +'%'}}  
             > 
            
            {props.value} 
            
             </button>
        );
    }


export default Square; 