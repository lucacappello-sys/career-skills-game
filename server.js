const express = require('express');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Configurazione Supabase - Sostituisci con le tue credenziali
const supabaseUrl = process.env.SUPABASE_URL || 'https://wioipjehjipybmwdzfvt.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indpb2lwamVoamlweWJtd2R6ZnZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzODA5MzAsImV4cCI6MjA3NDk1NjkzMH0.hwGXmF2KMAIHU6n6fQV8XaghKZD6kU_uA4smRFvRhhg';
const supabase = createClient(supabaseUrl, supabaseKey);

// Dati delle categorie di skill, necessari per formattare i dati
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
app.use(express.json());

// Aggiungi questa riga per servire game.html come pagina principale
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'game.html'));
});

// Servire gli altri file statici
app.use(express.static(__dirname));

// Endpoint per salvare i dati della sessione su Supabase
app.post('/updatechart', async (req, res) => {
    const { job, country, context, role, scenario, selectedSkills, finalScore, timestamp } = req.body;
    
    const dataToInsert = {
        Timestamp: timestamp, 
        Job: job,
        Country: country,
        Context: context,
        Role: role,
        Scenario: scenario,
        "Final Score": finalScore
    };
    
    // Assegna le skill usando i nomi esatti delle colonne
    dataToInsert["Personal/Soft"] = (selectedSkills["Personal/Soft"] || []).join(', ');
    dataToInsert["Management"] = (selectedSkills["Management"] || []).join(', ');
    dataToInsert["Collab/Comm"] = (selectedSkills["Collab/Comm"] || []).join(', ');
    dataToInsert["Interaction/UX"] = (selectedSkills["Interaction/UX"] || []).join(', ');
    dataToInsert["Analytical"] = (selectedSkills["Analytical"] || []).join(', ');
    dataToInsert["Technical"] = (selectedSkills["Technical"] || []).join(', ');
    dataToInsert["Operational"] = (selectedSkills["Operational"] || []).join(', ');

    try {
        const { data, error } = await supabase
            .from('game_sessions')
            .insert([dataToInsert]);

        if (error) {
            console.error('Errore durante il salvataggio su Supabase:', error);
            return res.status(500).json({ success: false, message: 'Errore interno del server.' });
        }

        res.status(200).json({ success: true, message: 'Dati salvati con successo su Supabase.' });
    } catch (e) {
        console.error('Errore del server:', e);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});

app.listen(port, () => {
    console.log(`Server in ascolto sulla porta ${port}`);
});