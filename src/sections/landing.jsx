//TODO fix frame count

import '../styles/landingStyle.css';

import {useRef, useEffect} from 'react';

//Variables for Frame Counter
let framecount = 0;
let fps;
let delta;
let lastTime = performance.now();



//Variables for animation 
let connectionLength = Math.max(75,(Math.sqrt(window.innerHeight**2 + window.innerWidth**2)) / 20);
let mouseInfluenceRange = window.innerHeight < window.innerWidth ? window.innerHeight * 0.6 : window.innerHeight * 0.6;
let numberOfparticles = Math.max(100,(window.innerHeight * window.innerWidth) / 2500);
const particleVelocity = 0.2; 

console.log("mouseInfluenceRange: " + mouseInfluenceRange);
console.log("connectionLength: " + connectionLength);
console.log("numberOfparticles: " + numberOfparticles);




//main function
export default function Landing(){

    const canvasRef = useRef(null);
    const particles = initializeParticles(numberOfparticles,particleVelocity);
    
    useEffect(() => {

        const canvas = canvasRef.current
        const context = canvas.getContext("2d");
        

        let gridRows = Math.ceil(window.innerWidth / connectionLength);
        let gridCols = Math.ceil(window.innerHeight / connectionLength);
        let particleGrid = initializeParticleGrid(gridRows,gridCols);
        
        const mouse = { x: -100, y: -100 };
        
        function resizeCanvas(canvas) {
            connectionLength = Math.max(100,(Math.sqrt(window.innerHeight**2 + window.innerWidth**2)) / 20);
            mouseInfluenceRange = window.innerHeight < window.innerWidth ? window.innerHeight * 0.6 : window.innerHeight * 0.6;
            
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            
            gridRows = Math.ceil(canvas.height / connectionLength);
            gridCols = Math.ceil(canvas.width / connectionLength);

            particleGrid = initializeParticleGrid(gridRows, gridCols);
        }
        resizeCanvas(canvas);
        window.addEventListener("resize", () => resizeCanvas(canvas));

        ///TODO
        const handleMouseMove = (event) => {
            mouse.x = event.pageX;
            mouse.y = event.pageY;
        };
        document.addEventListener("mousemove", handleMouseMove);


        const startTime = performance.now();
        function animate(time){
            requestAnimationFrame(animate);
            
            //clear previous frame
            context.clearRect(0,0,innerWidth, innerHeight); 
            const textTime = time - startTime;


            
            // text1: fade in over 2 seconds
            const opacity1 = Math.min(1, textTime / 2000);
            text1.style.opacity = opacity1;

            // text2: delay 1 second, then fade in over 2 seconds
            const delay2 = 1000;
            const opacity2 = Math.min(1, Math.max(0, (textTime - delay2) / 1000));
            text2.style.opacity = opacity2;

            // text3: delay 1 second, then fade in over 2 seconds
            const delay3 = 3000;
            const opacity3 = Math.min(1, Math.max(0, (textTime - delay3) / 1000));
            text3.style.opacity = opacity3;
            
         
            particleGrid = clearParticleGrid(particleGrid,gridRows,gridCols); //clear particle grid
            
                        
            //for each particle
            processParticles(context,particles,particleGrid,mouse); //move particles

            drawConnectionLines(mouse,particleGrid,context);

            // drawText(context, time);
            lastTime = renderFrameCount(context,time,lastTime); //render fps. update last frame time
            
        }
        animate();
    },[])

    return(
        <div className="landingContainer" id='landingContainer'>
            <canvas ref={canvasRef}>Test</canvas>
            <div className="center-wrapper">
                <div className="top-text">
                    <span id="text1">Hi, I'm </span>
                    <span id="text2">Jon</span>
                </div>
                <div className="bottomtext"
                    onClick={() => {
                        document.getElementById('projectsContainer').scrollIntoView({
                        behavior: 'smooth'
                        });
                    }}
                >
                    <span id="text3">↓ See my work ↓</span>
                </div>
            </div>
        </div>  
    )
}



//Initialize Particles
//return an array of particles with random position and velocity
function initializeParticles(numberOfparticles,particleVelocity) {
    const particles = [];
    for (let index = 0; index < numberOfparticles; index++) {
        let particle = {
            xPos: Math.random() * innerWidth,
            yPos: Math.random() * innerHeight,
            xVelocity: Math.random() * (2 * particleVelocity) - particleVelocity,
            yVelocity: Math.random() * (2 * particleVelocity) - particleVelocity
        };
        particles.push(particle);
    }
  return particles;
}



//initializeParticleGrid
//create a 2d array of lists that will be filled with particles
function initializeParticleGrid(gridRows,gridCols){
    return (Array.from({ length: gridRows }, () =>
        Array.from({ length: gridCols }, () => [])
    ));
}



//renderFrameCount
//render Frames Per Second. Once every 10 frames, recalculate FPS
function renderFrameCount(context,time,lastTime){
    framecount++;
    let lastRecalcTime = lastTime;

    if(framecount % 10 == 0){
        delta = (time - lastTime) / 10000; //get time since last frame in milliseconds
        fps = Math.round((1/delta) * 100) / 100; //convert delta to FPS, rounded to hundredth of a second
        lastRecalcTime = time;
    }

    context.fillStyle = "#333333";
    context.fillRect(innerWidth - 130, innerHeight - 55, 140, 35);

    context.font = "20px Arial";
    context.fillStyle = "white";
    context.fillText("FPS: " + fps, innerWidth - 120, innerHeight - 30);
    return lastRecalcTime;
}



//clearParticleGrid
//returns empty particle grid
function clearParticleGrid(particleGrid,gridRows,gridCols){
    for (let y = 0; y < gridRows; y++) {
        for (let x = 0; x < gridCols; x++) {
            particleGrid[y][x].length = 0;
        }
    }
    return particleGrid;
}



//updateParticlePosition
//update particle position based on its current velocity
function updateParticlePosition(particles,index,context){
    const particle = particles[index];
    particle.xPos += particle.xVelocity;
    particle.yPos += particle.yVelocity;

    if(particle.xPos>=innerWidth){
        particle.xPos=0;
    }
    else if(particle.xPos<=0){
        particle.xPos=innerWidth-1;
    }
    if(particle.yPos>=innerHeight){
        particle.yPos=0;
    }
    else if(particle.yPos<=0){
        particle.yPos=innerHeight-1;
    }
    return particle;
}



//addParticleToGridCoord
//add a particle to its corresponding grid location
function addParticleToGridCoord(particle,particleGrid){
    let gridCoordX = Math.floor(particle.xPos / connectionLength);
    let gridCoordY = Math.floor(particle.yPos / connectionLength);
    particleGrid[gridCoordY][gridCoordX].push(particle);
}



//processParticles
//for each particle, update its position and add it to the grid
function processParticles(context,particles,particleGrid,mouse){
    //for each particle
    for (let index = 0; index < particles.length; index++) {

        //update particle position
        const particle = updateParticlePosition(particles,index,context);


        //TODO DRY
        const mouseXDistance = Math.abs(particle.xPos - mouse.x);
        const mouseYDistance = Math.abs(particle.yPos - mouse.y);
        const mouseDistance = Math.sqrt((mouseXDistance**2) + (mouseYDistance**2))
        
        //Draw Particle
        let normalized = mouseDistance < mouseInfluenceRange ? mouseDistance / mouseInfluenceRange : 1;
        let intensityR = Math.round(20 * (1 - normalized)) + 0;
        let intensityG = Math.round(50 * (1 - normalized)) + 150;
        let intensityB = Math.round(60 * (1 - normalized)) + 170;

        context.fillStyle = `rgb(${intensityR}, ${intensityG}, ${intensityB})`;
        context.fillRect(particle.xPos,particle.yPos,2,2);
        
        //add particle to particle grid
        addParticleToGridCoord(particle,particleGrid);
    }   
}



//getLocalParticleArray
//get sub array based on the location of the mouse
function getLocalParticleArray(mouse,particleGrid){
    let localParticles = [];
    const gridRange = Math.floor(mouseInfluenceRange / connectionLength);



    //get mouse grid location
    let gridMouseCoordX = Math.floor(mouse.x / connectionLength);
    let gridMouseCoordY = Math.floor(mouse.y / connectionLength);

    gridMouseCoordX = gridMouseCoordX < 0 ? 0 : gridMouseCoordX;
    gridMouseCoordY = gridMouseCoordY < 0 ? 0 : gridMouseCoordY;

    //get range of the grid that we will be working with
    let gridRangeXStart = gridMouseCoordX - gridRange < 0 ? 0 : gridMouseCoordX - gridRange;
    let gridRangeXEnd = gridMouseCoordX + gridRange > particleGrid[0].length-1 ? particleGrid[0].length-1 : gridMouseCoordX + gridRange;
    
    let gridRangeYStart = gridMouseCoordY - gridRange < 0 ? 0 : gridMouseCoordY - gridRange;
    let gridRangeYEnd = gridMouseCoordY + gridRange > particleGrid.length-1 ? particleGrid.length-1 : gridMouseCoordY + gridRange;

    for (let xIndex = gridRangeXStart; xIndex <= gridRangeXEnd; xIndex++) {
        for (let yIndex = gridRangeYStart; yIndex <= gridRangeYEnd; yIndex++) {
            localParticles.push(...particleGrid[yIndex][xIndex]);
        }
    }
    return localParticles;
}



//drawLinesBetweenParticles
//Draw a line between 2 particles if they are close
function drawLinesBetweenParticles(particleA,particleB,context,mouse){
    //draw a line to any other particle within 50 px

    const xDistance = Math.abs(particleA.xPos - particleB.xPos);
    const yDistance = Math.abs(particleA.yPos - particleB.yPos);
    const distance = Math.sqrt((xDistance**2) + (yDistance**2));

    //TODO DRY
    const mouseXDistanceA = Math.abs(particleA.xPos - mouse.x);
    const mouseYDistanceA = Math.abs(particleA.yPos - mouse.y);
    const mouseDistanceA = Math.sqrt((mouseXDistanceA**2) + (mouseYDistanceA**2))

    //TODO DRY
    const mouseXDistanceB = Math.abs(particleB.xPos - mouse.x);
    const mouseYDistanceB = Math.abs(particleB.yPos - mouse.y);
    const mouseDistanceB = Math.sqrt((mouseXDistanceB**2) + (mouseYDistanceB**2))

    //TODO remove temp
    const mouseDistanceTemp = mouseDistanceA > mouseDistanceB ? mouseDistanceA : mouseDistanceB;
 

    if(distance < connectionLength && mouseDistanceTemp < mouseInfluenceRange){


        //TODO DRY
        const mouseXDistance = Math.abs(particleA.xPos - mouse.x);
        const mouseYDistance = Math.abs(particleA.yPos - mouse.y);
        const mouseDistance = Math.sqrt((mouseXDistance**2) + (mouseYDistance**2))

        let normalized = mouseDistance / mouseInfluenceRange;
        let intensityR = Math.round(50 * (1 - normalized)) + 25;
        let intensityG = Math.round(115 * (1 - normalized)) + 30;
        let intensityB = Math.round(170 * (1 - normalized)) + 30;

        context.strokeStyle = `rgb(${intensityR}, ${intensityG}, ${intensityB})`;
        context.beginPath();
        context.moveTo(particleA.xPos,particleA.yPos);
        context.lineTo(particleB.xPos,particleB.yPos);
        context.stroke();
    }

}



//drawLinesToMouse
//draw a line between particle and mouse if they are close
function drawLinesToMouse(particleA,context,mouse){

    //TODO DRY
    const mouseXDistance = Math.abs(particleA.xPos - mouse.x);
    const mouseYDistance = Math.abs(particleA.yPos - mouse.y);
    const mouseDistance = Math.sqrt((mouseXDistance**2) + (mouseYDistance**2))
   

    //draw a line to any other particle within 50 px
    if(mouseDistance < connectionLength){
        context.beginPath();
        context.moveTo(particleA.xPos,particleA.yPos);
        context.lineTo(mouse.x,mouse.y);
        context.stroke();
    }
}



//drawConnectionLines
//get local particles from mouse location, then draw connecting lines for every particle
function drawConnectionLines(mouse,particleGrid,context){
    //get local particle array
    let localParticles = getLocalParticleArray(mouse,particleGrid);

    for (let i = 0; i < localParticles.length; i++) {
        const particleA = localParticles[i];

        for (let j = i + 1; j < localParticles.length; j++) {
            const particleB = localParticles[j];

            drawLinesBetweenParticles(particleA,particleB,context,mouse);
            drawLinesToMouse(particleA,context,mouse);
        }
    }
}



// function drawText(context, time) {
//     context.save();

//     const text1 = "Hi, I'm ";
//     const text2 = "Jon";

//     const x = innerWidth / 2;
//     const y = innerHeight / 2;

//     context.font = "bold 64px Arial";
//     context.textAlign = "left";
//     context.textBaseline = "middle";

//     // measure widths
//     const width1 = context.measureText(text1).width;
//     const width2 = context.measureText(text2).width;
//     const totalWidth = width1 + width2;

//     let startX = x - totalWidth / 2;

//     // ---- Fade logic ----
//     // text1: fade in over 2 seconds
//     const opacity1 = Math.min(1, time / 2000);

//     // text2: wait 5 seconds, then fade in over 2 seconds
//     const delay = 1000;
//     const opacity2 = Math.min(1, Math.max(0, (time - delay) / 2000));

//     // ---- Draw text1 ----
//     context.globalAlpha = opacity1;
//     context.fillStyle = "rgb(255,255,255)";
//     context.fillText(text1, startX, y);

//     // ---- Draw text2 ----
//     context.globalAlpha = opacity2;
//     context.fillStyle = "rgb(0,150,170)";
//     context.fillText(text2, startX + width1, y);

//     context.restore();
// }
