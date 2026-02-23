/**
 * FRMBB Match Sheet - Text Parsing & Validation Controller
 * 
 * OCR runs in the browser (tesseract.js WASM).
 * This backend only receives extracted text and returns structured JSON.
 */

/**
 * POST /api/ocr/parse
 * Body: { text: string, confidence: number }
 */
exports.parseMatchSheet = (req, res) => {
    try {
        const { text, confidence } = req.body;

        if (!text || text.trim().length < 30) {
            return res.status(400).json({ message: "No OCR text provided or text too short." });
        }

        if (confidence !== undefined && confidence < 40) {
            return res.status(422).json({
                message: "Low extraction confidence. Please ensure the match sheet is well-lit and flat.",
                confidence
            });
        }

        const structuredData = parseFRMBBSheet(text);
        structuredData.confidenceScore = confidence ?? 75;
        structuredData.validation = validateMatchData(structuredData);

        res.json(structuredData);
    } catch (error) {
        console.error("[PARSE ERROR]", error);
        res.status(500).json({ message: "Failed to parse match sheet text.", error: error.message });
    }
};

/**
 * Robust Regex Parser for FRMBB Format
 */
function parseFRMBBSheet(text) {
    const fullText = text;

    const findField = (patterns) => {
        for (const pattern of patterns) {
            const m = fullText.match(pattern);
            if (m && m[1]) return m[1].trim();
        }
        return "N/A";
    };

    // A. General Match Info
    const matchInfo = {
        competition: findField([
            /(?:COMPETITION|CHAMPIONNAT)\s*[:.]?\s*([A-Z0-9\s.-]+?)(?=\s+DATE|CATEGORIE|LIEU|\n|$)/i,
            /COMPETITION\s*[:.]?\s*([^\n]+)/i
        ]),
        category: findField([
            /(?:CATEGORIE|CATEGORY)\s*[:.]?\s*([A-Z0-9\s.-]+?)(?=\s+DATE|LIEU|\n|$)/i
        ]),
        date: findField([/(\d{2}[/-]\d{2}[/-]\d{2,4})/]),
        venue: findField([
            /(?:LIEU|VENUE|VILLE|Lieu)\s*[:.]?\s*([A-Z\s.-]+?)(?=\s+DATE|EQUIPE|\n|$)/i,
            /Lieu\s*[:.]?\s*([^\n]+)/i
        ]),
        teamA: findField([
            /(?:EQUIPE|Team|Équipe)\s*A\s*[:.]?\s*([A-Z\s.\-\(\)]+?)(?=\s+EQUIPE|SCORE|\n|$)/i
        ]),
        teamB: findField([
            /(?:EQUIPE|Team|Équipe)\s*B\s*[:.]?\s*([A-Z\s.\-\(\)]+?)(?=\s+EQUIPE|SCORE|\n|$)/i
        ]),
        referees: findField([
            /(?:ARBITRES|REFEREES|Arbitres)\s*[:.]?\s*([A-Z\s.,-]+?)(?=\s+OFFICIELS|\n|$)/i
        ]),
        sheetNumber: findField([
            /(?:N[o°]|MATCH|RENCONTRE|No)\s*[:.]?\s*(\d{5,})/i,
            /No\s*[:.]?\s*(\d{5,})/i
        ])
    };

    // B & C. Team Tables
    const playersA = extractPlayers(fullText, "EQUIPE A");
    const playersB = extractPlayers(fullText, "EQUIPE B");

    // D. Quarter Scores
    const quarters = [];
    for (let i = 1; i <= 4; i++) {
        const qRegex = new RegExp(
            `(?:Période|Period|P|\\()\\s*${i}\\)?\\s*A\\s*[:.]?\\s*(\\d+)\\s*B\\s*[:.]?\\s*(\\d+)`, 'i'
        );
        const qMatch = fullText.match(qRegex);
        quarters.push({
            q: `Q${i}`,
            a: qMatch ? parseInt(qMatch[1]) : 0,
            b: qMatch ? parseInt(qMatch[2]) : 0
        });
    }

    // E. Final Score (inferred from quarters if not found directly)
    const rawScoreA = findField([/(?:SCORE FINAL|TOTAL|RESULTAT)\s*A\s*[:.]?\s*(\d+)/i]);
    const rawScoreB = findField([/(?:SCORE FINAL|TOTAL|RESULTAT)\s*B\s*[:.]?\s*(\d+)/i]);

    const scoreA = (rawScoreA !== "N/A" ? parseInt(rawScoreA) : null) || quarters.reduce((s, q) => s + q.a, 0);
    const scoreB = (rawScoreB !== "N/A" ? parseInt(rawScoreB) : null) || quarters.reduce((s, q) => s + q.b, 0);

    return {
        matchInfo,
        teamA: {
            name: matchInfo.teamA !== "N/A" ? matchInfo.teamA : "TEAM A",
            players: playersA,
            coach: findField([/COACH\s*A\s*[:.]?\s*([A-Z\s.-]+)/i, /ENTRAÎNEUR\s*A\s*[:.]?\s*([A-Z\s.-]+)/i]),
            assistantCoach: findField([/ASSISTANT\s*A\s*[:.]?\s*([A-Z\s.-]+)/i]),
            totalPoints: scoreA
        },
        teamB: {
            name: matchInfo.teamB !== "N/A" ? matchInfo.teamB : "TEAM B",
            players: playersB,
            coach: findField([/COACH\s*B\s*[:.]?\s*([A-Z\s.-]+)/i, /ENTRAÎNEUR\s*B\s*[:.]?\s*([A-Z\s.-]+)/i]),
            assistantCoach: findField([/ASSISTANT\s*B\s*[:.]?\s*([A-Z\s.-]+)/i]),
            totalPoints: scoreB
        },
        quarters,
        finalResult: {
            teamA: scoreA,
            teamB: scoreB,
            winner: scoreA > scoreB
                ? (matchInfo.teamA !== "N/A" ? matchInfo.teamA : "TEAM A")
                : scoreB > scoreA
                    ? (matchInfo.teamB !== "N/A" ? matchInfo.teamB : "TEAM B")
                    : "DRAW"
        }
    };
}

function extractPlayers(text, teamLabel) {
    const players = [];
    const startIndex = text.search(new RegExp(teamLabel, 'i'));
    if (startIndex === -1) return [];

    const section = text.substring(startIndex, startIndex + 2500);
    const lines = section.split('\n');

    for (const line of lines) {
        const parts = line.match(/(\d{5,8})\s+([A-Z\s.\-]{3,})/i);
        if (parts) {
            const numberMatch = line.match(/\b(\d{1,2})\b/);
            players.push({
                license: parts[1],
                name: parts[2].trim().split(/\s{2,}/)[0].trim(),
                number: numberMatch ? numberMatch[1] : "??",
                fouls: (line.match(/\bP\b/g) || []).length,
                inGame: /\bX\b/i.test(line)
            });
        }
        if (players.length >= 12) break;
    }
    return players;
}

/**
 * FRMBB Basketball Rules Validation
 */
function validateMatchData(data) {
    const errors = [];

    // 1. Max 5 fouls per player
    [...data.teamA.players, ...data.teamB.players].forEach(p => {
        if (p.fouls > 5) errors.push(`${p.name}: Invalid foul count (${p.fouls} > 5).`);
    });

    // 2. Quarter totals must match final score
    const qSumA = data.quarters.reduce((s, q) => s + q.a, 0);
    const qSumB = data.quarters.reduce((s, q) => s + q.b, 0);

    if (qSumA > 0 && qSumA !== data.finalResult.teamA) {
        errors.push(`Score mismatch: Quarter sum Team A (${qSumA}) ≠ Final (${data.finalResult.teamA}).`);
    }
    if (qSumB > 0 && qSumB !== data.finalResult.teamB) {
        errors.push(`Score mismatch: Quarter sum Team B (${qSumB}) ≠ Final (${data.finalResult.teamB}).`);
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}
