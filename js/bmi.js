document.addEventListener("DOMContentLoaded", fetchBMI);

function fetchBMI() {
  fetch(`${API_BASE}/admin/bmi/latest`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then(res => {
      if (!res.ok) throw new Error("Fetch failed");
      return res.json();
    })
    .then(data => renderBMITable(data))
    .catch(err => {
      console.error("FETCH BMI ERROR:", err);
      showEmpty("Gagal memuat data BMI");
    });
}

function renderBMITable(data) {
  const tbody = document.getElementById("bmiTable");
  tbody.innerHTML = "";

  if (!data.length) {
    showEmpty("Data BMI kosong");
    return;
  }

  data.forEach(item => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="px-4 py-3">${item.user_id}</td>
      <td class="px-4 py-3 font-semibold">${item.bmi}</td>
      <td class="px-4 py-3">${item.category}</td>
      <td class="px-4 py-3 text-gray-500">
        ${new Date(item.created_at).toLocaleDateString("id-ID")}
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function showEmpty(message) {
  document.getElementById("bmiTable").innerHTML = `
    <tr>
      <td colspan="5" class="text-center py-6 text-gray-400">
        ${message}
      </td>
    </tr>
  `;
}
