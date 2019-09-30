import { ok, fail } from "assert";

import { MapBasedDepthFirstSearch, TreeTraversalType } from "..";

describe("Testing Iterative DFS Algorithm Based on Hash Map", function() {

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
                                name: 4, // should visit this one and not the other one
                                children: []
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
                        children: [
                            {
                                name: 1, // Should not treat it as it has already been visited
                                children: []
                            }
                        ]
                    }
                ]
            }
        ]
    };

    let touchOrder: number[];
    let currentTouchIndex: number;
    let touch = function(name: number) {
        if(name == touchOrder[currentTouchIndex++]){
            return true;
        }
        return false;
    };

    let hashMethod = async(node) => { return node.name; };

    let dfs = new MapBasedDepthFirstSearch<any>("children", hashMethod);

    it("Should traverse in the right order (PostOrder)", async function(){

        touchOrder = [4, 5, 2, 3, 1];
        currentTouchIndex = 0;

        await dfs.perform(graph, async (node: any, parent: any)=> {

            if(!touch(node.name)){
                throw new Error(`Calling on ${node.name} where ${touchOrder[currentTouchIndex-1]} is expected`);
            }
                        
        }, TreeTraversalType.PostOrder);
        
    });

    /*  @TODO to implement ...
    it("Should traverse in the right order (PreOrder)", async function(){

        touchOrder = [1, 2, 5, 4, 3];
        currentTouchIndex = 0;

        await dfs.perform(graph, async (node: any)=> {

            if(!touch(node.name)){
                throw new Error(`Calling on ${node.name} where ${touchOrder[currentTouchIndex-1]} is expected`);
            }

        }, TreeTraversalType.PreOrder, "iterative");
        
    }); */

    it("Should not visit twice the same node", async function(){

        let mapNode = {};

        await dfs.perform(graph, async (node: any)=> {

            if(!mapNode[node.name]){
                mapNode[node.name] = true;
            } else {
                throw new Error(`Visiting node ${node.name} twice`);
            }

        }, TreeTraversalType.PostOrder, "iterative");
        
    });


});