'use strict'

let gElCanvas
let gCtx
let gIsDrag = false
let gPrevPos

let gCurrShape = document.querySelector('.shape-select').value
let gStrokeColor = document.querySelector('input[name="stroke"]').value
let gFillColor = document.querySelector('input[name="fill"]').value
const TOUCH_EVS = ['touchmove', 'touchstart', 'touchend']

function onInit() {
    gElCanvas = document.querySelector('canvas')
    gCtx = gElCanvas.getContext('2d')
    const elCanvasContainer = document.querySelector('.canvas-container')
    gElCanvas.width = elCanvasContainer.offsetWidth
    gElCanvas.height = elCanvasContainer.offsetHeight
    clearCanvas()
    addListeners()

}

function addListeners() {
    addMouseListeners()
    addTouchListeners()
    window.addEventListener('resize', () => {
        resizeCanvas()
        clearCanvas()
    })
}

function addMouseListeners() {
    gElCanvas.addEventListener('mousemove', onMove)
    gElCanvas.addEventListener('mousedown', onDown)
    gElCanvas.addEventListener('mouseup', onUp)
}

function addTouchListeners() {
    gElCanvas.addEventListener('touchmove', onMove)
    gElCanvas.addEventListener('touchstart', onDown)
    gElCanvas.addEventListener('touchend', onUp)
}

function onMove(ev) {
    if (gIsDrag) {
        const pos = getEvPos(ev)
        const dx = pos.x - gPrevPos.x
        const dy = pos.y - gPrevPos.y
        gPrevPos = pos
        draw(pos.x, pos.y, dx, dy)
    }
}

function onDown(ev) {
    const pos = getEvPos(ev)
    gPrevPos = pos
    gIsDrag = true
}

function onUp() {
    gIsDrag = false
}

function getEvPos(ev) {
    let pos = {
        x: ev.offsetX,
        y: ev.offsetY
    }
    if (TOUCH_EVS.includes(ev.type)) {
        ev.preventDefault()
        ev = ev.changedTouches[0]
        pos = {
            x: ev.pageX,
            y: ev.pageY
        }
    }
    return pos
}

function drawLine(x, y, dx, dy) {
    const length = Math.abs(dx * dy)
    gCtx.beginPath()
    gCtx.lineWidth = 2

    gCtx.moveTo(x, y)
    if (dx < 0 && dy < 0) {
        //    top left
        gCtx.lineTo(x - length, y + length)
    } else if (dx < 0 && dy > 0) {
        //    bottom left
        gCtx.lineTo(x + length, y + length)
    } else if (dy < 0 && dx > 0) {
        //    top right
        gCtx.lineTo(x - length, y - length)
    } else {
        //    bottom right
        gCtx.lineTo(x + length, y - length)
    }
    gCtx.strokeStyle = gStrokeColor
    gCtx.stroke()
}

function drawTriangle(x, y, dx, dy) {
    const size = Math.abs(0.1 * (dx * dy))
    gCtx.beginPath()
    gCtx.lineWidth = 2
    gCtx.moveTo(x - size / 2, y - size / 2)
    if (dx < 0 && dy < 0) {
        //    top left
        gCtx.lineTo(x + size, y)
        gCtx.lineTo(x + size, y + size)
    } else if (dx < 0 && dy > 0) {
        //    bottom left
        gCtx.lineTo(x, y + size)
        gCtx.lineTo(x + size, y + size)
    } else if (dy < 0 && dx > 0) {
        //    top right
        gCtx.lineTo(x + size, y)
        gCtx.lineTo(x + size, y + size)
    } else {
        //    bottom right
        gCtx.lineTo(x + size, y)
        gCtx.lineTo(x + size, y + size)
    }
    gCtx.closePath()

    gCtx.fillStyle = gFillColor
    gCtx.fill()
    gCtx.strokeStyle = gStrokeColor
    gCtx.stroke()
}

function drawRect(x, y, dx, dy) {
    const size = Math.abs(0.1 * (dx * dy))
    gCtx.beginPath()
    gCtx.lineWidth = 2
    gCtx.rect(x - size / 2, y - size / 2, size, size * 2)
    gCtx.fillStyle = gFillColor
    gCtx.fill()
    gCtx.strokeStyle = gStrokeColor
    gCtx.stroke()
}

function drawCircle(x, y, dx, dy) {
    const radius = Math.abs(0.1 * (dx * dy))
    gCtx.beginPath()
    gCtx.lineWidth = 2

    gCtx.arc(x, y, radius, 0, 2 * Math.PI)
    gCtx.fillStyle = gFillColor
    gCtx.fill()
    gCtx.strokeStyle = gStrokeColor
    gCtx.stroke()
}

function changeShape(shape) {
    gCurrShape = shape
}

function changeColor(color, style) {
    if (style === 'stroke') {
        gStrokeColor = color
    }
    if (style === 'fill') {
        gFillColor = color
    }
}

function draw(x, y, dx, dy) {
    // ev.stopPropagation()
    // console.log('ev:', ev)
    // const {
    //     x:offsetX,
    //     y:offsetY
    // } = ev
    switch (gCurrShape) {
        case 'circle':
            drawCircle(x, y, dx, dy)
            break
        case 'rectangle':
            drawRect(x, y, dx, dy)
            break
        case 'line':
            drawLine(x, y, dx, dy)
            break
        case 'triangle':
            drawTriangle(x, y, dx, dy)
            break
    }
}

function clearCanvas() {
    gCtx.fillStyle = '#e9e9e9'
    gCtx.fillRect(0, 0, gElCanvas.width, gElCanvas.height)
}

function resizeCanvas() {
    const elCanvasContainer = document.querySelector('.canvas-container')
    gElCanvas.width = elCanvasContainer.offsetWidth
    gElCanvas.height = elCanvasContainer.offsetHeight
}

function downloadCanvas(elLink) {
    const data = gElCanvas.toDataURL('image/png')
    elLink.href = data
}

function onShareImg() {
    const imgDataUrl = gElCanvas.toDataURL('image/png') // Gets the canvas content as an image format

    // A function to be called if request succeeds
    function onSuccess(uploadedImgUrl) {
        // Encode the instance of certain characters in the url
        const encodedUploadedImgUrl = encodeURIComponent(uploadedImgUrl)
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUploadedImgUrl}&t=${encodedUploadedImgUrl}`)
    }
    // Send the image to the server
    doUploadImg(imgDataUrl, onSuccess)
}

function doUploadImg(imgDataUrl, onSuccess) {
    // Pack the image for delivery
    const formData = new FormData()
    formData.append('img', imgDataUrl)
    console.log('formData:', formData)
    // Send a post req with the image to the server
    fetch('//ca-upload.com/here/upload.php', {
            method: 'POST',
            body: formData
        })
        .then(res => res.text())
        .then(url => {
            console.log('url:', url)
            onSuccess(url)
        })
}