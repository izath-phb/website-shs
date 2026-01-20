(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
        alert("Token tidak ditemukan, silakan login ulang");
        window.location.href = "login.html";
    }

    document.addEventListener("DOMContentLoaded", () => {
        const tbody = document.getElementById("usersTable");
        if (!tbody) return;

        // =====================
        // LOAD USERS
        // =====================
        fetch(`${API_BASE}/admin/users`, {
            headers: { "Authorization": `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(users => {
            console.log("USERS DATA:", users);
            tbody.innerHTML = "";

            users.forEach(user => {
                tbody.innerHTML += `
                    <tr class="border-b text-center">
                        <td class="px-4 py-2">${user.id}</td>
                        <td class="px-4 py-2">${user.name || "-"}</td>
                        <td class="px-4 py-2">${user.email}</td>
                        <td class="px-4 py-2">
                          <span class="px-2 py-1 text-xs rounded
                            ${user.role === "admin"
                              ? "bg-red-100 text-red-600"
                              : "bg-green-100 text-green-600"}">
                            ${user.role || "user"}
                          </span>
                        </td>
                        <td class="px-4 py-2">
                            ${user.login_type === "google"
                                ? "<span class='text-green-600'>Google</span>"
                                : "<span class='text-blue-600'>Email</span>"
                            }
                        </td>
                        <td class="px-4 py-2">
                            ${user.is_active
                                ? "<span class='text-green-600'>Active</span>"
                                : "<span class='text-red-600'>Inactive</span>"
                            }
                        </td>
                        <td class="px-4 py-2 space-x-2">
                            <button
                                onclick="openEditUser(
                                    ${user.id},
                                    '${user.name || ""}',
                                    '${user.email}',
                                    '${user.role || "user"}'
                                )"
                                class="bg-blue-500 text-white px-3 py-1 rounded">
                                Edit
                            </button>
                            <button
                                onclick="toggleUser(${user.id}, ${!user.is_active})"
                                class="bg-yellow-500 text-white px-3 py-1 rounded">
                                Toggle
                            </button>
                            <button
                                onclick="deleteUser(${user.id})"
                                class="bg-red-600 text-white px-3 py-1 rounded">
                                Delete
                            </button>
                        </td>
                    </tr>
                `;
            });
        })
        .catch(err => console.error("FETCH USERS ERROR:", err));
    });

    // =====================
    // OPEN ADD USER
    // =====================
    window.openAddUser = function() {
        document.getElementById("userId").value = "";
        document.getElementById("userName").value = "";
        document.getElementById("userEmail").value = "";
        document.getElementById("userRole").value = "user";
        document.getElementById("userPassword").value = "";

        document.getElementById("modalTitle").innerText = "Tambah User";
        document.getElementById("userModal").classList.remove("hidden");
    };

    // =====================
    // OPEN EDIT USER
    // =====================
    window.openEditUser = function(id, name, email, role) {
        document.getElementById("userId").value = id;
        document.getElementById("userName").value = name || "";
        document.getElementById("userEmail").value = email;
        document.getElementById("userRole").value = role;
        document.getElementById("userPassword").value = "";

        document.getElementById("modalTitle").innerText = "Edit User";
        document.getElementById("userModal").classList.remove("hidden");
    };

    // =====================
    // SAVE USER (ADD / EDIT)
    // =====================
    window.saveUser = function() {
        const id = document.getElementById("userId").value;
        const name = document.getElementById("userName").value;
        const email = document.getElementById("userEmail").value;
        const password = document.getElementById("userPassword").value;
        const role = document.getElementById("userRole").value;

        if (!name || !email) {
            alert("Name & Email wajib diisi");
            return;
        }

        const payload = { name, email, role };
        if (password) payload.password = password;

        fetch(`${API_BASE}/admin/users${id ? "/" + id : ""}`, {
            method: id ? "PUT" : "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        })
        .then(() => location.reload());
    };

    // =====================
    // TOGGLE USER
    // =====================
    window.toggleUser = function(id, status) {
        fetch(`${API_BASE}/admin/users/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ is_active: status })
        }).then(() => location.reload());
    };

    // =====================
    // DELETE USER
    // =====================
    window.deleteUser = function(id) {
        if (!confirm("Hapus user ini?")) return;

        fetch(`${API_BASE}/admin/users/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        }).then(() => location.reload());
    };

    // =====================
    // CLOSE MODAL
    // =====================
    window.closeModal = function() {
        document.getElementById("userModal").classList.add("hidden");
    };
})();
