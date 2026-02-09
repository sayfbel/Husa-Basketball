import React from 'react';
import PlayerCard from './components/PlayerCard';

import './css/squad.css';

import MouddenMohamed from '../../assets/images/players/MouddenMohamed.jpg';
import EchraouqiKhalid from '../../assets/images/players/EchraouqiKhalid.jpg';
import EchCharanyMohamed from '../../assets/images/players/EchCharanyMohamed.jpg';
import LaamraniYouness from '../../assets/images/players/LaamraniYouness.jpg';
import GuaouziZoubir from '../../assets/images/players/GuaouziZoubir.jpg';
import ChouaMBarek from '../../assets/images/players/ChouaMBarek.jpg';
import ChouaIsmail from '../../assets/images/players/ChouaIsmail.jpg';
import BentabjaouteYoussef from '../../assets/images/players/BentabjaouteYoussef.jpg';
import SoufianeBanyahya from '../../assets/images/players/hd-kobe-bryant-legendary-basketball-player-transparent-png-701751712573074r22keaurhi.png';
import MouadChanouni from '../../assets/images/players/hd-kobe-bryant-legendary-basketball-player-transparent-png-701751712573074r22keaurhi.png';
import ElbikaReda from '../../assets/images/players/hd-kobe-bryant-legendary-basketball-player-transparent-png-701751712573074r22keaurhi.png';
import BouchentoufRabii from '../../assets/images/players/BouchentoufRabii.jpg';
import coachImage from '../../assets/images/players/coach.jpg';
import presidentImage from '../../assets/images/players/President.jpg';

const Squad = () => {
    const staff = [
        { id: 'c1', name: 'Mohamed Haib', role: 'Head Coach', number: 'HC', image: coachImage },
        { id: 'p1', name: 'Abid Youssef', role: 'President', number: 'PR', image: presidentImage }
    ];

    const players = [
        { id: 5, name: 'Moudden Mohamed', number: '05', role: 'Player', image: MouddenMohamed },
        { id: 6, name: 'Echraouqi Khalid', number: '06', role: 'Player', image: EchraouqiKhalid },
        { id: 7, name: 'Ech Charany Mohamed', number: '07', role: 'Player', image: EchCharanyMohamed },
        { id: 8, name: 'Laamrani Youness', number: '08', role: 'Player', image: LaamraniYouness },
        { id: 9, name: 'Guaouzi Zoubir', number: '09', role: 'Player', image: GuaouziZoubir },
        { id: 10, name: 'Choua M\'Barek', number: '10', role: 'Player', image: ChouaMBarek },
        { id: 11, name: 'Choua Ismail', number: '11', role: 'Player', image: ChouaIsmail },
        { id: 12, name: 'Bentabjaoute Youssef', number: '12', role: 'Player', image: BentabjaouteYoussef },
        { id: 13, name: 'Soufiane Banyahya', number: '13', role: 'Player', image: SoufianeBanyahya },
        { id: 14, name: 'Mouad Chanouni', number: '14', role: 'Player', image: MouadChanouni },
        { id: 15, name: 'Elbika Reda', number: '15', role: 'Player', image: ElbikaReda },
        { id: 16, name: 'Bouchentouf Rabii', number: '16', role: 'Player', image: BouchentoufRabii },
    ];

    return (
        <div className="squad-page container animate-fade-in">
            <h1 className="squad-title">The Squad List</h1>

            {/* Coach Section */}
            <div className="staff-section">
                <h2 className="section-title">Technical Staff</h2>
                <div className="staff-grid">
                    {staff.map(member => (
                        <PlayerCard key={member.id} player={member} isStaff={true} />
                    ))}
                </div>
            </div>

            {/* Players Section */}
            <div className="roster-section">
                <h2 className="section-title">Roster</h2>
                <div className="squad-grid">
                    {players.map(player => (
                        <PlayerCard key={player.id} player={player} />
                    ))}
                </div>
            </div>


        </div>
    );
};

export default Squad;
