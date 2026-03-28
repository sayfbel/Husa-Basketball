import { useState, useEffect, useRef } from 'react';

export const useCourtDrag = ({ courtRef, tokens, onUpdate, mode, viewBox, onHistoryPush }) => {
    const [draggingId, setDraggingId] = useState(null);
    
    // Refs to avoid stale closures in event listeners
    const stateRef = useRef({ tokens, mode, viewBox, onUpdate, draggingId });
    stateRef.current = { tokens, mode, viewBox, onUpdate, draggingId };

    /**
     * Smart Clamping Logic
     * Ensures token stays inside the grey territory box (rect x=25 y=25)
     */
    const clampPosition = (x, y, type) => {
        // 1. Define internal SVG Padding (Margins drawn inside the coordinate box)
        // Standard HUSA court has 25px margin in 1000px width.
        const isFullCourt = (viewBox?.w || 1000) === 1000;
        const padPx = isFullCourt ? 25 : 15;
        
        // Convert pad to percentage of coordinate space (always 1000x560 or 500x470)
        const padX = (padPx / (viewBox?.w || 1000)) * 100;
        const padY = (padPx / (viewBox?.h || 560)) * 100;
        
        // 2. Token Radius calculation
        // Players are 5% wide, Ball is 3.5% wide
        const tokenWidthPct = type === 'ball' ? 3.5 : 5.0;
        let radiusXPct = tokenWidthPct / 2;
        let radiusYPct = radiusXPct; // Default

        if (courtRef.current) {
            const { clientWidth, clientHeight } = courtRef.current;
            if (clientWidth && clientHeight) {
                // IMPORTANT: Radius in pixels must be uniform. 
                // Since width is 5% of width, radius is 2.5% of width in pixels.
                const radiusPixels = (radiusXPct / 100) * clientWidth;
                
                // Convert that pixel radius back into a vertical percentage of the REAL height
                radiusYPct = (radiusPixels / clientHeight) * 100;
            }
        } else {
            // Fallback using ideal aspect ratio
            const idealAspect = (viewBox?.w || 1000) / (viewBox?.h || 560);
            radiusYPct = radiusXPct * idealAspect;
        }

        // 3. Margin of Error / Comfort Zone (0.5% extra)
        const safety = 0.5;

        // 4. Final Clamping
        const minX = padX + radiusXPct + safety;
        const maxX = 100 - minX;
        const minY = padY + radiusYPct + safety;
        const maxY = 100 - minY;

        return {
            x: Math.max(minX, Math.min(maxX, x)),
            y: Math.max(minY, Math.min(maxY, y))
        };
    };

    const handleMouseDown = (e, token) => {
        if (mode !== 'move') return;
        e.stopPropagation();
        e.preventDefault();
        
        if (onHistoryPush) onHistoryPush();
        setDraggingId(token.id);
    };

    const handleMouseMove = (e) => {
        const { draggingId: id, tokens: currentTokens, mode: currentMode, onUpdate: update } = stateRef.current;
        
        if (!id || !courtRef.current || currentMode !== 'move') return;

        const rect = courtRef.current.getBoundingClientRect();
        
        // Use clientX/Y to get relative percentages
        const xPct = ((e.clientX - rect.left) / rect.width) * 100;
        const yPct = ((e.clientY - rect.top) / rect.height) * 100;

        const moverIndex = currentTokens.findIndex(t => t.id === id);
        if (moverIndex === -1) return;
        
        const mover = currentTokens[moverIndex];
        const clamped = clampPosition(xPct, yPct, mover.type);

        // Create updated tokens array
        const updatedTokens = currentTokens.map((t, idx) => 
            idx === moverIndex ? { ...t, x: clamped.x, y: clamped.y } : t
        );
        
        // Handle Ball Follow logic
        if (mover.type !== 'ball') {
            const ballIndex = updatedTokens.findIndex(t => t.type === 'ball');
            if (ballIndex !== -1) {
                const ball = updatedTokens[ballIndex];
                const dx = clamped.x - ball.x;
                const dy = clamped.y - ball.y;
                // Simple distance check
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 5) { // Snap range in percent
                    const snapped = clampPosition(clamped.x + 1.8, clamped.y + 1.8, 'ball');
                    updatedTokens[ballIndex] = { ...ball, x: snapped.x, y: snapped.y };
                }
            }
        }

        update(updatedTokens);
    };

    const handleMouseUp = () => {
        setDraggingId(null);
    };

    useEffect(() => {
        if (draggingId) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [draggingId]);

    return { draggingId, handleMouseDown, clampPosition };
};
