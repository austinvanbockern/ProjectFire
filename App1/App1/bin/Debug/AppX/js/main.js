var doctype = ">>ICED_LATTE<<";

var outputOut = document.getElementById("output");

var stackOut = document.getElementById("stack");

var terp;

var words;

var next;

var PrintingWords = {
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

    // Clear output
    outputOut.innerHTML = "";

    /* Make new interpreter object */
    terp = new Scratch();

    terp.addWords(PrintingWords);
    terp.addWords(MathWords);
    terp.addWords(StackWords);
    terp.addWords(CommentWords);
    terp.addWords(CompilingWords);
    terp.addWords(ListWords);
    terp.addWords(ControlWords);
    terp.addWords(LogicWords);
    terp.addWords(CompareWords);

    // Run
    var input = document.getElementById("input").value;

    terp.run(input);
    // Output what is in the stack
    stackOut.innerHTML = terp.stack;

    return false;
}

function ScratchLexer(text) {
    // Create array from input
    words = text.split(/\s+/);
    // Var as index
    next = 0;

    this.nextWord = function () {
        if (next >= words.length) return null;
        return words[next++];
    };
}

function Scratch() {
    var dictionary = {};
    var data_stack = [];
    var compile_buffer = [];
    var variables = [[]];

    this.stack = data_stack; // Was: this.stack = [];
    this.immediate = false;

    this.addWords = function (new_dict) {
        for (var word in new_dict)
            dictionary[word.toUpperCase()] = new_dict[word];
    };

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
        this.lexer = new ScratchLexer(text);
        // get next word
        var word = this.lexer.nextWord();

        // if the first word does not match the doctype, stop, quit trying to run
        if (word != doctype) {
            return false;
        }

        // loop through each individual word of code
        while (word = this.lexer.nextWord()) {
            // dysipher the word
            word = this.compile(word);
            // if current word is part of a sequence,
            if (this.immediate) {
                this.interpret(word);
                this.immediate = false;
            } else if (this.isCompiling()) {
                this.stack.push(word);
            } else {
                this.interpret(word);
            }
        }
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