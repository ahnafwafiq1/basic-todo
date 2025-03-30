document.addEventListener("DOMContentLoaded", () => {
  // --- DOM Elements ---
  const newTaskInput = document.getElementById("newTaskInput");
  const addTaskBtn = document.getElementById("addTaskBtn");
  const taskList = document.getElementById("taskList");
  const finishedTaskList = document.getElementById("finishedTaskList");
  const finishedHeader = document.getElementById("finishedHeader");
  const toggleFinished = document.getElementById("toggleFinished");
  const finishedSectionContent = document.getElementById("finishedTaskList"); // Same as finishedTaskList

  // --- State ---
  let tasks = [];
  let isFinishedVisible = true; // Default state

  // --- Load tasks from Local Storage ---
  function loadTasks() {
    const storedTasks = localStorage.getItem("tasks");
    if (storedTasks) {
      tasks = JSON.parse(storedTasks);
    }
    // Load collapsed state
    const storedVisibility = localStorage.getItem("finishedVisible");
    // Default to true if not explicitly set to 'false'
    isFinishedVisible = storedVisibility !== "false";
    renderTasks();
    updateFinishedSectionVisibility(); // Apply loaded visibility state
  }

  // --- Save tasks to Local Storage ---
  function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  // --- Save finished section visibility state ---
  function saveVisibilityState() {
    localStorage.setItem("finishedVisible", isFinishedVisible);
  }

  // --- Render tasks to the DOM ---
  function renderTasks() {
    taskList.innerHTML = ""; // Clear current lists
    finishedTaskList.innerHTML = "";

    if (tasks.length === 0) {
      // Optionally display a message if no tasks exist
      // taskList.innerHTML = '<p class="empty-message">No active tasks yet!</p>';
    }

    tasks.forEach((task) => {
      const taskItem = createTaskElement(task);
      if (task.isFinished) {
        finishedTaskList.appendChild(taskItem);
      } else {
        taskList.appendChild(taskItem);
      }
    });

    // Add empty message if finished list is empty (optional)
    if (
      finishedTaskList.children.length === 0 &&
      tasks.some((t) => t.isFinished)
    ) {
      // finishedTaskList.innerHTML = '<p class="empty-message">No finished tasks yet!</p>';
    }

    updateFinishedSectionVisibility(); // Ensure section visibility is correct after render
  }

  // --- Create HTML element for a single task ---
  function createTaskElement(task) {
    const li = document.createElement("li");
    li.className = "task-item";
    li.dataset.id = task.id; // Store task ID on the element

    // Checkbox and Text container
    const taskContent = document.createElement("div");
    taskContent.className = "task-content";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.isFinished;
    checkbox.addEventListener("change", () => toggleTaskFinished(task.id));

    const textSpan = document.createElement("span");
    textSpan.className = "task-text";
    textSpan.textContent = task.text;

    taskContent.appendChild(checkbox);
    taskContent.appendChild(textSpan);

    // Action Buttons container
    const taskActions = document.createElement("div");
    taskActions.className = "task-actions";

    const editBtn = document.createElement("button");
    editBtn.className = "edit-btn";
    editBtn.innerHTML = '<i class="fas fa-pencil-alt"></i>';
    editBtn.setAttribute("aria-label", "Edit Task");
    editBtn.addEventListener("click", () => editTask(task.id, textSpan));

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
    deleteBtn.setAttribute("aria-label", "Delete Task");
    deleteBtn.addEventListener("click", () => deleteTask(task.id));

    taskActions.appendChild(editBtn);
    taskActions.appendChild(deleteBtn);

    // Assemble list item
    li.appendChild(taskContent);
    li.appendChild(taskActions);

    // Apply finished class if necessary (for styling like line-through)
    if (task.isFinished) {
      li.classList.add("finished"); // Although CSS targets children, this can be useful
      textSpan.style.textDecoration = "line-through";
      textSpan.style.color = "#777";
    }

    return li;
  }

  // --- Add a new task ---
  function addTask() {
    const text = newTaskInput.value.trim();
    if (text === "") {
      // Maybe add a little shake animation or border color change to input
      newTaskInput.style.borderColor = "red";
      setTimeout(() => {
        newTaskInput.style.borderColor = "#ddd";
      }, 1000);
      return; // Don't add empty tasks
    }

    const newTask = {
      id: Date.now(), // Simple unique ID using timestamp
      text: text,
      isFinished: false,
    };

    tasks.unshift(newTask); // Add to the beginning of the array (shows up top)
    saveTasks();
    renderTasks();
    newTaskInput.value = ""; // Clear input field
    newTaskInput.focus(); // Keep focus on input
  }

  // --- Toggle task finished status ---
  function toggleTaskFinished(id) {
    tasks = tasks.map((task) => {
      if (task.id === id) {
        return { ...task, isFinished: !task.isFinished };
      }
      return task;
    });
    saveTasks();
    renderTasks(); // Re-render to move the task
  }

  // --- Delete a task ---
  function deleteTask(id) {
    // Optional: Confirmation
    // if (!confirm("Are you sure you want to delete this task?")) {
    //     return;
    // }
    tasks = tasks.filter((task) => task.id !== id);
    saveTasks();
    renderTasks();
  }

  // --- Edit a task ---
  function editTask(id, textSpan) {
    const task = tasks.find((task) => task.id === id);
    if (!task) return;

    const currentText = task.text;
    const newText = prompt("Edit your task:", currentText);

    if (
      newText !== null &&
      newText.trim() !== "" &&
      newText.trim() !== currentText
    ) {
      // Update the task in the array
      tasks = tasks.map((t) => {
        if (t.id === id) {
          return { ...t, text: newText.trim() };
        }
        return t;
      });
      saveTasks();
      // Update the DOM directly for instant feedback (optional but nice)
      textSpan.textContent = newText.trim();
      // OR just call renderTasks() - simpler but redraws everything
      // renderTasks();
    } else if (newText !== null && newText.trim() === "") {
      alert("Task text cannot be empty!");
    }
  }

  // --- Toggle Finished Section Visibility ---
  function toggleFinishedVisibility() {
    isFinishedVisible = !isFinishedVisible;
    updateFinishedSectionVisibility();
    saveVisibilityState(); // Save the new state
  }

  // --- Update Finished Section DOM based on isFinishedVisible ---
  function updateFinishedSectionVisibility() {
    const hasFinishedTasks = tasks.some((task) => task.isFinished);

    // Only make the header clickable if there are finished tasks to show/hide
    if (hasFinishedTasks) {
      finishedHeader.style.cursor = "pointer";
      finishedHeader.onclick = toggleFinishedVisibility; // Attach/reattach listener

      if (isFinishedVisible) {
        finishedSectionContent.classList.remove("hidden");
        finishedSectionContent.classList.add("visible"); // Ensure visible class is present
        finishedHeader.classList.remove("collapsed");
        toggleFinished.textContent = "[-]";
        // Ensure max-height allows visibility (handled by CSS .visible)
      } else {
        finishedSectionContent.classList.add("hidden");
        finishedSectionContent.classList.remove("visible"); // Ensure visible class is removed
        finishedHeader.classList.add("collapsed");
        toggleFinished.textContent = "[+]";
        // Ensure max-height is 0 (handled by CSS .hidden)
      }
    } else {
      // No finished tasks: hide content, disable toggle, show neutral state
      finishedHeader.style.cursor = "default";
      finishedHeader.onclick = null; // Remove listener
      finishedSectionContent.classList.add("hidden"); // Always hide if empty
      finishedSectionContent.classList.remove("visible");
      finishedHeader.classList.remove("collapsed"); // Neutral state
      toggleFinished.textContent = ""; // Hide the toggle icon completely
    }
  }

  // --- Event Listeners ---
  addTaskBtn.addEventListener("click", addTask);
  newTaskInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      addTask();
    }
  });
  // Initial setup for the finished header click listener is done in updateFinishedSectionVisibility

  // --- Initial Load ---
  loadTasks();
}); // End DOMContentLoaded
