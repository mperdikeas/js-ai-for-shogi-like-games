'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {
    var sourceMapSupport = require('source-map-support');
    sourceMapSupport.install();
})();

var Piece = function () {
    function Piece(code, isKing) {
        _classCallCheck(this, Piece);

        this.code = code;
        this.isKing = isKing;
    }

    _createClass(Piece, [{
        key: 'toString',
        value: function toString() {
            return this.code;
        }
    }]);

    return Piece;
}();

var PieceOnSide = function () {
    function PieceOnSide(piece, isSideA) {
        _classCallCheck(this, PieceOnSide);

        this;
        this.piece = piece;
        this.isSideA = isSideA;
    }

    _createClass(PieceOnSide, [{
        key: 'switchSides',
        value: function switchSides() {
            return new PieceOnSide(this.piece, !this.isSideA);
        }
    }, {
        key: 'switchSidesAndDemote',
        value: function switchSidesAndDemote() {
            return new PieceOnSide(this.piece.demote(), !this.isSideA);
        }
    }, {
        key: 'toString',
        value: function toString() {
            var rv = this.piece.toString();
            if (this.isSideA) rv = rv.toUpperCase();
            return rv;
        }
    }, {
        key: 'promote',
        value: function promote() {
            return new PieceOnSide(this.piece.promote(), this.isSideA);
        }
    }, {
        key: 'sameSide',
        value: function sameSide(o) {
            return this.isSideA === o.isSideA;
        }
    }, {
        key: 'equals',
        value: function equals(o) {
            (0, _assert2.default)(o instanceof PieceOnSide); // this library is designed in such a way as this should never be called with an argument that's not a PieceOnSide
            return this.piece === o.piece && this.sameSide(o);
        }
    }], [{
        key: 'fromString',
        value: function fromString(pieceSet, s) {
            var rvs = [];
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = pieceSet[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var piece = _step.value;

                    if (piece.code === s) rvs.push(new PieceOnSide(piece, false));
                    if (piece.code.toUpperCase() === s) rvs.push(new PieceOnSide(piece, true));
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

            (0, _assert2.default)(rvs.length === 1);
            (0, _assert2.default)(rvs[0] instanceof PieceOnSide);
            return rvs[0];
        }
    }]);

    return PieceOnSide;
}();

exports.Piece = Piece;
exports.PieceOnSide = PieceOnSide;
//# sourceMappingURL=piece.js.map