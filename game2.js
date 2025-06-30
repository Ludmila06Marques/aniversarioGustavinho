const config = {
    type: Phaser.AUTO,
    width: window.innerWidth - 30,
    height: window.innerHeight - 30,
    backgroundColor: "#7287ff",
    parent: "game",
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 500 },
            debug: true
        }
    },
    scene: {
        preload,
        create,
        update
    }
};

// Variáveis globais
let score = 0;
let scoreText;

const cloudSpacing = 600;
let nextCloudX = 0;
let isDead = false;
const floorWidth = 120;
const floorScale = 3;
const minGap = 50;
const maxGap = 190;
let coinGroup;
let coinSpacing =200
let nextCoinX = 0;
let nextFloorX = 0;
let camera;
let player;
let keys;
let floorGroup;
let ferryGroup;
let meioFerryGroup;
let enemies;
let enemySpawnTimer;
let sceneInstance;
let backgroundLayer;
let ferryShown = false;
let ferryImage;
let meioRemainingWidth = 1000;
let scaledFloorWidth=400
const meioWidth = 200; // suponha que a imagem tenha 200px de largura (ajuste conforme necessário)
let ferryMeioCount = 20;

let addFlagNext = false; // Novo flag

let ferryFinalShown = false;

// const floorDecorations = ["place1", "place2", "place3", "place4","place5", "place6", "place7","place8","place9"]; 
const floorDecorations = ["place1"]; 
let currentDecorationIndex = 0;

new Phaser.Game(config);

function preload() {
    this.load.image("cloud1", "images/assets/scenery/overworld/cloud1.png");
     this.load.image("italia", "images/italia.png");
    this.load.image("floor", "images/assets/scenery/overworld/floorbricks.png");
       this.load.spritesheet("coin", "images/assets/collectibles/coin.png", {
        frameWidth: 16,
        frameHeight: 16
    });
    this.load.spritesheet("person", "images/person.png", {
        frameWidth: 127,
        frameHeight: 98
    });
    this.load.spritesheet("police", "images/policenew.png", {
        frameWidth: 234,
        frameHeight: 85,
    });
    this.load.audio("gameover", "images/assets/sound/music/gameover.mp3");
     this.load.audio("collect", "images/assets/sound/effects/coin.mp3");

     this.load.image("place1", "images/place1.png");
this.load.image("place2", "images/place2.png");
this.load.image("place3", "images/place3.png");
this.load.image("place4", "images/place4.png");
this.load.image("place5", "images/place5.png");
this.load.image("place6", "images/place6.png");
this.load.image("place7", "images/place7.png");
this.load.image("place8", "images/place8.png");
this.load.image("place9", "images/place9.png");
this.load.image("ferry", "images/ferry.png");
this.load.image("ferryMeio", "images/ferry-meio.jpg");
    }

function create() {
    sceneInstance = this;
backgroundLayer = this.add.layer();

    camera = this.cameras.main;

    // Nuvens iniciais
    for (let x = 0; x < config.width * 2; x += cloudSpacing) {
        createCloudsAt(this, x);
    }
    nextCloudX = config.width * 2;

    // Chão
    floorGroup = this.physics.add.staticGroup();
    ferryGroup = this.physics.add.staticGroup();
    meioFerryGroup = this.physics.add.staticGroup();
    nextFloorX = floorWidth * floorScale / 2;
    while (nextFloorX < config.width) {
 if (( !ferryShown ) || ( ferryShown && meioRemainingWidth > 0 )) {
    if (camera.scrollX + config.width > nextFloorX - floorWidth * floorScale) {
        createFloorTile();
    }
}

    }

    // Jogador
    player = this.physics.add.sprite(300, 400, "person", 0);
    player.body.setSize(50, 100);
        player.body.setOffset(50,0 );

    player.setCollideWorldBounds(true);
    player.setBounce(0.1);
    player.setScale(1);
    player.setDepth(10);

    this.physics.add.collider(player, floorGroup);
    this.physics.add.collider(player, ferryGroup);
     this.physics.add.collider(player, meioFerryGroup);
    // Limites do mundo
    this.physics.world.setBounds(0, 0, 20000, config.height);
    this.cameras.main.setBounds(0, 0, 20000, config.height);
    this.cameras.main.startFollow(player);

    // Controles
    keys = this.input.keyboard.createCursorKeys();

    // Animações
    this.anims.create({
        key: "walk",
        frames: this.anims.generateFrameNumbers("person", { start: 0, end: 2 }),
        frameRate: 8,
        repeat: -1
    });
     this.anims.create({
        key: "coin-idle",
        frames: this.anims.generateFrameNumbers("coin", { start: 0, end: 3 }),
        frameRate: 12,
        repeat: -1
    });

    this.anims.create({
        key: "jump",
        frames: [
            { key: "person", frame: 0, duration: 150 },
            { key: "person", frame: 3, duration: 150 },
            { key: "person", frame: 2, duration: 150 }
        ],
        repeat: 0
    });

    this.anims.create({
        key: "dead",
        frames: [{ key: "person", frame: 4 }],
        frameRate: 1,
        repeat: 0
    });

    // Grupo de inimigos
    enemies = this.physics.add.group();
    this.physics.add.collider(enemies, floorGroup); // inimigos colidem com o chão
    this.physics.add.collider(enemies, ferryGroup); // inimigos colidem com o chão
   
    this.physics.add.collider(player, enemies, playerEnemyCollision);
   
    // // Timer para spawnar inimigos a cada 3 segundos
    // enemySpawnTimer = this.time.addEvent({
    //     delay: 3000,
    //     callback: spawnEnemy,
    //     callbackScope: this,
    //     loop: true
    // });

    player.on('animationcomplete-dead', () => {
        player.setVelocityY(200);
        player.body.setAllowGravity(true);
    });
      coinGroup = this.physics.add.group();
    this.physics.add.collider(coinGroup, floorGroup);
      this.physics.add.collider(coinGroup, ferryGroup);
          this.physics.add.collider(coinGroup, meioFerryGroup);
    this.physics.add.overlap(player, coinGroup, collectCoin, null, this);

    // Começa spawnando algumas moedas
    nextCoinX = 400; // começa spawnando depois do player um pouco
    for (let i = 0; i < 10; i++) {
        spawnCoins(this);
    }
    scoreText = this.add.text(16, 16, 'Pontuação: 0', {
    fontSize: '32px',
    fill: '#ffffff',
    fontFamily: 'Arial'
});
scoreText.setScrollFactor(0); // para o texto não mexer com a câmera

}

function update() {
    if (isDead) {
        player.setVelocityX(0);
        player.anims.play("dead", true);
        return;
    }

    if (player.y > config.height - 113 && !isDead) {
        killPlayer();
        return;
    }

    // Movimento do jogador
    if (keys.left.isDown) {
        player.setVelocityX(-160);
        player.setFlipX(true);
        if (player.body.touching.down) player.anims.play("walk", true);
    } else if (keys.right.isDown) {
        player.setVelocityX(160);
        player.setFlipX(false);
        if (player.body.touching.down) player.anims.play("walk", true);
    } else {
        player.setVelocityX(0);
        if (player.body.touching.down) {
            player.anims.stop();
            player.setFrame(0);
        }
    }

    if (keys.up.isDown && player.body.touching.down) {
        player.setVelocityY(-330);
        player.anims.play("jump", true);
    }

    if (!player.body.touching.down && player.body.velocity.y !== 0) {
        if (player.anims.currentAnim?.key !== "jump") {
            player.anims.play("jump", true);
        }
    }

    // Nuvens dinâmicas
    if (camera.scrollX + config.width > nextCloudX - cloudSpacing) {
        createCloudsAt(sceneInstance, nextCloudX);
        nextCloudX += cloudSpacing;
    }

    // Chão dinâmico
    if (camera.scrollX + config.width > nextFloorX - floorWidth * floorScale) {
        createFloorTile();
    }

    // Movimento dos inimigos — apenas ajusta velocidade e flip, sem mexer na posição Y
enemies.children.iterate(enemy => {
    if (enemy) {
        // Ajusta a velocidade para perseguir o player
        if (enemy.x < player.x) {
            enemy.setVelocityX(enemy.speed);
        } else {
            enemy.setVelocityX(-enemy.speed);
        }

        // Agora, flip baseado na direção da velocidade do próprio inimigo
        if (enemy.body.velocity.x > 0) {
            enemy.setFlipX(true);  // olhando para a direita
        } else if (enemy.body.velocity.x < 0) {
            enemy.setFlipX(false);   // olhando para a esquerda
        }
    }
});



       if (camera.scrollX + config.width > nextCoinX - coinSpacing) {
        spawnCoins(sceneInstance);
        nextCoinX += coinSpacing;
    }
}
function spawnCoins(scene) {
    // Spawnar entre 1 e 3 moedas numa faixa horizontal e altura variável
    const numCoins = Phaser.Math.Between(1, 3);
    for (let i = 0; i < numCoins; i++) {
        const x = nextCoinX + i * 30;
        const y = Phaser.Math.Between(config.height - 250, config.height - 150); // altura acima do chão

        const coin = coinGroup.create(x, y, "coin");
        coin.setScale(1.5);
        coin.body.setAllowGravity(false);
        coin.anims.play("coin-idle", true);
    }
}
function collectCoin(player, coin) {
    sceneInstance.sound.play("collect");
    coin.destroy();
    score += 1;
    scoreText.setText('Pontuação: ' + score);
     

}


// Variáveis de controle globais



function createFloorTile() {
    const tileX = nextFloorX;
    const tileY = config.height - 16;

    // 1. Cria ferry inicial (antes de qualquer chão!)
    if (!ferryShown && currentDecorationIndex >= floorDecorations.length) {
        const tile = ferryGroup.create(tileX, tileY, "ferry")
            .setScale(1)
            .refreshBody();

        tile.body.setSize(tile.displayWidth, 45);
        tile.body.setOffset(0, 200);

        const ferryImage = sceneInstance.add.image(tileX, tileY + 100, "ferry");
        ferryImage.setOrigin(0.5, 1);
        ferryImage.setScrollFactor(1);
        ferryImage.setDepth(0);
        ferryImage.setScale(1);

        ferryShown = true;
        nextFloorX += ferryImage.displayWidth - 205;
        return;
    }

    // 2. Cria ferry do meio
    if (ferryShown && ferryMeioCount > 0) {
        const tile = meioFerryGroup.create(nextFloorX, tileY - 110, "ferryMeio")
            .setScale(0.6105)
            .refreshBody();

        tile.body.setSize(tile.displayWidth, 45);
        tile.body.setOffset(0, 273);

        ferryMeioCount--;
        nextFloorX += tile.displayWidth * 0.7;
        return;
    }

    // 3. Cria ferry final (espelhado)
    if (ferryShown && ferryMeioCount === 0 && !ferryFinalShown) {
        const tile = ferryGroup.create(nextFloorX, tileY, "ferry")
            .setScale(1)
            .setFlipX(true)
            .refreshBody();

        tile.body.setSize(tile.displayWidth, 45);
        tile.body.setOffset(0, 200);

        const ferryEndImage = sceneInstance.add.image(nextFloorX, tileY + 100, "ferry");
        ferryEndImage.setOrigin(0.5, 1);
        ferryEndImage.setScrollFactor(1);
        ferryEndImage.setDepth(0);
        ferryEndImage.setScale(1);
        ferryEndImage.setFlipX(true);

        ferryFinalShown = true;
        nextFloorX += ferryEndImage.displayWidth - 205;
       if(!addFlagNext){
        addFlagNext = true; // ⚠️ Adiciona a bandeira no próximo chão
       }
        
        return;
    }

    // 4. Cria chão normal + decoração (ou bandeira da Itália)
    const tile = floorGroup.create(tileX, tileY, "floor")
        .setScale(floorScale)
        .refreshBody();

    // Verifica se deve adicionar a bandeira da Itália
    console.log(addFlagNext)
if (addFlagNext) {
    const flag = sceneInstance.add.image(tileX, tileY - 45, "italia");
    flag.setScale(1.2);
    flag.setOrigin(0.5, 1);
    flag.setScrollFactor(1);
    flag.setDepth(1);

    // Sensor invisível para colisão com o jogador
    const flagSensor = sceneInstance.physics.add.sprite(tileX, tileY - 50, null)
        .setSize(20, 40)
        .setOrigin(0.5, 1)
        .setVisible(false);

    flagSensor.body.setAllowGravity(false);
    flagSensor.body.immovable = true;

    sceneInstance.physics.add.overlap(player, flagSensor, () => {
        console.log("Bandeira tocada! Fim de jogo!");
        sceneInstance.scene.start("GameOverScene");
    });

    addFlagNext = false;
}

 else if (currentDecorationIndex < floorDecorations.length) {
        // Se não for bandeira, adiciona decoração normal
        const decorationKey = floorDecorations[currentDecorationIndex];
        const decoration = sceneInstance.add.image(tileX, tileY - 45, decorationKey);
        decoration.setScale(0.8);
        decoration.setOrigin(0.5, 1);
        decoration.setScrollFactor(1);
        backgroundLayer.add(decoration);
        backgroundLayer.setDepth(-1);
        currentDecorationIndex++;
    }

    nextFloorX += scaledFloorWidth + Phaser.Math.Between(minGap, maxGap);
}





// Criar corpo físico para ferry com tamanho personalizado
// function createFerryPhysics() {
//     // Criar um corpo físico estático invisível para ferry
//     const ferryBody = sceneInstance.physics.add.staticImage(
//         ferryImage.x, 
//         ferryImage.y - ferryImage.displayHeight / 2,  // Ajustar para o centro do corpo de colisão
//         null
//     );

//     // Definir o tamanho do corpo de colisão do ferry (largura e altura customizados)
//     ferryBody.setSize(150, 100);  // ajuste os valores conforme desejar
//     ferryBody.setOffset(-75, -50); // para centralizar o corpo no ferry

//     ferryBody.setVisible(false); // invisível, só colisão

//     // Ativar colisão entre player e ferryBody
//     sceneInstance.physics.add.collider(player, ferryBody);
    
//     // Retornar o corpo para manipulação futura se quiser
//     return ferryBody;
// }






function createCloudsAt(scene, xStart) {
    const minSpacing = 150;
    const verticalSpacing = 80;
    const numClouds = Phaser.Math.Between(2, 3);
    const usedPositions = [];

    for (let i = 0; i < numClouds; i++) {
        let tries = 0;
        let x, y, isTooClose;

        do {
            isTooClose = false;
            x = xStart + Phaser.Math.Between(0, cloudSpacing - 100);
            y = Phaser.Math.Between(50, config.height / 2);

            for (const pos of usedPositions) {
                const dx = Math.abs(pos.x - x);
                const dy = Math.abs(pos.y - y);
                if (dx < minSpacing && dy < verticalSpacing) {
                    isTooClose = true;
                    break;
                }
            }

            tries++;
        } while (isTooClose && tries < 10);

        if (!isTooClose) {
            usedPositions.push({ x, y });
            const cloud = scene.add.image(x, y, "cloud1");
            cloud.setOrigin(0.5);
            cloud.setScale(0.5);
            cloud.setScrollFactor(0.5);
        }
    }
}

function spawnEnemy() {
  if (isDead) return;

    // Spawn antes ou depois do player
    const spawnBefore = Phaser.Math.Between(0, 1) === 0;
    let spawnX;

    if (spawnBefore) {
        spawnX = player.x - Phaser.Math.Between(400, 800);
        if (spawnX < 0) spawnX = 0;
    } else {
        spawnX = player.x + Phaser.Math.Between(400, 800);
        if (spawnX > 20000) spawnX = 20000;
    }

    const enemy = enemies.create(spawnX,1500, "police", 1);
    enemy.setOrigin(0.5, 1); // alinha o pé com o chão
    enemy.setScale(1);

    enemy.setCollideWorldBounds(true);
    enemy.body.setAllowGravity(true);
    enemy.setBounce(0);
    enemy.setImmovable(false);

    // Ajusta a caixa de colisão, se necessário
    enemy.body.setSize(180, 60);   // ajuste conforme sprite
    enemy.body.setOffset(30, 25);  // deslocamento da hitbox

   enemy.speed = Phaser.Math.Between(50, 300);

}
function playerEnemyCollision(player, enemy) {
    if (isDead) return;

    if (player.body.touching.down && enemy.body.touching.up) {
        // Ativa o frame 0 (por exemplo, um frame de "morte")
        enemy.setFrame(0);
        enemy.setVelocityX(0);
        enemy.body.enable = false; // Desativa colisão para não interferir

        // Espera 1 segundo e depois destrói
        sceneInstance.time.delayedCall(700, () => {
            enemy.destroy();
        });

        score += 10;
        scoreText.setText('Pontuação: ' + score);
        player.setVelocityY(-300);
    } else {
        killPlayer();
    }
}








function killPlayer() {
    if (isDead) return;

    isDead = true;
    player.setVelocityX(0);
    player.setCollideWorldBounds(false);
    keys.left.enabled = false;
    keys.right.enabled = false;
    keys.up.enabled = false;
    sceneInstance.sound.play("gameover");

    setTimeout(() => {
        player.setVelocityY(-250);
    }, 100);

    setTimeout(() => {
        sceneInstance.scene.restart();
        isDead = false;
    }, 2000);
}
