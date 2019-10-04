/**
 * Defining tree traversal type
 */
export enum TraversalType {
    PreOrder,
    PostOrder
}

/**
 * Defining a node state
 */
export type TNodeState = {
    hash: string;
    isDiscovered: boolean;
    isProcessed: boolean;
};

export type TGraphTraversalOptions<T> = {

    /**
     * Is the graph directed
     */
    isDirected?: boolean;

    /**
     * Method called upon each edge
     */
    processEdge?: (origin: T, target: T, ... args: any[]) => Promise<void>;

    /**
     * Method called upon each node
     */
    processNode: (node: T) => Promise<void>;

    /**
     * Method generating a hash to uniquely ID node
     */
    getNodeHash: (node: T) => Promise<string>;

    /**
     * Property allowing the algorithm to browse node connection in the tree.
     * A function can be passed.
     */
    adjacentNodeGetter: string | ((node: T) => Promise<T[]>);
};

export abstract class GraphTraversal<T> {

    /**
     * Discovered nodes
     */
    protected discoveredNodesMap: { [hash: string]: T; } = {};

    /**
     * Processed nodes
     */
    protected processedNodesMap: { [hash: string]: T; } = {};

    /**
<<<<<<< HEAD
     * Nodes by hashes
     */
    protected hashedNodes : { [hash: string]: T; } = {};

    /**
     * Parents map
=======
     * Parents Map
>>>>>>> master
     */
    protected parentMap: { [nodeHash: string]: string; } = {};

    /**
     * Options
     */
    protected options: TGraphTraversalOptions<T>;

    constructor(options: TGraphTraversalOptions<T>) {

        let defaultOptions: TGraphTraversalOptions<T> = {
            isDirected: true,
            adjacentNodeGetter: async (node: T) => { return []; },
            getNodeHash: async (node: T) => { throw new Error("No hash function for node provided"); },
            processEdge: async (node: T) => { return; },
            processNode: async (node: T) => { return; }
        };

        this.options = {
            getNodeHash: defaultOptions.getNodeHash,
            adjacentNodeGetter: defaultOptions.adjacentNodeGetter,
            processNode: defaultOptions.processNode
        };
        for(var k in defaultOptions) {
            this.options[k] = options[k] == undefined ? defaultOptions[k] : options[k];
        }
    }
        
    /**
     * Retrieves adjacent nodes
     */
    protected async getAdjacentNodes(node: T): Promise<T[]> {
        let type = typeof this.options.adjacentNodeGetter,
            results: T[];

        switch(type){
            case "string":
                results = node[ <string>this.options.adjacentNodeGetter ];
                break;
            case "function":
                results = await (< (node: T)=>Promise<T[]> >this.options.adjacentNodeGetter)(node);
                break;
            default:
                throw new Error("Undefined adjacent nodes getter");
        }

        if(!results){ return []; }

        return Array.isArray(results) ? results : [results];
    }

    /**
     * Given the parents map, find the path from target to origin.
     * 
     */
    protected async findPath(target: T, origin: T, result: T[]): Promise<void> {

        let targetHash: string = target ? await this.getNodeHash(target) : null,
            originHash: string = origin ? await this.getNodeHash(origin) : null;

        if( targetHash == originHash || origin == null ){
            result.push(target);
        } else {
            await this.findPath(target, this.hashedNodes[ this.parentMap[originHash] ], result);
            result.push(origin);
        }
    }

    protected async getNodeState(node: T): Promise<TNodeState>{
        let hash: string = await this.getNodeHash(node),
            isDiscovered: boolean = this.discoveredNodesMap[hash] !== undefined,
            isProcessed: boolean = this.processedNodesMap[hash] !== undefined;

        return {
            hash: hash,
            isDiscovered: isDiscovered,
            isProcessed: isProcessed
        }
    }

    /**
     * Marks node as discovered
     */
    protected async markNodeAsDiscovered(node: T): Promise<void> {
        this.discoveredNodesMap[ await this.getNodeHash(node)] = node;
    }

    /**
     * Marks node as processed
     */
    protected async markNodeAsProcessed(node: T): Promise<void> {
        this.processedNodesMap[ await this.getNodeHash(node)] = node;
    }

    /**
     * Get node hash
     */
    protected async getNodeHash(node: T): Promise<string> {
        let result: string = await this.options.getNodeHash(node);

        this.hashedNodes[ result ] = node;

        return result;
    }

    /**
     * Node Processor
     */
    protected processNode(node: T): Promise<void> {
        return this.options.processNode(node);
    }

    /**
     * Edge Processor
     */
    protected processEdge(origin: T, target: T, ... args: any[]): Promise<void> {
        return this.options.processEdge.apply(this, [origin, target].concat(args));
    }

    /**
     * Is the graph directed
     */
    protected isDirected(): boolean {
        return this.options.isDirected;
    }

    /**
     * Initializes maps
     */
    protected initializeMaps(): void {
        this.processedNodesMap = {};
        this.discoveredNodesMap = {};
        this.hashedNodes = {};
        this.parentMap = {};
    }
}