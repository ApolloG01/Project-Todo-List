const main = document.getElementById("main");
const addTodo = document.getElementById("addTodo");
const toDoModal = document.getElementById("todo-modal");
const cancelTodo = document.querySelector(".btnC");

const createProject = document.querySelector("#projects-btn");

const submitProject = document.getElementById("submit-project");

const projectModal = document.getElementById("project-modal");

const projects = document.getElementById("projects");

const editBtn = document.querySelectorAll(".btn-edit");

const modalBackdrop = document.getElementById("modal-backdrop");

const body = document.querySelector("body");

const sidebar = document.getElementById("sidebar");

const displayProjectModal = (function () {
  createProject.addEventListener("click", function () {
    projectModal.style.display = "grid";
    modalBackdrop.classList.add("active");
    toDoModal.style.display = "none";
  });
})();

const displayTodoModal = (function () {
  addTodo.addEventListener("click", function () {
    toDoModal.style.display = "grid";
    modalBackdrop.classList.add("active");
    projectModal.style.display = "none";
  });
})();

cancelTodo.addEventListener("click", function () {
  toDoModal.style.display = "none";
});

modalBackdrop.addEventListener("click", function (e) {
  // Chiudi entrambi i modali quando clicchi sul backdrop
  toDoModal.style.display = "none";
  projectModal.style.display = "none";
  modalBackdrop.classList.remove("active");
});

const html = function (obj) {
  return `
  <div class="todo-item" data-id="${obj.id}">

    <div id="todo-left">
      <span class="todo-title">${obj.title}</span>
      <span class="todo-title">${obj.description}</span>
      <span class="todo-date">${obj.dueDate}</span>
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
};

const createProjectsHtml = function (obj) {
  return `
    <li class="project-item" data-id="${obj.id}">
      <div class="project-row">
        <div>${obj.title}</div>
        <button class="p-btn-edit" title="Edit">
          <img src="images/edit.png" alt="Edit" />
        </button>
        <button class="p-btn-delete" title="Delete">
          <img src="images/bin.png" alt="Delete" />
        </button>
      </div>
    </li>
  `;
};

let arrTodoData = [];

const todoFunction = function (e) {
  e.preventDefault();
  const title = document.querySelector("#title").value;
  const description = document.querySelector("#description").value;
  const dueDate = document.querySelector("#date").value;
  const todoId =
    window.editingId ||
    title.trim().toLowerCase().replace(/\s+/g, "").slice(0, 4) +
      Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0");

  let todoObj = {
    id: todoId,
    title: title,
    description: description,
    dueDate: dueDate,
  };

  localStorage.setItem(todoObj.id, JSON.stringify(todoObj));

  toDoModal.reset();
  toDoModal.style.display = "none";

  if (window.editingId) {
    location.reload();
    window.editingId = null;
    return;
  }

  main.insertAdjacentHTML("afterbegin", html(todoObj));
  modalBackdrop.classList.remove("active");

  console.log(html(todoObj));
};

let projTodoData = [];

const projectFunction = function (e) {
  e.preventDefault();
  const title = document.querySelector("#project-name").value;

  const todoId =
    window.editingId ||
    title.trim().toLowerCase().replace(/\s+/g, "").slice(0, 4) +
      Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0");

  let projectObj = {
    id: todoId,
    title: title,
  };

  let projectObjString = JSON.stringify(projectObj);

  localStorage.setItem(projectObj.id, projectObjString);

  projectModal.reset();
  projectModal.style.display = "none";
  modalBackdrop.classList.remove("active");

  if (window.editingId) {
    location.reload();
    window.editingId = null;
    return;
  }

  const newProjectsDiv = document.getElementById("new-projects");
  if (newProjectsDiv) {
    newProjectsDiv.insertAdjacentHTML(
      "beforebegin",
      createProjectsHtml(projectObj)
    );
  } else {
    projects.insertAdjacentHTML("beforeend", createProjectsHtml(projectObj));
  }
};

const submitTodoForm = (function () {
  toDoModal.addEventListener("submit", todoFunction);
})();

const submitProjectform = (function () {
  projectModal.addEventListener("submit", projectFunction);
})();

// Caricamento iniziale TODO
for (let key in localStorage) {
  const item = JSON.parse(localStorage.getItem(key));
  if (item && item.title && item.id && item.dueDate) {
    arrTodoData.push(item);
    main.insertAdjacentHTML("afterbegin", html(item));
  }
}

// Caricamento iniziale PROGETTI
for (let key in localStorage) {
  const item = JSON.parse(localStorage.getItem(key));
  if (item && item.title && item.id && !item.dueDate) {
    projTodoData.push(item);
    sidebar.insertAdjacentHTML("beforeend", createProjectsHtml(item));
  }
}

const todoItem = document.querySelectorAll(".todo-item");

const bin = document.querySelector(".btn-delete");

main.addEventListener("click", function (e) {
  // DELETE
  const btnDelete = e.target.closest(".btn-delete");
  if (btnDelete) {
    const item = btnDelete.closest(".todo-item");
    if (item) {
      const id = item.getAttribute("data-id");
      item.remove();
      localStorage.removeItem(id);
    }
    return;
  }

  // EDIT
  const btnEdit = e.target.closest(".btn-edit");
  if (btnEdit) {
    const item = btnEdit.closest(".todo-item");
    if (item) {
      const id = item.getAttribute("data-id");
      const todoString = localStorage.getItem(id);

      if (!todoString) {
        alert("Errore: task non trovato in localStorage!");
        return;
      }
      const todo = JSON.parse(todoString);
      // Precompila i campi del form
      document.getElementById("title").value = todo.title || "";
      document.getElementById("description").value = todo.description || "";
      document.getElementById("date").value = todo.dueDate || "";

      window.editingId = id;
      toDoModal.style.display = "grid";
    }
  }
});

sidebar.addEventListener("click", function (e) {
  // DELETE
  const projBtnDelete = e.target.closest(".p-btn-delete");
  if (projBtnDelete) {
    const item = projBtnDelete.closest(".project-item");
    if (item) {
      const id = item.getAttribute("data-id");
      item.remove();
      localStorage.removeItem(id);
    }
    return;
  }

  // EDIT
  const projectBtnEdit = e.target.closest(".p-btn-edit");
  if (projectBtnEdit) {
    const item = projectBtnEdit.closest(".project-item");
    if (item) {
      const id = item.getAttribute("data-id");
      const projectString = localStorage.getItem(id);

      if (!projectString) {
        alert("Errore: progetto non trovato in localStorage!");
        return;
      }
      const project = JSON.parse(projectString);
      // Precompila il campo corretto del form PROGETTO
      document.getElementById("project-name").value = project.title || "";

      window.editingId = id;
      projectModal.style.display = "grid"; // Mostra il modal dei progetti
      modalBackdrop.classList.add("active");
    }
  }
});

window.editingId = null;

function createTodo(title, description, dueDate, project, priority = "medium") {
  return { title, description, dueDate, project, priority };
}
