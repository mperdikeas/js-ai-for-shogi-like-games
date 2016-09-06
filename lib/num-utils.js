'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function assertArrayOfNotAscendingPositiveValues(o) {
    (0, _assert2.default)(Array.isArray(o));
    var prevValue = Number.POSITIVE_INFINITY;
    for (var i = 0; i < o.length; i++) {
        (0, _assert2.default)(_typeof(o[i]) === _typeof(0), 'The element on the ' + i + '-th index is *not* a number');
        if (o[i] < 0) throw new Error('When examining array: [' + o.join(',') + '] I observed that the value on index ' + i + ' (' + o[i] + ') is less than zero');
        if (o[i] > prevValue) throw new Error('When examining array: [' + o.join(',') + '] I observed that the value on index ' + i + ' (' + o[i] + ') is greater than the value of the previous index (' + prevValue + '). This will cause kittens to die');
        prevValue = o[i];
    }
}

exports.assertArrayOfNotAscendingPositiveValues = assertArrayOfNotAscendingPositiveValues;
//# sourceMappingURL=num-utils.js.map