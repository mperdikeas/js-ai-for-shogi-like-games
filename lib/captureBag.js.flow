// @flow
'use strict';

import assert from 'assert';
import _ from 'lodash';

import {PieceOnSide} from './piece.js';

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
