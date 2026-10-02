const cardsEl = document.getElementById("cards");
const alertBox = document.getElementById("alertBox");
const spinner = document.getElementById("spinner");

const URL = "https://jsonplaceholder.typicode.com/users";
function showAlert(msg) {
    alertBox.innerHTML = `
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
            ${msg}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
}
async function load() {

    try {

        const response = await fetch(URL);
        if (!response.ok) {
            throw new Error("HTTP " + response.status);
        }

        const users = await response.json();

        cardsEl.innerHTML = users.map(user => `
    <div class="col-md-4">
        <div class="card h-100 shadow-sm">
            <div class="card-body">
                <h5 class="card-title">${user.name}</h5>
                <p class="card-text mb-1">
                    <strong>Email:</strong> ${user.email}
                </p>
                <p class="card-text mb-1">
                    <strong>City:</strong> ${user.address.city}
                </p>
                <p class="card-text mb-0">
                    <strong>Company:</strong> ${user.company.name}
                </p>
            </div>
        </div>
    </div>
`).join("");

    } catch (err) {
        showAlert("Load failed:"+ err.message);
    }
    finally {
        spinner.style.display = "none";
    }
}
load();
