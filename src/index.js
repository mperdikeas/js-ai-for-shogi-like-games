// @flow
'use strict';
// The rationale behind using this idiom is described in:
//     http://stackoverflow.com/a/36628148/274677
//

if (!global._babelPolyfill) // https://github.com/s-panferov/awesome-typescript-loader/issues/121
    require('babel-polyfill'); // this is important as Babel only transforms syntax (e.g. arrow functions)
// so you need this in order to support new globals or (in my experience) well-known Symbols, e.g. the following:
//
//     console.log(Object[Symbol.hasInstance]);
//
// ... will print 'undefined' without the the babel-polyfill being required.

import {GameBoard                   } from './board-lib.js';
import {CaptureBag                  } from './captureBag.js';
import {model000                    } from './eval-model-library.js';
import {moveTreeBuilder             } from './move-tree-builder.js';
import {sideThatMovesNext           } from './move-tree-builder.js';
import {evaluateLeaves              } from './move-tree-builder.js';
import {pullEvaluationsUp           } from './move-tree-builder.js';
import {bestMove                    } from './move-tree-builder.js';
import {dynamicEvaluationOfBoard    } from './move-tree-builder.js';
import {Move                        } from './moves.js';
import {BoardMove                   } from './moves.js';
import {DropMoveNoPieceInformation  } from './moves.js';
import {DropMove                    } from './moves.js';
import {PieceSet                    } from './piece-set-factory.js';
import {createPieceSet              } from './piece-set-factory.js';
import {Piece                       } from './piece.js';
import {PieceOnSide                 } from './piece.js';
import {Side                        } from './side.js';                 

import {Chick                       } from './piece-set.js';
import {Hen                         } from './piece-set.js';
import {Elephant                    } from './piece-set.js';
import {Giraffe                     } from './piece-set.js';
import {Lion                        } from './piece-set.js';

exports.GameBoard                   = GameBoard;
exports.CaptureBag                  = CaptureBag;
exports.model000                    = model000;
exports.moveTreeBuilder             = moveTreeBuilder;
exports.sideThatMovesNext           = sideThatMovesNext;
exports.evaluateLeaves              = evaluateLeaves;
exports.pullEvaluationsUp           = pullEvaluationsUp;
exports.bestMove                    = bestMove;
exports.dynamicEvaluationOfBoard    = dynamicEvaluationOfBoard;
exports.Move                        = Move;
exports.BoardMove                   = BoardMove;
exports.DropMoveNoPieceInformation  = DropMoveNoPieceInformation;
exports.DropMove                    = DropMove;
exports.PieceSet                    = PieceSet;
exports.createPieceSet              = createPieceSet;
exports.Piece                       = Piece;
exports.PieceOnSide                 = PieceOnSide;
exports.Side                        = Side;

exports.Chick                       = Chick;
exports.Hen                         = Hen;
exports.Elephant                    = Elephant;
exports.Giraffe                     = Giraffe;
exports.Lion                        = Lion;




