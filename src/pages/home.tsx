import { useEffect } from "react";
import { socketService } from "../services/socket";
import "./home.css";
import { ArrowUpRight } from "lucide-react";

export const Home = () => {
    const handleClick = () => {
        socketService.handleMessaging("test test test");
    }

    useEffect(() => {
        socketService.receiveMessage();
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
            <button onClick={handleClick}>test</button>
        </div>
    );
};