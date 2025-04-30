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
  deleteDoc,
} from "./firebase.js";

/////////////////////////////////////////// show card and user data

document.addEventListener("DOMContentLoaded", () => {
  const userImage = document.getElementById("userImage");
  const userId = document.querySelector("#userId");
  const userId2 = document.querySelector("#userId2");
  const userEmail = document.getElementById("userEmail");
  const userGender = document.getElementById("userGender");
  const taskContainer = document.getElementById("task-container");

  const container = document.getElementById("boardsContainer");

  const fetchProducts = async (userid) => {
    const q = query(collection(db, "taskData"), where("userId", "==", userid));

    onSnapshot(q, (querySnapshot) => {
      // variables
      const pendingCol = document.getElementById("boardsContainer");
      const inProgressCol = document.getElementById("inProgressTasks");
      const doneCol = document.getElementById("doneTasks");

      // cleaning prev data
      pendingCol.innerHTML = "";
      inProgressCol.innerHTML = "";
      doneCol.innerHTML = "";

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const docRef = doc(db, "taskData", docSnap.id);

        // card wrapper
        const task = document.createElement("div");
        task.classList.add("task-card");
        task.classList.add("col-lg-3");

        // card content
        task.innerHTML = `
  <div class="task-header">
    <h6 class="task-title">${data.titleName}</h6>
    <span class="task-priority priority-${data.category.toLowerCase()}">${data.category
          }</span>
  </div>
  <p class="task-desc">${data.description}</p>
  <div class="task-meta">
    <div class="task-due">
      <i class="far fa-calendar"></i> ${data.dueDate || "—"}
    </div>
    <div class="task-actions">
      <button class="btn-task edit-btn"><i class="fas fa-edit"></i></button>
      <button class="btn-task delete-btn"><i class="fas fa-trash-alt"></i></button>
    </div>
  </div>
`;

        ///////////////////////////// edit functionality
        task.querySelector(".edit-btn").addEventListener("click", function () {
          document.getElementById("editModal").style.display = "flex";
          document.getElementById("modalOverlay").style.display = "block";

          // input fields
          document.getElementById("editTitle").value = data.titleName;
          document.getElementById("editCategory").value = data.category;
          document.getElementById("editDescription").value = data.description;
          document.getElementById("editDueDate").value = data.dueDate;

          const form = document.getElementById("editTaskForm");

          // remove existing listener

          const newForm = form.cloneNode(true);
          form.parentNode.replaceChild(newForm, form);

          newForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            const updatedData = {
              titleName: document.getElementById("editTitle").value,
              category: document.getElementById("editCategory").value,
              description: document.getElementById("editDescription").value,
              dueDate: document.getElementById("editDueDate").value,
            };

            ///////////////////// update doc functionality
            try {
              await updateDoc(docRef, updatedData);

              /// success modal

              Swal.fire({
                icon: "success",
                title: "Task Updated",
                text: "Your task has been updated.",
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true,
              });
              document.getElementById("editModal").style.display = "none";
              document.getElementById("modalOverlay").style.display = "none";
            } catch (error) {
              console.error("Update failed:", error);
              alert("Failed to update task.");
            }
          });
        });

        // modal close button
        document
          .querySelector(".close-button")
          .addEventListener("click", function () {
            document.getElementById("editModal").style.display = "none";
            document.getElementById("modalOverlay").style.display = "none";
          });

        // modal close on clicking outside
        window.onclick = function (event) {
          const modal = document.getElementById("editModal");
          if (event.target === modal) {
            modal.style.display = "none";
            document.getElementById("modalOverlay").style.display = "none";
          }
        };

        /////////////////////////////////////// Delete functionality


        task.querySelector(".delete-btn").addEventListener("click", async function () {
          try {
          

            await deleteDoc(doc(db, "taskData", docSnap.id));
            task.remove();
             /// success modal

              Swal.fire({
                icon: "success",
                title: "Task Deleted",
                text: "Your task has been deleted sucessfully.",
                showConfirmButton: false,
                timer: 1000,
                timerProgressBar: true,
              });
          }
          catch (error) {
            console.error("Error deleting task:", error);
            alert("There was an error deleting the task.");
          }
        });



        // choose correct column based on status
        switch (data.status) {
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

  /////////////////////////////////////////////////////////////////////////////////// authentic user check

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
