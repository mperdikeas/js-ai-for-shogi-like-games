// @flow
'use strict';

(function() {
    const sourceMapSupport = require('source-map-support');
    sourceMapSupport.install();
})();

import _ from 'lodash';



class PieceSet {
    pieces: Map;
    isSealed: boolean;
    constructor() {
        this.pieces = new Map();
        this.isSealed = false;
    }
    add(piece: IConcretePiece): void {
        if (!this.isSealed) {
            if (this.pieces.has(piece.code))
                throw new Error('duplicate key: ${piece.code}');
            else
                this.pieces.set(piece.code, piece);
        } else throw new Error('set is sealed');
    }
    seal(): void {
        this.isSealed = true;
    }
    fromCode(code: string): ?IConcretePiece {
        return this.pieces.get(code);
    }
}

function createPieceSet(pieces: Array<IConcretePiece>): PieceSet {
    if (pieces.length===0)
        throw new Error('set needs at least one piece');
    const kings: Array<IConcretePiece> = _.filter(pieces, (x)=>x.isKing);
    if (kings.length!==1)
        throw new Error(`set needs to have exactly one King; it instead contains ${kings.length}`);
    const rv: PieceSet = new PieceSet();
    for (let piece: IConcretePiece of pieces)
        rv.add(piece);
    rv.seal();
    return rv;
}

exports.PieceSet       = PieceSet;
exports.createPieceSet = createPieceSet;



