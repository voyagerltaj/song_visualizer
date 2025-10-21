const PLAY_ICON = "M8 5v14l11-7L8 5z";
const PAUSE_ICON = "M6 4h4v16H6zm8 0h4v16h-4z"; 
const STOP_ICON = "M6 6h12v12H6z";

var song;
var fft;
var raymarching;
var prev_amp = 0.;
var prev_duration = 0.;
var playing = false;
var play_button = document.getElementById("musicPlay");
var play_button_icon = document.getElementById("playicon_path");

function preload() {
  raymarching = loadShader('shader.vert', 'shader.frag');
}

document.getElementById("musicUpload").addEventListener("change", getSong);

function getSong() {
  document.getElementById("filename").textContent = this.files[0].name;
  if(song) {
    playing = true;
    song.stop();
    song = loadSound(URL.createObjectURL(this.files[0]), toggleSong);
  }
  else {
    document.getElementById("filename").style.paddingRight = "1rem";
    song = loadSound(URL.createObjectURL(this.files[0]), loadedFirstSong);
  }
}

function loadedFirstSong() {
  play_button.addEventListener("click", toggleSong);
  play_button.classList.add("active");
  play_button_icon.setAttribute("d", PLAY_ICON);
}

function toggleSong() {
  if(playing) {
    song.pause();
    play_button_icon.setAttribute("d", PLAY_ICON);
    playing = false;
  }
  else {
    userStartAudio();
    song.play();
    song.setVolume(.3);
    fft = new p5.Amplitude();
    play_button_icon.setAttribute("d", PAUSE_ICON);
    playing = true;
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  shader(raymarching);

  raymarching.setUniform('iResolution', [width, height]);
}

function draw() {
  raymarching.setUniform('iTime', millis() / 1000.0);

  if(playing && fft) {
    var amp = lerp(prev_amp, fft.getLevel(), .5);
    raymarching.setUniform('iAmp', amp * 8.);
    prev_amp = amp;

    var duration = lerp(prev_duration, song.duration(), .01);
    raymarching.setUniform('iDuration', map(min(duration * 100, 300000.), 0., 300000., 0., 24.));
    prev_duration = duration;

  }
  else {
    var amp = lerp(prev_amp, 0., .5);
    raymarching.setUniform('iAmp', amp * 8.);
    prev_amp = amp;

    var duration = lerp(prev_duration, 0., .01);
    raymarching.setUniform('iDuration', map(min(duration * 100, 300000.), 0., 300000., 0., 24.));
    prev_duration = duration;
  }
  
  quad(-1, -1, 1, -1, 1, 1, -1, 1);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  raymarching.setUniform('iResolution', [width, height]);
}
