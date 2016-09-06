'use strict'; 

import 'babel-polyfill';
const assert     = require('assert');
import           _ from 'lodash';

import {Node} from '../src/trees.js';


describe('Node', function() {
    describe('constructor', function() {
        it('should work', function() {
            const node = new Node(3);
            assert(node.children===null);
            assert(node.value===3);
        });
    });
    describe('set', function() {
        it('should work', function() {
            const node = new Node(3);
            assert(node.isLeaf());
            assert(node.set('a', 4)===undefined);
            assert(!node.isLeaf());            
            assert(node.set('a', 5)===4);
            assert(!node.isLeaf());                        
            assert(node.set(4, 'delta')===undefined);
            assert(!node.isLeaf());                        
            assert(node.set(4, 'epislon')==='delta');
            assert(!node.isLeaf());            
        });
    });

    describe('descendants', function() {
        it('should work', function() {
            const {root,a,b,c,d,e,f,g,h,i,j} = sampleTree1();
            assert.deepEqual(h.descendants(), []);
            assert.deepEqual(h.descendants(true), [h]);
            assert.deepEqual(i.descendants(), []);
            assert.deepEqual(i.descendants(true), [i]);
            assert.deepEqual(g.descendants(), []);
            assert.deepEqual(g.descendants(true), [g]);
            assert.deepEqual(d.descendants(), []);
            assert.deepEqual(d.descendants(true), [d]);
            assert.deepEqual(c.descendants(), []);
            assert.deepEqual(c.descendants(true), [c]);
            assert.deepEqual(f.descendants()    .map( (x)=>x.value), ['h', 'i']);
            assert.deepEqual(f.descendants(true).map( (x)=>x.value), ['f', 'h', 'i']);            
            assert.deepEqual(e.descendants()    .map( (x)=>x.value), ['f', 'h', 'i', 'g']);
            assert.deepEqual(e.descendants(true).map( (x)=>x.value), ['e', 'f', 'h', 'i', 'g']);
            assert.deepEqual(b.descendants()    .map( (x)=>x.value), ['d', 'e', 'f', 'h', 'i', 'g']);
            assert.deepEqual(b.descendants(true).map( (x)=>x.value), ['b', 'd', 'e', 'f', 'h', 'i', 'g']);
            assert.deepEqual(a.descendants()    .map( (x)=>x.value), ['b', 'd', 'e', 'f', 'h', 'i', 'g', 'c']);
            assert.deepEqual(a.descendants(true).map( (x)=>x.value), ['a', 'b', 'd', 'e', 'f', 'h', 'i', 'g', 'c']);            
        });
    });
    describe('leafs', function() {
        it('should work', function() {
            const {root,a,b,c,d,e,f,g,h,i,j} = sampleTree1();
            assert.deepEqual(h.leafs(), []);
            assert.deepEqual(h.leafs(true), [h]);
            assert.deepEqual(i.leafs(), []);
            assert.deepEqual(i.leafs(true), [i]);
            assert.deepEqual(g.leafs(), []);
            assert.deepEqual(g.leafs(true), [g]);
            assert.deepEqual(d.leafs(), []);
            assert.deepEqual(d.leafs(true), [d]);
            assert.deepEqual(c.leafs(), []);
            assert.deepEqual(c.leafs(true), [c]);
            assert.deepEqual(f.leafs()    .map( (x)=>x.value), ['h', 'i']);
            assert.deepEqual(f.leafs(true).map( (x)=>x.value), ['h', 'i']);            
            assert.deepEqual(e.leafs()    .map( (x)=>x.value), ['h', 'i', 'g']);
            assert.deepEqual(e.leafs(true).map( (x)=>x.value), ['h', 'i', 'g']);
            assert.deepEqual(b.leafs()    .map( (x)=>x.value), ['d', 'h', 'i', 'g']);
            assert.deepEqual(b.leafs(true).map( (x)=>x.value), ['d', 'h', 'i', 'g']);            
            assert.deepEqual(a.leafs()    .map( (x)=>x.value), ['d', 'h', 'i', 'g', 'c']);
            assert.deepEqual(a.leafs(true).map( (x)=>x.value), ['d', 'h', 'i', 'g', 'c']);                        
        });
    });    
    describe('edgeThatLeadsTo', function() {
        it('should work', function() {
            const {root,a,b,c,d,e,f,g,h,i,j} = sampleTree1();
            assert.equal(a.edgeThatLeadsTo(b), 0);
            assert.equal(a.edgeThatLeadsTo(c), 1);
            assert.equal(a.edgeThatLeadsTo(d), 0);
            assert.equal(a.edgeThatLeadsTo(e), 0);
            assert.equal(a.edgeThatLeadsTo(f), 0);
            assert.equal(a.edgeThatLeadsTo(g), 0);
            assert.equal(a.edgeThatLeadsTo(h), 0);
            assert.equal(a.edgeThatLeadsTo(i), 0);
            assert.equal(a.edgeThatLeadsTo(j), null);  // j is not connected with the tree
        });
    });

    describe('print', function() {
        it('does not break', function() {
            {
            let {root,a,b,c,d,e,f,g,h,i,j} = sampleTree1();
            assert.equal(root.print(false),
`ROOT node #0 with value: a
node #0 ~~[0]~~> node #1 with value: b
node #1 ~~[0]~~> node #2 with value: d
node #1 ~~[1]~~> node #3 with value: e
node #3 ~~[0]~~> node #4 with value: f
node #4 ~~[0]~~> node #5 with value: h
node #4 ~~[1]~~> node #6 with value: i
node #3 ~~[1]~~> node #7 with value: g
node #0 ~~[1]~~> node #8 with value: c
`.trim());
            assert.equal(j.print(false),
`ROOT node #0 with value: j
`.trim());
            }
            {
                // read them again to drop previously assigned numbers on nodes
           let {root,a,b,c,d,e,f,g,h,i,j} = sampleTree1();
           assert.equal(f.print(false),
`ROOT node #0 with value: f
node #0 ~~[0]~~> node #1 with value: h
node #0 ~~[1]~~> node #2 with value: i
`.trim());            
            }
        });
    });



    
}); //  Node

function sampleTree1() {
    const a = new Node('a');
    const b = new Node('b');
    const c = new Node('c');
    const d = new Node('d');
    const e = new Node('e');
    const f = new Node('f');
    const g = new Node('g');
    const h = new Node('h');
    const i = new Node('i');
    const j = new Node('j');
    f.setn(0, h);
    f.setn(1, i);
    e.setn(0, f);
    e.setn(1, g);
    b.setn(0, d);
    b.setn(1, e);
    a.setn(0, b);
    a.setn(1, c);
    return {root: a, a: a, b: b, c: c, d: d, e: e, f: f, g: g, h: h, i: i, j: j};
}

