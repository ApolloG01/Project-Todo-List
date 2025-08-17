// ========================================
//  DOM ELEMENTS
// ========================================
const main = document.getElementById("main");
const addTodo = document.getElementById("addTodo");
const toDoModal = document.getElementById("todo-modal");
const cancelTodo = document.querySelector(".btnC");
const createProjectBtn = document.querySelector("#projects-btn");
const submitProject = document.getElementById("submit-project");
const projectModal = document.getElementById("project-modal");
const projects = document.getElementById("projects");
const modalBackdrop = document.getElementById("modal-backdrop");
const sidebar = document.getElementById("sidebar");
const when = document.querySelectorAll(".when");
const calendar = document.querySelector(".calendar");
const today = document.querySelector(".today");
const thisWeek = document.querySelector(".thisWeek");
const thisMonth = document.querySelector(".thisMonth");
const overdue = document.querySelector(".overdue");
const completed = document.querySelector("#completed-projects");
const all = document.querySelector(".all");
const projectItems = document.querySelectorAll(".project-item");
const projectRow = document.querySelectorAll(".project-row");

// Variable to track if we're editing something
let editingId = null;

// ========================================
// FUNCTIONS TO CREATE TODOS AND PROJECTS
// ========================================

// Create a Todo object
function createTodo(title, description, dueDate, project, priority) {
  const id = title.toLowerCase().slice(0, 4) + Math.floor(Math.random() * 1000);

  return {
    id: id,
    title: title,
    description: description,
    dueDate: dueDate,
    project: project || "",
    priority: priority || "medium",
    completed: false,
  };
}

// Create a Project object
function createProject(title) {
  const id = title.toLowerCase().slice(0, 4) + Math.floor(Math.random() * 1000);

  return {
    id: id,
    title: title,
  };
}

// ========================================
// STEP 3: SAVE AND LOAD FROM LOCALSTORAGE
// ========================================

// Save a todo to localStorage + TodoDate separetly
function saveTodoToStorage(todo) {
  const todoData = { ...todo };
  localStorage.setItem(todo.id, JSON.stringify(todoData));
}

// Save a project to localStorage
function saveProjectToStorage(project) {
  const projectData = { ...project };
  localStorage.setItem(project.id, JSON.stringify(projectData));
}

// Get all todos from localStorage
function getAllTodosFromStorage() {
  const todos = [];

  for (let key in localStorage) {
    try {
      const item = JSON.parse(localStorage.getItem(key));

      // Simplified: only check for dueDate
      if (item.dueDate !== undefined) {
        todos.push(item);
      }
    } catch (e) {
      continue;
    }
  }

  return todos;
}

// Get all projects from localStorage
function getAllProjectsFromStorage() {
  const projects = [];

  for (let key in localStorage) {
    try {
      const item = JSON.parse(localStorage.getItem(key));
      // Simplified: projects don't have dueDate
      if (item && item.title && item.dueDate === undefined) {
        projects.push(item);
      }
    } catch (e) {
      continue;
    }
  }

  return projects;
}

// ========================================
// STEP 4: CREATE HTML FOR TODOS AND PROJECTS
// ========================================

// Make HTML for a single todo
function createTodoHTML(todo) {
  const completedClass = todo.completed ? "completed" : "";
  const checkedAttribute = todo.completed ? "checked" : "";

  return `
  <div class="todo-item ${completedClass}" data-id="${todo.id}">
    <div id="todo-left">
      <input type="checkbox" class="todo-checkbox" ${checkedAttribute} />
      <div class="todo-content">
        <div class="todo-header">
          <span class="todo-title ${completedClass}">${todo.title}</span>
          <span class="todo-priority priority-${todo.priority}">${
    todo.priority
  }</span>
        </div>
        
        <div class="todo-details">
          <div class="detail-row">
            <strong>Description:</strong>
            <div class="todo-description-full ${completedClass}">
              ${todo.description || "No description provided"}
            </div>
          </div>
          
          <div class="detail-row">
            <strong>Due Date:</strong>
            <span class="todo-date">${todo.dueDate}</span>
          </div>
          
          ${
            todo.project
              ? `
          <div class="detail-row">
            <strong>Project:</strong>
            <span class="todo-project">${todo.project}</span>
          </div>
          `
              : ""
          }
          
          <div class="detail-row">
            <strong>Status:</strong>
            <span class="todo-status">${
              todo.completed ? "Completed ✅" : "Pending ⏳"
            }</span>
          </div>
        </div>
      </div>
    </div>
    
    <div id="todo-right">
      <button class="btn-edit" title="Edit">
        <img src="images/edit.png" alt="Edit" />
      </button>
      <button class="btn-delete" title="Delete">
        <img src="images/bin.png" alt="Delete" />
      </button>
    </div>
  </div>
  `;
}

// Make HTML for a single project
function createProjectHTML(project) {
  return `
    <li class="project-item" data-id="${project.id}">
      <div class="project-row">
        <div>${project.title}</div>
        <div>
          <button class="p-btn-edit" title="Edit">
            <img src="images/edit.png" alt="Edit" />
          </button>
          <button class="p-btn-delete" title="Delete">
            <img src="images/bin.png" alt="Delete" />
          </button>
        </div>
      </div>
    </li>
  `;
}

// ========================================
// STEP 5: UPDATE THE PROJECT DROPDOWN
// ========================================

function updateProjectDropdown() {
  const projectSelect = document.getElementById("project");
  if (!projectSelect) return; //   Prevents crashes

  const dynamicProjects = getAllProjectsFromStorage();

  // Default options
  let options = `
    <option value="">No Project</option>
    <option value="Home">Home</option>
    <option value="Work">Work</option>
    <option value="Workout">Workout</option>
  `;

  // Add user-created projects
  dynamicProjects.forEach((project) => {
    options += `<option value="${project.title}">${project.title}</option>`;
  });

  projectSelect.innerHTML = options;
}

// ========================================
// STEP 6: HANDLE FORM SUBMISSIONS
// ========================================

// When user submits a todo
function handleTodoSubmit(e) {
  e.preventDefault();

  // Get values from the form
  const title = document.querySelector("#title").value.trim();
  const description = document.querySelector("#description").value.trim();
  const dueDate = document.querySelector("#date").value;
  const project = document.querySelector("#project").value || "";
  const priority = document.querySelector("#priority").value || "medium";

  let todo;

  if (editingId) {
    // We're editing an existing todo
    todo = createTodo(title, description, dueDate, project, priority);
    todo.id = editingId;

    // Keep the completed status if it existed
    const existingData = localStorage.getItem(editingId);
    if (existingData) {
      const existing = JSON.parse(existingData);
      todo.completed = existing.completed || false;
    }
  } else {
    // We're creating a new todo
    todo = createTodo(title, description, dueDate, project, priority);
  }

  // Save todoObject localStorage
  saveTodoToStorage(todo);

  // Save Todo date to localStorage

  // Clear the form and close modal
  toDoModal.reset();
  closeAllModals();

  // Refresh the page to show changes
  location.reload();
}

// When user submits a project
function handleProjectSubmit(e) {
  e.preventDefault();

  const title = document.querySelector("#project-name").value.trim();

  if (!title) {
    alert("Project name is required!");
    return;
  }

  let project;

  if (editingId) {
    // We're editing an existing project
    project = createProject(title);
    project.id = editingId;
  } else {
    // We're creating a new project
    project = createProject(title);
  }

  // Save to localStorage
  saveProjectToStorage(project);

  // Clear the form and close modal
  projectModal.reset();
  closeAllModals();

  // Refresh the page to show changes
  location.reload();
}

// ========================================
// STEP 7: MODAL FUNCTIONS
// ========================================

// Close all modals
function closeAllModals() {
  toDoModal.style.display = "none";
  projectModal.style.display = "none";
  modalBackdrop.classList.remove("active");
  editingId = null;
}

// Show todo modal
function showTodoModal() {
  toDoModal.style.display = "grid";
  modalBackdrop.classList.add("active");
  projectModal.style.display = "none";

  // Reset to "add" mode
  const modalTitle = toDoModal.querySelector("h1");
  if (modalTitle) modalTitle.textContent = "ADD NEW TASK";

  const submitBtn = toDoModal.querySelector(".btnS");
  if (submitBtn) submitBtn.textContent = "Create Task";

  editingId = null;
}

// Show project modal
function showProjectModal() {
  projectModal.style.display = "grid";
  modalBackdrop.classList.add("active");
  toDoModal.style.display = "none";

  // Reset to "add" mode
  const modalTitle = projectModal.querySelector("h2");
  if (modalTitle) modalTitle.textContent = "Create New Project";

  const submitBtn = projectModal.querySelector("#submit-project");
  if (submitBtn) submitBtn.textContent = "CREATE PROJECT";

  editingId = null;
}

// ========================================
// STEP 8: HANDLE CLICKS ON TODOS
// ========================================

function handleTodoClick(e) {
  const todoItem = e.target.closest(".todo-item");
  if (!todoItem) return;

  const todoId = todoItem.getAttribute("data-id");

  // CHECKBOX: Mark as complete/incomplete
  if (e.target.classList.contains("todo-checkbox")) {
    const storedData = localStorage.getItem(todoId);
    if (storedData) {
      const todo = JSON.parse(storedData);
      todo.completed = !todo.completed;
      saveTodoToStorage(todo);

      // Update the display
      todoItem.classList.toggle("completed");
      const statusElement = todoItem.querySelector(".todo-status");
      if (statusElement) {
        statusElement.textContent = todo.completed
          ? "Completed ✅"
          : "Pending ⏳";
      }
    }
    return;
  }

  // DELETE BUTTON
  if (e.target.closest(".btn-delete")) {
    if (confirm("Are you sure you want to delete this todo?")) {
      localStorage.removeItem(todoId);
      todoItem.remove();
    }
    return;
  }

  // EDIT BUTTON
  if (e.target.closest(".btn-edit")) {
    const todoString = localStorage.getItem(todoId);
    if (!todoString) {
      alert("Error: task not found!");
      return;
    }

    const todo = JSON.parse(todoString);
    const todoDate = todo.dueDate;

    console.log(todoDate);

    // Fill the form with existing data
    document.getElementById("title").value = todo.title || "";
    document.getElementById("description").value = todo.description || "";
    document.getElementById("date").value = todo.dueDate || "";
    document.getElementById("project").value = todo.project || "";
    document.getElementById("priority").value = todo.priority || "medium";

    // Change modal to "edit" mode
    const modalTitle = toDoModal.querySelector("h1");
    if (modalTitle) modalTitle.textContent = "EDIT TASK";

    const submitBtn = toDoModal.querySelector(".btnS");
    if (submitBtn) submitBtn.textContent = "Update Task";

    editingId = todoId;
    toDoModal.style.display = "grid";
    modalBackdrop.classList.add("active");
  }
}

// ========================================
// STEP 9: HANDLE CLICKS ON PROJECTS
// ========================================

function handleProjectClick(e) {
  const projectItem = e.target.closest(".project-item");
  const todos = getAllTodosFromStorage();

  if (!projectItem) return;

  // First: Remove active class from all projects
  document.querySelectorAll(".project-item").forEach((item) => {
    item.classList.remove("active");
  });

  // Second: Add active class to clicked project

  if (projectItem) {
    projectItem.classList.toggle("active");
  }

  // Third: Get the project name
  let projectName;

  if (projectItem.getAttribute("data-id")) {
    const projectId = projectItem.getAttribute("data-id");
    const projectsArr = getAllProjectsFromStorage();
    const project = projectsArr.find((p) => p.id === projectId);
    projectName = project.title;
  } else {
    // Default project - get from HTML text
    projectName = projectItem.querySelector(".project-row div").textContent;
  }
  // Fourth: Filter and display todos for that project
  main.innerHTML = "";

  todos.forEach((todo) =>
    todo.project === projectName
      ? main.insertAdjacentHTML("beforeend", createTodoHTML(todo))
      : console.log("none")
  );
  console.log(projectName, projectItem.textContent);

  if (projectName === projectItem.project) {
    console.log("is this it?");
  }
  if (e.target.closest(".p-btn-delete")) {
    // Fifth: Handle delete/edit buttons (only for dynamic projects)

    // DELETE BUTTON
    if (confirm("Are you sure you want to delete this project?")) {
      localStorage.removeItem(projectId);
      projectItem.remove();
      updateProjectDropdown();
    }
    return;
  }

  // EDIT BUTTON
  if (e.target.closest(".p-btn-edit")) {
    const projectString = localStorage.getItem(projectId);
    if (!projectString) {
      alert("Error: project not found!");
      return;
    }

    const project = JSON.parse(projectString);

    // Fill the form with existing data
    document.getElementById("project-name").value = project.title || "";

    // Change modal to "edit" mode
    const modalTitle = projectModal.querySelector("h2");
    if (modalTitle) modalTitle.textContent = "Edit Project";

    const submitBtn = projectModal.querySelector("#submit-project");
    if (submitBtn) submitBtn.textContent = "UPDATE PROJECT";

    editingId = projectId;
    projectModal.style.display = "grid";
    modalBackdrop.classList.add("active");
  }
}

// ========================================
// STEP 10: DISPLAY ALL TODOS AND PROJECTS
// ========================================

function displayAllTodos() {
  const todos = getAllTodosFromStorage();

  todos.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));

  // Clear and show all todos initially
  main.innerHTML = "";
  todos.forEach((todo) => {
    if (!todo.completed) {
      main.insertAdjacentHTML("beforeend", createTodoHTML(todo));
    }
  });

  console.log(`Loaded ${todos.length} todos`);
}

// Set up filtering - call this ONCE when app starts
function setupDateFiltering() {
  when.forEach((w) => {
    w.addEventListener("click", function (e) {
      const todos = getAllTodosFromStorage(); // Get fresh data
      const now = new Date();
      main.innerHTML = ""; // Clear previous results

      if (e.target.classList.contains("all")) {
        // Remove active from others, add to today

        [today, thisWeek, thisMonth, overdue].forEach((el) =>
          el.classList.remove("active")
        );
        all.classList.toggle("active");
        todos.forEach((todo) => {
          if (!todo.completed) {
            main.insertAdjacentHTML("beforeend", createTodoHTML(todo));
          }
        });
      } else if (e.target.classList.contains("today")) {
        // Remove active from others, add to today
        [thisWeek, thisMonth, overdue, all].forEach((el) =>
          el.classList.remove("active")
        );
        today.classList.toggle("active");

        // Filter and display today's todos
        todos.forEach((todo) => {
          const dueDate = new Date(todo.dueDate);
          if (
            dueDate.getDate() === now.getDate() &&
            dueDate.getMonth() === now.getMonth() &&
            dueDate.getFullYear() === now.getFullYear() &&
            todo.completed !== true
          ) {
            main.insertAdjacentHTML("beforeend", createTodoHTML(todo));
          }
        });
      } else if (e.target.classList.contains("thisWeek")) {
        [today, thisMonth, overdue, all].forEach((el) =>
          el.classList.remove("active")
        );
        thisWeek.classList.toggle("active");

        todos.forEach((todo) => {
          const dueDate = new Date(todo.dueDate);
          if (isThisWeekMonday(dueDate) && todo.completed !== true) {
            main.insertAdjacentHTML("beforeend", createTodoHTML(todo));
          }
        });
      } else if (e.target.classList.contains("thisMonth")) {
        [today, thisWeek, overdue, all].forEach((el) =>
          el.classList.remove("active")
        );
        thisMonth.classList.toggle("active");

        todos.forEach((todo) => {
          const dueDate = new Date(todo.dueDate);
          if (
            dueDate.getMonth() === now.getMonth() &&
            dueDate.getFullYear() === now.getFullYear() &&
            todo.completed !== true
          ) {
            main.insertAdjacentHTML("beforeend", createTodoHTML(todo));
          }
        });
      } else if (e.target.classList.contains("overdue")) {
        [today, thisWeek, thisMonth, all].forEach((el) =>
          el.classList.remove("active")
        );
        overdue.classList.toggle("active");

        // Show overdue todos (due date is before today)
        todos.forEach((todo) => {
          const dueDate = new Date(todo.dueDate);
          const today = new Date();
          today.setHours(0, 0, 0, 0); // Start of today

          if (dueDate < today && !todo.completed) {
            main.insertAdjacentHTML("beforeend", createTodoHTML(todo));
          }
        });
      } else if (e.target.closest("#completed-projects")) {
        [today, thisWeek, thisMonth].forEach((el) =>
          el.classList.remove("active")
        );
        console.log("About to toggle completed class"); // Debug 4
        completed.classList.toggle("active");

        main.innerHTML = "";
        const completedTodos = todos.filter((todo) => todo.completed === true);
        console.log("Found completed todos:", completedTodos.length); // Debug 6

        completedTodos.forEach((todo) => {
          main.insertAdjacentHTML("beforeend", createTodoHTML(todo));
        });

        console.log("Completed");
      } else if (e.target.closest("#completed-projects")) {
        [today, thisWeek, thisMonth].forEach((el) =>
          el.classList.remove("active")
        );
        console.log("About to toggle completed class"); // Debug 4
        completed.classList.toggle("active");

        main.innerHTML = "";
        const completedTodos = todos.filter((todo) => todo.completed === true);
        console.log("Found completed todos:", completedTodos.length); // Debug 6

        completedTodos.forEach((todo) => {
          main.insertAdjacentHTML("beforeend", createTodoHTML(todo));
        });

        console.log("Completed");
      }
    });
  });
}

//Function is This week Monday
function isThisWeekMonday(date) {
  const now = new Date();
  const inputDate = new Date(date);

  // Get Monday of this week
  const startOfWeek = new Date(now);
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
  startOfWeek.setDate(diff);
  startOfWeek.setHours(0, 0, 0, 0);

  // Get Sunday of this week
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return inputDate >= startOfWeek && inputDate <= endOfWeek;
}

// ========================================
// STEP 12: START THE APP
// ========================================

function displayAllProjects() {
  const projectsList = getAllProjectsFromStorage();

  // Add each project to the page
  projectsList.forEach((project) => {
    projects.insertAdjacentHTML("beforeend", createProjectHTML(project));
  });

  // Update the dropdown too
  updateProjectDropdown();

  console.log(`Loaded ${projectsList.length} projects`);
}

// ========================================
// STEP 11: SET UP ALL THE EVENT LISTENERS
// ========================================

// Button clicks
addTodo.addEventListener("click", showTodoModal);
createProjectBtn.addEventListener("click", showProjectModal);

// Form submissions
toDoModal.addEventListener("submit", handleTodoSubmit);
projectModal.addEventListener("submit", handleProjectSubmit);

// Cancel buttons and backdrop clicks
document.querySelectorAll(".btnC").forEach((button) => {
  button.addEventListener("click", closeAllModals);
});

modalBackdrop.addEventListener("click", function (e) {
  if (e.target === modalBackdrop) {
    closeAllModals();
  }
});

// Clicks on todos and projects
main.addEventListener("click", handleTodoClick);
sidebar.addEventListener("click", handleProjectClick);

// ========================================
// STEP 12: START THE APP
// ========================================

function startApp() {
  console.log("Starting Todo App...");
  displayAllTodos();
  displayAllProjects();
  setupDateFiltering();
  console.log("App started successfully!");
}

// Start when page loads
document.addEventListener("DOMContentLoaded", startApp);

// If already loaded, start immediately
if (document.readyState !== "loading") {
  startApp();
}
