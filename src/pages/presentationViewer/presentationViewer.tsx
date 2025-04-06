import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { SOCKET_URL } from "../../constants";
import scribbble from "../../assets/Scribbble.png"
import "./presentationViewer.css";

export const PresentationViewer = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState("");
    const [currentSection, setCurrentSection] = useState("En attente...");
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        // Connexion au serveur socket
        socketRef.current = io(SOCKET_URL);

        const socket = socketRef.current;

        // Gestion des événements de connexion
        socket.on("connect", () => {
            setConnected(true);

            // Rejoindre la room
            socket.emit("join-section-room", { sectionName: roomId });
        });

        socket.on("connect_error", () => {
            setError("Erreur de connexion au serveur");
            setConnected(false);
        });

        // Écouter les mises à jour de nom de section
        socket.on("section-name-updated", (data: { sectionName: string }) => {
            setCurrentSection(data.sectionName || "Sans titre");
        });

        // Nettoyage lors du démontage
        return () => {
            if (socket) {
                socket.disconnect();
            }
        };
    }, [roomId]);

    return (
        <div className="presentation-view">
            <div className="view-header">
                <strong>{roomId}</strong>
                <div className="connection-status">
                    <span className={`status-dot ${connected ? "connected" : "disconnected"}`}></span>
                    <span>{connected ? "Connecté" : "Déconnecté"}</span>
                </div>
            </div>

            {error && (
                <div className="error-banner">
                    {error}
                </div>
            )}

            <div className="section-display">
                {currentSection}
                <img src={scribbble} alt="scribbble" />
            </div>

            <div className="viewer-message">
                <p>Vous êtes connecté en tant que spectateur. Le contenu sera mis à jour automatiquement lorsque le présentateur changera de section.</p>
            </div>
        </div>
    );
};