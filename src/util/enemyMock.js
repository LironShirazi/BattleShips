import hashId from './hashHelperFunction';
import Sub from '../Sub';

const enemyData = {
    name: 'Shahar1',
    playerId : hashId(),
    board: Array(100).fill(null),
    score: 0,
    subs: []
};

enemyData.subs.push(new Sub(4, [0,1,2,3], false));
enemyData.subs.push(new Sub(3, [13,23,33], false));
enemyData.subs.push(new Sub(3, [30,31,32], false));
enemyData.subs.push(new Sub(2, [10,11], false));
enemyData.subs.push(new Sub(2, [98,99], false));

const indexPointsArr = [0,1,2,3,13,23,33,30,31,32,10,11,98,99];
indexPointsArr.forEach(index => {
    enemyData.board[index] = 'X';
});

export default enemyData;

