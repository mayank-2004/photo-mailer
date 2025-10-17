const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const captureBtn = document.getElementById("capture");
const endSessionBtn = document.getElementById("endSession");
const statusEl = document.getElementById("status");
const photoCountEl = document.getElementById("photoCount");
const context = canvas.getContext("2d");
let capturedPhotos = [];
let userEmails = new Set();
let cameraStream = null;

navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        cameraStream = stream;
        video.srcObject = stream;
        statusEl.innerHTML = "🎉 Camera ready! Capture your Diwali moments! 🎉";
    })
    .catch(err => {
        statusEl.innerHTML = "❌ Camera access denied: " + err.message;
        statusEl.style.color = "#e74c3c";
    });

captureBtn.addEventListener("click", () => {
    const email = prompt("📧 Enter your email to receive the Google Drive link:");
    if (!email || !email.includes('@')) {
        statusEl.innerHTML = "⚠️ Please enter a valid email address!";
        statusEl.style.color = "#f39c12";
        return;
    }
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);
    const photoData = canvas.toDataURL("image/jpeg");
    
    capturedPhotos.push({
        data: photoData,
        email: email,
        timestamp: new Date().toISOString()
    });
    userEmails.add(email);
    
    captureBtn.style.transform = "scale(0.95)";
    setTimeout(() => captureBtn.style.transform = "scale(1)", 150);
    
    photoCountEl.textContent = `Photos captured: ${capturedPhotos.length}`;
    statusEl.innerHTML = `📸 Photo ${capturedPhotos.length} captured! Email: ${email} ✨`;
    statusEl.style.color = "#27ae60";
    canvas.style.display = "block";
});

endSessionBtn.addEventListener("click", async () => {
    if (capturedPhotos.length === 0) {
        statusEl.innerHTML = "⚠️ No photos captured yet! Take some photos first! 📷";
        statusEl.style.color = "#f39c12";
        return;
    }
    
    // Stop camera
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        video.srcObject = null;
    }
    
    statusEl.innerHTML = "🚀 Ending session and creating Google Drive link... ✨";
    statusEl.style.color = "#3498db";
    endSessionBtn.disabled = true;
    endSessionBtn.innerHTML = "📤 Processing...";
    captureBtn.disabled = true;
    
    try {
        const res = await fetch("/end-session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                photos: capturedPhotos,
                emails: Array.from(userEmails)
            }),
        });
        const data = await res.json();
        
        if (res.ok) {
            statusEl.innerHTML = `🎊 Session ended! Google Drive link sent to ${userEmails.size} participants! 🎊`;
            statusEl.style.color = "#27ae60";
            
            // Reset for new session
            setTimeout(() => {
                if (confirm('Start a new photo capture session?')) {
                    location.reload();
                }
            }, 3000);
        } else {
            statusEl.innerHTML = "❌ Failed to end session: " + data.message;
            statusEl.style.color = "#e74c3c";
        }
    } catch (error) {
        statusEl.innerHTML = "❌ Network error. Please try again!";
        statusEl.style.color = "#e74c3c";
    } finally {
        endSessionBtn.disabled = false;
        endSessionBtn.innerHTML = "🔚 End Photo Capture Moment";
        captureBtn.disabled = false;
    }
});

canvas.style.display = "none";

// Update photo counter display
photoCountEl.textContent = "Photos captured: 0";