import { MapBasedTreeSearch } from '../map-based-tree-search';


// @TODO to finish
export class BreadthFirstSearch<T> extends MapBasedTreeSearch<T> {

    
    /**
     * Triggers BFS. The callback is called against each unvisited node.
     */
    public async perform(node: T, callback: (node: T) => Promise<void | boolean>): Promise<void> {
        
        this.markedNodesMap = {};

        await this.performInternal(node, callback);

        await this.unmarkNodes();
    }


    private async performInternal(node: T, callback: (node: T) => Promise<void | boolean>): Promise<void> {
    
        let queue: T[] = [ node ];

        await this.markNode(node);

        while(queue.length){

            let v: T = queue.shift();

            let adjacentNodes: T[] = await this.getAdjacentNodes(v);

            for(var i = 0; i<adjacentNodes.length; i++){
                let isVisited: boolean = await this.isNodeMarked( adjacentNodes[i]);
                if(!isVisited){
                    await this.markNode( adjacentNodes[i] );
                    queue.push(adjacentNodes[i]);
                }
            }

        }

    }

}