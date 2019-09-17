export declare enum TreeTraversalType {
    PreOrder = 0,
    PostOrder = 1
}
export declare abstract class BaseDepthFirstSearch<T> {
    private markedNodesMap;
    protected abstract getAdjacentNodes(node: T): Promise<T[]>;
    protected isNodeMarked(node: T): Promise<boolean>;
    protected markNode(node: T): Promise<void>;
    protected unmarkNode(node: T): Promise<void>;
    protected unmarkNodes(): Promise<void>;
    protected abstract getNodeHash(node: T): Promise<string>;
    perform(node: T, callback: (node: T) => Promise<void | boolean>, treeTraversalType: TreeTraversalType): Promise<void>;
    private performInternal;
}
