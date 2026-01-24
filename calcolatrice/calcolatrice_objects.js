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


//classi per i token

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

        this.value += char;
    }
}

class OperatorToken extends Token { ; }

class BracketToken extends Token { ; }

class EndToken extends Token { ; }


//classi per i nodi

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
        throw new Error();
    }
}

class AddTreeNode extends TreeNodeOperator {
    constructor(sx, dx) {
        super('+', sx, dx);
    }

    calculate(v1, v2) {
        return v1 + v2;
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
        return Math.sqrt(e2);
    }
}

class ValTreeNode extends TreeNode {
    constructor(val) {
        super(val, undefined, undefined);
    }
}


function isNumeric(char) {
    return "1234567890.".includes(char);
}

function isOperator(char) {
    return "+-*/√".includes(char);
}

function isBracket(char) {
    return "()".includes(char);
}

/* 
Exp ::= Term + Exp | Term - Exp | Term
Term ::= Factor * Term | Factor / Term | Factor
Factor ::= n | (Exp)
*/

function tokenize(s) {

    let tokens = [];

    for (let i = 0; i < s.length; i++) {
        if (isNumeric(s[i])) {
            if (isNumeric(s[i - 1])) {
                tokens[tokens.length - 1].aggregate(s[i]);
            }
            else {
                tokens.push(new NumericToken(s[i]));
            }
        }
        else if (isOperator(s[i])) {
            tokens.push(new OperatorToken(s[i]));
        }
        else if (isBracket(s[i])) {
            tokens.push(new BracketToken(s[i]));
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
        return factor();
    }

    let factor = () => {
        let head = tokens[0];

        if (head instanceof NumericToken) {
            tokens.shift();
            return new ValTreeNode(Number(head.value));
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
                return;
            }
        }
        throw new ParserError("Number or left bracket error");
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