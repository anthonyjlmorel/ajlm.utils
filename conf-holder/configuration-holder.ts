

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
    public get<R>(pathToProperty: string): R {
        let item: T = this.cfg,
            dotted: string[] = pathToProperty.split(".");

        let prop = dotted.shift();
        let current = item[prop];

        while (dotted.length && current != undefined) {

            prop = dotted.shift();
            if( current[ prop ] ){
                current = current[ prop ];
            }

        }

        return current;
    }


}