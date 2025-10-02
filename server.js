const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
const filePath = path.join(__dirname, 'risultati.csv');

// Dati delle categorie di skill, necessari per creare l'intestazione
const allSkills = {
    "Personal/Soft": ["Meet commitments", "Adapting to changing situations", "Physical strenght", "Managing stressful or challenging conditions", "Observation skills", "Manual Dexterity", "Responsiveness"],
    "Management": ["Monitoring warehouse security procedures", "Monitoring workers' safety on the production floor", "Safety checking", "Risk assessment", "Supervising staff", "Team management", "Conflict resolution", "Task/Production planning"],
    "Collab/Comm": ["Avoid collision with AI", "Assign and manage tasks", "Provide feedback to AI systems", "Understand AI-generated insights", "Assisting others in complex situations", "Coordination with the robot work", "Coordination across operators", "System/Machine reports understanding", "Revising algorithm's suggestion"],
    "Interaction/UX": ["Use voice commands", "Interact physically with cobots", "Use of production monitoring dashboard", "Respond to haptic feedback", "Use gesture-based controls", "Collaborating with robots in shared spaces", "Use of touchscreen-based interface", "Ure AR devices for real-time and visual guidance"],
    "Analytical": ["Preventive maintenance", "Predictive maintenance", " Problem identification", "Risk assessment", "Making time-critical decisions", "Decision making", "Data interpretation", "Problem Solving"],
    "Technical": ["Process awareness", "Technical issues resolution", "Digital system usage", "Digital data management", "System state interpretation", "Technical inspection", "Problem/Alert management", "Algorithms output understanding", "Quality assessment","Setting up the activity", "Statistical process control", "Understanding AI systems", "Data processing", "Knowledge of Machine/Robot task", "Machine/Robot maintenance","Machine/Robot setting parameters", "Turning on machines/robot", "Use of the Robot controller", "Understanding the Robot coding/language", "Knowledge of robot mechanisms", "Setting up the robot", "Robot programming", "Understand the robot feedback", "Know how to interact with robots", "Coding"],
    "Operational": ["Procedures knowledge of error situation", "Task knowledge", "Time Management", "Coping with pressure", "Situational awareness", "Fast task execution", "Procedure Knowledge", "Handling unexpected events and emergencies"]
};

// Middleware per analizzare il corpo delle richieste JSON
app.use(bodyParser.json());

// Funzione per controllare e creare il file CSV con intestazione per categorie
function checkOrCreateCSV() {
    const skillCategories = Object.keys(allSkills);
    const header = `Timestamp;Job;Country;Context;Role;Scenario;Final Score;${skillCategories.join(';')}\n`;

    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, header);
        console.log('File risultati.csv creato con l\'intestazione per categorie.');
    } else {
        console.log('File risultati.csv trovato.');
    }
}

// Servire il file HTML e altri file statici
app.use(express.static(path.join(__dirname)));

// Endpoint per controllare il file CSV (richiamato al caricamento dell'app)
app.get('/csvloading', (req, res) => {
    checkOrCreateCSV();
    res.json({ success: true, message: 'File CSV controllato e pronto.' });
});

// Endpoint per salvare i dati della sessione
app.post('/updatechart', (req, res) => {
    const { job, country, context, role, scenario, selectedSkills, finalScore } = req.body;

    if (!job || !country || !context || !role || !scenario || !finalScore) {
        return res.status(400).json({ success: false, message: 'Dati mancanti.' });
    }
    
    // Formatta i dati per il CSV, con una cella per ogni categoria di skill
    const skillCategories = Object.keys(allSkills);
    const skillCells = skillCategories.map(category => {
        const skillsInCat = selectedSkills[category] || [];
        return `"${skillsInCat.join(', ')}"`;
    }).join(';');

    const row = `"${new Date().toISOString()}";"${job}";"${country}";"${context}";"${role}";"${scenario}";"${finalScore}";${skillCells}\n`;

    fs.appendFile(filePath, row, (err) => {
        if (err) {
            console.error('Errore nella scrittura del file:', err);
            return res.status(500).json({ success: false, message: 'Errore interno del server.' });
        }
        res.status(200).json({ success: true, message: 'Dati salvati con successo.' });
    });
});

app.listen(port, () => {
    console.log(`Server in ascolto su http://localhost:${port}`);
    console.log(`Apri http://localhost:${port}/game.html nel tuo browser.`);
    checkOrCreateCSV();
});