import { GraphTraversal, TGraphTraversalOptions, TraversalType } from '../graph-traversal';



/**
 * Defining async DFS algorithm.
 * 
 * Following the algorithm depicted in Steve Skienna's The Algorithm Design Manual.
 * 
 */
export class DepthFirstSearch<T> extends GraphTraversal<T> {

    protected parentMap: { [nodeHash: string]: string; } = {};

    constructor(options: TGraphTraversalOptions<T>) {
        super(options);
    }

    /**
     * Triggers DFS
     */
    public async perform(node: T, 
        treeTraversalType: TraversalType = TraversalType.PostOrder,
        type: "recursive" | "iterative" = "recursive"): Promise<void> {
        
        this.initializeMaps();
        this.parentMap = {};

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
            // mark as processed
            await this.markNodeAsProcessed(node);
        }

        // get adjacent nodes
        let adjacentNodes = await this.getAdjacentNodes(node);

        if (adjacentNodes) {
            for(var i = 0; i< adjacentNodes.length; i++){

                let adjacentNode: T = adjacentNodes[i],
                    isDiscovered: boolean = await this.isNodeDiscovered(adjacentNode);

                if(!isDiscovered){
                    this.parentMap[ await this.getNodeHash(adjacentNode) ] = (await this.getNodeHash(node));

                    // process edge
                    await this.processEdge(node, adjacentNode);

                    // DFS
                    await this.performRecursive(adjacentNode, treeTraversalType);

                } else {
                    // do not use else-if here to avoid awaiting a promising for nothing
                    let isProcessed: boolean = await this.isNodeProcessed(adjacentNode),
                        childHash = await this.getNodeHash(adjacentNode),
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
            // mark as processed
            await this.markNodeAsProcessed(node);
        }

        

    }

    /**
     * DFS core algorithm ("Iterative")
     * 
     * @TODO ...
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
                let adjacendNode: T = adjacentNodes[i];

                let isProcessed: boolean = await this.isNodeProcessed(adjacendNode),
                    isDiscovered: boolean = await this.isNodeDiscovered(adjacendNode),
                    childHash = await this.getNodeHash(adjacendNode),
                    parentHash = await this.getNodeHash(node);

                if((!isProcessed && this.parentMap[parentHash] != childHash) || this.isDirected()){
                    resultQueue.push({
                        type: "edge",
                        node: adjacendNode,
                        parent: queueItem.node
                    });
                }
                if(!isDiscovered){
                    this.parentMap[ await this.getNodeHash(adjacendNode) ] = (await this.getNodeHash(node));
                    
                    stack.push({ node: adjacendNode, parent: queueItem.node });
                    await this.markNodeAsDiscovered(adjacendNode);
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
}
