// Copyright ImaDoofus 2021. This file is licensed under the MIT license.
// github.com/ImaDoofus/ImaDoofus2D
(function() {
    var renderingCanvas;
    var ctx;
    var toDraw = []
    var textures = []
    var secondsPassed;
    var oldTimeStamp;
    var fpsArray = [];
    var fps;
    var lastFpsUpdate = 0;
    var renderer;

    window.Renderer = function(canvas) {
        renderer = this;
        renderingCanvas = canvas;
        // renderingCanvas.style.border = '1px solid black'
        ctx = renderingCanvas.getContext('2d')
        this.backgroundColor = '#ffffff';
    }

    window.Rect = function(x,y,w,h,c = 'black') {
        this.type = 'rect'
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
        this.rotation = 0;
        this.color = c;
        this.border = {};
        this.snap = () => {
            let index = toDraw.indexOf(this)
            if (index > -1) {
                toDraw.splice(index,1)
        
            }
        }
        toDraw.push(this)
    }

    window.Circle = function(x,y,r,c = 'black') {
        this.type = 'circle'
        this.x = x;
        this.y = y;
        this.radius = r;
        this.color = c;
        this.border = {}
        this.delete = () => {
            let index = toDraw.indexOf(this)
            if (index > -1) {
                toDraw.splice(index,1)
        
            }
        }
        toDraw.push(this)
    }

    window.Triangle = function(x,y,r,c = 'black') {
        this.type = 'triangle'
        this.x = x;
        this.y = y;
        this.radius = r;
        this.color = c;
        this.border = {}
        this.delete = () => {
            let index = toDraw.indexOf(this)
            if (index > -1) {
                toDraw.splice(index,1)
        
            }
        }
        toDraw.push(this)
    }

    window.Text = function(t,x,y,f='16pt Arial',c='black') {
        this.type = 'text'
        this.x = x;
        this.y = y;
        this.rotation = 0;
        this.color = c;
        this.border = {};
        this.content = t;
        this.font = f
        this.snap = () => {
            let index = toDraw.indexOf(this)
            if (index > -1) {
                toDraw.splice(index,1)
        
            }
        }
        toDraw.push(this)
    }



    window.Texture = function(url,w,h) {


        return new Promise((resolve,reject) => {
            let canvas = document.createElement('canvas');
            let ctx = canvas.getContext('2d');
            let image = new Image()
            image.onload = function() {
    
                let texture = image;
                canvas.width = w
                canvas.height = h
                ctx.drawImage(image,0,0,w,h)
                
                let dataurl = canvas.toDataURL()
                let image2 = new Image()
                image2.src = dataurl
                
                image2.onload = function() {
                    texture = ctx.createPattern(image2, 'repeat');
                    console.log(texture)
                    resolve(texture)
                }
                
            }
            image.crossOrigin = 'Anonymous';
            image.src = url
    
        })


    }


    window.requestAnimationFrame(gameLoop)

    function gameLoop(timeStamp) {
        console.log(toDraw.length)
        secondsPassed = (timeStamp - oldTimeStamp) / 1000;
        oldTimeStamp = timeStamp;

        if (typeof renderer !== 'undefined') {
            
            ctx.fillStyle = renderer.backgroundColor
            ctx.fillRect(0,0,renderingCanvas.width,renderingCanvas.height)


            // ctx.fillText(`${window.performance.memory.usedJSHeapSize/1000}kb`,7,70)
            // console.log(window.performance.memory)
            // console.log(toDraw)
            for (let i = 0; i < toDraw.length; i++) {
                let item = toDraw[i]

                if (item.type === 'rect') {

                    
                    // console.log(textures[0])

                    ctx.save()

                    let drawX = item.x;
                    let drawY = item.y;
                    let translationX = 0;
                    let translationY = 0;

                    if (item.rotation !== 0) {
                        // ctx.translate(renderingCanvas.width/2,renderingCanvas.height/2)
                        translationX += item.x+(item.width/2)
                        translationY += item.y+(item.height/2)
                        //
                        // 400,400,300,300
                        //
                        ctx.translate(translationX,translationY)
                        ctx.rotate(item.rotation * ( Math.PI/180))
                        drawX = -item.width/2;
                        drawY = -item.height/2;
                        // drawX = -50
                        // drawY = -100

                    }
                    if (typeof item.border.color !== 'undefined') {

                        ctx.fillStyle = item.border.color;
                        let borderWidth = item.border.width;
                        ctx.fillRect(item.x-borderWidth,item.y-borderWidth,item.width+borderWidth*2,item.height+borderWidth*2);
                    }
                    if (typeof item.texture === 'undefined') {
                        ctx.fillStyle = item.color;
                        // ctx.fillRect(item.x,item.y,item.width,item.height);
                    } else {
                        let matrix = new DOMMatrix();
                        pattern = item.texture;
                        if (item.texture.constructor.name === 'CanvasPattern') {
                            pattern.setTransform(matrix.translate(drawX,drawY));
                            ctx.fillStyle = pattern
                            // ctx.translate(item.x,item.y) rotate(item.rotation * (Math.PI / 180))
                            // translationX += item.x;
                            // translationY += item.y;
                            // ctx.translate(translationX,translationY)

                            // drawX = 0;
                            // drawY = 0;
                            // ctx.fillRect(0,0,item.width,item.height);
                        }
                        

                    }
                    ctx.fillRect(drawX,drawY,item.width,item.height)
                    ctx.restore()
                }


                if (item.type === 'text') {

                    // console.log(textures[0])
                    ctx.beginPath()
                    
                    ctx.save()

                    let drawX = item.x;
                    let drawY = item.y;
                    let translationX = 0;
                    let translationY = 0;
                    // console.log(item,drawX,drawY)
                    
                    ctx.font = item.font

                    if (item.rotation !== 0) {
                        // ctx.translate(renderingCanvas.width/2,renderingCanvas.height/2)
                        // translationX += item.x+(item.width/2)
                        // translationY += item.y+(item.height/2)
                        // translationX = item.x+(ctx.measureText(item.content).width)/2
                        metrics = ctx.measureText(item.content)
                        let fontHeight = metrics.actualBoundingBoxAscent
                        let fontWidth = ctx.measureText(item.content).width
                        translationY += item.y+(fontHeight/2)
                        translationX += item.x+(fontWidth/2)
                        ctx.translate(translationX,translationY)
                        ctx.rotate(item.rotation * ( Math.PI/180))
                        drawX = -(fontWidth/2);
                        drawY = -(fontHeight/2)+fontHeight;
                        // drawX = 450
                        // drawY = 250
                    }
                    if (typeof item.border.color !== 'undefined') {

                        ctx.fillStyle = item.border.color;
                        let borderWidth = item.border.width;
                        ctx.fillRect(item.x-borderWidth,item.y-borderWidth,item.width+borderWidth*2,item.height+borderWidth*2);
                    }
                    if (typeof item.texture === 'undefined') {
                        ctx.fillStyle = item.color;
                        // ctx.fillRect(item.x,item.y,item.width,item.height);
                    } else {
                        let matrix = new DOMMatrix();
                        pattern = item.texture;
                        if (item.texture.constructor.name === 'CanvasPattern') {
                            pattern.setTransform(matrix.translate(drawX,drawY));
                            ctx.fillStyle = pattern
                            // ctx.translate(item.x,item.y) rotate(item.rotation * (Math.PI / 180))
                            // translationX += item.x;
                            // translationY += item.y;
                            // ctx.translate(translationX,translationY)

                            // drawX = 0;
                            // drawY = 0;
                            // ctx.fillRect(0,0,item.width,item.height);
                        }
                        

                    }
                    // ctx.textAlign = 'center'
                    // ctx.fillText(item.content,drawX,drawY)
                    // ctx.fillRect(drawX,drawY,100,100)

                    
                    ctx.fillText(item.content,drawX,drawY)
                    // ctx.fillRect(0,0,10,10)
                    // ctx.fillStyle = 'green'
                    // ctx.fillRect(drawX,drawY,15,10)
                    ctx.restore()
                    // ctx.fillStyle = 'blue'
                    // ctx.fillRect(400,200,10,15)
                    ctx.closePath()
                }


                if (item.type === 'circle') {
                    if (typeof item.border.color !== 'undefined') {
                        ctx.fillStyle = item.border.color;
                        let borderWidth = item.border.width;
                        ctx.beginPath();
                        ctx.arc(item.x,item.y,item.radius+borderWidth,0,Math.PI*2);
                        ctx.fill();
                        ctx.closePath();
                    }
                    ctx.fillStyle = item.color;
                    ctx.beginPath();
                    ctx.arc(item.x,item.y,item.radius,0,Math.PI*2);
                    ctx.fill();
                    ctx.closePath();
                }

            }

            fpsArray.push((1 / secondsPassed) || 60)
            if (timeStamp-lastFpsUpdate > 500) {
                lastFpsUpdate = timeStamp;
                let sum = 0;
                for (let i = 0; i < fpsArray.length; i++) {
                    sum += fpsArray[i];
                    
                }
                fps = Math.round((sum/fpsArray.length)*100)/100
                fpsArray = [];
            }


            let time = new Date().toLocaleString();
            width = Math.max(time.length*7.5,renderingCanvas.id.length*10)
            ctx.fillStyle = 'black'
            ctx.fillRect(4,4,width,60)
            ctx.fillStyle = 'white'
            ctx.font = '12pt Arial';
            ctx.fillText(`${renderingCanvas.id}`,7,20);
            ctx.font = '10pt Arial'
            ctx.fillText(`${time}`,9,40)
            ctx.fillText(`${fps} fps`,9,55)
        }
        window.requestAnimationFrame(gameLoop)
    }
}());
