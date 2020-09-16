import React from 'react';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Button from '@material-ui/core/Button';


const HistoryList = props => {
    const moves = props.history.map((step, move) => {
        const desc = move ?
          'Go to move #' + move :
          'Go to game start';
        return (
            <Button key={move} onClick={() => props.jumpTo(move)}>{desc}</Button>
        );
      });
    return   <ButtonGroup
                orientation="vertical"
                color="primary"
                aria-label="vertical outlined primary button group"
            >
                {moves}
            </ButtonGroup>
}

export default HistoryList;
