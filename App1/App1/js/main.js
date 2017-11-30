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
            if (variables[word] && variables[word].DataType === "STRING") {
                output = variables[word].Content;
            }
            else if (variables[word] && variables[word].DataType === "BOOLEAN") {
                output = variables[word].Content;
            }
            // if output is a string, find the whole string and assign it to output
            else if (word.substr(0, 1) === "\"") {
                output = GetString();
            }
            // else
            else {

                // get equasion and output it
                output = GetEvaluation();

                // if null was returned, return false
                if (output === null) {
                    return false;
                }

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
            if (variables[word] && variables[word].DataType === "STRING") {
                output = variables[word].Content;
            }
            else if (variables[word] && variables[word].DataType === "BOOLEAN") {
                output = variables[word].Content;
            }
            // if output is a string, find the whole string and assign it to output
            else if (word.substr(0, 1) === "\"") {
                output = GetString();
            }
            // else
            else {

                // get equasion and output it
                output = GetEvaluation();

                // if null was returned, return false
                if (output === null) {
                    return false;
                }

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
                return false;
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

                // get next word
                word = GetEvaluation();

                // if word is numeric
                if (!isNaN(word)) {

                    // parse data and assign data to content
                    content = parseInt(word);

                    AddVar(dataType, name, content);
                }
                else {
                    errorOut.innerHTML += "Conents of an integer must be numeric.";
                    return false;
                }
            }
            // check for semicolons
            else if (word === null) {
                AddVar(dataType, name, null);
            }
            // else, statement was not completed properly; error
            else {
                errorOut.innerHTML += "Assignment statement unfinished.";
                return false;
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

                // get next word
                word = GetEvaluation();

                // if word is numeric
                if (!isNaN(word)) {

                    // parse data and assign data to content
                    content = parseFloat(word);

                    AddVar(dataType, name, content);
                }
                else {
                    errorOut.innerHTML += "Contents of n double must be numeric.";
                    return false;
                }
            }
            // check for semicolons
            else if (word === null) {
                AddVar(dataType, name, null);
            }
            // else, statement was not completed properly; error
            else {
                errorOut.innerHTML += "Assignment statement unfinished.";
                return false;
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
                if (word === "false" || word === "0") {

                    content = false;

                    // add var to dictionary
                    AddVar(dataType, name, content);
                }
                // if word is false or 1, assign false
                else if (word === "true" || word === "1") {

                    content = true;

                    // add var to dictionary
                    AddVar(dataType, name, content);
                }
                // else, error and return
                else {
                    errorOut.innerHTML += "Conents of a boolean must be either true or false.";
                    return false;
                }
            }
            // check for semicolons
            else if (word === null) {
                AddVar(dataType, name, null);
            }
            // else, statement was not completed properly; error
            else {
                errorOut.innerHTML += "Assignment statement unfinished.";
                return false;
            }
        }
        else if (word.toUpperCase() === "STRING") {
            dataType = "STRING";

            // get next word
            word = GetNextWord();

            // TODO VALIDATION FOR NAMING RULES
            // if variable name already exists or variable name is a keyword, error
            if (keywords[word.toUpperCase()] || variables[word]) {
                errorOut.innerHTML += "Invalid variable name.";
                return false;
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

                // assign string word to content
                if (word.substr(0, 1) === "\"") {

                    content = GetString();

                    // If content returns not null, add variable
                    if (content != null) {
                        AddVar(dataType, name, content);
                    }

                }
                else {
                    errorOut.innerHTML += "Contents of a string must be a string.";
                    return false;
                }

            }
            // check for semicolons
            else if (word === null) {
                AddVar(dataType, name, null);
            }
            // else, statement was not completed properly; error
            else {
                errorOut.innerHTML += "Assignment statement unfinished.";
                return false;
            }
        }

    },
    "ASSIGN": function (terp) {

        // get next word
        var varName = GetNextWord();

        // if word exists,
        if (variables[varName]) {

            // If variable being assigned is an integer
            if (variables[varName].DataType === "INT") {

                // get next word
                word = GetNextWord();

                // if next word is a colon i.e. user wants to assign the varialbe, handle assignment
                if (word === ":") {

                    // get next word
                    word = GetNextWord();

                    // get next word
                    word = GetEvaluation();

                    // if word is numeric
                    if (!isNaN(word)) {

                        // parse data and assign data to content
                        content = parseInt(word);

                        UpdateVar(varName, content);
                    }
                    else {
                        errorOut.innerHTML += "Conents of an integer must be numeric.";
                        return false;
                    }
                }
                // else, statement was not completed properly; error
                else {
                    errorOut.innerHTML += "Assignment statement unfinished.";
                    return false;
                }
            }
            // If variable being assigned is an integer
            else if (variables[varName].DataType === "DOUBLE") {

                // get next word
                word = GetNextWord();

                // if next word is a colon i.e. user wants to assign the varialbe, handle assignment
                if (word === ":") {

                    // get next word
                    word = GetNextWord();

                    // get next word
                    word = GetEvaluation();

                    // if word is numeric
                    if (!isNaN(word)) {

                        // parse data and assign data to content
                        content = parseFloat(word);

                        UpdateVar(varName, content);
                    }
                    else {
                        errorOut.innerHTML += "Contents of n double must be numeric.";
                        return false;
                    }
                }
                // else, statement was not completed properly; error
                else {
                    errorOut.innerHTML += "Assignment statement unfinished.";
                    return false;
                }

            }
            else if (variables[varName].DataType === "BOOLEAN") {

                // get next word
                word = GetNextWord();

                // if next word is a colon i.e. user wants to assign the varialbe, handle assignment
                if (word === ":") {

                    // get next word
                    word = GetNextWord();

                    // if word is true or 0, assign true
                    if (word === "false" || word === "0") {

                        content = false;

                        // add var to dictionary
                        UpdateVar(varName, content);
                    }
                    // if word is false or 1, assign false
                    else if (word === "true" || word === "1") {

                        content = true;

                        // add var to dictionary
                        UpdateVar(varName, content);
                    }
                    // else, error and return
                    else {
                        errorOut.innerHTML += "Conents of a boolean must be either true or false.";
                        return false;
                    }
                }
                // else, statement was not completed properly; error
                else {
                    errorOut.innerHTML += "Assignment statement unfinished.";
                    return false;
                }
            }
            else if (variables[varName].DataType === "STRING") {

                // get next word
                word = GetNextWord();

                // if next word is a colon i.e. user wants to assign the varialbe, handle assignment
                if (word === ":") {

                    // get next word
                    word = GetNextWord();

                    // assign string word to content
                    if (word.substr(0, 1) === "\"") {

                        content = GetString();

                        // If content returns not null, add variable
                        if (content != null) {
                            // add var to dictionary
                            UpdateVar(varName, content);
                        }

                    }
                    else {
                        errorOut.innerHTML += "Contents of a string must be a string.";
                        return false;
                    }

                }
                // else, statement was not completed properly; error
                else {
                    errorOut.innerHTML += "Assignment statement unfinished.";
                    return false;
                }
            }
            else {
                errorOut.innerHTML += "Assignment statement unfinished.";
                return false;
            }

            }
            // else, error and return
            else {
                errorOut.innerHTML = "Variable does not exist.";
                return false;
            }
        }
};

function HitSubmit() {

    // Var for input text
    var input;

    // If input is from text area, get input from text area
    if (document.getElementById("textType").checked) {

        // Get text from html element innerHTML
        input = document.getElementById("textInput").innerText;

    }
    // If input is from file, get input from file
    else if (document.getElementById("fileType").checked) {

        var file = document.getElementById("fileInput").files[0];

        if (file === null) {
            errorOut.innerHTML = "Ya dun goofed!! No file was selected.";
            return;
        }
        else {

            // check to see if filetype is .iced file
            if (file.name.split('.').pop().toLowerCase() === "iced") {

                // new reader
                var reader = new FileReader();

                //// event handler for when reader has read the file 
                //reader.onload = function () {

                //    // assign input to text in file
                //    input = this.result;

                //}

                // read file as plain text (this will trigger 'onload' event)
                reader.readAsText(file);

                // get text
                input = reader.result;

            }
            else {
                errorOut.innerHTML = "File type error. Only .iced files accepted.";
                return;
            }

        }

    }

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

                    // var to store returned value
                    var returnVar = true;

                    // process word TODO
                    if (keywords[word])
                    {
                        returnVar = keywords[word](this);
                    }
                    else if (variables[word]) {
                        outputOut.innerHTML = variables[word].Content;
                    }
                    else {
                        errorOut.innerHTML += "Word not recognized: " + word;
                        return;
                    }

                    if (returnVar === false) {
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

function UpdateVar(name, newContent) {

    // update variable
    variables[name].Content = newContent;

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
        if (collection[i].trim() === "" || collection[i] === "\n") {
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

function GetEvaluation() {

    var evalString = "";

    var outString = "";

    while (word != null) {

        // determine if word exists
        if (variables[word]) {

            evalString += variables[word].Content;

        }
        else {
            evalString += word;
        }

        word = GetNextWord();
    }

    // try to evaluate string expression
    try {
        outString = eval(evalString);
    }
    catch (e) {
        // error if evaluation did not work
        errorOut.innerHTML += "Output of evaluation was not in a correct format.<br/>" +
                              "Are all values numeric?";
        return null;
    }

    return outString;

}

function textMode() {

    document.getElementById("textInput").style.visibility = "visible";

    document.getElementById("fileInput").style.visibility = "hidden";

}

function fileMode() {

    document.getElementById("fileInput").style.visibility = "visible";

    document.getElementById("textInput").style.visibility = "hidden";

}

document.getElementById("compile").addEventListener("click", HitSubmit);

document.getElementById("textType").addEventListener("click", textMode);
document.getElementById("fileType").addEventListener("click", fileMode);

document.getElementById("textInput").onclick = function () {

    document.getElementById("textInput").style.visibility = "visible";

    document.getElementById("fileInput").style.visibility = "hidden";

}

//document.getElementById("textInput").addEventListener()
//document.addEventListener("keydown", DoIntellisence);