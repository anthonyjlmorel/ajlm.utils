import { MapBasedDepthFirstSearch, TreeTraversalType } from './map-based-depth-first-search';

// @TODO to test


/**
 * DFS algorithm where visited node are marked in the node itself thanks to JS
 * properties (and not in a map).
 */
export class NodeBasedDepthFirstSearch<T> extends MapBasedDepthFirstSearch<T> { 

    // Marking tag use for mark a node
    protected static MARKING_TAG: string = "__dfs_marked";

    // Defined a marked nodes list (list instead of map)
    protected markedNodesList: T[];

    constructor(adjacentNodePropertyName: string | ((node: T)=>Promise<T[]>) ) {
        // the hash method won't be used
        super(adjacentNodePropertyName, (node: T) => { return new Promise(null); });
    }

    // @overriding
    protected async isNodeMarked(node: T): Promise<boolean> {
        return node[NodeBasedDepthFirstSearch.MARKING_TAG] === true;
    }

    // @overriding
    protected async markNode(node: T): Promise<void> {
        node[NodeBasedDepthFirstSearch.MARKING_TAG] = true;
        // Add the node to the marked list
        this.markedNodesList.push(node);
    }

    // @overriding
    protected async unmarkNode(node: T): Promise<void> {
        delete node[NodeBasedDepthFirstSearch.MARKING_TAG];
    }

    // @overriding
    protected async getNodeHash(node: T): Promise<string> {
        return null;
    }

    // @overriding
    public async perform(node: T, callback: (node: T, parent: T, depth: number) => Promise<void>, treeTraversalType: TreeTraversalType): Promise<void> {
        // Initialize the marked node list
        this.markedNodesList = [];
        // Call the default perform method
        await super.perform(node, (node: T, parent: T, depth: number) => {
            return callback(node, parent, depth);
        }, treeTraversalType);
    }
    
    // @overriding
    protected async unmarkNodes(): Promise<void> {
        await Promise.all(this.markedNodesList.map((node: T) => {
            return this.unmarkNode(node);
        }));
        this.markedNodesList = [];
    }
    
}
