
export type TCommandLineParameters = {
    [param: string]: string;
};

export class ParametersGetter {

    /**
     * Retrieves all command line arguments where
     * parameters are passed using "-" or "--" like:
     * 
     * program --param1 value1 -p2 value2
     */
    public getParameters(): TCommandLineParameters {
        return this.convertArgvIntoParametersMap(process.argv);
    }

    
    public convertArgvIntoParametersMap(argv: string[]): TCommandLineParameters {
        let result: TCommandLineParameters = {};

        if(argv.length <= 2){
            return result;
        }

        let i: number = 2;
        do {

            let current = argv[i];

            // removing "-" or "--"
            let substrIndex: number = 0;
            if(current.charAt(0) == "-"){
                substrIndex = 1;
            }
            if(current.charAt(1) == "-"){
                substrIndex = 2;
            }

            current = current.substring(substrIndex);

            // no leading - or --
            if(!substrIndex){
                result[ current ] = current;
                i++;
            } else {

                // if no next value provided, store it as if and break
                if(i+1 >= argv.length){
                    result[ current ] = current;
                    break;
                }

                let nextArg = argv[ i + 1 ];

                // if next argument is not a specifier,
                // treat it like a value
                if(nextArg.charAt(0) !== "-"){
                    result[ current ] = nextArg;
                    i+=2;
                } else {
                    // the current value is a lonely parameter
                    result[ current ] = current;
                    i+=1;
                }

                
            }

        } while( i < argv.length)

        return result;
    }


}