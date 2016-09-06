'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _piece = require('./piece.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CaptureBag = function () {
    function CaptureBag() {
        _classCallCheck(this, CaptureBag);

        if (arguments.length === 0) this.capturedPieces = [];else {
            (0, _assert2.default)(arguments.length === 1);
            (0, _assert2.default)(_lodash2.default.isArray(arguments[0]));
            arguments[0].forEach(function (x) {
                (0, _assert2.default)(x instanceof _piece.PieceOnSide);
            });
            this.capturedPieces = arguments[0];
        }
    }

    _createClass(CaptureBag, [{
        key: 'capture',
        value: function capture(p) {
            this.capturedPieces.push(p.switchSidesAndDemote());
        }
    }, {
        key: 'dropOptions',
        value: function dropOptions(sideA) {
            return _lodash2.default.uniq(this.capturedPieces.filter(function (x) {
                return sideA === x.isSideA;
            }).map(function (x) {
                return x.piece;
            }));
        }
    }, {
        key: 'has',
        value: function has(p) {
            return _lodash2.default.some(this.capturedPieces, function (x) {
                return x.equals(p);
            });
        }
    }, {
        key: 'hasBeenDroppedBackInTheBoard',
        value: function hasBeenDroppedBackInTheBoard(p) {
            (0, _assert2.default)(this.has(p), 'Piece ' + p.toString() + ' not found for removal in capture bag: ' + this.toString());
            var pieceWasFound = false;
            for (var i = this.capturedPieces.length - 1; i >= 0; i--) {
                if (this.capturedPieces[i].equals(p)) {
                    this.capturedPieces.splice(i, 1);
                    pieceWasFound = true;
                    break;
                }
            }
            (0, _assert2.default)(pieceWasFound, 'bug at this point');
        }
    }, {
        key: 'clone',
        value: function clone() {
            return new CaptureBag(this.capturedPieces.slice());
        }
    }, {
        key: 'reflection',
        value: function reflection() {
            return new CaptureBag(this.capturedPieces.map(function (x) {
                return x.switchSides();
            }));
        }
    }, {
        key: 'toString',
        value: function toString() {
            return _lodash2.default.sortBy(this.capturedPieces.map(function (x) {
                return x.toString();
            })).join('');
        }
    }]);

    return CaptureBag;
}();

exports.CaptureBag = CaptureBag;
//# sourceMappingURL=captureBag.js.map