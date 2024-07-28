import "./style.css";

const el = document.createElement("h1");
el.innerText = "This is a h1 element";
el.classList.add("test");
document.body.appendChild(el);