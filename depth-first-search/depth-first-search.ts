import { BaseDepthFirstSearch, TreeTraversalType } from './base-depth-first-search';

export class DepthFirstSearch<T> extends BaseDepthFirstSearch<T> { 

    // Marking tag use for mark a node
    protected static MARKING_TAG: string = "__dfs_marked";

    // Defined a marked nodes list (list instead of map)
    protected markedNodesList: T[];

    /**
     * The property to use to get the adjacent nodes
     */
    protected adjacentNodePropertyName: string;

    /**
     * Constructor
     * @param adjacentNodePropertyName Property to use to get the adjacent nodes
     */
    constructor(adjacentNodePropertyName: string) {
        super();
        this.adjacentNodePropertyName = adjacentNodePropertyName;
    }

    // @overriding
    protected async isNodeMarked(node: T): Promise<boolean> {
        return node[DepthFirstSearch.MARKING_TAG];
    }

    // @overriding
    protected async markNode(node: T): Promise<void> {
        node[DepthFirstSearch.MARKING_TAG] = true;
        // Add the node to the marked list
        this.markedNodesList.push(node);
    }

    // @overriding
    protected async unmarkNode(node: T): Promise<void> {
        delete node[DepthFirstSearch.MARKING_TAG];
    }

    // @overriding
    protected async getNodeHash(node: T): Promise<string> {
        return null;
    }

    // @overriding
    protected async getAdjacentNodes(item: T): Promise<T[]> {
        // get children
        var adjacentNodePropertyValue: T | T[] = item[this.adjacentNodePropertyName];
        if(!adjacentNodePropertyValue) {
            return [];
        }
        return Array.isArray(adjacentNodePropertyValue) ? adjacentNodePropertyValue : [adjacentNodePropertyValue];
    }

    // @overriding
    public async perform(node: T, callback: (node: T) => Promise<void>, treeTraversalType: TreeTraversalType): Promise<void> {
        // Initialize the marked node list
        this.markedNodesList = [];
        // Call the default perform method
        await super.perform(node, (node: T) => {
            return callback(node);
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
