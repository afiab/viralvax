// Define StartScene class
class StartScene extends Phaser.Scene {
    constructor() {
        super({ key: 'StartScene' });
    }

    preload() {
        // Load assets for the start screen
        this.load.image('background', './assets/background.png'); // Same background as MainScene
        this.load.image('startButton', './assets/startButton.png'); // Load the start button image
        this.load.image('restartButton', './assets/restartButton.png'); // Load the restart button image
    }

    create() {
        // Add background image
        this.add.image(400, 300, 'background').setDisplaySize(800, 600);

        // Add title text
        this.add.text(400, 200, 'Vax Viral', {
            fontSize: '75px',
            fill: '#fff',
            fontFamily: 'Arial',
            stroke: '#000',
            strokeThickness: 10
        }).setOrigin(0.5);

        // Add start button
        const startButton = this.add.image(400, 350, 'startButton').setInteractive();
        startButton.setDisplaySize(200, 150);

        // Add event listener to the button
        startButton.on('pointerdown', () => {
            this.scene.start('MainScene'); // Transition to the main game scene
        });
    }
}

// Define MainScene class
class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
    }

    preload() {
        // Load assets for the main game
        this.load.image('background', './assets/background.png'); // Same background as StartScene
        this.load.image('child', './assets/child.png');
        this.load.image('person', './assets/person.png');
        this.load.image('elder', './assets/elder.png');
        this.load.image('vaccineCenter', './assets/vaccineCenter.png');
        this.load.image('hospital', './assets/hospital.png');
        this.load.image('blueParticle', './assets/blueParticle.png');
    }

    create() {
        // Add background image
        this.add.image(400, 300, 'background').setDisplaySize(800, 600);

        // Create a text object for displaying the status counts
        this.statusText = this.add.text(10, 10, '', {
            fontSize: '16px',
            fill: '#fff'
        });

        // Create and display the balance in the sidebar
        this.balanceText = this.add.text(820, 10, 'Balance: $' + balance, {
            fontSize: '18px',
            fill: '#fff'
        });

        // Create a text object to display earning messages
        this.earningsText = this.add.text(820, 550, '', {
            fontSize: '14px',
            fill: '#fff'
        });

        // Create draggable Vaccine Center and Hospital icons in the sidebar
        const vaccineCenterIcon = this.add.image(890, 100, 'vaccineCenter').setInteractive();
        vaccineCenterIcon.setDisplaySize(120, 170);
        vaccineCenterIcon.on('pointerdown', () => {
            if (balance >= 300 && vaccineCenters.length < maxVaccineCenters) {
                balance -= 300;
                this.balanceText.setText('Balance: $' + balance);
                placeVaccineCenter(this);
            }
        });

        // Add text below the Vaccine Center icon with dynamic count
        this.vaccineCenterText = this.add.text(820, 180, `Vaccine Center (0/${maxVaccineCenters})`, {
            fontSize: '14px',
            fill: '#fff'
        });
        this.add.text(850, 200, 'Cost: $300', {
            fontSize: '14px',
            fill: '#fff'
        });
        this.add.text(830, 220, 'Per Vaccine: +$2', {
            fontSize: '14px',
            fill: '#fff'
        });

        const hospitalIcon = this.add.image(890, 320, 'hospital').setInteractive();
        hospitalIcon.setDisplaySize(120, 170);
        hospitalIcon.on('pointerdown', () => {
            if (balance >= 700 && hospitals.length < maxHospitals) {
                balance -= 700;
                this.balanceText.setText('Balance: $' + balance);
                placeHospital(this);
            }
        });

        // Add text below the Hospital icon with dynamic count
        this.hospitalText = this.add.text(840, 400, `Hospital (0/${maxHospitals})`, {
            fontSize: '14px',
            fill: '#fff'
        });
        this.add.text(850, 420, 'Cost: $700', {
            fontSize: '14px',
            fill: '#fff'
        });
        this.add.text(820, 440, 'Cured Patient: +$5', {
            fontSize: '14px',
            fill: '#fff'
        });

        // Create people (child, person, elder)
        createPeople(this);
    }

    update() {
        // Check for interactions (like people reaching vaccination centers or hospitals)
        people.forEach(person => {
            vaccineCenters.forEach(center => {
                if (Phaser.Math.Distance.Between(person.x, person.y, center.x, center.y) < 60 && person.contaminationStatus === 'healthy') {
                    vaccinatePerson(person);
                    balance += 2;
                    this.balanceText.setText('Balance: $' + balance);
                    this.earningsText.setText('+$2 Vaccination');
                }
            });

            hospitals.forEach(hospital => {
                if (Phaser.Math.Distance.Between(person.x, person.y, hospital.x, hospital.y) < 60 && person.contaminationStatus === 'infected') {
                    curePerson(person);
                    balance += 5;
                    this.balanceText.setText('Balance: $' + balance);
                    this.earningsText.setText('+$5 Cured');
                }
            });

            // Check for contamination (interaction between infected and healthy people)
            people.forEach(otherPerson => {
                if (person !== otherPerson) {
                    checkContamination(person, otherPerson);
                }
            });

            // Move the person
            movePerson(person);
        });

        // Update the sidebar text to show the current count of added Vaccine Centers and Hospitals
        this.vaccineCenterText.setText(`Vaccine Center (${vaccineCenters.length}/${maxVaccineCenters})`);
        this.hospitalText.setText(`Hospital (${hospitals.length}/${maxHospitals})`);

        // Check for game-ending conditions
        checkGameEnd(this);
    }
}

// Define EndScene class
class EndScene extends Phaser.Scene {
    constructor() {
        super({ key: 'EndScene' });
    }

    create(data) {
        // Add background image
        this.add.image(400, 300, 'background').setDisplaySize(800, 600);

        // Display the ending message
        this.add.text(400, 200, data.message, {
            fontSize: '48px',
            fill: '#fff',
            fontFamily: 'Arial',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Add restart button
        const restartButton = this.add.image(400, 350, 'restartButton').setInteractive();
        restartButton.setDisplaySize(200, 150);

        // Add text on the button
        // this.add.text(400, 350, 'Restart', {
        //     fontSize: '24px',
        //     fill: '#000',
        //     fontFamily: 'Arial'
        // }).setOrigin(0.5);

        // Add event listener to the button
        restartButton.on('pointerdown', () => {
            // Reset game variables
            people = [];
            vaccineCenters = [];
            hospitals = [];
            balance = 1000;
            occupiedPositions.clear();

            // Restart the game
            this.scene.start('StartScene');
        });
    }
}

// Variables for people, vaccination status, and locations
let people = [];
let vaccineCenters = [];
let hospitals = [];
let balance = 1000; // Player's starting balance
let infectionDuration = 5000; // Duration before a sick person dies

const maxVaccineCenters = 5; // Limit for vaccine centers
const maxHospitals = 5; // Limit for hospitals
const occupiedPositions = new Set(); // Store occupied positions

// Function to create people (child, person, elder)
function createPeople(scene) {
    for (let i = 0; i < 50; i++) {
        const type = Math.random() > 0.5 ? 'person' : (Math.random() > 0.5 ? 'child' : 'elder');
        const x = Math.random() * 800;
        const y = Math.random() * 600;
        const person = scene.add.image(x, y, type).setDisplaySize(30, 35); // Resize to 40x40
        person.setInteractive();

        // Set contamination status to healthy initially (no one is vaccinated yet)
        person.contaminationStatus = 'healthy'; // Everyone starts as healthy

        // 1 in every 5 people should be infected
        if (i % 10 === 0) {
            person.contaminationStatus = 'infected';
            person.setTint(0xff0000); // Infected people have red tint
        } else {
            person.setTint(0xffffff); // Healthy people have default color (white)
        }

        person.setDepth(1); // Ensure people are drawn on top of the buildings
        people.push(person);
    }
}

// Function to infect a person
function infectPerson(person) {
    if (person.contaminationStatus === 'healthy') {
        person.contaminationStatus = 'infected';
        person.setTint(0xff0000); // Change tint to red to indicate infection
    }
}

// Function to move a person with direction changing after 4-6 seconds
function movePerson(person) {
    if (!person.direction || person.elapsedTime >= person.moveDuration) {
        const moveDirection = Math.random();
        person.elapsedTime = 0;
        person.moveDuration = Phaser.Math.Between(1, 3);

        if (moveDirection < 0.25 && person.x < 780) {
            person.direction = 'right';
        } else if (moveDirection < 0.5 && person.x > 0) {
            person.direction = 'left';
        } else if (moveDirection < 0.75 && person.y < 600) {
            person.direction = 'down';
        } else {
            person.direction = 'up';
        }
    }

    const distancePerSecond = 150 / person.moveDuration;
    const distanceThisFrame = distancePerSecond * (game.loop.delta / 1000);

    if (person.direction === 'right') {
        person.x += distanceThisFrame;
    } else if (person.direction === 'left') {
        person.x -= distanceThisFrame;
    } else if (person.direction === 'down') {
        person.y += distanceThisFrame;
    } else if (person.direction === 'up') {
        person.y -= distanceThisFrame;
    }

    person.x = Phaser.Math.Clamp(person.x, 0, 785);
    person.y = Phaser.Math.Clamp(person.y, 0, 600);

    person.elapsedTime += game.loop.delta / 1000;
}

// Function to generate a valid random position
function getValidPosition() {
    let x, y, key;
    do {
        x = Math.floor(Math.random() * (800 - 110) / 150) * 150 + 50; // Keep within 0-800
        y = Math.floor(Math.random() * (600 - 140) / 150) * 150 + 100; // Keep within 0-600
        key = `${x},${y}`;
    } while (occupiedPositions.has(key)); // Ensure no overlap
    occupiedPositions.add(key);
    return { x, y };
}

// Function to place a Vaccine Center
function placeVaccineCenter(scene) {
    if (vaccineCenters.length >= maxVaccineCenters) return; // Limit check
    const { x, y } = getValidPosition();
    const vaccineCenter = scene.add.image(x, y, 'vaccineCenter').setDisplaySize(110, 140);
    vaccineCenter.setDepth(0);
    vaccineCenters.push(vaccineCenter);
}

// Function to place a Hospital
function placeHospital(scene) {
    if (hospitals.length >= maxHospitals) return; // Limit check
    const { x, y } = getValidPosition();
    const hospital = scene.add.image(x, y, 'hospital').setDisplaySize(110, 140);
    hospital.setDepth(0);
    hospitals.push(hospital);
}

// Function to vaccinate a person (change their status to 'vaccinated')
function vaccinatePerson(person) {
    person.contaminationStatus = 'vaccinated';
    person.setTint(0x00ff00); // Change color to green to indicate vaccinated status
}

// Function to cure a person (change their status to 'healthy')
function curePerson(person) {
    person.contaminationStatus = 'healthy';
    person.setTint(0xffffff); // Change color back to default (healthy people have no tint)
}

// Function to check contamination between two people
function checkContamination(person1, person2) {
    if (person1.contaminationStatus === 'infected' && person2.contaminationStatus === 'healthy') {
        const distance = Phaser.Math.Distance.Between(person1.x, person1.y, person2.x, person2.y);
        if (distance < 50) {
            infectPerson(person2);
        }
    }
}

// Function to check for game-ending conditions
function checkGameEnd(scene) {
    let vaccinatedCount = 0;
    let infectedCount = 0;

    people.forEach(person => {
        if (person.contaminationStatus === 'vaccinated') {
            vaccinatedCount++;
        } else if (person.contaminationStatus === 'infected') {
            infectedCount++;
        }
    });

    // Check for ending conditions
    if (infectedCount === 0) {
        scene.scene.start('EndScene', { message: 'Cured Victory!' });
    } else if (balance >= 100000) {
        scene.scene.start('EndScene', { message: 'Millionaire!' });
    } else if (infectedCount === people.length) {
        scene.scene.start('EndScene', { message: 'Failure: All Sick!' });
    }
}

// Game configuration
const config = {
    type: Phaser.AUTO,
    width: 1000, // Increased width for sidebar
    height: 600,
    scene: [StartScene, MainScene, EndScene] // Include all scenes
};

// Create the Phaser game
const game = new Phaser.Game(config);