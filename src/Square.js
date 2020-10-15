import React from 'react';
import styles from './Square.module.css';


const Square = (props) => {
        return (
             <button 
                className={`${styles.square} ${props.hover ? styles.squareHover :''} `} 
                onClick={props.onClick}
                style={{
                    flex: '1 1 ' + (100/ Math.sqrt(props.boardSize)) +'%',
                    color: props.color

                }}
                disabled={props.disabled}  //disable board2 from being clicked(pre-game).
             > 
            {props.value} 
             </button>
        );
    }


export default Square; 