'use strict';

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function transpose(m) {
    var rv = [];
    var rows = m.length;
    var cols = m[0].length;
    for (var j = 0; j < cols; j++) {
        for (var i = 0; i < rows; i++) {
            if (!rv[j]) {
                rv[j] = [];
            }
            rv[j][i] = m[i][j];
        }
    }
    (0, _assert2.default)(rv.length === cols);
    (0, _assert2.default)(rv[0].length === rows);
    return rv;
}

exports.transpose = transpose;
//# sourceMappingURL=transpose.js.map