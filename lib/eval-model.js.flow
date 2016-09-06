// @flow
'use strict';

import {GameBoard} from './board-lib.js';

import _ from 'lodash';
import assert from 'assert';
import {assertArrayOfNotAscendingPositiveValues} from './num-utils.js';

class EvaluationModel {
    pieceValues                          : Map<IConcretePiece, number>;
    royalDistanceFromFarEndBonus  : Array<number>;    
    multipliersForDistFromPromotionZone  : Array<number>;
    offBoardMultiplier                   : number;
    bonusForEachPossibleMove             : number;
    malusForEachPossibleMoveOfTheOpponent: number;
    bonusForEnemyLionUnderCheck          : number;
    malusForFriendlyLionUnderCheck       : number;
    constructor(    pieceValues                          : Map<IConcretePiece, number>,
                    royalDistanceFromFarEndBonus  : Array<number>,                    
                    multipliersForDistFromPromotionZone  : Array<number>,
                    offBoardMultiplier                   : number,
                    bonusForEachPossibleMove             : number,
                    malusForEachPossibleMoveOfTheOpponent: number,
                    bonusForEnemyLionUnderCheck          : number,
                    malusForFriendlyLionUnderCheck       : number) {
        assert (!_.some(Array.from(pieceValues.keys()), (k)=>k.isKing), `Evaluation model contains a King piece`);
        assertArrayOfNotAscendingPositiveValues(royalDistanceFromFarEndBonus);
        assertArrayOfNotAscendingPositiveValues(multipliersForDistFromPromotionZone);
        assert(bonusForEachPossibleMove>=0);
        assert(malusForEachPossibleMoveOfTheOpponent<=0);
        assert(bonusForEnemyLionUnderCheck>=0);
        assert(malusForFriendlyLionUnderCheck<=0);
        assert(offBoardMultiplier>=1);
        this.pieceValues                           = pieceValues;
        this.royalDistanceFromFarEndBonus   = royalDistanceFromFarEndBonus;
        this.multipliersForDistFromPromotionZone   = multipliersForDistFromPromotionZone;
        this.offBoardMultiplier                    = offBoardMultiplier;
        this.bonusForEachPossibleMove              = bonusForEachPossibleMove;
        this.malusForEachPossibleMoveOfTheOpponent = malusForEachPossibleMoveOfTheOpponent;
        this.bonusForEnemyLionUnderCheck           = bonusForEnemyLionUnderCheck;
        this.malusForFriendlyLionUnderCheck        = malusForFriendlyLionUnderCheck;
    }
    bonusFromDistanceToPromotionZone(gb: GameBoard, pn: Point): number {
        const _piece: ?IConcretePieceOnSide = gb._get(pn);
        assert(_piece);
        if (_piece != null) {
            assert(_piece !== null);
            const piece: IConcretePiece = _piece.piece;
            if (!piece.isPromotable()) {
                return 0;
            } else {
                const promotedPiece: IConcretePiece = piece.promote();
                assert(this.pieceValues.has(promotedPiece));
                const valueOfPromotedPiece: ?number = this.pieceValues.get(promotedPiece);
                if (valueOfPromotedPiece!=null) {
                    assert(valueOfPromotedPiece!==null);
                    const d = gb.distanceFromPromotionZone(pn);
                    if (d>=this.multipliersForDistFromPromotionZone.length) {
                        return 0;
                    } else
                        return this.multipliersForDistFromPromotionZone[d]*valueOfPromotedPiece;
                } else throw new Error('bug');
            }
        } else throw new Error('bug');
    }
    _royalBonusFromDistanceToFarEnd(gb: GameBoard, pn: Point): number {
        const d: number = gb.royalDistanceFromFarEndForGameWin(pn);
        if (d===Number.POSITIVE_INFINITY)
            throw new Error('bad choreography - should have already checked if this board is set for instant win on far end');

        if (d>= this.royalDistanceFromFarEndBonus.length)
            return 0;
        else
            return this.royalDistanceFromFarEndBonus[d];
    }

    evaluateBoard(gb: GameBoard): number { // evaluation is done from the perspective of side A so higher value is better for sideA, lower value is better for sideB
        const b: ?boolean = gb.boardImmediateWinSide();
        if (b!=null) { // escape for immediate win situations
            assert(b!==null);
            return b?Number.POSITIVE_INFINITY:Number.NEGATIVE_INFINITY;
        } else {   // normal evaluation
            const pieceValuesFriendlySide           = this._evalPieceValues(gb,  true);
            const pieceValuesEnemySide              = this._evalPieceValues(gb, false);
            const freedomOfMoveValuation            = this._evalFreedomOfMovement(gb);
            const evalRoyalCheckage = this._evalRoyalCheckage(gb);
            return pieceValuesFriendlySide - pieceValuesEnemySide + freedomOfMoveValuation + evalRoyalCheckage;
        }
    }


    _evalPieceValues(gb: GameBoard, sideA: boolean): number {
        let rv = 0;
        let piecesOnBoard: Array<[IConcretePiece, Point]> = gb.onBoardPieces(sideA);
        piecesOnBoard.forEach( ([p, pn] : [IConcretePiece, Point]) => {
            if (p.isKing) {
                if ( gb.winIfKingReachesFarEnd )
                    rv += this._royalBonusFromDistanceToFarEnd(gb, pn);
            } else {
                assert(this.pieceValues.has(p));
                rv += this.pieceValues.get(p);
                const promotionBonus = this.bonusFromDistanceToPromotionZone(gb, pn);
                rv += promotionBonus;
            }
        });
        let piecesOffBoard: Array<IConcretePiece> = gb.offBoardPieces(sideA);
        piecesOffBoard.forEach( (p: IConcretePiece) => {
            assert(this.pieceValues.has(p));
            const pieceValue: ?number = this.pieceValues.get(p);
            if (pieceValue!=null) {
                assert(pieceValue!==null);
                rv += pieceValue*this.offBoardMultiplier;
            } else throw new Error('bug');
        });
        return rv;
    }

    _evalFreedomOfMovement(gb: GameBoard): number {
        const moveBonusFriendlySide   = this._numOfMoves (gb,  true) * this.bonusForEachPossibleMove;
        const moveMalusEnemySide      = this._numOfMoves (gb, false) * this.malusForEachPossibleMoveOfTheOpponent;
        return moveBonusFriendlySide + moveMalusEnemySide;
    }

    _evalRoyalCheckage(gb: GameBoard): number {
        const checkBonusEnemyLionUnderCheck     = gb.isKingUnderAttack(false)?this.bonusForEnemyLionUnderCheck:0;
        const checkMalusFriendlyLionUnderCheck  = gb.isKingUnderAttack( true)?this.malusForFriendlyLionUnderCheck:0;
        return checkBonusEnemyLionUnderCheck + checkMalusFriendlyLionUnderCheck;
    }

    _numOfMoves(gb: GameBoard, sideA: boolean): number {
        return gb.nextStates(sideA, false).size;
    }


}

exports.EvaluationModel = EvaluationModel;
