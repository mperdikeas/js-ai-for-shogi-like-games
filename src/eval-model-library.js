import {GameBoard} from './board-lib.js';


import {EvaluationModel} from './eval-model.js';

import {Chick, Hen, Elephant, Giraffe, Lion} from './piece-set.js';

const model000: EvaluationModel  = (function() {
    const pieceValues: Map<IConcretePiece, number> = new Map();
    pieceValues.set(   Chick, 1);
    pieceValues.set(     Hen, 5);
    pieceValues.set(Elephant, 4);
    pieceValues.set( Giraffe, 8);
    const offBoardMul                           = 1.3;
    const bonusForEachPossibleMove              =   1;
    const malusForEachPossibleMoveOfTheOpponent =  -1;
    const royalDistanceFromPromotionZoneBonus = [100,  50,  10];
    const multipliersForDistFromPromotionZone = [0.9, 0.5, 0.1];
    return new EvaluationModel(pieceValues
                               , royalDistanceFromPromotionZoneBonus
                               , multipliersForDistFromPromotionZone
                               , offBoardMul
                               , bonusForEachPossibleMove
                               , malusForEachPossibleMoveOfTheOpponent
                               , 40
                               , -50);

})();

exports.model000 = model000;
