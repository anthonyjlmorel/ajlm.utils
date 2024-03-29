import { GraphTraversal, TraversalType, TGraphTraversalOptions } from '../graph-traversal';


/**
 * Defining async BFS algorithm.
 * 
 * Following the algorithm depicted in Steve Skienna's The Algorithm Design Manual.
 * 
 */
export class BreadthFirstSearch<T> extends GraphTraversal<T> {


    /**
     * Triggers BFS
     */
    public async perform(node: T, treeTraversal: TraversalType = TraversalType.PostOrder): Promise<void> {
        
        this.initializeMaps();

        await this.performInternal(node, treeTraversal);

    }


    private async performInternal(node: T, treeTraversal: TraversalType): Promise<void> {
    
        let queue: { node: T; parent:T; level: number; } [] = [ { node: node, parent: null, level: 0 } ];

        await this.markNodeAsDiscovered(node);

        while(queue.length){

            let v = queue.shift();

            if(treeTraversal == TraversalType.PreOrder){
                await this.processNode(v.node);
            }

            let adjacentNodes: T[] = await this.getAdjacentNodes(v.node);

            for(var i = 0; i<adjacentNodes.length; i++) {
                let adjacentNode: T = adjacentNodes[i];

                let adjacentNodeState = await this.getNodeState(adjacentNode);

                if(!adjacentNodeState.isProcessed || this.isDirected()){
                    await this.processEdge(v.node, adjacentNode, v.level + 1);
                }
                if(!adjacentNodeState.isDiscovered){
                    queue.push({ node: adjacentNode, parent: v.node, level: v.level + 1 });
                    this.parentMap[ adjacentNodeState.hash ] = (await this.getNodeHash(v.node));
                    await this.markNodeAsDiscovered(adjacentNode);
                }
            }

            if(treeTraversal == TraversalType.PostOrder){
                await this.processNode(v.node);
            }
            
            await this.markNodeAsProcessed(v.node);
        }

    }

}