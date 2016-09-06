// @flow
'use strict';

import _ from 'lodash';
import assert from 'assert';

type F<V,E> = (n: Node<V, E>, parentN: ?Node<V, E>, birthEdge: ?E)=> void;
type FV<V,E> = (n: Node<V, E>)=> boolean;
type ValuePrinter<V> = (v: V)=>string;


const TREE_NODE_ID_SYMBOL_KEY: string = 'mjb44-NODE-id';

class Node<V, E> {
    value: V;
    adornment: any;
    children: ?Map<E, Node<V,E>>;

    constructor(value: V) {
        this.value = value;
        this.adornment = null;
        this.children = null;
    }

    isAdorned(): boolean {
        const v = this.adornment!==null;
        if (false)
            // $SuppressFlowFinding: access of computed property/element. Indexable signature not found in ...
            console.log(`isAdorned called on node [${this[Symbol.for(TREE_NODE_ID_SYMBOL_KEY)]}], returning: ${v}`);
        return v;
    }

    allChildrenSatisfy(f: FV<V,E>): boolean {
        let rv: boolean = true;
        if (this.children!=null) {
            this.children.forEach( (v:Node<V,E>, e:E) => {
                if (!f(v))
                    rv = false;
            });
            return rv;
        } else throw new Error('bad choreography');
    }

    getChildrenAdornments(): Array<any> {
        if (this.children!=null) {
            return Array.from(this.children.values()).map( (x)=>x.adornment);
        } else throw new Error('bad choreography');
    }

    adorn(o: any): any {
        const prevAdorn = this.adornment;
        this.adornment = o;
        return prevAdorn;
    }

    set(edge: E, node: Node<V,E>): ?Node<V,E> {
        if (this.children === null) {
            this.children = new Map();
        }
        const children: ?Map<E, Node> = this.children;
        if (children!=null) {
            const prevValue: ?Node = children.get(edge);
            children.set(edge, node);
            return prevValue;
        } else throw new Error('bug1');
    }

    setn(edge: E, node: Node<V,E>): void {
        const prevValue: ?Node = this.set(edge, node);
        assert(prevValue===undefined);
    }

    isLeaf(): boolean {
        return this.children === null;
    }

    depthFirstTraversal(f: F<V,E>, _visitStartNode: ?boolean): void {
        const visitStartNode: boolean = _visitStartNode == null ? true : _visitStartNode;
        const cycleDetector: Array<Node<V,E>> = [];
        function _visit(n: Node<V,E>, parentN: ?Node<V,E>, birthEdge: ?E, firstVisit: boolean) {
            if (cycleDetector.includes(n)) throw new Error('cycle detected');
            cycleDetector.push(n);
            if (!(firstVisit && !visitStartNode)) {
                f(n, parentN, birthEdge);
            }
            const children: ?Map<E, Node<V,E>> = n.children;
            if (children != null) {
                children.forEach( (v: Node<V,E>, k: E) => {
                    _visit(v, n, k, false);
                });
            }
        }
        _visit(this, null, null, true);        
    }

    descendants(_includingThisNode: ?boolean): Array<Node> {
        const includingThisNode: boolean = _includingThisNode == null ? false : _includingThisNode;
        const descendants: Array<Node> = [];
        function f(n : Node) {
            descendants.push(n);
        }

        this.depthFirstTraversal(f, includingThisNode);
        assert(   ((!includingThisNode) && (descendants.length===0) && ( this.isLeaf())) ||
                  ((!includingThisNode) && (descendants.length>  0) && (!this.isLeaf())) ||
                  (( includingThisNode) && (descendants.length>  0)) );
        return descendants;
    }

    leafs(_includingThisNode: ?boolean): Array<Node<V,E>> {
        const includingThisNode: boolean = _includingThisNode == null ? false : _includingThisNode;        
        const rv: Array<Node<V,E>> = [];
        function addLeavesOnly(n: Node): void {
            if (n.isLeaf())
                rv.push(n);
        }
        this.depthFirstTraversal(addLeavesOnly, includingThisNode);
        return rv;
    }

    edgeThatLeadsTo(n: Node): ?E {
        assert(!this.isLeaf());
        const children: ?Map<E, Node> = this.children;
        if (children != null) {
            assert(children !== null);
            const rv: Array<E> = [];
            children.forEach( function (child: Node, edge: E) {
                const descendants: Array<Node> = child.descendants(true);
                if (descendants.includes(n))
                    rv.push(edge);
            });
            if (rv.length > 1) throw new Error('Bug! ${rv.length} edges leading to node: ${n} - impossible if the graph is a tree.');
            else if (rv.length === 0) return null;
            else return rv[0];
        } else throw new Error('bug3');
    }

    print(printAdornment: boolean, _valuePrinter: ?ValuePrinter<V>): string {
        let valuePrinter: ValuePrinter<V> = (_valuePrinter==null?(x)=>`${x}`:_valuePrinter);
        const s: symbol = Symbol.for(TREE_NODE_ID_SYMBOL_KEY);// Symbol();
        let i: number = 0;
        const lines: Array<string> = [];
        const printerVisitor: F<V,E> = function printNode(n: Node<V,E>, parentN: ?Node<V,E>, birthEdge: ?E) {
            assert( ((parentN==null) && (birthEdge==null)) || ((parentN!=null) && (birthEdge!=null)) );
            if (!n.hasOwnProperty(s))
                // $SuppressFlowFinding: access of computed property/element. Indexable signature not found in ...
                n[s] = i++;
            if (parentN==null) {
                assert(parentN===null);
                assert(birthEdge===null);
                assert(_.isEmpty(lines));
                // $SuppressFlowFinding: access of computed property/element. Indexable signature not found in ...
                let line: string = `ROOT node #${n[s]} with value: ${valuePrinter(n.value)}`;
                if (printAdornment)
                    line+=`, adornment: ${n.adornment}`;
                lines.push(line);
            } else {
                if (birthEdge!=null) {
                    assert(birthEdge!==null);
                    // $SuppressFlowFinding: access of computed property/element. Indexable signature not found in ...                    
                    let line: string = `node #${parentN[s]} ~~[${birthEdge}]~~> node #${n[s]} with value: ${valuePrinter(n.value)}`;
                    if (printAdornment)
                        line+=`, adornment: ${n.adornment}`;
                    lines.push(line);
                } else throw new Error('bug');
            }
        };
        this.depthFirstTraversal(printerVisitor);
        return lines.join('\n');
    }
}


exports.Node = Node;
exports.TREE_NODE_ID_SYMBOL_KEY = TREE_NODE_ID_SYMBOL_KEY;
