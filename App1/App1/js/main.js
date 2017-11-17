var outputOut = document.getElementById("output");

var errorOut = document.getElementById("errors");


// Keywords for printing
var PrintWords = {
    // Print and discard top of stack.
    "PRINT": function () {
        // get the next word
        word = GetNextWord();
        // if the next word is null i.e. does not exist, error
        if (word != null) {

            // var for output
            var output = "";

            // if word is a variable, assign contents to output
            if (variables[word]) {
                output = variables[word].Content;
            }
            // if output is a string, find the whole string and assign it to output
            else if (word.substr(0, 1) === "\"") {
                output = GetString();
            }
            // if content is a number, assign number to output
            else if (!isNaN(word)) {
                output = word;
            }
            // else, error and return
            else {
                errorOut.innerHTML += "Unexpected word to PRINT: " + word;
                return;
            }

            // output output
            outputOut.innerHTML += output;
        }
        // else, error and stop interpreting/compiling
        else {
            errorOut.innerHTML += "Nothing to print. Missing parameter.";
            return;
        }
    },
    // Print out the contents of the stack.
    "PRINTLINE": function () {
        // get the next word
        word = GetNextWord();
        // if the next word is null i.e. does not exist, error
        if (word != null) {

            // var for output
            var output = "";

            // if word is a variable, assign contents to output
            if (variables[word]) {
                output = variables[word].Content;
            }
            // if output is a string, find the whole string and assign it to output
            else if (word.substr(0, 1) === "\"") {
                output = GetString();
            }
            // if content is a number, assign number to output
            else if (!isNaN(word)) {
                output = word;
            }
            // else, error and return
            else {
                errorOut.innerHTML += "Unexpected word to PRINT: " + word;
                return;
            }

            // output output
            outputOut.innerHTML += output + "<br />";
        }
        // else, error and stop interpreting/compiling
        else {
            errorOut.innerHTML += "Nothing to print. Missing parameter.";
            return;
        }
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

var VariableWords = {
    // less than
    "NEW": function () {

        var dataType = "";
        var name = "";
        var content;

        word = GetNextWord();

        // If variable being declared is an integer
        if (word.toUpperCase() === "INT") {

            // set datatype as int
            dataType = "INT";

            // get next word
            word = GetNextWord();

            // TODO VALIDATION FOR NAMING RULES
            // if variable name already exists or variable name is a keyword, error
            if (keywords[word] || variables[word]) {
                errorOut.innerHTML += "Invalid variable name.";
                return;
            }
            // else, assign word to variable name var
            else {
                name = word;
            }

            // get next word
            word = GetNextWord();

            // if next word is a colon i.e. user wants to assign the varialbe, handle assignment
            if (word === ":") {

                // get next word
                word = GetNextWord();

                // if word is numeric
                if (!isNaN(word)) {

                    // parse data and assign data to content
                    content = parseInt(word);

                    AddVar(dataType, name, content);
                }
                else {
                    errorOut.innerHTML += "Conents of an integer must be numeric.";
                }
            }
            // check for semicolons
            else if (word === ";") {

            }
            // else, statement was not completed properly; error
            else {
                errorOut.innerHTML += "Assignment statement unfinished.";
            }
        }
        // If variable being declared is a DOUBLE
        else if (word.toUpperCase() === "DOUBLE") {

            // set datatype as double
            dataType = "DOUBLE";

            // get next word
            word = GetNextWord();

            // if variable name already exists or variable name is a keyword, error and return
            if (keywords[word.toUpperCase()] || variables[word]) {
                errorOut.innerHTML += "Invalid variable name.";
                return;
            }
            // else, assign word to variable name var
            else {
                name = word;
            }

            // get next word
            word = GetNextWord();

            // if next word is a colon i.e. user wants to assign the varialbe, handle assignment
            if (word === ":") {

                // get next word
                word = GetNextWord();

                // if word is numeric
                if (!isNaN(word)) {

                    // parse data and assign data to content
                    content = parseFloat(word);

                    AddVar(dataType, name, content);
                }
                else {
                    errorOut.innerHTML += "Contents of n double must be numeric.";
                }
            }
            // check for semicolons
            else if (word === ";") {

            }
            // else, statement was not completed properly; error
            else {
                errorOut.innerHTML += "Assignment statement unfinished.";
            }
        }
        else if (word.toUpperCase() === "BOOLEAN") {

            // set datatype as boolean
            dataType = "BOOLEAN";

            // get next word
            word = GetNextWord();

            // TODO VALIDATION FOR NAMING RULES
            // if variable name already exists or variable name is a keyword, error
            if (keywords[word.toUpperCase()] || variables[word]) {
                errorOut.innerHTML += "Invalid variable name.";
                return;
            }
            // else, assign word to variable name var
            else {
                name = word;
            }

            // get next word
            word = GetNextWord();

            // if next word is a colon i.e. user wants to assign the varialbe, handle assignment
            if (word === ":") {

                // get next word
                word = GetNextWord();

                // if word is true or 0, assign true
                if (word === "true" || word === "0") {

                    content = true;

                    // add var to dictionary
                    AddVar(dataType, name, content);
                }
                // if word is false or 1, assign false
                else if (word === "false" || word === "1") {

                    content = false;

                    // add var to dictionary
                    AddVar(dataType, name, content);
                }
                // else, error and return
                else {
                    errorOut.innerHTML += "Conents of a boolean must be either true or false.";
                    return;
                }
            }
            // check for semicolons
            else if (word === ";") {

            }
            // else, statement was not completed properly; error
            else {
                errorOut.innerHTML += "Assignment statement unfinished.";
            }
        }
        else if (word.toUpperCase() === "STRING") {
            dataType = "STRING";
        }

    },
    "ASSIGN": function (terp) {

        // get next word
        word = GetNextWord();

        // if word exists, handle
        if (variables[word]) {

            // assign current word to variable to be used later
            indexer = word;

            // get next word
            word = GetNextWord();

            // make sure next word is assignment opperator
            if (word === ":") {

                // get next word
                word = GetNextWord();

                // handle data type
                if (variables[indexer].DataType === "BOOLEAN" &&
                    variables[indexer].Content === true ||
                    variables[indexer].Content === false) {

                }
                else if (variables[indexer].DataType === "DOUBLE" &&
                         !isNaN(variables[indexer].Content)) {

                }
                else if (variables[indexer].DataType === "INT" &&
                         !isNaN(variables[indexer].Content)) {

                }
                    // fix TODO
                else if (variables[indexer].DataType === "STRING" &&
                         isString?!?!!?!?) {

                }
                
            }

        }
        // else, error and return
        else
        {
            errorOut.innerHTML = "Variable does not exist.";
            return;
        }

    }
};

function setup() {
    // alert("setup() accessed"); // debugging alert
}

function HitSubmit() {

    // Run
    var input = document.getElementById("input").innerText;

    // Reset form
    ResetForm();

    // Run interpreter
    Interpret(input);

    // return false so action prop of form is not run
    return false;
}

function DoIntellisence() {

    //var text = document.getElementById("input").innerHTML;

    //var cursor = document.getElementById("input").selectionStart;

    //if (text.indexOf("PRINT") !== -1)
    //{
    //    document.getElementById("input").innerHTML = text.replace("PRINT", "<span style=\"color: blue\">PRINT</span>");
    //}

    //document.getElementById("input").move('character', cursor);
    //document.getElementById("input").select();

    //document.getElementById("input").selectionStart = cursor;

}

// Resets form and class level variables
function ResetForm() {

    keywords = {};
    variables = {
        DataType: "DataType",
        Content: "Content"
    };
    words = [];
    statements = [];

    stateI = 0;
    wordsI = 0;
    word = "";
    statement = "";

    outputOut.innerHTML = "";
    errorOut.innerHTML = "";
}

//// Constants
// DOCTYPE const
const DOCTYPE = "ICEICEBABY";
// delimeter for separating statements
const STATEMENT_DELIM = ";";

//// Collections
// Dictionary for keybord methods
var keywords = {};
// Dictionary for variables
var variables = {
    DataType: "DataType",
    Content: "Content"
};
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


// Interpret(Compile) code 
function Interpret(input) {

    // add keywords to dictionary
    AddDictWords(PrintWords);
    AddDictWords(VariableWords);

    // Split input into individual statements
    statements = SplitStatements(input);

    // check for doctype statement
    if (GetNextStatement() === DOCTYPE) {
        // Loop through statements, processing each one
        for (stateI = 1; stateI < statements.length; stateI = stateI) {
            // get current statement
            statement = GetNextStatement();

            // if null was not assigned to current statement, loop through statement and process each word
            if (statement != null) {

                // get current statement
                words = SplitSpaces(statement);

                // loop through words in current statement
                for (wordsI = 0; wordsI < words.length; wordsI = wordsI) {

                    // get nexy word
                    word = GetNextWord().toUpperCase();

                    // process word TODO
                    if (keywords[word])
                    {
                        keywords[word](this);
                    }
                    else if (variables[word]) {
                        outputOut.innerHTML = variables[word].Content;
                    }
                    else {
                        errorOut.innerHTML = "Word not recognized: " + word;
                        return;
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

    // add new item to variable dictionary
    variables[name] = {
        DataType: dataType,
        Content: content
    };

}

// Get content of a variable
function GetVar(name) {

    return variables[name].Content;

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
    var collection = text.split(STATEMENT_DELIM);
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
        return statements[stateI++];
}

// Get next word in the array
function GetNextWord() {
    // If the next word does not exist i.e. end of statement, return null
    if (wordsI >= words.length)
        return null;
    // else, return the word
    else
        return words[wordsI++];
}

// Remove blank elements from an array and return cleaned array
function RemoveBlanks(collection) {
    // loop trough array
    for (var i = 0; i < collection.length; i++) {
        // test if index is blank
        if (collection[i] === "" || collection[i] === "\n") {
            // remove element at that index
            collection.splice(i, 1);
        }
    }
    // return clean collection
    return collection;
}

// Add keywords to keywords dictuonary
function AddDictWords(dictionary) {
    // Loop through
    for (var word in dictionary)
    {
        keywords[word.toUpperCase()] = dictionary[word];
    }
}

// Hangle strings (using double quotes) TODO
function GetString() {

    // string to return
    var returnStr = "";

    // If first character is a quote, remove it and find the end quote
    if (word.substr(0, 1) === "\"")
    {
        // Remove first quote
        word = word.slice(1);

        // loop through words 
        while (word != null)
        {
            // If end quote is found, return the current 
            if (word.substr(-1, 1) === "\"")
            {
                word = word.substr(0, word.length - 1);

                returnStr += word;

                return returnStr;
            }
            else {
                // add word to return string
                returnStr += word;

                if (words.length != wordsI) {
                    returnStr += " ";
                }
            }

            // get next word
            word = GetNextWord();
        }

        errorOut.innerHTML += "End quote not found.<br>";
        return;
    }
}

document.getElementById("compile").addEventListener("click", HitSubmit);
//document.addEventListener("keydown", DoIntellisence);