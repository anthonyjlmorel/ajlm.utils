
export type TCommandLineParameters = {
    [param: string]: any;
};

export class ParametersGetter {



    /**
     * Retrieves all command line arguments where
     * parameters are passed using "-" or "--" like:
     * 
     * program --param1 value1 -p2 value2
     */
    public getParameters(): TCommandLineParameters {
        let result: TCommandLineParameters = {};

        if(process.argv.length <= 2){
            return result;
        }

        let i: number = 2;
        do {

            let current = process.argv[i];

            let substrIndex: number = 0;
            if(current.charAt(0) == "-"){
                substrIndex = 1;
            }
            if(current.charAt(1) == "-"){
                substrIndex = 2;
            }

            current = current.substring(substrIndex);

            if(!substrIndex){
                result[ current ] = current;
                i++;
            } else {

                if(i+1 >= process.argv.length){
                    break;
                }

                let value = process.argv[ i + 1 ];
                result[ current ] = value;
                i+=2;
            }

        } while( i < process.argv.length)

        return result;
    }


}