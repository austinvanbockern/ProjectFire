var doctype = "ICEICEBABY";

var outputOut = document.getElementById("output");

var stackOut = document.getElementById("stack");

var terp;

var words;

var next;

var PrintWords = {
    // Print and discard top of stack.
    "PRINT": function (terp) {
        if ((words.length - next) < 1) {
            outputOut.innerHTML = "Not enough items on stack";
            return false;
        }
        var tos = terp.lexer.nextWord();
        outputOut.innerHTML += tos;
    },
    // Print out the contents of the stack.
    "PSTACK": function (terp) {
        outputOut.innerHTML += terp.stack;
    }
};

var CommentWords = {
    ">>": function (terp) {
        do {
            var next_word = terp.lexer.nextWord();
            if (next_word === null) {
                outputOut = "Unexpected end of input";
            }
        } while (next_word.substr(-2, 2) !== "<<");
    }

    //"(": function (terp) {
    //	terp.lexer.nextCharsUpTo(")");
    //},

    //"//": function (terp) {
    //	terp.lexer.nextCharsUpTo("\n");
    //}
};
CommentWords[">>"].immediate = true;
//CommentWords["("].immediate = true;
//CommentWords["//"].immediate = true;
//CommentWords["\\"] = CommentWords["//"];

var MathWords = {
    "+": function (terp) {
        if (terp.stack.length < 2) {
            outputOut.innerHTML = "Not enough items on stack";
        }
        var tos = terp.stack.pop();
        var _2os = terp.stack.pop();
        terp.stack.push(_2os + tos);
    },
    "-": function (terp) {
        if (terp.stack.length < 2) {
            outputOut.innerHTML = "Not enough items on stack";
        }
        var tos = terp.stack.pop();
        var _2os = terp.stack.pop();
        terp.stack.push(_2os - tos);
    },
    "*": function (terp) {
        if (terp.stack.length < 2) {
            outputOut.innerHTML = "Not enough items on stack";
        }
        var tos = terp.stack.pop();
        var _2os = terp.stack.pop();
        terp.stack.push(_2os * tos);
    },
    "/": function (terp) {
        if (terp.stack.length < 2) {
            outputOut.innerHTML = "Not enough items on stack";
        }
        var tos = terp.stack.pop();
        var _2os = terp.stack.pop();
        terp.stack.push(_2os / tos);
    },
    "SQRT": function (terp) {
        if (terp.stack.length < 1) {
            outputOut.innerHTML = "Not enough items on stack";
        }
        var tos = terp.stack.pop();
        terp.stack.push(Math.sqrt(tos));
    }
};

var StackWords = {
    // Duplicate the top of stack (TOS).
    "DUP": function (terp) {
        if (terp.stack.length < 1) {
            outputOut.innerHTML = "Not enough items on stack";
        }
        var tos = terp.stack.pop();
        terp.stack.push(tos);
        terp.stack.push(tos);
    },
    // Throw away the TOS -- the opposite of DUP.
    "DROP": function (terp) {
        if (terp.stack.length < 1) {
            outputOut.innerHTML = "Not enough items on stack";
        }
        terp.stack.pop();
    },
    // Exchange positions of TOS and second item on stack (2OS).
    "SWAP": function (terp) {
        if (terp.stack.length < 2) {
            outputOut.innerHTML = "Not enough items on stack";
        }
        var tos = terp.stack.pop();
        var _2os = terp.stack.pop();
        terp.stack.push(tos);
        terp.stack.push(_2os);
    },
    // Copy 2OS on top of stack.
    "OVER": function (terp) {
        if (terp.stack.length < 2) {
            outputOut.innerHTML = "Not enough items on stack";
        }
        var tos = terp.stack.pop();
        var _2os = terp.stack.pop();
        terp.stack.push(_2os);
        terp.stack.push(tos);
        terp.stack.push(_2os);
    },
    // Bring the 3rd item on stack to the top.
    "ROT": function (terp) {
        if (terp.stack.length < 3) {
            outputOut.innerHTML = "Not enough items on stack";
        }
        var tos = terp.stack.pop();
        var _2os = terp.stack.pop();
        var _3os = terp.stack.pop();
        terp.stack.push(_2os);
        terp.stack.push(tos);
        terp.stack.push(_3os);
    },
};

function makeWord(code) {
    return function (terp) {
        var old_pointer = terp.code_pointer;
        terp.code_pointer = 0;
        while (terp.code_pointer < code.length) {
            terp.interpret(code[terp.code_pointer]);
            terp.code_pointer++;
        }
        terp.code_pointer = old_pointer;
    };
}

var CompilingWords = {
    "DEF": function (terp) {
        var new_word = terp.lexer.nextWord();
        if (new_word === null) {
            outputOut.innerHTML = "Unexpected end of input";
        }

        terp.latest = new_word;
        terp.startCompiling();
    },

    "END": function (terp) {
        var new_code = terp.stack.slice(0); // Clone compile_buffer.
        terp.stack.length = 0; // Clear compile_buffer.
        terp.define(terp.latest, makeWord(new_code));
        terp.stopCompiling();
    }
};
CompilingWords["DEF"].immediate = true;
CompilingWords["END"].immediate = true;

var ListWords = {
    "[": function (terp) {
        var list = [];
        var old_stack = terp.stack;
        terp.stack = list;

        do {
            var next_word = terp.lexer.nextWord();
            if (next_word === null) {
                outputOut.innerHTML = "Unexpected end of input";
            }
            if (next_word === "]") break;

            next_word = terp.compile(next_word);
            if (next_word.immediate)
                terp.interpret(next_word);
            else
                terp.stack.push(next_word);
        } while (true);

        terp.stack = old_stack;
        terp.stack.push(list);
    },

    "LENGTH": function (terp) {
        if (terp.stack.length < 1) {
            outputOut.innerHTML = "Not enough items on stack";
        }
        var temp = terp.stack.pop();
        terp.stack.push(temp.length);
    },

    "ITEM": function (terp) {
        if (terp.stack.length < 2) {
            outputOut.innerHTML = "Not enough items on stack";
        }
        var key = terp.stack.pop();
        var obj = terp.stack.pop();
        if (typeof obj === "object") {
            terp.stack.push(obj[key]);
        }
        else {
            outputOut.innerHTML = "Object expected";
        }
    }
};
ListWords["["].immediate = true;

var ControlWords = {
    "RUN": function (terp) {
        if (terp.stack.length < 1) {
            outputOut.innerHTML = "Not enough items on stack";
        }
        var temp = terp.stack.pop();
        if (temp.constructor !== Array) {
            outputOut.innerHTML = "List expected";
        }

        terp.interpret(makeWord(temp));
    },

    "?CONTINUE": function (terp) {
        if (terp.stack.length < 1) {
            outputOut.innerHTML = "Not enough items on stack";
        }
        var cond = terp.stack.pop();
        if (cond) terp.code_pointer = Infinity;
    },

    "?BREAK": function (terp) {
        if (terp.stack.length < 1) {
            outputOut.innerHTML = "Not enough items on stack";
        }
        var cond = terp.stack.pop();
        if (cond) {
            terp.code_pointer = Infinity;
            terp.break_state = true;
        }
    },

    "LOOP": function (terp) {
        if (terp.stack.length < 1) {
            outputOut.innerHTML = "Not enough items on stack";
        }
        var code = terp.stack.pop();
        if (code.constructor !== Array) {
            outputOut.innerHTML = "List expected";
        }

        var code_word = makeWord(code);
        var old_break_state = terp.break_state;
        terp.break_state = false;
        do { code_word(terp); } while (!terp.break_state);
        terp.break_state = old_break_state;
    }
};

var LogicWords = {
    "TRUE": function (terp) { terp.stack.push(true); },
    "FALSE": function (terp) { terp.stack.push(false); },

    "AND": function (terp) {
        if (terp.stack.length < 2) {
            outputOut.innerHTML = "Not enough items on stack";
        }
        var term2 = terp.stack.pop();
        var term1 = terp.stack.pop();
        terp.stack.push(term1 && term2);
    },

    "OR": function (terp) {
        if (terp.stack.length < 2) {
            outputOut.innerHTML = "Not enough items on stack";
        }
        var term2 = terp.stack.pop();
        var term1 = terp.stack.pop();
        terp.stack.push(term1 || term2);
    },

    "NOT": function (terp) {
        if (terp.stack.length < 1) {
            outputOut.innerHTML = "Not enough items on stack";
        }
        terp.stack.push(!terp.stack.pop());
    }
};
LogicWords["BOTH"] = LogicWords["AND"];
LogicWords["EITHER"] = LogicWords["OR"];

var CompareWords = {
    // less than
    "<": function (terp) {
        if (terp.stack.length < 1) {
            outputOut.innerHTML = "Not enough items on stack";
        }
        var term1 = terp.stack.pop();
        var term2 = terp.lexer.nextWord();
        terp.stack.push(term1 < term2);
    },
    "<=": function (terp) {
        if (terp.stack.length < 2) {
            outputOut.innerHTML = "Not enough items on stack";
        }
        var term2 = terp.stack.pop();
        var term1 = terp.stack.pop();
        terp.stack.push(term1 <= term2);
    },
    "=": function (terp) {
        if (terp.stack.length < 2) {
            outputOut.innerHTML = "Not enough items on stack";
        }
        var term2 = terp.stack.pop();
        var term1 = terp.stack.pop();
        terp.stack.push(term1 == term2);
    },
    ">=": function (terp) {
        if (terp.stack.length < 2) {
            outputOut.innerHTML = "Not enough items on stack";
        }
        var term2 = terp.stack.pop();
        var term1 = terp.stack.pop();
        terp.stack.push(term1 >= term2);
    },
    ">": function (terp) {
        if (terp.stack.length < 2) {
            outputOut.innerHTML = "Not enough items on stack";
        }
        var term2 = terp.stack.pop();
        var term1 = terp.stack.pop();
        terp.stack.push(term1 > term2);
    }
};


function setup() {
    // alert("setup() accessed"); // debugging alert
}

function hitSubmit() {
    //alert("hitSubmit() accessed"); // alert that says method is accessed

    //// Clear output
    //outputOut.innerHTML = "";

    ///* Make new interpreter object */
    //terp = new Scratch();

    //terp.addWords(PrintingWords);
    //terp.addWords(MathWords);
    //terp.addWords(StackWords);
    //terp.addWords(CommentWords);
    //terp.addWords(CompilingWords);
    //terp.addWords(ListWords);
    //terp.addWords(ControlWords);
    //terp.addWords(LogicWords);
    //terp.addWords(CompareWords);

    // Run
    var input = document.getElementById("input").value;

    //terp.run(input);
    //// Output what is in the stack
    //stackOut.innerHTML = terp.stack;

    Interpret(input);

    return false;
}

//// Collections
// Dictionary for keybords
var keywords = {};
// 2d array for variables
var variables = [[]];
// Array for words within a statement
var words = [];
// Array for statements i.e. single lines of code
var statements = [];

//// Tracking variables
// var for index of statements array
var stateI = 0;
// var for index of words array
var wordsI = 0;
// var for current word
var word = "";
// var for current statement
var statement = "";

//// Delimeters
// delimeter for separating statements
var statementDelim = ";";

// Interpret(Compile) code 
function Interpret(input) {

    // add keywords to dictionary
    AddDictWords(PrintWords);

    // Split input into individual statements
    statements = SplitStatements(input);

    // check for doctype statement
    if (GetNextStatement() === doctype) {
        // Loop through statements, processing each one
        for (stateI = 1; stateI < statements.length; stateI++) {
            // get current statement
            statement = GetNextStatement();

            // if null was not assigned to current statement, loop through statement and process each word
            if (statement != null) {

                // get current statement
                words = SplitSpaces(statement);

                // loop through words in current statement
                for (wordsI = 0; wordsI < words.length; wordsI++) {
                    // get current word
                    word = GetNextWord();

                    // process word
                    if (keywords[word])
                    {
                        keywords[word](this);
                    }

                    //outputOut.innerHTML += word + ", ";
                }
            }
            // else, break out of statement loop
            else {
                alert("Statement is null.");
                break;
            }
        }
    }
    else {
        outputOut.innerHTML = "DOCTYPE not found.";
    }
}

// Try and add variable to variable list
function AddVar(dataType, name, content) {

}

// Split designated text by spaces
function SplitSpaces(text) {
    // Create and return array from input split at spaces
    var collection = text.split(/\s+/);
    // clean array of blank elements and return it
    return RemoveBlanks(collection);
}

// Split designated text into statements 
function SplitStatements(text) {
    // Create and return array from input split at spaces
    var collection = text.split(statementDelim);
    // clean array of blank elements and return it
    return RemoveBlanks(collection);
}

// Get next statement in the statements array
function GetNextStatement() {
    // If the next statement does not exist i.e. end of code, return null
    if (stateI >= statements.length)
        return null;
    // else, return the statement
    else
        return statements[stateI];
}

// Get next word in the array
function GetNextWord() {
    // If the next word does not exist i.e. end of statement, return null
    if (wordsI >= words.length)
        return null;
    // else, return the word
    else
        return words[wordsI];
}

// Remove blank elements from an array and return cleaned array
function RemoveBlanks(collection) {
    // loop trough array
    for (var i = 0; i < collection.length; i++) {
        // test if index is blank
        if (collection[i] === "") {
            // remove element at that index
            collection.splice(i, 1);
        }
    }
    // return clean collection
    return collection;
}

// Add keywords to keywords dictuonary
function AddDictWords(dictionary) {
    // Loop through sss
    for (var word in dictionary)
    {
        keywords[word.toUpperCase()] = dictionary[word];
    }
}









































function Scratch() {
    var dictionary = {};
    var data_stack = [];
    var compile_buffer = [];
    var variables = [[]];

    this.stack = data_stack; // Was: this.stack = [];
    this.immediate = false;


    this.compile = function (word) {
        var word = word.toUpperCase();
        var num_val = parseFloat(word);
        if (dictionary[word]) {
            this.immediate = dictionary[word].immediate;
            return dictionary[word];
        } else if (!isNaN(num_val)) {
            return num_val;
        } else {
            outputOut.innerHTML = "Unknown word";
        }
    };

    // attempt to run code
    this.run = function (text) {
        // new lexer object
        
    };

    this.interpret = function (word) {
        if (typeof (word) == 'function') {
            word(this);
        } else {
            this.stack.push(word);
        }
    };

    this.startCompiling = function () {
        this.stack = compile_buffer;
    };

    this.stopCompiling = function () {
        this.stack = data_stack;
    };

    this.isCompiling = function () {
        return this.stack == compile_buffer;
    };
}

document.getElementById("compile").addEventListener("click", hitSubmit);