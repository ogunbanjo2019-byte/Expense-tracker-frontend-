const authContainer = document.getElementById('auth-container');
const appContainer = document.getElementById('app');

const loginBox = document.getElementById('login-box');
const signupBox = document.getElementById('signup-box');

const showSignup = document.getElementById('show-signup');
const showLogin = document.getElementById('show-login');

const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');

const logoutBtn = document.getElementById('logout-btn');

const form = document.getElementById('form');
const list = document.getElementById('list');
const total = document.getElementById('total');

const desc = document.getElementById('desc');
const amount = document.getElementById('amount');
const category = document.getElementById('category');

const BASE_URL = "https://my-expenses-tracker-9uhz.onrender.com/api";

let token = localStorage.getItem('token');
showSignup.onclick = (e) => {
    e.preventDefault();
    loginBox.style.display = "none";
    signupBox.style.display = "block";
};

showLogin.onclick = (e) => {
    e.preventDefault();
    signupBox.style.display = "none";
    loginBox.style.display = "block";
};

function checkAuth() {
    if (token) {
        authContainer.style.display = "none";
        appContainer.style.display = "block";
        getExpenses();
    } else {
        authContainer.style.display = "block";
        appContainer.style.display = "none";
    }
}

loginForm.onsubmit = async (e) => {
    e.preventDefault();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const res = await fetch(`${BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (res.ok) {
            token = data.token;
            localStorage.setItem("token", token);
            checkAuth();
        } else {
            alert(data.message);
        }

    } catch (err) {
        alert("Server waking up, try again...");
    }
};

signupForm.onsubmit = async (e) => {
    e.preventDefault();

    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    try {
        const res = await fetch(`${BASE_URL}/auth/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password })
        });

        const data = await res.json();

        if (res.ok) {
            alert("Signup successful! Login now.");
            signupBox.style.display = "none";
            loginBox.style.display = "block";
        } else {
            alert(data.message);
        }

    } catch {
        alert("Server waking up...");
    }
};

logoutBtn.onclick = () => {
    localStorage.removeItem("token");
    token = null;
    checkAuth();
};

async function getExpenses() {
    const res = await fetch(`${BASE_URL}/expenses`, {
        headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();

    list.innerHTML = "";
    let sum = 0;

    data.forEach(exp => {
        const li = document.createElement("li");
        li.innerHTML = `${exp.description} - ₦${exp.amount}`;
        list.appendChild(li);
        sum += exp.amount;
    });

    total.innerText = sum;
}

form.onsubmit = async (e) => {
    e.preventDefault();

    await fetch(`${BASE_URL}/expenses`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
            description: desc.value,
            amount: amount.value,
            category: category.value
        })
    });

    form.reset();
    getExpenses();
};

checkAuth();