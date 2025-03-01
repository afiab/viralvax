// Game configuration
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

// Create the Phaser game
const game = new Phaser.Game(config);

function preload() {
    this.load.image('background', './assets/background.png');
    this.load.image('child', './assets/child.png');
    this.load.image('person', './assets/person.png');
    this.load.image('elder', './assets/elder.png');
    this.load.image('vaccineCenter', './assets/vaccineCenter.png');
    this.load.image('hospital', './assets/hospital.png');
    this.load.image('blueParticle', './assets/blueParticle.png');
}

function create() {
    // Resize background to fit the entire screen
    this.add.image(400, 300, 'background').setDisplaySize(800, 600);

    // Create and resize images for people and locations
    this.add.image(55, 440, 'vaccineCenter').setDisplaySize(110, 140);
    this.add.image(200, 50, 'hospital').setDisplaySize(100, 100);

    createPeople(this); // Create people (child, person, elder)
}

function createPeople(scene) {
    for (let i = 0; i < 50; i++) {
        const type = Math.random() > 0.5 ? 'person' : (Math.random() > 0.5 ? 'child' : 'elder');
        const x = Math.random() * 800;
        const y = Math.random() * 600;
        const person = scene.add.image(x, y, type).setDisplaySize(30, 35); // Resize to 40x40
        person.setInteractive();
        person.contaminationStatus = Math.random() > 0.5 ? 'infected' : 'healthy';
        person.infectionTime = 0; // Track how long a person has been infected
        people.push(person);
    }
}

// Variables for people, vaccination status, and locations
let people = [];
let vaccineCenters = [];
let hospitals = [];
let infectionDuration = 5000; // Time before person dies if infected

function movePerson(person) {
    // Random movement for the person
    const moveDirection = Math.random();
    const speed = 1;

    if (moveDirection < 0.25) {
        person.x += speed;  // Move right
    } else if (moveDirection < 0.5) {
        person.x -= speed;  // Move left
    } else if (moveDirection < 0.75) {
        person.y += speed;  // Move down
    } else {
        person.y -= speed;  // Move up
    }

    // Keep people within bounds of the screen
    person.x = Phaser.Math.Clamp(person.x, 0, 800);
    person.y = Phaser.Math.Clamp(person.y, 0, 600);
}

// Function to update game logic
function update() {
    // Update each person's status and movement
    people.forEach(person => {
        movePerson(person);

        // Check for interactions with vaccine centers or hospitals
        vaccineCenters.forEach(center => {
            if (Phaser.Math.Distance.Between(person.x, person.y, center.x, center.y) < 50 && person.contaminationStatus === 'healthy') {
                // "Vaccinate" the person
                vaccinatePerson(person);
            }
        });

        hospitals.forEach(hospital => {
            if (Phaser.Math.Distance.Between(person.x, person.y, hospital.x, hospital.y) < 50 && person.contaminationStatus === 'infected') {
                // "Cure" the person
                curePerson(person);
            }
        });

        // Handle infection spread (check for contact with infected people)
        if (person.contaminationStatus === 'healthy') {
            people.forEach(otherPerson => {
                if (otherPerson !== person && otherPerson.contaminationStatus === 'infected' &&
                    Phaser.Math.Distance.Between(person.x, person.y, otherPerson.x, otherPerson.y) < 30) {
                    // Person becomes sick after contact with an infected person
                    person.contaminationStatus = 'sick';
                    person.setTint(0xff0000); // Change color to red to indicate sickness
                    console.log('Person became sick!');
                }
            });
        }

        // If the person is sick, count down the infection time
        if (person.contaminationStatus === 'sick') {
            person.infectionTime++;
            if (person.infectionTime > infectionDuration) {
                // Person dies after being sick for too long
                person.contaminationStatus = 'dead';
                person.setTint(0x000000); // Change color to black to indicate death
                console.log('Person died from infection!');
            }
        }
    });
}

// Function to vaccinate a person (change their status to 'vaccinated')
function vaccinatePerson(person) {
    person.contaminationStatus = 'vaccinated';
    person.setTint(0x0000ff);  // Change color to blue to indicate vaccinated status
    console.log('Person vaccinated!');
    // Emit particle effect (vaccination particles)
    particles.createEmitter({
        x: person.x,
        y: person.y,
        speed: 100,
        lifespan: 500,
        quantity: 10,
        scale: { start: 0.5, end: 0 },
    });
}

// Function to cure a person (change their status to 'healthy')
function curePerson(person) {
    person.contaminationStatus = 'healthy';
    person.setTint(0x00ff00);  // Change color back to green (healthy)
    person.infectionTime = 0; // Reset infection time
    console.log('Person cured!');
}
