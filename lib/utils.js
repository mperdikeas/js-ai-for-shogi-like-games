'use strict';

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function allValuesEqual(arr) {
    return _lodash2.default.uniq(arr).length <= 1;
}

function theOne(arr) {
    (0, _assert2.default)(allValuesEqual(arr));
    (0, _assert2.default)(arr.length > 0);
    return arr[0];
}

exports.allValuesEqual = allValuesEqual;
exports.theOne = theOne;
//# sourceMappingURL=utils.js.map