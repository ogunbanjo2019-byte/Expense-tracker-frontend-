document.getElementById('reset-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const password = document.getElementById('new-password').value;
    const messageElement = document.getElementById('reset-message');
    const submitButton = e.target.querySelector('button');

    // 1. Parse the token from the address bar parameter (?token=...)
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) {
        messageElement.style.color = "red";
        messageElement.innerText = "Error: Invalid or missing reset token.";
        return;
    }

    // Disable button to prevent double submissions
    submitButton.disabled = true;
    messageElement.style.color = "#333";
    messageElement.innerText = "Updating password...";

    try {
        // 2. Point this directly to your live Render backend URL
        const res = await fetch(`https://expense-tracker-backend-1-afoj.onrender.com/api/auth/reset-password/${token}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ password })
        });

        const data = await res.json();

        if (res.ok) {
            messageElement.style.color = "green";
            messageElement.innerText = "Password reset successful! Redirecting to login...";
            
            // 3. Send them back to your main application login page after 3 seconds
            setTimeout(() => {
                window.location.href = "https://expense-tracker.vercel.app/";
            }, 3000);
        } else {
            messageElement.style.color = "red";
            messageElement.innerText = data.message || "Failed to reset password.";
            submitButton.disabled = false;
        }

    } catch (err) {
        console.error(err);
        messageElement.style.color = "red";
        messageElement.innerText = "Server error. Please try again later.";
        submitButton.disabled = false;
    }
});