import hashId from './hashHelperFunction';
import Sub from '../Sub';

const enemyData = {
    name: 'Shahar1',
    playerId : hashId(),
    board: Array(100).fill(null),
    score: 0,
    subs: [],
    history: [
        {
            board: Array(100).fill(null),
        },
        {
            board: Array(100).fill(null),
        }
    ]
};

enemyData.subs.push(new Sub(4, [0,1,2,3], true));
enemyData.subs.push(new Sub(3, [13,23,33], true));
enemyData.subs.push(new Sub(3, [30,31,32], true));
enemyData.subs.push(new Sub(2, [10,11], true));
enemyData.subs.push(new Sub(1, [99], false));

enemyData.subs.forEach(sub => { sub.numHits = sub.subSize; sub.isDead = true});


const indexPointsArr = [0,1,2,3,13,23,33,30,31,32,10,11,98,99];
indexPointsArr.forEach(index => {
    enemyData.board[index] = 'X';
});

export default enemyData;

