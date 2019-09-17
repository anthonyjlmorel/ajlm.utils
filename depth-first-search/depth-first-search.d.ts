import { BaseDepthFirstSearch, TreeTraversalType } from './base-depth-first-search';
export declare class DepthFirstSearch<T> extends BaseDepthFirstSearch<T> {
    protected static MARKING_TAG: string;
    protected markedNodesList: T[];
    /**
     * The property to use to get the adjacent nodes
     */
    protected adjacentNodePropertyName: string;
    /**
     * Constructor
     * @param adjacentNodePropertyName Property to use to get the adjacent nodes
     */
    constructor(adjacentNodePropertyName: string);
    protected isNodeMarked(node: T): Promise<boolean>;
    protected markNode(node: T): Promise<void>;
    protected unmarkNode(node: T): Promise<void>;
    protected getNodeHash(node: T): Promise<string>;
    protected getAdjacentNodes(item: T): Promise<T[]>;
    perform(node: T, callback: (node: T) => Promise<void>, treeTraversalType: TreeTraversalType): Promise<void>;
    protected unmarkNodes(): Promise<void>;
}
