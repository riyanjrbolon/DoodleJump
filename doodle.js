const canvas = document.getElementById('game-canvas');
let platFormGap = 0;
let score = 0;
let highScore = 0;

class Doodler {
    constructor() {
        this.context = canvas.getContext("2d");
        this.x = canvas.width / 2;
        this.y = canvas.height - 200;
        this.image = new Image();
        this.image.src = 'assets/doodler-right.png'
        this.prevY = this.y;
        this.width = 50;
        this.height = 50;
        this.vx = 0;
        this.vy = 0;
        this.gravity = 0.03;
        this.jumpStrength = -2.5;
    }

    // function ini untuk update posisi doodle
    updatePosition() {
        this.prevY = this.y;
        this.x += this.vx;
        this.y += this.vy;
        if(this.vy > 3.5) {
            this.vy = 3.5;
        } else {
            this.vy += this.gravity;
        }

        this.checkForWrapDoodler();
        this.checkCollisionWithPlatforms();
    }

    // function ini memeriksa apakah
    // apakah doodler berada diluar canvas secara horizontal
    // atau f.e. doodler meninggalkan canvas kekir
    // doodler akan masuk kembali ke kanan
    // atau sebaliknya
    checkForWrapDoodler() {
        if(this.x + this.width < 0) {
            this.x = canvas.width;
        } else if(this.x > canvas.width) {
            this.x = 0 - this.width;
        }
    }

    // now we need to add a hitcollision so our doodler can jump upwards
    checkCollisionWithPlatforms() {
        // ini memastikan dooler memeriksa jika ada tabrakan
        // dan saat doodler jatuh
        if(this.vy <= 0) {
            return;
        }

        // memastikan doodle datang dari atas,
        // platform dan kondisi lainnya memeriksa dua kotak berpotongan
        for(let i = 0; i < platForms.length; i++) {
            let platform = platForms[i];
            if(
                (this.prevY + this.height + 20) >= platform.y &&
                this.x + this.width > platform.x &&
                this.x < platform.x + platform.width &&
                this.y + this.height > platform.y &&
                this.y < platform.y + platform.height &&
                this.prevY < platform.y
            ) {
                this.jump(platform);
            }
        }
    }

    // ini jika ada memastikan doodler tidak memlompat terlalu cepat
    // keatas ,karena akan kalah
    jump(platform) {
        let newHeight = platform.y - this.height;
        if(newHeight > (canvas.height / 2 - 120)) {
            this.y = platform.y - this.height;
            this.vy = this.jumpStrength;
        }
    }

    moveRight() {
        this.vx += 4;
        this.image.src = 'assets/doodler-right.png';
    }

    moveLeft () {
        this.vx -= 4;
        this.image.src = 'assets/doodler-left.png';
    }

    draw() {
        this.context.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}

class Platform {
    // constructor untuk kelas platform
    constructor(x, y) {
        this.context = canvas.getContext("2d");
        this.image = new Image();
        this.image.src = 'assets/platform.png';
        this.x = x;
        this.y = y;
        this.width = 100;
        this.height = 20;
    }

    // ini untuk pembaruan posisi dalam platform
    draw() {
        this.context.drawImage(this.image, this.x, this.y, this.width, this.height);
    }

}

let platForms = [];
const doodler = new Doodler();

// ini function untuk membantu mendapatkkan secara acak
// angka diantara dua angka
function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
} 

// to display the end menu we saw previously
function showEndMenu() {
    document.getElementById('end-game-menu').style.display = 'block';
    document.getElementById('end-game-score').innerHTML = score;

    // well we need to add the score...
    if(highScore < score) {
        highScore = score;
    }

    document.getElementById('high-score').innerHTML = highScore;
}

function hideEndMenu() {
    document.getElementById('end-game-menu').style.display = 'none';
}


// ini functionn untuk suara doodle
function addListeners() {
    document.addEventListener('keydown', function(event) {
        if(event.code === "ArrowLeft") {
            doodler.moveLeft();
        } else {
            doodler.moveRight();
        }
    });

    document.addEventListener('keyup', function(event) {
        if(event.code === "ArrowLeft" || event.code === "ArrowRight") {
            doodler.vx = 0;
        }
    });

    document.getElementById("retry").addEventListener('click', function() {
        hideEndMenu();
        resetGame();
        loop();
    });
}

// ini function awal mula platform
function createPlatforms(platFormCount) {
    platFormGap = Math.round(canvas.height / platFormCount);

    for(let i = 0; i < platFormCount; i++) {
        // while loop
        // untuk agar membuat platform selalu ke kiri, ke kanan, dan ditengah
        let xpos = 0;
        do {
            xpos = randomInteger(25, canvas.width - 25 - 100);
        } while (
            xpos > canvas.width / 2 - 100 * 1.5 &&
            xpos < canvas.width / 2 + 100 / 2
        )
        let y = (canvas.height / 1.5) - i * platFormGap;
        platForms.push(new Platform(xpos, y));   
    }
}

// doodle saat begerak 
// kiri atau kanan
function setup() {
    platForms.push(new Platform(doodler.x, (doodler.y + 80)));
    createPlatforms(6);
}

function resetGame() {
    // ini untuk reset game atau untuk selesai game
    // jika doodle salah jatuh
    doodler.x = canvas.width / 2;
    doodler.y = canvas.height - 100;
    doodler.vx = 0;
    doodler.vy = 0;
    score = 0;
    // reset platform
    platForms = [];
    setup();
}

// untuk menampilkan skor ditengah atas canvas
function scoreText() {
    doodler.context.font = '20px Arial';
    doodler.context.fillStyle = 'black';
    doodler.context.textAlign = 'center';
    doodler.context.fillText(`Score: ${Math.round(score)}`, canvas.width / 2, 50);
}


// function untuk update platforms
// tidak terlihat lagi dan untuk memperbarui skor
function updatePlatformsAndScore() {
    // ini salinan array platform
    let platformsCpy = [...platForms];
    platForms = platForms.filter(platform_ => platform_.y < canvas.height);
    score += platformsCpy.length - platForms.length;
}

function loop() {
    doodler.context.clearRect(0, 0, canvas.width, canvas.height);

    if(doodler.y < canvas.height / 2 && doodler.vy < 0) {
        // ini membuat lebih banyak platform saat naik
        platForms.forEach(platform => {
            platform.y += -doodler.vy * 2;
        });

        // ini membuat lebih banyak platform di sini jika naik
        platForms.push(new Platform(randomInteger(25, canvas.width - 25 - 100),
            platForms[platForms.length - 1].y - platFormGap * 2));
    }

    doodler.draw();
    doodler.updatePosition();

    platForms.forEach(platform => {
        platform.draw();
    });

    scoreText();
    // di sini memeriksa apakah doodle jatuh di bawah semua platform
    if(doodler.y > canvas.height) {
        showEndMenu();
        return;
    }

    updatePlatformsAndScore()

    requestAnimationFrame(loop);
}

addListeners();
setup();
loop();