// @flow
'use strict';

import assert from 'assert';
import _ from 'lodash';

import {PieceOnSide} from './piece.js';
import {PieceSet} from './piece-set-factory.js';

class CaptureBag {
    capturedPieces: Array<IConcretePieceOnSide>;
    constructor() {
        if (arguments.length===0)
            this.capturedPieces = [];
        else {
            assert(arguments.length === 1);
            assert(_.isArray(arguments[0]));
            arguments[0].forEach(x=>{
                assert(x instanceof PieceOnSide);
            });
            this.capturedPieces = arguments[0];
        }
    }
    static fromString(notation: string, pieceSet: PieceSet): CaptureBag {
        const rv: Array<IConcretePieceOnSide> = [];
        for (let i = 0 ; i < notation.length ; i++) {
            const code = notation[i];
            const concretePiece: ?IConcretePiece = pieceSet.fromCode(code.toLowerCase());
            if (concretePiece!=null)
                rv.push(new PieceOnSide(concretePiece, code===code.toUpperCase()));
            else
                throw new Error('impossible to not find piece with code [${code.toLowerCase()}]');
        }
        return new CaptureBag(rv);
    }
    
    equals(o: CaptureBag): boolean {
        // two capture bags are equal if they contain the same population of pieces (obviously taking sides into account)
        // therefore the strategy is to create maps counting the number of pieces for each code (case/side-SENSITIVE) and then use lodash _.isEqual to compare the maps
        const m1 = this.countOfPieces();
        const m2 =    o.countOfPieces();
        return _.isEqual(m1, m2);
    }
    isEmpty(): boolean {
        return _.isEmpty(this.capturedPieces);
    }
    countOfPieces() {
        const rv = new Map();
        this.capturedPieces.forEach( (x)=> {
            if (!rv.has(x.toString()))
                rv.set(x.toString(), 0);
            let count: ?number = rv.get(x.toString());
            if (count!=null)
                rv.set(x.toString(), count+1);
            else
                throw new Error('impossible, I think - its rather late ..');
        });
        return rv;
    }
    piecesOfThisSide(forSideA: boolean): Array<IConcretePiece> {
        return this.capturedPieces.filter(x => forSideA===x.isSideA).map ( x=> x.piece );
    }
    capture(p: IConcretePieceOnSide): void {
        this.capturedPieces.push(p.switchSidesAndDemote());
    }
    dropOptions(sideA: boolean): Array<IConcretePiece> {
        return _.uniq( this.capturedPieces.filter(x => sideA===x.isSideA).map ( x=> x.piece ) );
    }
    has(p: IConcretePieceOnSide): boolean {
        return _.some(this.capturedPieces, (x)=>x.equals(p));
    }
    hasBeenDroppedBackInTheBoard(p: IConcretePieceOnSide): void {
        assert(this.has(p), `Piece ${p.toString()} not found for removal in capture bag: ${this.toString()}`);
        let pieceWasFound = false;
        for (let i = this.capturedPieces.length-1 ; i >= 0; i--) {
            if (this.capturedPieces[i].equals(p)) {
                this.capturedPieces.splice(i, 1);
                pieceWasFound = true;
                break;
            }
        }
        assert(pieceWasFound, 'bug at this point');
    }
    clone(): CaptureBag {
        return new CaptureBag(this.capturedPieces.slice());
    }
    reflection(): CaptureBag {
        return new CaptureBag(this.capturedPieces.map( (x)=>x.switchSides() ) );
    }
    toString(): string {
        return _.sortBy(this.capturedPieces.map(x=>x.toString())).join('');
    }
}

exports.CaptureBag = CaptureBag;
