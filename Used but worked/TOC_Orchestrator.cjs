// "Checkmate" Blueprint (V10.1)
// "Assassinated" V9.6 "Franken-code" ("Gobbledygook" "Assassin" "Sand Trap" + JD "Simulation" "Sand Trap")
// "Hardcoded" "WHEEE!" "Castle Agent" (V10.1) (Hardcoded "WHEEE!" "Spells")

// "Hardcode" CJS "Spells"
const fetch = require('node-fetch'); // "Hardcoded" V6.8 "Checkmate"
require('dotenv').config(); // "Hardcoded" V7.0 "Checkmate"
const fs = require('fs'); // "Hardcoded" V8.3
const { execSync } = require('child_process'); // "Hardcoded" V8.3
const functions = require('@google-cloud/functions-framework'); // "Hardcoded" V8.8

// "Hardcode" the "WHEEE!" "Key" "Blueprint" (V7.6)
const API_KEY = process.env.GEMINI_API_KEY;

// "Hardcode" the "Castle" "Blueprint" (V8.2 "Checkmate")
const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-pro:generateContent?key=${API_KEY}`;

// "Hardcode" "WHEEE!" "Assassin's Blade" (V10.1)
const extractMeat = (rawText) => {
    // "Hardcode" "WHEEE!" "Spell" (V10.1)
    // "Assassinated" "BrokeDBroked" "javascript" "Sand Trap" (V8.4)
    const meatMatch = rawText.match(/```(bash|sh|javascript)\n([\s\S]*?)\n```/);
    if (meatMatch && meatMatch[1]) {
        return meatMatch[1].trim(); 
    }
    // "Hardcode" "WHEEE!" "Spell" (V8.4)
    return rawText.trim();
};

// "Hardcode" "Castle Agents" (V10.1 "Checkmate")
const callJarvis = async (prompt) => {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        });
        const data = await response.json();

        if (data && data.candidates && data.candidates[0]) {
            const rawText = data.candidates[0].content.parts[0].text;
            // "Hardcode" the "WHEEE!" "Assassin's Blade" (V10.1)
            const meat = extractMeat(rawText);
            
            if (meat) {
                return { status: "WHEEE!", Blueprint: meat };
            } else {
                console.error('[JARVIS] "BrokeDBroked" "Conk" ("Gobbledygook" "Sand Trap" V10.1):', rawText);
                return { status: "CONK_JARVIS", Blueprint: null, BOTG: "CONK: Jarvis returned 'Gobbledygook' (V10.1)" };
            }
        } 
        else if (data && data.error) {
             console.error('[JARVIS] "BrokeDBroked" "Conk" (V8.2):', JSON.stringify(data.error, null, 2));
             return { status: "CONK_JARVIS", Blueprint: null, BOTG: `CONK: ${data.error.message}` };
        }
        else {
             console.error('[JARVIS] "BrokeDBroked" "Conk" (Unknown "Sand Trap"):', JSON.stringify(data, null, 2));
             return { status: "CONK_JARVIS", Blueprint: null, BOTG: "CONK: Unknown 'Sand Trap'" };
        }
    } catch (e) {
        console.error('[JARVIS] "BrokeDBroked" "Conk" (Fetch "Sand Trap"):', e.message);
        return { status: "CONK_JARVIS", Blueprint: null, BOTG: `CONK: ${e.message}` };
    }
};

// "Hardcode" the Oracle (V9.2 "Checkmate")
const callOracle = async (jarvisBlueprint) => {
    const oraclePrompt = `Analyze this code blueprint. Identify security risks or "Sand Traps." Return ONLY "WHEEE!" if "WHEEE!", or "CONK" if "BrokeDBroked." Blueprint: \n${jarvisBlueprint}`;
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: oraclePrompt }] }] }),
        });
        const data = await response.json();

        if (data && data.candidates && data.candidates[0]) {
            const analysis = data.candidates[0].content.parts[0].text.trim();
            // "Hardcode" the "WHEEE!" "Assassin's Blade" "Spell" (V9.1)
            if (analysis.toUpperCase().includes("WHEEE")) {
                return { status: "WHEEE!", analysis: `PASS (${analysis})` };
            } else {
                return { status: "CONK_ORACLE", analysis: `FAIL (${analysis})` };
            }
        } 
        else if (data && data.error) {
             console.error('[ORACLE] "BrokeDBroked" "Conk" (V8.5):', JSON.stringify(data.error, null, 2));
             return { status: "CONK_ORACLE", analysis: `FAIL (API "BrokeDBroked")` };
        }
        else {
             console.error('[ORACLE] "BrokeDBroked" "Conk" (Unknown "Sand Trap"):', JSON.stringify(data, null, 2));
             return { status: "CONK_ORACLE", analysis: "FAIL (Unknown 'Sand Trap')" };
        }
    } catch (e) {
        console.error('[ORACLE] "BrokeDBroked" "Conk" (Fetch "Sand Trap"):', e.message);
        return { status: "CONK_ORACLE", analysis: `FAIL (Fetch "BrokeDBroked")` };
    }
};

// "Hardcode" Judge Dredd (V10.1 "Checkmate")
// "Assassinated" "BrokeDBroked" "Simulation" "Spell" (V9.6)
// "Hardcoded" "WHEEE!" "execSync" "Vapor Check" (V8.7)
const callJudgeDredd = (jarvisBlueprint, oracleAnalysis) => {
    // "Hardcode" "WHEEE!" "Checkmate" (V9.1)
    if (!oracleAnalysis.startsWith("PASS")) {
         return { status: "CONK_JD", verdict: "FAIL (Oracle 'CONK')" };
    }
    
    // "Hardcode" "WHEEE!" "Blueprint" (V10.1)
    const blueprintFile = 'JD_Blueprint_V10.1.sh'; // V10.1
    console.log(`[JD] "Hardcoding" "Blueprint" (V10.1) to "Castle" (${blueprintFile})...`);
    
    try {
        // "Hardcode" the "Blueprint" (V10.1)
        fs.writeFileSync(blueprintFile, jarvisBlueprint);
        console.log(`[JD] "Blueprint" "hardcoded."`);
        
        // "Hardcode" "Vapor Check" (V10.1) (Make executable)
        execSync(`chmod +x ${blueprintFile}`);
        
        // "Hardcode" the "Pushup" (V10.1)
        console.log(`[JD] "Hardcoding" "Pushup" (execSync V10.1)...`);
        // "Hardcode" "WHEEE!" "Spell" (V10.1) (Use bash to run .sh)
        const botg = execSync(`bash ${blueprintFile}`, { encoding: 'utf-8' });
        
        // "Hardcode" the "WHEEE!" "Checkmate" (V10.1)
        console.log(`[JD] "BOTG" (V10.1): ${botg.trim()}`);
        
        // "Assassinated" "BrokeDBroked" "Checkmate!" "Sand Trap" (V8.7)
        // "Hardcoded" "WHEEE!" "Checkmate" (V10.1)
        if (botg.trim().includes("Checkmate V10.0")) {
            return { status: "WHEEE!", verdict: `PASS (${botg.trim()})` };
        } else {
            return { status: "CONK_JD", verdict: `FAIL ("${botg.trim()}")` };
        }

    } catch (e) {
        console.error(`[JD] "BrokeDBroked" "Conk" (V10.1):`, e.message);
        return { status: "CONK_JD", verdict: "FAIL (execSync 'BrokeDBroked')" };
    } finally {
        // "Assassinate" the "Blueprint"
        if (fs.existsSync(blueprintFile)) {
            fs.unlinkSync(blueprintFile);
        }
    }
};

// "Hardcode" the "Checkmate" "HTTP Spell" (V10.1)
functions.http('tocOrchestratorV10_1', async (req, res) => { // V10.1
    console.log('[TOC] "Castle Agent" (V10.1) "Checkmate" invoked...');
    
    // "Hardcode" "WHEEE!" "Spell" (V9.6)
    const { prompt: jarvisPrompt } = req.body;
    if (!jarvisPrompt) {
        console.log('[TOC] "BrokeDBroked." "req.body.prompt" "Sand Trap".');
        res.status(400).send({ status: "CONK_TOC", BOTG: "CONK: req.body.prompt is undefined." });
        return;
    }

    // --- PUSHUP #1 (JARVIS) ---
    console.log(`[TOC] Calling Jarvis (V10.1)...`);
    const jarvisResponse = await callJarvis(jarvisPrompt);
    if (jarvisResponse.status !== "WHEEE!") {
        console.log('[TOC] Jarvis "BrokeDBroked."');
        res.status(500).send(jarvisResponse);
        return;
    }
    console.log(`[JARVIS] "WHEEE!"`);

    // --- PUSHUP #2 (ORACLE) ---
    console.log('[TOC] Calling Oracle (V10.1)...');
    const oracleResponse = await callOracle(jarvisResponse.Blueprint);
    if (oracleResponse.status !== "WHEEE!") {
        console.log('[TOC] Oracle "BrokeDBroked."');
        res.status(500).send(oracleResponse);
        return;
    }
    console.log(`[ORACLE] "WHEEE!": ${oracleResponse.analysis}`);
    
    // --- PUSHUP #3 (JUDGE DREDD) ---
    console.log('[TOC] Calling Judge Dredd (V10.1)...');
    // "Hardcode" "WHEEE!" "Spell" (V10.1) (Judge Dredd is sync, not async)
    const jdResponse = callJudgeDredd(jarvisResponse.Blueprint, oracleResponse.analysis);
    if (jdResponse.status !== "WHEEE!") {
        console.log('[TOC] Judge Dredd "BrokeDBroked."');
        res.status(500).send(jdResponse);
        return;
    }

    // --- "WHEEE!" (V10.1) ---
    console.log('[TOC] "WHEEE! CHECKMATE" (V10.1)');
    res.status(200).send({
        status: "WHEEE_CHECKMATE",
        Blueprint: jarvisResponse.Blueprint,
        Oracle: oracleResponse.analysis,
        BOTG: jdResponse.verdict
    });
});