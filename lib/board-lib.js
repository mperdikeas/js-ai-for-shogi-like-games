'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _numberPrototype = require('./number-prototype.js');

var _numberPrototype2 = _interopRequireDefault(_numberPrototype);

var _constants = require('./constants.js');

var _geometry2d = require('geometry-2d');

var _piece = require('./piece.js');

var _pieceSet = require('./piece-set.js');

var _pieceSetFactory = require('./piece-set-factory.js');

var _transpose = require('./transpose.js');

var _captureBag2 = require('./captureBag.js');

var _evalModel = require('./eval-model.js');

var _trees = require('./trees.js');

var _side = require('./side.js');

var _moves2 = require('./moves.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {
    var sourceMapSupport = require('source-map-support');
    sourceMapSupport.install();
})();

var GameBoard = function () {
    function GameBoard(width, height, winIfKingReachesFarEnd, breadthOfPromotionZone, board, captured) {
        _classCallCheck(this, GameBoard);

        this.width = width;
        this.height = height;
        this.winIfKingReachesFarEnd = winIfKingReachesFarEnd;
        (0, _assert2.default)(breadthOfPromotionZone >= 0 && breadthOfPromotionZone <= height);
        this.breadthOfPromotionZone = breadthOfPromotionZone;
        this.board = board;
        this.captured = captured;
    }

    _createClass(GameBoard, [{
        key: 'reflection',
        value: function reflection() {
            var _this = this;

            // returns a game board that is the reflection of this one
            var newBoard = new Map();
            this.board.forEach(function (v, k) {
                newBoard.set(_geometry2d.Point.fromString(k).reflectionInGrid(_this.width, _this.height).toString(), v.switchSides());
            });
            return new GameBoard(this.width, this.height, this.winIfKingReachesFarEnd, this.breadthOfPromotionZone, newBoard, this.captured.reflection());
        }
    }, {
        key: 'onBoardPieces',
        value: function onBoardPieces(sideA) {
            return _lodash2.default.filter(Array.from(this.board.entries()), function (_ref) {
                var _ref2 = _slicedToArray(_ref, 2);

                var pn = _ref2[0];
                var p = _ref2[1];
                return p.isSideA === sideA;
            }).map(function (_ref3) {
                var _ref4 = _slicedToArray(_ref3, 2);

                var pn = _ref4[0];
                var p = _ref4[1];
                return [p.piece, _geometry2d.Point.fromString(pn)];
            });
        }
    }, {
        key: 'offBoardPieces',
        value: function offBoardPieces(sideA) {
            return _lodash2.default.filter(this.captured.capturedPieces, function (p) {
                return p.isSideA === sideA;
            }).map(function (p) {
                return p.piece;
            });
        }
    }, {
        key: 'sideAPiecesOnBoard',
        value: function sideAPiecesOnBoard() {
            return this.onBoardPieces(true);
        }
    }, {
        key: 'sideAPiecesOffBoard',
        value: function sideAPiecesOffBoard() {
            return this.offBoardPieces(true);
        }
    }, {
        key: 'sideBPiecesOnBoard',
        value: function sideBPiecesOnBoard() {
            return this.onBoardPieces(false);
        }
    }, {
        key: 'sideBPiecesOffBoard',
        value: function sideBPiecesOffBoard() {
            return this.offBoardPieces(false);
        }
    }, {
        key: 'emptyPoints',
        value: function emptyPoints() {
            var rv = [];
            for (var i = 0; i < this.width; i++) {
                for (var j = 0; j < this.height; j++) {
                    var p = new _geometry2d.Point(i, j);
                    if (!this._has(p)) rv.push(p);
                }
            }
            return rv;
        }
    }, {
        key: 'isCellEmpty',
        value: function isCellEmpty(p) {
            return _lodash2.default.some(this.emptyPoints(), function (x) {
                return x.equals(p);
            });
        }
    }, {
        key: 'sideOnCell',
        value: function sideOnCell(p) {
            (0, _assert2.default)(this._has(p), 'B-SOS-CNP: The board:\n' + this.toStringFancy() + '\n contains no piece on square: ' + p.toString());
            var pieceOnSide = this._get(p) || function () {
                throw new Error('should have escaped by now');
            }();
            if (pieceOnSide.isSideA) return _side.Side.A;else return _side.Side.B;
        }
    }, {
        key: 'assertPieceSetSupersetOfBoardPieces',
        value: function assertPieceSetSupersetOfBoardPieces(pieceSet) {
            this.board.forEach(function (pieceOnSide, position) {
                if (!_lodash2.default.includes(pieceSet, pieceOnSide.piece)) throw new Error('The piece set ' + pieceSet + ' does not include ' + pieceOnSide.piece);
            });
        }
    }, {
        key: 'sideOfMoveS',
        value: function sideOfMoveS(pieceSet, s) {
            this.assertPieceSetSupersetOfBoardPieces(pieceSet);
            return this.sideOfMove(_moves2.Move.fromString(pieceSet, s));
        }
    }, {
        key: 'sideOfMoveSNoPieceSetInfo',
        value: function sideOfMoveSNoPieceSetInfo(s) {
            return this.sideOfMove(_moves2.Move.fromStringNoPieceSetInfo(s));
        }
    }, {
        key: 'sideOfMove',
        value: function sideOfMove(m) {
            if (m instanceof _moves2.DropMove) {
                (0, _assert2.default)(this.captured.has(m.pieceOnSide), 'B#ISMS#CNHP: the capture bag of board ' + this + ' does not have the piece involved in the drop ' + m);
                (0, _assert2.default)(this.isCellEmpty(m.to), 'B#ISMS#DNEC: impossible drop ' + m + ' to non-empty cell on board ' + this);
                return m.pieceOnSide.isSideA ? _side.Side.A : _side.Side.B;
            }
            if (m instanceof _moves2.DropMoveNoPieceInformation) {
                (0, _assert2.default)(this.isCellEmpty(m.to), 'B#ISMS#DNEC: impossible drop ' + m + ' to non-empty cell on board ' + this);
                return m.side;
            } else if (m instanceof _moves2.BoardMove) {
                (0, _assert2.default)(!this.isCellEmpty(m.vector.from));
                var rv = this.sideOnCell(m.vector.from);
                (0, _assert2.default)(this.isCellEmpty(m.vector.to) || this.sideOnCell(m.vector.to) === rv.theOther(), 'B#ISMS#IV invalid move ' + m.vector + ' on board ' + this);
                return rv;
            } else throw new Error('Unrecognized move: ' + m.toString());
        }
    }, {
        key: 'nextStatesByMovingPieceOnAParticularSquare',
        value: function nextStatesByMovingPieceOnAParticularSquare(p) {
            (0, _assert2.default)(this._has(p), 'B-NSBMP-CNP: The board:\n' + this.toStringFancy() + '\n contains no piece on square: ' + p.toString());
            var pieceOnSide = this._get(p) || function () {
                throw new Error('should have escaped by now');
            }();
            var rv = new Map();
            var piece = pieceOnSide.piece;
            var _moves = piece.moves();
            var moves = pieceOnSide.isSideA ? _moves : _moves.map(function (x) {
                return x.opposite();
            });
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = moves[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var move = _step.value;

                    var pTo = p.add(move, false);
                    var v = new _geometry2d.Vector(p, pTo);
                    var newBoard = this.move(p, pTo);
                    if (newBoard != null) {
                        // made the test laxer than I normally would, to satisfy Flow
                        (0, _assert2.default)(newBoard !== null); // but now I am asserting that the stronger condition also holds
                        rv.set(v.toString(), newBoard);
                    }
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            return rv;
        }
    }, {
        key: 'distanceFromPromotionZone',


        // returns the distance of the piece on that particular point from its respective promotion zone
        value: function distanceFromPromotionZone(p) {
            var piece = this._get(p);
            (0, _assert2.default)(piece, 'B-NPEOP: no piece exists on point ' + p + ' on board:\n ' + this.toStringFancy());
            if (this.breadthOfPromotionZone === 0) return Number.POSITIVE_INFINITY; // if a board has no promotion zone, the distance is infinite
            if (piece != null) {
                // Flow compels me to make the check this way
                (0, _assert2.default)(piece !== null); // ... but I am going to assert that a stronger, still, condition holds
                if (piece.isSideA) {
                    return Math.max(p.y + 1 - this.breadthOfPromotionZone, 0);
                } else {
                    return Math.max(this.height - this.breadthOfPromotionZone - p.y, 0);
                }
            } else throw new Error('bug - should have escaped by now');
        }

        // returns the distance of a king from its respective far end or positive infinity if the board is not configured
        // to result in an automatic win should a king reache the far end

    }, {
        key: 'royalDistanceFromFarEndForGameWin',
        value: function royalDistanceFromFarEndForGameWin(p) {
            var piece = this._get(p);
            (0, _assert2.default)(piece, 'B-RD-NPEOP: no piece exists on point ' + p + ' on board:\n ' + this.toStringFancy());
            if (piece != null) {
                // Flow compels me to make the check this way
                (0, _assert2.default)(piece !== null); // ... but I am going to assert that a stronger, still, condition holds
                (0, _assert2.default)(piece.piece.isKing, 'B-RD-NK: the piece that exists on point ' + p + ' on board:\n ' + this.toStringFancy() + '\n ... is [' + piece.piece + '] and is not a King');
                if (!this.winIfKingReachesFarEnd) return Number.POSITIVE_INFINITY;
                if (piece.isSideA) {
                    return p.y;
                } else {
                    return this.height - p.y - 1;
                }
            } else throw new Error('bug - should have escaped by now');
        }
    }, {
        key: 'nextStatesValues',
        value: function nextStatesValues(sideA, evalModel) {
            var rv = new Map();
            var nextStates = this.nextStates(sideA, false);
            nextStates.forEach(function (v, k) {
                (0, _assert2.default)(!rv.has(k));
                rv.set(k, [v, evalModel.evaluateBoard(v)]);
            });
            return rv;
        }
    }, {
        key: 'nextStates',
        value: function nextStates(sideA, _ignoreDrops) {
            var _this2 = this;

            // rationale for the [ignoreDrops]: for estimating whether a piece is under attack we need not consider drops
            var ignoreDrops = _ignoreDrops == null ? false : _ignoreDrops;
            var rv = new Map();
            // add all possible moves
            this.board.forEach(function (v, k) {
                var p = _geometry2d.Point.fromString(k);
                if (v.isSideA === sideA) {
                    var boardsForThisPiece = _this2.nextStatesByMovingPieceOnAParticularSquare(p);
                    boardsForThisPiece.forEach(function (v, k) {
                        (0, _assert2.default)(!rv.has(k), 'Weird, move ' + k + ' has already been encountered');
                        rv.set(k, v);
                    });
                }
            });
            if (!ignoreDrops) {
                (function () {
                    var dropOptions = _this2.captured.dropOptions(sideA);
                    var emptyPoints = _this2.emptyPoints();
                    dropOptions.forEach(function (pc) {
                        emptyPoints.forEach(function (pn) {
                            var newBoard = _this2.drop(new _piece.PieceOnSide(pc, sideA), pn);
                            if (newBoard != null) {
                                // Flow demands this be laxer than I would like
                                (0, _assert2.default)(newBoard !== null, 'bad choreography'); // doing the stricter test
                                var keyOfDropMove = new _piece.PieceOnSide(pc, sideA) + '=>' + pn;
                                (0, _assert2.default)(!rv.has(keyOfDropMove), 'Weird, drop move ' + keyOfDropMove + ' has alredy been encountered');
                                rv.set(keyOfDropMove, newBoard);
                            } else throw new Error('bad choreography');
                        });
                    });
                })();
            }
            return rv;
        }
    }, {
        key: 'clone',
        value: function clone() {
            return new GameBoard(this.width, this.height, this.winIfKingReachesFarEnd, this.breadthOfPromotionZone, new Map(this.board), this.captured.clone());
        }
    }, {
        key: '_get',
        value: function _get(pn) {
            var pnkey = pn.toString();
            return this.board.get(pnkey);
        }
    }, {
        key: '_set',
        value: function _set(pn, pc) {
            var pnkey = pn.toString();
            this.board.set(pnkey, pc);
        }
    }, {
        key: '_has',
        value: function _has(pn) {
            var pnkey = pn.toString();
            return this.board.has(pnkey);
        }
    }, {
        key: '_delete',
        value: function _delete(pn) {
            var pnkey = pn.toString();
            return this.board.delete(pnkey);
        }
    }, {
        key: 'drop',
        value: function drop(pc, pn) {
            (0, _assert2.default)(this.captured.has(pc), 'piece ' + pc.toString() + ' not found in capture bag ' + this.captured.toString());
            if (this._has(pn)) {
                return null;
            }
            var rv = this.clone();
            rv.set(pn, pc);
            rv.captured.hasBeenDroppedBackInTheBoard(pc);
            return rv;
        }
    }, {
        key: 'set',
        value: function set(pn, pc) {
            this.assertInGrid(pn);
            if (this._has(pn)) throw new Error('some other Piece already exists at ' + pn);
            this._set(pn, pc);
        }
    }, {
        key: 'clear',
        value: function clear(pn) {
            this.assertInGrid(pn);
            if (!this._has(pn)) throw new Error('Point ' + pn + ' is already empty');else (0, _assert2.default)(this._delete(pn) != null);
        }
    }, {
        key: '_capture',
        value: function _capture(pn) {
            this.assertInGrid(pn);
            (0, _assert2.default)(this._has(pn));
            var piece = this._get(pn);
            if (piece != null) {
                this.clear(pn);
                this.captured.capture(piece);
            } else throw new Error();
        }
    }, {
        key: 'inGrid',
        value: function inGrid(pn) {
            return pn.x.between(0, this.width) && pn.y.between(0, this.height);
        }
    }, {
        key: 'assertInGrid',
        value: function assertInGrid(pn) {
            var inGrid = this.inGrid(pn);
            if (!inGrid) throw new Error('Point ' + pn.toString() + ' does not lie in a ' + this.width + 'X' + this.height + ' grid');
        }
    }, {
        key: 'isPromotionTriggered',
        value: function isPromotionTriggered(pn1, pn2) {
            var _this3 = this;

            (0, _assert2.default)(!pn1.equals(pn2));
            if (!this._has(pn1)) throw new Error('board ' + this + ' does not contain piece at starting point: ' + pn1);else {
                var piece = this._get(pn1);
                if (piece != null) {
                    // Flow forces me to be laxer than I would like
                    (0, _assert2.default)(piece !== null); // I take care of this forced laxness here ...
                    var sideA = piece.isSideA;
                    if (sideA) return _lodash2.default.some([pn1, pn2], function (v) {
                        return v.y < _this3.breadthOfPromotionZone;
                    });else return _lodash2.default.some([pn1, pn2], function (v) {
                        return v.y >= _this3.height - _this3.breadthOfPromotionZone;
                    });
                } else throw new Error('bug - should have escaped this path by now');
            }
        }
    }, {
        key: 'kingIsOnLastLineUnchecked',
        value: function kingIsOnLastLineUnchecked(sideA) {
            var p = this.locationOfKing(sideA);
            var b = this.isKingUnderAttack(sideA);
            if (sideA && p.y === 0 && !b) return true;
            if (!sideA && p.y === this.height - 1 && !b) return true;
            return false;
        }
    }, {
        key: 'locationOfKing',
        value: function locationOfKing(sideA) {
            var piecesOfThisSide = _lodash2.default.filter(Array.from(this.board.entries()), function (_ref5) {
                var _ref6 = _slicedToArray(_ref5, 2);

                var k = _ref6[0];
                var v = _ref6[1];
                return v.isSideA === sideA;
            }).map(function (_ref7) {
                var _ref8 = _slicedToArray(_ref7, 2);

                var k = _ref8[0];
                var v = _ref8[1];
                return [k, v.piece];
            });
            var kingsOfThisSide = _lodash2.default.filter(piecesOfThisSide, function (_ref9) {
                var _ref10 = _slicedToArray(_ref9, 2);

                var k = _ref10[0];
                var v = _ref10[1];
                return v === _pieceSet.Lion;
            });
            (0, _assert2.default)(kingsOfThisSide.length === 1, 'Unexpected number of kings found: ' + kingsOfThisSide.length);
            return _geometry2d.Point.fromString(kingsOfThisSide[0][0]);
        }
    }, {
        key: 'isKingUnderAttack',
        value: function isKingUnderAttack(sideA) {
            var p = this.locationOfKing(sideA);
            return this.isPieceUnderAttack(p);
        }
    }, {
        key: 'isPieceUnderAttack',
        value: function isPieceUnderAttack(pn) {
            var _this4 = this;

            // we are assuming that the opposite side moves
            if (!this._has(pn)) throw new Error('board ' + this + ' does not contain piece at starting point: ' + pn);else {
                var _ret2 = function () {
                    var piece = _this4._get(pn);
                    if (piece != null) {
                        // Flow forces me to be laxer than I would like
                        (0, _assert2.default)(piece !== null); // I take care of this forced laxness here ...
                        var nextBoards = GameBoard.boardsOnly(_this4.nextStates(!piece.isSideA, true));

                        // if the piece remains in the same spot for *every* possible next state, then it is not
                        // currently under attack
                        return {
                            v: !_lodash2.default.every(nextBoards, function (gb) {
                                (0, _assert2.default)(gb._has(pn)); // Whether the piece remains there or has been captured, a piece should always exists
                                // in that spot in all possible next boards as it is the other side that's moving.
                                // So either our piece stays there or the piece that captured it occupies the spot.
                                var pieceOnNewBoard = gb._get(pn);
                                if (pieceOnNewBoard != null) {
                                    (0, _assert2.default)(piece !== null);
                                    return piece.equals(pieceOnNewBoard);
                                } else throw new Error('bug - should have escaped by now');
                            })
                        };
                    } else throw new Error('bug - should have escaped this path by now');
                }();

                if ((typeof _ret2 === 'undefined' ? 'undefined' : _typeof(_ret2)) === "object") return _ret2.v;
            }
        }
    }, {
        key: 'numOfPossibleMoves',
        value: function numOfPossibleMoves(isSideA) {
            var nextBoards = GameBoard.boardsOnly(this.nextStates(isSideA));
            return nextBoards.length;
        }
    }, {
        key: 'move',
        value: function move(pn1, pn2) {
            if (!this._has(pn1)) return null;else {
                var piece = this._get(pn1);
                if (piece != null) {
                    var rv = this.clone();
                    if (!this.inGrid(pn2)) return null;
                    if (rv._has(pn2)) {
                        var otherPiece = rv._get(pn2);
                        if (otherPiece != null) {
                            if (otherPiece.sameSide(piece)) return null;else rv._capture(pn2);
                        } else throw new Error('bug');
                    }
                    // finish the move (if some other piece exists at destination it should have already been captured in the lines above
                    rv.clear(pn1);
                    if (this.isPromotionTriggered(pn1, pn2)) rv.set(pn2, piece.promote());else rv.set(pn2, piece);
                    return rv;
                } else throw new Error('bug');
            }
        }
    }, {
        key: 'kingIsCaptured',
        value: function kingIsCaptured(sideA) {
            return _lodash2.default.some(this.captured.capturedPieces, function (p) {
                return p.isSideA === !sideA && p.piece.isKing;
            }); // when a piece is captured, it switches sides
        }
    }, {
        key: 'boardImmediateWinSide',
        value: function boardImmediateWinSide() {
            // true if this position is a win for side A, false if it is a win for side B, null for neither

            {
                var sideAKingIsCaptured = this.kingIsCaptured(true);
                var sideBKingIsCaptured = this.kingIsCaptured(false);
                if (sideAKingIsCaptured && !sideBKingIsCaptured) return false;
                if (!sideAKingIsCaptured && sideBKingIsCaptured) return true;
                if (sideAKingIsCaptured && sideBKingIsCaptured) throw new Error('I shoud never be asked to evalute a position with both kings captured such as the following:\n' + this.toStringFancy());
            }
            {
                // check for kings that've reached the last line and are unchecked
                var kingAUncheckedLastLine = this.kingIsOnLastLineUnchecked(true);
                var kinthisUncheckedLastLine = this.kingIsOnLastLineUnchecked(false);
                if (kingAUncheckedLastLine && !kinthisUncheckedLastLine) return true;
                if (!kingAUncheckedLastLine && kinthisUncheckedLastLine) return false;
                if (this.winIfKingReachesFarEnd && kingAUncheckedLastLine && kinthisUncheckedLastLine) throw new Error('GB:BKULL I shoud never be asked to evalute a position with both kings unchecked on the last line, such as the following:\n' + this.toStringFancy());
            }
            return null;
        }
    }, {
        key: 'toString',
        value: function toString() {
            var keys = Array.from(this.board.keys());
            var keysSorted = _lodash2.default.sortBy(keys, function (xy) {
                var p = _geometry2d.Point.fromString(xy);
                return p.x * _constants.MAX_BOARD_DIMENSION + p.y;
            });
            var rv = [];
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = keysSorted[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var key = _step2.value;

                    var piece = this.board.get(key);
                    if (piece != null) {
                        rv.push(piece.toString() + '@' + key.toString());
                    } else throw new Error('bug key: ' + key.toString() + ' found and yet not found');
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }

            var board = rv.join(', ');
            return '[' + board + '] * [' + this.captured.toString() + ']';
        }
    }, {
        key: 'toStringFancy',
        value: function toStringFancy() {
            return GameBoard.toStringFancy(this);
        }
    }, {
        key: 'equals',
        value: function equals(o) {
            return this.toString() === o.toString();
        }
    }], [{
        key: 'create',
        value: function create(width, height, winIfKingReachesFarEnd, breadthOfPromotionZone, pieceSet, boardNotation, _captureBag) {
            var captureBag = _captureBag || new _captureBag2.CaptureBag();

            var _boardNotation$split = boardNotation.split('*');

            var _boardNotation$split2 = _slicedToArray(_boardNotation$split, 2);

            var sideA = _boardNotation$split2[0];
            var sideB = _boardNotation$split2[1];

            (0, _assert2.default)(width.between(0, _constants.MAX_BOARD_DIMENSION));
            (0, _assert2.default)(height.between(0, _constants.MAX_BOARD_DIMENSION));
            var board = new Map();
            GameBoard.populate(board, width, height, pieceSet, true, sideA);
            GameBoard.populate(board, width, height, pieceSet, false, sideB);

            return new GameBoard(width, height, winIfKingReachesFarEnd, breadthOfPromotionZone, board, captureBag);
        }
    }, {
        key: 'boardsOnly',
        value: function boardsOnly(moves2Boards) {
            var kvs = Array.from(moves2Boards.entries());
            return kvs.map(function (_ref11) {
                var _ref12 = _slicedToArray(_ref11, 2);

                var k = _ref12[0];
                var v = _ref12[1];
                return v;
            });
        }
    }, {
        key: 'populate',
        value: function populate(board, width, height, pieceSet, asSideA, positionNotationsStr) {
            var positionNotations = positionNotationsStr.replace(/ /g, '').split(',');
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = positionNotations[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var piecePosition = _step3.value;

                    var _piecePosition$split = piecePosition.split('@');

                    var _piecePosition$split2 = _slicedToArray(_piecePosition$split, 2);

                    var piece = _piecePosition$split2[0];
                    var position = _piecePosition$split2[1];

                    var point = _geometry2d.Point.fromString(position);
                    (0, _assert2.default)(_lodash2.default.isInteger(point.x));
                    (0, _assert2.default)(_lodash2.default.isInteger(point.y));
                    if (!point.x.between(0, width)) throw new Error('Point ' + point + ' does not lie on the X-axis >=0 and < ' + width);
                    if (!point.y.between(0, height)) throw new Error('Point ' + point + ' does not lie on the Y-axis >=0 and < ' + height);
                    var pnkey = point.toString();
                    var pieceP = pieceSet.fromCode(piece);
                    if (pieceP != null) {
                        if (!board.has(pnkey)) board.set(pnkey, pieceP.takeSides(asSideA));else throw new Error('something alredy exists in point: ' + point);
                    } else throw new Error('Bad notation: ' + positionNotationsStr + ', contains unknown code: ' + piece);
                }
            } catch (err) {
                _didIteratorError3 = true;
                _iteratorError3 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion3 && _iterator3.return) {
                        _iterator3.return();
                    }
                } finally {
                    if (_didIteratorError3) {
                        throw _iteratorError3;
                    }
                }
            }
        }
    }, {
        key: 'toStringFancy',
        value: function toStringFancy(gb) {
            var rows = [];
            for (var j = 0; j < gb.height; j++) {
                var column = [];
                for (var i = 0; i < gb.width; i++) {
                    var piece = gb._get(new _geometry2d.Point(i, j));
                    if (piece == null) column.push('.');else {
                        if (piece != null) {
                            column.push(piece.toString());
                        } else throw new Error();
                    }
                }
                rows.push(column.join(''));
            }
            var board = rows.join('\n');
            return board + '\n--\n' + gb.captured.toString();
        }
    }, {
        key: 'toStringFancyBoardsOnly',
        value: function toStringFancyBoardsOnly(__gameBoards) {
            var _gameBoards = GameBoard.boardsOnly(__gameBoards);
            var gameBoards = _gameBoards.map(function (x) {
                return x.toStringFancy();
            });
            var gameBoardsSliced = gameBoards.map(function (x) {
                return x.split(/\r?\n/);
            });
            var gameBoardsSlicedTr = (0, _transpose.transpose)(gameBoardsSliced);
            var rv = gameBoardsSlicedTr.map(function (x) {
                return x.join('  I  ');
            }).join('\n');
            return rv;
        }
    }, {
        key: 'toStringFancyMovesOnly',
        value: function toStringFancyMovesOnly(movesToGameBoardsMap) {
            var movesToGameBoardsArr = Array.from(movesToGameBoardsMap.entries());
            var moves = movesToGameBoardsArr.map(function (_ref13) {
                var _ref14 = _slicedToArray(_ref13, 2);

                var k = _ref14[0];
                var v = _ref14[1];
                return k;
            });
            return '[' + moves.join(', ') + ']';
        }
    }]);

    return GameBoard;
}();

exports.Point = _geometry2d.Point;
exports.PieceSet = _pieceSetFactory.PieceSet;
exports.GameBoard = GameBoard;
//# sourceMappingURL=board-lib.js.map