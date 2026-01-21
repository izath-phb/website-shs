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
      if (!res.ok) throw new Error("Gagal mengambil data feedback");
      return res.json();
    })
    .then(data => {
      const tbody = document.getElementById("feedbackTable");
      if (!tbody) return;

      tbody.innerHTML = "";

      if (!Array.isArray(data) || data.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="7" class="py-4 text-center text-gray-500">
              Belum ada feedback
            </td>
          </tr>`;
        return;
      }

      let posCount = 0;
      let negCount = 0;

      data.forEach(f => {
        if (f.sentiment === "Positif") posCount++;
        if (f.sentiment === "Negatif") negCount++;

        const sColor =
          f.sentiment === "Positif"
            ? "bg-green-100 text-green-700"
            : f.sentiment === "Negatif"
            ? "bg-red-100 text-red-700"
            : "bg-gray-100 text-gray-700";

        tbody.innerHTML += `
          <tr class="border-b text-center hover:bg-gray-50">
            <td class="px-4 py-2">${f.user_id ?? "-"}</td>

            <td class="px-4 py-2 capitalize">
              ${(f.type || "-").replace("_", " ")}
            </td>

            <td class="px-4 py-2">⭐ ${f.rating ?? "-"}</td>

            <td class="px-4 py-2 text-left">
              ${f.comment ? escapeHTML(f.comment) : "-"}
            </td>

            <td class="px-4 py-2">
              <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase ${sColor}">
                ${f.sentiment || "Netral"}
              </span>
            </td>

            <td class="px-4 py-2 text-left text-xs">
              ${f.date ? new Date(f.date).toLocaleString("id-ID") : "-"}
            </td>

            <td class="px-4 py-2 space-x-2">
              <button
                class="text-blue-500 hover:underline"
                data-id="${f.id}"
                data-rating="${f.rating ?? ""}"
                data-comment="${encodeURIComponent(f.comment || "")}"
                onclick="handleEdit(this)">
                Edit
              </button>

              <button
                class="text-red-500 hover:underline"
                onclick="deleteFeedback(${f.id})">
                Hapus
              </button>
            </td>
          </tr>
        `;
      });

      const total = data.length;
      document.getElementById("posPercent").innerText =
        `${Math.round((posCount / total) * 100)}%`;
      document.getElementById("negPercent").innerText =
        `${Math.round((negCount / total) * 100)}%`;
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

  fetch(`${API_BASE}/feedback/${id}`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${token}` }
  })
    .then(res => {
      if (!res.ok) throw new Error();
      location.reload();
    })
    .catch(() => alert("Gagal menghapus feedback"));
}

/* =========================
   EDIT FEEDBACK (AMAN)
========================= */
function handleEdit(btn) {
  editFeedback(
    btn.dataset.id,
    btn.dataset.rating,
    decodeURIComponent(btn.dataset.comment || "")
  );
}

function editFeedback(id, oldRating, oldComment) {
  const rating = prompt("Rating (1–5):", oldRating);
  if (!rating) return;

  const comment = prompt("Komentar:", oldComment);
  const token = localStorage.getItem("access_token");

  fetch(`${API_BASE}/feedback/${id}`, {
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
    .then(res => {
      if (!res.ok) throw new Error();
      location.reload();
    })
    .catch(() => alert("Gagal update feedback"));
}

/* =========================
   HELPER: XSS SAFE
========================= */
function escapeHTML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
