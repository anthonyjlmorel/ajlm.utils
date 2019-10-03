import { GraphTraversal, TreeTraversalType } from '../graph-traversal';


/**
 * Defining async BFS algorithm.
 * 
 * Following the algorithm depicted in Steve Skienna's The Algorithm Design Manual.
 * 
 */
export class BreadthFirstSearch<T> extends GraphTraversal<T> {

    /**
     * Triggers BFS. The callback is called against each unvisited node.
     */
    public async perform(node: T, treeTraversal: TreeTraversalType): Promise<void> {
        
        this.initializeMaps();

        await this.performInternal(node, treeTraversal);

    }


    private async performInternal(node: T, treeTraversal: TreeTraversalType = TreeTraversalType.PostOrder): Promise<void> {
    
        let queue: { node: T; parent:T; level: number; } [] = [ { node: node, parent: null, level: 0 } ];

        await this.markNodeAsDiscovered(node);

        while(queue.length){

            let v = queue.shift();

            if(treeTraversal == TreeTraversalType.PreOrder){
                await this.processNode(v.node);
                await this.markNodeAsProcessed(v.node);
            }

            let adjacentNodes: T[] = await this.getAdjacentNodes(v.node);

            for(var i = 0; i<adjacentNodes.length; i++) {
                let adjacendNode: T = adjacentNodes[i];

                let isProcessed: boolean = await this.isNodeProcessed(adjacendNode),
                    isDiscovered: boolean = await this.isNodeDiscovered(adjacendNode);

                if(!isProcessed || this.isDirected()){
                    await this.processEdge(v.node, adjacendNode, v.level + 1);
                }
                if(!isDiscovered){
                    queue.push({ node: adjacentNodes[i], parent: v.node, level: v.level + 1 });
                    await this.markNodeAsDiscovered(adjacendNode);
                }
            }

            if(treeTraversal == TreeTraversalType.PostOrder){
                await this.processNode(v.node);
                await this.markNodeAsProcessed(v.node);
            }
        }

    }

}