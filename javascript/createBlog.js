import {
  auth,
  onAuthStateChanged,
  addDoc,
  updateDoc,
  serverTimestamp,
  collection,
  db,
  getDoc,
  doc,
} from "./firebase.js";

const blogForm = document.getElementById("productform");

// =========================== CLOUDINARY CONFIGURATION ========///////============


const CLOUDINARY_UPLOAD_URL = "https://api.cloudinary.com/v1_1/dyrvpyc8f/upload";
                                  /////////////////////
const CLOUDINARY_UPLOAD_PRESET = "praticeCloudinary";

// Function to upload media to Cloudinary
const uploadToCloudinary = async (file) => {
  if (!file) return null; // Check if file exists

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  try {
    const response = await fetch(CLOUDINARY_UPLOAD_URL, {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    return data.secure_url || null;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    return null;
  }
};

// =========================== Store Authenticated User Globally ===========================
let currentUser = null;
onAuthStateChanged(auth, (user) => {
  currentUser = user;
});

// =========================== Handle post Form Submission ===========================


blogForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const blogId = localStorage.getItem("editBlogId"); // Get blog ID if editing

  if (!currentUser) {
    alert("You must be logged in to create or edit a blog!");
    return;
  }

  const blogTitle = document.getElementById("blogTitle").value;
  const category = document.getElementById("category").value;
  const mainContentElem = document.querySelector("#mainContent");
  let mainContent = mainContentElem ? mainContentElem.value : "";

  // Handle title image upload
  const titleImageInput = document.getElementById("titleImage");
  let titleImageUrl = "";

  if (titleImageInput && titleImageInput.files.length > 0) {
    titleImageUrl = await uploadToCloudinary(titleImageInput.files[0]);
    if (!titleImageUrl) {
      alert("Failed to upload title image.");
      return;
    }
  } else {
    const blogImagePreview = document.getElementById("blogImagePreview");
    titleImageUrl = blogImagePreview ? blogImagePreview.src : "";
  }

  // Process Sections
  let sections = [];
  document.querySelectorAll(".section").forEach(async (section) => {
    const headingElem = section.querySelector("input:nth-of-type(1)");
    const subheadingElem = section.querySelector("input:nth-of-type(2)");
    const contentElem = section.querySelector("textarea");

    if (!headingElem || !subheadingElem || !contentElem) return;

    let heading = headingElem.value;
    let subheading = subheadingElem.value;
    let content = contentElem.value;

    let mediaFiles = section.querySelectorAll(".media-input");
    let mediaUrls = [];

    for (let mediaFile of mediaFiles) {
      if (mediaFile.files.length > 0) {
        let uploadedUrl = await uploadToCloudinary(mediaFile.files[0]);
        if (uploadedUrl) mediaUrls.push(uploadedUrl);
      }
    }

    sections.push({ heading, subheading, content, media: mediaUrls });
  });

  const authorName = currentUser.displayName || "Anonymous";
  const currentDate = new Date().toLocaleDateString();

  try {
    if (blogId) {
      // **UPDATE EXISTING BLOG**
      const blogRef = doc(db, "blogs", blogId);
      await updateDoc(blogRef, {
        title: blogTitle,
        category: category,
        mainContent: mainContent,
        sections: sections,
        titleImage: titleImageUrl,
        updatedAt: serverTimestamp(),
      });

      alert("Blog updated successfully!");
      localStorage.removeItem("editBlogId");
    } else {
      // **CREATE NEW BLOG**
      await addDoc(collection(db, "blogs"), {
        title: blogTitle,
        category: category,
        mainContent: mainContent,
        sections: sections,
        author: authorName,
        date: currentDate,
        titleImage: titleImageUrl,
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
      });

      alert("Blog successfully posted!");
    }

    blogForm.reset();
    document.getElementById("sectionsContainer").innerHTML = "";
    window.location.href = "dashboard.html";
  } catch (error) {
    console.error("Error saving blog:", error);
  }
});

// =========================== Add New Section Dynamically ===========================
document.getElementById("addSection").addEventListener("click", function () {
  const sectionsContainer = document.getElementById("sectionsContainer");

  const newSection = document.createElement("div");
  newSection.classList.add("section");

  newSection.innerHTML = `
      <label class="form-label">Heading</label>
      <input type="text" class="form-control mb-2" placeholder="Enter heading">
      
      <label class="form-label">Subheading</label>
      <input type="text" class="form-control mb-2" placeholder="Enter subheading">
      
      <textarea class="form-control" rows="4" placeholder="Write content..."></textarea>
      
      <div class="mt-2">
          <label class="form-label">Add Media</label>
          <div class="media-options">
              <input type="file" class="media-input form-control" accept="image/*,video/*,.pdf,.docx">
          </div>
      </div>

      <span class="remove-section" style="cursor: pointer; color: red;">Remove Section ❌</span>
  `;

  sectionsContainer.appendChild(newSection);
});

// =========================== Remove Section (Using Event Delegation) ===========================
document.getElementById("sectionsContainer").addEventListener("click", function (event) {
  if (event.target.classList.contains("remove-section")) {
    event.target.closest(".section").remove();
  }
});

// =========================== Load Existing Blog Data for Editing ===========================
document.addEventListener("DOMContentLoaded", async () => {
  const blogId = localStorage.getItem("editBlogId");

  if (blogId) {
    const blogRef = doc(db, "blogs", blogId);
    const blogSnap = await getDoc(blogRef);

    if (blogSnap.exists()) {
      const blogData = blogSnap.data();

      document.getElementById("blogTitle").value = blogData.title || "";
      document.getElementById("category").value = blogData.category || "";
      document.getElementById("mainContent").value = blogData.mainContent || "";
      document.getElementById("blogImagePreview").src = blogData.titleImage || "";

      document.getElementById("submitBtn").textContent = "Update Blog";

      const sectionsContainer = document.getElementById("sectionsContainer");
      sectionsContainer.innerHTML = "";

      blogData.sections.forEach((section) => {
        let newSection = document.createElement("div");
        newSection.classList.add("section");

        newSection.innerHTML = `
          <label class="form-label">Heading</label>
          <input type="text" class="form-control mb-2" value="${section.heading}">
          
          <label class="form-label">Subheading</label>
          <input type="text" class="form-control mb-2" value="${section.subheading}">
          
          <textarea class="form-control" rows="4">${section.content}</textarea>
          
          <div class="mt-2">
              <label class="form-label">Existing Media</label>
              <div class="media-preview">
                  ${section.media.map((url) => `<a href="${url}" target="_blank">View Media</a>`).join("<br>")}
              </div>
          </div>

          <span class="remove-section" style="cursor: pointer; color: red;">Remove Section ❌</span>
        `;

        sectionsContainer.appendChild(newSection);
      });
    }
  }
});
