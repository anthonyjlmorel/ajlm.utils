
/**
 * Defines a Singly Linked list item
 */
export type TLinkedListItem<T> = {
    data: T;
    next: TLinkedListItem<T>;
};

export type TLinkedListOptions<T> = {
    /**
     * Method allowing us to compare two nodes
     */
    equals?: (left: T, right: T) => Promise<boolean>;
};

/**
 * Defines a Single Linked List
 */
export class LinkedList<T> {

    /**
     * Number of items
     */
    protected itemsCount: number = 0;

    /**
     * Method allowing us to compare two nodes
     */
    protected equals: (left: T, right: T) => Promise<boolean>;

    /**
     * first item of the list
     */
    protected rootItem: TLinkedListItem<T>;

    constructor( options?: TLinkedListOptions<T> ) {
        this.equals = (options && options.equals) || (async(left: T, right: T ) => {
            return left == right;
         });
    }

    /**
     * Replaces an entry by another one.
     * Uses the equals method to find value.
     * 
     * Can append at the tail if flag provided.
     * 
     * @return true if data is inserted
     */
    public async replace(data: T, replacer: T, appendIfNotFound:boolean = false): Promise<boolean> {

        let tail = await this.browseList( async (item: TLinkedListItem<T>)=> {

            let areEquals = await this.equals(item.data, data);

            if(areEquals){
                item.data = replacer;
                return true;
            }

        });

        if(tail && appendIfNotFound){
            // not found, append
            tail.next = {
                data: replacer,
                next: null
            };

            this.itemsCount++;

            return true;
        }
        
        // if tail is null, that means we inserted something
        return !tail;
    }

    /**
     * Insert data in the list.
     * 
     * @param data data to insert
     * @param before emplacement where to insert data. If not
     *               provided, or not found, data will be appended
     */
    public async insert(data: T, before?: T): Promise<void> {

        let newItem: TLinkedListItem<T> = {
            data: data,
            next: null
        };

        if(!this.rootItem){
            this.rootItem = newItem;
            this.itemsCount++;
            return;
        }

        
        let areEquals: boolean;

        // treat root item first
        if(before != undefined){
            areEquals = await this.equals(this.rootItem.data, before);
            if(areEquals){
                let next = this.rootItem;
                this.rootItem = newItem;
                newItem.next = next;

                this.itemsCount++;
                return;
            }
        }
        
        let tail = await this.browseList( async (item: TLinkedListItem<T>) => {

            if(before != undefined && item.next) {
                areEquals = await this.equals(item.next.data, before);
                if(areEquals){
                    let next = item.next;
                    item.next = newItem;
                    newItem.next = next;
                    return true;
                }
            }

        });

        if(tail){
            // that means we did not found before (or not provided)
            tail.next = newItem;
        }
        
        this.itemsCount++;
    }

    /**
     * Returns an iterator on this list
     */
    public getIterator(): { next: () => T; hasNext: () => boolean; } {

        // iterator private variables
        let current: TLinkedListItem<T> = this.rootItem ? this.rootItem : null,
            hasNext: boolean = this.rootItem ? true : false;

        return {

            /**
             * Returns next element, if there is one
             */
            next: () => {
                
                if(!hasNext){
                    return null;
                }

                let result: T = current.data;

                current = current.next;

                hasNext = current != null;

                return result;
            },

            /**
             * Tells if there is still data to
             * iterate over
             */
            hasNext: () => {
                return hasNext;
            }
        };
    }

    /**
     * Remove the list entry associated with the passed data.
     * Uses the equals method to ID it
     * 
     * @param data data to remove
     */
    public async delete(data: T): Promise<T> {
        if(!this.rootItem) {
            return undefined;
        }

        let result: T;

        // treat root first
        let areEquals: boolean = await this.equals(this.rootItem.data, data);

        if(areEquals){
            result = this.rootItem.data;
            this.rootItem = this.rootItem.next;
            this.itemsCount--;
            return result;
        }

        let tail = await this.browseList( async(item: TLinkedListItem<T>) => {
            if(item.next){
                areEquals = await this.equals(item.next.data, data);
                if(areEquals){
                    
                    result = item.next.data;

                    item.next = item.next.next;
                    this.itemsCount--
                    return true;
                }
            }
        });
        
        return result;
    }

    /**
     * Return first data of the list
     */
    public getHead(): T {
        return this.rootItem ? this.rootItem.data : null;
    }

    /**
     * List browsing helper.
     * Return the tail of the list unless the callback returned true meaning a browsing stop.
     */
    private async browseList(callback: (item: TLinkedListItem<T>) => Promise<boolean | void>): Promise<TLinkedListItem<T>> {

        if(!this.rootItem){
            return;
        }

        let current = this.rootItem;

        while(current){
            let result = await callback(current);

            if(result){
                // break loop signal
                // do not return last browsed element
                return null;
            }

            current = current.next;
        }

        // return tail in case of full browsed list
        // without stopping signal
        return current;

    }

    /**
     * Gets items count
     */
    public getCount(): number {
        return this.itemsCount;
    }

}