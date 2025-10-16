const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const captureBtn = document.getElementById("capture");
const sendBtn = document.getElementById("send");
const statusEl = document.getElementById("status");
const context = canvas.getContext("2d");
let capturedImage = null;
navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => video.srcObject = stream)
    .catch(err => alert("Camera access denied: " + err.message));
captureBtn.addEventListener("click", () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);
    capturedImage = canvas.toDataURL("image/jpeg");
    statusEl.innerText = "Image captured!";
});
sendBtn.addEventListener("click", async () => {
    if (!capturedImage) return alert("Please capture an image first!");
    statusEl.innerText = "Sending email...";
    const res = await fetch("/send-mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: capturedImage }),
    });
    const data = await res.json();
    statusEl.innerText = data.message;
});