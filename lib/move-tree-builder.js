'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _numberPrototype = require('./number-prototype.js');

var _numberPrototype2 = _interopRequireDefault(_numberPrototype);

var _boardLib = require('./board-lib.js');

var _trees = require('./trees.js');

var _side = require('./side.js');

var _utils = require('./utils.js');

var _moves = require('./moves.js');

var _evalModel = require('./eval-model.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(function () {
    var sourceMapSupport = require('source-map-support');
    sourceMapSupport.install();
})();

function moveTreeBuilder(gb, sideToMoveNext, depth) {

    var root = new _trees.Node(gb);

    function _moveTreeBuilder(root, gb, sideToMoveNext, depthRemaining) {
        if (depthRemaining === 0) return; // put a floor to the recursion if we reached maximum depth
        if (gb.boardImmediateWinSide() !== null) return; // put a floor to the recursion if we reached a game end state
        var nextMoves = gb.nextStates(sideToMoveNext);
        nextMoves.forEach(function (board, k) {
            var n = new _trees.Node(board);
            root.set(k, n);
            _moveTreeBuilder(n, board, !sideToMoveNext, depthRemaining - 1);
        });
    }

    _moveTreeBuilder(root, gb, sideToMoveNext, depth);
    assertConsistent(root);
    return root;
}

function bestMove(gb, sideA, depth, evalModel, pieceSet) {
    // BoardMove | DropMove // TODO
    var moveTree = moveTreeBuilder(gb, sideA, depth);
    evaluateLeaves(moveTree, evalModel);
    if (false) console.log('\n\n\n**** Upon leaves evaluation:\n' + moveTree.print(true));
    pullEvaluationsUp(sideA, moveTree);
    if (false) console.log('\n\n\n**** When evaluations are pulled up:\n' + moveTree.print(true));
    var scoreSelector = sideA ? Math.max : Math.min;
    var currentlyBestScore = sideA ? -Infinity : Infinity;
    var selectedEdge = null;
    if (moveTree.children != null) {
        moveTree.children.forEach(function (v, e) {
            (0, _assert2.default)(v.isAdorned());
            if (selectedEdge === null) // initialize the selected edge (for hopeless situations where every move leads to the same infinity outcome and the if below would never be triggered)
                selectedEdge = e;
            if (scoreSelector(v.adornment, currentlyBestScore) != currentlyBestScore) {
                if (false) console.log('trying the edge ' + e + ' led to a score of ' + scoreSelector(v.adornment, currentlyBestScore) + ' which is better than the currently bestScore of ' + currentlyBestScore);
                selectedEdge = e;
                currentlyBestScore = scoreSelector(v.adornment, currentlyBestScore);
            }
        });
        if (selectedEdge != null) return _moves.Move.fromString(pieceSet, selectedEdge);else throw new Error('inconceivable that it was impossible to select an edge');
    } else throw new Error('inconceivable to ask for bestMove on a leaf!');
}

function dynamicEvaluationOfBoard(gb, sideA, depth, evalModel, pieceSet) {
    var moveTree = moveTreeBuilder(gb, sideA, depth);
    evaluateLeaves(moveTree, evalModel);
    if (false) console.log('\n\n\n**** Upon leaves evaluation:\n' + moveTree.print(true));
    pullEvaluationsUp(sideA, moveTree);
    if (moveTree.adornment != null) {
        return moveTree.adornment;
    } else throw new Error('root node should be adorned after evaluations are pulled up');
}

function evaluateLeaves(moveTree, evalModel) {
    function adornLeaf(node) {
        if (node.isLeaf()) node.adorn(evalModel.evaluateBoard(node.value));
    }
    moveTree.depthFirstTraversal(adornLeaf, true);
}

function pullEvaluationsUp(sideA, currentNode) {
    var assertNoRecursion = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

    if (false)
        // $SuppressFlowFinding: access of computed property/element. Indexable signature not found in ...
        console.log('call to PEU at node: ' + currentNode[Symbol.for(_trees.TREE_NODE_ID_SYMBOL_KEY)]);
    function isAdorned(n) {
        return n.isAdorned();
    }
    if (currentNode.allChildrenSatisfy(isAdorned)) {
        var allChildrenValues = currentNode.getChildrenAdornments();
        var selectorToUse = sideA ? Math.max : Math.min;
        var thisNodeAdorn = selectorToUse.apply(null, allChildrenValues);
        (0, _assert2.default)(currentNode.adorn(thisNodeAdorn) === null);
    } else {
        if (assertNoRecursion) throw new Error('recursion was not expected');
        if (currentNode.children != null) {
            currentNode.children.forEach(function (n, e) {
                if (!n.isAdorned()) pullEvaluationsUp(!sideA, n);
            });
            pullEvaluationsUp(sideA, currentNode, true);
        } else throw new Error('bug');
    }
    (0, _assert2.default)(currentNode.isAdorned());
}

function assertConsistent(tree) {
    function _assertConsistent(tree, expectedSide) {
        if (!tree.isLeaf()) {
            if (tree.children != null) {
                if (expectedSide != null) {
                    tree.children.forEach(function (newBoard, moveS) {
                        var side = tree.value.sideOfMoveSNoPieceSetInfo(moveS);
                        if (side !== expectedSide) throw new Error();
                        _assertConsistent(newBoard, side.theOther());
                    });
                } else {
                    tree.children.forEach(function (newBoard, moveS) {
                        var side = tree.value.sideOfMoveSNoPieceSetInfo(moveS);
                        _assertConsistent(newBoard, side.theOther());
                    });
                }
            } else throw new Error('bug');
        }
    }
    _assertConsistent(tree, null);
}

function sideThatMovesNext(tree) {

    (0, _assert2.default)(!tree.isLeaf());

    assertConsistent(tree);
    if (tree.children != null) {
        var _ret = function () {
            var discoveredSide = null;
            tree.children.forEach(function (_, moveS) {
                var side = tree.value.sideOfMoveSNoPieceSetInfo(moveS);
                if (discoveredSide === null) discoveredSide = side;
                if (discoveredSide !== null && discoveredSide != side) throw new Error();
            });
            if (discoveredSide != null) return {
                    v: discoveredSide
                };else throw new Error('impossible to be unable to pronounce discovered side on a non-leaf tree');
        }();

        if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
    } else throw new Error('bug');
}

exports.moveTreeBuilder = moveTreeBuilder;
exports.sideThatMovesNext = sideThatMovesNext;
exports.evaluateLeaves = evaluateLeaves;
exports.pullEvaluationsUp = pullEvaluationsUp;
exports.bestMove = bestMove;
exports.dynamicEvaluationOfBoard = dynamicEvaluationOfBoard;
//# sourceMappingURL=move-tree-builder.js.map