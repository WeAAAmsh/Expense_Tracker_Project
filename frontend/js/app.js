const API_URL = "http://localhost:3000/api/expenses";
const form = document.getElementById("expenseForm");
let allExpenses = [];
let sortState = 0; 


const darkModeBtn = document.getElementById("darkModeBtn");

darkModeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    
    if (document.body.classList.contains("dark-mode")) {
        darkModeBtn.textContent = "☀️";
        localStorage.setItem("darkMode", "on");
    } else {
        darkModeBtn.textContent = "🌙";
        localStorage.setItem("darkMode", "off");
    }
});

if (localStorage.getItem("darkMode") === "on") {
    document.body.classList.add("dark-mode");
    darkModeBtn.textContent = "☀️";
}


function showAlert(msg, type = "danger") {
    const icon = type === "danger" ? "exclamation-triangle-fill" : "check-circle-fill";
    const alertBox = document.getElementById("alertBox");
    alertBox.innerHTML =`
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            <i class="bi bi-${icon}"></i>
            <span>${msg}</span>
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    setTimeout(() => { alertBox.innerHTML = ""; }, 5000);
}
function renderSummary(list) {
    const totalEl = document.getElementById("total");
    const countEl = document.getElementById("count");
    const highestEl = document.getElementById("highest");
    const highestTitleEl = document.getElementById("highest-title");

    const total = list.reduce((sum, expense) => sum + expense.amount, 0);
    const count = list.length;

    let highest = 0;
    let highestTitle = "";
    if (list.length > 0) {
        const maxExpense = list.reduce((max, expense) =>
            expense.amount > max.amount ? expense : max
        );
        highest = maxExpense.amount;
        highestTitle = maxExpense.title;
    }
    totalEl.textContent = total.toFixed(2);
    countEl.textContent = count;
    highestEl.textContent = highest.toFixed(2);
    highestTitleEl.textContent = highestTitle;

}
async function getExpenses() {
    const spinner = document.getElementById("spinner");
    spinner.style.display = "block";
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Http " + response.status);
        const data = await response.json();
        allExpenses = data;
        renderTable(data);
        renderSummary(data);
    } catch (err) {
        showAlert("Failed to load expenses: " + err.message);
    } finally {
        spinner.style.display = "none";
    }
}
getExpenses();

function renderTable(list) {
    const tbody = document.getElementById("expensesTable");

    if (list.length === 0) {
        tbody.innerHTML = `
        <tr>
            <td colspan="5" class="text-center text-muted py-3">
                No expenses found
            </td>
        </tr>
        `;
        return;
    }

    tbody.innerHTML = list.map(expense => `
        <tr>
            <td>${expense.title}</td>
            <td>${expense.amount.toFixed(2)}</td>
            <td>
              <span class = "badge bg-info ">${expense.category}</span>
            </td>
            <td>${expense.date}</td>
            <td class="text-end">
                <button class="btn btn-sm btn-warning"  data-id="${expense.id}">Edit</button>
                <button class="btn btn-sm btn-danger" data-id="${expense.id}">Delete</button>
            </td>
        </tr>
        `).join("");
}
function sortByAmount() {
    sortState = (sortState + 1) % 3;   // 0 → 1 → 2 → 0

    let sorted;

    if (sortState === 0) {
        sorted = [...allExpenses];
        document.getElementById("sortArrow").textContent = "↕";
    } else if (sortState === 1) {
        sorted = [...allExpenses].sort((a, b) => a.amount - b.amount);
        document.getElementById("sortArrow").textContent = "↑";
    } else {
        sorted = [...allExpenses].sort((a, b) => b.amount - a.amount);
        document.getElementById("sortArrow").textContent = "↓";
    }

    renderTable(sorted);
}

document.getElementById("sortAmount").addEventListener("click", sortByAmount);
async function addExpense(expenseData) {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(expenseData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message);
        }
        const newExpense = await response.json();

    } catch (err) {
        showAlert("Failed to load expenses: " + err.message);
    }

}

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("title").value;
    const amount = Number(document.getElementById("amount").value);
    const category = document.getElementById("category").value;
    const date = document.getElementById("date").value;
    const expenseData = { title, amount, category, date }
    await addExpense(expenseData);
    form.reset();
    getExpenses();
});

async function deleteExpense(id) {
    try {
        const response = await fetch(API_URL + "/" + id,
            { method: "DELETE" }
        );
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message);
        }
        const deletedExpense = await response.json();

    } catch (err) {
        showAlert("Failed to load expenses: " + err.message);
    }
}

document.getElementById("expensesTable").addEventListener("click", async (e) => {
    if (e.target.classList.contains("btn-danger")) {
        const id = e.target.dataset.id;
        await deleteExpense(id);
        getExpenses();
    }
});
function applyFilter() {
    const select = document.getElementById("filterCategory");
    const selectedValue = select.value;

    if (selectedValue === "All") {
        renderTable(allExpenses)
    } else {
        const filtered = allExpenses.filter(exp => exp.category === selectedValue);
        renderTable(filtered);
    }

}
document.getElementById("filterCategory").addEventListener("change", () => {
    applyFilter();
});


async function updateExpense(id, data) {
    try {
        const response = await fetch(API_URL + "/" + id,
            {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            }
        );
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message);
        }
        const updated = await response.json();

    } catch (err) {
        showAlert("Failed to load expenses: " + err.message);
    }
}

document.getElementById("expensesTable").addEventListener("click", (e) => {
    if (e.target.classList.contains("btn-warning")) {
        const id = Number(e.target.dataset.id);
        const expense = allExpenses.find(exp => exp.id === id);
        if (!expense) return;

        document.getElementById("editId").value = expense.id;
        document.getElementById("editTitle").value = expense.title;
        document.getElementById("editAmount").value = expense.amount;
        document.getElementById("editCategory").value = expense.category;
        document.getElementById("editDate").value = expense.date;

        const modal = new bootstrap.Modal(document.getElementById("editModal"));
        modal.show();
    }
});

document.getElementById("editForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = Number(document.getElementById("editId").value);
    const data = {
        title: document.getElementById("editTitle").value,
        amount: Number(document.getElementById("editAmount").value),
        category: document.getElementById("editCategory").value,
        date: document.getElementById("editDate").value
    };

    await updateExpense(id, data);

    const modalEl = document.getElementById("editModal");
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();

    getExpenses();
});