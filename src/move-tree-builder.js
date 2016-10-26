// @flow
'use strict';

(function() {
    const sourceMapSupport = require('source-map-support');
    sourceMapSupport.install();
})();

import assert from 'assert';
import _ from 'lodash';

import not_used from './number-prototype.js';

import {GameBoard}                       from './board-lib.js';
import {Node, TREE_NODE_ID_SYMBOL_KEY}   from './trees.js';
import {Side}                            from './side.js';
import {theOne}                          from './utils.js';
import {Move, BoardMove, DropMove}       from './moves.js';
import {EvaluationModel}                 from './eval-model.js';

function moveTreeBuilder(gb: GameBoard, sideToMoveNext: boolean, depth: number): Node<GameBoard, string> {

    const root:Node<GameBoard, string> = new Node(gb);

    function _moveTreeBuilder(root: Node<GameBoard, string>, gb: GameBoard, sideToMoveNext: boolean, depthRemaining: number): void {
        if (depthRemaining===0)
            return; // put a floor to the recursion if we reached maximum depth
        if (gb.boardImmediateWinSide()!==null)
            return; // put a floor to the recursion if we reached a game end state
        const nextMoves: Map<string, GameBoard> = gb.nextStates(sideToMoveNext);
        nextMoves.forEach( (board: GameBoard, k: string) => {
            const n: Node<GameBoard, string> = new Node(board);
            root.set(k, n);
            _moveTreeBuilder(n, board, !sideToMoveNext, depthRemaining-1);
        });
    }

    _moveTreeBuilder(root, gb, sideToMoveNext, depth);
    assertConsistent(root);
    return root;
}

function bestMove(gb: GameBoard, sideA: boolean, depth: number, evalModel: EvaluationModel, pieceSet: Array<IConcretePiece>): any { // BoardMove | DropMove // TODO
    const moveTree: Node<GameBoard, string> = moveTreeBuilder(gb, sideA, depth);
    evaluateLeaves(moveTree, evalModel);
    if (false)
    console.log(`\n\n\n**** Upon leaves evaluation:\n${moveTree.print(true)}`);
    pullEvaluationsUp(sideA, moveTree);
    if (false)
    console.log(`\n\n\n**** When evaluations are pulled up:\n${moveTree.print(true)}`);
    const scoreSelector : (a: number, b: number)=> number = sideA? Math.max: Math.min;
    const cmp  : (a: number, b: number) => number = sideA? (a,b)=>a>b : (a,b)=>a<b;
    let currentlyBestScore: number  = sideA? -Infinity: Infinity;
    let currentlyShallowestDepth = Infinity;
    let selectedEdge: ?string = null;
    if (moveTree.children!=null) {
        moveTree.children.forEach( (v: Node<GameBoard, string>, e: string) => {
            assert(v.isAdorned());
            if (selectedEdge === null) // initialize the selected edge (for hopeless situations where every move leads to the same infinity outcome and the if below would never be triggered) // TODO maybe I can lose that guard as the newly added currentlyShallowestDepth check should take care of this edge case
                selectedEdge = e;
//            if ((scoreSelector(v.adornment.v, currentlyBestScore)!=currentlyBestScore) ||
//                ((scoreSelector(v.adornment.v, currentlyBestScore)==currentlyBestScore) &&
            if (cmp(v.adornment.v, currentlyBestScore) ||
                ((v.adornment.v === currentlyBestScore) &&                 
                 (v.adornment.d < currentlyShallowestDepth))) {
                if (false)
                    console.log(`trying the edge ${e} led to a score of ${v.adornment.v} which is preferrable (given moving side ${sideA?'side A':'side B'}) to that of ${currentlyBestScore} or the depth of ${v.adornment.d} is shallower than the currently shallowest depth of ${currentlyShallowestDepth}`);
                selectedEdge = e;
                currentlyBestScore = scoreSelector(v.adornment.v, currentlyBestScore);
                currentlyShallowestDepth = v.adornment.d;
            }
        });
        if (selectedEdge!=null) {
            return Move.fromString(pieceSet, selectedEdge);
        } else throw new Error(`inconceivable that it was impossible to select an edge`);
    } else throw new Error(`inconceivable to ask for bestMove on a leaf!`);
}

function dynamicEvaluationOfBoard(gb: GameBoard, sideAIsMoving: boolean, depth: number, evalModel: EvaluationModel, pieceSet: Array<IConcretePiece>): number {
    const moveTree: Node<GameBoard, string> = moveTreeBuilder(gb, sideAIsMoving, depth);
    evaluateLeaves(moveTree, evalModel);
    if (false)
        console.log(`\n\n\n**** Upon leaves evaluation:\n${moveTree.print(true, null, (x)=>{
if (x===null)
    return 'null';
else
    return x.v;
})}`);
    pullEvaluationsUp(sideAIsMoving, moveTree);
    if (false)
        console.log(`\n\n\n**** Upon leaves pulling evaluation:\n${moveTree.print(true, null, (x)=>{
if (x===null)
    return 'null';
else
    return x.v;
})}`);    
    if (moveTree.adornment!=null) {
        return moveTree.adornment.v;
    } else throw new Error('root node should be adorned after evaluations are pulled up');
}

function evaluateLeaves(moveTree: Node<GameBoard, string>, evalModel: EvaluationModel): void {
    function adornLeaf(node: Node<GameBoard, string> ):void {
        if (node.isLeaf())
            node.adorn({v: evalModel.evaluateBoard(node.value), d: 0});
    }
    moveTree.depthFirstTraversal(adornLeaf, true);
}


function pullEvaluationsUp(sideA: boolean, currentNode: Node<GameBoard, string>, assertNoRecursion: boolean = false): void {
    if (false)
        // $SuppressFlowFinding: access of computed property/element. Indexable signature not found in ...
        console.log(`call to PEU at node: ${currentNode[Symbol.for(TREE_NODE_ID_SYMBOL_KEY)]}`);
    function isAdorned(n: Node<GameBoard,string>): boolean {
        return n.isAdorned();
    }
    if (currentNode.allChildrenSatisfy(isAdorned)) {
        let allChildrenValues: Array<any> = currentNode.getChildrenAdornments();
        let thisNodeAdorn = (()=>{
            let cmp = sideA?(a,b)=>a>b:(a,b)=>a<b;
            let bestNodeAdornSoFar;
            allChildrenValues.forEach ( (adorn) => {
                if (bestNodeAdornSoFar===undefined)
                    bestNodeAdornSoFar = Object.assign({}, adorn, {d: adorn.d+1});
                else {
                    if (cmp(adorn.v, bestNodeAdornSoFar.v))
                        bestNodeAdornSoFar = Object.assign({}, adorn, {d: adorn.d+1});
                }
            });
            return bestNodeAdornSoFar;
        })();
        assert(currentNode.adorn(thisNodeAdorn)===null);
    } else {
        if (assertNoRecursion)
            throw new Error('recursion was not expected');
        if (currentNode.children!=null) {
            currentNode.children.forEach( function(n: Node<GameBoard, string>, e: string) {
                if (!n.isAdorned())
                    pullEvaluationsUp(!sideA, n);
            });
            pullEvaluationsUp(sideA, currentNode, true);
        } else throw new Error('bug');
    }
    assert(currentNode.isAdorned());
}



function assertConsistent(tree: Node<GameBoard, string>): void {
    function _assertConsistent(tree: Node<GameBoard, string>, expectedSide: ?Side): void {
        if (!tree.isLeaf()) {
            if (tree.children!=null) {
                if (expectedSide!=null) {
                    tree.children.forEach( (newBoard: Node<GameBoard, string>, moveS: string)=> {
                        const side: Side = tree.value.sideOfMoveSNoPieceSetInfo(moveS);
                        if (side!==expectedSide)
                            throw new Error();
                        _assertConsistent(newBoard, side.theOther());
                    } );
                } else {
                    tree.children.forEach( (newBoard: Node<GameBoard, string>, moveS: string)=> {
                        const side: Side = tree.value.sideOfMoveSNoPieceSetInfo(moveS);
                        _assertConsistent(newBoard, side.theOther());
                    } );
                }
            } else throw new Error('bug');
        }
    }
    _assertConsistent(tree, null);
}

function sideThatMovesNext(tree: Node<GameBoard, string>): Side {

    assert(!tree.isLeaf());
    
    assertConsistent(tree);
    if (tree.children!=null) {
        let discoveredSide: ?Side = null;
            tree.children.forEach( (_: Node<GameBoard, string>, moveS: string)=> {
                const side: Side = tree.value.sideOfMoveSNoPieceSetInfo(moveS);
                if (discoveredSide===null)
                    discoveredSide = side;
                if ((discoveredSide!==null) && (discoveredSide!=side))
                    throw new Error();
            });
        if (discoveredSide!=null)
            return discoveredSide;
        else
            throw new Error('impossible to be unable to pronounce discovered side on a non-leaf tree');
    } else throw new Error('bug');    
}


exports.moveTreeBuilder          = moveTreeBuilder;
exports.sideThatMovesNext        = sideThatMovesNext;
exports.evaluateLeaves           = evaluateLeaves;
exports.pullEvaluationsUp        = pullEvaluationsUp;
exports.bestMove                 = bestMove;
exports.dynamicEvaluationOfBoard = dynamicEvaluationOfBoard;
