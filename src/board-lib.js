// @flow
'use strict';

(function() {
    const sourceMapSupport = require('source-map-support');
    sourceMapSupport.install();
})();

import assert from 'assert';
import _ from 'lodash';

import not_used from './number-prototype.js';

import {MAX_BOARD_DIMENSION} from './constants.js';

import {Point, Vector}             from 'geometry-2d';
import {Piece, PieceOnSide}        from './piece.js';
import {Chick, Hen, Lion}          from './piece-set.js';
import {PieceSet}                  from './piece-set-factory.js';
import {transpose}                 from './transpose.js';
import {CaptureBag}                from './captureBag.js';
import {EvaluationModel}           from './eval-model.js';
import {Node}                      from './trees.js';
import {Side}                      from './side.js';
import {Move, BoardMove, DropMoveNoPieceInformation, DropMove} from './moves.js';

class GameBoard {
    width                    : number;
    height                   : number;
    winIfKingReachesFarEnd   : boolean;
    breadthOfPromotionZone   : number;
    board                    : Map<string, IConcretePieceOnSide>;
    captured                 : CaptureBag;

    constructor(width: number,
                height: number,
                winIfKingReachesFarEnd: boolean,
                breadthOfPromotionZone: number,
                board: Map<string, IConcretePieceOnSide>,
                captured: CaptureBag) {
        this.width                  = width;
        this.height                 = height;
        this.winIfKingReachesFarEnd = winIfKingReachesFarEnd;
        assert((breadthOfPromotionZone>=0) &&(breadthOfPromotionZone<=height));
        this.breadthOfPromotionZone = breadthOfPromotionZone;
        this.board                  = board;
        this.captured               = captured;
    }

    static create(width: number, height: number, winIfKingReachesFarEnd: boolean, breadthOfPromotionZone: number, pieceSet: PieceSet, boardNotation: string, _captureBag: ?CaptureBag): GameBoard {
        let captureBag = _captureBag || new CaptureBag();
        const [sideA, sideB] = boardNotation.split('*');
        assert(width.between (0, MAX_BOARD_DIMENSION));
        assert(height.between(0, MAX_BOARD_DIMENSION));
        const board: Map<string, IConcretePieceOnSide> = new Map();
        GameBoard.populate(board, width, height, pieceSet, true , sideA);
        GameBoard.populate(board, width, height, pieceSet, false, sideB);

        return new GameBoard(width, height, winIfKingReachesFarEnd, breadthOfPromotionZone, board, captureBag);
    }

    reflection(): GameBoard { // returns a game board that is the reflection of this one
        const newBoard: Map<string, IConcretePieceOnSide> = new Map();
        this.board.forEach( (v, k) => {
            newBoard.set(Point.fromString(k).reflectionInGrid(this.width, this.height).toString(), v.switchSides());
        });
        return new GameBoard(this.width, this.height, this.winIfKingReachesFarEnd, this.breadthOfPromotionZone, newBoard, this.captured.reflection());
    }

    onBoardPieces(sideA: boolean): Array<[IConcretePiece, Point]> {
        return _.filter(Array.from(this.board.entries()), ([pn, p])=>p.isSideA===sideA).map( ([pn,p]) => [p.piece, Point.fromString(pn)] );
    }
    offBoardPieces(sideA: boolean): Array<IConcretePiece> {
        return _.filter(this.captured.capturedPieces,  p=>p.isSideA===sideA).map( p => p.piece );
    }

    sideAPiecesOnBoard(): Array<[IConcretePiece, Point]> {
        return this.onBoardPieces(true);
    }
    sideAPiecesOffBoard(): Array<IConcretePiece> {
        return this.offBoardPieces(true);
    }
    sideBPiecesOnBoard(): Array<[IConcretePiece, Point]> {
        return this.onBoardPieces(false);
    }
    sideBPiecesOffBoard(): Array<IConcretePiece> {
        return this.offBoardPieces(false);
    }


    emptyPoints(): Array<Point> {
        const rv: Array<Point> = [];
        for (let i = 0; i < this.width; i++) {
            for (let j = 0 ; j < this.height; j++) {
                const p: Point = new Point(i, j);
                if (!this._has(p))
                    rv.push(p);
            }
        }
        return rv;
    }

    isCellEmpty(p: Point): boolean {
        return _.some(this.emptyPoints(), (x)=>x.equals(p));
    }

    sideOnCell(p: Point): Side {
        assert(this._has(p), `B-SOS-CNP: The board:\n${this.toStringFancy()}\n contains no piece on square: ${p.toString()}`);
        const pieceOnSide: IConcretePieceOnSide = this._get(p) || ( ()=>{throw new Error('should have escaped by now');})();
        if (pieceOnSide.isSideA)
            return Side.A;
        else
            return Side.B;
    }

    assertPieceSetSupersetOfBoardPieces(pieceSet: Array<IConcretePiece>) {
        this.board.forEach( (pieceOnSide: IConcretePieceOnSide, position: string) => {
            if (!_.includes(pieceSet, pieceOnSide.piece))
                throw new Error(`The piece set ${pieceSet} does not include ${pieceOnSide.piece}`);
        });
    }

    sideOfMoveS(pieceSet: Array<IConcretePiece>, s: string): Side {
        this.assertPieceSetSupersetOfBoardPieces(pieceSet);
        return this.sideOfMove(Move.fromString(pieceSet, s));
    }
    sideOfMoveSNoPieceSetInfo(s: string): Side {
        return this.sideOfMove(Move.fromStringNoPieceSetInfo(s));
    }

    sideOfMove(m: Move): Side {
        if (m instanceof DropMove) {
            assert(this.captured.has(m.pieceOnSide), `B#ISMS#CNHP: the capture bag of board ${this} does not have the piece involved in the drop ${m}`);
            assert(this.isCellEmpty(m.to), `B#ISMS#DNEC: impossible drop ${m} to non-empty cell on board ${this}`);
            return m.pieceOnSide.isSideA?Side.A:Side.B;
        }         
        if (m instanceof DropMoveNoPieceInformation) {
            assert(this.isCellEmpty(m.to), `B#ISMS#DNEC: impossible drop ${m} to non-empty cell on board ${this}`);
            return m.side;
        } else if (m instanceof BoardMove) {
            assert(!this.isCellEmpty(m.vector.from));
            const rv: Side = this.sideOnCell(m.vector.from);
            assert(this.isCellEmpty(m.vector.to) || (this.sideOnCell(m.vector.to)===rv.theOther()), `B#ISMS#IV invalid move ${m.vector} on board ${this}`);
            return rv;
        }
        else throw new Error(`Unrecognized move: ${m.toString()}`);
    }

    nextStatesByMovingPieceOnAParticularSquare(p : Point): Map<string, GameBoard> {
        assert(this._has(p), `B-NSBMP-CNP: The board:\n${this.toStringFancy()}\n contains no piece on square: ${p.toString()}`);
        const pieceOnSide: IConcretePieceOnSide = this._get(p) || ( ()=>{throw new Error('should have escaped by now');})();
        const rv: Map<string, GameBoard> = new Map();
        const piece: IConcretePiece = pieceOnSide.piece;    
        const _moves: Array<Point> = piece.moves();
        const moves: Array<Point> = pieceOnSide.isSideA?_moves:_moves.map(x=>x.opposite());
        for (let move: Point of moves) {
            const pTo: Point = p.add(move, false);
            const v: Vector = new Vector(p, pTo);
            const newBoard: ?GameBoard = this.move(p, pTo);
            assert(newBoard !==undefined);
            if (newBoard != null) {
                rv.set(v.toString(), newBoard);
            }
        }
        return rv;
    }


    static boardsOnly(moves2Boards: Map<string, GameBoard>): Array<GameBoard> {
        const kvs: Array<[string, GameBoard]> = Array.from(moves2Boards.entries());
        return kvs.map ( ([k,v]) => v );
    }

    // returns the distance of the piece on that particular point from its respective promotion zone
    distanceFromPromotionZone(p : Point): number {
        const piece: ?IConcretePieceOnSide = this._get(p);
        assert(piece, `B-NPEOP: no piece exists on point ${p} on board:\n ${this.toStringFancy()}`);
        if (this.breadthOfPromotionZone === 0)
            return Number.POSITIVE_INFINITY; // if a board has no promotion zone, the distance is infinite
        if (piece != null) { // Flow compels me to make the check this way
            assert(piece !== null); // ... but I am going to assert that a stronger, still, condition holds
            if (piece.isSideA) {
                return Math.max(p.y+1 - this.breadthOfPromotionZone, 0);
            } else {
                return Math.max(this.height-this.breadthOfPromotionZone-p.y, 0);
            }
        } else
            throw new Error('bug - should have escaped by now');
    }

    // returns the distance of a king from its respective far end or positive infinity if the board is not configured
    // to result in an automatic win should a king reache the far end
    royalDistanceFromFarEndForGameWin(p : Point): number {
        const piece: ?IConcretePieceOnSide = this._get(p);
        assert(piece             , `B-RD-NPEOP: no piece exists on point ${p} on board:\n ${this.toStringFancy()}`);
        if (piece != null) { // Flow compels me to make the check this way
            assert(piece !== null); // ... but I am going to assert that a stronger, still, condition holds
            assert(piece.piece.isKing, `B-RD-NK: the piece that exists on point ${p} on board:\n ${this.toStringFancy()}\n ... is [${piece.piece}] and is not a King`);
            if (!this.winIfKingReachesFarEnd)
                return Number.POSITIVE_INFINITY;
            if (piece.isSideA) {
                return p.y;
            } else {
                return this.height-p.y-1;
            }
        } else
            throw new Error('bug - should have escaped by now');
    }    


    nextStatesValues(sideA: boolean, evalModel: EvaluationModel): Map<string, [GameBoard, number]> {
        const rv: Map<string, [GameBoard, number]> = new Map();
        const nextStates: Map<string, GameBoard> = this.nextStates(sideA, false);
        nextStates.forEach( (v, k) => {
            assert (!rv.has(k));
            rv.set(k, [v, evalModel.evaluateBoard(v)]);
        });
        return rv;
    }
    nextStates(sideA: boolean, ignoreDrops: ?boolean = false): Map<string, GameBoard> {
        // rationale for the [ignoreDrops]: for estimating whether a piece is under attack we need not consider drops
        // so having this switch saves some time.
        const rv: Map<string, GameBoard> = new Map();
        // add all possible moves
        this.board.forEach( (v: IConcretePieceOnSide, k: string) => {
            const p: Point = Point.fromString(k);
            if (v.isSideA===sideA) {
                const boardsForThisPiece: Map<string, GameBoard> = this.nextStatesByMovingPieceOnAParticularSquare(p);
                boardsForThisPiece.forEach( (v, k)=> {
                    assert(!rv.has(k), `Weird, move ${k} has already been encountered`);
                    rv.set(k, v);
                } );
            }
        });
        if (!ignoreDrops) {
            const dropOptions: Array<IConcretePiece> = this.captured.dropOptions(sideA);
            const emptyPoints: Array<Point> = this.emptyPoints();
            dropOptions.forEach( (pc: IConcretePiece)=> {
                const dropsForThisPiece : Map<string, GameBoard> = this.nextStatesByDroppingAParticularCapturedPiece(pc, sideA)
                dropsForThisPiece.forEach( (board, keyOfDropMove)=> {
                    assert(!rv.has(keyOfDropMove), `Weird, drop move ${keyOfDropMove} has alredy been encountered`);
                    rv.set(keyOfDropMove, board);
                });
            });
        }
        return rv;
    }

    nextStatesByDroppingAParticularCapturedPiece(pc: IConcretePiece, sideA: boolean): Map<string, GameBoard> {
        const rv: Map<string, GameBoard> = new Map();        
        const pcOnSide = new PieceOnSide(pc, sideA);
        assert(this.captured.has(pcOnSide));
        const emptyPoints: Array<Point> = this.emptyPoints();
        emptyPoints.forEach( (pn: Point)=>{
            const newBoard: ?GameBoard = this.drop(pcOnSide, pn);
            assert(newBoard!==undefined);
            if (newBoard != null) {
                const dropMove = new DropMove(pcOnSide, pn);
                assert(!rv.has(dropMove.toString()), `Weird, drop move ${dropMove.toString()} has alredy been encountered`);
                rv.set(dropMove.toString(), newBoard);
            } else
                throw new Error('bad choreography');
        });
        return rv;
    }

    clone(): GameBoard {
        return new GameBoard(this.width
                             , this.height
                             , this.winIfKingReachesFarEnd
                             , this.breadthOfPromotionZone
                             , new Map(this.board)
                             , this.captured.clone());
    }
    
    _get(pn: Point): ?IConcretePieceOnSide {
        const pnkey = pn.toString();
        return this.board.get(pnkey);
    }    
    _set(pn: Point, pc: IConcretePieceOnSide): void {
        const pnkey = pn.toString();
        this.board.set(pnkey, pc);
    }
    _has(pn: Point): boolean {
        const pnkey = pn.toString();
        return this.board.has(pnkey);
    }
    _delete(pn: Point): ?any {
        const pnkey = pn.toString();
        return this.board.delete(pnkey);
    }
    drop(pc: IConcretePieceOnSide, pn: Point): ?GameBoard {
        assert(this.captured.has(pc), `piece ${pc.toString()} not found in capture bag ${this.captured.toString()}`);
        if (this._has(pn)) {
            return null;
        }
        const rv : GameBoard = this.clone();
        rv.set(pn, pc);
        rv.captured.hasBeenDroppedBackInTheBoard(pc);
        return rv;
    }
    set(pn: Point, pc: IConcretePieceOnSide): void {
        this.assertInGrid(pn);
        if (this._has(pn))
            throw new Error(`some other Piece already exists at ${pn}`);
        this._set(pn, pc);
    }
    clear(pn: Point): void {
        this.assertInGrid(pn);
        if (!this._has(pn))
            throw new Error(`Point ${pn} is already empty`);
        else
            assert(this._delete(pn)!=null);
    }
    _capture(pn: Point): void {
        this.assertInGrid(pn);
        assert(this._has(pn));
        const piece: ?IConcretePieceOnSide = this._get(pn);
        if (piece != null) {
            this.clear(pn);
            this.captured.capture(piece);
        } else throw new Error();
    }
    inGrid(pn: Point): boolean {
        return pn.x.between(0, this.width) && pn.y.between(0, this.height);        
    }
    assertInGrid(pn: Point): void {
        const inGrid = this.inGrid(pn);
        if (!inGrid)
            throw new Error(`Point ${pn.toString()} does not lie in a ${this.width}X${this.height} grid`);
    }

    isPromotionTriggered(pn1: Point, pn2: Point) {
        assert (!pn1.equals(pn2));
        if (!this._has(pn1))
            throw new Error(`board ${this} does not contain piece at starting point: ${pn1}`);
        else {
            const piece: ?IConcretePieceOnSide = this._get(pn1);
            assert(piece!==undefined);
            if (piece!=null) {    
                const sideA: boolean = piece.isSideA;
                if (sideA)
                    return _.some([pn1, pn2], (v) => {
                        return v.y<this.breadthOfPromotionZone;
                    });
                else
                    return _.some([pn1, pn2], (v) => {
                        return v.y>=this.height-this.breadthOfPromotionZone;
                    });
            } else
                throw new Error('bug - should have escaped this path by now');
        }
    }

    kingIsOnLastLineUnchecked(sideA: boolean): boolean {
        const p: Point   = this.locationOfKing   (sideA);
        const b: boolean = this.isKingUnderAttack(sideA);
        if ( ( sideA) && (p.y===0            ) && (!b) ) return true;
        if ( (!sideA) && (p.y===this.height-1) && (!b) ) return true;
        return false;
    }

    locationOfKing(sideA: boolean): Point {
        const piecesOfThisSide: Array<[string, IConcretePiece]> = _.filter(Array.from(this.board.entries()),
                                                                           ([k, v])=> v.isSideA===sideA
                                                                          ).map( ([k, v])=>[k, v.piece] );
        const kingsOfThisSide: Array<[string, IConcretePiece]> = _.filter(piecesOfThisSide, ([k,v])=>v===Lion);
        assert(kingsOfThisSide.length===1, `Unexpected number of kings found: ${kingsOfThisSide.length}`);
        return Point.fromString(kingsOfThisSide[0][0]);
    }

    isKingUnderAttack(sideA: boolean): boolean {
        const p : Point = this.locationOfKing(sideA);
        return this.isPieceUnderAttack(p);
    }

    isPieceUnderAttack(pn: Point): boolean { // we are assuming that the opposite side moves
        if (!this._has(pn))
            throw new Error(`board ${this} does not contain piece at starting point: ${pn}`);
        else {
            const piece: ?IConcretePieceOnSide = this._get(pn);
            assert(piece!==undefined);
            if (piece!=null) {            
                const nextBoards: Array<GameBoard> = GameBoard.boardsOnly(this.nextStates(!piece.isSideA, true));
                
                // if the piece remains in the same spot for *every* possible next state, then it is not
                // currently under attack
                return !_.every(nextBoards, (gb: GameBoard)=>{
                    assert(gb._has(pn)); // Whether the piece remains there or has been captured, a piece should always exists
                                         // in that spot in all possible next boards as it is the other side that's moving.
                                         // So either our piece stays there or the piece that captured it occupies the spot.
                    const pieceOnNewBoard: ?IConcretePieceOnSide = gb._get(pn);
                    if (pieceOnNewBoard != null) {
                        assert(piece !== null);
                        return piece.equals(pieceOnNewBoard);
                    } else throw new Error('bug - should have escaped by now');

                })
            } else
                throw new Error('bug - should have escaped this path by now');
        }
    }

    numOfPossibleMoves(isSideA: boolean): number {
        const nextBoards: Array<GameBoard> = GameBoard.boardsOnly(this.nextStates(isSideA));
        return nextBoards.length;
    }

    
    move(pn1: Point, pn2: Point): ?GameBoard {
        if (!this._has(pn1))
            return null;
        else {
            const piece: ?IConcretePieceOnSide = this._get(pn1);
            if (piece!=null) {
                const rv: GameBoard = this.clone();                
                if (!this.inGrid(pn2))
                    return null;
                if (rv._has(pn2)) {
                    const otherPiece : ?IConcretePieceOnSide = rv._get(pn2);
                    if (otherPiece != null) {
                        if (otherPiece.sameSide(piece))
                            return null;
                        else
                            rv._capture(pn2);
                    } else throw new Error('bug');
                }
                // finish the move (if some other piece exists at destination it should have already been captured in the lines above
                rv.clear(pn1);
                if (this.isPromotionTriggered(pn1, pn2))
                    rv.set(pn2, piece.promote());
                else
                    rv.set(pn2, piece);
                return rv;
            } else throw new Error('bug');
        }
    }
    static populate(board: Map<string, IConcretePieceOnSide>, width: number, height: number, pieceSet: PieceSet, asSideA: boolean, positionNotationsStr: string): void {
        const positionNotations : Array<string> = positionNotationsStr.replace(/ /g, ''). split(',');
        for (let piecePosition: string of positionNotations) {
            const [piece, position] = piecePosition.split('@');
            const point = Point.fromString(position);
            assert(_.isInteger(point.x));
            assert(_.isInteger(point.y));            
            if (!point.x.between(0, width))
                throw new Error(`Point ${point} does not lie on the X-axis >=0 and < ${width}`);
            if (!point.y.between(0, height))
                throw new Error(`Point ${point} does not lie on the Y-axis >=0 and < ${height}`);            
            const pnkey = point.toString();
            const pieceP: ?IConcretePiece = pieceSet.fromCode(piece);
            if (pieceP!=null) {
                if (!board.has(pnkey))
                    board.set(pnkey, pieceP.takeSides(asSideA));
                else
                    throw new Error(`something alredy exists in point: ${point}`);
            } else throw new Error(`Bad notation: ${positionNotationsStr}, contains unknown code: ${piece}`);
        }
    }
    kingIsCaptured(sideA: boolean): boolean {
        return _.some(this.captured.capturedPieces, (p: IConcretePieceOnSide) => ((p.isSideA===!sideA) && (p.piece.isKing)) ); // when a piece is captured, it switches sides
    }

    boardImmediateWinSide(): ?boolean { // true if this position is a win for side A, false if it is a win for side B, null for neither
        
        {   // check for captured kings
            const sideAKingIsCaptured: boolean = this.kingIsCaptured(true);
            const sideBKingIsCaptured: boolean = this.kingIsCaptured(false);
            if ( sideAKingIsCaptured && !sideBKingIsCaptured) return false;
            if (!sideAKingIsCaptured &&  sideBKingIsCaptured) return true;
            if ( sideAKingIsCaptured && sideBKingIsCaptured ) throw new Error(`I shoud never be asked to evalute a position with both kings captured such as the following:\n${this.toStringFancy()}`);
        }
        {   // check for kings that've reached the last line and are unchecked
            const kingAUncheckedLastLine: boolean = this.kingIsOnLastLineUnchecked( true);
            const kinthisUncheckedLastLine: boolean = this.kingIsOnLastLineUnchecked(false);
            if (( kingAUncheckedLastLine)  && (!kinthisUncheckedLastLine)) return true;
            if ((!kingAUncheckedLastLine)  && ( kinthisUncheckedLastLine)) return false;
            if ( this.winIfKingReachesFarEnd && ( kingAUncheckedLastLine) && ( kinthisUncheckedLastLine) ) throw new Error(`GB:BKULL I shoud never be asked to evalute a position with both kings unchecked on the last line, such as the following:\n${this.toStringFancy()}`);
        }
        return null;
    }
    

    
    toString(): string {
        const keys:       Array<string> = Array.from(this.board.keys());
        const keysSorted: Array<string> = _.sortBy(keys, (xy)=>{
            const p = Point.fromString(xy);
            return p.x*MAX_BOARD_DIMENSION+p.y;
        });
        const rv = [];
        for (let key: string of keysSorted) {
            const piece: ?IConcretePieceOnSide = this.board.get(key);
            if (piece!=null) {
                rv.push(`${piece.toString()}@${key.toString()}`);
            } else throw new Error(`bug key: ${key.toString()} found and yet not found`);
        }
        const board = rv.join(', ');
        return `[${board}] * [${this.captured.toString()}]`;
    }
    toStringFancy(): string {
        return GameBoard.toStringFancy(this);
    }
    static toStringFancy(gb): string {
        const rows=[];
        for (let j = 0; j < gb.height ; j++) {
            const column = [];
            for (let i = 0 ; i < gb.width ; i++) {
                const piece: ?IConcretePieceOnSide = gb._get(new Point(i, j));
                if (piece==null)
                    column.push('.');
                else {
                    if (piece != null) {
                        column.push(piece.toString());
                    } else throw new Error();
                }
            }
            rows.push(column.join(''));
        }
        const board = rows.join('\n');
        return `${board}\n--\n${gb.captured.toString()}`;
    }
    static toStringFancyBoardsOnly(__gameBoards: Map<string, GameBoard>): string {
        const _gameBoards: Array<GameBoard> = GameBoard.boardsOnly(__gameBoards);
        const gameBoards: Array<string>  = _gameBoards.map( (x) => x.toStringFancy() );
        const gameBoardsSliced: Array<Array<string>> = gameBoards.map( (x)=>x.split(/\r?\n/) );
        const gameBoardsSlicedTr = transpose(gameBoardsSliced);
        let rv =  gameBoardsSlicedTr.map( (x: Array<string>)=> {return x.join('  I  ');}).join('\n');
        return rv;
    }
    static toStringFancyMovesOnly(movesToGameBoardsMap: Map<string, GameBoard>): string {
        const movesToGameBoardsArr: Array<[string, GameBoard]> = Array.from(movesToGameBoardsMap.entries());
        const moves: Array<string> = movesToGameBoardsArr.map( ([k, v])=>k);
        return `[${moves.join(', ')}]`;
    }    
    equals(o: GameBoard): boolean {
        return this.toString()===o.toString();
    }    
}

    
exports.GameBoard        = GameBoard;
