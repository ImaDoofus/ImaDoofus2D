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
        this.data = {}
        this.remove = () => {
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
        this.rotation = 0;
        this.data = {};
        this.remove = () => {
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
        this.data = {};
        this.rotation = 0;
        this.remove = () => {
            let index = toDraw.indexOf(this)
            if (index > -1) {
                toDraw.splice(index,1)
        
            }
        }
        toDraw.push(this)
    }

    window.Text = function(t,x,y,s=12,f='Arial',c='black') {
        this.type = 'text'
        this.x = x;
        this.y = y;
        this.rotation = 0;
        this.color = c;
        this.data = {};
        this.content = t;
        this.font = f;
        this.size = s;
        this.remove = () => {
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
                    resolve(texture)
                }
                
            }
            image.crossOrigin = 'Anonymous';
            image.src = url;
        })
    }


    window.requestAnimationFrame(gameLoop)

    function gameLoop(timeStamp) {
        secondsPassed = (timeStamp - oldTimeStamp) / 1000;
        oldTimeStamp = timeStamp;

        if (typeof renderer !== 'undefined') {
            
            // Clear the canvas
            ctx.fillStyle = renderer.backgroundColor;
            ctx.fillRect(0,0,renderingCanvas.width,renderingCanvas.height);

            for (let i = 0; i < toDraw.length; i++) {
                let item = toDraw[i]
                ctx.save()
                if (item.type === 'rect') {
                    ctx.beginPath()

                    let drawX = item.x;
                    let drawY = item.y;
                    let translationX = 0;
                    let translationY = 0;

                    // rotate the rectangle if a rotation is specified.
                    if (item.rotation !== 0) {
                        // set the origin of the context to be the center of the rectangle.
                        translationX += item.x+(item.width/2);
                        translationY += item.y+(item.height/2);
                        ctx.translate(translationX,translationY)

                        // rotate the context to the rotation specified in degrees.
                        ctx.rotate(item.rotation * ( Math.PI/180))

                        // set the rectangle to draw so the center of the rectangle is at the context origin.
                        drawX = -item.width/2;
                        drawY = -item.height/2;
                    }

                    // if there is a border then draw one.
                    if (typeof item.border !== 'undefined') {
                        ctx.fillStyle = item.border.color;
                        let borderWidth = item.border.thickness;
                        ctx.fillRect(item.x-borderWidth,item.y-borderWidth,item.width+borderWidth*2,item.height+borderWidth*2);
                    }

                    // if there is a texture then set the fillStyle to it, if not then use the color of the rectangle.
                    if (typeof item.texture === 'undefined') {
                        ctx.fillStyle = item.color;
                    } else {
                        let matrix = new DOMMatrix();
                        pattern = item.texture;
                        if (item.texture.constructor.name === 'CanvasPattern') {
                            // move the patterns origin to be where the rectangle is going to be drawn.
                            pattern.setTransform(matrix.translate(drawX,drawY));
                            ctx.fillStyle = pattern;
                        }
                    }
                    // finally draw the rectangle
                    ctx.fillRect(drawX,drawY,item.width,item.height);

                    // set the context origin back to normal.
                    ctx.restore();
                    
                    ctx.closePath();
                }


                if (item.type === 'text') {
                    ctx.beginPath()
                    
                    let drawX = item.x;
                    let drawY = item.y;
                    let translationX = 0;
                    let translationY = 0;
                    
                    ctx.font = `${item.size}pt ${item.font}`;

                    if (item.rotation !== 0) {
                        metrics = ctx.measureText(item.content)
                        let fontHeight = metrics.actualBoundingBoxAscent
                        let fontWidth = ctx.measureText(item.content).width
                        translationY += item.y+(fontHeight/2)
                        translationX += item.x+(fontWidth/2)
                        ctx.translate(translationX,translationY)
                        ctx.rotate(item.rotation * ( Math.PI/180))
                        drawX = -(fontWidth/2);
                        drawY = -(fontHeight/2)+fontHeight;
                    }

                    if (typeof item.border.color !== 'undefined') {
                        ctx.strokeStyle = item.border.color;
                        ctx.lineWidth = item.border.thickness;
                        ctx.strokeText(item.content,drawX,drawY);
                    }

                    if (typeof item.texture === 'undefined') {
                        ctx.fillStyle = item.color;
                    } else {
                        let matrix = new DOMMatrix();
                        pattern = item.texture;
                        if (item.texture.constructor.name === 'CanvasPattern') {
                            pattern.setTransform(matrix.translate(drawX,drawY));
                            ctx.fillStyle = pattern;
                        }
                    }
                    
                    ctx.fillText(item.content,drawX,drawY);
                    ctx.restore();

                    ctx.closePath();
                }

                if (item.type === 'circle') {
                    ctx.beginPath()

                    let drawX = item.x;
                    let drawY = item.y;
                    let translationX = 0;
                    let translationY = 0;

                    // rotate the circle if a rotation is specified.
                    if (item.rotation !== 0) {
                        // set the origin of the context to be the center of the circle.
                        translationX += item.x;
                        translationY += item.y;
                        ctx.translate(translationX,translationY)

                        // rotate the context to the rotation specified in degrees.
                        ctx.rotate(item.rotation * ( Math.PI/180))

                        drawX = 0;
                        drawY = 0;
                    }

                    // if there is a border then draw one.
                    if (typeof item.border !== 'undefined') {
                        ctx.fillStyle = item.border.color;
                        let borderWidth = item.border.thickness;
                        ctx.beginPath();
                        ctx.arc(drawX,drawY,item.radius+borderWidth,0,Math.PI*2);
                        ctx.fill();
                        ctx.closePath();
                    }
                    // if there is a texture then set the fillStyle to it, if not then use the color of the circle.
                    if (typeof item.texture === 'undefined') {
                        ctx.fillStyle = item.color;
                    } else {
                        let matrix = new DOMMatrix();
                        pattern = item.texture;
                        if (item.texture.constructor.name === 'CanvasPattern') {
                            // move the patterns origin to be where the circle is going to be drawn.
                            pattern.setTransform(matrix.translate(drawX-item.radius,drawY-item.radius));
                            ctx.fillStyle = pattern;
                        }
                    }
                    // finally draw the circle
                    ctx.beginPath();
                    ctx.arc(drawX,drawY,item.radius,0,Math.PI*2);
                    ctx.fill();
                    ctx.closePath();

                    // set the context origin back to normal.
                    ctx.restore();
                    
                    ctx.closePath();
                }
            }

            if (renderer.debug === true) {
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
                ctx.fillText(`${renderingCanvas.id}`,8,22);
                ctx.font = '10pt Arial'
                ctx.fillText(`${time}`,9,40)
                ctx.fillText(`${fps} fps`,9,55)    
            }
        }
        window.requestAnimationFrame(gameLoop)
    }
}());
