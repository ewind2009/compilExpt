var uniqueBy = function(a, key) {
    var seen = {};
    return a.filter(function(item) {
        var k = key(item);
        return seen.hasOwnProperty(k) ? false : (seen[k] = true);
    })
};
var clone = function(obj){
    var newObj = obj.constructor === Array ? [] : {};
    if(typeof obj !== 'object'){
        return;
    } else {
        for(var i in obj){
            newObj[i] = typeof obj[i] === 'object' ?
                clone(obj[i]) : obj[i];
        }
    }
    return newObj;
};
var hasValue = function (arr,obj) {
    return (arr.indexOf(obj) != -1);
};
var showState = function (state) {
    var tmp = "State: ";
    for (var i in state) {
        var item = state[i];
        for (var j in item) {
            tmp += item[j].str;
        }
    }
    return tmp;
};
var showAction = function (action) {
    for (var i in action) {
        for (var j in action[i]) {
            console.log(action[i][j]);
        }
    }
};

//var S = {
//    '●': {
//        str: '●',
//        type: '●'
//    },
//    'S': {
//        str: 'S',
//        type: 'NonTerminal'
//    },
//    'A': {
//        str: 'A',
//        type: 'NonTerminal'
//    },
//    'B': {
//        str: 'B',
//        type: 'NonTerminal'
//    },
//    'a': {
//        str: 'a',
//        type: 'Terminal'
//    },
//    'b': {
//        str: 'b',
//        type: 'Terminal'
//    },
//    '+': {
//        str: '+',
//        type: 'Terminal'
//    },
//    '\n': {
//        str: '\n',
//        type: 'Terminal'
//    }
//};
//var r0 = {'from': S['S'], 'to': [S['A']]};
//var r1 = {'from': S['A'], 'to': [S['A'], S['+'], S['B']]};
//var r2 = {'from': S['A'], 'to': [S['a']]};
//var r3 = {'from': S['B'], 'to': [S['b']]};
//var GRAMMAR = [r0, r1, r2, r3];
//var AUGMENT = [[r0['from']].concat([S['●']]).concat(r0['to'])];
//
//var FIRST = {'S': [], 'A': [], 'B': [], 'a': [], 'b': [], '+': [], '': []};
//var FOLLOW = {
//    'S': [],
//    'A': [],
//    'B': []
//};

var S = {
    '●': {
        str: '●',
        type: '●'
    },
    'E': {
        str: 'E',
        type: 'NonTerminal'
    },
    'T': {
        str: 'T',
        type: 'NonTerminal'
    },
    'F': {
        str: 'F',
        type: 'NonTerminal'
    },
    '(': {
        str: '(',
        type: 'Terminal'
    },
    ')': {
        str: ')',
        type: 'Terminal'
    },
    '+': {
        str: '+',
        type: 'Terminal'
    },
    '*': {
        str: '*',
        type: 'Terminal'
    },
    'id': {
        str: 'id',
        type: 'Terminal'
    },
    '\n': {
        str: '\n',
        type: 'Terminal'
    }
};
var r1 = {'from': S['E'], 'to': [S['E'],  S['+'], S['T']]};
var r2 = {'from': S['E'], 'to': [S['T']]};
var r3 = {'from': S['T'], 'to': [S['T'], S['*'], S['F']]};
var r4 = {'from': S['T'], 'to': [S['F']]};
var r5 = {'from': S['F'], 'to': [S['('], S['E'], S[')']]};
var r6 = {'from': S['F'], 'to': [S['id']]};
var GRAMMAR = [r1, r2, r3, r4, r5, r6];
//var AUGMENT = [[r1['from']].concat([S['●']]).concat(r1['to'])];
var AUGMENT = [
    [S['E'], S['●'], S['E'], S['+'], S['T']]
    //[S['E'], S['●'], S['T']]
];

var FIRST = {'E': [], 'T': [], 'F': [], '(': [], ')': [], '+': [], '*': [], 'id': []};
var FOLLOW = {
    'E': [],
    'T': [],
    'F': []
};

var STATE = [];
var ACTION = [];
var GOTO = [];
// ACTION[0] = {'a': ['s', 1], '+': ['s', 2]}...
// GOTO[0]['A'] = 1

var buildClosure = (function () {
    function closure(items) {
        var J = clone(items);
        // J: [
        //     [{str: 'E', type: 'NonTerminal'}, {str: '●', type: '●'}...]
        // ]
        //console.log(items);

        while (true) {
            var before = J.length;

            for (var i = 0; i < J.length; i++) {
                derive(J[i]);
            }
            var after = J.length;
            if (before == after) {
                break;
            }
        }

        return J;

        // find all productions derived from input production
        function derive(item) {
            for (var i = 0; i < item.length; i++) {
                // symbol = E, A, + ...
                var symbol = item[i];
                if (symbol.type === '●') {
                    if (i+1 in item) {
                        //console.log(item[i+1].str);
                        findStartWith(item[i+1]);
                    }
                }
            }
        }

        // find all productions in grammar begins with input symbol
        function findStartWith(symbol) {
            for (var i = 0; i < GRAMMAR.length; i++) {
                if (GRAMMAR[i]['from'].str === symbol.str) {
                    testIn(GRAMMAR[i]);
                }
            }
        }

        // test if production already in J, and add to J if not
        function testIn(production) {
            var diff = [];

            // loop over J
            for (var i = 0; i < J.length; i++) {
                var tmpItem = [];
                // start from item[1], skip first symbol
                for (var j = 1; j < J[i].length; j++) {
                    var symbol = J[i][j];
                    if (symbol.type !== '●') {
                        tmpItem.push(symbol);
                    }
                } // tmpItem is one item in J
                if (tmpItem.length == production['to'].length) {
                    for (var k = 0; k < tmpItem.length; k++) {
                        // bug fixed, if dot is not at first place, items can't be same
                        if (J[i][1].type !== '●') {
                            diff.push(false); break;
                        }
                        // bug fixed, not comparing type, but str
                        if (tmpItem[k].str === production['to'][k].str) {
                            continue;
                        }
                        diff.push(false); break; // bug fixed, adding break
                    }
                } else {
                    diff.push(false);
                }
            }
            // if production is different from all items in J
            if (diff.length == J.length) {
                add(production);
            }

            // add production into J
            function add(production) {
                var tmpProduction = [production['from'], S['●']];
                for (var i = 0; i < production['to'].length; i++) {
                    tmpProduction.push(production['to'][i]);
                }
                J.push(tmpProduction);
            }
        }

    }
    return closure;
})();

function buildFirstTable() {
    while (true) {
        var changed = false;
        for (var s in S) {
            // avoid adding end symbol into FIRST table
            if (s !== '\n' && buildFirst(S[s])) {
                changed = true;
            }
        }
        //console.log("\n");
        if (changed == false) break;
    }

    // input an symbol S['X']
    // modify its FIRST set according to current FIRST table
    function buildFirst(symbol) {
        var changed = false;

        // FIRST of terminal is itself
        if (isTerminal(symbol)) {
            //console.log("change symbol is Terminal");
            if (!hasValue(FIRST[symbol.str], symbol)) {
                changed = true;
                FIRST[symbol.str] = [symbol];
            }
        }
        // to Non-Terminal, apply rules
        else {
            for (var i in GRAMMAR) {
                if (GRAMMAR[i]['from'] == symbol) {
                    // X → A B C...
                    if (GRAMMAR[i]['to'] !== '') {
                        var item = GRAMMAR[i];

                        // for all symbols in A → B C D E
                        for (var j = 0; j < item['to'].length; j++) {

                            var s = item['to'][j];
                            // S[''] stands for epsilon
                            if (!hasValue(FIRST[s.str], S[''])) {
                                break;
                            }
                        }
                        // each of item[0] to item[j] has ɛ in FIRST
                        // their FIRST symbol should be added
                        if (j == 0) {
                            addToFirst(item['to'][0].str, symbol.str);
                        }
                        else {
                            for (var k = 0; k < j; k++) {
                                addToFirst(item['to'][k].str, symbol.str);
                            }
                        }

                    } else{
                        // X → ɛ
                        // add in epsilon
                        // console.log("change X to epsilon");
                        if (!hasValue(FIRST[symbol.str])) {
                            changed = true;
                            FIRST[symbol.str].push(S['']);
                        }
                    }
                }
            }
        }
        return changed;

        // dest and src are in 'X' format (not S['X'])
        function addToFirst(src, dest) {
            for (var i = 0; i < FIRST[src].length; i++) {
                if (!hasValue(FIRST[dest], FIRST[src][i])) {
                    changed = true;
                    //console.log("change: addIntoFIRST");
                    FIRST[dest].push(FIRST[src][i]);
                }
            }
        }

        function isTerminal(symbol) {
            return symbol.type === 'Terminal';
        }
    }
}

function buildFollowTable() {
    while (true) {
        var changed = false;
        for (var s in S) {
            // avoid adding Terminal into FOLLOW table
            if (S[s].type === 'NonTerminal' && buildFollow(S[s])) {
                changed = true;
            }
        }
        if (changed === false) break;
    }
    // input a symbol like S['X']
    function buildFollow() {
        var changed = false;
        // for all NonTerminal, add $ to its FOLLOW
        if (!hasValue(FOLLOW[GRAMMAR[0]['from'].str], S['\n'])) {
            changed = true;
            FOLLOW[GRAMMAR[0]['from'].str].push(S['\n']);
        }

        for (var i in GRAMMAR) {
            var rule = GRAMMAR[i]['to'];
            var j = rule.length - 1;

            // if A → α...B
            // add FOLLOW(A) to FOLLOW(B)
            if (rule[j].type === 'NonTerminal') {
                addFollowToFollow(GRAMMAR[i]['from'].str, rule[rule.length - 1].str);
            }

            // if A → B C D E F, then FOLLOW(E)←FIRST(F), FOLLOW(D)←FIRST(E)...
            for (; j > 0; j--) {
                if (rule[j-1].type === 'NonTerminal') {
                    addFirstToFollow(rule[j].str, rule[j-1].str);
                }
            }
            //addFirstToFollow(rule[0].str, GRAMMAR[i]['from'].str);
        }

        // if A → B C D E F G and D E F G have epsilon in their FIRST
        // add FOLLOW(A) to FOLLOW(C D E F G)
        for (var k in GRAMMAR) {
            rule = GRAMMAR[k]['to'];
            for (j = rule.length - 1; j > 0; j--) {
                if (!hasValue(FIRST[rule[j].str], S[''])) break;
            }
            //console.log("Test: " + GRAMMAR[k]['from'].str + " to " + GRAMMAR[k]['to'][j].str);
            // BUG HERE! For {E → T E_} no adding E to T performed!
            for (; j < rule.length; j++) {
                if (rule[j].type === 'NonTerminal') {
                    //console.log(GRAMMAR[k]['from'].str + ", " + rule[j].str + " added\n");
                    addFollowToFollow(GRAMMAR[k]['from'].str, rule[j].str);
                }
            }
        }

        return changed;

        // src and dest are in 'X' format, not S['X']
        function addFirstToFollow(src, dest) {
            for (var i = 0; i < FIRST[src].length; i++) {
                if (!hasValue(FOLLOW[dest], FIRST[src][i]) && FIRST[src][i] !== S['']) {
                    changed = true;
                    //console.log("change: addFirstToFollow");
                    FOLLOW[dest].push(FIRST[src][i]);
                }
            }
        }

        // src and dest are in 'X' format, not S['X']
        function addFollowToFollow(src, dest) {
            for (var i = 0; i < FOLLOW[src].length; i++) {
                if (!hasValue(FOLLOW[dest], FOLLOW[src][i]) && FOLLOW[src][i] !== S['']) {
                    changed = true;
                    //console.log("change: addFollowToFollow");
                    FOLLOW[dest].push(FOLLOW[src][i]);
                }
            }
        }
    }
}

function buildStateTable() {
    STATE[0] = buildClosure(AUGMENT);

    while (true) {
        // removing while loop does not affect STATE result
        var changed = false;
        for (var i = 0; i < STATE.length; i++) {
            var state = STATE[i];
            var shiftSymbols = shiftOf(state);

            if (GOTO[i] === undefined) {
                GOTO[i] = {};
            }
            for (var j = 0; j < shiftSymbols.length; j++) {
                var symbol = shiftSymbols[j];

                if (GOTO[i][symbol.str] === undefined) {
                    GOTO[i][symbol.str] = STATE.length;
                    if (addState(state, symbol)) {
                        changed = true;
                    }
                }
            }
        }
        if (changed == false) {
            break;
        }
    }
    // for every item in state, find possible transition symbols
    function shiftOf(state) {
        var shiftTo = [];
        for (var i = 0; i < state.length; i++) {
            var item = state[i];
            for (var j = 0; j < item.length; j++) {
                if (item[j].type === '●') {
                    // do not add symbol if production ended
                    if (j+1 in item) {
                        shiftTo.push(item[j+1]);
                    }
                }
            }
        }
        shiftTo = uniqueBy(shiftTo, JSON.stringify);
        // according to shiftTo list, add new state into STATE
        return shiftTo;
    }

    function addState(state, symbol) {
        var newState = [];
        // swap dot to build new state
        for (var i = 0; i < state.length; i++) {
            var item = state[i];
            for (var j = 0; j < item.length; j++) {
                if (item[j].type === '●') {
                    // only add item that matches symbol
                    if (j+1 in item && item[j+1].str === symbol.str) {
                        var newItem = clone(item);

                        // swap Dot with its following symbol
                        var tmp = newItem[j];
                        newItem[j] = newItem[j+1];
                        newItem[j+1] = tmp;
                        newState.push(newItem);
                    }
                }
            }
        }
        newState = buildClosure(newState);
        var before = STATE.length;
        STATE.push(newState);
        STATE = uniqueBy(STATE, JSON.stringify);
        return !(STATE.length == before);
    }
}

function buildActionTable() {
        var state = STATE[i];
        ACTION[i] = {};
        for (var j = 0; j < state.length; j++) {
            var item = state[j];
            shift(item, i);
        }
    }

    function shift(item, stateIndex) {
        for (var i = 0; i < item.length; i++) {
            if (item[i].str === '●') {
                // if Dot at end of production, apply reduction
                if (i == item.length - 1) {

                    var firstSymbol = item[0].str;
                    for (var s in FOLLOW[firstSymbol]) {
                        // Add reduction rules
                        ACTION[stateIndex][FOLLOW[firstSymbol][s].str] = "rNonTerminal";
                    }

                } else {
                    // swap position of dot, then search for next state
                    var tmpItem = clone(item);
                    var tmp = tmpItem[i];
                    tmpItem[i] = tmpItem[i+1];
                    tmpItem[i+1] = tmp;
                    var searchIndex = searchShift(tmpItem, stateIndex);
                    if (searchIndex !== -1) {
                        ACTION[stateIndex][item[i-1].str] = 's' + searchIndex;
                    }
                }
            }
        }
    }

    function searchShift(item) {
        for (var i = 0; i < STATE.length; i++) {
            if (STATE[i][0].length == item.length) {
                // compare item with STATE[i]
                var stateItem = STATE[i][0];
                for (var j = 0; j < item.length; j++) {
                    if (item[j].str !== stateItem[j].str) {
                        break;
                    }
                }
                // if all symbols are equal
                if (j == item.length) {
                    return i;
                }
            }
        }
        return -1;
    }
}

buildFirstTable();

buildFollowTable();

buildStateTable();

buildActionTable();

//logState(STATE[4]);
//console.log(ACTION);
//console.log(GOTO);
var newState = buildClosure(STATE[4]);
logState(STATE[4]);
//for (var s in STATE) {
//    console.log("s: " + s + " " + showState(STATE[s]));
//}
function logState(state) {
    for (var i in state) {
        var tmp = "";
        for (var s in state[i]) {
            tmp +=  " " + state[i][s].str;
        }
        console.log(tmp);
    }
}