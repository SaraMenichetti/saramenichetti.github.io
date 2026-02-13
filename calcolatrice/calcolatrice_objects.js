class TokenError extends Error { ; }
class ParserError extends Error { ; }


let clicks = 0;
let mem = 0;

function addToString(v) {

    if (clicks == 0 && v != "+" && v != "*" && v != "/") {
        document.getElementById("myspan").textContent = v;
    }
    else
        document.getElementById("myspan").textContent += v;
    clicks++;
}

function enter() {
    const span = document.getElementById("myspan");
    let s = span.textContent;
    span.textContent = evaluate(s);
    clicks = 0;
}

function memory() {
    let s = document.getElementById("myspan").textContent;
    mem = document.getElementById("myspan").textContent = evaluate(s);
}

function reset() {
    clicks = 0;
    document.getElementById("myspan").textContent = "0";
}

function back() {
    let s = document.getElementById("myspan").textContent;
    if (s.length - 1 == 0)
        reset();
    else
        document.getElementById("myspan").textContent = s.substring(0, s.length - 1);
}

function changeCalculator() {
    let btnId = document.getElementById("change_calc");
    let scientificBtnsId = document.getElementsByClassName("scientific");
    if (btnId.innerHTML.trim() === "Normal") {
        btnId.innerHTML = "Scientific";
        btnId.value = "Scientific";
        for (let item of scientificBtnsId) {
            item.style.setProperty("display", "none", "important");
        }
    }
    else {
        btnId.innerHTML = "Normal";
        btnId.value = "Normal";
        for (let item of scientificBtnsId) {
            item.style.setProperty("display", "inline-block", "important");
        }
    }
}


// token classes

class Token {
    value;

    constructor(value) {
        this.value = value;
    }
}

class NumericToken extends Token {
    constructor(value) {
        super(value);
    }

    aggregate(char) {
        if (char == '.') {
            if (this.value.includes(char)) {
                throw new TokenError("Too many dots");
            }
        }
        else if (char == 'π' || this.value.includes('π'))
            throw new TokenError ("Syntax error with π");
        else if (char == 'e' || this.value.includes('e'))
            throw new TokenError ("Syntax error with e");

        this.value += char;
    }
}

class OperatorToken extends Token { ; }

class FunctionToken extends OperatorToken {
    constructor(value) {
        super(value);
    }

    aggregate(char) {
        this.value += char;
        for (let i=0; i<this.value.length; i++) {
            if ("log"[i] != this.value[i] && 
                "sin"[i] != this.value[i] && 
                "cos"[i] != this.value[i] && 
                "tan"[i] != this.value[i] &&
                "rand"[i] != this.value[i] && 
                "floor"[i] != this.value[i] && 
                "ceil"[i] != this.value[i])
                throw new TokenError("Syntax error with functions");
        }
    }
}

class BracketToken extends Token { ; }

class AbsoluteToken extends Token { ; }

class EndToken extends Token { ; }


// node clases

class TreeNode {
    #val;
    #dx;
    #sx;

    constructor(val, sx, dx) {
        this.#val = val;
        this.#sx = sx;
        this.#dx = dx;
    }

    get val() {
        return this.#val;
    }

    get sx() {
        return this.#sx;
    }

    get dx() {
        return this.#dx;
    }
}

class TreeNodeOperator extends TreeNode {
    constructor(val, sx, dx) {
        super(val, sx, dx);
    }

    calculate(e1, e2) {
        throw new Error ("Huh?");
    }
}

class AddTreeNode extends TreeNodeOperator {
    constructor(sx, dx) {
        super('+', sx, dx);
    }

    calculate(e1, e2) {
        return e1 + e2;
    }
}

class SubtractTreeNode extends TreeNodeOperator {
    constructor(sx, dx) {
        super('-', sx, dx);
    }

    calculate(e1, e2) {
        return e1 - e2;
    }
}

class MultiplyTreeNode extends TreeNodeOperator {
    constructor(sx, dx) {
        super('*', sx, dx);
    }

    calculate(e1, e2) {
        return e1 * e2;
    }
}

class DivideTreeNode extends TreeNodeOperator {
    constructor(sx, dx) {
        super('/', sx, dx);
    }

    calculate(e1, e2) {
        if (e2 == 0)
            throw new ParserError("Math error");
        return e1 / e2;
    }
}

class MinusTreeNode extends TreeNodeOperator {
    constructor(dx) {
        super('-', undefined, dx);
    }

    calculate(e1, e2) {
        return -e2;
    }
}

class SqrtTreeNode extends TreeNodeOperator {
    constructor(dx) {
        super('√', undefined, dx);
    }

    calculate(e1, e2) {
        if (e1)
            throw new ParserError("Square root error");
        if (e2 < 0)
            throw new ParserError ("Number error");
        return Math.sqrt(e2);
    }
}

class PowerTreeNode extends TreeNodeOperator {
    constructor(sx, dx) {
        super('^', sx, dx);
    }

    calculate(e1, e2) {
        return Math.pow(e1, e2);
    }
}

class LogTreeNode extends TreeNodeOperator {
    constructor(dx) {
        super("log", undefined, dx);
    }

    calculate(e1, e2) {
        if (e1)
            throw new ParserError("log() error");
        return Math.log(e2);
    }
}

class SinTreeNode extends TreeNodeOperator {
    constructor(dx) {
        super("sin", undefined, dx);
    }

    calculate(e1, e2) {
        if (e1)
            throw new ParserError("sin() error");
        return parseFloat(Math.sin(e2).toFixed(8));
    }
}

class CosTreeNode extends TreeNodeOperator {
    constructor(dx) {
        super("cos", undefined, dx);
    }

    calculate(e1, e2) {
        if (e1)
            throw new ParserError("cos() error");
        return parseFloat(Math.cos(e2).toFixed(8));
    }
}

class TanTreeNode extends TreeNodeOperator {
    constructor(dx) {
        super("tan", undefined, dx);
    }

    calculate(e1, e2) {
        if (e1)
            throw new ParserError("tan() error");
        if (parseFloat(Math.cos(e2).toFixed(3)) == 0)
            throw new ParserError("tan doesn't exist");
        return parseFloat(Math.tan(e2).toFixed(8));
    }
}

class AbsoluteTreeNode extends TreeNodeOperator {
    constructor(dx) {
        super("abs", undefined, dx);
    }

    calculate(e1, e2) {
        if (e1)
            throw new ParserError("Absolute value error")
        return Math.abs(e2);
    }
}

class RandomTreeNode extends TreeNodeOperator {
    constructor(dx) {
        super("rand", undefined, dx);
    }

    calculate(e1, e2) {
        if (e1 || e2)
            throw new ParserError("rand() error");
        return Math.random();
    }
}

class FloorTreeNode extends TreeNodeOperator {
    constructor(dx) {
        super("floor", undefined, dx);
    }

    calculate(e1, e2) {
        if (e1) 
            throw new ParserError("floor() error");
        return Math.floor(e2);
    }
}

class CeilTreeNode extends TreeNodeOperator {
    constructor(dx) {
        super("ceil", undefined, dx);
    }

    calculate(e1, e2) {
        if (e1) 
            throw new ParserError("ceil() error");
        return Math.ceil(e2);
    }
}

class ValTreeNode extends TreeNode {
    constructor(val) {
        super(val, undefined, undefined);
    }
}


// functions

function isNumeric(char) {
    return "1234567890π𝑒.".includes(char);
}

function isOperator(char) {
    return "+-*/√^".includes(char);
}

function isFunction(char) {
    return "logsincstardfore".includes(char);
}

function isBracket(char) {
    return "()".includes(char);
}

function isAbsolute(char) {
    return "|".includes(char);
}

function tokenize(s) {

    let tokens = [];

    for (let i = 0; i < s.length; i++) {
        if (isNumeric(s[i])) {
            if (tokens[tokens.length - 1] instanceof NumericToken) {
                tokens[tokens.length - 1].aggregate(s[i]);
            }
            else {
                tokens.push(new NumericToken(s[i]));
            }
        }
        else if (isOperator(s[i])) {
            tokens.push(new OperatorToken(s[i]));
        }
        else if (isFunction(s[i])) {
            if (tokens[tokens.length - 1] instanceof FunctionToken) {
                tokens[tokens.length - 1].aggregate(s[i]);
            }
            else {
                tokens.push(new FunctionToken(s[i]));
            }
        }
        else if (isBracket(s[i])) {
            tokens.push(new BracketToken(s[i]));
        }
        else if (isAbsolute(s[i])) {
            tokens.push(new AbsoluteToken(s[i]));
        }
        else {
            throw new TokenError("Invalid symbol " + s[i]);
        }
    }
    tokens.push(new EndToken('end'));

    return tokens;
}


/* 
Exp ::= Term + Exp | Term - Exp | Term
Term ::= Factor * Term | Factor / Term | Factor
Factor ::= n | (Exp)
*/

function parse(tokens) {

    if (!tokens)
        return;

    let exp = () => {
        let t1 = term();
        let head = tokens[0];

        if (head.value == '+') {
            tokens.shift();
            return new AddTreeNode(t1, exp());
        }
        if (head.value == '-') {
            tokens.shift();
            return new SubtractTreeNode(t1, exp());
        }
        return t1;
    }

    let term = () => {
        let u1 = unairy();
        let head = tokens[0];

        if (head.value == '*') {
            tokens.shift();
            return new MultiplyTreeNode(u1, term());
        }
        if (head.value == '/') {
            tokens.shift();
            return new DivideTreeNode(u1, term());;
        }
        if (head.value == "^") {
            tokens.shift();
            return new PowerTreeNode(u1, term());
        }
        return u1;
    }

    let unairy = () => {
        let head = tokens[0];

        if (head.value == '-') {
            tokens.shift();
            return new MinusTreeNode(factor());
        }
        if (head.value == '√') {
            tokens.shift();
            return new SqrtTreeNode(factor());
        }
        if (head.value == 'log') {
            tokens.shift();
            return new LogTreeNode(factor());
        }
        if (head.value == 'sin') {
            tokens.shift();
            return new SinTreeNode(factor());
        }
        if (head.value == 'cos') {
            tokens.shift();
            return new CosTreeNode(factor());
        }
        if (head.value == 'tan') {
            tokens.shift();
            return new TanTreeNode(factor());
        }
        if (head.value == 'floor') {
            tokens.shift();
            return new FloorTreeNode(factor());
        }
        if (head.value == 'ceil') {
            tokens.shift();
            return new CeilTreeNode(factor());
        }
        return factor();
    }

    let factor = () => {
        let head = tokens[0];

        if (head instanceof NumericToken) {
            tokens.shift();
            if (head.value == 'π')
                return new ValTreeNode(Math.PI);
            if (head.value == '𝑒')
                return new ValTreeNode(Math.E);
            return new ValTreeNode(Number(head.value));
        }
        if (head.value == 'rand') {
            tokens.shift();
            return new RandomTreeNode(factor());
        }
        if (head.value == '(') {
            tokens.shift();
            let e = exp();
            head = tokens[0];
            if (head.value == ')') {
                tokens.shift();
                return e;
            }
            else {
                throw new ParserError("Right bracket error");
            }
        }
        if (head.value == '|') {
            tokens.shift();
            let e = exp();
            head = tokens[0];
            if (head.value == '|') {
                tokens.shift();
                return new AbsoluteTreeNode(e);
            }
            else {
                throw new ParserError("Right absolute error");
            }
        }
        throw new ParserError("Number, left bracket or left absolute error");
    }

    return exp();
}

function eval_ast(ast) {
    if (!ast) {
        return 0;
    }
    
    if (ast instanceof TreeNodeOperator) {
        let e1 = eval_ast(ast.sx);
        let e2 = eval_ast(ast.dx);
        return ast.calculate(e1, e2);
    }
    return ast.val;
}

function evaluate(s) {
    try {
        let tokens = tokenize(s);
        let ast = parse(tokens);
        return eval_ast(ast);
    } catch (error) {
        return error.message;
    }
}