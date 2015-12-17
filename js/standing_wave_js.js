// Author:       Shane Eckenrode (sue2@psu.edu)
// Description:   Main script for the interactive Standing Wave Model
// Developed for The Pennsylvania State University Chemistry Department

/**************************
 Data Dictionary
 **************************/
var PTS = 180;                  // the number of points in the wave. 360 IS TOO MANY!

var UPDATE = Math.PI/16;        // phase angle update per animation frame (radians)
var wave = [PTS];               // real y-values for each point in the incident wave
var wave1 = [PTS];              // real y-values for each point in the reflected wave
var cyclesI = 0.5;              // the frequency of the incident wave (cycles / panel width)
var cyclesR = 0.5;              // the frequency of the reflected wave (cycles / panel width)
var phiI = 0;                   // phase angle of the incident wave (radians)
var phiR = 0;                   // phase angle of the reflected wave (radians)
var w = [PTS];                  // y-coordinates for drawing each point in the incident wave
var w1 = [PTS];                 // y-coordinates for drawing each point in the reflected wave
var amplitude1 = 85;            // amplitude of the incident wave (% of 1/4 panel height) DEFAULT AMP => 85(%)
var amplitude2 = 85;            // amplitude of the reflected wave (% of 1/4 panel height) DEFAULT AMP => 85(%)
var defaultAmp = 85;            // the default % for amplitude of the incident and reflected waves
var self_destruct = false;      // flag for if wave should self destruct
var step;                       // increment in x-coordinate per wave point (pixels)
var dy;                         // width of drawing panel (pixels)
var dx;                         // height of drawing panel (pixels)
var mid_x;                      // midpoint of drawing panel width
var mid_y;                      // midpoint of drawing panel height
var IS = false;                  // flag for if the incident wave is visible
var RS = false;                  // flag for if the reflected wave is visible
var SS = true;                  // flag for if the standing wave is visible

var isWhite = false;            //boolean to determine the canvas background color.
var timer;                      //variable that holds the custom timer for timeout settings.
var animate = true;
var frames = 25;

/**************************
 Functions
 **************************/

$(document).ready(function() {
    loadWaveCanvas();
    loadHarmonicSlider();
    animateLoop();
});

function loadWaveCanvas(){
    var bgCanvas = document.getElementById("bgCanvas");
    var ctx = bgCanvas.getContext("2d");
    var centerX = bgCanvas.width / 2;
    var centerY = bgCanvas.height / 2;
    var bgButton = document.getElementById("bgColor");

    //Setup parameters for canvas drawing
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgb(97,173,62)";

    //Sets the background color for the canvas.
    bgButton.onclick = function() {
        if (isWhite) {
            ctx.fillStyle = "black";
            isWhite = false;
        } else {
            ctx.fillStyle = "white";
            isWhite = true;
        }

        //Necessary for canvas update while animation is paused.
        loadWaveCanvas();
    };

    //Fills the background for the canvas.
    //ctx.moveTo(0,0);
    ctx.fillRect(0,0,bgCanvas.width,bgCanvas.height);
    ctx.fill();

    //Draws the vertical y-axis.
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, bgCanvas.height);
    ctx.stroke();
    ctx.closePath();

    //Draws the horizontal x-axis.
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(bgCanvas.width, centerY);
    ctx.stroke();
    ctx.closePath();
}

//Generates the wave points for the next frame of animation.
function generateWave(){
    // get the drawing area
    dy = $("#waveCanvas").height();
    dx = $("#waveCanvas").width();
    mid_y = dy / 2;
    mid_x = dx / 2;
    step = (dx / PTS);

    for (var i = 0; i < PTS; i++)
    {
        wave[i] = Math.sin((Math.PI / 90) * i * cyclesI + phiI);
        wave1[i] = Math.sin((Math.PI / 90) * i * cyclesR - phiR);
    }

    for (var j = 0; j < PTS; j++)
    {
        w[j] = (wave[j] * (amplitude1 / 400.0) * dy + dy / 2);
        w1[j] = (wave1[j] * (amplitude2 / 400.0) * dy + dy / 2);
    }

    if (self_destruct)
    {
        if (amplitude1 > 0)
        {
            amplitude1 = Math.floor((amplitude1 - 1));
        }
        else if (amplitude2 > 0)
        {
            amplitude2 = Math.floor((amplitude2 - 1 ));
        }
    }
}

//Draws the current wave frame to the canvas.
function drawWave(){
    var waveCanvas = document.getElementById("waveCanvas");
    var ctx = waveCanvas.getContext("2d");

    for (var i = 1; i < PTS; i++)
    {
        var x1 = ((i - 1) * step);
        var x2 = (i * step);
        var y1 = w[i - 1];
        var y2 = w[i];
        var y3 = w1[i - 1];
        var y4 = w1[i];

        if (IS)
        {
            ctx.strokeStyle = "rgb(9,14,233)"; //Bright Blue
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.closePath();
            ctx.stroke();
        }
        if (RS)
        {
            ctx.strokeStyle = "rgb(9,233,41)"; //Bright Green
            ctx.beginPath();
            ctx.moveTo(x1, y3);
            ctx.lineTo(x2, y4);
            ctx.closePath();
            ctx.stroke();
        }
        if (SS)
        {
            ctx.strokeStyle = "rgb(233,162,9)"; //Bright Orange
            ctx.beginPath();
            ctx.moveTo(x1, y1 + y3 - dy / 2);
            ctx.lineTo(x2, y2 + y4 - dy / 2);
            ctx.closePath();
            ctx.stroke();
        }
    }
}

//Advances the animation frame. Calls the following methods which clear the canvas, redraws the canvas background,
//  generates the next frame of animation for the wave, and draws that frame.
function advanceAnimation(isAnimating){
    if(isAnimating){
        clearCanvas();
        loadWaveCanvas();
        generateWave();
        phiI += UPDATE;
        phiR += UPDATE;
        drawWave();
    }else{
        console.log("Not Animating Now.");
    }
}

//Clears the canvas for the next frame of animation.
function clearCanvas(){
    var waveCanvas = document.getElementById("waveCanvas");
    var ctx = waveCanvas.getContext("2d");

    ctx.clearRect(0, 0, waveCanvas.width, waveCanvas.height);
}

//Loop to control the calls for animating the standing wave.
function animateLoop(){
    timer = new Timer(animateLoop, frames);
    advanceAnimation(animate);
}

//This function is a custom timer that tracks the start time of a timeout and calculates the remaining time
// in order to resume at the appropriate frame of animation.
function Timer(callback, delay){
    var timerId, start, remaining = delay;

    this.pause = function(){
        window.clearTimeout(timerId);
        remaining -= new Date() - start;
        animate = false;
    };

    this.resume = function(){
        start = new Date();
        window.clearTimeout(timerId);
        timerId = window.setTimeout(callback, remaining);
        animate = true;
    };

    this.step = function(){
        timer.pause();
        animate = false;
        advanceAnimation(true);
    };

    this.resume();
}

////////////////////////////////////
// Setters

//Updates the wavelength on the wave depending on the slider value.
function updateWavelength(sliderValue){
    var harmonicSlider = $("#harmonicSlider");
    var sliderValue = harmonicSlider.slider("option", "value");
    var harmonicSnap = $("#harmonicSnap").is(":checked");

    //console.log("Slider value: " + sliderValue);
    //console.log("Checkbox: " + harmonicSnap);

    if (!harmonicSnap || sliderValue % 10 == 0){
        console.log("Checkbox: " + !harmonicSnap);
        var ifreq = sliderValue*0.1 / 2.0;
        var rfreq = sliderValue*0.1 / 2.0;
        updateFreq(ifreq, rfreq);

        if (sliderValue % 10 == 0){
            self_destruct = false;
        }else{
            self_destruct = true;
        }
    }

    //Calculates updated phase for wave and passes it to update animation
    var p1 = sliderValue * Math.PI / 90;
    var p2 = sliderValue * Math.PI / 90;
    updatePhase(p1, p2);
}

function updatePhase(p1, p2){
    phiI = p1;
    phiR = p2;
}

function updateFreq(ifr, rfr){
    cyclesI = ifr;
    cyclesR = rfr;
}

function updateAmp(a1, a2){
    amplitude1 = a1;
    amplitude2 = a2;
}

function updateVisible(){
    var iSee = $("#incident").is(":checked");
    var rSee = $("#reflected").is(":checked");
    var sSee = $("#standing").is(":checked");

    IS = iSee;
    RS = rSee;
    SS = sSee;

    //Updates the canvas and redraws wave lines. Also fixes bug for drawing lines while animation
    // is stopped when a checkbox is checked.
    clearCanvas();
    drawWave();
}
////////////////////////////////////

//Grabs the slider value and returns it.
function getSliderValue(slideVal){
    console.log("Slider Value: " + slideVal);
}

//Sets the sliderValueBox to the current value of the slider.
function setSliderBoxValue(currentValue){
    $("#sliderValueBox").val(currentValue/10);
}

//Called when the harmonics checkbox is changed to set the step of the slider
function setSliderIncrement(){
    var harmonicSnap = $("#harmonicSnap");
    var harmonicSlider = $("#harmonicSlider");

    //Sets the step of the slider depending on if the harmonics checkbox is checked or not.
    if(harmonicSnap.is(":checked")){
        harmonicSlider.slider("option", "step", 10);
    }else{
        harmonicSlider.slider("option", "step", 1);
    }

    //Sets the slider box to the current value of the slider.
    //Used in instances where the box is checked when the slider is not on a whole number.
    setSliderBoxValue(harmonicSlider.slider("value"));
}

//Loads the harmonic slider selector and slider labels
function loadHarmonicSlider(){
    //Setup for jquery ui slider
    //Enables function on changing of slider to display value in textbox.
    var harmonicSlider = $("#harmonicSlider").slider({
        value: 10,
        min: 10,
        max: 50,
        step: 10,

        //Called when the slider moves.
        slide: function(event, ui){
            //Updates the slider textbox with the current value of the slider.
            setSliderBoxValue(ui.value);

            //Sets the sliders actual value to the value depicted in the sliders UI bar.
            $(this).slider("value", ui.value);

            //Updates the current wavelength.
            updateWavelength();

            //Updates the current amplitudes.
            //updateAmp(amplitude1, amplitude2);
        },

        //Updates the wave after the slider is placed on a value.
        change: function (event, ui){
            //getSliderValue(ui.value);
        }
    });

    //Sets background color of jquery slider.
    harmonicSlider.css('background', 'rgb(105, 105, 105)');
    $("#harmonicSlider.ui-slider-range").css('background', 'rgb(105, 105, 105)');

    //Add labels to slider specified by the min, max, and step values
    harmonicSlider.each(function() {
        var options = $(this).data().uiSlider.options;

        var values = (options.max/10) - (options.min/10);

        //Spacing for value labels
        for(var i = 0; i <= values; i++){
            var element = $("<label>" + (i + 1) + "</label>").css("left", (i / values * 100) + "%");

            $("#harmonicSlider").append(element);
        }
    });
}

//Resets app to default starting values.
function resetApp(){
    var harmonicSlider = $("#harmonicSlider");
    var harmonicSnap = $("#harmonicSnap");
    var iSee = $("#incident");
    var rSee = $("#reflected");
    var sSee = $("#standing");

    //Sets slider to default value and step increment.
    harmonicSlider.slider("option", "value", 10);
    harmonicSlider.slider("option", "step", 10);+

    //Sets the default slider value.
    harmonicSlider.slider("option", "value", 10);

    //Reset the current wavelength to default.
    updateWavelength(harmonicSlider.slider("value"));

    //Set the default wave amplitude values.
    updateAmp(defaultAmp, defaultAmp);

    //Set harmonic checkbox to checked.
    harmonicSnap.prop("checked", true);

    //Set default wave display checkboxes.
    iSee.prop("checked", false);
    rSee.prop("checked", false);
    sSee.prop("checked", true);
    updateVisible();


    //Set the slider value box to default value matching slider.
    setSliderBoxValue(harmonicSlider.slider("option", "value"));

    //Uncheck all wave boxes and check standing wave box as default.
    $(".waveBox").prop("checked", false);
    $("#standing").prop("checked", true);

    //Starts the animation if it was previously paused.
    timer.resume();
}

//Opens about page.
function openAbout(){
    //To open about page through drupal module
    window.open("../projects/standing_wave_about.html","About",'width=585,height=425,status=0,toolbar=0,menubar=0,location=0,status=1,scrollbars=1,resizable=1,left=0,top=0');

    //To open about page locally using test.html
    //window.open("templates/standing_wave_about.html","About",'width=585,height=425,status=0,toolbar=0,menubar=0,location=0,status=1,scrollbars=1,resizable=1,left=0,top=0');
}