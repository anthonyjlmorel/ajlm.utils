import { GraphTraversal, TraversalType, TGraphTraversalOptions } from '../graph-traversal';

/**
 * Possible Error Types
 */
export enum DfsTraversalErrorType {
    Cycle = 0
};

/**
 * Traversal Error that can be thrown
 */
export class DfsTraversalError<T> {

    constructor(public type: DfsTraversalErrorType,
                public data: T) {}
    
}


/**
 * Defining async DFS algorithm.
 * 
 * Following the algorithm depicted in Steve Skienna's The Algorithm Design Manual.
 * 
 */
export class DepthFirstSearch<T> extends GraphTraversal<T> {

    constructor(options: TGraphTraversalOptions<T>, detectCycle: boolean = false) {
        super(options);

        if(detectCycle){
            this.attachCycleDetector();
        }
    }
    
    /**
     * Triggers DFS
     */
    public async perform(node: T, 
        treeTraversalType: TraversalType = TraversalType.PostOrder,
        type: "recursive" | "iterative" = "recursive"): Promise<void> {
        
        this.initializeMaps();

        if(type == "recursive"){
            await this.performRecursive(node, treeTraversalType);
        }
        else {
            await this.performIterative(node, treeTraversalType);
        }
    }
    

    /**
     * DFS core algorithm ("Recursive")
     */
    private async performRecursive(node: T, treeTraversalType: TraversalType): Promise<void> {

        // mark as discovered
        await this.markNodeAsDiscovered(node);

        // call processing method early
        if(treeTraversalType == TraversalType.PreOrder){
            await this.processNode(node);
        }

        // get adjacent nodes
        let adjacentNodes = await this.getAdjacentNodes(node);

        if (adjacentNodes) {
            for(var i = 0; i< adjacentNodes.length; i++){

                let adjacentNode: T = adjacentNodes[i],
                    adjacentNodeState = await this.getNodeState(adjacentNode);

                if(!adjacentNodeState.isDiscovered){
                    // keep parent maps
                    this.parentMap[ await this.getNodeHash(adjacentNode) ] = (await this.getNodeHash(node));

                    // process edge
                    await this.processEdge(node, adjacentNode);

                    // DFS
                    await this.performRecursive(adjacentNode, treeTraversalType);

                } else {
                    // do not use else-if here to avoid awaiting a promising for nothing
                    let isProcessed: boolean = adjacentNodeState.isProcessed,
                        childHash = adjacentNodeState.hash,
                        parentHash = await this.getNodeHash(node);

                    if((!isProcessed && this.parentMap[parentHash] != childHash) || this.isDirected()){
                        await this.processEdge(node, adjacentNode);
                    }

                }
            }
        }

        // call processing method late
        if (treeTraversalType == TraversalType.PostOrder) {
            await this.processNode(node);
        }

        // mark as processed
        await this.markNodeAsProcessed(node);

    }

    

    /**
     * DFS core algorithm ("Iterative")
     * 
     * @TODO ... To test ... Not finished
     */
    private async performIterative(node: T, treeTraversalType: TraversalType): Promise<void> {

        let stack: { node: T; parent: T; }[] = [{node: node, parent: null}];
        let resultQueue: { type: "vertex" | "edge", node: T, parent: T }[] = [];

        while(stack.length){
            let queueItem = stack.pop();

            if(treeTraversalType == TraversalType.PreOrder){
                resultQueue.push({
                    node: queueItem.node,
                    parent: queueItem.parent,
                    type: "vertex"
                });

                await this.markNodeAsProcessed(queueItem.node);
            }

            let adjacentNodes: T[] = await this.getAdjacentNodes(queueItem.node);

            for(var i = 0; i<adjacentNodes.length; i++) {
                let adjacentNode: T = adjacentNodes[i];

                let adjacentNodeState = await this.getNodeState(adjacentNode),
                    childHash = adjacentNodeState.hash,
                    parentHash = await this.getNodeHash(node);

                if((!adjacentNodeState.isProcessed && this.parentMap[parentHash] != childHash) || this.isDirected()){
                    resultQueue.push({
                        type: "edge",
                        node: adjacentNode,
                        parent: queueItem.node
                    });
                }
                if(!adjacentNodeState.isDiscovered){
                    this.parentMap[ childHash ] = parentHash;
                    
                    stack.push({ node: adjacentNode, parent: queueItem.node });
                    await this.markNodeAsDiscovered(adjacentNode);
                }
            }

            if(treeTraversalType == TraversalType.PostOrder){
                resultQueue.push({
                    node: queueItem.node,
                    parent: queueItem.parent,
                    type: "vertex"
                });
                await this.markNodeAsProcessed(queueItem.node);
            }
        }

        
        while(resultQueue.length){
            let item = resultQueue.pop();
            if(item.type == "vertex"){
                await this.processNode(item.node);
            }
            if(item.type == "edge"){
                await this.processEdge(item.parent, item.node);
            }
        }
        
    }

    /**
     * Attaches handler to detect cycle in graph
     */
    private attachCycleDetector(): void {
        let formerProcessEdge = this.options.processEdge;

        this.options.processEdge = async (origin: T, target: T) => {
            
            let targetState = await this.getNodeState(target),
                originHash: string = await this.getNodeHash(origin),
                targetHash: string = targetState.hash;

            if((targetState.isDiscovered && !targetState.isProcessed) 
                && this.parentMap[ targetHash ] != originHash ){

                let path: T[] = [];
                await this.findPath(target, origin, path);

                path.push(target);

                // Throw error (and consequently, stop traversal)
                throw new DfsTraversalError<T[]>(DfsTraversalErrorType.Cycle, path);
            }

            await formerProcessEdge(origin, target);
        };
    }
}
