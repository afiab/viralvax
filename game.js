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
        if (balance >= 300 && vaccineCenters.length < maxVaccineCenters) {  // Price for placing a Vaccine Center
            balance -= 300;
            this.balanceText.setText('Balance: $' + balance);
            placeVaccineCenter(this);  // Call function to place the vaccine center
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
    this.add.text(830, 220, 'Per Vaccine: $5', {
        fontSize: '14px',
        fill: '#fff'
    });

    const hospitalIcon = this.add.image(890, 320, 'hospital').setInteractive();
    hospitalIcon.setDisplaySize(120, 170);
    hospitalIcon.on('pointerdown', () => {
        if (balance >= 700 && hospitals.length < maxHospitals) {  // Price for placing a Hospital
            balance -= 700;
            this.balanceText.setText('Balance: $' + balance);
            placeHospital(this);  // Call function to place the hospital
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
    this.add.text(820, 440, 'Cured Patient: +$10', {
        fontSize: '14px',
        fill: '#fff'
    });

    // Create people (child, person, elder)
    createPeople(this);
}

function checkContamination(person1, person2) {
    // If the person1 is infected and person2 is healthy
    if (person1.contaminationStatus === 'infected' && person2.contaminationStatus === 'healthy') {
        const distance = Phaser.Math.Distance.Between(person1.x, person1.y, person2.x, person2.y);
        
        // If the two people are close enough (e.g., less than 50 pixels apart)
        if (distance < 50) {
            infectPerson(person2);  // Infect the healthy person
            // console.log('A person has become infected by another person!');
        }
    }
}

function update() {
    // Example: Check for interactions (like people reaching vaccination centers)
    people.forEach(person => {
        // Check if a person reaches the vaccine center
        vaccineCenters.forEach(center => {
            if (Phaser.Math.Distance.Between(person.x, person.y, center.x, center.y) < 60 && person.contaminationStatus === 'healthy') {
                // "Vaccinate" the person
                vaccinatePerson(person);
                balance += 5;  // Earn money per vaccination
                this.balanceText.setText('Balance: $' + balance);
                this.earningsText.setText('+$5 Vaccination');
            }
        });

        // Check if a person reaches the hospital
        hospitals.forEach(hospital => {
            if (Phaser.Math.Distance.Between(person.x, person.y, hospital.x, hospital.y) < 60 && person.contaminationStatus === 'infected') {
                // "Cure" the person
                curePerson(person);
                balance += 10;  // Earn money per cure
                this.balanceText.setText('Balance: $' + balance);
                this.earningsText.setText('+$10 Cured');
            }
        });

        // Check for contamination (interaction between infected and healthy people)
        people.forEach(otherPerson => {
            if (person !== otherPerson) {  // Avoid checking a person against themselves
                checkContamination(person, otherPerson);
            }
        });

        // Move the person
        movePerson(person);
    });

    // Update the sidebar text to show the current count of added Vaccine Centers and Hospitals
    this.vaccineCenterText.setText(`Vaccine Center (${vaccineCenters.length}/${maxVaccineCenters})`);
    this.hospitalText.setText(`Hospital (${hospitals.length}/${maxHospitals})`);
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
        // console.log('A person has become infected!');
    }
}

// Function to move a person with direction changing after 4-6 seconds
function movePerson(person) {
    // If the person hasn't started moving or has finished their previous movement cycle
    if (!person.direction || person.elapsedTime >= person.moveDuration) {
        // Choose a new direction and reset the movement time
        const moveDirection = Math.random();
        person.elapsedTime = 0;  // Reset elapsed time
        
        // Randomly assign a direction and movement duration (4-6 seconds)
        person.moveDuration = Phaser.Math.Between(1,3);  // Random duration between 4 and 6 seconds
        
        // Prevent movement direction from being toward the edge if person is close
        if (moveDirection < 0.25 && person.x < 780) {
            person.direction = 'right';  // Move right
        } else if (moveDirection < 0.5 && person.x > 0) {
            person.direction = 'left';   // Move left
        } else if (moveDirection < 0.75 && person.y < 600) {
            person.direction = 'down';   // Move down
        } else {
            person.direction = 'up';     // Move up
        }
    }

    // Define the total distance to move (500 pixels over 4-6 seconds)
    const distancePerSecond = 150 / person.moveDuration;  // Move 500px in 4-6 seconds
    const distanceThisFrame = distancePerSecond * (game.loop.delta / 1000);  // Scale by delta time

    // Move the person in the current direction
    if (person.direction === 'right') {
        person.x += distanceThisFrame;  // Move right
    } else if (person.direction === 'left') {
        person.x -= distanceThisFrame;  // Move left
    } else if (person.direction === 'down') {
        person.y += distanceThisFrame;  // Move down
    } else if (person.direction === 'up') {
        person.y -= distanceThisFrame;  // Move up
    }

    // Keep people within bounds of the screen
    person.x = Phaser.Math.Clamp(person.x, 0, 785);
    person.y = Phaser.Math.Clamp(person.y, 0, 600);

    // Update the elapsed time
    person.elapsedTime += game.loop.delta / 1000;
}

const maxVaccineCenters = 5; // Limit for vaccine centers
const maxHospitals = 5; // Limit for hospitals
const occupiedPositions = new Set(); // Store occupied positions

// Function to generate a valid random position
function getValidPosition() {
    let x, y, key;
    do {
        x = Math.floor(Math.random() * (800 - 110) / 50) * 50 + 50; // Keep within 0-800
        y = Math.floor(Math.random() * (600 - 140) / 50) * 50 + 50; // Keep within 0-600
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
    console.log(`Vaccine Center placed at (${x}, ${y})`);
    vaccineCenters.push(vaccineCenter);
}

// Function to place a Hospital
function placeHospital(scene) {
    if (hospitals.length >= maxHospitals) return; // Limit check
    const { x, y } = getValidPosition();
    const hospital = scene.add.image(x, y, 'hospital').setDisplaySize(110, 140);
    hospital.setDepth(0); 
    console.log(`Hospital placed at (${x}, ${y})`);
    hospitals.push(hospital);
}



// Function to vaccinate a person (change their status to 'vaccinated')
function vaccinatePerson(person) {
    person.contaminationStatus = 'vaccinated';
    person.setTint(0x00ff00);  // Change color to green to indicate vaccinated status
    // console.log('Person vaccinated!');
}

// Function to cure a person (change their status to 'healthy')
function curePerson(person) {
    person.contaminationStatus = 'healthy';
    person.setTint(0xffffff);  // Change color back to default (healthy people have no tint)
}
