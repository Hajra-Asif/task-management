// import {
//     auth,
//     onAuthStateChanged,
//     doc,
//     getDoc,
//     collection,
//     query,
//     orderBy,
//     getDocs,
//     db
// } from "./confiq.js";

// // Function to fetch bookmarked blogs
// async function fetchBookmarkedBlogs(userId) {
//     const bookmarksContainer = document.getElementById("bookmarksContainer");

//     if (!bookmarksContainer) {
//         console.error("Error: bookmarksContainer not found in the DOM.");
//         return;
//     }

//     bookmarksContainer.innerHTML = `<p class="text-center">Loading bookmarks...</p>`;

//     try {
//         // Reference to user's bookmarks collection
//         const bookmarksRef = collection(db, "user_bookmarks", userId, "bookmarkedBlogs");
//         const q = query(bookmarksRef, orderBy("date", "desc")); // Ordering by date field

//         const querySnapshot = await getDocs(q);

//         if (querySnapshot.empty) {
//             bookmarksContainer.innerHTML = `<p class="text-center">No bookmarks yet.</p>`;
//             return;
//         }

//         let bookmarksHTML = "";
//         querySnapshot.forEach((doc) => {
//             const blog = doc.data();
//             bookmarksHTML += `
//                 <div class="card mb-3 shadow">
//                     <img src="${blog.titleImage}" class="card-img-top" alt="${blog.title}">
//                     <div class="card-body">
//                         <h5 class="card-title">${blog.title}</h5>
//                         <p class="card-text">${blog.mainContent.substring(0, 100)}...</p>
//                         <a href="blogDetails.html?id=${doc.id}" class="btn btn-primary">Read More</a>
//                     </div>
//                 </div>
//             `;
//         });

//         bookmarksContainer.innerHTML = bookmarksHTML;
//     } catch (error) {
//         console.error("Error fetching bookmarks:", error);
//         bookmarksContainer.innerHTML = `<p class="text-center text-danger">Error loading bookmarks.</p>`;
//     }
// }

// // Check if user is authenticated
// onAuthStateChanged(auth, (user) => {
//     const bookmarksContainer = document.getElementById("bookmarksContainer");

//     if (!bookmarksContainer) {
//         console.error("Error: bookmarksContainer not found in the DOM.");
//         return;
//     }

//     if (user) {
//         fetchBookmarkedBlogs(user.uid);
//     } else {
//         bookmarksContainer.innerHTML = `<p class="text-center">Please log in to see bookmarks.</p>`;
//     }
// });

// async function loadBookmarkedBlogs() {
//     const user = auth.currentUser;
//     if (!user) {
//         console.log("User not logged in.");
//         return;
//     }

//     const bookmarksContainer = document.getElementById("bookmarksContainer");
//     bookmarksContainer.innerHTML = "<p>Loading bookmarks...</p>";

//     const userBookmarksRef = collection(db, "user_bookmarks", user.uid, "bookmarkedBlogs");
//     const querySnapshot = await getDocs(userBookmarksRef);

//     bookmarksContainer.innerHTML = ""; // Clear loading message

//     if (querySnapshot.empty) {
//         bookmarksContainer.innerHTML = "<p>No bookmarks found.</p>";
//         return;
//     }

//     querySnapshot.forEach((doc) => {
//         const blog = doc.data();
//         const blogCard = `
//             <div class="card m-3">
//                 <img src="${blog.titleImage}" class="card-img-top" alt="Blog Image">
//                 <div class="card-body">
//                     <h5 class="card-title">${blog.title}</h5>
//                     <p class="card-text"><strong>Category:</strong> ${blog.category}</p>
//                     <p class="card-text"><strong>Author:</strong> ${blog.author}</p>
//                     <a href="blogDetail.html?id=${blog.blogId}" class="btn btn-primary">Read More</a>
//                 </div>
//             </div>
//         `;
//         bookmarksContainer.innerHTML += blogCard;
//     });
// }

// // Run this function when `bookMark.html` loads
// document.addEventListener("DOMContentLoaded", () => {
//     onAuthStateChanged(auth, (user) => {
//         if (user) loadBookmarkedBlogs();
//     });
// });

import {
  auth,
  onAuthStateChanged,
  collection,
  query,
  where, // Filtering ke liye
  orderBy,
  getDocs,
  doc,
  getDoc,
  db,
} from "./firebase.js";

// Function to fetch only user's bookmarked blogs
async function fetchBookmarkedBlogs(userId) {
  const bookmarksContainer = document.getElementById("bookmarksContainer");

  if (!bookmarksContainer) {
    console.error("Error: bookmarksContainer not found in the DOM.");
    return;
  }

  bookmarksContainer.innerHTML = `<p class="text-center">Loading bookmarks...</p>`;

  try {
    // Sirf current user ke bookmarks fetch karne ke liye query
    const bookmarksRef = collection(db, "FavBlogs");
    // const q = query(bookmarksRef, where("user_id", "==", userId), orderBy("created_at", "desc"));
    const q = query(bookmarksRef, where("user_id", "==", userId));

    console.log("Fetching user's bookmarked blogs...");
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log("No bookmarked blogs found for this user.");
      bookmarksContainer.innerHTML = `<p class="text-center">No bookmarks yet.</p>`;
      return;
    }

    let bookmarksHTML = "";
    for (const docSnap of querySnapshot.docs) {
      const bookmarkedBlog = docSnap.data();

      // Fetch actual blog details using blog_id
      const blogRef = doc(db, "blogs", bookmarkedBlog.blog_id);
      const blogSnap = await getDoc(blogRef);

      if (!blogSnap.exists()) {
        console.warn(`Blog not found for ID: ${bookmarkedBlog.blog_id}`);
        continue;
      }

      const blog = blogSnap.data();
      console.log("Fetched blog:", blog);

      bookmarksHTML += `
    <div class="card bookmarkWidth mb-3 shadow">
      <img src="${blog.titleImage}" class="card-img-top" alt="${blog.title}">
      <div class="card-body">
          <h5 class="card-title">${blog.title}</h5>
          <span class="tag3">${blog.category}</span>          
          <p class="card-text">${
            blog.mainContent ? blog.mainContent.substring(0, 100) : "No content"
          }...</p>
          <a href=./showSingleBlog.html?id=${
            bookmarkedBlog.blog_id
          }" class="btn1 btn-primary">Read More</a>
      </div>
</div>
            `;
    }

    bookmarksContainer.innerHTML = bookmarksHTML;
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    bookmarksContainer.innerHTML = `<p class="text-center text-danger">Error loading bookmarks.</p>`;
  }
}

// Check if user is authenticated and fetch only their bookmarked blogs
onAuthStateChanged(auth, (user) => {
  const bookmarksContainer = document.getElementById("bookmarksContainer");

  if (!bookmarksContainer) {
    console.error("Error: bookmarksContainer not found in the DOM.");
    return;
  }

  if (user) {
    console.log("User logged in:", user.uid);
    fetchBookmarkedBlogs(user.uid);
  } else {
    console.log("User not logged in.");
    bookmarksContainer.innerHTML = `<p class="text-center">Please log in to see bookmarks.</p>`;
  }
});
