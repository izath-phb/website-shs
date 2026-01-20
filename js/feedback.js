(() => {
  const token = localStorage.getItem("access_token");

  if (!token) {
    alert("Unauthorized");
    window.location.href = "login.html";
    return;
  }

  fetch(`${API_BASE}/feedback/list`, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  })
    .then(res => {
      if (!res.ok) {
        throw new Error("Gagal mengambil data feedback");
      }
      return res.json();
    })
    .then(data => {
      const tbody = document.getElementById("feedbackTable");
      tbody.innerHTML = "";

      if (data.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="6" class="py-4 text-center text-gray-500">
              Belum ada feedback
            </td>
          </tr>
        `;
        return;
      }

      data.forEach(f => {
        tbody.innerHTML += `
          <tr class="border-b text-center hover:bg-gray-50">
            <td class="px-4 py-2">${f.user_id}</td>
            <td class="px-4 py-2">${f.type}</td>
            <td class="px-4 py-2">⭐ ${f.rating}</td>
            <td class="px-4 py-2 text-left">${f.comment || "-"}</td>
            <td class="px-4 py-2">
              ${new Date(f.date).toLocaleString("id-ID")}
            </td>
            <td class="px-4 py-2 space-x-2">
              <button
                onclick="editFeedback(${f.id}, ${f.rating}, '${f.comment || ""}')"
                class="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500">
                Edit
              </button>
              <button
                onclick="deleteFeedback(${f.id})"
                class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
                Hapus
              </button>
            </td>
          </tr>
        `;
      });
    })
    .catch(err => {
      console.error("FEEDBACK ERROR:", err);
      alert("Gagal memuat feedback");
    });
})();

/* =========================
   DELETE FEEDBACK
========================= */
function deleteFeedback(id) {
  const token = localStorage.getItem("access_token");

  if (!confirm("Yakin ingin menghapus feedback ini?")) return;

  fetch(`${API_BASE}/feedback/delete/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  })
    .then(res => res.json())
    .then(() => location.reload())
    .catch(err => {
      console.error(err);
      alert("Gagal menghapus feedback");
    });
}

/* =========================
   EDIT FEEDBACK
========================= */
function editFeedback(id, oldRating, oldComment) {
  const rating = prompt("Rating (1–5):", oldRating);
  if (!rating) return;

  const comment = prompt("Komentar:", oldComment);

  const token = localStorage.getItem("access_token");

  fetch(`${API_BASE}/feedback/update/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      rating: parseInt(rating),
      comment: comment
    })
  })
    .then(res => res.json())
    .then(() => location.reload())
    .catch(err => {
      console.error(err);
      alert("Gagal update feedback");
    });
}
