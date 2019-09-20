import { ok, fail } from "assert";

import { NodeBasedDepthFirstSearch, TreeTraversalType } from "..";

describe("Testing DFS Algorithm Based on JS Node Instance", function() {
    
    let node1 = {
        name: 1,
        children: []
    };
    let node2 = {
        name: 2,
        children: [
        ]
    };

    let node5 = {
        name: 5,
        children: [
        ]
    };

    let node3 = {
        name: 3,
        children: [
        ]
    };

    let node4 = {
        name: 4, 
        children: []
    };

    node2.children.push(node5);
    node5.children.push(node4);
    node3.children.push(node4);
    node4.children.push(node1);

    node1.children.push(node2, node3);

    let graph = node1;

    /*
    let graph = {
        name: 1,
        children: [
            {
                name: 2,
                children: [
                    {
                        name: 5,
                        children: [
                            {
                                name: 4 // should visit this one and not the other one
                            }
                        ]
                    }
                ]
            },
            {
                name: 3,
                children: [
                    {
                        name: 4, // Should not treat it as it has already been visited
                        children: {
                            name: 1 // Should not treat it as it has already been visited
                        }
                    }
                ]
            }
        ]
    };*/

    let touchOrder: number[];
    let currentTouchIndex: number;
    let touch = function(name: number) {
        if(name == touchOrder[currentTouchIndex++]){
            return true;
        }
        return false;
    };

    let dfs = new NodeBasedDepthFirstSearch<any>("children");

    it("Should traverse in the right order (PostOrder)", async function(){

        touchOrder = [4, 5, 2, 3, 1];
        currentTouchIndex = 0;

        await dfs.perform(graph, async (node: any)=> {

            if(!touch(node.name)){
                throw new Error(`Calling on ${node.name} where ${touchOrder[currentTouchIndex-1]} is expected`);
            }

        }, TreeTraversalType.PostOrder);
        
    });

    it("Should traverse in the right order (PreOrder)", async function(){

        touchOrder = [1, 2, 5, 4, 3];
        currentTouchIndex = 0;

        await dfs.perform(graph, async (node: any)=> {

            if(!touch(node.name)){
                throw new Error(`Calling on ${node.name} where ${touchOrder[currentTouchIndex-1]} is expected`);
            }

        }, TreeTraversalType.PreOrder);
        
    });

    it("Should not visit twice the same node", async function(){

        let mapNode = {};

        await dfs.perform(graph, async (node: any)=> {

            if(!mapNode[node.name]){
                mapNode[node.name] = true;
            } else {
                throw new Error(`Visiting node ${node.name} twice`);
            }

        }, TreeTraversalType.PostOrder);
        
    });

});