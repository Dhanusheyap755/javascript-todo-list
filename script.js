// ==========================================
// TASKFLOW - TO-DO LIST
// ==========================================

const STORAGE_KEY = "taskflow_tasks";


// ==========================================
// APPLICATION STATE
// ==========================================

let tasks = loadTasks();

let currentFilter = "all";


// ==========================================
// DOM ELEMENTS
// ==========================================

const taskForm = document.getElementById("taskForm");

const taskInput = document.getElementById("taskInput");

const taskList = document.getElementById("taskList");

const emptyState = document.getElementById("emptyState");

const taskCount = document.getElementById("taskCount");

const progressText = document.getElementById("progressText");

const clearCompletedBtn =
    document.getElementById("clearCompleted");

const filterButtons =
    document.querySelectorAll(".filter");


// ==========================================
// LOCAL STORAGE
// ==========================================

function loadTasks() {

    try {

        const savedTasks =
            window.localStorage.getItem(STORAGE_KEY);

        return savedTasks
            ? JSON.parse(savedTasks)
            : [];

    } catch (error) {

        console.error(
            "Error loading tasks:",
            error
        );

        return [];
    }
}


function saveTasks() {

    window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(tasks)
    );
}


// ==========================================
// CREATE TASK OBJECT
// ==========================================

function createTask(text) {

    return {

        id: Date.now().toString(),

        text: text.trim(),

        completed: false,

        createdAt: new Date().toISOString()
    };
}


// ==========================================
// CREATE - ADD NEW TASK
// ==========================================

taskForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();

        const text =
            taskInput.value.trim();

        if (!text) {

            return;
        }


        // Create new task

        const newTask =
            createTask(text);


        // Add task to state

        tasks.unshift(newTask);


        // Save to localStorage

        saveTasks();


        // Clear input

        taskInput.value = "";


        // Focus input

        taskInput.focus();


        // Update UI

        render();
    }
);


// ==========================================
// READ - FILTER TASKS
// ==========================================

function getFilteredTasks() {

    if (currentFilter === "active") {

        return tasks.filter(
            task => !task.completed
        );
    }


    if (currentFilter === "completed") {

        return tasks.filter(
            task => task.completed
        );
    }


    return tasks;
}


// ==========================================
// READ - RENDER TASKS
// ==========================================

function render() {

    const visibleTasks =
        getFilteredTasks();


    // Clear current DOM

    taskList.innerHTML = "";


    // Create task elements

    visibleTasks.forEach(
        task => {

            const taskElement =
                createTaskElement(task);

            taskList.appendChild(
                taskElement
            );
        }
    );


    // Statistics

    const completed =
        tasks.filter(
            task => task.completed
        ).length;


    const active =
        tasks.length - completed;


    taskCount.textContent =
        `${tasks.length} ${
            tasks.length === 1
                ? "task"
                : "tasks"
        }`;


    progressText.textContent =
        `${completed} completed • ${active} active`;


    // Empty state

    emptyState.hidden =
        visibleTasks.length !== 0;


    if (tasks.length === 0) {

        emptyState.querySelector("h2")
            .textContent =
            "No tasks yet";

        emptyState.querySelector("p")
            .textContent =
            "Add your first task above and start getting things done.";

    }

    else if (visibleTasks.length === 0) {

        emptyState.querySelector("h2")
            .textContent =
            "Nothing here";

        emptyState.querySelector("p")
            .textContent =
            "There are no tasks matching this filter.";
    }
}


// ==========================================
// CREATE DYNAMIC DOM ELEMENT
// ==========================================

function createTaskElement(task) {

    const li =
        document.createElement("li");

    li.className = "task-item";

    li.dataset.id = task.id;


    // CHECK BUTTON

    const check =
        document.createElement("button");

    check.className =
        `check ${
            task.completed
                ? "completed"
                : ""
        }`;

    check.type = "button";

    check.dataset.action = "toggle";

    check.setAttribute(
        "aria-label",
        task.completed
            ? "Mark task active"
            : "Mark task completed"
    );


    // TASK TEXT

    const text =
        document.createElement("span");

    text.className =
        `task-text ${
            task.completed
                ? "completed"
                : ""
        }`;

    text.textContent =
        task.text;


    // ACTION CONTAINER

    const actions =
        document.createElement("div");

    actions.className =
        "task-actions";


    // EDIT BUTTON

    const editButton =
        document.createElement("button");

    editButton.className =
        "icon-button";

    editButton.type = "button";

    editButton.dataset.action =
        "edit";

    editButton.textContent =
        "Edit";

    editButton.setAttribute(
        "aria-label",
        `Edit ${task.text}`
    );


    // DELETE BUTTON

    const deleteButton =
        document.createElement("button");

    deleteButton.className =
        "icon-button delete";

    deleteButton.type = "button";

    deleteButton.dataset.action =
        "delete";

    deleteButton.textContent =
        "×";

    deleteButton.setAttribute(
        "aria-label",
        `Delete ${task.text}`
    );


    // Add buttons

    actions.append(
        editButton,
        deleteButton
    );


    // Add everything to task

    li.append(
        check,
        text,
        actions
    );


    return li;
}


// ==========================================
// EVENT DELEGATION
// ==========================================
//
// Instead of adding separate click
// listeners to every task button,
// one listener is attached to the
// parent #taskList.
//
// This is called EVENT DELEGATION.
// ==========================================

taskList.addEventListener(
    "click",
    function (event) {

        const actionButton =
            event.target.closest(
                "[data-action]"
            );


        if (!actionButton) {

            return;
        }


        const taskItem =
            actionButton.closest(
                ".task-item"
            );


        if (!taskItem) {

            return;
        }


        const id =
            taskItem.dataset.id;


        const action =
            actionButton.dataset.action;


        // Determine requested action

        if (action === "toggle") {

            toggleTask(id);
        }


        if (action === "edit") {

            editTask(id);
        }


        if (action === "delete") {

            deleteTask(id);
        }
    }
);


// ==========================================
// UPDATE - COMPLETE / UNCOMPLETE
// ==========================================

function toggleTask(id) {

    tasks =
        tasks.map(
            task => {

                if (task.id === id) {

                    return {
                        ...task,

                        completed:
                            !task.completed
                    };
                }


                return task;
            }
        );


    saveTasks();

    render();
}


// ==========================================
// UPDATE - EDIT TASK
// ==========================================

function editTask(id) {

    const task =
        tasks.find(
            item => item.id === id
        );


    if (!task) {

        return;
    }


    const updatedText =
        prompt(
            "Edit your task:",
            task.text
        );


    // User pressed Cancel

    if (updatedText === null) {

        return;
    }


    const text =
        updatedText.trim();


    if (!text) {

        alert(
            "Task cannot be empty."
        );

        return;
    }


    // Update state

    tasks =
        tasks.map(
            item => {

                if (item.id === id) {

                    return {
                        ...item,

                        text: text
                    };
                }


                return item;
            }
        );


    saveTasks();

    render();
}


// ==========================================
// DELETE - SINGLE TASK
// ==========================================

function deleteTask(id) {

    tasks =
        tasks.filter(
            task => task.id !== id
        );


    saveTasks();

    render();
}


// ==========================================
// FILTER - ALL / ACTIVE / COMPLETED
// ==========================================

filterButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            function () {

                currentFilter =
                    button.dataset.filter;


                // Update active button

                filterButtons.forEach(
                    btn => {

                        btn.classList.toggle(
                            "active",
                            btn === button
                        );
                    }
                );


                render();
            }
        );
    }
);


// ==========================================
// DELETE ALL COMPLETED
// ==========================================

clearCompletedBtn.addEventListener(
    "click",
    function () {

        tasks =
            tasks.filter(
                task => !task.completed
            );


        saveTasks();

        render();
    }
);


// ==========================================
// INITIAL RENDER
// ==========================================

render();