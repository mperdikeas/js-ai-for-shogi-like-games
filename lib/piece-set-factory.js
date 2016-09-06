'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {
    var sourceMapSupport = require('source-map-support');
    sourceMapSupport.install();
})();

var PieceSet = function () {
    function PieceSet() {
        _classCallCheck(this, PieceSet);

        this.pieces = new Map();
        this.isSealed = false;
    }

    _createClass(PieceSet, [{
        key: 'add',
        value: function add(piece) {
            if (!this.isSealed) {
                if (this.pieces.has(piece.code)) throw new Error('duplicate key: ${piece.code}');else this.pieces.set(piece.code, piece);
            } else throw new Error('set is sealed');
        }
    }, {
        key: 'seal',
        value: function seal() {
            this.isSealed = true;
        }
    }, {
        key: 'fromCode',
        value: function fromCode(code) {
            return this.pieces.get(code);
        }
    }]);

    return PieceSet;
}();

function createPieceSet(pieces) {
    if (pieces.length === 0) throw new Error('set needs at least one piece');
    var kings = _lodash2.default.filter(pieces, function (x) {
        return x.isKing;
    });
    if (kings.length !== 1) throw new Error('set needs to have exactly one King; it instead contains ' + kings.length);
    var rv = new PieceSet();
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = pieces[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var piece = _step.value;

            rv.add(piece);
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

    rv.seal();
    return rv;
}

exports.PieceSet = PieceSet;
exports.createPieceSet = createPieceSet;
//# sourceMappingURL=piece-set-factory.js.map