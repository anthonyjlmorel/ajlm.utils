import { LinkedList } from '../list/linked-list';

/**
 * 
 *  @TODO to approach realy hash map
 *      - use an array for the bucket
 *      - hash function must return an int (instead of string today)
 *      - me must, at some point, resize the array to avoid too many collisions
 *              => keep track of collisions count, when it exceed a load factor
 *                  (collisions count relative to array size ?), resize array and rehash
 *       Some hash map at some point, transform the bucket into a binary search tree.
 */


/**
 * Hash map options
 */
export type THashMapOptions<Key, Value> = {

    /**
     * Key hasher. Used to determine in which bucket 
     * value will be stored
     */
    getKeyHash: (key: Key) => Promise<string>;

    /**
     * Determines if keys are equal.
     * Used when a collision exists with hash method. In this case,
     * results are stored in a linked list in the same bucket entry.
     * We need to compare keys without hashing them to know who is who
     */
    keysEquals: (left: Key, right: Key) => Promise<boolean>;

    /**
     * Determines if two values are equal. Used internally
     * to avoid storing twice the same data.
     */
    valuesEquals: (left: Value, right: Value) => Promise<boolean>;
};


type TLinkedListItem<Key, Value> = { key: Key; value: Value; };

/**
 * Hash Map
 * Collisions are handled with a linked list.
 * 
 */
export class LinkedHashMap<Key, Value> {

    /**
     * Number of items stored
     */
    private itemsCount: number = 0;

    /**
     * Number of collisions
     */
    private itemCollisions: number = 0;

    /**
     * Object litteral in which slots are
     * stored
     */
    private buckets: {
        [hash: string]: LinkedList<TLinkedListItem<Key, Value>>;
    } = {};
    
    constructor(private options: THashMapOptions<Key, Value>){}
    
    /**
     * Associates a value to a key in the map.
     * 
     * If value is already present in map, it is replaced.
     * 
     * @param key Key
     * @param value Value
     */
    public async set(key: Key, value: Value): Promise<void> {

        let hash: string = await this.options.getKeyHash(key);

        if(!this.buckets[ hash ]){
            
            this.buckets[ hash ] = new LinkedList<TLinkedListItem<Key, Value>>({
                equals: (left, right)=>{
                    // equals method is plugged on values
                    // voluntarily as it is used to avoid
                    // storing the same value twice
                    return this.options.valuesEquals( left.value, right.value );
                }
            });

        }

        // @toto maybe, if value is "sortable", we can improve stuff here
        //       by inserting stuff in ordered way and make 
        //       a dichotomic search
        let toInsert: TLinkedListItem<Key, Value> = {
            key: key,
            value: value
        };

        // voluntarily passing item twice
        // so that if it exists in list (by using the valuesEquals),
        // the list will replace the value instead of having a duplicated entry
        // @todo is there an issue if the replaced value's key is not the same ?

        let sizeBefore: number = this.buckets[ hash ].getCount();
        await this.buckets[ hash ].replace(toInsert, toInsert, true);
        let sizeAfter: number = this.buckets[ hash ].getCount(),
            diff: number = sizeAfter - sizeBefore;

        if(diff == 1){
            this.itemsCount++;

            if( sizeBefore > 0){
                // if we inserted a new item in an existing list,
                // we increment collisions
                this.itemCollisions++;
            }
        }
    }

    /**
     * Retrieves the key associated value
     */
    public async get(key: Key): Promise<Value> {
        let hash: string = await this.options.getKeyHash(key);

        if(!this.buckets[ hash ]) {
            return undefined;
        }

        let iterator = this.buckets[ hash ].getIterator();

        while(iterator.hasNext()){
            let item = iterator.next();

            let areEquals: boolean = await this.options.keysEquals(item.key, key);

            if(areEquals){
                return item.value;
            }
        }

        return null;
    }

    public async delete(key: Key): Promise<Value> {
        let hash: string = await this.options.getKeyHash(key);

        if(!this.buckets[ hash ]) {
            return undefined;
        }

        // @todo to be continued ....
        // this.buckets[ hash ].delete()
    }


    /**
     * Returns the list of stored keys
     * 
     * @todo awful performance here
     */
    public getKeys(): Key[] {
    
        let results: Key[] = [];
        for(var hash in this.buckets){
            let iterator = this.buckets[hash].getIterator();

            while(iterator.hasNext()){
                let item = iterator.next();
                results.push(item.key);
            }
        }
    
        return results;
    }
}