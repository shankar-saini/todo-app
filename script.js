// To-Do List: add, complete, delete, filter. Saved in localStorage.

var form = document.getElementById("add-form");
var input = document.getElementById("task-input");
var errorEl = document.getElementById("error");
var listEl = document.getElementById("list");
var emptyEl = document.getElementById("empty");
var countEl = document.getElementById("count");
var clearBtn = document.getElementById("clear-done");
var tabs = document.querySelectorAll(".tab");
var todayEl = document.getElementById("today");

var tasks = [];          // each task: { id, text, done }
var filter = "all";
var STORAGE_KEY = "shankar-todo-tasks";

// ---------- save / load ----------
function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); } catch (e) { /* storage blocked: app still works */ }
}

function load() {
    try {
        var saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
        if (Array.isArray(saved)) {
            tasks = saved.filter(function (t) {
                return t && typeof t.text === "string" && typeof t.id === "number";
            });
        }
    } catch (e) { tasks = []; }
}

// ---------- show the list ----------
function render() {
    listEl.innerHTML = "";

    var visible = tasks.filter(function (t) {
        if (filter === "active") { return !t.done; }
        if (filter === "done") { return t.done; }
        return true;
    });

    visible.forEach(function (task) {
        var li = document.createElement("li");
        li.className = "item" + (task.done ? " done" : "");

        var box = document.createElement("input");
        box.type = "checkbox";
        box.checked = task.done;
        box.setAttribute("aria-label", "Mark done: " + task.text);
        box.addEventListener("change", function () { toggle(task.id); });

        var text = document.createElement("span");
        text.className = "text";
        text.textContent = task.text;          // textContent keeps user text safe
        text.addEventListener("click", function () { toggle(task.id); });

        var del = document.createElement("button");
        del.type = "button";
        del.className = "del";
        del.innerHTML = "&times;";
        del.setAttribute("aria-label", "Delete task: " + task.text);
        del.addEventListener("click", function () { remove(task.id); });

        li.appendChild(box);
        li.appendChild(text);
        li.appendChild(del);
        listEl.appendChild(li);
    });

    // empty message
    if (visible.length === 0) {
        emptyEl.style.display = "block";
        if (tasks.length === 0) { emptyEl.textContent = "No tasks yet. Add your first one above."; }
        else if (filter === "active") { emptyEl.textContent = "Nothing left to do. Nice work!"; }
        else { emptyEl.textContent = "No completed tasks yet."; }
    } else {
        emptyEl.style.display = "none";
    }

    // counter
    var left = tasks.filter(function (t) { return !t.done; }).length;
    countEl.textContent = left + (left === 1 ? " task left" : " tasks left");
    clearBtn.style.visibility = tasks.some(function (t) { return t.done; }) ? "visible" : "hidden";
}

// ---------- actions ----------
function addTask(text) {
    tasks.unshift({ id: Date.now() + Math.floor(Math.random() * 1000), text: text, done: false });
    save();
    render();
}

function toggle(id) {
    tasks.forEach(function (t) { if (t.id === id) { t.done = !t.done; } });
    save();
    render();
}

function remove(id) {
    tasks = tasks.filter(function (t) { return t.id !== id; });
    save();
    render();
}

form.addEventListener("submit", function (event) {
    event.preventDefault();
    var text = input.value.trim();

    if (text === "") {
        errorEl.textContent = "Please type a task first.";
        input.focus();
        return;
    }

    errorEl.textContent = "";
    addTask(text);
    input.value = "";
    input.focus();
});

input.addEventListener("input", function () { errorEl.textContent = ""; });

clearBtn.addEventListener("click", function () {
    tasks = tasks.filter(function (t) { return !t.done; });
    save();
    render();
});

tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
        filter = tab.dataset.filter;
        tabs.forEach(function (other) {
            var active = other === tab;
            other.classList.toggle("active", active);
            other.setAttribute("aria-pressed", active ? "true" : "false");
        });
        render();
    });
});

// today's date under the heading
todayEl.textContent = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

load();
render();
