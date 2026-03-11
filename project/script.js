const video = document.getElementById('video');
const canvas = document.getElementById('overlay');
const ctx = canvas.getContext('2d');

let model;

async function setupCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }});
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

async function loadModel() {
    model = await cocoSsd.load();
}

function drawPersonBox(person) {
    const x = person.bbox[0];
    const y = person.bbox[1];
    const width = person.bbox[2];
    const height = person.bbox[3];

    // chenar
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, width, height);

    // linii catre iconite
    ctx.strokeStyle = '#00ffff';
    ctx.beginPath();
    ctx.moveTo(x + width / 2, y);
    ctx.lineTo(x - 50, y - 50); // spre icon1
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x + width / 2, y);
    ctx.lineTo(x + width + 50, y - 50); // spre icon2
    ctx.stroke();

    // iconite
    ctx.font = "30px Arial";
    ctx.fillText("💬", x - 70, y - 60);
    ctx.fillText("📷", x + width + 30, y - 60);
}

async function detectFrame() {
    const predictions = await model.detect(video);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    predictions.forEach(pred => {
        if (pred.class === 'person') {
            drawPersonBox(pred);
        }
    });

    requestAnimationFrame(detectFrame);
}

async function main() {
    await setupCamera();
    await loadModel();
    detectFrame();
}

main();