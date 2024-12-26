const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: { debug: false }
    },
    scene: { preload, create, update }
};

const game = new Phaser.Game(config);

let player, cursors, zombies, bullets, ammoGroup;
let playerHP = 100, ammoCount = 180;
let sounds = {};

function preload() {
    // Загрузка изображений для игрока и зомби
    this.load.image('player', 'assets/images/IMG_20241226_135601.jpg');
    this.load.image('zombie', 'assets/images/IMG_20241122_141410_887.jpg');

    // Загрузка звуков
    this.load.audio('shoot', 'assets/sounds/26 дек., 14.05.m4a');
    this.load.audio('hit', 'assets/sounds/26 дек., 14.05(2).m4a');
    this.load.audio('kill', 'assets/sounds/26 дек., 14.06.m4a');
}

function create() {
    // Игрок
    player = this.physics.add.sprite(400, 300, 'player');
    player.setCollideWorldBounds(true);
    player.hp = 100;

    // Зомби
    zombies = this.physics.add.group();

    // Пули (кубики)
    bullets = this.physics.add.group({
        classType: Phaser.GameObjects.Rectangle,
        maxSize: 50,
        runChildUpdate: true
    });

    // Боеприпасы (кубики)
    ammoGroup = this.physics.add.group();

    // Звуки
    sounds.shoot = this.sound.add('shoot');
    sounds.hit = this.sound.add('hit');
    sounds.kill = this.sound.add('kill');

    // Клавиатура
    cursors = this.input.keyboard.createCursorKeys();

    // Спавн зомби и патронов
    this.time.addEvent({ delay: 2000, callback: spawnZombie, callbackScope: this, loop: true });
    this.time.addEvent({ delay: 5000, callback: spawnAmmo, callbackScope: this, loop: true });

    // Коллизии
    this.physics.add.collider(bullets, zombies, bulletHit, null, this);
    this.physics.add.overlap(player, zombies, playerHit, null, this);
    this.physics.add.overlap(player, ammoGroup, pickAmmo, null, this);
}

function update() {
    // Управление
    player.setVelocity(0);
    if (cursors.left.isDown) player.setVelocityX(-200);
    if (cursors.right.isDown) player.setVelocityX(200);
    if (cursors.up.isDown) player.setVelocityY(-200);
    if (cursors.down.isDown) player.setVelocityY(200);

    // Стрельба
    if (cursors.space.isDown) shootBullet();
}

function spawnZombie() {
    const x = Phaser.Math.Between(0, 800);
    const y = Phaser.Math.Between(0, 600);
    const zombie = zombies.create(x, y, 'zombie');
    zombie.hp = Phaser.Math.Between(10, 500);
}

function spawnAmmo() {
    const x = Phaser.Math.Between(0, 800);
    const y = Phaser.Math.Between(0, 600);
    const ammo = this.add.rectangle(x, y, 20, 20, 0x00ff00); // Зеленый кубик
    this.physics.add.existing(ammo);
    ammoGroup.add(ammo);
}

function shootBullet() {
    if (ammoCount <= 0) return;

    const bullet = this.add.rectangle(player.x, player.y, 10, 10, 0xff0000); // Красный кубик
    this.physics.add.existing(bullet);
    bullet.body.velocity.y = -600; // Пуля летит вверх
    bullets.add(bullet);
    sounds.shoot.play();
    ammoCount--;
}

function bulletHit(bullet, zombie) {
    sounds.hit.play();
    zombie.hp -= 9;
    bullet.destroy();

    if (zombie.hp <= 0) {
        sounds.kill.play();
        zombie.destroy();
    }
}

function playerHit(player, zombie) {
    player.hp -= 10;
    if (player.hp <= 0) {
        this.scene.restart();
    }
}

function pickAmmo(player, ammo) {
    ammo.destroy();
    ammoCount += 90;
}
