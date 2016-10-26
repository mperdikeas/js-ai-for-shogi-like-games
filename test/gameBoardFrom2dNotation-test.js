'use strict'; 

import 'babel-polyfill';
const assert     = require('assert');
import _                  from 'lodash';
import equals             from 'array-equal';
import {PieceOnSide}      from '../src/piece.js';
import {Chick, Hen, Lion} from '../src/piece-set.js';
import {Elephant, Giraffe}from '../src/piece-set.js';
import {CaptureBag}       from '../src/captureBag.js';
import {createPieceSet}   from '../src/piece-set-factory.js';
import {GameBoard}        from '../src/board-lib.js';

describe('GameBoard', function() {
    describe('createFromFancy', function() {
        it('should work with some garbage bag', function() {
            const pieceSet = piecesSet();
            const notation = 'l@1~2 * c@1~0, l@2~0, c@0~1, e@1~1';
            const cb = new CaptureBag();
            cb.capture(new PieceOnSide(Chick, false));
            cb.capture(new PieceOnSide(Giraffe, true));        
            const gb = GameBoard.create(3, 3, false, 0, pieceSet, notation, cb);
            const notation2D = `
.cl
ce.
.L.
--
Cg
`.trim();
            assert.equal(gb.toStringFancy().trim(), notation2D);
            const gb2 = GameBoard.createFromFancy(notation2D, false, 0, pieceSet);
            assert.equal(gb2.toStringFancy(), notation2D);
        });
        it('should work with no garbage bag', function() {
            const pieceSet = piecesSet();
            const notation = 'l@1~2 * c@1~0, l@2~0, c@0~1, e@1~1';
            const gb = GameBoard.create(3, 3, false, 0, pieceSet, notation, null);
            const notation2D = `
.cl
ce.
.L.
--
`.trim();
            assert.equal(gb.toStringFancy().trim(), notation2D);
            const gb2 = GameBoard.createFromFancy(notation2D, false, 0, pieceSet);
            assert.equal(gb2.toStringFancy().trim(), notation2D);
        });
        it('should throw on malformed notations', function() {
            const pieceSet = piecesSet();
            const problematicNotation = `
.cl
ce..
.L.
--
`.trim();
            assert.throws( ()=> {
                GameBoard.createFromFancy(problematicNotation, false, 0, pieceSet);
            }, Error);
        });
    });
});


function piecesArray() {
    return [Chick, Hen, Elephant, Giraffe, Lion];
}

function piecesSet() {
    return createPieceSet(piecesArray());
}

function sampleCaptureBag() {
    const cb = new CaptureBag();
    cb.capture(new PieceOnSide(Chick, true));
    cb.capture(new PieceOnSide(Chick, false));
    cb.capture(new PieceOnSide(Hen, false));
    cb.capture(new PieceOnSide(Hen, true));
    cb.capture(new PieceOnSide(Lion, true));
    return cb;
}
