

/**
 * Configuration holder
 */
export class ConfigurationHolder<T> {

    /**
     * Cfg read from files
     */
    protected cfg: T;
    
    /**
     * Default configuration
     */
    protected defaultCfg: T;


    public initialize(cfg: T, defaultCfg?: T): void {
        // @TODO make something to merge default into cfg
        //          in case of absent properties
        this.cfg = cfg;
        this.defaultCfg = defaultCfg;
    }


    /**
     * Given a dotted path, return the matching value in the cfg
     * Exemple get("build.hash.hashFileName") should return ".hash";
     */
    public get(pathToProperty: string): any {
        let item = this.cfg,
            dotted: string[] = pathToProperty.split(".");

        while(dotted.length){
            let prop = dotted.shift();
            if( item[ prop ] ){
                item = item[ prop ];
            }
        }

        return item;
    }


}