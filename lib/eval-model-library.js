'use strict';

var _boardLib = require('./board-lib.js');

var _evalModel = require('./eval-model.js');

var _pieceSet = require('./piece-set.js');

var model000 = function () {
    var pieceValues = new Map();
    pieceValues.set(_pieceSet.Chick, 1);
    pieceValues.set(_pieceSet.Hen, 5);
    pieceValues.set(_pieceSet.Elephant, 4);
    pieceValues.set(_pieceSet.Giraffe, 8);
    var offBoardMul = 1.3;
    var bonusForEachPossibleMove = 1;
    var malusForEachPossibleMoveOfTheOpponent = -1;
    var royalDistanceFromPromotionZoneBonus = [100, 50, 10];
    var multipliersForDistFromPromotionZone = [0.9, 0.5, 0.1];
    return new _evalModel.EvaluationModel(pieceValues, royalDistanceFromPromotionZoneBonus, multipliersForDistFromPromotionZone, offBoardMul, bonusForEachPossibleMove, malusForEachPossibleMoveOfTheOpponent, 40, -50);
}();

exports.model000 = model000;
//# sourceMappingURL=eval-model-library.js.map