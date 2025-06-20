import { createMarioAnimations } from "../scenes/animations.js"; // ✅ Importando animações

export default class GameScene extends Phaser.Scene {
    constructor() {
        super("GameScene");
    }

    create() {
        createMarioAnimations(this);
        const floorHeight = 60;
      
        this.add.image(100, 50, "cloud1").setOrigin(0, 0).setScale(0.15);
        this.add.image(0, 430, "casa").setOrigin(0, 0).setScale(0.4);
        this.add.image(640, 450, "arc").setOrigin(0, 0).setScale(0.67);
        this.add.image(980, 450, "catedral").setOrigin(0, 0).setScale(1);
        this.add.image(1350, 560, "leon").setOrigin(0, 0).setScale(0.4);
        this.add.image(1525, 450, "catalunya").setOrigin(0, 0).setScale(0.67);
        this.add.image(2100, 510, "torre").setOrigin(0, 0).setScale(0.67);
        this.add.image(2900, 420, "vela").setOrigin(0, 0).setScale(1.5);
        this.add.image(3200, 420, "colon").setOrigin(0, 0).setScale(1);
        this.add.image(3700, 320, "españa").setOrigin(0, 0).setScale(1);
        this.add.image(4600, 220, "sagrada").setOrigin(0, 0).setScale(1);
        this.add.image(4950, 420, "batlo").setOrigin(0, 0).setScale(0.6);

        this.coinScore = 0; // 🔹 Inicializando o score
        this.barco = this.physics.add.staticGroup();

        let barco = this.barco.create(5500, 300, "barco")
            .setOrigin(0, 0)
            .setScale(1)
            .refreshBody();
        
        // Ajustando a colisão para cobrir apenas 200px no chão
        barco.body.setSize(barco.width, 200); // Largura total, altura reduzida para 200px
        barco.body.setOffset(0, barco.height - 200); // Move a hitbox para a parte inferior
        // Criando grupo estático para a rodovia
        this.meioBarco = this.physics.add.staticGroup();
          // Posições da rodovia
          const meioBarcoPositions = [
            { x: 6000, scale: 0.609 },
            { x: 6093, scale: 0.609 },
            { x: 6186, scale: 0.609 },
            { x: 6279, scale: 0.609 },
            { x: 6372, scale: 0.609 },
            { x: 6465, scale: 0.609 },
            { x: 6558, scale: 0.609 },
            { x: 6651, scale: 0.609 },
            { x: 6744, scale: 0.609 },
            { x: 6837, scale: 0.609 },
            { x: 6930, scale: 0.609 },
            { x: 7023, scale: 0.609 },
            { x: 7116, scale: 0.609 },
            { x: 7209, scale: 0.609 },
            { x: 7302, scale: 0.609 },
            { x: 7395, scale: 0.609 },
            { x: 7488, scale: 0.609 },
            { x: 7581, scale: 0.609 },
        ];
        meioBarcoPositions.forEach(pos => {
            let meio = this.meioBarco.create(pos.x, 376, "meio")
                .setOrigin(0, 0) // Configura a origem na parte superior esquerda
                .setScale(pos.scale)
                .refreshBody();
        
            if (pos.width) {
                meio.setDisplaySize(pos.width, 60); // Ajusta o tamanho do meio barco
            }
        
            // Ajuste da colisão: é necessário definir um tamanho e offset apropriado
            meio.body.setSize(100, 60);  // Largura 1000px e altura 60px
            meio.body.setOffset(0, 222);    // Alinha o corpo de colisão com a parte inferior do objeto
            
            // Para garantir que ele esteja posicionado no chão, defina sua posição Y corretamente
            meio.setPosition(pos.x, 376); // Certifique-se de que a posição Y esteja no chão
        });
        
        // Criando grupo estático para a rodovia
        this.rodovia = this.physics.add.staticGroup();

        // Posições da rodovia
        const rodoviaPositions = [
            { x: 0, scale: 0.65, width: 355 },
            { x: 650, scale: 0.65 },
            { x: 1400, scale: 0.65 },
            { x: 2100, scale: 0.65 },
            { x: 2900, scale: 0.65 },
            { x: 3700, scale: 0.72 },
            { x: 4600, scale: 0.72 }
        ];

        rodoviaPositions.forEach(pos => {
            let road = this.rodovia.create(pos.x, this.scale.height - floorHeight, "rodovia")
                .setOrigin(0, 0)
                .setScale(pos.scale)
                .refreshBody();
        
            if (pos.width) {
                road.setDisplaySize(pos.width, 60);
            }
        
            // Ajusta a área de colisão da rodovia
            road.body.setSize(road.displayWidth, 100); // Define a largura e altura da colisão
            road.body.setOffset(0, 0); // Ajusta a posição da colisão dentro do sprite
        });
        
        // Adiciona um texto no topo direito para exibir a pontuação
        this.coinText = this.add.text(this.scale.width - 20, 20, Coins: ${this.coinScore}, {
            fontFamily: "pixel",
            fontSize: "32px",
            color: "#fff"
        }).setOrigin(1, 0); // Alinha à direita
        this.coinText.setScrollFactor(0);

        // Criando o Mario com física ativada
        this.mario = this.physics.add.sprite(50, this.scale.height - floorHeight - 50, "mario")
            .setScale(0.35)
            .setOrigin(23, 1)
            .setCollideWorldBounds(true);

            this.mario.body.setSize(500, 300); // Ajuste os valores para cobrir a moto toda
            this.mario.body.setOffset(200, 200); // Ajuste para alinhar com o chão corretamente
            
            
        this.mario.setGravityY(500);
// Criando grupo de policiais
this.policeGroup = this.physics.add.group();

// Criar policiais a cada 5 segundos
// this.time.addEvent({
//     delay: 3000, // 5 segundos
//     callback: this.spawnPolice,
//     callbackScope: this,
//     loop: true
// });


        // Adicionando colisões
        this.marioRodoviaCollider== this.physics.add.collider(this.mario, this.rodovia);
       
        // Criando os controles de movimento
        this.keys = this.input.keyboard.createCursorKeys();

        // Configuração da câmera
        this.physics.world.setBounds(0, 0, 10000, this.scale.height);
        this.cameras.main.setBounds(0, 0, 10000, this.scale.height);
        this.cameras.main.startFollow(this.mario, true, 0.05, 0.05);

        // Ativando a depuração da física
        this.physics.world.createDebugGraphic();
        this.debugGraphics = this.add.graphics();
        this.physics.world.debugGraphic = this.debugGraphics;
        this.physics.world.drawDebug = true;


    

        this.coins = this.physics.add.staticGroup();
        this.coins = this.physics.add.staticGroup({ immovable: true });

        this.physics.add.overlap(this.mario, this.coins, this.collectCoin, null,this)
    
    // Criando moedas com variação no posicionamento
    let x = 200; // Começa no início do mapa
    while (x < 6000) { // Até o final do mapa
        let yBase = this.scale.height - floorHeight - 230; // Base no chão

        // Criar 3 a 5 moedas seguidas
        let numMoedas = Phaser.Math.Between(3, 5);
        for (let i = 0; i < numMoedas; i++) {
            let coinY = yBase; // Moeda no chão
            
            // Algumas moedas ficam mais altas (simulando padrão do Mario)
            if (Math.random() > 0.5) {
                coinY -= 50; 
            }

            let coin = this.coins.create(x, coinY, "coin").setScale(2);
           
            coin.anims.play("coin-idle", true);

            x += 40; // Distância entre moedas na mesma linha
        }

        // Pular uma pequena distância antes do próximo bloco de moedas
        x += Phaser.Math.Between(100, 200);
    }
      this.marioRodoviaCollider== this.physics.add.collider(this.mario, this.barco);
      this.marioRodoviaColliderMeio== this.physics.add.collider(this.mario, this.meioBarco);
    }
    spawnPolice() {
        let marioX = this.mario.x;
        let spawnDirection = Math.random() < 0.5 ? -1 : 1; 
        let spawnX = marioX + (1000 * spawnDirection);
        let speed = Phaser.Math.Between(100, 400);
    
        // Criar policial
        let police = this.physics.add.sprite(spawnX, this.scale.height - 100, "police")
            .setScale(0.3)
            .setGravityY(500);
    
        this.policeGroup.add(police);
    
        // Configurar a física do policial
        police.body.setSize(police.width, police.height * 0.8);
        police.body.setOffset(0, 10);
        police.body.setCollideWorldBounds(false);
    
        // 💡 Corrigir colisão com a rodovia
        this.physics.add.collider(police, this.rodovia);
    
        this.marioPoliceCollider= this.physics.add.collider(this.mario, police, this.onHitPolice, null, this);
    
        if (spawnDirection === 1) {
            police.setVelocityX(-speed);
            police.flipX = false;
        } else {
            police.setVelocityX(speed);
            police.flipX = true;
        }
    
        this.time.addEvent({
            delay: 100,
            callback: () => {
                if (police && police.body) {
                    // Se o policial não estiver tocando o chão, reposiciona ele levemente para cima
                    if (!police.body.blocked.down) {
                        police.y -= 10; // Sobe um pouco para evitar quedas
                    }
                }
            },
            loop: true
        });
        
        
    }
    
    
    collectCoin(mario, coin) {
        if (this.mario.isDead) return;
        
        // Garante que a moeda não interfere na física do Mario
        coin.disableBody(true, true);
        
        this.sound.add("coin-pickup", { volume: 0.2 }).play();
    
        // Atualiza a pontuação e o texto na tela
        this.coinScore += 100;
        this.coinText.setText(Coins: ${this.coinScore});
    
        // Efeito visual de pontuação
        const scoreText = this.add.text(coin.getBounds().x, coin.getBounds().y, "+100", {
            fontFamily: "pixel",
            fontSize: "32px",
            color: "#fff"
        }).setOrigin(0.5, 1);
    
        this.tweens.add({
            targets: scoreText,
            duration: 500,
            y: scoreText.y - 20,
            alpha: 0,
            onComplete: () => {
                scoreText.destroy();
            }
        });
    }
    
    update() {
        if (this.mario.isDead) {
            return;
        }

        let currentAnimation = this.mario.anims.currentAnim ? this.mario.anims.currentAnim.key : "";

        // Movimento lateral
        if (this.keys.left.isDown) {
            this.mario.setVelocityX(-200);
            this.mario.flipX = true;
        } else if (this.keys.right.isDown) {
            this.mario.setVelocityX(200);
            this.mario.flipX = false;
        } else if (this.mario.body.touching.down) {
            this.mario.setVelocityX(0);
        }

        // Pulo
        if (this.keys.up.isDown && this.mario.body.touching.down) {
            this.mario.setVelocityY(-550);
            if (currentAnimation !== "mario-jump") {
                this.mario.anims.play("mario-jump");
            }
        }

        if (!this.mario.body.touching.down && currentAnimation !== "mario-jump") {
            this.mario.anims.play("mario-jump");
        }

        if (this.mario.body.touching.down) {
            if (this.keys.left.isDown || this.keys.right.isDown) {
                if (currentAnimation !== "mario-walk") {
                    this.mario.anims.play("mario-walk", true);
                }
            } else {
                if (currentAnimation !== "mario-idle") {
                    this.mario.anims.play("mario-idle", true);
                }
            }
        }

        // Verifica se Mario caiu da tela
        if (this.mario.y >= this.scale.height) {
            this.killMario()
        }
    }
    onHitPolice(mario, police) {
        if (mario.body.touching.down && police.body.touching.up && !this.mario.isDead) {
            police.anims.play("police-dead");

            this.time.delayedCall(50, () => {
                if (police && police.body) {
                    police.setFlipX(true);
                }
            });

            this.sound.add("policeDead", { volume: 0.2 }).play();
// Exibir "+200" quando Mario mata um policial
const scoreText = this.add.text(police.x, police.y - 50, "+200", {
    fontFamily: "pixel",
    fontSize: "32px",
    color: "#fff"
}).setOrigin(0.5, 1);

// Animação para desaparecer
this.tweens.add({
    targets: scoreText,
    y: scoreText.y - 20,
    alpha: 0,
    duration: 1000,
    onComplete: () => scoreText.destroy()
});

            this.time.delayedCall(300, () => {
                if (police && police.body) {
                    police.destroy();
                }
            });

            // Adiciona +200 à pontuação ao matar um policial
            this.coinScore += 200;
            this.coinText.setText(Coins: ${this.coinScore});

            mario.setVelocityY(-350);
        } else {
            this.killMario();
        }
    }
    
    

// Método para matar o Mario
killMario() {
    if (this.mario.isDead) return;

    this.mario.isDead = true;
    this.mario.anims.play("mario-dead");

    // 🔹 Garante que a gravidade afeta o Mario
    this.mario.body.setGravityY(1000);
    this.mario.body.setAllowGravity(true);

    // 🔹 Desativa colisões para que ele caia
    this.mario.body.checkCollision.up = false;
    this.mario.body.checkCollision.down = false;
    this.mario.body.checkCollision.left = false;
    this.mario.body.checkCollision.right = false;

    // 🔹 Remove a colisão com os objetos no mundo
    this.physics.world.removeCollider(this.marioPoliceCollider);
    this.physics.world.removeCollider(this.marioRodoviaCollider);
    this.mario.setCollideWorldBounds(false);

    // 🔹 Para qualquer movimento horizontal
    this.mario.setVelocityX(0);

    // 🔹 Toca o som de game over
    this.sound.add("gameover", { volume: 0.2 }).play();

    // 🔹 Faz o Mario "pular" antes de cair
    setTimeout(() => {
        this.mario.setVelocityY(-550);
    }, 100);

    // 🔹 Reinicia a cena depois de 2 segundos
    setTimeout(() => {
        this.scene.restart();
    }, 2000);
}

}