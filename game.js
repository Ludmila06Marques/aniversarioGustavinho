


class MainScene extends Phaser.Scene {
    constructor() {
        super("MainScene");
    }

    preload() {
        // Carregamento das imagens e sons
        this.load.image("cloud1", "images/assets/scenery/overworld/cloud1.png");
        this.load.image("alice", "images/alice.png");
        this.load.image("java", "images/java.png");
        this.load.image("italia", "images/italia.png");
        this.load.image("floor", "images/assets/scenery/overworld/floorbricks.png");
        this.load.spritesheet("coin", "images/assets/collectibles/coin.png", { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet("person", "images/person.png", { frameWidth: 127, frameHeight: 98 });
        this.load.spritesheet("police", "images/policenew.png", { frameWidth: 234, frameHeight: 85 });
        this.load.audio("gameover", "images/gameover.mp3");
        this.load.audio("music", "images/music.mp3");
        this.load.audio("collect", "images/assets/sound/effects/coin.mp3");

        for (let i = 1; i <= 9; i++) {
            this.load.image(`place${i}`, `images/place${i}.png`);
        }

        this.load.image("ferry", "images/ferry.png");
        this.load.image("ferryMeio", "images/ferry-meio.jpg");
    }
  initGlobals() {

  
    coinSpacing = 200;
isFerry=false;
    nextCloudX = 0;
    nextFloorX = 0;
    nextCoinX = 0;
   
    ferryShown = false;
    ferryMeioCount = 60;
    ferryFinalShown = false;
    addFlagNext = false;

    score = 0;
    isDead = false;

    currentDecorationIndex = 0;
}
    create() {
        // Variáveis globais da cena
        sceneInstance = this;
        backgroundLayer = this.add.layer();

        camera = this.cameras.main;

        // Configurações iniciais de variáveis globais
         this.initGlobals();

        // Nuvens iniciais
        for (let x = 0; x < config.width * 2; x += cloudSpacing) {
            this.createCloudsAt(x);
        }
        nextCloudX = config.width * 2;
        if(!isPlaying){
              this.music = this.sound.add('music', { loop: true, volume: 0.2 });
        this.music.play();
        isPlaying=true
        }
        
        // Chão e ferry
        floorGroup = this.physics.add.staticGroup();
        ferryGroup = this.physics.add.staticGroup();
        meioFerryGroup = this.physics.add.staticGroup();
        nextFloorX = floorWidth * floorScale / 2;

        // Spawn inicial do chão/ferry
        while (nextFloorX < config.width) {
            if ((!ferryShown) || (ferryShown && ferryMeioCount > 0)) {
                if (camera.scrollX + config.width > nextFloorX - floorWidth * floorScale) {
                    this.createFloorTile();
                }
            }
        }

        // Criar jogador
        player = this.physics.add.sprite(50, 400, "person", 0);
        player.body.setSize(50, 100);
        player.body.setOffset(50, 0);
        player.setCollideWorldBounds(true);
        player.setBounce(0.1);
        player.setScale(1);
        player.setDepth(10);

        // Colisões jogador com chão/ferry
        this.physics.add.collider(player, floorGroup);
        this.physics.add.collider(player, ferryGroup);
        this.physics.add.collider(player, meioFerryGroup);
       
        // Configura limites do mundo e câmera
        this.physics.world.setBounds(0, 0, 20000, config.height);
        camera.setBounds(0, 0, 20000, config.height);
        camera.startFollow(player);

        // Controles do jogador
        keys = this.input.keyboard.createCursorKeys();

        // Animações
        this.createAnimations();

        // Grupo de inimigos
        enemies = this.physics.add.group();
        this.physics.add.collider(enemies, floorGroup);
        this.physics.add.collider(enemies, ferryGroup);
        this.physics.add.collider(player, enemies, this.playerEnemyCollision, null, this);


        fallingEnemies = this.physics.add.group();
         this.physics.add.collider(player, fallingEnemies, this.playerFallingEnemyCollision, null, this);
        // Grupo de moedas
        coinGroup = this.physics.add.group();
        this.physics.add.collider(coinGroup, floorGroup);
        this.physics.add.collider(coinGroup, ferryGroup);
        this.physics.add.collider(coinGroup, meioFerryGroup);
        this.physics.add.overlap(player, coinGroup, this.collectCoin, null, this);

        // Spawn inicial de moedas
        nextCoinX = 400;
        for (let i = 0; i < 10; i++) {
            this.spawnCoins();
        }

        // Texto da pontuação
        scoreText = this.add.text(16, 16, 'Pontuação: 0', {
            fontSize: '32px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        });
        scoreText.setScrollFactor(0);

        // Eventos de animação e morte do jogador
        player.on('animationcomplete-dead', () => {
            player.setVelocityY(200);
            player.body.setAllowGravity(true);
        });
          // Timer para spawnar inimigos a cada 3 segundos
          
          if(!isFerry){
            enemySpawnTimer = this.time.addEvent({
        delay: 3000,
        callback: this.spawnEnemy,
        callbackScope: this,
        loop: true
         }); 
          }
    
   ferrySensor = this.add.rectangle(5000, config.height - 16, 500, 500, 0, 0);
    this.physics.add.existing(ferrySensor, true);
    
    // 4. Só então adicione o overlap
    this.physics.add.overlap(player, ferrySensor, this.handleFerryCollision, null, this);
    }
 playerEnemyCollision(player, enemy) {

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
       this.killPlayer();
    }
}
 playerFallingEnemyCollision(player, enemy) {

    if (isDead) return;

    if (player.body.touching.up && enemy.body.touching.down) {
    this.killPlayer();
    } 
}
 spawnEnemy() {
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
spawnFallingEnemy() {
    if (isDead) return;

    const types = ["alice", "java"];
    const type = Phaser.Utils.Array.GetRandom(types);

    const x = Phaser.Math.Between(0, this.physics.world.bounds.width);
    const enemy = fallingEnemies.create(x, -50, type);
 
    enemy.setVelocityY(Phaser.Math.Between(100, 300));
    enemy.setCollideWorldBounds(false);
    enemy.setGravityY(0); // já tem velocidade
    enemy.setScale(0.2)
    enemy.body.setAllowGravity(false);
}

    update() {
        if (isDead) {
            player.setVelocityX(0);
            player.anims.play("dead", true);
            return;
        }

        if (player.y > config.height - 113 && !isDead) {
            this.killPlayer();
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

        // Spawn dinâmico de nuvens
        if (camera.scrollX + config.width > nextCloudX - cloudSpacing) {
            this.createCloudsAt(nextCloudX);
            nextCloudX += cloudSpacing;
        }

        // Spawn dinâmico de chão/ferry
        if (camera.scrollX + config.width > nextFloorX - floorWidth * floorScale) {
            this.createFloorTile();
        }
       enemies.children.iterate(function (enemy) {
   
    });

        // Movimento dos inimigos
        enemies.children.iterate(enemy => {
            if (enemy) {
                enemy.setVelocityX(enemy.x < player.x ? enemy.speed : -enemy.speed);
                enemy.setFlipX(enemy.body.velocity.x > 0);
            }
        });

        // Spawn dinâmico de moedas
        if (camera.scrollX + config.width > nextCoinX - coinSpacing) {
            this.spawnCoins();
            nextCoinX += coinSpacing;
        }
        // Se isFerry for true, destrói todos os inimigos existentes
if (isFerry && enemies.countActive(true) > 0) {
    enemies.children.iterate(enemy => {
        if (enemy) {
            enemy.destroy();
        }
    });
}

    }
handleFerryCollision() {
    isFerry=true;
    if (score < 200) {
        this.scene.start("SemDinheiroScene");
    }else{
       enemyCatSpawnTimer=this.time.addEvent({
        delay: 5000, // a cada 1.5s
        callback: this.spawnFallingEnemy,
        callbackScope: this,
        loop: true
    });
    }
}


    createAnimations() {
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
    }

    createCloudsAt(xStart) {
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
                    if (Math.abs(pos.x - x) < minSpacing && Math.abs(pos.y - y) < verticalSpacing) {
                        isTooClose = true;
                        break;
                    }
                }
                tries++;
            } while (isTooClose && tries < 10);

            if (!isTooClose) {
                usedPositions.push({ x, y });
                const cloud = this.add.image(x, y, "cloud1");
                cloud.setOrigin(0.5);
                cloud.setScale(0.5);
                cloud.setScrollFactor(0.5);
            }
        }
    }

   
 createFloorTile() {
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
//   ferrySensor = sceneInstance.physics.add.sprite(tileX, tileY, null)
//             .setSize(tile.displayWidth, 45)
//             .setOrigin(0.5, 1)
//             .setVisible(false); // Mantém invisível
//         ferrySensor.body.setAllowGravity(false);
//         ferrySensor.body.immovable = true;
//         // Adiciona a sobreposição para verificar a colisão
     
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

 spawnCoins() {
    const coinX = nextCoinX;
    // Limita a altura para que fique no chão ou um pouco acima, evitando que fiquem muito altas
    const coinY = Phaser.Math.Between((config.height / 2)+100, config.height - 100);
    const coin = coinGroup.create(coinX, coinY, "coin");
    coin.play("coin-idle");
    coin.body.setAllowGravity(false);
    coin.setScale(2);
}


    collectCoin(player, coin) {
        coin.disableBody(true, true);
   this.sound.play("collect", { volume: 0.2 }); // volume vai de 0.0 a 1.0

        score += 3
        scoreText.setText(`Pontuação: ${score}`);
    }

    // playerEnemyCollision(player, enemy) {
    //     this.killPlayer();
    // }

killPlayer() {
    if (isDead) return;

    isDead = true;
    player.setVelocityX(0);
    player.setCollideWorldBounds(false);
    keys.left.enabled = false;
    keys.right.enabled = false;
    keys.up.enabled = false;
    sceneInstance.sound.play("gameover");

    // Para o timer para evitar múltiplos timers ao reiniciar
    if (enemySpawnTimer) {
        enemySpawnTimer.remove(false);
    }
 if (enemyCatSpawnTimer) {
        enemyCatSpawnTimer.remove(false);
    }
    

    setTimeout(() => {
        player.setVelocityY(-250);
    }, 100);

    setTimeout(() => {
        sceneInstance.scene.restart();
        // isDead será resetado no initGlobals() quando a cena reiniciar
    }, 2000);
}


}
class GameOverScene extends Phaser.Scene {
    constructor() {
        super("GameOverScene");
    }

    create() {
        const width = this.sys.game.config.width;
        const height = this.sys.game.config.height;

        // Criar um gradiente vertical com as cores da bandeira da Itália (verde, branco, vermelho)
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });

        // Criando o gradiente manualmente usando retângulos verticais
        const thirdWidth = width / 3;

        // Verde
        graphics.fillStyle(0x009246, 1); // Verde da bandeira da Itália
        graphics.fillRect(0, 0, thirdWidth, height);

        // Branco
        graphics.fillStyle(0xffffff, 1);
        graphics.fillRect(thirdWidth, 0, thirdWidth, height);

        // Vermelho
        graphics.fillStyle(0xce2b37, 1); // Vermelho da bandeira da Itália
        graphics.fillRect(2 * thirdWidth, 0, thirdWidth, height);

        // Gerar a textura do gradiente
        graphics.generateTexture('italyGradient', width, height);

        // Adicionar o fundo com opacidade (para escurecer um pouco)
        this.add.image(width / 2, height / 2, 'italyGradient').setAlpha(0.9);

        // Texto centralizado com múltiplas linhas
        this.add.text(width / 2, height / 2 - 50, "Parabéns!\nVocê vai para a Itália!\nPartimos para Sardegna!!!!!!!!!", {
            fontSize: "40px",
            fill: "#000000",
            fontStyle: "bold",
            align: "center",
            stroke: "#ffffff",
            strokeThickness: 6,
            lineSpacing: 10,
            fontFamily: 'Arial',
        }).setOrigin(0.5);

        // // Botão centralizado abaixo do texto
        // const button = this.add.text(width / 2, height / 2 + 100, "Voltar ao Menu", {
        //     fontSize: "32px",
        //     fill: "#ffffff",
        //     backgroundColor: "#007700",
        //     padding: { x: 20, y: 10 },
        //     borderRadius: 5,
        //     fontFamily: 'Arial',
        // }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        // button.on("pointerdown", () => {
        //     this.scene.start("MainScene"); // Voltar para o jogo
        // });

        // button.on("pointerover", () => button.setStyle({ fill: "#00ff00" }));
        // button.on("pointerout", () => button.setStyle({ fill: "#ffffff" }));
    }
}
class SemDinheiroScene extends Phaser.Scene {
    constructor() {
        super("SemDinheiroScene");
    }

    create() {
        const width = this.sys.game.config.width;
        const height = this.sys.game.config.height;

        // Criar um fundo sólido azul claro
        const backgroundColor = 0x87CEFA; // Azul claro
        this.cameras.main.setBackgroundColor(backgroundColor);

        // Texto informativo
        this.add.text(width / 2, height / 2 - 50, "Você não tem dinheiro suficiente!\n Precisa de no minimo 200 pontos \nVolte e colete mais moedas!", {
            fontSize: "32px",
            fill: "#ffffff",
            align: "center",
            fontFamily: 'Arial',
            stroke: "#000000", // Adiciona contorno ao texto
            strokeThickness: 4
        }).setOrigin(0.5);

        // Botão para voltar ao jogo
        const button = this.add.text(width / 2, height / 2 + 50, "Voltar ao Jogo", {
            fontSize: "24px",
            fill: "#ffffff", // Texto do botão em branco
            backgroundColor: "#7287FF", // Botão vermelho
            padding: { x: 20, y: 10 },
            borderRadius: 5,
            fontFamily: 'Arial',
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        button.on("pointerdown", () => {
            this.scene.start("MainScene"); // Volta para a cena principal
        });

        button.on("pointerover", () => button.setStyle({ fill: "#000000" })); // Texto em preto ao passar o mouse
        button.on("pointerout", () => button.setStyle({ fill: "#ffffff" })); // Texto em branco ao sair
    }
}





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
            // debug: true
        }
    },
    scene: [MainScene, GameOverScene, SemDinheiroScene]
};

new Phaser.Game(config);
let isPlaying=false
// Variáveis globais
let score = 0;
let scoreText;
let nextCloudX ;
let isDead =false
const cloudSpacing = 600;
let music;
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
let fallingEnemies;
let enemySpawnTimer;
let enemyCatSpawnTimer;
let sceneInstance;
let backgroundLayer;
let ferryShown = false;
let ferryImage;
let meioRemainingWidth = 1000;
let scaledFloorWidth=400
const meioWidth = 200; // suponha que a imagem tenha 200px de largura (ajuste conforme necessário)
let ferryMeioCount = 20;
let isFerry=false;
let addFlagNext = false; // Novo flag
let ferrySensor;
let ferryFinalShown = false;

const floorDecorations = ["place1", "place2", "place3", "place4","place5", "place6", "place7","place8","place9"]; 
//  const floorDecorations = ["place1"]; 
let currentDecorationIndex = 0;

// const game = new Phaser.Game(config);
