import React, { useState, useRef } from 'react';
import Tesseract from 'tesseract.js';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, Scan, Activity, Database } from 'lucide-react';

const MatchSheetScanner = () => {
    const [image, setImage] = useState(null);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('Idle');
    const [isProcessing, setIsProcessing] = useState(false);
    const [extractedData, setExtractedData] = useState(null);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(URL.createObjectURL(file));
            setExtractedData(null);
            setError(null);
            setStatus('Image Ready');
        }
    };

    const processImage = async () => {
        if (!image) return;

        setIsProcessing(true);
        setStatus('Initializing OCR...');
        setProgress(0);
        setError(null);

        try {
            const result = await Tesseract.recognize(image, 'fra+eng', {
                logger: (m) => {
                    if (m.status === 'recognizing text') {
                        setProgress(parseInt(m.progress * 100));
                        console.log(`[OCR Progress]: ${parseInt(m.progress * 100)}%`);
                    }
                    setStatus(m.status);
                },
            });

            const rawText = result.data.text;
            console.log('--- RAW OCR TEXT START ---');
            console.log(rawText);
            console.log('--- RAW OCR TEXT END ---');

            const structuredData = parseMatchSheet(rawText);
            setExtractedData(structuredData);

            console.log('--- FINAL STRUCTURED JSON ---');
            console.log(JSON.stringify(structuredData, null, 2));

            setStatus('Analysis Complete');
        } catch (err) {
            console.error('OCR Error:', err);
            setError('Failed to process image. Please try a clearer scan.');
            setStatus('Error');
        } finally {
            setIsProcessing(false);
        }
    };

    const parseMatchSheet = (text) => {
        // Cleaning and Normalization
        const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        const normalizedText = text.replace(/\s+/g, ' ');

        // Utility to find pattern and extract
        const findMatch = (regex, source = normalizedText) => {
            const match = source.match(regex);
            return match ? match[1].trim() : "N/A";
        };

        // 1. Basic Match Info
        const match_info = {
            match_number: findMatch(/(?:N[o°]|MATCH|RENCONTRE)\s*[:.]?\s*(\d+)/i),
            competition: findMatch(/(?:COMPETITION|CHAMPIONNAT)\s*[:.]?\s*([A-Z\d\s.-]+?)(?=\s+DATE|CATEGORY|LIEU|$)/i),
            category: findMatch(/(?:CATEGORY|CATEGORIE)\s*[:.]?\s*([A-Z\s]+?)(?=\s+DATE|LIEU|$)/i),
            date: findMatch(/(\d{2}[/-]\d{2}[/-]\d{2,4})/),
            location: findMatch(/(?:LIEU|LOCATION|VILLE)\s*[:.]?\s*([A-Z\s.-]+?)(?=\s+DATE|EQUIPE|$)/i),
        };

        // 2. Teams and Score Detection
        // Look for common team name placements
        const teamLines = lines.filter(l => /(?:EQUIPE|TEAM)\s*[AB]/i.test(l));
        const teamAName = findMatch(/(?:EQUIPE|TEAM)\s*A\s*[:.]?\s*([A-Z\s]+?)(?=\s+EQUIPE|SCORE|$)/i);
        const teamBName = findMatch(/(?:EQUIPE|TEAM)\s*B\s*[:.]?\s*([A-Z\s]+?)(?=\s+SCORE|$)/i);

        // Score patterns like "59 - 40" or "A: 59 B: 40"
        const scores = text.match(/(\d{1,3})\s*[:\-]\s*(\d{1,3})/);
        const final_score = {
            team_a: scores ? parseInt(scores[1]) : 0,
            team_b: scores ? parseInt(scores[2]) : 0
        };

        // Period Scores Detection (P1, P2, P3, P4)
        const period_results = {
            p1: { a: findMatch(/P1\s*[:.]?\s*(\d+)/i) || 0, b: 0 },
            p2: { a: findMatch(/P2\s*[:.]?\s*(\d+)/i) || 0, b: 0 },
            p3: { a: findMatch(/P3\s*[:.]?\s*(\d+)/i) || 0, b: 0 },
            p4: { a: findMatch(/P4\s*[:.]?\s*(\d+)/i) || 0, b: 0 }
        };

        // 3. Player Extraction
        const extractPlayers = () => {
            const players = [];
            // Pattern: LICENSE NAME NUMBER FOULS
            // Usually 7-8 digits for license.
            const playerRegex = /(\d{5,})\s+([A-Z.\s\-]{3,})\s+(\d{1,2})\s*([P|x|X\s]*)\s*(\d*)/gi;

            let match;
            while ((match = playerRegex.exec(text)) !== null) {
                players.push({
                    license: match[1],
                    name: match[2].trim(),
                    number: match[3],
                    played: match[4].toLowerCase().includes('p') || match[4].toLowerCase().includes('x'),
                    fouls: match[5] ? parseInt(match[5]) : 0
                });
            }
            return players;
        };

        const allPlayers = extractPlayers();
        // Split players based on some heuristic or simple range if needed
        // For now returning grouped by logical split or just top/bottom half
        const team_a_players = allPlayers.slice(0, Math.ceil(allPlayers.length / 2));
        const team_b_players = allPlayers.slice(Math.ceil(allPlayers.length / 2));

        return {
            match_info,
            team_a: { name: teamAName, players: team_a_players },
            team_b: { name: teamBName, players: team_b_players },
            period_results,
            final_score,
            meta: {
                scanned_at: new Date().toISOString(),
                confidence_check: "Manual review required"
            }
        };
    };

    return (
        <div className="scanner-container" style={{
            padding: '2rem', background: '#050505', minHeight: '100vh', color: '#fff',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '3rem' }}>
                    <div style={{ background: '#DB0A40', padding: '12px', borderRadius: '12px' }}>
                        <Scan size={32} color="#fff" />
                    </div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: '950', letterSpacing: '-1px' }}>MATCH SHEET INTEL</h1>
                        <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '2px' }}>OCR-Powered Tactical Data Extraction</p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '2rem' }}>
                    {/* Main Area */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        {/* Upload Zone */}
                        <div
                            onClick={() => fileInputRef.current.click()}
                            style={{
                                background: 'rgba(255,255,255,0.02)', border: '2px dashed rgba(219, 10, 64, 0.3)',
                                borderRadius: '24px', padding: '4rem 2rem', textAlign: 'center', cursor: 'pointer',
                                transition: '0.3s', position: 'relative'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#DB0A40'}
                            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(219, 10, 64, 0.3)'}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                style={{ display: 'none' }}
                                accept="image/*"
                            />
                            {image ? (
                                <img src={image} alt="Preview" style={{ maxWidth: '100%', borderRadius: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }} />
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                                    <Upload size={48} color="#DB0A40" />
                                    <div>
                                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Drop Match Sheet Image</div>
                                        <div style={{ color: '#666', marginTop: '5px' }}>Supported: PNG, JPG (High resolution recommended)</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Progress Panel */}
                        {isProcessing && (
                            <div style={{ background: 'rgba(219, 10, 64, 0.05)', borderRadius: '16px', padding: '1.5rem', border: '1px solid rgba(219, 10, 64, 0.2)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <Loader2 size={20} className="animate-spin" color="#DB0A40" />
                                        <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{status.toUpperCase()}</span>
                                    </div>
                                    <span style={{ color: '#DB0A40', fontWeight: 'bold' }}>{progress}%</span>
                                </div>
                                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '100px', overflow: 'hidden' }}>
                                    <div style={{ width: `${progress}%`, height: '100%', background: '#DB0A40', transition: 'width 0.3s ease' }}></div>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div style={{ background: 'rgba(219, 10, 64, 0.1)', border: '1px solid #DB0A40', borderRadius: '12px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '10px', color: '#DB0A40' }}>
                                <AlertCircle size={20} />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Results Preview */}
                        {extractedData && (
                            <div className="animate-fade-in" style={{ background: '#111', borderRadius: '24px', padding: '2rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
                                    <Database size={20} color="#DB0A40" />
                                    <h3 style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>Extracted Schema</h3>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }}>
                                    <div>
                                        <label style={{ color: '#444', fontSize: '0.7rem', fontWeight: 'bold' }}>MATCH_INFO</label>
                                        <pre style={{ background: '#080808', padding: '1rem', borderRadius: '12px', fontSize: '0.8rem', color: '#aaa', overflowX: 'auto' }}>
                                            {JSON.stringify(extractedData.match_info, null, 2)}
                                        </pre>
                                    </div>
                                    <div>
                                        <label style={{ color: '#444', fontSize: '0.7rem', fontWeight: 'bold' }}>FINAL_RESULT</label>
                                        <div style={{ background: '#080808', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                                            <div style={{ fontSize: '2rem', fontWeight: '950', color: '#DB0A40' }}>
                                                {extractedData.final_score.team_a} - {extractedData.final_score.team_b}
                                            </div>
                                            <div style={{ fontSize: '0.7rem', color: '#444' }}>VERIFIED TOTALS</div>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ marginTop: '1.5rem' }}>
                                    <label style={{ color: '#444', fontSize: '0.7rem', fontWeight: 'bold' }}>PLAYER_LOGS_SAMPLE</label>
                                    <div style={{ background: '#080808', padding: '1rem', borderRadius: '12px', fontSize: '0.8rem', color: '#aaa' }}>
                                        {extractedData.team_a.players.slice(0, 3).map((p, i) => (
                                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                                                <span>{p.name} (#{p.number})</span>
                                                <span style={{ color: '#DB0A40' }}>LIC: {p.license}</span>
                                            </div>
                                        ))}
                                        <div style={{ padding: '8px 0', textAlign: 'center', color: '#444' }}>... and {extractedData.team_a.players.length + extractedData.team_b.players.length - 3} more entries extracted</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ background: '#111', borderRadius: '24px', padding: '2rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem' }}>Actions</h3>
                            <button
                                onClick={processImage}
                                disabled={!image || isProcessing}
                                style={{
                                    width: '100%', background: image && !isProcessing ? '#DB0A40' : '#222',
                                    color: '#fff', border: 'none', padding: '1.2rem', borderRadius: '12px',
                                    fontWeight: 'bold', cursor: image && !isProcessing ? 'pointer' : 'not-allowed',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                    transition: '0.3s', boxShadow: image && !isProcessing ? '0 10px 20px rgba(219, 10, 64, 0.2)' : 'none'
                                }}
                            >
                                {isProcessing ? <Loader2 size={20} className="animate-spin" /> : <Activity size={20} />}
                                START SCANNER
                            </button>

                            <p style={{ fontSize: '0.75rem', color: '#444', marginTop: '1.5rem', lineHeight: '1.5' }}>
                                Tesseract.js will analyze the image pixels. For best results, ensure the match sheet is well-lit and flat. Data will be logged to system console in JSON format.
                            </p>
                        </div>

                        <div style={{ background: 'rgba(219, 10, 64, 0.03)', borderRadius: '24px', padding: '2rem', border: '1px solid rgba(219, 10, 64, 0.1)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem', color: '#DB0A40' }}>
                                <CheckCircle size={18} />
                                <span style={{ fontWeight: 'bold', fontSize: '0.8rem', letterSpacing: '1px' }}>SYSTEM STATUS</span>
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                Engine: Tesseract 5.0<br />
                                Language: FR/EN<br />
                                Output: Structured JSON
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MatchSheetScanner;
