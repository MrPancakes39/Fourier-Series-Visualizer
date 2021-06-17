let speed;
let cx, cy;
let A, t, n;
let wave = [];
let waveAmp = [];
let wavePhase = [];

// Colors used for the circles.
let colors = {
    red: "#c74440",
    blue: "#2d70b3",
    yellow: "#cc9900",
    green: "#388c46",
    purple: "#6042a6",
    orange: "#fa7e19",
    black: "#000000"
}
let colorsList = Object.values(colors);

// The preset fourier series curves with their equations.
let eq = $("#eq");
let options = $("#presets");
let presets = {
    "square": ["( 4*A ) / ( (2*k+1) * PI )", "(2*k+1)", "0"],
    "sawtooth": ["( 2*A ) / ( (k+1) * PI )", "(k+1) * PI", "0"],
    "triangle": ["( 8*A ) / ( pow((2*k+1), 2) * pow(PI, 2) )", "(2*k+1)", "HALF_PI"]
};
let eqs = {
    "square": ["\\(\\sum_{k=0}^{\\infty}\\frac{4A}{(2k+1)\\pi}\\sin((2k+1)t)\\)"],
    "sawtooth": ["\\(\\sum_{k=0}^{\\infty}\\frac{2A}{(k+1)\\pi}\\sin((k+1)\\pi t)\\)"],
    "triangle": ["\\(\\sum_{k=0}^{\\infty}\\frac{8A}{(2k+1)^2 \\pi^2}\\cos((2k+1)t)\\)"],
};
let customParms;
let customOption = false;
let currentOption = options.val();
eq.text(eqs[currentOption]);

function setup() {
    width = 0.9 * windowWidth;
    let canvas = createCanvas(width, 400);
    canvas.parent("#sketch-holder");

    makeSliders();
    eventHandlers();

    $("#view-2").css("left", $("#wrapper").width()).css("display", "flex");
    $("#switch-container").data("toggleNumber", false);

    // Initializes some values.
    t = 0;
    cx = 300;
    cy = height / 2;
}

function draw() {
    background(218);

    // Updates values based on sliders.
    n = termsSlider.value();
    A = radiusSlider.value();
    speed = speedSlider.value() / (5 * TWO_PI);
    numTerms.html(`Number of Terms: ${n}`);
    offset = 2 * A + 100;

    // Translate to center circle.
    translate(cx, cy);

    // Creates the sum.
    let x = 0,
        y = 0;
    waveAmp = [];
    wavePhase = [];
    for (let k = 0; k < n; k++) {
        let prevx = x;
        let prevy = y;

        let amp, freq, phase;
        if (customOption) {
            try {
                amp = eval(customParms.amp);
                freq = eval(customParms.freq);
                phase = eval(customParms.phase);
            } catch (e) {
                console.error(e);
                alert("Something went wrong. Try again.");
                noLoop();
            }
        } else {
            amp = eval(presets[currentOption][0]);
            freq = eval(presets[currentOption][1]);
            phase = eval(presets[currentOption][2]);
        }

        waveAmp[k] = amp;
        wavePhase[k] = phase;
        x += amp * cos(freq * t + phase);
        y += amp * sin(freq * t + phase);

        // Pickes the color for the circles.
        stroke(colorsList[k % colorsList.length]);

        // draws the circles.
        push();
        noFill();
        strokeWeight(2);
        ellipseMode(RADIUS);
        circle(prevx, prevy, amp);
        pop();

        // draws the lines.
        push();
        strokeWeight(3);
        line(prevx, prevy, x, y);
        pop();

        // draws the final circle.
        if (k == n - 1) {
            push();
            fill(0);
            noStroke();
            circle(x, y, 8);
            pop();
        }
    }
    // appends the y value to list.
    wave.unshift(y);
    if (wave.length > 1200) {
        wave.pop(); // wave's max size is 1200.
    }

    // draws the wave.
    push();
    noFill();
    beginShape();
    for (let i = 0; i < wave.length; i++) {
        vertex(i + offset, wave[i]);
    }
    endShape();
    pop();

    // Draws the line connecting point with wave.
    stroke(0);
    line(x, y, offset, wave[0]);

    t -= speed;
}

function eventHandlers() {
    $("#set-preset").click(() => {
        if (currentOption != options.val() || customOption) {
            wave = [];
            resetSliders();
            customOption = false;
            currentOption = options.val();
            eq.text(eqs[currentOption]);
            MathJax.typeset();
        }
    });

    let form = document.querySelector("#custom-curves");
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        const amp = formData.get("amp");
        const freq = formData.get("freq");
        const phase = formData.get("phase");

        customParms = {
            amp,
            freq,
            phase
        };

        loop();
        wave = [];
        resetSliders();
        customOption = true;
        eq.text("\\(\\sum_{k=0}^{\\infty}Amp*\\sin(f*t+\\phi)\\)");
        MathJax.typeset();
    })

    let playBtn = $("#play");
    playBtn.click(() => {
        if (playBtn.hasClass(".active")) {
            loop();
            playBtn.text("Pause");
        } else {
            noLoop();
            playBtn.text("Play");
        }
        playBtn.toggleClass(".active");
    });

    $("#reset").click(resetSliders);

    $("#right-arrow").click(() => {
        $("#view-1").animate({ "left": -$("#wrapper").width() });
        $("#view-2").animate({ "left": 0 });
    });

    $("#left-arrow").click(() => {
        $("#view-2").animate({ "left": $("#wrapper").width() });
        $("#view-1").animate({ "left": 0 });
    });

    $("#switch-container").click(switchTabs);
}

function makeSliders() {
    numTerms = createP("Number of Terms:");
    termsSlider = createSlider(1, 100, 1, 1);
    numTerms.parent("#n_terms");
    termsSlider.parent("#n_terms");
    termsSlider.style("width", "100%");

    createP("Radius of Circle:").parent("#c_radius");
    radiusSlider = createSlider(50, 150, 100, 1);
    radiusSlider.parent("#c_radius");

    createP("Speed:").parent("#c_speed");
    speedSlider = createSlider(0.5, 5, 1, 0.1);
    speedSlider.parent("#c_speed");
}

function resetSliders() {
    termsSlider.value(1);
    radiusSlider.value(100);
    speedSlider.value(1);
}

let ampSketch = new p5((p) => {
    p.setup = function() {
        width = 0.9 * windowWidth;
        let canvas = p.createCanvas(width, 300);
        canvas.parent("#amp-sketch");
        canvas.style("margin-bottom", "1.5rem");
    };

    p.draw = function() {
        p.background(218);
        p.translate(20, 280);

        // Draws the axis
        p.push();
        p.line(0, 0, p.width - 35, 0);
        p.line(0, 0, 0, -270);
        p.fill(0);
        p.triangle(-10, -250, 0, -270, 10, -250);
        p.triangle(p.width - 55, 10, p.width - 35, 0, p.width - 55, -10);
        p.pop();

        // Draw The Amplitudes.
        p.push();
        p.strokeWeight(4);
        p.stroke(colors.blue);
        for (let i = 0; i < waveAmp.length; i++) {
            let x = p.map(i, 0, waveAmp.length, 0, p.width - 60);
            p.push();
            if (waveAmp[i] < 0) {
                waveAmp[i] *= -1;
                p.stroke(colors.red);
            }
            p.line(x + 10, 0, x + 10, -waveAmp[i]);
            p.pop();
        }
        p.pop();

        p.push();
        p.textSize(18);
        let str = "Note: This is the Amp = 2|Cn|";
        p.text(str, p.width - 10 * str.length, -260);
        p.pop();
    };
});

let phaseSketch = new p5((p) => {
    p.setup = function() {
        width = 0.9 * windowWidth;
        let canvas = p.createCanvas(width, 300);
        canvas.parent("#phase-sketch");
    };

    p.draw = function() {
        p.background(218);
        p.translate(30, 280);

        // Draws the axis
        p.push();
        p.line(0, 0, p.width - 35, 0);
        p.line(0, 0, 0, -270);
        p.fill(0);
        p.triangle(-10, -250, 0, -270, 10, -250);
        p.triangle(p.width - 55, 10, p.width - 35, 0, p.width - 55, -10);
        p.pop();

        // Draw The Scale
        p.push();
        p.line(0, -60, 5, -60);
        p.line(0, -120, 5, -120);
        p.line(0, -180, 5, -180);
        p.line(0, -240, 5, -240);

        p.textSize(18);
        p.text("π", -20, -65);
        p.text("_\n2", -20, -62);
        p.text("π", -20, -115);
        p.text("3", -25, -185);
        p.text("π", -13, -173);
        p.text("_\n2", -25, -182);
        p.text("2π", -25, -230);
        p.pop();

        // Draw The Phase Differences.
        p.push();
        p.strokeWeight(4);
        p.stroke(colors.blue);
        for (let i = 0; i < wavePhase.length; i++) {
            let x = p.map(i, 0, wavePhase.length, 0, p.width - 60);
            let y = p.map(wavePhase[i], 0, p.TWO_PI, 0, -240);
            p.line(x + 10, 0, x + 10, y);
        }
        p.pop();
    };
});

function switchTabs() {
    let toggleContainer = $("#toggle-container");
    let toggleNumber = $(this).data("toggleNumber");

    toggleNumber = !toggleNumber;
    $(this).data("toggleNumber", toggleNumber);

    let fseries = $("#wrapper");
    let ftransform = $("#ftransform");

    if (toggleNumber) {
        toggleContainer.css("clipPath", "inset(0 0 0 50%)");
        toggleContainer.css("backgroundColor", "dodgerblue");

        fseries.hide();
        ftransform.show();

        noLoop();
        ampSketch.noLoop();
        phaseSketch.noLoop();
    } else {
        toggleContainer.css("clipPath", "inset(0 50% 0 0)");
        toggleContainer.css("backgroundColor", "dodgerblue");

        fseries.show();
        ftransform.hide();

        loop();
        ampSketch.loop();
        phaseSketch.loop();
    }
}