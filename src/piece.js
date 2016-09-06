// @flow
'use strict';

import assert from 'assert';

(function() {
    const sourceMapSupport = require('source-map-support');
    sourceMapSupport.install();
})();

class Piece {
    code: string;
    isKing: boolean;
    constructor(code: string, isKing: boolean) {
        this.code = code;
        this.isKing = isKing;
    }
    toString(): string {
        return this.code;
    }
}

class PieceOnSide {
    piece: IConcretePiece;
    isSideA: boolean;
    constructor(piece: IConcretePiece, isSideA: boolean) {
        (this: IConcretePieceOnSide);
        this.piece   = piece;
        this.isSideA = isSideA;
    }
    switchSides(): IConcretePieceOnSide {
        return new PieceOnSide(this.piece, !this.isSideA);
    }
    switchSidesAndDemote(): IConcretePieceOnSide {
        return new PieceOnSide(this.piece.demote(), !this.isSideA);
    }
    toString(): string {
        let rv = this.piece.toString();
        if (this.isSideA)
            rv = rv.toUpperCase();
        return rv;
    }
    static fromString(pieceSet: Array<IConcretePiece>, s: string): IConcretePieceOnSide {
        const rvs: Array<PieceOnSide> = [];
        for (let piece: IConcretePiece of pieceSet) {
            if (piece.code===s)
                rvs.push ( new PieceOnSide(piece, false) );
            if (piece.code.toUpperCase()===s)
                rvs.push ( new PieceOnSide(piece, true) );
        }
        assert( (rvs.length===1) );
        assert  (rvs[0] instanceof PieceOnSide);
        return rvs[0];
    }
    promote(): IConcretePieceOnSide {
        return new PieceOnSide(this.piece.promote(), this.isSideA);
    }
    sameSide(o: IConcretePieceOnSide): boolean {
        return this.isSideA === o.isSideA;
    }
    equals(o: IConcretePieceOnSide): boolean {
        assert(o instanceof PieceOnSide); // this library is designed in such a way as this should never be called with an argument that's not a PieceOnSide
        return this.piece === o.piece && this.sameSide(o);
    }
}
exports.Piece       = Piece;
exports.PieceOnSide = PieceOnSide;
