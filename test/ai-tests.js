'use strict'; 

import 'babel-polyfill';
const assert     = require('assert');
import _                            from 'lodash';
import {PieceOnSide}                from '../src/piece.js';
import {Chick, Hen, Lion}           from '../src/piece-set.js';
import {Elephant, Giraffe}          from '../src/piece-set.js';
import {createPieceSet}             from '../src/piece-set-factory.js';
import {GameBoard}                  from '../src/board-lib.js';
import {bestMove}                   from '../src/move-tree-builder.js';
import {moveTreeBuilder}            from '../src/move-tree-builder.js';
import {sideThatMovesNext}          from '../src/move-tree-builder.js';
import {dynamicEvaluationOfBoard}   from '../src/move-tree-builder.js';
import {model000}                   from '../src/eval-model-library.js';
import {piecesSet1AsArray}          from './common-piece-sets.js';
import {piecesSet1AsSet}            from './common-piece-sets.js';
import {Side}                       from '../src/side.js';

describe('AI', function() {
    describe('should not be dumb', function() {
        it('should work on pos #0', function() {
            const pieceSet = piecesSet1AsSet();
            const notation2D = `
...
L.l
...
--`.trim();
            const gb = GameBoard.createFromFancy(notation2D, true, 1, pieceSet);
            assert.equal(gb.toStringFancy().trim(), notation2D);

            [1,2,3].forEach( (n)=> {
                const next = bestMove(gb, false, n, model000, piecesSet1AsArray());
                assert.equal(next, '(2~1)=>(2~2)');
            });
            [1,2,3].forEach( (n)=> {
                const next = bestMove(gb, true, n, model000, piecesSet1AsArray());
                assert.equal(next, '(0~1)=>(0~0)');
            });        
            
        });
        it('should work on pos #10 - preparatory', function() {
            const pieceSet = piecesSet1AsSet();
            const notation2D = `
...
e..
..e
L..
..l
--`.trim();
            const gb = GameBoard.createFromFancy(notation2D, true, 1, pieceSet);
            assert(gb.boardImmediateWinSide() != null);
            assert.equal(gb.boardImmediateWinSide(), false);
        });
        it('should work on pos #10', function() {
            this.timeout(10000);
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
            [1,2,3,4].forEach( (n) => {
                const next = bestMove(gb, false, n, model000, piecesSet1AsArray());
                assert.equal(next.toString(), '(2~3)=>(2~4)');
            });
        });
        it('should work on pos #20', function() {
            this.timeout(10000);
            const pieceSet = piecesSet1AsSet();
            const notation2D = `
.l.
...
.GL
--
c`.trim();
            const gb = GameBoard.createFromFancy(notation2D, true, 1, pieceSet);
            assert.equal(gb.toStringFancy().trim(), notation2D);
            [3].forEach( (n) => {
                const next = bestMove(gb, false, n, model000, piecesSet1AsArray());
                assert.equal(next.toString(), 'c=>2~1');
            });
        });
    it('should work on pos #25', function() {
        this.timeout(10000);
        const pieceSet = piecesSet1AsSet();
        const notation2D = `
.l
.L
G.
--`.trim();
        const gb = GameBoard.createFromFancy(notation2D, true, 1, pieceSet);
        assert.equal(gb.toStringFancy().trim(), notation2D);
        let value = dynamicEvaluationOfBoard(gb, false, 1, model000, piecesSet1AsArray());
        assert.equal(-Infinity, value);
        value = dynamicEvaluationOfBoard(gb, true, 1, model000, piecesSet1AsArray());
        assert.equal(Infinity, value);
        let next = bestMove(gb, true, 1, model000, piecesSet1AsArray());
        assert.equal(next.toString(), '(1~1)=>(1~0)');        
    });
    it('should work on pos #30', function() {
        this.timeout(10000);
        const pieceSet = piecesSet1AsSet();
        const notation2D = `
.l
..
GL
--`.trim();
        const gb = GameBoard.createFromFancy(notation2D, true, 1, pieceSet);
        assert.equal(gb.toStringFancy().trim(), notation2D);
        const tree = moveTreeBuilder( gb, true, 3);
        assert.equal(sideThatMovesNext(tree), Side.A);
        const s = tree.print(false, (x)=>`\n${x.toStringFancy()}\n`);
        if (false) console.log(s);
        [2,3,4,5].forEach( (n) => {
            const next = bestMove(gb, true, n, model000, piecesSet1AsArray());
            assert.equal(next.toString(), '(0~2)=>(0~1)');
        });
    });
    });
    it('should work on pos #40', function() {
        this.timeout(10000);
        const pieceSet = piecesSet1AsSet();
        const notation2D = `
...l
....
..GL
--`.trim();
        const gb = GameBoard.createFromFancy(notation2D, true, 1, pieceSet);
        assert.equal(gb.toStringFancy().trim(), notation2D);
        const tree = moveTreeBuilder( gb, true, 3);
        assert.equal(sideThatMovesNext(tree), Side.A);
        const s = tree.print(false, (x)=>`\n${x.toStringFancy()}\n`);
        if (false) console.log(s);
        [3,4,5].forEach( (n) => { // for 2 it is not working presumably because it gives bonus to the fact that the giraffe is not under attack when it moves sideways (which is the chosen move for depth 2)
            const next = bestMove(gb, true, n, model000, piecesSet1AsArray());
            assert.equal(next.toString(), '(2~2)=>(2~1)');
        });
    });    
});
