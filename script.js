document.addEventListener("DOMContentLoaded", () => {

const loginBox = document.getElementById('login-box');
const signupBox = document.getElementById('signup-box');

const showSignup = document.getElementById('show-signup');
const showLogin = document.getElementById('show-login');

const message = document.getElementById('message') || { textContent: "", style: {} };

const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');

const authContainer = document.getElementById('auth-container');
const appContainer = document.getElementById('app');

const logoutBtn = document.getElementById('logout-btn');
const form = document.getElementById('form');

const BASE_URL = "https://expense-tracker-backend-1-afoj.onrender.com/api";

let token = localStorage.getItem('token');


// ================= SWITCH =================
showSignup && (showSignup.onclick = (e) => {
    e.preventDefault();
    loginBox.style.display = 'none';
    signupBox.style.display = 'block';
});

showLogin && (showLogin.onclick = (e) => {
    e.preventDefault();
    signupBox.style.display = 'none';
    loginBox.style.display = 'block';
});


// ================= AUTH CHECK =================
function checkAuth() {
    const storedToken = localStorage.getItem('token');

    if (!storedToken) {
        authContainer.style.display = "block";
        appContainer.style.display = "none";
        return;
    }

    token = storedToken;

    authContainer.style.display = "none";
    appContainer.style.display = "block";

    // 🔥 SHOW WELCOME
    const welcome = document.getElementById("welcome");
    const name = localStorage.getItem("name");

    if (name && welcome) {
        welcome.textContent = `Welcome, ${name}`;

        // animation
        setTimeout(() => {
            welcome.classList.add("welcome-show");
        }, 100);
    }

    loadExpenses();
}


// ================= LOGIN =================
loginForm && (loginForm.onsubmit = async (e) => {
    e.preventDefault();

    try {
        const res = await fetch(`${BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: document.getElementById('login-email').value,
                password: document.getElementById('login-password').value
            })
        });

        const data = await res.json();
        console.log("LOGIN:", data);

        if (res.ok && data.token) {

            localStorage.setItem('token', data.token);

            // 🔥 SAVE NAME
            localStorage.setItem("name", data.user.name);

            token = data.token;

            authContainer.style.display = "none";
            appContainer.style.display = "block";

            checkAuth(); // 🔥 ensures welcome shows properly

        } else {
            alert(data.message || "Login failed");
        }

    } catch (err) {
        console.log(err);
        alert("Server error");
    }
});


// ================= SIGNUP =================
signupForm && (signupForm.onsubmit = async (e) => {
    e.preventDefault();

    try {
        const res = await fetch(`${BASE_URL}/auth/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: document.getElementById('signup-name').value,
                email: document.getElementById('signup-email').value,
                password: document.getElementById('signup-password').value
            })
        });

        const data = await res.json();

        if (res.ok) {
            message.textContent = "Signup successful! Now login.";
            message.style.color = "green";

            signupBox.style.display = 'none';
            loginBox.style.display = 'block';
        } else {
            message.textContent = data.message || "Signup failed";
            message.style.color = "red";
        }

    } catch (err) {
        console.log(err);
        message.textContent = "Server error";
        message.style.color = "red";
    }
});


// ================= LOAD EXPENSES =================
async function loadExpenses() {

    try {
        const res = await fetch(`${BASE_URL}/expenses`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await res.json();

        const list = document.getElementById('list');
        const total = document.getElementById('total');
        const emptyMsg = document.getElementById('empty-msg');

        list.innerHTML = "";
        let sum = 0;

        if (!Array.isArray(data) || data.length === 0) {
            emptyMsg.style.display = "block";
            total.textContent = 0;
            return;
        }

        emptyMsg.style.display = "none";

        data.forEach(exp => {
            sum += Number(exp.amount);

            const li = document.createElement('li');
            li.innerHTML = `
                ${exp.description} - ₦${exp.amount}
                <button data-id="${exp._id}" class="delete-btn">X</button>
            `;

            list.appendChild(li);
        });

        total.textContent = sum;

    } catch (err) {
        console.log(err);
    }
}


// ================= DELETE =================
document.addEventListener("click", async (e) => {
    if (!e.target.classList.contains("delete-btn")) return;

    const id = e.target.getAttribute("data-id");

    try {
        const res = await fetch(`${BASE_URL}/expenses/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await res.json();

        if (res.ok) {
            message.textContent = "Deleted successfully";
            message.style.color = "green";

            e.target.parentElement.remove();
            loadExpenses();
        } else {
            message.textContent = data.message || "Delete failed";
            message.style.color = "red";
        }

    } catch (err) {
        console.log(err);
        message.textContent = "Server error";
        message.style.color = "red";
    }

    setTimeout(() => {
        message.textContent = "";
    }, 2000);
});


// ================= ADD EXPENSE =================
form && (form.onsubmit = async (e) => {
    e.preventDefault();

    try {
        const res = await fetch(`${BASE_URL}/expenses`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                description: document.getElementById('desc').value,
                amount: document.getElementById('amount').value,
                category: document.getElementById('category').value
            })
        });

        const data = await res.json();

        if (res.ok) {
            message.textContent = "Expense added!";
            message.style.color = "green";

            form.reset();
            loadExpenses();
        } else {
            message.textContent = data.message || "Failed to add expense";
            message.style.color = "red";
        }

    } catch (err) {
        console.log(err);
        message.textContent = "Server error";
        message.style.color = "red";
    }
});


// ================= LOGOUT =================
logoutBtn && (logoutBtn.onclick = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('name'); // 🔥 important
    token = null;
    checkAuth();
});


checkAuth();

});