
import {
  auth,
  onAuthStateChanged,
  doc,
  onSnapshot,
  db,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  deleteDoc
} from "./firebase.js";

/////////////////////////////////////////// show card and user data 

document.addEventListener("DOMContentLoaded", () => {
  const userImage = document.getElementById("userImage");
  const userId = document.querySelector("#userId");
  const userId2 = document.querySelector("#userId2");
  const userEmail = document.getElementById("userEmail");
  const userGender = document.getElementById("userGender");
  const taskContainer = document.getElementById("task-container");


  const container = document.getElementById('boardsContainer');

 

  const fetchProducts = async (userid) => {
    const q = query(collection(db, "taskData"), where("userId", "==", userid));
  
    onSnapshot(q, (querySnapshot) => {
      // get each of the three columns
      const pendingCol    = document.getElementById("boardsContainer");
      const inProgressCol = document.getElementById("inProgressTasks");
      const doneCol       = document.getElementById("doneTasks");
  
      // clear them
      pendingCol.innerHTML = "";
      inProgressCol.innerHTML = "";
      doneCol.innerHTML = "";
  
      querySnapshot.forEach((doc) => {
        const data = doc.data();
  
        // create card wrapper
        const task = document.createElement("div");
        task.classList.add("task-card");
        task.classList.add("col-lg-3");
  
        // fill card
        task.innerHTML = `
        
          <div class="task-header">
            <h6 class="task-title">${data.titleName}</h6>
            <span class="task-priority priority-${data.category.toLowerCase()}">${data.category}</span>
          </div>
          <p class="task-desc">${data.description}</p>
          <div class="task-meta">
            <div class="task-due">
              <i class="far fa-calendar"></i> ${data.dueDate || "—"}
            </div>
            <div class="task-actions">
              <button class="btn-task"><i class="fas fa-edit"></i></button>
              <button class="btn-task"><i class="fas fa-trash-alt"></i></button>
            </div>
          </div>`;
  
        // choose correct column based on status
        switch(data.status) {
          case "pending":
            pendingCol.appendChild(task);
            break;
          case "inProgress":
            inProgressCol.appendChild(task);
            break;
          case "done":
            doneCol.appendChild(task);
            break;
          default:
            // if you ever have other statuses…
            pendingCol.appendChild(task);
        }
      });
    });
  };
  
  
  
    


  //////////////////////////////////////////////////////////////


  // Sample data for tasks
  const tasks = {
    pending: [
      {
        title: "Design System Update",
        priority: "High",
        description: "Update the design system with new components and document all changes.",
        dueDate: "Apr 30",
      },
      {
        title: "Content Planning",
        priority: "Medium",
        description: "Create content calendar for next month's blog posts and social media.",
        dueDate: "May 5",
      },
    ],
    inProgress: [
      {
        title: "Dashboard Redesign",
        priority: "High",
        description: "Implement new dashboard layout with improved analytics and user metrics.",
        dueDate: "Apr 28",
      },
      {
        title: "API Integration",
        priority: "Medium",
        description: "Connect backend API endpoints with frontend components for data fetching.",
        dueDate: "May 2",
      },
      {
        title: "User Testing",
        priority: "Low",
        description: "Conduct user testing sessions for the new feature implementation.",
        dueDate: "May 8",
      },
    ],
    completed: [
      {
        title: "Bug Fixing",
        priority: "High",
        description: "Fixed critical bugs in the authentication flow and dashboard performance.",
        dueDate: "Apr 25",
      },
      {
        title: "Documentation",
        priority: "Medium",
        description: "Created comprehensive documentation for the new API endpoints and components.",
        dueDate: "Apr 23",
      },
    ],
  };

  // Function to create task HTML structure
  function createTaskCard(task) {
    return `
      <div class="task-card">
        <div class="task-header">
          <h6 class="task-title">${task.title}</h6>
          <span class="task-priority priority-${task.priority.toLowerCase()}">${task.priority}</span>
        </div>
        <p class="task-desc">${task.description}</p>
        <div class="task-meta">
          <div class="task-due">
            <i class="far fa-calendar"></i> ${task.dueDate}
          </div>
          <div class="task-actions">
            <button class="btn-task">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn-task">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // Function to render tasks dynamically
  function renderTasks() {
    const pendingTasksContainer = document.getElementById("pendingTasks");
    const inProgressTasksContainer = document.getElementById("inProgressTasks");
    const doneTasksContainer = document.getElementById("doneTasks");

    tasks.pending.forEach(task => {
      pendingTasksContainer.innerHTML += createTaskCard(task);
    });

    tasks.inProgress.forEach(task => {
      inProgressTasksContainer.innerHTML += createTaskCard(task);
    });

    tasks.completed.forEach(task => {
      doneTasksContainer.innerHTML += createTaskCard(task);
    });
  }

  // Initialize the tasks rendering
  renderTasks();








  ///////////////////////////////////////////////////////////////////////////////////

  onAuthStateChanged(auth, (user) => {
    if (user) {
      const userRef = doc(db, "users", user.uid);
      console.log(userRef, "getting data");

      onSnapshot(userRef, (snapshot) => {
        if (snapshot.exists()) {
          const userData = snapshot.data();

          userId.textContent = userData?.name || "Anonymous";
          userId2.textContent = userData?.name || "Anonymous";
          userEmail.textContent = userData?.email || user.email;
          userGender.textContent = userData?.gender || "other";
          userImage.src = userData?.profile_pic || "";

          console.log("this is name", userId);

          fetchProducts(user?.uid, userData);
        } else {
          console.log("User data not found in Firestore.");
          taskContainer.innerHTML = "<p>Please log in to see your blogs.</p>";
        }
      });
    } else {
      console.log("User is not logged in.");
    }
  });
});
