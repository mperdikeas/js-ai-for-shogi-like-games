'use strict'; 

import 'babel-polyfill';
const assert     = require('assert');
import _                  from 'lodash';
import {PieceOnSide}      from '../src/piece.js';
import {Chick, Hen, Lion} from '../src/piece-set.js';
import {Elephant, Giraffe}from '../src/piece-set.js';
import {createPieceSet}   from '../src/piece-set-factory.js';
import {GameBoard}        from '../src/board-lib.js';
import {bestMove}         from '../src/move-tree-builder.js';
import {model000}         from '../src/eval-model-library.js';
import {piecesSet1AsArray, piecesSet1AsSet} from './common-piece-sets.js';

describe('AI', function() {
    describe('should not be dumb', function() {
        if (false)
        it('should work on pos #0', function() {
            const pieceSet = piecesSet1AsSet();
            const notation2D = `
...
L.l
...
--`.trim();
            const gb = GameBoard.createFromFancy(notation2D, true, 1, pieceSet);
            assert.equal(gb.toStringFancy().trim(), notation2D);
            const next = bestMove(gb, false, 3, model000, piecesSet1AsArray());
            console.log(next.toString());
        });        
        it('should work on pos #10', function() {
            const pieceSet = piecesSet1AsSet();
            const notation2D = `
...
e..
..e
L.l
...
--`.trim();
            const gb = GameBoard.createFromFancy(notation2D, true, 1, pieceSet);
            assert.equal(gb.toStringFancy().trim(), notation2D);
            const next = bestMove(gb, false, 3, model000, piecesSet1AsArray());
            console.log(next.toString());
        });
    });
});


