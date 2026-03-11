const video = document.getElementById('video');
const canvas = document.getElementById('overlay');
const ctx = canvas.getContext('2d');

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

// Iconițe și offset-uri relative la față
const icons = [
    { emoji: "💬", dx: -50, dy: -50 },
    { emoji: "📷", dx: 50, dy: -50 },
    { emoji: "📍", dx: -50, dy: 50 },
    { emoji: "❤️", dx: 50, dy: 50 },
];

async function main() {
    await setupCamera();

    const model = await faceLandmarksDetection.load(
        faceLandmarksDetection.SupportedPackages.mediapipeFacemesh
    );

    async function detectFrame() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const predictions = await model.estimateFaces({ input: video });

        predictions.forEach(face => {
            // bounding box față
            const start = face.boundingBox.topLeft;
            const end = face.boundingBox.bottomRight;
            const x = start[0], y = start[1];
            const width = end[0] - start[0];
            const height = end[1] - start[1];

            // chenar
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 3;
            ctx.strokeRect(x, y, width, height);

            // centru față
            const cx = x + width / 2;
            const cy = y + height / 2;

            // iconițe
            icons.forEach(icon => {
                const targetX = cx + icon.dx;
                const targetY = cy + icon.dy;

                // linie
                ctx.strokeStyle = '#0ff';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(cx, cy);
                ctx.lineTo(targetX, targetY);
                ctx.stroke();

                // icon
                ctx.font = "30px Arial";
                ctx.fillText(icon.emoji, targetX - 15, targetY + 10);
            });
        });

        requestAnimationFrame(detectFrame);
    }

    detectFrame();
}

main();