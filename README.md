# ajlm.utils
Some serviceable classes used in my various projects


## Command Line Utilities
*ParametersGetter* returns command line arguments under a map format.In this way, check of presence is easier.

Example:

```js

node prog.js -arg1 valueForArg1 -arg2 --arg3 valueForArg3

// will return the map:
{
    arg1: valueForArg1,
    arg2: arg2,
    arg3: valueForArg3
}

```

## Configuration Holder (to finish)
Usually stored as JSON, configuration files are loaded using either a *require* statement or a file system read. The goal is to formalize the expected configuration file type (as a TypeScript type definition) and allow for easy retrieval.

Example:

```typescript

// JSON file example:
{
    "param1": {
        "subSection1":{
            "p": "valueForP",
            "p2": 3
        }
    },
    "rootParameter": false
}

// Configuration holder type

declare type TExpectedType = {
    param1: {
        subSection1:{
            p: string;
            p2: number;
        }
    },
    rootParameter: boolean;
};

// Configuration holder use:

let currentCfg = require(/** path to json file **/);
let defaultCfg = { /** 
default configuration in case the file does not contain expected values
**/ };

let confHolder = new ConfigurationHolder<TExpectedType>();

// hold current cfg, but first, merge both structure
// to fill missing values
confHolder.initialize(currentCfg, defaultCfg);

confHolder.get("param1.subSection1.p2"); // 3
confHolder.get("rootParameter") // false

```

## Graph Theory
### Breadth First Search Traversal
### Depth First Search Traversal

## List  (to finish)
### Single Linked List

## Map  (to finish)
### Linked Hash Map