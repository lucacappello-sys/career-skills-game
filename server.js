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
    const { job, industry, country, context, role, selectedSkills, finalScore, timestamp } = req.body;
    
    // Prepara i dati per l'inserimento
    const dataToInsert = {
        Timestamp: timestamp, 
        Job: job,
        Country: country,
        Context: context,
        Role: role,
        "Final Score": finalScore
    };
    
    // Assegna le skill usando i nomi esatti delle colonne del database (presumendo che corrispondano alle chiavi in selectedSkills)
    dataToInsert["Personal/Soft"] = (selectedSkills["Personal/Soft"] || []).join(', ');
    dataToInsert["Management"] = (selectedSkills["Management"] || []).join(', ');
    dataToInsert["Collab/Comm"] = (selectedSkills["Collab/Comm"] || []).join(', ');
    dataToInsert["Interaction/UX"] = (selectedSkills["Interaction/UX"] || []).join(', ');
    dataToInsert["Analytical"] = (selectedSkills["Analytical"] || []).join(', ');
    dataToInsert["Technical"] = (selectedSkills["Technical"] || []).join(', ');
    dataToInsert["Operational"] = (selectedSkills["Operational"] || []).join(', ');

    // Aggiunge il campo industry
    dataToInsert["Industry / Sector"] = industry;

    try {
        // Assumiamo che la tabella si chiami 'game_sessions'
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