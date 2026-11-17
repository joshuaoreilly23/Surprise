const canvas = document.getElementById("scene");
const ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = false;

const background = new Image();
background.src = "scene.png";

let width = 0;
let height = 0;

const rain = [];
const fog = [];
const particles = [];

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;

    ctx.imageSmoothingEnabled = false;

    createRain();
    createFog();
    createParticles();
}

function createRain() {
    rain.length = 0;

    const amount = Math.floor((width * height) / 1800);

    for (let i = 0; i < amount; i++) {
        rain.push({
            x: Math.random() * width,
            y: Math.random() * height,
            length: Math.random() * 16 + 9,
            speed: Math.random() * 9 + 12,
            drift: Math.random() * 1.5 + 0.8,
            opacity: Math.random() * 0.45 + 0.2
        });
    }
}

function createFog() {
    fog.length = 0;

    for (let i = 0; i < 10; i++) {
        fog.push({
            x: Math.random() * width,
            y: height * 0.48 + Math.random() * height * 0.35,
            size: Math.random() * 170 + 100,
            speed: Math.random() * 0.35 + 0.1,
            opacity: Math.random() * 0.025 + 0.01
        });
    }
}

function createParticles() {
    particles.length = 0;

    for (let i = 0; i < 25; i++) {
        particles.push({
            x: width * 0.45 + Math.random() * width * 0.5,
            y: height * 0.2 + Math.random() * height * 0.6,
            size: Math.random() * 2 + 1,
            speed: Math.random() * 0.25 + 0.08,
            opacity: Math.random() * 0.12 + 0.03
        });
    }
}

function drawBackground() {
    if (!background.complete || background.naturalWidth === 0) {
        ctx.fillStyle = "#080707";
        ctx.fillRect(0, 0, width, height);
        return;
    }

    const imageWidth = background.naturalWidth;
    const imageHeight = background.naturalHeight;

    const scale = Math.min(
        width / imageWidth,
        height / imageHeight
    );

    const drawWidth = imageWidth * scale;
    const drawHeight = imageHeight * scale;

    const offsetX = (width - drawWidth) / 2;
    const offsetY = (height - drawHeight) / 2;

    ctx.fillStyle = "#080707";

    ctx.fillRect(
        0,
        0,
        width,
        height
    );

    ctx.drawImage(
        background,
        Math.round(offsetX),
        Math.round(offsetY),
        Math.round(drawWidth),
        Math.round(drawHeight)
    );
}

function drawRain() {
    ctx.save();

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

        if (drop.y > height + 20) {
            drop.y = -20;
            drop.x = Math.random() * width;
        }

        if (drop.x < -20) {
            drop.x = width + 20;
        }
    }

    ctx.restore();
}

function drawFog(time) {
    ctx.save();

    for (const cloud of fog) {
        const movement =
            Math.sin(
                time * 0.0005 +
                cloud.x * 0.01
            ) * 25;

        const x = cloud.x + movement;

        const gradient = ctx.createRadialGradient(
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

        if (cloud.x - cloud.size > width) {
            cloud.x = -cloud.size;
        }
    }

    ctx.restore();
}

function drawLampGlow(time) {
    const flicker =
        0.96 +
        Math.sin(time * 0.002) * 0.025 +
        Math.sin(time * 0.006) * 0.012;

    const glow = ctx.createRadialGradient(
        width * 0.69,
        height * 0.43,
        5,
        width * 0.69,
        height * 0.43,
        width * 0.35
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
        0,
        0,
        width,
        height
    );
}

function drawParticles(time) {
    ctx.save();

    for (const particle of particles) {
        particle.y -= particle.speed;

        if (particle.y < height * 0.15) {
            particle.y = height * 0.8;
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

background.onload = () => {
    resize();
    requestAnimationFrame(animate);
};

resize();
