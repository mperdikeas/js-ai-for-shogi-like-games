'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _side = require('./side.js');

var _geometry2d = require('geometry-2d');

var _piece = require('./piece.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Move = function () {
    function Move() {
        _classCallCheck(this, Move);
    }

    _createClass(Move, null, [{
        key: 'fromString',
        value: function fromString(pieceSet, s) {
            if (s.startsWith('(')) return BoardMove.bmFromString(s);else return DropMove.dmFromString(pieceSet, s);
        }
    }, {
        key: 'fromStringNoPieceSetInfo',
        value: function fromStringNoPieceSetInfo(s) {
            if (s.startsWith('(')) return BoardMove.bmFromString(s);else return DropMoveNoPieceInformation.dmFromStringNoPieceSet(s);
        }
    }]);

    return Move;
}();

var BoardMove = function (_Move) {
    _inherits(BoardMove, _Move);

    function BoardMove(vector) {
        _classCallCheck(this, BoardMove);

        var _this = _possibleConstructorReturn(this, (BoardMove.__proto__ || Object.getPrototypeOf(BoardMove)).call(this));

        _this.vector = vector;
        return _this;
    }

    _createClass(BoardMove, [{
        key: 'toString',
        value: function toString() {
            return this.vector.toString();
        }
    }, {
        key: 'equals',
        value: function equals(o) {
            if (!(o instanceof BoardMove)) return false;else return this.vector.equals(o.vector);
        }
    }], [{
        key: 'bmFromString',
        value: function bmFromString(s) {
            return new BoardMove(_geometry2d.Vector.fromString(s));
        }
    }]);

    return BoardMove;
}(Move);

var DropMoveNoPieceInformation = function (_Move2) {
    _inherits(DropMoveNoPieceInformation, _Move2);

    function DropMoveNoPieceInformation(side, to) {
        _classCallCheck(this, DropMoveNoPieceInformation);

        var _this2 = _possibleConstructorReturn(this, (DropMoveNoPieceInformation.__proto__ || Object.getPrototypeOf(DropMoveNoPieceInformation)).call(this));

        _this2.side = side;
        _this2.to = to;
        return _this2;
    }

    _createClass(DropMoveNoPieceInformation, [{
        key: 'toString',
        value: function toString() {
            return '$?{this.side}=>' + this.to;
        }
    }, {
        key: 'equals',
        value: function equals(o) {
            if (!(o instanceof DropMoveNoPieceInformation)) {
                return false;
            } else {
                var b1 = o.side === this.side;
                var b2 = o.to.equals(this.to);
                return b1 && b2;
            }
        }
    }], [{
        key: 'dmFromStringNoPieceSet',
        value: function dmFromStringNoPieceSet(s) {
            var parts = s.split('=>');
            (0, _assert2.default)(parts.length === 2, JSON.stringify(parts));
            var side = parts[0] === parts[0].toUpperCase() ? _side.Side.A : _side.Side.B;
            var point = _geometry2d.Point.fromString(parts[1]);
            return new DropMoveNoPieceInformation(side, point);
        }
    }]);

    return DropMoveNoPieceInformation;
}(Move);

var DropMove = function (_DropMoveNoPieceInfor) {
    _inherits(DropMove, _DropMoveNoPieceInfor);

    function DropMove(pieceOnSide, to) {
        _classCallCheck(this, DropMove);

        var _this3 = _possibleConstructorReturn(this, (DropMove.__proto__ || Object.getPrototypeOf(DropMove)).call(this, pieceOnSide.isSideA ? _side.Side.A : _side.Side.B, to));

        _this3.pieceOnSide = pieceOnSide;
        return _this3;
    }

    _createClass(DropMove, [{
        key: 'toString',
        value: function toString() {
            return this.pieceOnSide + '=>' + this.to;
        }
    }, {
        key: 'equals',
        value: function equals(o) {
            if (!(o instanceof DropMove)) {
                return false;
            } else {
                var b1 = o.pieceOnSide.equals(this.pieceOnSide);
                var b2 = o.to.equals(this.to);
                return b1 && b2;
            }
        }
    }], [{
        key: 'dmFromString',
        value: function dmFromString(pieceSet, s) {
            var parts = s.split('=>');
            (0, _assert2.default)(parts.length === 2, JSON.stringify(parts));
            var pieceOnSide = _piece.PieceOnSide.fromString(pieceSet, parts[0]);
            var point = _geometry2d.Point.fromString(parts[1]);
            return new DropMove(pieceOnSide, point);
        }
    }]);

    return DropMove;
}(DropMoveNoPieceInformation);

exports.Move = Move;
exports.BoardMove = BoardMove;
exports.DropMoveNoPieceInformation = DropMoveNoPieceInformation;
exports.DropMove = DropMove;
//# sourceMappingURL=moves.js.map