import { MapBasedGraphSearch } from '../map-based-graph-search';

/**
 * Defining tree traversal type in a DFS
 */
export enum TreeTraversalType {
    PreOrder,
    PostOrder
}

/**
 * Defining async DFS algorithm where visited nodes
 * are kept in a map.
 */
export class MapBasedDepthFirstSearch<T> extends MapBasedGraphSearch<T> {

    constructor(
        /**
         * Property allowing the algorithm to browse node connection in the tree.
         * A function can be passed.
         */
        adjacentNodeGetter: string | ((node: T) => Promise<T[]>),
        /**
         * Method generating a hash to uniquely ID node
         */
        hashMethod: (node: T)=>Promise<string> = null,
        
        /**
         * Callback for already visited nodes
         */
        private alreadyVisited: (node: T, parent: T)=> Promise<void> = async (node: T)=> {}) {

        super(adjacentNodeGetter, hashMethod);

    }

    /**
     * Triggers DFS. The callback is called against each unvisited node.
     */
    public async perform(node: T, 
                        callback: (node: T, parentNode: T) => Promise<void | boolean>, 
                        treeTraversalType: TreeTraversalType,
                        type: "recursive" | "iterative" = "recursive"): Promise<void> {
        
        this.markedNodesMap = {};

        if(type == "recursive"){
            await this.performRecursive(node, null, callback, treeTraversalType);
        }
        else {
            await this.performIterative(node, callback, treeTraversalType);
        }
        
        
        await this.unmarkNodes();
    }
    

    /**
     * DFS core algorithm ("Recursive")
     */
    private async performRecursive(node: T, parent: T, 
                                callback: (node: T, parentNode: T) => Promise<void | boolean>, 
                                treeTraversalType: TreeTraversalType): Promise<void> {

        let adjacentNodes = null;
        
        if(this.visitNodeOnce){
            let isNodeMarked: boolean = await this.isNodeMarked(node);

            if (node == null || isNodeMarked == true) {
                await this.alreadyVisited(node, parent);
                return;
            }
    
            // Mark node as discovered to avoid
            // processing it twice
            await this.markNode(node);
        }
        

        if (treeTraversalType == TreeTraversalType.PreOrder) {
            var result = await callback(node, parent);
            if (result != undefined && !result) {
                return;
            }
        }

        adjacentNodes = await this.getAdjacentNodes(node);

        if (adjacentNodes) {
            for(var i = 0; i< adjacentNodes.length; i++){
                await this.performRecursive(adjacentNodes[i], node, callback, treeTraversalType);
            }
        }

        if (treeTraversalType == TreeTraversalType.PostOrder) {
            var result = await callback(node, parent);
            if (result != undefined && !result) {
                return;
            }
        }

    }

    /**
     * DFS core algorithm ("Iterative")
     * 
     * @TODO today, only post order is supported / TO TEST (does not seem to work ...)
     */
    private async performIterative(node: T, 
                                callback: (node: T, parentNode: T) => Promise<void | boolean>, 
                                treeTraversalType: TreeTraversalType): Promise<void> {

        let adjacentNodes: T[] = null;
        let queue: { node: T; parent: T; }[] = [{node: node, parent: null}];
        let resultQueue: { node: T; parent: T; }[] = [];

        while(queue.length){
            let queueItem = queue.pop();

            if(this.visitNodeOnce){
                let isNodeMarked: boolean = await this.isNodeMarked(queueItem.node);
                if(isNodeMarked){
                    await this.alreadyVisited(queueItem.node, queueItem.parent);
                    continue;
                }
                await this.markNode(queueItem.node);
            }
            

            resultQueue.push(queueItem);
            

            adjacentNodes = await this.getAdjacentNodes(queueItem.node);

            adjacentNodes.forEach((node: T)=>{
                queue.push({ node: node, parent: queueItem.node });
            });
        }

        
        while(resultQueue.length){
            let item = resultQueue.pop();
            await callback(item.node, item.parent);
        }
        

    }
}
