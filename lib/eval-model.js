'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _boardLib = require('./board-lib.js');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _numUtils = require('./num-utils.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var EvaluationModel = function () {
    function EvaluationModel(pieceValues, royalDistanceFromFarEndBonus, multipliersForDistFromPromotionZone, offBoardMultiplier, bonusForEachPossibleMove, malusForEachPossibleMoveOfTheOpponent, bonusForEnemyLionUnderCheck, malusForFriendlyLionUnderCheck) {
        _classCallCheck(this, EvaluationModel);

        (0, _assert2.default)(!_lodash2.default.some(Array.from(pieceValues.keys()), function (k) {
            return k.isKing;
        }), 'Evaluation model contains a King piece');
        (0, _numUtils.assertArrayOfNotAscendingPositiveValues)(royalDistanceFromFarEndBonus);
        (0, _numUtils.assertArrayOfNotAscendingPositiveValues)(multipliersForDistFromPromotionZone);
        (0, _assert2.default)(bonusForEachPossibleMove >= 0);
        (0, _assert2.default)(malusForEachPossibleMoveOfTheOpponent <= 0);
        (0, _assert2.default)(bonusForEnemyLionUnderCheck >= 0);
        (0, _assert2.default)(malusForFriendlyLionUnderCheck <= 0);
        (0, _assert2.default)(offBoardMultiplier >= 1);
        this.pieceValues = pieceValues;
        this.royalDistanceFromFarEndBonus = royalDistanceFromFarEndBonus;
        this.multipliersForDistFromPromotionZone = multipliersForDistFromPromotionZone;
        this.offBoardMultiplier = offBoardMultiplier;
        this.bonusForEachPossibleMove = bonusForEachPossibleMove;
        this.malusForEachPossibleMoveOfTheOpponent = malusForEachPossibleMoveOfTheOpponent;
        this.bonusForEnemyLionUnderCheck = bonusForEnemyLionUnderCheck;
        this.malusForFriendlyLionUnderCheck = malusForFriendlyLionUnderCheck;
    }

    _createClass(EvaluationModel, [{
        key: 'bonusFromDistanceToPromotionZone',
        value: function bonusFromDistanceToPromotionZone(gb, pn) {
            var _piece = gb._get(pn);
            (0, _assert2.default)(_piece);
            if (_piece != null) {
                (0, _assert2.default)(_piece !== null);
                var piece = _piece.piece;
                if (!piece.isPromotable()) {
                    return 0;
                } else {
                    var promotedPiece = piece.promote();
                    (0, _assert2.default)(this.pieceValues.has(promotedPiece));
                    var valueOfPromotedPiece = this.pieceValues.get(promotedPiece);
                    if (valueOfPromotedPiece != null) {
                        (0, _assert2.default)(valueOfPromotedPiece !== null);
                        var d = gb.distanceFromPromotionZone(pn);
                        if (d >= this.multipliersForDistFromPromotionZone.length) {
                            return 0;
                        } else return this.multipliersForDistFromPromotionZone[d] * valueOfPromotedPiece;
                    } else throw new Error('bug');
                }
            } else throw new Error('bug');
        }
    }, {
        key: '_royalBonusFromDistanceToFarEnd',
        value: function _royalBonusFromDistanceToFarEnd(gb, pn) {
            var d = gb.royalDistanceFromFarEndForGameWin(pn);
            if (d === Number.POSITIVE_INFINITY) throw new Error('bad choreography - should have already checked if this board is set for instant win on far end');

            if (d >= this.royalDistanceFromFarEndBonus.length) return 0;else return this.royalDistanceFromFarEndBonus[d];
        }
    }, {
        key: 'evaluateBoard',
        value: function evaluateBoard(gb) {
            // evaluation is done from the perspective of side A so higher value is better for sideA, lower value is better for sideB
            var b = gb.boardImmediateWinSide();
            if (b != null) {
                // escape for immediate win situations
                (0, _assert2.default)(b !== null);
                return b ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
            } else {
                // normal evaluation
                var pieceValuesFriendlySide = this._evalPieceValues(gb, true);
                var pieceValuesEnemySide = this._evalPieceValues(gb, false);
                var freedomOfMoveValuation = this._evalFreedomOfMovement(gb);
                var evalRoyalCheckage = this._evalRoyalCheckage(gb);
                return pieceValuesFriendlySide - pieceValuesEnemySide + freedomOfMoveValuation + evalRoyalCheckage;
            }
        }
    }, {
        key: '_evalPieceValues',
        value: function _evalPieceValues(gb, sideA) {
            var _this = this;

            var rv = 0;
            var piecesOnBoard = gb.onBoardPieces(sideA);
            piecesOnBoard.forEach(function (_ref) {
                var _ref2 = _slicedToArray(_ref, 2);

                var p = _ref2[0];
                var pn = _ref2[1];

                if (p.isKing) {
                    if (gb.winIfKingReachesFarEnd) rv += _this._royalBonusFromDistanceToFarEnd(gb, pn);
                } else {
                    (0, _assert2.default)(_this.pieceValues.has(p));
                    rv += _this.pieceValues.get(p);
                    var promotionBonus = _this.bonusFromDistanceToPromotionZone(gb, pn);
                    rv += promotionBonus;
                }
            });
            var piecesOffBoard = gb.offBoardPieces(sideA);
            piecesOffBoard.forEach(function (p) {
                (0, _assert2.default)(_this.pieceValues.has(p));
                var pieceValue = _this.pieceValues.get(p);
                if (pieceValue != null) {
                    (0, _assert2.default)(pieceValue !== null);
                    rv += pieceValue * _this.offBoardMultiplier;
                } else throw new Error('bug');
            });
            return rv;
        }
    }, {
        key: '_evalFreedomOfMovement',
        value: function _evalFreedomOfMovement(gb) {
            var moveBonusFriendlySide = this._numOfMoves(gb, true) * this.bonusForEachPossibleMove;
            var moveMalusEnemySide = this._numOfMoves(gb, false) * this.malusForEachPossibleMoveOfTheOpponent;
            return moveBonusFriendlySide + moveMalusEnemySide;
        }
    }, {
        key: '_evalRoyalCheckage',
        value: function _evalRoyalCheckage(gb) {
            var checkBonusEnemyLionUnderCheck = gb.isKingUnderAttack(false) ? this.bonusForEnemyLionUnderCheck : 0;
            var checkMalusFriendlyLionUnderCheck = gb.isKingUnderAttack(true) ? this.malusForFriendlyLionUnderCheck : 0;
            return checkBonusEnemyLionUnderCheck + checkMalusFriendlyLionUnderCheck;
        }
    }, {
        key: '_numOfMoves',
        value: function _numOfMoves(gb, sideA) {
            return gb.nextStates(sideA, false).size;
        }
    }]);

    return EvaluationModel;
}();

exports.EvaluationModel = EvaluationModel;
//# sourceMappingURL=eval-model.js.map