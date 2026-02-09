import React from 'react';
import HistoryTables from './components/HistoryTables';
import './css/history.css';

const History = () => {
    return (

        <div className="history-page container animate-fade-in">
            <h1 className="history-title">Club History</h1>
            <div className="history-intro">
                <p>
                    From humble beginnings to national prominence, Hassania Union Sport d'Agadir (HUSA) Basketball has been a beacon of excellence in Moroccan sports.
                    Our journey is defined by relentless passion, tactical discipline, and a commitment to nurturing local talent.
                    Every season writes a new chapter in our legacy, marked by thrilling victories, heartbreaking lessons, and an unwavering drive to be the best.
                </p>
            </div>
            <HistoryTables />
        </div>
    );
};

export default History;
