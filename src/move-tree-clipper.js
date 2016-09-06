// @flow
'use strict';

(function() {
    const sourceMapSupport = require('source-map-support');
    sourceMapSupport.install();
})();

import assert from 'assert';
import _ from 'lodash';

import not_used from './number-prototype.js';


import {GameBoard}             from './board-lib.js';
import {Node}                  from './trees.js';

function moveTreeClipper(tree: Node<GameBoard, string>): void {

    const sideAMakesTheFirstMove: boolean = true;

    function _moveTreeClipper(root: Node<GameBoard, string>, otherSideMovesSoClippingIsAllowed: boolean): void {
        if (root.isLeaf())
            return; // put a floor to the recursion if we reached a leaf
        if (root.children!=null) {
//            assert(true);
  
            root.children.forEach( (child: Node<GameBoard, string>, edge: string) => {
//                _moveTreeClipper(child, !otherSideMovesSoClippingIsAllowed);
            });

          if (otherSideMovesSoClippingIsAllowed) {

            }            
        } else throw new Error('bug');
    }

    _moveTreeClipper(tree, false);
}


export default moveTreeClipper;
