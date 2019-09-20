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
        hashMethod: (node: T)=>Promise<string>){
        super(adjacentNodeGetter, hashMethod);
    }

    /**
     * Triggers DFS. The callback is called against each unvisited node.
     */
    public async perform(node: T, callback: (node: T, parentNode: T, depth: number) => Promise<void | boolean>, 
                        treeTraversalType: TreeTraversalType): Promise<void> {
        
        this.markedNodesMap = {};

        await this.performInternal(node, null, 0, callback, treeTraversalType);
        
        await this.unmarkNodes();
    }
    

    /**
     * DFS core algorithm ("Recursive")
     */
    private async performInternal(node: T, parent: T, depth: number, 
                                callback: (node: T, parentNode: T, depth: number) => Promise<void | boolean>, 
                                treeTraversalType: TreeTraversalType): Promise<void> {

        let adjacentNodes = null;
        let nodeHash: string = await this.getNodeHash(node);
        let isNodeMarked: boolean = this.markedNodesMap[ nodeHash ] != null;

        if (node == null || isNodeMarked == true) {
            return;
        }

        // Mark node as discovered to avoid
        // processing it twice
        this.markedNodesMap[ nodeHash ] = node;

        if (treeTraversalType == TreeTraversalType.PreOrder) {
            var result = await callback(node, parent, depth);
            if (result != undefined && !result) {
                return;
            }
        }

        adjacentNodes = await this.getAdjacentNodes(node);

        if (adjacentNodes) {
            
            for(var i = 0; i< adjacentNodes.length; i++){
                await this.performInternal(adjacentNodes[i], node, depth + 1, callback, treeTraversalType);
            }
        }

        if (treeTraversalType == TreeTraversalType.PostOrder) {
            var result = await callback(node, parent, depth);
            if (result != undefined && !result) {
                return;
            }
        }

    }
}
