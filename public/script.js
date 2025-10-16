const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const captureBtn = document.getElementById("capture");
const sendBtn = document.getElementById("send");
const statusEl = document.getElementById("status");
const context = canvas.getContext("2d");
let capturedImage = null;

navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        video.srcObject = stream;
        statusEl.innerHTML = "🎉 Camera ready! Capture your Diwali moments! 🎉";
    })
    .catch(err => {
        statusEl.innerHTML = "❌ Camera access denied: " + err.message;
        statusEl.style.color = "#e74c3c";
    });

captureBtn.addEventListener("click", () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);
    capturedImage = canvas.toDataURL("image/jpeg");
    
    captureBtn.style.transform = "scale(0.95)";
    setTimeout(() => captureBtn.style.transform = "scale(1)", 150);
    
    statusEl.innerHTML = "📸 Beautiful! Photo captured successfully! ✨";
    statusEl.style.color = "#27ae60";
    canvas.style.display = "block";
});

sendBtn.addEventListener("click", async () => {
    if (!capturedImage) {
        statusEl.innerHTML = "⚠️ Please capture a photo first! 📷";
        statusEl.style.color = "#f39c12";
        return;
    }
    
    statusEl.innerHTML = "🚀 Sending your Diwali photo... ✨";
    statusEl.style.color = "#3498db";
    sendBtn.disabled = true;
    sendBtn.innerHTML = "📤 Sending...";
    
    try {
        const res = await fetch("/send-mail", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: capturedImage }),
        });
        const data = await res.json();
        
        if (res.ok) {
            statusEl.innerHTML = "🎊 Email sent successfully! Happy Diwali! 🎊";
            statusEl.style.color = "#27ae60";
        } else {
            statusEl.innerHTML = "❌ Failed to send email: " + data.message;
            statusEl.style.color = "#e74c3c";
        }
    } catch (error) {
        statusEl.innerHTML = "❌ Network error. Please try again!";
        statusEl.style.color = "#e74c3c";
    } finally {
        sendBtn.disabled = false;
        sendBtn.innerHTML = "✨ Send to Email ✨";
    }
});

canvas.style.display = "none";