const video = document.getElementById('video');
const canvas = document.getElementById('overlay');
const ctx = canvas.getContext('2d');

// Iconițe și offset față
const icons = [
    { emoji: "💬", dx: -50, dy: -50 },
    { emoji: "📷", dx: 50, dy: -50 },
    { emoji: "📍", dx: -50, dy: 50 },
    { emoji: "❤️", dx: 50, dy: 50 },
];

async function setupCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // camera spate
    });
    video.srcObject = stream;
    return new Promise(resolve => {
        video.onloadedmetadata = () => {
            video.play();
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            resolve();
        };
    });
}

async function main() {
    await setupCamera();

    const faceDetection = new FaceDetection({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}` });
    faceDetection.setOptions({
        model: 'short',
        minDetectionConfidence: 0.5
    });

    faceDetection.onResults(results => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        results.detections.forEach(detection => {
            const box = detection.boundingBox;
            const x = box.xCenter - box.width / 2;
            const y = box.yCenter - box.height / 2;
            const width = box.width;
            const height = box.height;

            // chenar
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 3;
            ctx.strokeRect(x, y, width, height);

            const cx = x + width / 2;
            const cy = y + height / 2;

            // iconițe + linii animate
            icons.forEach(icon => {
                const targetX = cx + icon.dx;
                const targetY = cy + icon.dy;

                ctx.strokeStyle = '#0ff';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(cx, cy);
                ctx.lineTo(targetX, targetY);
                ctx.stroke();

                ctx.font = "30px Arial";
                ctx.fillText(icon.emoji, targetX - 15, targetY + 10);
            });
        });
    });

    const cameraMP = new Camera(video, {
        onFrame: async () => { await faceDetection.send({ image: video }); },
        width: 1280,
        height: 720
    });
    cameraMP.start();
}

main();