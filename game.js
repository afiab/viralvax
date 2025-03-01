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
    const vaccineCenter = this.add.image(55, 440, 'vaccineCenter').setDisplaySize(110, 140);
    vaccineCenters.push(vaccineCenter); // Add the vaccine center to the vaccineCenters array

    const hospital = this.add.image(200, 50, 'hospital').setDisplaySize(100, 100);
    hospitals.push(hospital); // Add hospital to hospitals array

    createPeople(this); // Create people (child, person, elder)

    // Create a text object for displaying the status counts
    this.statusText = this.add.text(10, 10, '', {
        fontSize: '16px',
        fill: '#fff'
    });
}

// Variables for people, vaccination status, and locations
let people = [];
let vaccineCenters = [];
let hospitals = [];
let infectionDuration = 5000; // Duration before a sick person dies

// Create people function
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
        if (i % 5 === 0) {
            person.contaminationStatus = 'infected';
            person.setTint(0xff0000); // Infected people have red tint
        } else {
            person.setTint(0xffffff); // Healthy people have default color (white)
        }

        people.push(person);
    }
}

// Function to infect a person
function infectPerson(person) {
    if (person.contaminationStatus === 'healthy') {
        person.contaminationStatus = 'infected';
        person.setTint(0xff0000); // Change tint to red to indicate infection
        console.log('A person has become infected!');
    }
}

// Function to move a person in random directions
function movePerson(person) {
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

function update() {
    // Example: Check for interactions (like people reaching vaccination centers)
    people.forEach(person => {
        // Check if a person reaches the vaccine center
        vaccineCenters.forEach(center => {
            if (Phaser.Math.Distance.Between(person.x, person.y, center.x, center.y) < 60 && person.contaminationStatus === 'healthy') {
                // "Vaccinate" the person
                vaccinatePerson(person);
            }
        });

        // Check if a person reaches the hospital
        hospitals.forEach(hospital => {
            if (Phaser.Math.Distance.Between(person.x, person.y, hospital.x, hospital.y) < 60 && person.contaminationStatus === 'infected') {
                // "Cure" the person
                curePerson(person);
            }
        });

        // Check for contamination with other people
        people.forEach(otherPerson => {
            if (person !== otherPerson && person.contaminationStatus === 'infected') {
                let contaminationDistance = person.type === 'child' || person.type === 'elder' ? 80 : 50;
                if (Phaser.Math.Distance.Between(person.x, person.y, otherPerson.x, otherPerson.y) < contaminationDistance && otherPerson.contaminationStatus === 'healthy') {
                    infectPerson(otherPerson); // Infect the healthy person
                }
            }
        });

        // Move the person
        movePerson(person);
    });
}

// Function to vaccinate a person (change their status to 'vaccinated')
function vaccinatePerson(person) {
    person.contaminationStatus = 'vaccinated';
    person.setTint(0x00ff00);  // Change color to green to indicate vaccinated status
    console.log('Person vaccinated!');
}

// Function to cure a person (change their status to 'healthy')
function curePerson(person) {
    person.contaminationStatus = 'healthy';
    person.setTint(0xffffff);  // Change color back to default (healthy people have no tint)
}
