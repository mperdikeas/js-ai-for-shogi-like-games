'use strict'; 

import 'babel-polyfill';
const assert     = require('assert');
import _ from 'lodash';

import {Point, Vector}                       from 'geometry-2d';
import {Piece, PieceSet, GameBoard}          from '../src/board-lib.js';
import {Chick, Hen, Elephant, Giraffe, Lion} from '../src/piece-set.js';
import {createPieceSet}                      from '../src/piece-set-factory.js';
import {PieceOnSide}                         from '../src/piece.js';
import {CaptureBag}                          from '../src/captureBag.js';
import {model000}                            from '../src/eval-model-library.js';

import {boardA, boardB, boardTwoKings, boardWithSideAKingCaptured, boardWithSideBKingCaptured, board3x3_withPromotionZone} from './common-test-boards.js';



describe('Number.prototype.between', function() {
    it('should work', function() {
        assert( Number(3).between(3, 4));
        assert(!Number(3).between(3, 3));
        assert( Number(4).between(3, 30));
        assert(!Number(1).between(3, 30));
    });
});

describe('Point', function () {
    describe('constructor', function () {
        it('should work', function () {
            const p = new Point(1,3);
            const expected = new Point(1,3);
            assert(_.isEqual(p, expected));
            assert(p.equals(expected));
            assert(expected.equals(p));
           });     
    });
    describe('reflectionInGrid', function() {
        const sixPacks = [ [0,0,1,1,0,0], [0,0,1,2,0,1], [0,0,1,3,0,2], [1,0,2,1,0,0]
                           , [1,0,2,2,0,1],[1,0,2,3,0,2], [2,3,3,4,0,0], [1,4,2,5,0,0]
                           , [1,4,2,6,0,1],[1,4,5,6,3,1], [1,4,6,6,4,1] ];
        it('should work', function() {
            for (let [a,b,c,d,e,f,g] of sixPacks) {
                const p = new Point(a,b);
                const p2 = p.reflectionInGrid(c,d);
                assert(p2.equals(new Point(e,f)));
            }
        });
    });
});

describe('Piece', function() {
    if (false) // new.target not yet supported by Flow and Babel
    it('is not directly instantiatable', function() {
        assert.throws( ()=>{
            new Piece('foo', true);
        });
    });
});


describe('PieceSet', function () {
    describe('fromCode', function () {
        it('should work'
           , function () {
               const pieceSet = createPieceSet([Chick, Hen, Lion]);
               assert.equal(pieceSet.fromCode('c'), Chick);
               assert.equal(pieceSet.fromCode('h'), Hen);
           });     
    });
});

describe('GameBoard', function () {
    describe('constructor', function () {
        it('should work on the absolutely minimal grid possible'
           , function () {
               const pieceSet = createPieceSet([Lion]);
               const ss = ['l@0~1 * l@0~0', 'l@0~0 * l@0~1'];
               for (let s of ss) {
                   const gb = GameBoard.create(1, 2, true, 0, pieceSet, s);
               }
           });
        it('should fail as expected on the absolutely minimal grid possible'
           , function () {
               const pieceSet = createPieceSet([Hen, Lion]);
               const ss = ['l@1~1 * l@0~0', 'l@1~0 * l@0~1', 'l@1~0 * h@0~1', 'h@1~0 * l@0~1', 'h@1~0 * l@1~0', 'l@0~0*l@0~0', 'l@0~1*l@0~1'];
               for (let s of ss) {
                   assert.throws( () => {
                       GameBoard.create(1, 2, true, 0, pieceSet, s);
                   });
               }
           });                     
        it('should work on a 2x2 gril'
           , function () {
               const ss = ['h@1~1, l@0~0 * h@0~1, l@1~0',
                           'l@1~1, c@0~0, c@1~0 * l@0~1'
                          ];
               const pieceSet = createPieceSet([Chick, Hen, Lion]);
               for (let s of ss) {
                   GameBoard.create(2, 2, true, 0, pieceSet, s);
               }

           });     
    });
    describe('toString', function () {
        it('should work on the absolutely minimal grid possible'
           , function () {
               const pieceSet = createPieceSet([Lion]);
               const gb = GameBoard.create(1, 2, true, 0, pieceSet, 'l@0~0 * l@0~1');
               assert.equal(gb.toString(), '[L@0~0, l@0~1] * []');
           });
    });
    describe('toStringFancy', function () {
        it('should work on the absolutely minimal grid possible'
           , function () {
               const pieceSet = createPieceSet([Lion]);
               const gb = GameBoard.create(1, 2, true, 0, pieceSet, 'l@0~1 * l@0~0');
               assert.equal(gb.toStringFancy(),
`l
L
--
`);
           });
        it('should work on a 2x2 grid'
           , function () {
               const pieceSet = createPieceSet([Hen, Chick, Lion]);
               const gb = GameBoard.create(2, 2, true, 0, pieceSet, 'l@0~1, c@1~1, h@1~0 * l@0~0');

               assert.equal(gb.toStringFancy(),
`lH
LC
--
`);
           });        
    });

    describe('kingIsCaptured', function() {
        it('should work in the negative case', function() {
            const boards = [boardA(), boardB(), boardTwoKings()];
            for (let board of boards) {
                assert(!board.kingIsCaptured(true));
                assert(!board.kingIsCaptured(false));
            }
        });
        it('should work for captured king on side A', function() {
            const boards = [boardWithSideAKingCaptured()];
            for (let board of boards) {
                assert( board.kingIsCaptured(true));
                assert(!board.kingIsCaptured(false));
            }
        });
        it('should work for captured king on side B', function() {
            const boards = [boardWithSideBKingCaptured()];
            for (let board of boards) {
                assert(!board.kingIsCaptured(true));
                assert( board.kingIsCaptured(false));
            }
        });        
    });

    describe('boardImmediateWinSide', function()  {
        it ('should work in the null case', function() {
            const boards = [boardA(), boardTwoKings()];
            for (let board of boards) {
                assert(board.boardImmediateWinSide()===null);
            }
        });
        it ('should correctly throw an exception if both kings are on the last line unchecked', function() {
            assert.throws( ()=> {
                const gb = boardB();
                gb.boardImmediateWinSide();
            }, /^Error: GB:BKULL/);
        });
        it('should work for captured kings', function() {
            const tests = [{board: boardWithSideAKingCaptured(), sideAWinning: false}, {board: boardWithSideBKingCaptured(), sideAWinning: true}];
            for (let test of tests) {
                assert(test.board.boardImmediateWinSide()===test.sideAWinning);
            }
        });
    });
   

    describe('capturing', function () {
        it('should work on a 2x2 grid'
           , function () {
               const pieceSet = createPieceSet([Hen, Chick, Lion]);
               const gb1 = GameBoard.create(2, 2, true, 0, pieceSet, 'l@0~1, c@1~1, h@1~0 * l@0~0');
               const STATE_1 =
`lH
LC
--
`;                         
               assert.equal(gb1.toStringFancy(), STATE_1);

               let gb2 = gb1.clone();
               assert(gb2.equals(gb1));
               assert(gb1.equals(gb2));
               assert.equal(gb2.toStringFancy(), STATE_1);
               gb2 =  gb1.move(new Point(0, 0), new Point(1, 0));
               assert(!gb2.equals(gb1));
               assert(!gb1.equals(gb2));               
               const STATE_2 =
`.l
LC
--
c`;
               assert.equal(gb2.toStringFancy(), STATE_2);
               const gb3 = gb2.move(new Point(0, 1), new Point(0, 0));
               const STATE_3 =
`Ll
.C
--
c`;
               assert.equal(gb3.toStringFancy(), STATE_3);
               const gb4 = gb3.move(new Point(0, 0), new Point(1, 0));
               const STATE_4 =
`.L
.C
--
Lc`;
               assert.equal(gb4.toStringFancy(), STATE_4);
               assert.equal(gb3.toStringFancy(), STATE_3);
               assert.equal(gb2.toStringFancy(), STATE_2);
               assert.equal(gb1.toStringFancy(), STATE_1);
           });        
    });

    describe('moving with promotion', function () {
        it('should work'
           , function () {
               const pieceSet = createPieceSet([Hen, Chick, Lion]);
               const gb1 = GameBoard.create(3, 3, true, 1, pieceSet, 'l@1~0, c@0~1 * l@0~0, c@2~1');
               const STATE_1 =
`
lL.
C.c
...
--`.trim();
               assert.equal(gb1.toStringFancy().trim(), STATE_1);

               let gb2 = gb1.move(new Point(0, 1), new Point(0, 0));
               const STATE_2 =
`
HL.
..c
...
--
L`.trim();
               assert.equal(gb2.toStringFancy().trim(), STATE_2);

               let gb3 = gb2.move(new Point(2, 1), new Point(2, 2));
               const STATE_3 =
`
HL.
...
..h
--
L`.trim();
               assert.equal(gb3.toStringFancy().trim(), STATE_3);
           });

    });    
    describe('dropping', function () {
        it('should work or fail in expected ways on a 2x2 grid'
           , function () {
               const pieceSet = createPieceSet([Hen, Chick, Lion]);
               const gb1 = GameBoard.create(2, 2, true, 0, pieceSet, 'l@0~1, c@1~1, h@1~0 * l@0~0');
               const STATE_1 =
`lH
LC
--
`;                         
               assert.equal(gb1.toStringFancy(), STATE_1);

               const gb2 = gb1.move(new Point(0, 0), new Point(1, 0));
               const STATE_2 =
`.l
LC
--
c`;
               assert.equal(gb2.toStringFancy(), STATE_2);

               assert.throws( ()=> {
                   gb2.drop(PieceOnSide(Chick, true), new Point(0, 0));
               });
               assert.throws( ()=> {
                   gb2.drop(PieceOnSide(Hen, false), new Point(0, 0));
               });               
               const pos = new PieceOnSide(Chick, false); // piece on side               
               assert.equal(null, gb2.drop(pos, new Point(0, 1)));
               assert.equal(null, gb2.drop(pos, new Point(1, 0)));
               assert.equal(null, gb2.drop(pos, new Point(1, 1)));               
               const gb3 = gb2.drop(pos, new Point(0, 0));
               const STATE_3 =
`cl
LC
--
`;
               assert.equal(gb3.toStringFancy(), STATE_3);
           });
        it('no drops allowed in promotion zone', function() {
            const board = board3x3_withPromotionZone();
            const forbiddenDrops = [ [new PieceOnSide(Chick   ,  true), new Point(0,0)],
                                     [new PieceOnSide(Chick   ,  true), new Point(1,0)],
                                     [new PieceOnSide(Elephant,  true), new Point(0,0)],
                                     [new PieceOnSide(Elephant,  true), new Point(1,0)],
                                     [new PieceOnSide(Chick   , false), new Point(0,2)],
                                     [new PieceOnSide(Chick   , false), new Point(1,2)],
                                     [new PieceOnSide(Elephant, false), new Point(0,2)],
                                     [new PieceOnSide(Elephant, false), new Point(1,2)]                                                                          
                                   ];
            forbiddenDrops.forEach( ([piece, point])=>{
                let nextBoard = board.drop( piece, point );
                assert.equal(nextBoard, null);
            });
        });
    });
    describe('reflection', function () {
        it('should work'
           , function () {
               const pieceSet = createPieceSet([Hen, Chick, Lion]);
               const gb1 = GameBoard.create(2, 2, true, 0, pieceSet, 'l@0~1, c@1~1, h@1~0 * l@0~0');
               const STATE_1 =
`lH
LC
--
`;                         
               assert.equal(gb1.toStringFancy(), STATE_1);
               const gb2 = gb1.reflection();
               const STATE_2 =
`cl
hL
--
`;
               assert.equal(gb2.toStringFancy(), STATE_2);
               const gb3 = gb2.move(new Point(1,1), new Point(0,0));
               const STATE_3 =
`Ll
h.
--
C`;
               assert.equal(gb3.toStringFancy(), STATE_3);
               const gb4 = gb3.reflection();
               const STATE_4 =
`.H
Ll
--
c`;
               assert.equal(gb4.toStringFancy(), STATE_4);
           });
    });

    describe('nextStatesByMovingPieceOnAParticularSquare', function() {
        describe('invocation #1', function() {
            const pieceSet = createPieceSet([Lion]);
            const gb = GameBoard.create(2, 2, true, 0, pieceSet, 'l@0~1 * l@0~0');
            assert.equal(gb.toStringFancy(),
`l.
L.
--
`);   
            it('should throw on bad arguments - no piece', function () {
                assert.throws(()=>{gb.nextStatesByMovingPieceOnAParticularSquare(new Point(1,0));}, /^AssertionError: B-NSBMP-CNP/);
                assert.throws(()=>{gb.nextStatesByMovingPieceOnAParticularSquare(new Point(1,1));}, /^AssertionError: B-NSBMP-CNP/);
            });
        });
        describe('invocation #2', function() {
            const pieceSet = createPieceSet([Hen, Lion]);
            const gb = GameBoard.create(2, 2, true, 0, pieceSet, 'l@0~1, h@1~1 * h@0~0, l@1~0');
            assert.equal(gb.toStringFancy(),
`hl
LH
--
`);
            it('should move correctly #1', function() {
                const newStates = gb.nextStatesByMovingPieceOnAParticularSquare(new Point(0,1));
                const EXPECTED =
`Ll  I  hL
.H  I  .H
--  I  --
C  I  L`;
                assert.equal(GameBoard.toStringFancyBoardsOnly(newStates), EXPECTED);
            });
            it('should move correctly #2', function() {
                const newStates = gb.nextStatesByMovingPieceOnAParticularSquare(new Point(1,0));
                const EXPECTED =
`h.  I  h.
Ll  I  lH
--  I  --
c  I  l`;
                assert.equal(GameBoard.toStringFancyBoardsOnly(newStates), EXPECTED);
            });            
        });
    });

    describe('nextStates - without drops', function() {
        describe('invocation #1', function() {
            const pieceSet = createPieceSet([Lion]);
            const gb = GameBoard.create(2, 2, true, 0, pieceSet, 'l@0~1 * l@0~0');
            assert.equal(gb.toStringFancy(),
`l.
L.
--
`);   
            it('should move correctly sideA', function() {
                const newStates  = gb.nextStatesByMovingPieceOnAParticularSquare(new Point(0,1));
                const newStates2 = gb.nextStates(true); // should be the same in this particular case
                const EXPECTED =
`L.  I  lL  I  l.
..  I  ..  I  .L
--  I  --  I  --
L  I    I  `;

                assert.equal(GameBoard.toStringFancyBoardsOnly(newStates ), EXPECTED);
                assert.equal(GameBoard.toStringFancyBoardsOnly(newStates2), EXPECTED);
                const EXPECTED_MOVES = '[(0~1)=>(0~0), (0~1)=>(1~0), (0~1)=>(1~1)]';
                assert.equal(GameBoard.toStringFancyMovesOnly(newStates ), EXPECTED_MOVES);
                assert.equal(GameBoard.toStringFancyMovesOnly(newStates2), EXPECTED_MOVES);                
            });
            it('should move correctly sideB', function() {
                const newStates  = gb.nextStatesByMovingPieceOnAParticularSquare(new Point(0,0));
                const newStates2 = gb.nextStates(false);
                const EXPECTED =
`..  I  .l  I  ..
l.  I  L.  I  Ll
--  I  --  I  --
l  I    I  `;

                assert.equal(GameBoard.toStringFancyBoardsOnly(newStates ), EXPECTED);
                assert.equal(GameBoard.toStringFancyBoardsOnly(newStates2), EXPECTED);
                const EXPECTED_MOVES = '[(0~0)=>(0~1), (0~0)=>(1~0), (0~0)=>(1~1)]';
                assert.equal(GameBoard.toStringFancyMovesOnly(newStates ), EXPECTED_MOVES);
                assert.equal(GameBoard.toStringFancyMovesOnly(newStates2), EXPECTED_MOVES);
            });            
        });
        describe('invocation #2', function() {
            const pieceSet = createPieceSet([Hen, Lion]);
            const gb = GameBoard.create(2, 2, true, 0, pieceSet, 'l@0~1, h@1~1 * h@0~0, l@1~0');
            assert.equal(gb.toStringFancy(),
`hl
LH
--
`);
            it('should move correctly', function() {
                const newStates = gb.nextStates(true);
                const EXPECTED =
`Ll  I  hL  I  hH  I  Hl
.H  I  .H  I  L.  I  L.
--  I  --  I  --  I  --
C  I  L  I  L  I  C`;
                assert.equal(GameBoard.toStringFancyBoardsOnly(newStates), EXPECTED);
            });
        });
    });


    describe('nextStates - *with* drops', function() {
        describe('invocation', function() {
            const pieceSet = createPieceSet([Chick, Hen, Elephant, Lion]);
            it('should work with only single capture per side - sideA', function() {
                const cb = new CaptureBag();
                cb.capture(new PieceOnSide(Chick, true));
                cb.capture(new PieceOnSide(Chick, false));            
                const gb = GameBoard.create(2, 2, true, 0, pieceSet, 'l@1~0 * l@0~1', cb);
                assert.equal(gb.toStringFancy(),
`.L
l.
--
Cc`);

                
                const newStates = gb.nextStates(true);
                const EXPECTED =
`..  I  ..  I  L.  I  CL  I  .L
lL  I  L.  I  l.  I  l.  I  lC
--  I  --  I  --  I  --  I  --
Cc  I  CLc  I  Cc  I  c  I  c`;
                
                assert.equal(GameBoard.toStringFancyBoardsOnly(newStates), EXPECTED);
                const EXPECTED_MOVES= '[(1~0)=>(1~1), (1~0)=>(0~1), (1~0)=>(0~0), C=>0~0, C=>1~1]';
                assert.equal(GameBoard.toStringFancyMovesOnly(newStates), EXPECTED_MOVES);
            });
            it('should work with only single capture per side - sideB', function() {
                const cb = new CaptureBag();
                cb.capture(new PieceOnSide(Chick, true));
                cb.capture(new PieceOnSide(Chick, false));            
                const gb = GameBoard.create(2, 2, true, 0, pieceSet, 'l@1~0 * l@0~1', cb);
                assert.equal(gb.toStringFancy(),
`.L
l.
--
Cc`);

                
                const newStates = gb.nextStates(false);
                const EXPECTED =
`
lL  I  .l  I  .L  I  cL  I  .L
..  I  ..  I  .l  I  l.  I  lc
--  I  --  I  --  I  --  I  --
Cc  I  Ccl  I  Cc  I  C  I  C`.trim();
                
                assert.equal(GameBoard.toStringFancyBoardsOnly(newStates), EXPECTED);
                const EXPECTED_MOVES= '[(0~1)=>(0~0), (0~1)=>(1~0), (0~1)=>(1~1), c=>0~0, c=>1~1]';
                assert.equal(GameBoard.toStringFancyMovesOnly(newStates), EXPECTED_MOVES);
            });            
            it('should work with only two captures per side -side A', function() {
                const cb = new CaptureBag();
                cb.capture(new PieceOnSide(Chick, false));
                cb.capture(new PieceOnSide(Elephant, false));
                const gb = GameBoard.create(2, 2, true, 0, pieceSet, 'l@1~0 * l@0~1', cb);
                assert.equal(gb.toStringFancy(),
`.L
l.
--
CE`);

                const newStates = gb.nextStates(true);
                const EXPECTED =
`..  I  ..  I  L.  I  CL  I  .L  I  EL  I  .L
lL  I  L.  I  l.  I  l.  I  lC  I  l.  I  lE
--  I  --  I  --  I  --  I  --  I  --  I  --
CE  I  CEL  I  CE  I  E  I  E  I  C  I  C`;
                assert.equal(GameBoard.toStringFancyBoardsOnly(newStates), EXPECTED);
                const EXPECTED_MOVES = '[(1~0)=>(1~1), (1~0)=>(0~1), (1~0)=>(0~0), C=>0~0, C=>1~1, E=>0~0, E=>1~1]';
                assert.equal(GameBoard.toStringFancyMovesOnly(newStates), EXPECTED_MOVES);
            });            

            it('should work with only two captures per side -side B', function() {
                const cb = new CaptureBag();
                cb.capture(new PieceOnSide(Chick, true));
                cb.capture(new PieceOnSide(Elephant, true));
                const gb = GameBoard.create(2, 2, true, 0, pieceSet, 'l@1~0 * l@0~1', cb);
                assert.equal(gb.toStringFancy(),
`.L
l.
--
ce`);
                const newStates = gb.nextStates(false);
                const EXPECTED =
`
lL  I  .l  I  .L  I  cL  I  .L  I  eL  I  .L
..  I  ..  I  .l  I  l.  I  lc  I  l.  I  le
--  I  --  I  --  I  --  I  --  I  --  I  --
ce  I  cel  I  ce  I  e  I  e  I  c  I  c`.trim();


                assert.equal(GameBoard.toStringFancyBoardsOnly(newStates), EXPECTED);
                const EXPECTED_MOVES = '[(0~1)=>(0~0), (0~1)=>(1~0), (0~1)=>(1~1), c=>0~0, c=>1~1, e=>0~0, e=>1~1]';
                assert.equal(GameBoard.toStringFancyMovesOnly(newStates), EXPECTED_MOVES);
            });
        });            
    });
    describe('isPromotionTriggered', function () {
        describe('setting #1', function () {
            const pieceSet = createPieceSet([Chick, Hen, Lion]);
            const notation = 'c@0~0, l@1~0 * l@0~1, c@1~1';
            it('should work #1', function() {
                const gb = GameBoard.create(2, 2, true, 0, pieceSet, notation);
                assert.equal(gb.toStringFancy(),
`CL
lc
--
`);
                const allPoints = [new Point(0,0), new Point(0,1), new Point(1,0), new Point(1,1)];
                for (let i = 0 ; i < allPoints.length ; i++) {
                    for (let j = 0 ; j < allPoints.length ; j++) {
                        const p1: Point = allPoints[i];
                        const p2: Point = allPoints[j];
                        if (!p1.equals(p2))
                            assert(!gb.isPromotionTriggered(p1, p2));
                    }
                }
            });
            it('should work #2', function() {
                const gb = GameBoard.create(2, 2, true, 1, pieceSet, notation);
                assert.equal(gb.toStringFancy(),
`CL
lc
--
`);
                const allPoints = [new Point(0,0), new Point(0,1), new Point(1,0), new Point(1,1)];                
                for (let i = 0 ; i < allPoints.length ; i++) {
                    for (let j = 0 ; j < allPoints.length ; j++) {
                        const p1: Point = allPoints[i];
                        const p2: Point = allPoints[j];
                        if (!p1.equals(p2))
                            assert(gb.isPromotionTriggered(p1, p2));
                    }
                }
            });            
        });
        describe('setting #2', function () {
            const pieceSet = createPieceSet([Chick, Hen, Lion]);
            const notation = 'c@0~2, l@1~2 * c@0~0, l@1~0';
            it('should work #1', function() {
                const gb = GameBoard.create(2, 3, true, 1, pieceSet, notation);
                assert.equal(gb.toStringFancy(),
`cl
..
CL
--
`);
                const promotionVectors=[new Vector(new Point(0,0), new Point(0,2)),
                                        new Vector(new Point(0,0), new Point(1,2)),
                                        new Vector(new Point(1,2), new Point(0,0)),
                                        new Vector(new Point(1,2), new Point(1,0))

                                       ];
                promotionVectors.forEach( (v) => {
                    assert(gb.isPromotionTriggered(v.from, v.to));
                });
                const nonPromotionVectors=[new Vector(new Point(0,0), new Point(1,0)),
                                           new Vector(new Point(0,0), new Point(0,1)),
                                           new Vector(new Point(0,0), new Point(1,1)),
                                           new Vector(new Point(1,2), new Point(1,1)),
                                           new Vector(new Point(1,2), new Point(0,1))
                                          ];
                nonPromotionVectors.forEach( (v) => {
                    assert(!gb.isPromotionTriggered(v.from, v.to));
                });                
                                          
            });
        });
    });


    describe('isPieceUnderAttack', function () {
        describe('setting #1', function () {
            const pieceSet = createPieceSet([Chick, Hen, Lion]);
            const notation = 'c@0~0, l@1~0 * l@0~1, c@1~1';
            it('should work', function() {
                const gb = GameBoard.create(2, 2, true, 0, pieceSet, notation);
                assert.equal(gb.toStringFancy(),
`CL
lc
--
`);
                const piecesUnderAttack = [new Point(0,0), new Point(0,1), new Point(1,1)];
                piecesUnderAttack.forEach( p => {
                    assert(gb.isPieceUnderAttack(p));
                });
                const pieceNotUnderAttack = [new Point(1,0)];
                pieceNotUnderAttack.forEach( p => {
                    assert(gb.isPieceUnderAttack(p));
                });                
            });
        });
        describe('setting #2', function () {
            const pieceSet = createPieceSet([Chick, Hen, Elephant, Lion]);
            const notation = 'h@0~0, l@1~0, e@1~1 * e@0~1, l@0~2, c@1~2';
            it('should work', function() {
                const gb = GameBoard.create(3, 3, true, 0, pieceSet, notation);
                assert.equal(gb.toStringFancy(),
`HL.
eE.
lc.
--
`);
                const piecesUnderAttack    = [new Point(1,0), new Point(0,1), new Point(1,1), new Point(0,2)];
                const piecesNotUnderAttack = [new Point(0,0), new Point(1,2)];
                piecesUnderAttack.forEach( p => {
                    assert(gb.isPieceUnderAttack(p));
                });
                piecesNotUnderAttack.forEach( p => {
                    assert(!gb.isPieceUnderAttack(p));
                });                
            });
        });

        describe('setting #3', function () {
            const pieceSet = createPieceSet([Chick, Hen, Elephant, Lion, Giraffe]);
            const notation = 'h@1~1, g@1~4, l@4~3 * c@0~0,  h@0~2, h@2~2, e@0~1, e@0~4, e@1~0, e@1~2, e@1~3, c@2~0, e@2~1, e@2~4, l@4~2';
            it('should work', function() {
                const gb = GameBoard.create(5, 5, true, 0, pieceSet, notation);
                assert.equal(gb.toStringFancy().trim(),
`
cec..
eHe..
heh.l
.e..L
eGe..
--
`.trim());
                const piecesUnderAttack    = [new Point(0,0), new Point(0,1), new Point(0,4), new Point(1,0), new Point(1,2), new Point(1,3), new Point(4, 2), new Point(4,3)];
                const piecesNotUnderAttack = [new Point(1,1), new Point(1,4), new Point(0,2), new Point(2,2)];
                piecesUnderAttack.forEach( p => {
                    assert(gb.isPieceUnderAttack(p));
                });
                piecesNotUnderAttack.forEach( p => {
                    assert(!gb.isPieceUnderAttack(p));
                });                
            });
        });

        describe('setting #4', function () {
            const pieceSet = createPieceSet([Elephant, Lion, Giraffe]);
            const notation = 'e@1~1, e@1~3, e@1~5, g@5~1, g@5~3, g@5~5, l@4~5 * e@1~0, e@1~2, e@1~4, l@0~5, g@4~0, g@4~2, g@4~4';
            it('should work', function() {
                const gb = GameBoard.create(6, 6, true, 0, pieceSet, notation);
                assert.equal(gb.toStringFancy().trim(),
`
.e..g.
.E...G
.e..g.
.E...G
.e..g.
lE..LG
--
`.trim());
                const piecesUnderAttack    = [new Point(1, 5), new Point(4, 4), new Point(4,5)];
                const piecesNotUnderAttack = [new Point(1,0), new Point(1,1), new Point(1,2), new Point(1,3), new Point(1,4), new Point(4, 0), new Point(4,2), new Point(5,1), new Point(5,3), new Point(5,5), new Point(0,5)];
                piecesUnderAttack.forEach( p => {
                    assert(gb.isPieceUnderAttack(p));
                });
                piecesNotUnderAttack.forEach( p => {
                    assert(!gb.isPieceUnderAttack(p));
                });                
            });
        });                        
    });
    describe('numOfPossibleMoves', function () {
        describe('setting #1', function () {
            const pieceSet = createPieceSet([Chick, Hen, Lion]);
            const notation = 'c@0~0, l@1~0 * l@0~1, c@1~1';
            it('should work', function() {
                const gb = GameBoard.create(2, 2, true, 0, pieceSet, notation);
                assert.equal(gb.toStringFancy(),
`CL
lc
--
`);
                assert.equal(gb.numOfPossibleMoves(true), 2);
                assert.equal(gb.numOfPossibleMoves(false), 2);

            });
        });
        describe('setting #2', function () {
            const pieceSet = createPieceSet([Chick, Hen, Lion]);
            const notation = 'c@0~0, l@1~0, h@1~2 * l@0~1, c@1~1';
            it('should work', function() {
                const gb = GameBoard.create(3, 3, true, 0, pieceSet, notation);
                assert.equal(gb.toStringFancy().trim(),
`
CL.
lc.
.H.
--
`.trim());
                assert.equal(gb.numOfPossibleMoves(true), 0+5+4);
                assert.equal(gb.numOfPossibleMoves(false), 1+4);

            });
        });

       describe('setting #2', function () {
           it('should work', function() {
               const gb = boardA();
               const drops = 9;
               assert.equal(gb.numOfPossibleMoves(true ), 0+4+2+6+drops);
               assert.equal(gb.numOfPossibleMoves(false), 1+4+3+drops);
            });
        });
    });

    describe('distanceFromPromotionZone', function () {
        it('fails as expected', function() {
            const gb = boardA();
            const badPoints = [new Point(2,0), new Point(3,0), new Point(2,1), new Point(0,2), new Point(2,2), new Point(0,3), new Point(1,3), new Point(2,3), new Point(3,3)];
            badPoints.forEach (p => {
                assert.throws(()=>{gb.distanceFromPromotionZone(p);}, /^AssertionError: B-NPEOP/);
            });
        });
        it('succeeds as expected, board with no promotion zone', function() {
            const gb = boardA();
            const points2Distance = (function() {
                const rv = new Map();
                const pointDistances = [ [new Point(0, 0), Number.POSITIVE_INFINITY],
                                         [new Point(1, 0), Number.POSITIVE_INFINITY],
                                         [new Point(0, 1), Number.POSITIVE_INFINITY],
                                         [new Point(1, 1), Number.POSITIVE_INFINITY],
                                         [new Point(3, 1), Number.POSITIVE_INFINITY],
                                         [new Point(1, 2), Number.POSITIVE_INFINITY],
                                         [new Point(3, 2), Number.POSITIVE_INFINITY]
                                       ];
                pointDistances.forEach ( ([a,b]) => {
                    rv.set(a.toString(), b);
                } );
                return rv;
            })();
            points2Distance.forEach( (v, k) => {
                assert.equal(gb.distanceFromPromotionZone(Point.fromString(k)), v);
            } );
        });
        it('succeeds as expected, board with promotion zone of thickness 1', function() {
            const gb = boardA();
            gb.breadthOfPromotionZone = 1;
            const points2Distance = (function() {
                const rv = new Map();
                const pointDistances = [ [new Point(0, 0), 0],
                                         [new Point(1, 0), 0],
                                         [new Point(0, 1), 2],
                                         [new Point(1, 1), 2],
                                         [new Point(3, 1), 1],
                                         [new Point(1, 2), 2],
                                         [new Point(3, 2), 1]
                                       ];
                pointDistances.forEach ( ([a,b]) => {
                    rv.set(a.toString(), b);
                } );
                return rv;
            })();
            points2Distance.forEach( (v, k) => {
                assert.equal(gb.distanceFromPromotionZone(Point.fromString(k)), v);
            } );
        });
        it('succeeds as expected, board with promotion zone of thickness 2', function() {
            const gb = boardA();
            gb.breadthOfPromotionZone = 2;
            const points2Distance = (function() {
                const rv = new Map();
                const pointDistances = [ [new Point(0, 0), 0],
                                         [new Point(1, 0), 0],
                                         [new Point(0, 1), 1],
                                         [new Point(1, 1), 1],
                                         [new Point(3, 1), 0],
                                         [new Point(1, 2), 1],
                                         [new Point(3, 2), 0]
                                       ];
                pointDistances.forEach ( ([a,b]) => {
                    rv.set(a.toString(), b);
                } );
                return rv;
            })();
            points2Distance.forEach( (v, k) => {
                assert.equal(gb.distanceFromPromotionZone(Point.fromString(k)), v);
            } );
        });
        it('succeeds as expected, board with promotion zone of thickness 3 and 4', function() {
            const gb = boardA();
            const thicknesses = [3,4];
            for (let thickness of thicknesses) {
                gb.breadthOfPromotionZone = thickness;
                const points2Distance = (function() {
                    const rv = new Map();
                    const pointDistances = [ [new Point(0, 0), 0],
                                             [new Point(1, 0), 0],
                                             [new Point(0, 1), 0],
                                             [new Point(1, 1), 0],
                                             [new Point(3, 1), 0],
                                             [new Point(1, 2), 0],
                                             [new Point(3, 2), 0]
                                           ];
                    pointDistances.forEach ( ([a,b]) => {
                        rv.set(a.toString(), b);
                    } );
                    return rv;
                })();
                points2Distance.forEach( (v, k) => {
                    assert.equal(gb.distanceFromPromotionZone(Point.fromString(k)), v);
                } );
            }
        });
    });


    describe('sideAPieces', function () {
        const gb = boardA();        
        describe('onBoard', function() {
            it('succeeds as expected', function() {
                assert.equal(gb.sideAPiecesOnBoard().map(([pc, pn])=>pc.code).join(''), 'clhe');
            });
        });
        describe('offBoard', function() {
            it('succeeds as expected', function() {
                assert.equal(gb.sideAPiecesOffBoard().map(pc=>pc.code).join(''), 'g');
            });
        });        
    });

    describe('sideBPieces', function () {
        const gb = boardA();        
        describe('onBoard', function() {
            it('succeeds as expected', function() {
                assert.equal(gb.sideBPiecesOnBoard().map(([pc, pn])=>pc.code).join(''), 'glc');
            });
        });
        describe('offBoard', function() {
            it('succeeds as expected', function() {
                assert.equal(gb.sideBPiecesOffBoard().map(pc=>pc.code).join(''), 'e');
            });
        });                
    });

    describe('locationOfKing', function() {
        const gb = boardA();        
        it('works. for Side A', function() {
            const p = gb.locationOfKing(true);
            assert(p.equals( new Point(1,0) ));
        });
        it('works for Side B', function() {
            const p = gb.locationOfKing(false);
            assert(p.equals( new Point(0,1) ));
        });                
    });

    describe('isKingUnderAttack', function() {
        describe('board A', function() {
            const gb = boardA();        
            it('works. for Side A', function() {
                assert.equal(true, gb.isKingUnderAttack(true));
            });
            it('works for Side B', function() {
                assert.equal(true, gb.isKingUnderAttack(false));
            });
        });
        describe('board B', function() {
            const gb = boardB();        
            it('works. for Side A', function() {
                assert.equal(false, gb.isKingUnderAttack(true));
            });
            it('works for Side B', function() {
                assert.equal(false, gb.isKingUnderAttack(false));
            });
        });
    });




    describe('kingIsOnLastLineUnchecked', function() {
        it ('should work', function() {
            const tests=[[boardA       (), false, false],
                         [boardB       (),  true,  true],
                         [boardTwoKings(), false, false]];
            tests.forEach( ([board, sideA, sideB])=>{
                assert(board.kingIsOnLastLineUnchecked(true )===sideA);
                assert(board.kingIsOnLastLineUnchecked(false)===sideB);
            });
        });
    });


    describe('royalDistanceFromFarEndForGameWin', function() {
        it ('should work', function() {
            const tests = [ [boardA(true), new Point(1,0), 0],
                            [boardA(true), new Point(0,1), 2],
                            [boardA(false), new Point(1,0), Number.POSITIVE_INFINITY],
                            [boardA(false), new Point(0,1), Number.POSITIVE_INFINITY],
                            [boardB(true), new Point(1, 0), 0],
                            [boardB(true), new Point(0, 3), 0],
                            [boardB(false), new Point(1, 0), Number.POSITIVE_INFINITY],
                            [boardB(false), new Point(0, 3), Number.POSITIVE_INFINITY]
                          ];
            tests.forEach ( ([board, p, dist]) => {
                assert.equal(board.royalDistanceFromFarEndForGameWin(p), dist);
            });
        });
    });


    describe('sideOfMoveS', function() {
        it('should fail as expected for invalid moves', function() {
            const board = boardA(true);
            const invalidMoves = ['(0~0)=>(1~0)', '(3~2)=>(0~1)'];
            invalidMoves.forEach( (invalidMove)=> {
                assert.throws( ()=> {
                    board.sideOfMoveS([Chick, Hen, Elephant, Giraffe, Lion], invalidMove);
                }, /^AssertionError: B#ISMS#IV/);
            });
        });
        it('should fail as expected for invalid drops on non-empty squares', function() {
            const board = boardA(true);
            const invalidDrops = ['G=>0~0', 'e=>0~0', 'e=>1~0', 'e=>3~2'];
            invalidDrops.forEach( (invalidDrop)=> {
                assert.throws( ()=> {
                    board.sideOfMoveS([Chick, Hen, Elephant, Giraffe, Lion], invalidDrop);
                }, /AssertionError: B#ISMS#DNEC:/);
            });
        });
        it('should fail as expected for invalid drops of non-captured pieces', function() {
            const board = boardA(true);
            const invalidDrops = ['E=>0~0', 'g=>0~0', 'c=>1~0', 'C=>3~2', 'h=>3~2', 'H=>3~2', 'h=>3~3'];
            invalidDrops.forEach( (invalidDrop)=> {
                assert.throws( ()=> {
                    board.sideOfMoveS([Chick, Hen, Elephant, Giraffe, Lion], invalidDrop);
                }, /AssertionError: B#ISMS#CNHP/);
            });
        });
        it('should work correctly for moves', function() {

        });
        it('should work correctly for drops', function() {

        });
    });
}); // GameBoard


describe('EvaluationModel', function() {
    describe('evalPieceValues', function() {
        it('is working on a board with no promotion zone',function() {
            const tests = [ [ true, 100, 10], [false, 0, 0] ];
            tests.forEach ( ([winOnFarEnd, sideAKinglyBonus, sideBKinglyBonus])=> {
                const gb = boardA(winOnFarEnd);
                assert.equal(model000._evalPieceValues(gb, true), sideAKinglyBonus+1+5+4+8*1.3);
                assert.equal(model000._evalPieceValues(gb, false), sideBKinglyBonus+1+8+4*1.3);
            });
        });
        it('is working on a board with a promotion zone of breadth 1',function() {
            const tests = [ [ true, 100, 10], [false, 0, 0] ];
            tests.forEach ( ([winOnFarEnd, sideAKinglyBonus, sideBKinglyBonus])=> {            
                const gb = boardA(winOnFarEnd);
                gb.breadthOfPromotionZone = 1;
                assert.equal(model000._evalPieceValues(gb, true), sideAKinglyBonus+1+5*0.9+5+4+8*1.3);
                assert.equal(model000._evalPieceValues(gb, false), sideBKinglyBonus+1+5*0.1+8+4*1.3);
            });
        });            
    });
    describe('evalFreedomOfMovement', function() {
        it('works', function () {
            const gb = boardA();
            const freedomOfMove = model000._evalFreedomOfMovement(gb);
            assert.equal(freedomOfMove, 4);
        });
    });
    describe('evaluate royalCheckage', function() {
        it('works for boardA', function () {
            const gb = boardA();
            const royalCheckage = model000._evalRoyalCheckage(gb);
            assert.equal(royalCheckage, -10);
        });
        it(`works for boardA's reflection`, function () {
            const gb = boardA().reflection();
            const royalCheckage = model000._evalRoyalCheckage(gb);
            assert.equal(royalCheckage, -10);
        });
        it('works for boardB', function () {
            const gb = boardB();
            const royalCheckage = model000._evalRoyalCheckage(gb);
            assert.equal(royalCheckage, 0);
        });
        it(`works for boardB'reflection`, function () {
            const gb = boardB().reflection();
            const royalCheckage = model000._evalRoyalCheckage(gb);
            assert.equal(royalCheckage, 0);
        });                
    });
    describe('evaluateBoard', function() {
        it('should not fail', function() {
            const boards = [boardA(), boardTwoKings(), boardWithSideAKingCaptured(), boardWithSideBKingCaptured()];
            boards.forEach ( (board)=> {
                model000.evaluateBoard(board);
            });
        });
        it('it should work in infinity cases', function() {
            const tests = [ [boardWithSideAKingCaptured(), Number.NEGATIVE_INFINITY],
                             [boardWithSideBKingCaptured(), Number.POSITIVE_INFINITY]];
            tests.forEach ( ([board, score]) => {
                assert(model000.evaluateBoard(board)===score);
            } );
        });
    });
});

describe('Interplay between GameBoard and EvaluationModel', function() {
    describe('nextStatesValues', function() {
        describe('board two kings', function() {
            const gb = boardTwoKings();        
            it(`doesn't break. for Side A`, function() {
                const movesToEval = gb.nextStatesValues(true, model000);
            });
        });
    });        
});


