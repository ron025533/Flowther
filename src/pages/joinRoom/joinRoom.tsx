//joinRoom.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./joinRoom.css";

export const JoinRoom = () => {
    const [roomId, setRoomId] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleJoin = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!roomId.trim()) {
            setError("Veuillez entrer un code de room");
            return;
        }
        
        // Rediriger vers la page de présentation en tant que participant
        navigate(`/view/${roomId}`);
    };

    return (
        <div className="join-room-container">
            <div className="join-room-card">
                <h1>Rejoindre une présentation</h1>
                <p>Entrez le code de room fourni par le présentateur</p>
                
                <form onSubmit={handleJoin}>
                    <input
                        type="text"
                        placeholder="Code de room"
                        value={roomId}
                        onChange={(e) => {
                            setRoomId(e.target.value);
                            setError("");
                        }}
                        className="room-id-input"
                    />
                    
                    {error && <div className="error-message">{error}</div>}
                    
                    <button type="submit" className="join-button">
                        Rejoindre
                    </button>
                </form>

                <div className="back-link">
                    <a href="/">Retour à l'accueil</a>
                </div>
            </div>
        </div>
    );
};