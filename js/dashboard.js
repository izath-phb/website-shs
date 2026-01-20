// =========================
// CHART INSTANCES
// =========================
let bmiChartInstance = null;
let feedbackChartInstance = null;
let chatbotChartInstance = null;

(() => {
    const token = localStorage.getItem("access_token");

    // PROTECT ADMIN PAGE
    if (window.protectAdminPage) protectAdminPage();

    // ADMIN NAME ELEMENT (WAJIB)
    const adminNameEl = document.getElementById("admin-email");

    // FETCH DASHBOARD SUMMARY
    fetch(`${API_BASE}/admin/dashboard/summary`, {
        headers: { "Authorization": `Bearer ${token}` }
    })
    .then(res => {
        if (res.status === 401 || res.status === 403) {
            logout();
            return;
        }
        return res.json();
    })
    .then(data => {
        if (!data) return;

        console.log("Dashboard Data:", data);

        // =========================
        // TOTAL USERS
        // =========================
        document.getElementById("totalUsers").innerText =
            data.total_users || 0;

        // =========================
        // ADMIN INFO (SAFE)
        // =========================
        if (adminNameEl && data.admin) {
            adminNameEl.innerText =
                data.admin.name &&
                data.admin.name.trim() !== "" &&
                data.admin.name.toLowerCase() !== "administrator"
                    ? data.admin.name
                    : "Admin";
        }

        // =========================
        // TOTAL FEEDBACK + AVG RATING
        // =========================
        fetch(`${API_BASE}/feedback/list`, {
            headers: { "Authorization": `Bearer ${token}` }
        })
        .then(res => res.ok ? res.json() : [])
        .then(feedbacks => {
            if (!feedbacks.length) return;

            document.getElementById("totalFeedback").innerText =
                feedbacks.length;

            const avg =
                feedbacks.reduce((s, f) => s + f.rating, 0) /
                feedbacks.length;

            document.getElementById("avgRating").innerText =
                avg.toFixed(1);
                const globalAvg = avg;
        });

        // =========================
        // FEEDBACK CHART
        // =========================
        if (data.avg_feedback?.length) {
            const globalAvg =
  parseFloat(document.getElementById("avgRating").innerText) || 0;
            if (feedbackChartInstance) {
                feedbackChartInstance.destroy();
            }

            const formatLabel = type =>
                type.replace(/_/g, " ")
                    .replace(/\b\w/g, c => c.toUpperCase());

            const FEEDBACK_COLORS = {
                chatbot: "#3B82F6",
                body_detection: "#10B981",
                food_detection: "#F59E0B",
                recommendation: "#8B5CF6",
                application: "#EF4444"
            };

            feedbackChartInstance = new Chart(
                document.getElementById("feedbackChart"),
                {
                    type: "bar",
                    data: {
                        labels: data.avg_feedback.map(i =>
                            formatLabel(i.type)
                        ),
                      datasets: [
                             {
                    label: "Rata-rata Rating per Fitur",
                    data: data.avg_feedback.map(i => i.avg_rating),
                    backgroundColor: data.avg_feedback.map(
                    i => FEEDBACK_COLORS[i.type] || "#6B7280"
                    ),
                    borderRadius: 8,
                    barThickness: 40
                    },
                    {
                    label: "Rata-rata Keseluruhan",
                    type: "line",
                    data: data.avg_feedback.map(() => globalAvg),
                    borderColor: "#111827",
                    borderDash: [6, 6],
                    borderWidth: 2,
                    pointRadius: 0,
                    fill: false
                    }
                    ]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: { display: false },
                            tooltip: {
                                callbacks: {
                                    label(ctx) {
                                        const total =
                                            data.avg_feedback[ctx.dataIndex].total;
                                        return `⭐ ${ctx.raw} / 5 (${total} feedback)`;
                                    }
                                }
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                max: 5,
                                ticks: { stepSize: 1 }
                            }
                        }
                    }
                }
            );
        }

        // =========================
        // BMI DISTRIBUTION
        // =========================
        if (data.bmi_statistics?.length) {

            if (bmiChartInstance) {
                bmiChartInstance.destroy();
            }

            bmiChartInstance = new Chart(
                document.getElementById("bmiChart"),
                {
                    type: "pie",
                    data: {
                        labels: data.bmi_statistics.map(i => i.category),
                        datasets: [{
                            data: data.bmi_statistics.map(i => i.total),
                            backgroundColor: [
                                "#60A5FA",
                                "#34D399",
                                "#FBBF24",
                                "#F87171"
                            ]
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: { position: "bottom" }
                        }
                    }
                }
            );
        }

        // =========================
        // CHATBOT ACTIVITY
        // =========================
        if (data.chatbot_activity?.length) {

            if (chatbotChartInstance) {
                chatbotChartInstance.destroy();
            }

            chatbotChartInstance = new Chart(
                document.getElementById("chatbotChart"),
                {
                    type: "line",
                    data: {
                        labels: data.chatbot_activity.map(i => i.date),
                        datasets: [{
                            label: "Total Chat",
                            data: data.chatbot_activity.map(i => i.total),
                            borderColor: "#6366F1",
                            backgroundColor: "rgba(99,102,241,0.2)",
                            fill: true,
                            tension: 0.4,
                            pointRadius: 4
                        }]
                    },
                    options: {
                        responsive: true,
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: { precision: 0 }
                            }
                        }
                    }
                }
            );
        }
    })
    .catch(err =>
        console.error("FETCH DASHBOARD ERROR:", err)
    );
})();
