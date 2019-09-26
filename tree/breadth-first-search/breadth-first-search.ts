import { MapBasedGraphSearch } from '../map-based-graph-search';


// @TODO to finish
export class BreadthFirstSearch<T> extends MapBasedGraphSearch<T> {

    
    /**
     * Triggers BFS. The callback is called against each unvisited node.
     */
    public async perform(node: T, 
        callback: (node: T, parent: T, level: number) => Promise<void | boolean>): Promise<void> {
        
        this.markedNodesMap = {};

        await this.performInternal(node, callback);

        await this.unmarkNodes();
    }


    private async performInternal(node: T, 
        callback: (node: T, parent: T, level: number) => Promise<void | boolean>): Promise<void> {
    
        let queue: { node: T; parent:T; level: number; } [] = [ { node: node, parent: null, level: 0 } ];

        while(queue.length){

            let v = queue.shift();

            if(this.visitNodeOnce){
                
                let isVisited: boolean = await this.isNodeMarked( v.node );

                if(isVisited){
                    continue;
                }
                
                await this.markNode( v.node );
            }
            
            await callback(v.node, v.parent, v.level);

            let adjacentNodes: T[] = await this.getAdjacentNodes(v.node);

            for(var i = 0; i<adjacentNodes.length; i++) {
                queue.push({ node: adjacentNodes[i], parent: v.node, level: v.level + 1 });
            }

        }

    }

}