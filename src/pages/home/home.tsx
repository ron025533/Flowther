import { useEffect, useState } from "react";
import { socketService } from "../../services/socket";
import "./home.css";
import { ArrowUpRight } from "lucide-react";

export const Home = () => {
    const [clientId, setClientId] = useState('');
    const [presentation, setPresentation] = useState('');

    const handleClick = () => {
        socketService.sendMessage("test test test");
    }

    const handleJoin = () => {
        socketService.JoinPresentation({clientId: clientId, presentation: presentation});
    }


    useEffect(() => {
        socketService.receiveMessage();
        socketService.JoinedPresentation();
    },[]);

    return (
        <div className="home">
            <div className="home-title"><span>All</span> Presentations</div>
            <div className="home-top">
                <div className="new-button">New Presentation</div>
                <div className="join-button">
                    <input className="code-field" type="text" placeholder="Code Presentation" />
                    <div className="enter-icon">
                        <ArrowUpRight />
                    </div>
                </div>
            </div>
            <div className="presentation-list">
                <div className="presentation-item">
                    <div className="presentation-creator">/by Creator</div>
                    <div className="presentation-block">Offen</div>
                </div>
                <div className="presentation-item">
                    <div className="presentation-creator">/by Creator</div>
                    <div className="presentation-block">Offen</div>
                </div>
            </div>
        </div>
    );
};