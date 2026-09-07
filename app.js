const postsUrl = "https://jsonplaceholder.typicode.com/posts";
const usersUrl = "https://jsonplaceholder.typicode.com/users";
const commentsBaseUrl = "https://jsonplaceholder.typicode.com/posts";

let globalPosts = [];
let filteredPostsCache = [];
let globalUserMap = {};
let globalUsersData = {};
let isEditMode = false;
let currentEditId = null;

let localMyPosts = JSON.parse(localStorage.getItem("myCustomPosts")) || [];

let currentPage = 1;
const itemsPerPage = 10;
const ADMIN_USER_ID = 999;

const postsContainer = document.getElementById("postsContainer");
const paginationContainer = document.getElementById("paginationContainer");
const loadingEl = document.getElementById("loading");
const postForm = document.getElementById("postForm");
const postTitle = document.getElementById("postTitle");
const postBody = document.getElementById("postBody");
const submitBtn = postForm.querySelector('button[type="submit"]');
const formHeader = document.querySelector(".form-section h2");
const searchInput = document.getElementById("searchInput");
const userFilter = document.getElementById("userFilter");
const toastContainer = document.getElementById("toastContainer");

const commentModal = document.getElementById("commentModal");
const userModal = document.getElementById("userModal");
const closeCommentModal = document.getElementById("closeCommentModal");
const closeUserModal = document.getElementById("closeUserModal");
const commentsContainer = document.getElementById("commentsContainer");
const modalLoading = document.getElementById("modalLoading");

document.addEventListener("DOMContentLoaded", getPostsAndUsers);
searchInput.addEventListener("input", filterData);
userFilter.addEventListener("change", filterData);

function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.classList.add("toast", `toast-${type}`);
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = "slideOut 0.3s ease forwards";
    toast.addEventListener("animationend", () => toast.remove());
  }, 3000);
}

async function getPostsAndUsers() {
  try {
    const [postsResponse, usersResponse] = await Promise.all([
      fetch(postsUrl),
      fetch(usersUrl),
    ]);

    let apiPosts = await postsResponse.json();
    const users = await usersResponse.json();

    users.forEach((user) => {
      globalUserMap[user.id] = user.name;
      globalUsersData[user.id] = user;

      const option = document.createElement("option");
      option.value = user.id;
      option.textContent = user.name;
      userFilter.appendChild(option);
    });

    globalUserMap[ADMIN_USER_ID] = "Sen (Admin)";
    globalPosts = [...localMyPosts, ...apiPosts];
    filteredPostsCache = [...globalPosts];

    loadingEl.style.display = "none";
    renderCurrentPage();
    showToast("Sistem başarıyla yüklendi.", "info");
  } catch (error) {
    loadingEl.innerHTML =
      '<p style="color: red;">Veriler yüklenirken ağda bir sorun oluştu!</p>';
    showToast("Sunucu bağlantı hatası!", "error");
  }
}

function filterData() {
  const searchTerm = searchInput.value.toLowerCase();
  const selectedUserId = userFilter.value;

  filteredPostsCache = globalPosts.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm);
    const matchesUser =
      selectedUserId === "all" || post.userId.toString() === selectedUserId;
    return matchesSearch && matchesUser;
  });

  currentPage = 1;
  renderCurrentPage();
}

function renderCurrentPage() {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const postsToShow = filteredPostsCache.slice(startIndex, endIndex);
  displayPosts(postsToShow);
  renderPaginationControls();
}

function displayPosts(posts) {
  postsContainer.innerHTML = "";

  if (posts.length === 0) {
    postsContainer.innerHTML =
      '<p style="text-align: center; color: var(--text-muted); margin-top: 2rem;">Kriterlere uygun gönderi bulunamadı.</p>';
    return;
  }

  posts.forEach((post) => {
    const authorName = globalUserMap[post.userId] || "Bilinmeyen Yazar";
    const isOwner = post.userId === ADMIN_USER_ID;

    const card = document.createElement("div");
    card.classList.add("post-card");
    card.setAttribute("data-id", post.id);

    card.innerHTML = `
            <div>
                <h3>${post.title}</h3>
                <span class="author-badge ${isOwner ? "custom-author" : ""}" onclick="openUserProfile(${post.userId})">Yazar: ${authorName}</span>
                <p>${post.body}</p>
            </div>
            <div class="card-actions">
                <button class="comment-btn" onclick="openComments(${post.id})">Yorumlar</button>
                
                ${
                  isOwner
                    ? `
                    <button class="edit-btn" onclick="editPost(${post.id})">Düzenle</button>
                    <button class="delete-btn" onclick="deletePost(${post.id})">Sil</button>
                `
                    : ""
                }
            </div>
        `;
    postsContainer.appendChild(card);
  });
}

function renderPaginationControls() {
  paginationContainer.innerHTML = "";
  const totalPages = Math.ceil(filteredPostsCache.length / itemsPerPage);

  if (totalPages <= 1) return;

  const prevBtn = document.createElement("button");
  prevBtn.classList.add("page-btn");
  prevBtn.textContent = "Önceki";
  prevBtn.disabled = currentPage === 1;
  prevBtn.onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      renderCurrentPage();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  paginationContainer.appendChild(prevBtn);

  for (let i = 1; i <= totalPages; i++) {
    const pageBtn = document.createElement("button");
    pageBtn.classList.add("page-btn");
    if (i === currentPage) pageBtn.classList.add("active");
    pageBtn.textContent = i;
    pageBtn.onclick = () => {
      currentPage = i;
      renderCurrentPage();
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    paginationContainer.appendChild(pageBtn);
  }

  const nextBtn = document.createElement("button");
  nextBtn.classList.add("page-btn");
  nextBtn.textContent = "Sonraki";
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.onclick = () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderCurrentPage();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  paginationContainer.appendChild(nextBtn);
}

postForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const postData = {
    title: postTitle.value,
    body: postBody.value,
    userId: ADMIN_USER_ID,
  };

  try {
    if (isEditMode) {
      try {
        await fetch(`${postsUrl}/${currentEditId}`, {
          method: "PUT",
          body: JSON.stringify(postData),
          headers: { "Content-type": "application/json; charset=UTF-8" },
        });
      } catch (e) {}

      const gIndex = globalPosts.findIndex((p) => p.id === currentEditId);
      if (gIndex !== -1) {
        globalPosts[gIndex].title = postData.title;
        globalPosts[gIndex].body = postData.body;
      }

      const lIndex = localMyPosts.findIndex((p) => p.id === currentEditId);
      if (lIndex !== -1) {
        localMyPosts[lIndex].title = postData.title;
        localMyPosts[lIndex].body = postData.body;
        localStorage.setItem("myCustomPosts", JSON.stringify(localMyPosts));
      }

      isEditMode = false;
      currentEditId = null;
      formHeader.textContent = "Yeni Yazı Oluştur";
      submitBtn.textContent = "Gönderiyi Yayımla";
      submitBtn.style.backgroundColor = "var(--primary)";

      showToast("Gönderi başarıyla güncellendi.", "success");
    } else {
      postData.id = Date.now();

      try {
        await fetch(postsUrl, {
          method: "POST",
          body: JSON.stringify(postData),
          headers: { "Content-type": "application/json; charset=UTF-8" },
        });
      } catch (e) {}

      globalPosts.unshift(postData);
      localMyPosts.unshift(postData);
      localStorage.setItem("myCustomPosts", JSON.stringify(localMyPosts));

      showToast("Yeni gönderi kalıcı olarak eklendi.", "success");
    }

    filterData();
    postForm.reset();
  } catch (error) {
    showToast("İşlem sırasında bir hata oluştu!", "error");
  }
});

window.editPost = function (id) {
  const postToEdit = globalPosts.find((post) => post.id === id);
  if (postToEdit) {
    postTitle.value = postToEdit.title;
    postBody.value = postToEdit.body;
    isEditMode = true;
    currentEditId = id;
    formHeader.textContent = "Yazıyı Düzenle";
    submitBtn.textContent = "Değişiklikleri Kaydet";
    submitBtn.style.backgroundColor = "#10b981";
    window.scrollTo({ top: 0, behavior: "smooth" });

    showToast("Düzenleme moduna geçildi.", "info");
  }
};

window.deletePost = async function (id) {
  try {
    try {
      await fetch(`${postsUrl}/${id}`, { method: "DELETE" });
    } catch (e) {}

    globalPosts = globalPosts.filter((post) => post.id !== id);
    localMyPosts = localMyPosts.filter((post) => post.id !== id);
    localStorage.setItem("myCustomPosts", JSON.stringify(localMyPosts));

    filterData();
    showToast("Gönderi sistemden kalıcı olarak silindi.", "error");
  } catch (error) {
    showToast("Silme işlemi başarısız!", "error");
  }
};

window.openComments = async function (postId) {
  commentModal.style.display = "block";
  commentsContainer.innerHTML = "";
  modalLoading.style.display = "block";

  try {
    const response = await fetch(`${commentsBaseUrl}/${postId}/comments`);
    const comments = await response.json();
    modalLoading.style.display = "none";

    if (comments.length === 0) {
      commentsContainer.innerHTML =
        '<p style="color: var(--text-muted);">Bu gönderi için henüz yorum yapılmamış.</p>';
      return;
    }

    comments.forEach((comment) => {
      const commentDiv = document.createElement("div");
      commentDiv.classList.add("comment-box");
      commentDiv.innerHTML = `
                <h4>${comment.name}</h4>
                <span>${comment.email}</span>
                <p>${comment.body}</p>
            `;
      commentsContainer.appendChild(commentDiv);
    });
  } catch (error) {
    modalLoading.style.display = "none";
    commentsContainer.innerHTML =
      '<p style="color:var(--danger);">Yorumlar bulunamadı.</p>';
    showToast("Yorum bulunamadı!", "error");
  }
};

window.openUserProfile = function (userId) {
  const user = globalUsersData[userId];

  if (userId === ADMIN_USER_ID) {
    document.getElementById("profileInitials").textContent = "S";
    document.getElementById("profileName").textContent = "Sen (Admin)";
    document.getElementById("profileUsername").textContent = "@admin_workspace";
    document.getElementById("profileEmail").textContent = "admin@workspace.com";
    document.getElementById("profilePhone").textContent = "+90 555 123 4567";
    document.getElementById("profileCompany").textContent = "Workspace Inc.";
    document.getElementById("profileWebsite").textContent = "www.workspace.com";
  } else if (user) {
    document.getElementById("profileInitials").textContent =
      user.name.charAt(0);
    document.getElementById("profileName").textContent = user.name;
    document.getElementById("profileUsername").textContent =
      `@${user.username.toLowerCase()}`;
    document.getElementById("profileEmail").textContent = user.email;
    document.getElementById("profilePhone").textContent = user.phone;
    document.getElementById("profileCompany").textContent = user.company.name;
    document.getElementById("profileWebsite").textContent = user.website;
  }

  userModal.style.display = "block";
};

closeCommentModal.onclick = () => (commentModal.style.display = "none");
closeUserModal.onclick = () => (userModal.style.display = "none");
window.onclick = (event) => {
  if (event.target == commentModal) commentModal.style.display = "none";
  if (event.target == userModal) userModal.style.display = "none";
};

// --- KARANLIK MOD (DARK MODE) YÖNETİMİ ---
const themeToggle = document.getElementById("themeToggle");
const currentTheme = localStorage.getItem("appTheme") || "light";

if (currentTheme === "dark") {
  document.documentElement.setAttribute("data-theme", "dark");
  themeToggle.textContent = "☀️";
}

themeToggle.addEventListener("click", () => {
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  if (isDark) {
    document.documentElement.removeAttribute("data-theme");
    localStorage.setItem("appTheme", "light");
    themeToggle.textContent = "🌙";
  } else {
    document.documentElement.setAttribute("data-theme", "dark");
    localStorage.setItem("appTheme", "dark");
    themeToggle.textContent = "☀️";
  }
});
