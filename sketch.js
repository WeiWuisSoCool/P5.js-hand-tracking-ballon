let handpose;
let video;
let predictions = [];
let balloons = []; // Array to represent multiple balloons
let wind = 0; // Horizontal movement due to wind

function setup() {
    createCanvas(640, 480);
    video = createCapture(VIDEO);
    video.size(width, height);
    video.hide();

    // Initialize the handpose model
    handpose = ml5.handpose(video, modelReady);
    handpose.on("predict", results => {
        predictions = results;
    });

    // Add initial balloons
    addRandomBalloons(5); // Start with 5 random balloons
}

function modelReady() {
    console.log("Model ready!");
}

function draw() {
    // Draw the mirrored video feed
    push();
    translate(width, 0); // Mirror the video horizontally
    scale(-1, 1);
    image(video, 0, 0, width, height);
    pop();

    // Check for interaction between the hand and the balloons
    checkHandInteraction();

    // Update and draw each balloon
    for (let balloon of balloons) {
        updateBalloon(balloon);
        drawBalloon(balloon);
    }

    // Occasionally add new balloons
    if (random(1) < 0.01 && balloons.length < 10) { // Limit to 10 balloons
        addRandomBalloons(1);
    }

    // Draw the hand keypoints
    drawKeypoints();
}

// Function to add random balloons
function addRandomBalloons(count) {
    for (let i = 0; i < count; i++) {
        balloons.push({
            x: random(100, width - 100), // Random x position
            y: random(-200, -50),       // Start above the canvas
            radius: random(30, 50),    // Random size
            speed: random(0.5, 2),     // Random downward speed
            sway: 0,                   // Horizontal sway
            handInteraction: false,    // Interaction state
            timer: 0                   // Timer for upward motion
        });
    }
}

// Function to update a balloon's position
function updateBalloon(balloon) {
    if (balloon.handInteraction) {
        balloon.y -= 3; // Move the balloon upward
        balloon.timer++;
        if (balloon.timer > 60) { // Stop interaction after 1 second
            balloon.handInteraction = false;
            balloon.timer = 0;
        }
    } else {
        balloon.y += balloon.speed; // Balloon descends normally
        balloon.y = constrain(balloon.y, 0, height + balloon.radius); // Reset when out of canvas
    }

    // Apply gentle horizontal sway
    balloon.sway = sin(frameCount * 0.05) * 20;

    // Reset the balloon to the top if it moves out of the canvas
    if (balloon.y > height + balloon.radius) {
        resetBalloon(balloon);
    }
}

// Function to reset a balloon to a random position at the top
function resetBalloon(balloon) {
    balloon.y = random(-200, -50); // Reset above the canvas
    balloon.x = random(100, width - 100); // Random horizontal position
    balloon.speed = random(0.5, 2); // Random downward speed
    balloon.radius = random(30, 50); // Random size
    balloon.handInteraction = false;
    balloon.timer = 0;
}

// Function to draw a single balloon
function drawBalloon(balloon) {
    push();
    translate(balloon.x + balloon.sway, balloon.y);
    textSize(balloon.radius * 2);
    textAlign(CENTER, CENTER);
    text('🎈', 0, 0);
    pop();
}

// Function to check if the hand is touching any balloon
function checkHandInteraction() {
    if (predictions.length > 0) {
        const prediction = predictions[0]; // Use the first detected hand
        for (let balloon of balloons) {
            for (let i = 0; i < prediction.landmarks.length; i++) {
                const keypoint = prediction.landmarks[i];
                const x = width - keypoint[0]; // Adjust for mirrored video feed
                const y = keypoint[1];
                const d = dist(x, y, balloon.x, balloon.y);
                if (d < balloon.radius) {
                    balloon.handInteraction = true; // Trigger interaction
                    break;
                }
            }
        }
    }
}

// A function to draw ellipses over the detected keypoints
function drawKeypoints() {
    if (predictions.length > 0) {
        const prediction = predictions[0];
        for (let i = 0; i < prediction.landmarks.length; i++) {
            const keypoint = prediction.landmarks[i];
            const x = width - keypoint[0]; // Adjust for mirrored video feed
            const y = keypoint[1];

            fill(0, 255, 0);
            noStroke();
            ellipse(x, y, 10, 10);
        }
    }
}
