'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Side = function () {
    function Side() {
        _classCallCheck(this, Side);

        Object.freeze(this);
    }

    _createClass(Side, [{
        key: 'theOther',
        value: function theOther() {
            if (this === Side.A) return Side.B;
            if (this === Side.B) return Side.A;
            throw new Error();
        }
    }], [{
        key: 'fromWhetherIsSideA',
        value: function fromWhetherIsSideA(isSideA) {
            if (isSideA) return Side.A;else return Side.B;
        }
    }]);

    return Side;
}();

Side.A = new Side();
Side.B = new Side();


Object.freeze(Side);

exports.Side = Side;
//# sourceMappingURL=side.js.map