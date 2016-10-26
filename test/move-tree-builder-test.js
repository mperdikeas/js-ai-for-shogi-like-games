'use strict'; 

import 'babel-polyfill';
const assert     = require('assert');
import _ from 'lodash';

import {GameBoard}             from '../src/board-lib.js';
import {model000}              from '../src/eval-model-library.js';
import {moveTreeBuilder, sideThatMovesNext, evaluateLeaves, pullEvaluationsUp, bestMove, dynamicEvaluationOfBoard} from '../src/move-tree-builder.js';
import {boardA, boardB, boardTwoKings, boardTwoKings1x2, boardWithSideAKingCaptured, boardWithSideBKingCaptured, board1x2_withTwoKingsFacing, board3x2_withTwoKingsFacingAndOpportunisticTargets, board3x3_withTraps, board1x3_suicideForFirstMover, board1x4_victoryForFirstMover, board2x3_manoeuveringForStandoff, board3x3_victoryWithDrops} from './common-test-boards.js';
import {Side} from '../src/side.js';
import {Chick, Hen, Elephant, Giraffe, Lion} from '../src/piece-set.js';
import {Move, BoardMove} from '../src/moves.js';

import {piecesSet1AsArray, piecesSet1AsSet} from './common-piece-sets.js';


const PIECE_SET = [Chick, Hen, Elephant, Giraffe, Lion];

describe('moveTreeBuilder and sideThatMovesNext', function() {
    it('does not break', function() {
        this.timeout(4000);

        const boards = [boardA(true), boardA(false), boardB(false), boardTwoKings(true), boardTwoKings(false) , boardWithSideAKingCaptured(), boardWithSideBKingCaptured()];
        boards.forEach( board => {
            [1, 2].forEach( (n)=> {
                let tree = moveTreeBuilder(board, true, n);
                if (!tree.isLeaf())
                    assert.equal(sideThatMovesNext(tree), Side.A);
            });
        });
    });
    it('works on board with two kings and 1 next move with sideA moving', function() {
        const tree = moveTreeBuilder(boardTwoKings(), true, 1);
        assert.equal(sideThatMovesNext(tree), Side.A);
        const s = tree.print(false, (x)=>`\n${x.toStringFancy()}\n`);
        assert.equal(s.trim(),
                     `ROOT node #0 with value: 
l...
....
....
...L
--

node #0 ~~[(3~3)=>(3~2)]~~> node #1 with value: 
l...
....
...L
....
--

node #0 ~~[(3~3)=>(2~3)]~~> node #2 with value: 
l...
....
....
..L.
--

node #0 ~~[(3~3)=>(2~2)]~~> node #3 with value: 
l...
....
..L.
....
--`.trim());            

    });
    it('works on board with two kings and 1 next move with sideB moving', function() {
        const tree = moveTreeBuilder(boardTwoKings(), false, 1);
        assert.equal(sideThatMovesNext(tree), Side.B);        
        const s = tree.print(false, (x)=>`\n${x.toStringFancy()}\n`);
        assert.equal(s.trim(),
                     `ROOT node #0 with value: 
l...
....
....
...L
--

node #0 ~~[(0~0)=>(0~1)]~~> node #1 with value: 
....
l...
....
...L
--

node #0 ~~[(0~0)=>(1~0)]~~> node #2 with value: 
.l..
....
....
...L
--

node #0 ~~[(0~0)=>(1~1)]~~> node #3 with value: 
....
.l..
....
...L
--`.trim());            

    });
    it('works on board with two kings and 2 next move with sideA moving', function() {
        const tree = moveTreeBuilder(boardTwoKings(), true, 2);
        assert.equal(sideThatMovesNext(tree), Side.A);        
        const s = tree.print(false, (x)=>`\n${x.toStringFancy()}\n`);
        assert.equal(s.trim(),
                     `ROOT node #0 with value: 
l...
....
....
...L
--

node #0 ~~[(3~3)=>(3~2)]~~> node #1 with value: 
l...
....
...L
....
--

node #1 ~~[(0~0)=>(0~1)]~~> node #2 with value: 
....
l...
...L
....
--

node #1 ~~[(0~0)=>(1~0)]~~> node #3 with value: 
.l..
....
...L
....
--

node #1 ~~[(0~0)=>(1~1)]~~> node #4 with value: 
....
.l..
...L
....
--

node #0 ~~[(3~3)=>(2~3)]~~> node #5 with value: 
l...
....
....
..L.
--

node #5 ~~[(0~0)=>(0~1)]~~> node #6 with value: 
....
l...
....
..L.
--

node #5 ~~[(0~0)=>(1~0)]~~> node #7 with value: 
.l..
....
....
..L.
--

node #5 ~~[(0~0)=>(1~1)]~~> node #8 with value: 
....
.l..
....
..L.
--

node #0 ~~[(3~3)=>(2~2)]~~> node #9 with value: 
l...
....
..L.
....
--

node #9 ~~[(0~0)=>(0~1)]~~> node #10 with value: 
....
l...
..L.
....
--

node #9 ~~[(0~0)=>(1~0)]~~> node #11 with value: 
.l..
....
..L.
....
--

node #9 ~~[(0~0)=>(1~1)]~~> node #12 with value: 
....
.l..
..L.
....
--
`.trim());            

    });
    it('works on board with small board of two kings and 1 next move with sideA moving and recursion terminates no matter how many steps', function() {
        [1, 2, 3, 100].forEach( (n) => {
            const tree = moveTreeBuilder(boardTwoKings1x2(), true, 1);
            assert.equal(sideThatMovesNext(tree), Side.A);
            const s = tree.print(false, (x)=>`\n${x.toStringFancy()}\n`);
            assert.equal(s,
`ROOT node #0 with value: 
l
L
--

node #0 ~~[(0~1)=>(0~0)]~~> node #1 with value: 
L
.
--
L
`);
        });
    });
    it('works on board with small board of two kings and 1 next move with sideB moving and recursion terminates no matter how many steps', function() {
        [1,2,3,100].forEach( (n) => {
            const tree = moveTreeBuilder( boardTwoKings1x2(), false, 1);
            assert.equal(sideThatMovesNext(tree), Side.B);            
            const s = tree.print(false, (x)=>`\n${x.toStringFancy()}\n`);
            assert.equal(s,
`ROOT node #0 with value: 
l
L
--

node #0 ~~[(0~0)=>(0~1)]~~> node #1 with value: 
.
l
--
l
`);
        });
    });
});

describe('checks on whether Kings are on last line unchecked', function() {
    it('works on 3X3 board', function() {
        const notation2D = `
...
L..
..l
--`.trim();
        const gb = GameBoard.createFromFancy(notation2D, true, 1, piecesSet1AsSet());
        assert.equal(false, gb.kingIsOnLastLineUnchecked(true));
        assert.equal(true , gb.kingIsOnLastLineUnchecked(false));
    });
});

describe('new batch of tests on moveTreeBuilder', function() {
    it('works on 3X3 board with two kings who can win by reaching the end', function() {
        const notation2D = `
...
L.l
...
--`.trim();
        const gb = GameBoard.createFromFancy(notation2D, true, 1, piecesSet1AsSet());
        assert.equal(gb.toStringFancy().trim(), notation2D);
        const tree = moveTreeBuilder( gb, false, 3);
        assert.equal(sideThatMovesNext(tree), Side.B);
        if (false) {
            const s = tree.print(false, (x)=>`\n${x.toStringFancy()}\n`);
            console.log(s);
        }
    });
});



describe('evaluateLeaves', function() {
    it('does not break', function() {
        this.timeout(20000);
        const boards = [boardA(true), boardA(false), boardB(false), boardTwoKings(true), boardTwoKings(false) , boardWithSideAKingCaptured(), boardWithSideBKingCaptured()];
        boards.forEach( board => {
            [1, 2].forEach( (n)=> {
                [true, false].forEach ( (sideA) => {
                    let tree = moveTreeBuilder(board, sideA, n);
                if (!tree.isLeaf()) {
                    evaluateLeaves(tree, model000);
                }
                });
            });
        });
    });
});


describe('evaluateLeaves and pullEvaluationsUp', function() {
    it('does not break', function() {
        this.timeout(100000);
        const boards = [boardA(true), boardWithSideBKingCaptured(), boardWithSideAKingCaptured(), boardTwoKings(false), boardTwoKings(true), boardB(false)];        
        boards.forEach( board => {
            [1,2].forEach( (n)=> {
                [true, false].forEach ( (sideA) => {
                    let tree = moveTreeBuilder(board, sideA, n);
                    if (!tree.isLeaf()) {
                    evaluateLeaves(tree, model000);
//                    console.log(tree.print(true));
                    pullEvaluationsUp(sideA, tree);
//                    console.log(tree.print(true));                    
                    }
                });
            });
        });
    });
});


describe('bestMove', function() {
    it('does not break', function() {
        this.timeout(100000);
        const boards = [boardA(true), boardTwoKings(false), boardTwoKings(true), boardB(false)];        
        boards.forEach( board => {
            [1,2].forEach( (depth)=> {
                [true, false].forEach ( (sideA) => {
                    let move = bestMove(board, sideA, depth, model000, PIECE_SET);
                });
            });
        });
    });
    it('selects the right one - scenario 1x2 board two kings facing each other, first mover wins', function() {
        const board = board1x2_withTwoKingsFacing();
        [1,2,3,40].forEach( (depth) => {
            let move = bestMove(board, true, depth, model000, PIECE_SET);
            assert.equal(move.toString(), '(0~1)=>(0~0)');
        });
        [1,2,3,40].forEach( (depth) => {
            let move = bestMove(board, false, depth, model000, PIECE_SET);
            assert.equal(move.toString(), '(0~0)=>(0~1)');
        });
        [1,2,3,40].forEach( (depth) => {
            [true, false].forEach( (sideAMoves) => {
                let evaluation: number = dynamicEvaluationOfBoard(board, sideAMoves, depth, model000, PIECE_SET);
                assert.equal(evaluation, sideAMoves?Infinity:-Infinity);
            });
        });                
    });
    it('selects the right one - scenario 1x3 board defeat for first mover', function() {
        const board = board1x3_suicideForFirstMover();
        [1,2,3,40].forEach( (depth) => {
            [true, false].forEach( (sideAMoves) => {
                let evaluation: number = dynamicEvaluationOfBoard(board, sideAMoves, depth, model000, PIECE_SET);
                if (depth>=2) // the suicidal nature of the board becomes evident only at depth >= 2
                    assert.equal(evaluation, sideAMoves?-Infinity:Infinity); // whichever sides moves first loses
                else
                    assert(![-Infinity, Infinity].includes(evaluation));
            });
        });
    });
    it('selects the right one - scenario 1x4 board victory for first mover', function() {
        const board = board1x4_victoryForFirstMover();
        [1,2,3,40].forEach( (depth) => {
            [true, false].forEach( (sideAMoves) => {
                let evaluation: number = dynamicEvaluationOfBoard(board, sideAMoves, depth, model000, PIECE_SET);
                if (depth>=3) // the forced win nature of the board only becomes evident at depth >= 3
                    assert.equal(evaluation, sideAMoves?Infinity:-Infinity); // whichever sides moves first wins
                else
                    assert(![-Infinity, Infinity].includes(evaluation));
            });
        });
    });
    it('selects the right one - scenario 2x3 board that requires positional manoeuvering', function() {
        const board = board2x3_manoeuveringForStandoff();
        [2,3,4].forEach( (depth) => {
            [true, false].forEach( (sideAMove) => {
                let move = bestMove(board, sideAMove, depth, model000, PIECE_SET);
                assert.equal(move.toString(), sideAMove?'(0~2)=>(1~2)':'(0~0)=>(1~0)');
            });
        });
    });
    it('selects the right one - scenario 2x3 board that requires positional manoeuvering results in infinite manoeuvering', function() {
        let board: GameBoard = board2x3_manoeuveringForStandoff();
        let sideAMove: boolean = true;
        const moveLoop: Array<string> = ['(0~2)=>(1~2)','(0~0)=>(1~0)', '(1~2)=>(0~2)', '(1~0)=>(0~0)'];
        for (let i = 0 ; i < 100; i++) {
            const minimumRequiredDepth = 2;
            let move: Move = bestMove(board, sideAMove, minimumRequiredDepth, model000, PIECE_SET);
            assert.equal(move.toString(), moveLoop[i % moveLoop.length]);
            assert(move instanceof BoardMove);
            board = board.move(move.vector.from, move.vector.to);
            sideAMove=!sideAMove;
        }
    });
    it('selects the right one - scenario two kings with opportunistic targets', function() {
        const board = board3x2_withTwoKingsFacingAndOpportunisticTargets();
            [1,2,3,4].forEach( (depth) => {
                let move = bestMove(board, true, depth, model000, PIECE_SET);
                assert(['(0~1)=>(1~0)', '(1~1)=>(1~0)'].includes(move.toString()));
        });
        [1,2,3,4].forEach( (depth) => {
            let move = bestMove(board, false, depth, model000, PIECE_SET);
            assert(['(0~0)=>(1~1)', '(1~0)=>(1~1)'].includes(move.toString()));
        });        
    });
    it('selects the right one - traps', function() {
        const board = board3x3_withTraps();
        let move = bestMove(board, false, 1, model000, PIECE_SET);
        assert.equal(move.toString(), '(1~0)=>(2~1)');
        move = bestMove(board, false, 2, model000, PIECE_SET);
        assert.equal(move.toString(), '(1~0)=>(0~0)');
        [1,2,3,4].forEach( (depth) => {
            move = bestMove(board, true, 2, model000, PIECE_SET);
            assert.equal(move.toString(), '(0~1)=>(1~0)');            
        });
    });
    it(`selects the right one - with drops`, function() {
        this.timeout(10000);        
        const board = board3x3_victoryWithDrops();
        let move = bestMove(board, true, 1, model000, PIECE_SET);
        assert.equal(move.toString(), 'C=>2~1');
        move = bestMove(board, false, 1, model000, PIECE_SET);
        assert(move.toString()==='g=>2~2' || move.toString()==='g=>~2');
    });
});
