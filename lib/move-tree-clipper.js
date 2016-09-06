'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _numberPrototype = require('./number-prototype.js');

var _numberPrototype2 = _interopRequireDefault(_numberPrototype);

var _boardLib = require('./board-lib.js');

var _trees = require('./trees.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(function () {
    var sourceMapSupport = require('source-map-support');
    sourceMapSupport.install();
})();

function moveTreeClipper(tree) {

    var sideAMakesTheFirstMove = true;

    function _moveTreeClipper(root, otherSideMovesSoClippingIsAllowed) {
        if (root.isLeaf()) return; // put a floor to the recursion if we reached a leaf
        if (root.children != null) {
            //            assert(true);

            root.children.forEach(function (child, edge) {
                //                _moveTreeClipper(child, !otherSideMovesSoClippingIsAllowed);
            });

            if (otherSideMovesSoClippingIsAllowed) {}
        } else throw new Error('bug');
    }

    _moveTreeClipper(tree, false);
}

exports.default = moveTreeClipper;
//# sourceMappingURL=move-tree-clipper.js.map