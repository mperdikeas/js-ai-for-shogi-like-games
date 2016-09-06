'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _numberPrototype = require('./number-prototype.js');

var _numberPrototype2 = _interopRequireDefault(_numberPrototype);

var _piece = require('./piece.js');

var _geometry2d = require('geometry-2d');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

(function () {
    var sourceMapSupport = require('source-map-support');
    sourceMapSupport.install();
})();

var Chick = new (function (_Piece) {
    _inherits(_class, _Piece);

    function _class(code) {
        _classCallCheck(this, _class);

        var _this = _possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).call(this, code, false));

        _this;
        return _this;
    }

    _createClass(_class, [{
        key: 'moves',
        value: function moves() {
            return [new _geometry2d.Point(0, -1)];
        }
    }, {
        key: 'takeSides',
        value: function takeSides(isSideA) {
            return new _piece.PieceOnSide(this, isSideA);
        }
    }, {
        key: 'demote',
        value: function demote() {
            return this;
        }
    }, {
        key: 'promote',
        value: function promote() {
            return Hen;
        }
    }, {
        key: 'isPromotable',
        value: function isPromotable() {
            return this !== this.promote();
        }
    }]);

    return _class;
}(_piece.Piece))('c');

var Elephant = new (function (_Piece2) {
    _inherits(_class2, _Piece2);

    function _class2(code) {
        _classCallCheck(this, _class2);

        var _this2 = _possibleConstructorReturn(this, (_class2.__proto__ || Object.getPrototypeOf(_class2)).call(this, code, false));

        _this2;
        return _this2;
    }

    _createClass(_class2, [{
        key: 'moves',
        value: function moves() {
            return [new _geometry2d.Point(1, -1), new _geometry2d.Point(1, 1), new _geometry2d.Point(-1, -1), new _geometry2d.Point(-1, 1)];
        }
    }, {
        key: 'takeSides',
        value: function takeSides(isSideA) {
            return new _piece.PieceOnSide(this, isSideA);
        }
    }, {
        key: 'demote',
        value: function demote() {
            return this;
        }
    }, {
        key: 'promote',
        value: function promote() {
            return this;
        }
    }, {
        key: 'isPromotable',
        value: function isPromotable() {
            return this !== this.promote();
        }
    }]);

    return _class2;
}(_piece.Piece))('e');

var Giraffe = new (function (_Piece3) {
    _inherits(_class3, _Piece3);

    function _class3(code) {
        _classCallCheck(this, _class3);

        var _this3 = _possibleConstructorReturn(this, (_class3.__proto__ || Object.getPrototypeOf(_class3)).call(this, code, false));

        _this3;
        return _this3;
    }

    _createClass(_class3, [{
        key: 'moves',
        value: function moves() {
            return [new _geometry2d.Point(0, -1), new _geometry2d.Point(1, 0), new _geometry2d.Point(0, 1), new _geometry2d.Point(-1, 0)];
        }
    }, {
        key: 'takeSides',
        value: function takeSides(isSideA) {
            return new _piece.PieceOnSide(this, isSideA);
        }
    }, {
        key: 'demote',
        value: function demote() {
            return this;
        }
    }, {
        key: 'promote',
        value: function promote() {
            return this;
        }
    }, {
        key: 'isPromotable',
        value: function isPromotable() {
            return this !== this.promote();
        }
    }]);

    return _class3;
}(_piece.Piece))('g');

var Hen = new (function (_Piece4) {
    _inherits(_class4, _Piece4);

    function _class4(code) {
        _classCallCheck(this, _class4);

        var _this4 = _possibleConstructorReturn(this, (_class4.__proto__ || Object.getPrototypeOf(_class4)).call(this, code, false));

        _this4;
        return _this4;
    }

    _createClass(_class4, [{
        key: 'moves',
        value: function moves() {
            return [new _geometry2d.Point(0, -1), new _geometry2d.Point(1, -1), new _geometry2d.Point(1, 0), new _geometry2d.Point(0, 1), new _geometry2d.Point(-1, 0), new _geometry2d.Point(-1, -1)];
        }
    }, {
        key: 'takeSides',
        value: function takeSides(isSideA) {
            return new _piece.PieceOnSide(this, isSideA);
        }
    }, {
        key: 'demote',
        value: function demote() {
            return Chick;
        }
    }, {
        key: 'promote',
        value: function promote() {
            return this;
        }
    }, {
        key: 'isPromotable',
        value: function isPromotable() {
            return this !== this.promote();
        }
    }]);

    return _class4;
}(_piece.Piece))('h');

var Lion = new (function (_Piece5) {
    _inherits(_class5, _Piece5);

    function _class5(code) {
        _classCallCheck(this, _class5);

        var _this5 = _possibleConstructorReturn(this, (_class5.__proto__ || Object.getPrototypeOf(_class5)).call(this, code, true));

        _this5;
        return _this5;
    }

    _createClass(_class5, [{
        key: 'moves',
        value: function moves() {
            return [new _geometry2d.Point(0, -1), new _geometry2d.Point(1, -1), new _geometry2d.Point(1, 0), new _geometry2d.Point(1, 1), new _geometry2d.Point(0, 1), new _geometry2d.Point(-1, 1), new _geometry2d.Point(-1, 0), new _geometry2d.Point(-1, -1)];
        }
    }, {
        key: 'takeSides',
        value: function takeSides(isSideA) {
            return new _piece.PieceOnSide(this, isSideA);
        }
    }, {
        key: 'demote',
        value: function demote() {
            return this;
        }
    }, {
        key: 'promote',
        value: function promote() {
            return this;
        }
    }, {
        key: 'isPromotable',
        value: function isPromotable() {
            return this !== this.promote();
        }
    }]);

    return _class5;
}(_piece.Piece))('l');

exports.Chick = Chick;
exports.Hen = Hen;
exports.Elephant = Elephant;
exports.Giraffe = Giraffe;
exports.Lion = Lion;
//# sourceMappingURL=piece-set.js.map