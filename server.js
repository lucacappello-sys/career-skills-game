const express = require('express');
const bodyParser = require('body-parser'); // facoltativo: puoi rimuoverlo
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Configurazione Supabase - Sostituisci con le tue credenziali
const supabaseUrl = process.env.SUPABASE_URL || 'https://wioipjehjipybmwdzfvt.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indpb2lwamVoamlweWJtd2R6ZnZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzODA5MzAsImV4cCI6MjA3NDk1NjkzMH0.hwGXmF2KMAIHU6n6fQV8XaghKZD6kU_uA4smRFvRhhg';
const supabase = createClient(supabaseUrl, supabaseKey);

// (facoltativo) se vuoi JSON body parser extra
app.use(express.json());

// Servi game.html come home
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'game.html'));
});

// Servi asset statici (immagini, css, js, manifest, ecc.)
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

  // Mappa le skill per categoria (stringa separata da virgole)
  dataToInsert["Personal/Soft"]  = (selectedSkills["Personal/Soft"]  || []).join(', ');
  dataToInsert["Management"]     = (selectedSkills["Management"]     || []).join(', ');
  dataToInsert["Collab/Comm"]    = (selectedSkills["Collab/Comm"]    || []).join(', ');
  dataToInsert["Interaction/UX"] = (selectedSkills["Interaction/UX"] || []).join(', ');
  dataToInsert["Analytical"]     = (selectedSkills["Analytical"]     || []).join(', ');
  dataToInsert["Technical"]      = (selectedSkills["Technical"]      || []).join(', ');
  dataToInsert["Operational"]    = (selectedSkills["Operational"]    || []).join(', ');

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
