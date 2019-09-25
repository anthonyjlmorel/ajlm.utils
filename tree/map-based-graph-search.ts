
export abstract class MapBasedGraphSearch<T> {

    /**
     * Ok, It is not really a hash map here :) For now
     */
    protected markedNodesMap: { [hash: string]: T; } = {};

    constructor(
        /**
         * Property allowing the algorithm to browse node connection in the tree.
         * A function can be passed.
         */
        protected adjacentNodeGetter: string | ((node: T) => Promise<T[]>),
        /**
         * Method generating a hash to uniquely ID node
         */
        protected hashMethod: (node: T)=>Promise<string>){}
        
    /**
     * Retrieves adjacent nodes
     */
    protected async getAdjacentNodes(node: T): Promise<T[]> {
        let type = typeof this.adjacentNodeGetter,
            results: T[];

        switch(type){
            case "string":
                results = node[ <string>this.adjacentNodeGetter ];
                break;
            case "function":
                results = await (< (node: T)=>Promise<T[]> >this.adjacentNodeGetter)(node);
                break;
            default:
                throw new Error("Undefined adjacent nodes getter");
        }

        if(!results){ return []; }

        return Array.isArray(results) ? results : [results];
    }   

    /**
     * Has the node been visited
     */
    protected async isNodeMarked(node: T): Promise<boolean> {
        return this.markedNodesMap[await this.getNodeHash(node)] !== undefined;
    }

    /**
     * Marks node as visited
     */
    protected async markNode(node: T): Promise<void> {
        this.markedNodesMap[ await this.getNodeHash(node)] = node;
    }

    /**
     * Unmarks node as visited
     * (used for cleaning map)
     */
    protected async unmarkNode(node: T): Promise<void> {
        var hash: string = await this.getNodeHash(node);

        delete this.markedNodesMap[hash];
    }

    /**
     * Unmarks all visited nodes
     * (cleaning purpose)
     */
    protected async unmarkNodes(): Promise<void> {
        var nodes: T[] = [];

        Object.keys(this.markedNodesMap)
            .forEach((key: string) => {
                nodes.push(this.markedNodesMap[key]);
            });

        await Promise.all(nodes.map((node: T) => {
            return this.unmarkNode(node);
        }));
    }

    /**
     * Get node hash
     */
    protected getNodeHash(node: T): Promise<string> {
        return this.hashMethod(node);
    }
}