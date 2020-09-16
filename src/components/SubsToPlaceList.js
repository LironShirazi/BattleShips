import React from 'react';

const SubsToPlaceList = (props) => {
    let subsToPlace;
    if (props.status ==='pre-game') {
     subsToPlace = props.subsConfig.map(sub => {
        if(sub.count !== sub.placed) {
            return <li key={sub.name}><span>{sub.count - sub.placed} {sub.name}s  of size {sub.size}</span></li>;
        }
        else return null;
    });
 } else return;
    return (
        <ul>
          {subsToPlace}           
        </ul>
    );
};

export default SubsToPlaceList;