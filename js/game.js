window.addEventListener('load', (event) => {
    window.Game = {
        defaultOptions: {
            canvasId: 'canvas',
            paragraphId: 'poem',
    
        },
    
        ctx: null,
        canvas: null,
        board: [],
        boardSize: 4,
        size: null,
        currentlyHighlighted: null,
        animationFrameId: null,
    
        init: function (options = {}) {
            this.onMouseDown = this.onMouseDown.bind(this);
            this.onMouseMove = this.onMouseMove.bind(this);
            this.onMouseUp = this.onMouseUp.bind(this);
            this.draw = this.draw.bind(this);

            options = Object.assign(this.defaultOptions, options);
    
            this.canvas = document.getElementById(options.canvasId);
            this.ctx = this.canvas.getContext('2d');
            this.canvas.removeEventListener('mousedown', this.onMouseDown)
            this.canvas.addEventListener("mousedown", this.onMouseDown);
            this.canvas.removeEventListener('mousemove', this.onMouseMove)
            this.canvas.addEventListener("mousemove", this.onMouseMove);
            this.canvas.removeEventListener('mouseup', this.onMouseUp)
            this.canvas.addEventListener("mouseup", this.onMouseUp);

            this.start();
         
            return this;
        },
    
        start: function () {
            this.size = this.canvas.width/this.boardSize;
            for (let row = 0; row < this.boardSize; ++ row) {
                this.board[row] = []
                for (let col = 0; col < this.boardSize; ++ col) {
                    let value = row*this.boardSize + col + 1;
                    if (value >= 16 ) {
                        this.board[row][col] = null;
                    } else {
                        this.board[row][col] = new Tile(value);
                    }
                   
                }
            }
    
            this.shuffle();
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = requestAnimationFrame(this.draw);
        },
    
        draw: function() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            for (let row = 0; row < this.boardSize; ++ row) {
                for (let col = 0; col < this.boardSize; ++ col) {
                    const tile =  this.board[row][col];
                    if (tile) {
                        tile.draw(this.ctx, row, col, this.size);
                    }
                }
            }
    
            // if (this.currentKlocek)
            this.animationFrameId = requestAnimationFrame(this.draw);
        },
    
        findAllowedToMove(startRow, startCol) {
            // Doing DFS here would be such an overkill
            let row;
            let col;
          
            for (let i = 0; i < 4; ++i) {
                row = (i < 2) ? startRow : startRow + Math.pow(-1, i % 2);
                col = (i < 2) ? startCol + Math.pow(-1, i % 2) : startCol; 
                if (this.isInBounds(row) && this.isInBounds(col) && this.board[row][col] == null) {
                    return {row, col};
                }
            }
    
            return null;
        },
    
        shuffle() {
            const swap = (coordsA, coordsB) => {
                if (this.board[coordsA.row][coordsA.col] == null ||    this.board[coordsB.row][coordsB.col] == null) {
                    return;
                }
                const temp = this.board[coordsA.row][coordsA.col];
                this.board[coordsA.row][coordsA.col] = this.board[coordsB.row][coordsB.col];
                this.board[coordsB.row][coordsB.col] = temp;
            }
    
            for(let i = 0; i < 10000; ++i) {
                swap({
                    row:  Math.floor(Math.random() * (this.boardSize)),
                    col:  Math.floor(Math.random() * (this.boardSize))
                }, {
                    row:  Math.floor(Math.random() * (this.boardSize)),
                    col:  Math.floor(Math.random() * (this.boardSize))
                })
            }
             
        },
    
        isInBounds(x) {
            return x >= 0 && x < this.boardSize;
        },
    
        onMouseDown: function (event) {
            event.preventDefault();
            var x = event.x;
            var y = event.y;
            x -= this.canvas.offsetLeft;
            y -= this.canvas.offsetTop;
    
            const row = Math.floor(y/this.size);
            const col = Math.floor(x/this.size);
            if(this.isInBounds(row) && this.isInBounds(col)) {
                const tile = this.board[row][col];
       
                if (tile) {
                    allowedMove = this.findAllowedToMove(row, col);
                    if (allowedMove !== null) {
                        this.board[allowedMove.row][allowedMove.col] = tile;
                        this.board[row][col] = null;
                    }
                
                }
            }
        
        },
    
        onMouseMove: function (event) {
            event.preventDefault();
            var x = event.x;
            var y = event.y;
            x -= this.canvas.offsetLeft;
            y -= this.canvas.offsetTop;
    
            const row = Math.floor(y/this.size);
            const col = Math.floor(x/this.size);
            if(this.isInBounds(row) && this.isInBounds(col)) {
                const tile = this.board[row][col];
    
                if (tile != this.currentlyHighlighted) {
                    if (this.currentlyHighlighted) {
                        this.currentlyHighlighted.hover = false;
                    }
                    this.currentlyHighlighted = tile;
                    if (tile) {
                        tile.hover = true;
                    }
                 
                } 
             
            }
          
        },
    
        onMouseUp: function (event) {
            event.preventDefault();
    
        }
    }.init();
});


function Tile(value, color = '#cd8500') {
    this.value = value
    this.color = color;
    this.hover = false;

    this.draw = (ctx, row, col, size) => {
        const x = col * size;
        const y = row * size;

        ctx.save();
        ctx.fillStyle = "#000000";
        ctx.strokeRect(x, y, size, size);
        ctx.fillStyle = this.hover ? `rgba(${this.color.substring(1).match(/.{2}/g).map(c => parseInt(c, 16)).join(',')}, 0.5)`: this.color;
        ctx.fillRect(x + 2, y + 2, size - 4, size - 4);

        ctx.textAlign = 'center';
        ctx.font = '20px serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(this.value, x + size/2, y + size/2);
        ctx.restore();
     
    }
}
