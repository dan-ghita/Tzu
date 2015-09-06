document.addEventListener("DOMContentLoaded", function(event) { 
  play();
});

function play() {
    var jumpSound = new Audio("AUDIO/Tzu_Jump.mp3"); 
    var themeSound = new Audio("AUDIO/Tzu_Theme.mp3");
    var deathSound = new Audio("AUDIO/Tzu_Death.mp3");
    var victorySound = new Audio("AUDIO/Tzu_Victory_Dance_of_the_Penguin.mp3");
    
    var MIN_BLOCK_HEIGHT = 150;
    var MAX_BLOCK_HEIGHT = 350;
    var INVISIBLE_X_COORDINATE = -1000;
    var MAX_NUMBER_OF_BLOCKS = 15;
    
    var gameCanvas = document.getElementById("graphics");
    var victoryPenguin = document.getElementById("victory-penguin");
    var grafx = gameCanvas.getContext("2d");
    var player = new Object("IMAGES/player.png", 100, 100, 32, 31);
    var block = new Array ();

    gameCanvas.style.display = "block";
    victoryPenguin.style.display = "none";

    for(var i = 0; i < 4; i++) 
        block[i] = new Object('IMAGES/block.jpg', i * 32 + 100, MAX_BLOCK_HEIGHT, 32, 31);

    for(var i = 4; i < MAX_NUMBER_OF_BLOCKS; ++i) {
        var visible = Math.floor(Math.random() * 2);
        var newX = i * 32 + 100;    
        var newY = MIN_BLOCK_HEIGHT + (block[i - 1].Y + Math.floor(Math.random() * 2 - 1) * 31) % (MAX_BLOCK_HEIGHT - MIN_BLOCK_HEIGHT);           

        if(visible == 0 && i != MAX_NUMBER_OF_BLOCKS - 1) {
            var lastY = 0;
            
//          If the new block is reachable from at least one of the last 4 blocks, make it invisible
            for(var j = 1; j <= 4; ++j) {
                if(block[i - j].X != INVISIBLE_X_COORDINATE) 
                    lastY = block[i - j].Y;
            }
            
            if(lastY != 0) {
                newX = INVISIBLE_X_COORDINATE;
                newY = lastY;
            }
        }

        if(i == MAX_NUMBER_OF_BLOCKS - 1)	
            block[i] = new Object('IMAGES/finish.jpg', newX, newY, 32, 31);
        else
            block[i] = new Object('IMAGES/block.jpg', newX, newY, 32, 31);
    }

    var isLeft = false;
    var isRight = false;
    var isSpace = false;
    player.Gravity = 20;
    player.Weight = 0.08 ;

    //EVENTS

    var body = document.getElementById("body");

    body.onkeydown = function(e) {
        if(e.keyCode==37) isLeft = true;
        if(e.keyCode==39) isRight = true;
        if(e.keyCode==32) isSpace = true;
    }

    body.onkeyup = function(e) {
        if(e.keyCode==37) isLeft = false;
        if(e.keyCode==39) isRight = false;
        if(e.keyCode==32) isSpace = false;
    }

    themeSound.play();
    MainLoop();

    function MainLoop() {
        if(player.Y > 400) {
            themeSound.pause();
            deathSound.play();
            setTimeout(play, 3000);
            return;
        }

        for(var i= 0; i < MAX_NUMBER_OF_BLOCKS ; i++) {
            block[i].X -= player.Velocity_X;
        }

        player.Previous_Y = player.Y;
        player.Y += player.Velocity_Y;

        if(player.Velocity_Y < player.Gravity) 
            player.Velocity_Y += player.Weight;     

        // Check if player won
        if(player.isCollidingVertically(block[MAX_NUMBER_OF_BLOCKS - 1])) {
            themeSound.pause();
            victorySound.play();			
            gameCanvas.style.display = "none";
            victoryPenguin.style.display = "block";
            setTimeout(play, 10000);
            return;
        }

        for(var i = 0; i < MAX_NUMBER_OF_BLOCKS; i++) {
            // Check if player is on a block
            if(player.isCollidingVertically(block[i])) {
                player.Y = player.Previous_Y; 
                player.Velocity_Y = 0;
                break;           
            }        
        }

        if(isLeft) player.Velocity_X = -1.5;
        if(isRight) player.Velocity_X = 1.5;   
        if(!isLeft && !isRight && player.Velocity_Y == 0  ) player.Velocity_X = 0;    

        player.Previous_X = player.X;
        player.X += player.Velocity_X;

        for(var i = 0; i < MAX_NUMBER_OF_BLOCKS; i++) {
            // check if player would be colliding block[i]
            if(player.isCollidingHorizontally(block[i])) {

                player.Velocity_X = 0;        
            }
        }

        player.X = player.Previous_X;


        if (isSpace && player.Velocity_Y == 0 ) {
            player.Velocity_Y = -5;
            jumpSound.play();
        }    

        grafx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);  

        for(var i = 0; i < MAX_NUMBER_OF_BLOCKS; i++) {
            grafx.drawImage(block[i].Sprite, block[i].X, block[i].Y );
        } 
        grafx.drawImage(player.Sprite, player.X, player.Y );   

        setTimeout(MainLoop, 1000/690);    
    }
}

function Object(img, x, y, width, height) {
    this.Sprite = new Image()
    this.Sprite.src = img;
    this.X = x;
    this.Y = y;
    this.Width = width;
    this.Height = height;
    this.Previous_X = 0;
    this.Previous_Y = 0;
    this.Velocity_X = 0;
    this.Velocity_Y = 0;
    this.Gravity = 0;
    this.Weight = 0;
    this.epsilon = 10;

    this.isCollidingHorizontally = function(obj) {
        if(this.Y + this.Height >= obj.Y && this.Y <= obj.Y || this.Y <= obj.Y + obj.Height && this.Y >= obj.Y) {            
            if(this.X + this.Width >= obj.X && this.X <= obj.X || this.X <= obj.X + obj.Width && this.X >= obj.X)
                return true;
        }

        return false;
    }

    this.isCollidingVertically = function(obj) {
        if(this.X + this.Width >= obj.X + this.epsilon && this.X <= obj.X || this.X <= obj.X + obj.Width - this.epsilon && this.X >= obj.X) {
            if(this.Y + this.Height > obj.Y && this.Y < obj.Y || this.Y < obj.Y + obj.Height && this.Y > obj.Y)
                return true;
        }
        return false;
    }
}

function displayHelp() {
    var help = document.getElementById("help");
    if(help.innerHTML == "") {
        var text = "Use the left, right and up arrow keys to move.";
        help.style.backgroundColor = "white";
        help.style.fontSize = "1.5em";
        help.style.color = "blue";
        help.style.textAlign = "center";
        help.appendChild(document.createTextNode(text));
        var button = document.getElementById("demo");
    }
    else {
        help.style.display = "block";
    }
    demo.onclick = hideHelp;
}

function hideHelp() {
    var help = document.getElementById("help");
    help.style.display = "none";
    demo.onclick = displayHelp;
}