import { useState, useEffect } from "react";
import "./home.css";
import { ArrowUpRight } from "lucide-react";
import { findAll, create } from "../../services/presentation";
import { Presentation } from "../../types/presentation";

export const Home = () => {
    const [presentations, setPresentations] = useState<Presentation[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [roomCode, setRoomCode] = useState("");
    const [newPresentation, setNewPresentation] = useState<Presentation>({
        _id: null,
        author: "",
        title: "",
        content: [{ section: "", order: 0, content: "" }]
    });

    useEffect(() => {
        // Charger toutes les présentations au chargement du composant
        const loadPresentations = async () => {
            try {
                const data = await findAll();
                setPresentations(data);
            } catch (error) {
                console.error("Erreur lors du chargement des présentations:", error);
            }
        };
        loadPresentations();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewPresentation({
            ...newPresentation,
            [name]: value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Ajout d'une section par défaut
            const presentationToCreate = {
                ...newPresentation,
                content: [{ section: "", order: 0, content: "" }]
            };

            const createdPresentation = await create(presentationToCreate);
            setPresentations([...presentations, createdPresentation]);
            setNewPresentation({
                _id: "",
                author: "",
                title: "",
                content: [{ section: "", order: 0, content: "" }]
            });
            setShowCreateModal(false);
        } catch (error) {
            console.error("Erreur lors de la création de la présentation:", error);
        }
    };

    return (
        <div className="home">
            <div className="home-title"><span>Toutes les</span> Présentations</div>
            <div className="home-top">
                <div className="new-button" onClick={() => setShowCreateModal(true)}>
                    Nouvelle Présentation
                </div>
                <div className="join-button">
                    <input
                        className="code-field"
                        type="text"
                        placeholder="Code Présentation"
                        value={roomCode}
                        onChange={(e) => setRoomCode(e.target.value)}
                    />
                    <a href={`/view/${roomCode}`} className="enter-icon">
                        <ArrowUpRight />
                    </a>
                </div>
            </div>

            {/* Modal de création */}
            {showCreateModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Nouvelle présentation</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <input
                                    type="text"
                                    id="author"
                                    name="author"
                                    placeholder="Auteur"
                                    value={newPresentation.author}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    placeholder="Titre"
                                    value={newPresentation.title}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-buttons">
                                <button type="submit" className="submit-btn">Créer</button>
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="cancel-btn"
                                >
                                    Annuler
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="presentation-list">
                {presentations.length > 0 ? (
                    presentations.map((presentation, index) => (
                        <div key={index} className="presentation-item">
                            <div className="presentation-creator">/par {presentation.author}</div>
                            <a href={`/presentation/${presentation._id}`} className="presentation-block">{presentation.title}</a>
                        </div>
                    ))
                ) : (
                    <div className="no-presentations">Aucune présentation disponible</div>
                )}
            </div>
        </div>
    );
};