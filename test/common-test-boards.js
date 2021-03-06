'use strict'; 

import 'babel-polyfill';
const assert     = require('assert');

import { GameBoard}   from '../src/board-lib.js';
import {Chick, Hen, Elephant, Giraffe, Lion} from '../src/piece-set.js';
import {createPieceSet}                      from '../src/piece-set-factory.js';
import {PieceOnSide}                         from '../src/piece.js';
import {CaptureBag}                          from '../src/captureBag.js';
import {piecesSet1AsSet}                     from './common-piece-sets.js';

function boardA(_winIfKingReachesEndLine) {
    const winIfKingReachesEndLine  = _winIfKingReachesEndLine==null?true:_winIfKingReachesEndLine;
    const notation = 'c@0~0, l@1~0, h@1~2, e@3~1 * g@3~2, l@0~1, c@1~1';
    const cb = new CaptureBag();
    cb.capture(new PieceOnSide(Elephant, true));
    cb.capture(new PieceOnSide(Giraffe, false));                            
    const gb = GameBoard.create(4, 4, winIfKingReachesEndLine, 0, piecesSet1AsSet(), notation, cb);
    assert.equal(gb.toStringFancy().trim(),              
                 `
CL..
lc.E
.H.g
....
--
Ge
`.trim());
    return gb;
}

function boardB(_winIfKingReachesEndLine) {
    const winIfKingReachesEndLine  = _winIfKingReachesEndLine==null?true:_winIfKingReachesEndLine;
    const notation = 'c@0~0, l@1~0, h@1~2, e@3~1 * g@3~2, l@0~3, c@1~1';
    const cb = new CaptureBag();
    cb.capture(new PieceOnSide(Elephant, true));
    cb.capture(new PieceOnSide(Giraffe, false));
    const gb = GameBoard.create(4, 4, winIfKingReachesEndLine, 0, piecesSet1AsSet(), notation, cb);
    assert.equal(gb.toStringFancy().trim(),              
                 `
CL..
.c.E
.H.g
l...
--
Ge
`.trim());
    return gb;
}


function boardTwoKings(_winIfKingReachesEndLine) {
    const winIfKingReachesEndLine  = _winIfKingReachesEndLine==null?true:_winIfKingReachesEndLine;
    const notation = 'l@3~3 * l@0~0';
    const cb = new CaptureBag();
    const gb = GameBoard.create(4, 4, winIfKingReachesEndLine, 0, piecesSet1AsSet(), notation, cb);
    assert.equal(gb.toStringFancy().trim(),              
                 `
l...
....
....
...L
--
`.trim());
    return gb;
}

function boardTwoKings1x2(_winIfKingReachesEndLine) {
    const winIfKingReachesEndLine  = _winIfKingReachesEndLine==null?true:_winIfKingReachesEndLine;
    const notation = 'l@0~1 * l@0~0';
    const cb = new CaptureBag();
    const gb = GameBoard.create(1, 2, winIfKingReachesEndLine, 0, piecesSet1AsSet(), notation, cb);
    assert.equal(gb.toStringFancy().trim(),              
                 `
l
L
--
`.trim());
    return gb;
}

function boardWithSideAKingCaptured() {
    const notation = 'c@0~0, h@1~2, e@3~1 * g@3~2, l@0~3, c@1~1';
    const cb = new CaptureBag();
    cb.capture(new PieceOnSide(Elephant, true));
    cb.capture(new PieceOnSide(Lion, true));
    cb.capture(new PieceOnSide(Giraffe, false));                            
    const gb = GameBoard.create(4, 4, true, 0, piecesSet1AsSet(), notation, cb);
    assert.equal(gb.toStringFancy().trim(),              
                 `
C...
.c.E
.H.g
l...
--
Gel
`.trim());
    return gb;
}

function boardWithSideBKingCaptured() {
    const notation = 'c@0~0, l@1~0, h@1~2, e@3~1 * g@3~2, c@1~1';
    const cb = new CaptureBag();
    cb.capture(new PieceOnSide(Elephant, true));
    cb.capture(new PieceOnSide(Giraffe, false));
    cb.capture(new PieceOnSide(Lion, false));
    const gb = GameBoard.create(4, 4, true, 0, piecesSet1AsSet(), notation, cb);
    assert.equal(gb.toStringFancy().trim(),              
                 `
CL..
.c.E
.H.g
....
--
GLe
`.trim());
    return gb;
}

function board1x2_withTwoKingsFacing() {
    const notation = 'l@0~1 * l@0~0';
    const cb = new CaptureBag();
    const gb = GameBoard.create(1, 2, false, 0, piecesSet1AsSet(), notation, cb);
    assert.equal(gb.toStringFancy().trim(),              
                 `
l
L
--
`.trim());
    return gb;
}

function board3x2_withTwoKingsFacingAndOpportunisticTargets() {
    const notation = 'e@0~1, l@1~1, g@2~1* e@0~0, l@1~0, g@2~0';
    const cb = new CaptureBag();
    const gb = GameBoard.create(3, 2, false, 0, piecesSet1AsSet(), notation, cb);
    assert.equal(gb.toStringFancy().trim(),              
                 `
elg
ELG
--
`.trim());
    return gb;
}

function board3x3_withTraps() {
    const notation = 'c@0~0, e@0~1, g@2~1, l@1~2* l@1~0';
    const cb = new CaptureBag();
    const gb = GameBoard.create(3, 3, false, 0, piecesSet1AsSet(), notation, cb);
    assert.equal(gb.toStringFancy().trim(),              
`
Cl.
E.G
.L.
--
`.trim());
    return gb;
}

function board1x3_suicideForFirstMover() {
    const notation = 'l@0~2 * l@0~0';
    const cb = new CaptureBag();
    const gb = GameBoard.create(1, 3, false, 0, piecesSet1AsSet(), notation, cb);
    assert.equal(gb.toStringFancy().trim(),              
`
l
.
L
--
`.trim());
    return gb;
}

function board2x3_manoeuveringForStandoff() {
    const notation = 'l@0~2 * l@0~0';
    const cb = new CaptureBag();
    const gb = GameBoard.create(2, 3, false, 0, piecesSet1AsSet(), notation, cb);
    assert.equal(gb.toStringFancy().trim(),              
`
l.
..
L.
--
`.trim());
    return gb;
}

function board1x4_victoryForFirstMover() {
    const notation = 'l@0~3 * l@0~0';
    const cb = new CaptureBag();
    const gb = GameBoard.create(1, 4, false, 0, piecesSet1AsSet(), notation, cb);
    assert.equal(gb.toStringFancy().trim(),              
`
l
.
.
L
--
`.trim());
    return gb;
}

function board3x3_victoryWithDrops() {
    const notation = 'l@1~2 * c@1~0, l@2~0, c@0~1, e@1~1';
    const cb = new CaptureBag();
    cb.capture(new PieceOnSide(Chick, false));
    cb.capture(new PieceOnSide(Giraffe, true));        
    const gb = GameBoard.create(3, 3, false, 0, piecesSet1AsSet(), notation, cb);
    assert.equal(gb.toStringFancy().trim(),              
`
.cl
ce.
.L.
--
Cg
`.trim());
    return gb;
}

function board3x3_withPromotionZone() {
    const notation = 'l@2~2 * l@2~0';
    const cb = new CaptureBag();
    cb.capture(new PieceOnSide(Chick   , false));
    cb.capture(new PieceOnSide(Chick   , true ));
    cb.capture(new PieceOnSide(Elephant, false));
    cb.capture(new PieceOnSide(Elephant, true ));            
    const gb = GameBoard.create(3, 3, false, 1, piecesSet1AsSet(), notation, cb);
    assert.equal(gb.toStringFancy().trim(),              
`
..l
...
..L
--
CEce
`.trim());
    return gb;
}


exports.boardA                                             = boardA;
exports.boardB                                             = boardB;
exports.boardTwoKings                                      = boardTwoKings;
exports.boardWithSideAKingCaptured                         = boardWithSideAKingCaptured;
exports.boardWithSideBKingCaptured                         = boardWithSideBKingCaptured;
exports.boardTwoKings1x2                                   = boardTwoKings1x2;
exports.board1x2_withTwoKingsFacing                        = board1x2_withTwoKingsFacing;
exports.board3x2_withTwoKingsFacingAndOpportunisticTargets = board3x2_withTwoKingsFacingAndOpportunisticTargets;
exports.board3x3_withTraps                                 = board3x3_withTraps;
exports.board1x3_suicideForFirstMover                      = board1x3_suicideForFirstMover;
exports.board1x4_victoryForFirstMover                      = board1x4_victoryForFirstMover;
exports.board2x3_manoeuveringForStandoff                   = board2x3_manoeuveringForStandoff;
exports.board3x3_victoryWithDrops                          = board3x3_victoryWithDrops;
exports.board3x3_withPromotionZone                         = board3x3_withPromotionZone;
