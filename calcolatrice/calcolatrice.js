// This code works only with a basic calculator

let clicks = 0;
let mem = 0;

function addToString(v) {

    if (clicks == 0 && v != "+" && v != "*" && v != "/") {
        document.getElementById("myspan").textContent=v;
    }
    else
        document.getElementById("myspan").textContent+=v;
    clicks++;
}

function enter() {
    let s = document.getElementById("myspan").textContent;
    document.getElementById("myspan").textContent=evaluate(s);
    clicks = 0;
}

function memory() {
    let s = document.getElementById("myspan").textContent;
    mem = document.getElementById("myspan").textContent=evaluate(s);
}

function reset() {
    clicks = 0;
    document.getElementById("myspan").textContent=0;
}

/* 
Exp ::= Term + Exp | Term - Exp | Term
Term ::= Factor * Term | Factor / Term | Factor
Factor ::= n | (Exp)
*/

function tokenize(s) {

    let tokens = [];

    for(let i=0; i<s.length; i++) {
        switch (s[i]) {
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
            case '0':
            case '.':
                if(i > 0 && /\d|\./.test(s[i-1]))
                    tokens[tokens.length - 1] += s[i];
                else
                    tokens.push(s[i]);
                let points = 0
                let t = tokens[tokens.length - 1];
                for (let j=0; j<t.length; j++) {
                    if (t[j] == '.') {
                        points++;
                    }
                }
                if (points > 1) {
                    alert("Number error");
                    return;
                }
            break;
            case '+':
            case '-':
            case '*':
            case '/':
            case '(':
            case ')':
            case '√':
                tokens.push(s[i]);
            break;
            default:
                alert("Invalid symbol '" + s[i] + "' in the expression");
                return;
            break;
        }
    }

    return tokens;
}


/* 
Exp ::= Term + Exp | Term - Exp | Term
Term ::= Factor * Term | Factor / Term | Factor
Factor ::= n | (Exp)
*/

function parse(s) {

    let tokens = tokenize(s);

    if (!tokens) 
        return;

    exp = () => {
        let t1 = term();
        let head = tokens[0];

        if(head == '+') {
            tokens.shift();
            return {val: '+', sx: t1, dx: exp()};
        }
        if(head == '-') {
            tokens.shift();
            return {val: '-', sx: t1, dx: exp()};
        }
        return t1;
    }

    term = () => {
        let u1 = unary();
        let head = tokens[0];

        if(head == '*') {
            tokens.shift();
            return {val: '*', sx: u1, dx: term()};
        }
        if(head == '/') {
            tokens.shift();
            return {val: '/', sx: u1, dx: term()};
        }
        return u1;
    }

    unary = () => {
        let head = tokens[0];

        if (head == '-') {
            tokens.shift();
            return {val: '-', dx: factor()}
        }
        if (head == '√') {
            tokens.shift();
            return {val: '√', dx: factor()}
        }
        return factor();
    }

    factor = () => {
        let head = tokens[0];

        if(/([0-9]+[.])?[0-9]+/.test(head)) {
            tokens.shift();
            return {val: Number(head)};
        }
        if(head == '(') {
            tokens.shift();
            let e = exp();
            head = tokens[0];
            if (head == ')') {
                tokens.shift();
                return e;
            }
            else {
                alert("Right bracket error");
                return;
            }
        }
        alert("Number or left bracket error");
        return;
    }

    return exp();
}

function evaluate(s) {

    function eval_ast(ast) {
        if (!ast) {
            return 0;
        }

        let e1 = eval_ast(ast.sx);
        let e2 = eval_ast(ast.dx);

        switch (ast.val) {
            case '+':
                return e1 + e2;
            break;
            case '-':
                if (!e1)
                    return -e2;
                return e1 - e2;
            break;
            case '*':
                return e1 * e2;
            break;
            case '/':
                return e1 / e2;
            break;
            case '√':
                return Math.sqrt(e2);
            break;
            default:
                return Number(ast.val);
            break;
        }
    }

    let ast = parse(s);
    if (!ast) {
        reset();
        return 0;
    }

    return eval_ast(ast);
}