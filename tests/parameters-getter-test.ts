

import { ok, fail } from "assert";

import { ParametersGetter, TCommandLineParameters } from "..";

describe("Testing parameters getter", function() {

    it("Should return a map of parameters/values", function(){

        let parameters: string[] = ["node", 
        "script.js", 
        "param1", 
        "-param2", "value2",
        "--paramLonely",
        "--param3", "value3",
        "--param4"];
    
        let resultMap: TCommandLineParameters = (new ParametersGetter()).convertArgvIntoParametersMap(parameters);

        ok( resultMap["param1"] == "param1", "Wrong value for param1");
        ok( resultMap["param2"] == "value2", "Wrong value for param2");
        ok( resultMap["param3"] == "value3", "Wrong value for param3");
        ok( resultMap["param4"] == "param4", "Wrong value for param4");
        ok( resultMap["paramLonely"] == "paramLonely", "Wrong value for paramLonely");

    });

});