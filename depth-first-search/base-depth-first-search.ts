
export enum TreeTraversalType {
    PreOrder,
    PostOrder
}

export abstract class BaseDepthFirstSearch<T> {

    private markedNodesMap: { [hash: string]: T; };


    protected abstract getAdjacentNodes(node: T): Promise<T[]>;

    protected async isNodeMarked(node: T): Promise<boolean> {
        return this.markedNodesMap[await this.getNodeHash(node)] !== undefined;
    }

    protected async markNode(node: T): Promise<void> {
        this.markedNodesMap[ await this.getNodeHash(node)] = node;
    }

    protected async unmarkNode(node: T): Promise<void> {
        var hash: string = await this.getNodeHash(node);

        delete this.markedNodesMap[hash];
    }

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

    protected abstract getNodeHash(node: T): Promise<string>;


    public async perform(node: T, callback: (node: T) => Promise<void | boolean>, 
                        treeTraversalType: TreeTraversalType): Promise<void> {
        
        this.markedNodesMap = {};

        await this.performInternal(node, callback, treeTraversalType);

        await this.unmarkNodes();
    }

    private async performInternal(node: T, callback: (node: T) => Promise<void | boolean>, treeTraversalType: TreeTraversalType): Promise<void> {
        var adjacentNodes = null;

        if (node == null || (await this.isNodeMarked(node)) == true) {
            return;
        }

        // Mark node as discovered to avoid
        // processing it twice
        await this.markNode(node);

        if (treeTraversalType == TreeTraversalType.PreOrder) {
            var result = await callback(node);
            if (result != undefined && !result) {
                return;
            }
        }

        adjacentNodes = await this.getAdjacentNodes(node);

        if (adjacentNodes) {
            await Promise.all(adjacentNodes.map((adjacentNode: T) => {
                return this.performInternal(adjacentNode, callback, treeTraversalType);
            }));
        }

        if (treeTraversalType == TreeTraversalType.PostOrder) {
            var result = await callback(node);
            if (result != undefined && !result) {
                return;
            }
        }

    }
}
