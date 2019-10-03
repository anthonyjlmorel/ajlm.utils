/**
 * Defining tree traversal type
 */
export enum TraversalType {
    PreOrder,
    PostOrder
}

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
     * Has the node been discovered
     */
    protected async isNodeDiscovered(node: T): Promise<boolean> {
        return this.discoveredNodesMap[await this.getNodeHash(node)] !== undefined;
    }

    /**
     * Has the node been processed
     */
    protected async isNodeProcessed(node: T): Promise<boolean> {
        return this.processedNodesMap[await this.getNodeHash(node)] !== undefined;
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
    protected getNodeHash(node: T): Promise<string> {
        return this.options.getNodeHash(node);
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
    }
}