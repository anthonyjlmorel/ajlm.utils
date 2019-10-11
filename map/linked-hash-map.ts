import { LinkedList, TLinkedListOptions } from '../list/linked-list';

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
        await this.buckets[ hash ].replace(toInsert, toInsert, true);
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
}