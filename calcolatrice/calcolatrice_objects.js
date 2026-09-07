import { evaluate } from "./eval.js";

let clicks = 0;
let mem = 0;

function addToString(v) {

    if (clicks == 0 && v != "+" && v != "×" && v != ":") {
        document.getElementById("span").textContent = v;
    }
    else{
        if (v == "×")
            v = '*';
        else if (v == ":")
            v = '/';
        document.getElementById("span").textContent += v;}
    clicks++;
}

function enter() {
    const span = document.getElementById("span");
    let s = span.textContent;
    span.textContent = evaluate(s);
    clicks = 0;
}

function memory() {
    let s = document.getElementBsyId("span").textContent;
    mem = document.getElementById("span").textContent = evaluate(s);
}

function reset() {
    clicks = 0;
    document.getElementById("span").textContent = "0";
}

function back() {
    let s = document.getElementById("span").textContent;
    if (s.length - 1 == 0)
        reset();
    else
        document.getElementById("span").textContent = s.substring(0, s.length - 1);
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

let sButtons = document.getElementsByClassName("scientific");
let nsButtons = document.getElementsByClassName("nonScientific");
for (let button of sButtons)
    button.addEventListener("click", () => addToString(button.value));
for (let button of nsButtons)
    button.addEventListener("click", () => addToString(button.value));

document.getElementById("CE").addEventListener("click", reset);
document.getElementById("enter").addEventListener("click", enter);
document.getElementById("back").addEventListener("click", back);
document.getElementById("change_calc").addEventListener("click", changeCalculator);