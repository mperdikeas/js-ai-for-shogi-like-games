'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TREE_NODE_ID_SYMBOL_KEY = 'mjb44-NODE-id';

var Node = function () {
    function Node(value) {
        _classCallCheck(this, Node);

        this.value = value;
        this.adornment = null;
        this.children = null;
    }

    _createClass(Node, [{
        key: 'isAdorned',
        value: function isAdorned() {
            var v = this.adornment !== null;
            if (false)
                // $SuppressFlowFinding: access of computed property/element. Indexable signature not found in ...
                console.log('isAdorned called on node [' + this[Symbol.for(TREE_NODE_ID_SYMBOL_KEY)] + '], returning: ' + v);
            return v;
        }
    }, {
        key: 'allChildrenSatisfy',
        value: function allChildrenSatisfy(f) {
            var rv = true;
            if (this.children != null) {
                this.children.forEach(function (v, e) {
                    if (!f(v)) rv = false;
                });
                return rv;
            } else throw new Error('bad choreography');
        }
    }, {
        key: 'getChildrenAdornments',
        value: function getChildrenAdornments() {
            if (this.children != null) {
                return Array.from(this.children.values()).map(function (x) {
                    return x.adornment;
                });
            } else throw new Error('bad choreography');
        }
    }, {
        key: 'adorn',
        value: function adorn(o) {
            var prevAdorn = this.adornment;
            this.adornment = o;
            return prevAdorn;
        }
    }, {
        key: 'set',
        value: function set(edge, node) {
            if (this.children === null) {
                this.children = new Map();
            }
            var children = this.children;
            if (children != null) {
                var prevValue = children.get(edge);
                children.set(edge, node);
                return prevValue;
            } else throw new Error('bug1');
        }
    }, {
        key: 'setn',
        value: function setn(edge, node) {
            var prevValue = this.set(edge, node);
            (0, _assert2.default)(prevValue === undefined);
        }
    }, {
        key: 'isLeaf',
        value: function isLeaf() {
            return this.children === null;
        }
    }, {
        key: 'depthFirstTraversal',
        value: function depthFirstTraversal(f, _visitStartNode) {
            var visitStartNode = _visitStartNode == null ? true : _visitStartNode;
            var cycleDetector = [];
            function _visit(n, parentN, birthEdge, firstVisit) {
                if (cycleDetector.includes(n)) throw new Error('cycle detected');
                cycleDetector.push(n);
                if (!(firstVisit && !visitStartNode)) {
                    f(n, parentN, birthEdge);
                }
                var children = n.children;
                if (children != null) {
                    children.forEach(function (v, k) {
                        _visit(v, n, k, false);
                    });
                }
            }
            _visit(this, null, null, true);
        }
    }, {
        key: 'descendants',
        value: function descendants(_includingThisNode) {
            var includingThisNode = _includingThisNode == null ? false : _includingThisNode;
            var descendants = [];
            function f(n) {
                descendants.push(n);
            }

            this.depthFirstTraversal(f, includingThisNode);
            (0, _assert2.default)(!includingThisNode && descendants.length === 0 && this.isLeaf() || !includingThisNode && descendants.length > 0 && !this.isLeaf() || includingThisNode && descendants.length > 0);
            return descendants;
        }
    }, {
        key: 'leafs',
        value: function leafs(_includingThisNode) {
            var includingThisNode = _includingThisNode == null ? false : _includingThisNode;
            var rv = [];
            function addLeavesOnly(n) {
                if (n.isLeaf()) rv.push(n);
            }
            this.depthFirstTraversal(addLeavesOnly, includingThisNode);
            return rv;
        }
    }, {
        key: 'edgeThatLeadsTo',
        value: function edgeThatLeadsTo(n) {
            (0, _assert2.default)(!this.isLeaf());
            var children = this.children;
            if (children != null) {
                var _ret = function () {
                    (0, _assert2.default)(children !== null);
                    var rv = [];
                    children.forEach(function (child, edge) {
                        var descendants = child.descendants(true);
                        if (descendants.includes(n)) rv.push(edge);
                    });
                    if (rv.length > 1) throw new Error('Bug! ${rv.length} edges leading to node: ${n} - impossible if the graph is a tree.');else if (rv.length === 0) return {
                            v: null
                        };else return {
                            v: rv[0]
                        };
                }();

                if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
            } else throw new Error('bug3');
        }
    }, {
        key: 'print',
        value: function print(printAdornment, _valuePrinter) {
            var valuePrinter = _valuePrinter == null ? function (x) {
                return '' + x;
            } : _valuePrinter;
            var s = Symbol.for(TREE_NODE_ID_SYMBOL_KEY); // Symbol();
            var i = 0;
            var lines = [];
            var printerVisitor = function printNode(n, parentN, birthEdge) {
                (0, _assert2.default)(parentN == null && birthEdge == null || parentN != null && birthEdge != null);
                if (!n.hasOwnProperty(s))
                    // $SuppressFlowFinding: access of computed property/element. Indexable signature not found in ...
                    n[s] = i++;
                if (parentN == null) {
                    (0, _assert2.default)(parentN === null);
                    (0, _assert2.default)(birthEdge === null);
                    (0, _assert2.default)(_lodash2.default.isEmpty(lines));
                    // $SuppressFlowFinding: access of computed property/element. Indexable signature not found in ...
                    var line = 'ROOT node #' + n[s] + ' with value: ' + valuePrinter(n.value);
                    if (printAdornment) line += ', adornment: ' + n.adornment;
                    lines.push(line);
                } else {
                    if (birthEdge != null) {
                        (0, _assert2.default)(birthEdge !== null);
                        // $SuppressFlowFinding: access of computed property/element. Indexable signature not found in ...                    
                        var _line = 'node #' + parentN[s] + ' ~~[' + birthEdge + ']~~> node #' + n[s] + ' with value: ' + valuePrinter(n.value);
                        if (printAdornment) _line += ', adornment: ' + n.adornment;
                        lines.push(_line);
                    } else throw new Error('bug');
                }
            };
            this.depthFirstTraversal(printerVisitor);
            return lines.join('\n');
        }
    }]);

    return Node;
}();

exports.Node = Node;
exports.TREE_NODE_ID_SYMBOL_KEY = TREE_NODE_ID_SYMBOL_KEY;
//# sourceMappingURL=trees.js.map