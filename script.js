const canvas = document.getElementById("scene");
const ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = false;

const background = new Image();
background.src = "scene.png";

let width = 0;
let height = 0;

let imageX = 0;
let imageY = 0;
let imageWidth = 0;
let imageHeight = 0;

const rain = [];
const fog = [];
const particles = [];

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;

    const dpr = Math.min(
        window.devicePixelRatio || 1,
        2
    );

    canvas.width =
        Math.floor(width * dpr);

    canvas.height =
        Math.floor(height * dpr);

    canvas.style.width =
        width + "px";

    canvas.style.height =
        height + "px";

    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );

    ctx.imageSmoothingEnabled = false;

    calculateImageSize();

    createRain();
    createFog();
    createParticles();
}

function calculateImageSize() {
    if (
        !background.complete ||
        background.naturalWidth === 0
    ) {
        return;
    }

    const imageRatio =
        background.naturalWidth /
        background.naturalHeight;

    const screenRatio =
        width / height;

    let scale;

    if (screenRatio > imageRatio) {
        scale =
            height /
            background.naturalHeight;
    } else {
        scale =
            width /
            background.naturalWidth;
    }

    imageWidth =
        background.naturalWidth * scale;

    imageHeight =
        background.naturalHeight * scale;

    imageX =
        (width - imageWidth) / 2;

    imageY =
        (height - imageHeight) / 2;
}

function createRain() {
    rain.length = 0;

    const amount =
        Math.floor(
            (imageWidth * imageHeight) / 1800
        );

    for (let i = 0; i < amount; i++) {
        rain.push({
            x:
                imageX +
                Math.random() * imageWidth,

            y:
                imageY +
                Math.random() * imageHeight,

            length:
                Math.random() * 16 + 9,

            speed:
                Math.random() * 9 + 12,

            drift:
                Math.random() * 1.5 + 0.8,

            opacity:
                Math.random() * 0.45 + 0.2
        });
    }
}

function createFog() {
    fog.length = 0;

    for (let i = 0; i < 10; i++) {
        fog.push({
            x:
                imageX +
                Math.random() * imageWidth,

            y:
                imageY +
                imageHeight * 0.48 +
                Math.random() *
                imageHeight *
                0.35,

            size:
                Math.random() * 170 + 100,

            speed:
                Math.random() * 0.35 + 0.1,

            opacity:
                Math.random() * 0.025 + 0.01
        });
    }
}

function createParticles() {
    particles.length = 0;

    for (let i = 0; i < 25; i++) {
        particles.push({
            x:
                imageX +
                imageWidth * 0.45 +
                Math.random() *
                imageWidth *
                0.5,

            y:
                imageY +
                imageHeight * 0.2 +
                Math.random() *
                imageHeight *
                0.6,

            size:
                Math.random() * 2 + 1,

            speed:
                Math.random() * 0.25 + 0.08,

            opacity:
                Math.random() * 0.12 + 0.03
        });
    }
}

function drawBackground() {
    ctx.fillStyle = "#080707";

    ctx.fillRect(
        0,
        0,
        width,
        height
    );

    if (
        !background.complete ||
        background.naturalWidth === 0
    ) {
        return;
    }

    ctx.drawImage(
        background,
        Math.round(imageX),
        Math.round(imageY),
        Math.round(imageWidth),
        Math.round(imageHeight)
    );
}

function beginSceneClip() {
    ctx.save();

    ctx.beginPath();

    ctx.rect(
        imageX,
        imageY,
        imageWidth,
        imageHeight
    );

    ctx.clip();
}

function drawRain() {
    beginSceneClip();

    for (const drop of rain) {
        ctx.beginPath();

        ctx.moveTo(
            Math.floor(drop.x),
            Math.floor(drop.y)
        );

        ctx.lineTo(
            Math.floor(drop.x - drop.drift),
            Math.floor(drop.y + drop.length)
        );

        ctx.strokeStyle =
            `rgba(200, 215, 220, ${drop.opacity})`;

        ctx.lineWidth = 1;

        ctx.stroke();

        drop.x -= drop.drift;
        drop.y += drop.speed;

        if (
            drop.y >
            imageY +
            imageHeight +
            20
        ) {
            drop.y =
                imageY - 20;

            drop.x =
                imageX +
                Math.random() *
                imageWidth;
        }

        if (
            drop.x <
            imageX - 20
        ) {
            drop.x =
                imageX +
                imageWidth +
                20;
        }
    }

    ctx.restore();
}

function drawFog(time) {
    beginSceneClip();

    for (const cloud of fog) {
        const movement =
            Math.sin(
                time * 0.0005 +
                cloud.x * 0.01
            ) * 25;

        const x =
            cloud.x +
            movement;

        const gradient =
            ctx.createRadialGradient(
                x,
                cloud.y,
                0,
                x,
                cloud.y,
                cloud.size
            );

        gradient.addColorStop(
            0,
            `rgba(150, 145, 140, ${cloud.opacity})`
        );

        gradient.addColorStop(
            0.5,
            `rgba(120, 120, 115, ${cloud.opacity * 0.4})`
        );

        gradient.addColorStop(
            1,
            "rgba(100, 100, 100, 0)"
        );

        ctx.fillStyle = gradient;

        ctx.beginPath();

        ctx.arc(
            x,
            cloud.y,
            cloud.size,
            0,
            Math.PI * 2
        );

        ctx.fill();

        cloud.x += cloud.speed;

        if (
            cloud.x - cloud.size >
            imageX + imageWidth
        ) {
            cloud.x =
                imageX -
                cloud.size;
        }
    }

    ctx.restore();
}

function drawLampGlow(time) {
    beginSceneClip();

    const flicker =
        0.96 +
        Math.sin(time * 0.002) * 0.025 +
        Math.sin(time * 0.006) * 0.012;

    const glow =
        ctx.createRadialGradient(
            imageX + imageWidth * 0.69,
            imageY + imageHeight * 0.43,
            5,
            imageX + imageWidth * 0.69,
            imageY + imageHeight * 0.43,
            imageWidth * 0.35
        );

    glow.addColorStop(
        0,
        `rgba(255, 145, 45, ${0.045 * flicker})`
    );

    glow.addColorStop(
        0.35,
        `rgba(255, 120, 35, ${0.02 * flicker})`
    );

    glow.addColorStop(
        1,
        "rgba(255, 80, 20, 0)"
    );

    ctx.fillStyle = glow;

    ctx.fillRect(
        imageX,
        imageY,
        imageWidth,
        imageHeight
    );

    ctx.restore();
}

function drawParticles(time) {
    beginSceneClip();

    for (const particle of particles) {
        particle.y -= particle.speed;

        if (
            particle.y <
            imageY +
            imageHeight * 0.15
        ) {
            particle.y =
                imageY +
                imageHeight * 0.8;
        }

        const pulse =
            particle.opacity +
            Math.sin(
                time * 0.002 +
                particle.x
            ) * 0.02;

        ctx.fillStyle =
            `rgba(255, 150, 70, ${Math.max(0, pulse)})`;

        ctx.fillRect(
            Math.floor(particle.x),
            Math.floor(particle.y),
            particle.size,
            particle.size
        );
    }

    ctx.restore();
}

function animate(time) {
    ctx.clearRect(
        0,
        0,
        width,
        height
    );

    drawBackground();

    drawLampGlow(time);

    drawFog(time);

    drawParticles(time);

    drawRain();

    requestAnimationFrame(animate);
}

window.addEventListener(
    "resize",
    resize
);

if (window.visualViewport) {
    window.visualViewport.addEventListener(
        "resize",
        resize
    );
}

background.onload = () => {
    resize();

    requestAnimationFrame(
        animate
    );
};

resize();
