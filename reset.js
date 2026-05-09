const BASE_URL =
"https://expense-tracker-backend-1-afoj.onrender.com/api";

const form =
document.getElementById("reset-form");

const message =
document.getElementById("reset-message");
const params =
new URLSearchParams(window.location.search);

const token =
params.get("token");
if (!token) {

    message.textContent =
    "Invalid reset link";

    message.style.color =
    "red";

} else {

    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        const password =
        document.getElementById("new-password").value;

        if(password.length < 6){

            message.textContent =
            "Password must be at least 6 characters";

            message.style.color =
            "red";

            return;
        }

        try {

            const res = await fetch(
                `${BASE_URL}/auth/reset-password/${token}`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        password
                    })
                }
            );

            const data = await res.json();

            if(res.ok){

                message.textContent =
                "Password reset successful";

                message.style.color =
                "green";

                setTimeout(() => {
                    window.location.href = "/";

                }, 2000);

            } else {
                message.textContent =
                data.message || "Reset failed";

                message.style.color =
                "red";
            }

        } catch(err){

            console.log(err);

            message.textContent =
            "Server error";

            message.style.color =
            "red";
        }
    });
}