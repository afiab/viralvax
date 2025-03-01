// Game configuration
const config = {
    type: Phaser.AUTO,
    width: 1000, // Increased width for sidebar
    height: 600,
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

// Create the Phaser game
const game = new Phaser.Game(config);

// Variables for people, vaccination status, and locations
let people = [];
let vaccineCenters = [];
let hospitals = [];
let balance = 1000; // Player's starting balance
let infectionDuration = 5000; // Duration before a sick person dies

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

    // Create a text object for displaying the status counts
    this.statusText = this.add.text(10, 10, '', {
        fontSize: '16px',
        fill: '#fff'
    });

    // Create and display the balance in the sidebar
    this.balanceText = this.add.text(810, 10, 'Balance: $' + balance, {
        fontSize: '18px',
        fill: '#fff'
    });

    // Create draggable Vaccine Center and Hospital icons in the sidebar
    const vaccineCenterIcon = this.add.image(810, 100, 'vaccineCenter').setInteractive();
    vaccineCenterIcon.setDisplaySize(50, 70);
    vaccineCenterIcon.on('pointerdown', () => {
        if (balance >= 200) {  // Price for placing a Vaccine Center
            balance -= 200;
            this.balanceText.setText('Balance: $' + balance);
            placeVaccineCenter(this);  // Call function to place the vaccine center
        }
    });

    const hospitalIcon = this.add.image(810, 200, 'hospital').setInteractive();
    hospitalIcon.setDisplaySize(50, 70);
    hospitalIcon.on('pointerdown', () => {
        if (balance >= 300) {  // Price for placing a Hospital
            balance -= 300;
            this.balanceText.setText('Balance: $' + balance);
            placeHospital(this);  // Call function to place the hospital
        }
    });

    // Create people (child, person, elder)
    createPeople(this);
}

function update() {
    // Example: Check for interactions (like people reaching vaccination centers)
    people.forEach(person => {
        // Check if a person reaches the vaccine center
        vaccineCenters.forEach(center => {
            if (Phaser.Math.Distance.Between(person.x, person.y, center.x, center.y) < 60 && person.contaminationStatus === 'healthy') {
                // "Vaccinate" the person
                vaccinatePerson(person);
                balance += 50;  // Earn money per vaccination
                this.balanceText.setText('Balance: $' + balance);
            }
        });

        // Check if a person reaches the hospital
        hospitals.forEach(hospital => {
            if (Phaser.Math.Distance.Between(person.x, person.y, hospital.x, hospital.y) < 60 && person.contaminationStatus === 'infected') {
                // "Cure" the person
                curePerson(person);
                balance += 100;  // Earn money per cure
                this.balanceText.setText('Balance: $' + balance);
            }
        });

        // Move the person
        movePerson(person);
    });
}

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

// Function to place a Vaccine Center
function placeVaccineCenter(scene) {
    const vaccineCenter = scene.add.image(200 + Math.random() * 600, 100 + Math.random() * 400, 'vaccineCenter').setDisplaySize(110, 140);
    vaccineCenters.push(vaccineCenter);
}

// Function to place a Hospital
function placeHospital(scene) {
    const hospital = scene.add.image(200 + Math.random() * 600, 100 + Math.random() * 400, 'hospital').setDisplaySize(100, 100);
    hospitals.push(hospital);
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
