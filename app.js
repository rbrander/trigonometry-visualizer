// app.js
// Source of inspiration: https://en.wikipedia.org/wiki/Trigonometric_functions
// TODO: apply scale for auto zooming

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const PADDING = 50 // px from edges
const TICK_INCREMENT = 0.2;
const NUM_TICKS = 1.0 / TICK_INCREMENT;  
const TICK_SIZE = 5; // px from axis line
const WHITE = '#EEEEEE'; // white;
const RED = '#ff2222'; // red
const YELLOW = '#DDDD00'; // yellow;
const GREEN = '#00DD00'; // green
const RADIANS_PER_DEGREE = Math.PI / 180;

// Set the origin to the bottom left corner
const originX = PADDING;
const originY = canvas.height - PADDING;
const yAxisEnd = PADDING;
const xAxisEnd = canvas.width - PADDING;
const xAxisLength = (xAxisEnd - originX);
const yAxisLength = (originY - yAxisEnd);
const xTickLength = 100;
const yTickLength = 100;

const state = {
  angle: Math.PI / 4, // 45 degrees in radians
  isPointerDown: false,
  pointerX: 0,
  pointerY: 0
};

//////////////////////

const update = (tick) => {
  // update the angle when the pointer is down and in bounds
  if (state.isPointerDown && state.pointerX >= originX && state.pointerY <= originY) {
    const xDiff = originX - state.pointerX;
    const yDiff = originY - state.pointerY;
    const angle = Math.atan2(yDiff, xDiff);
    // 1.5PI => 0.5PI = 2PI - 1.5PI
    // 1.75PI => 0.25PI = 2PI - 1.75PI
    // 2.0PI => 0PI = 2PI - 2PI
    const invertedAngle = 2*Math.PI - angle;
    state.angle = (invertedAngle - Math.PI);
  }
};

const drawAxes = () => {
  // draw the lines starting at top left
  ctx.strokeStyle = WHITE;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(originX, yAxisEnd); // top left
  ctx.lineTo(originX, originY); // bottom left
  ctx.lineTo(xAxisEnd, originY); // bottom right
  ctx.stroke();

  // draw ticks at every 0.2
  ctx.beginPath();
  for (let tick = TICK_INCREMENT; tick <= 1.0; tick += TICK_INCREMENT) {
    const tickNum = (tick / TICK_INCREMENT);
    // X-Axis
    const offsetX = originX + xTickLength * tickNum;
    ctx.moveTo(offsetX, originY);
    ctx.lineTo(offsetX, originY + TICK_SIZE);
    // Y-Axis
    const offsetY = originY - yTickLength * tickNum;
    ctx.moveTo(originX, offsetY);
    ctx.lineTo(originX - TICK_SIZE, offsetY);
    // draw labels on axes
    ctx.fillStyle = WHITE;
    ctx.font = '12px Arial';
    const tickLabel = tick.toFixed(1);
    // y-axis label
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'right';
    ctx.fillText(tickLabel, originX - TICK_SIZE * 2, offsetY);
    // x-axis label
    ctx.textBaseline = 'top';
    ctx.textAlign = 'center';
    ctx.fillText(tickLabel, offsetX, originY + TICK_SIZE * 2);
  }
  ctx.stroke();
  // origin label
  ctx.fillText('0.0', originX - 5, originY + 5);
}

const drawArc = () => {
  ctx.strokeStyle = WHITE;
  ctx.lineWidth = 2;
  ctx.beginPath();
  const radius = (1.0 / TICK_INCREMENT) * yTickLength;
  ctx.arc(originX, originY, radius, Math.PI * 1.5, 0, false);
  ctx.stroke();
};

const drawArrow = (startX, startY, endX, endY) => {
  const arrowHeadLength = 20; // px
  const xDiff = endX - startX;
  const yDiff = endY - startY;
  const lineAngle = Math.atan2(yDiff, xDiff);
  const arrowHeadAngle = Math.PI / 10; // 18 degrees in radians
  
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.lineTo(endX - arrowHeadLength * Math.cos(lineAngle - arrowHeadAngle), endY - arrowHeadLength * Math.sin(lineAngle - arrowHeadAngle));
  ctx.moveTo(endX, endY);
  ctx.lineTo(endX - arrowHeadLength * Math.cos(lineAngle + arrowHeadAngle), endY - arrowHeadLength * Math.sin(lineAngle + arrowHeadAngle));
  ctx.stroke();
}

const drawAngle = () => {
  // draw a line with an arrow from origin to the
  // point on the arc that the angle bisects
  const xArcPoint = originX + Math.cos(state.angle) * xAxisLength;
  const yArcPoint = originY - Math.sin(state.angle) * yAxisLength;

  // draw the line
  ctx.lineWidth = 2;
  ctx.strokeStyle = RED
  drawArrow(originX, originY, xArcPoint, yArcPoint);

  // draw the arc at the first tick
  ctx.lineWidth = 2;
  ctx.strokeStyle = WHITE;
  ctx.beginPath();
  ctx.arc(originX, originY, xTickLength, 0, -state.angle, true);
  ctx.stroke();

  // draw the angle label
  ctx.font = '24px Arial';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = WHITE;
  const RADIANS_PER_DEGREE = Math.PI / 180;
  const degrees = Math.floor(state.angle / RADIANS_PER_DEGREE);
  ctx.fillText(`θ = ${state.angle.toFixed(2)} (${degrees}°)`, originX + xTickLength, originY - yTickLength / 2);
};

// Cosine (Cos) = adjacent / hypotenuse
const drawCosine = () => {
  // draw a line along the X-axis to show the length of the cosine
  const cosine = Math.cos(state.angle);
  const cosineLength = xAxisLength * cosine;
  const cosineXOffset = originX + cosineLength;
  ctx.strokeStyle = RED;
  drawArrow(originX, originY, cosineXOffset, originY);

  // draw a label
  ctx.fillStyle = RED;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.font = '24px Arial';
  ctx.fillText(`Cos(θ) = ${cosine.toFixed(2)}`, cosineXOffset, canvas.height);
};

// Sine (Sin) = opposite / hypotenuse
const drawSine = () => {
  // draw a vertical line at the end of the cosine up to the arc
  const sine = Math.sin(state.angle);
  const sineLength = yAxisLength * sine;
  const sineYoffset = originY - sineLength;
  const cosineLength = xAxisLength * Math.cos(state.angle);
  const cosineXOffset = originX + cosineLength;
  ctx.strokeStyle = RED;
  drawArrow(cosineXOffset, originY, cosineXOffset, sineYoffset);

  // draw a label
  ctx.fillStyle = RED;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'center';
  ctx.font = '24px Arial';
  ctx.fillText(` Sin(θ) = ${sine.toFixed(2)}`, cosineXOffset, sineYoffset + (sineLength / 2));
};

// Tangant (Tan) = opposite / adjacent
const drawTangent = () => {
  // draw a vertical line at x=1.0 to the height of the tangent
  const tangent = Math.tan(state.angle);
  const tangentLength = yAxisLength * tangent;
  const tangentYOffset = originY - tangentLength;
  ctx.strokeStyle = YELLOW;
  const xOffset = originX + xTickLength * (1.0 / TICK_INCREMENT); // explicitly at 1.0 on axis
  drawArrow(xOffset, originY, xOffset, tangentYOffset);

  // draw a label
  ctx.fillStyle = YELLOW;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'center';
  ctx.font = '24px Arial';
  ctx.fillText(` Tan(θ) = ${tangent.toFixed(2)}`, xOffset, tangentYOffset + (tangentLength / 2));
};

// Secant (Sec) is the inverse of cosine = hypotenuse / adjacent
const drawSecant = () => {
  // The X will always be 1.0, but the Y will be equal to the tangent
  const secant = 1.0 / Math.cos(state.angle); // secant = hypotenuse / adjacent
  const xSecPoint = originX + (1.0 * xAxisLength);
  const ySecPoint = originY - (Math.tan(state.angle) * yAxisLength);

  // draw the line
  ctx.lineWidth = 2;
  ctx.strokeStyle = YELLOW;
  drawArrow(originX, originY, xSecPoint, ySecPoint);

  // draw a label
  ctx.fillStyle = YELLOW;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'top';
  ctx.font = '24px Arial';
  ctx.fillText(`Sec(θ) = ${secant.toFixed(2)}`, xSecPoint - 50, ySecPoint);
};

// Cosecant (Csc) is the inverse of sine = hypotenuse / opposite
const drawCosecant = () => {
  // The Y will always be 1.0, but the X will be equal to the cotangent
  const cosecant = 1.0 / Math.sin(state.angle); // cosecant = hypotenuse / opposite
  const cotangant = Math.cos(state.angle) / Math.sin(state.angle);
  const xCscPoint = originX + (cotangant * xAxisLength);
  const yCscPoint = originY - (1.0 * yAxisLength);

  // draw the diagonal line
  ctx.lineWidth = 2;
  ctx.strokeStyle = GREEN;
  drawArrow(originX, originY, xCscPoint, yCscPoint);
  // draw a vertical line to indicate the y-axis is always 1.0
  drawArrow(xCscPoint, originY, xCscPoint, yCscPoint);

  // draw a label
  ctx.fillStyle = GREEN;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'top';
  ctx.font = '24px Arial';
  ctx.fillText(`Csc(θ) = ${cosecant.toFixed(2)}`, xCscPoint - 50, yCscPoint);
  ctx.fillText('1.0 ', xCscPoint, originY - ((originY - yCscPoint) / 2));
};

// Cotangant (Cot) is the inverse of tangant = adjacent / opposite
const drawCotangant = () => {
  // draw a line along the X-axis to show the length of the cotangant
  const cotangant = Math.cos(state.angle) / Math.sin(state.angle);
  const cotangantLength = xAxisLength * cotangant;
  const cotangantXOffset = originX + cotangantLength;
  ctx.strokeStyle = GREEN;
  drawArrow(originX, originY, cotangantXOffset, originY);

  // draw a label
  ctx.fillStyle = GREEN;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.font = '24px Arial';
  ctx.fillText(`Cot(θ) = ${cotangant.toFixed(2)}`, cotangantXOffset, canvas.height);  
};

const draw = (tick) => {
  // shift pixels off by a half to avoid anti-aliasing on lines
  ctx.translate(0.5, 0.5);

  // clear background
  ctx.fillStyle = '#000055';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawAxes()
  drawArc();
  // draw the long lines first
  drawSecant();
  drawCosecant();
  drawCotangant();
  // draw the short lines second
  drawAngle();
  drawCosine();
  drawSine();
  drawTangent();

  // undo the shift at the end
  ctx.translate(-0.5, -0.5);
};

const loop = (tick) => {
  update(tick);
  draw(tick);
  requestAnimationFrame(loop);
};

const onPointerDown = (event) => {
  state.isPointerDown = true;
}

const onPointerUp = (event) => {
  state.isPointerDown = false;
}

const onPointerMove = (event) => {
  state.pointerX = event.offsetX;
  state.pointerY = event.offsetY;
}

(function init(){
  console.log('Trigonometry Visualizer');
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointermove', onPointerMove);
  requestAnimationFrame(loop);
})();