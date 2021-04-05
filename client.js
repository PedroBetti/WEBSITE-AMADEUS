const canvas = document.querySelector(".myCanvas");
const ctx = canvas.getContext("2d");
fitToContainer(canvas);

const input = document.querySelector('input');
const emojis = [];
var emojisLoaded = 0;

var userInputString = "";


let dX = 0;
let dY = 0;
let targetX = canvas.width/2;
let targetY = canvas.height/2;
let selectorX = targetX;
let selectorY = targetY; 
let classifiedEmojiIndex = 17;
let gridPositionsX = [21];
let gridPositionsY = [21];

function fitToContainer(canvas){
  canvas.width  = canvas.offsetWidth;
  canvas.height = window.innerHeight/3;
}
window.addEventListener('resize', function(event){
    fitToContainer(canvas);
});


//RUNS EVERY FRAME
//WAITS UNTILL ALL EMOJIS ARE LOADED
//DRAWS THE EMOJIS ON THE SCREEN
//UPDATES WHERE THE SELECTOR (PURPLE RECTANGLE) SHOULD BE
function draw(e) {

  if(emojisLoaded === 21){ 

   dX = targetX - selectorX;
  dY = targetY - selectorY;
 
  selectorX += (dX / 10);
  selectorY += (dY / 10);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#57358D';
  ctx.fill();
  
  ctx.roundRect(selectorX, selectorY, 112, 112, 8);

  drawEmojis();

  updateTargetPosition();

  }
  requestAnimationFrame(draw);
}
draw();

//SETS THE TARGET POSITION FOR THE PURPLE RECTANGLE
function updateTargetPosition(){
  targetX = gridPositionsX[classifiedEmojiIndex];
  targetY = gridPositionsY[classifiedEmojiIndex];
}

function drawEmojis(){

  const gridSpace = canvas.width/7 > 140 ? 140 : canvas.width/7;
  var index = 0;
  for (var i = 0; i < 7; i++){
    for (var j = 0; j < 3; j++){
      
      const posX = (canvas.width/2) + (gridSpace * i) - gridSpace*3;
      const posY = (canvas.height/2) + (gridSpace * j) - gridSpace;
      gridPositionsX[index] = posX;
      gridPositionsY[index] = posY;
      
      //SET THE ALPHA
      const dist = (Math.pow(selectorX - posX,2) + Math.pow(selectorY - posY,2) )/10000;
      const alpha = Math.pow(map(dist,0,40,1,0.25),8);
      ctx.globalAlpha = alpha > .25 ? alpha : .25;
      ctx.drawImage(emojis[index], posX-50,posY-50, 100, 100);
      ctx.globalAlpha = 1;
      index++;
    }
  }
  
  
}

//CALLS API AND SETS 'CLASSIFIEDEMOJIINDEX'
async function callApiAndUpdateTargetPos(userInputString){
 
    const url = 'http://35.182.212.58:8080/ClassifyEmoji?msg=' + userInputString;
    const response = await fetch(url);
    const response2 = await response.json();
  
    const index = convertEmojiIdToIndex(response2.EmojiID);
    
  
    if (index !== "undefined"){
      console.log("still running" + index);
      classifiedEmojiIndex = index;
      updateTargetPosition();
    }
}

//EVERYTIME THE USER CHANGES THE INPUT 
input.addEventListener('input', updateValue);

function updateValue(e) {
  userInputString = e.target.value;
  callApiAndUpdateTargetPos(userInputString);
  
}
function loadEmojiImages() {
  //HERES WHERE YOU CHOOSE THE PATH TO THE IMAGES
  for (var i = 0; i < 21; i++){
    const path = "/Emoji" + i + ".png";
    const image = new Image();
    image.src = path;
    image.onload = ()=>{ 
      emojisLoaded += 1;
    }
    emojis.push(image);
  }
}
loadEmojiImages();



//ROUNDED RECTANGLE FUNCITON, USED TO DRAW THE PURPLE 'SELECTOR'
CanvasRenderingContext2D.prototype.roundRect = function (x, y, width, height, radius) {
  x -= width/2;
  y-= height/2;
  if (width < 2 * radius) radius = width / 2;
  if (height < 2 * radius) radius = height / 2;
  this.beginPath();
  this.moveTo(x + radius, y);
  this.arcTo(x + width, y, x + width, y + height, radius);
  this.arcTo(x + width, y + height, x, y + height, radius);
  this.arcTo(x, y + height, x, y, radius);
  this.arcTo(x, y, x + width, y, radius);
  this.closePath();
  return this;
}

//THIS TAKES AN EMOJIID AND CONVERTS IT TO AN INDEX IN THE EMOJI GRID
function convertEmojiIdToIndex(emojiId){
  const ids = ["2702", "1F388","26BE","1F36A","1F354", "1F4FA","1F526","1F992","1F3B9","1F916"];
  
  for (var i = 0; i < ids.length;i++){
    if (ids[i] === emojiId) return i;
  }
  return "undefined";

}

//MAPS A NUMBER FROM ONE RANGE TO ANOTHER
const map = (value, x1, y1, x2, y2) => {
  
  return (value - x1) * (y2 - x2) / (y1 - x1) + x2;
}
console.log("shiloh")