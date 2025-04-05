import "./presentation.css";
import { ArrowRight } from "lucide-react";
import { ArrowLeft } from "lucide-react";
import { CheckCheck } from "lucide-react";
import { SquarePlus } from "lucide-react";
import { Trash2 } from "lucide-react";
import { Copy } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { SOCKET_URL } from "../../constants";
import { findById, update } from "../../services/presentation";
import { Presentation as PresentationType } from "../../types/presentation";
import Flowther from "../../assets/Flowther.svg";

    export const Presentation = () => {
    const [currentPage, setCurrentPage] = useState(0);
    const [pages, setPages] = useState([{ id: 0, sectionName: "", content: "" }]);
    const socketRef = useRef<Socket | null>(null);
    const [roomId, setRoomId] = useState(`room-${Date.now().toString().slice(-6)}`);
    const [presentationData, setPresentationData] = useState<PresentationType | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [saveStatus, setSaveStatus] = useState<string | null>(null); // État pour afficher le statut de sauvegarde
    const contentEditableRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
    const presentationIdRef = useRef<string | null>(null); // Pour stocker l'ID de la présentation

    // Récupérer l'ID de la présentation à partir de l'URL
    useEffect(() => {
        const pathSegments = window.location.pathname.split('/');
        const presentationId = pathSegments[pathSegments.length - 1];

        if (presentationId) {
            presentationIdRef.current = presentationId;
            loadPresentation(presentationId);
        }
    }, []);

    // Fonction pour charger les données de la présentation
    const loadPresentation = async (id: string) => {
        try {
            setLoading(true);
            const data = await findById(id);
            setPresentationData(data);

            // Transformer les sections de la présentation en pages pour l'affichage
            if (data && data.content && data.content.length > 0) {
                const formattedPages = data.content.map((section, index) => ({
                    id: index,
                    sectionName: section.section,
                    content: section.content
                }));
                setPages(formattedPages);
            }

            setLoading(false);
        } catch (err) {
            console.error("Erreur lors du chargement de la présentation:", err);
            setError("Impossible de charger la présentation");
            setLoading(false);
        }
    };

    useEffect(() => {
        socketRef.current = io(SOCKET_URL);

        if (socketRef.current) {
            socketRef.current.emit('create-section-room', {
                sectionName: roomId
            });
        }

        // Nettoyage lors du démontage du composant
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [roomId]);

    const handleSectionNameChange = (e: React.ChangeEvent<HTMLInputElement>, pageIndex: number) => {
        const newSectionName = e.target.value;

        const updatedPages = [...pages];
        updatedPages[pageIndex] = {
            ...updatedPages[pageIndex],
            sectionName: newSectionName
        };
        setPages(updatedPages);

        if (pageIndex === currentPage && socketRef.current) {
            socketRef.current.emit('update-section-name', {
                roomId: roomId,
                sectionName: newSectionName
            });
        }
    };

    useEffect(() => {
        const currentSectionName = pages[currentPage]?.sectionName;

        if (socketRef.current) {
            socketRef.current.emit('update-section-name', {
                roomId: roomId,
                sectionName: currentSectionName || "Sans titre"
            });
        }
    }, [currentPage, pages, roomId]);

    const handleContentChange = (e: React.FormEvent) => {
        const div = e.currentTarget;
        const content = div.textContent || "";
        div.setAttribute('data-empty', content.trim() === '' ? 'true' : 'false');
    };

    // Fonction pour sauvegarder le contenu de la page actuelle
    const saveCurrentPageContent = () => {
        const currentContentEditable = contentEditableRefs.current[currentPage];
        if (currentContentEditable) {
            const content = currentContentEditable.innerHTML;

            const updatedPages = [...pages];
            updatedPages[currentPage] = {
                ...updatedPages[currentPage],
                content: content
            };
            setPages(updatedPages);
        }
    };

    // Fonction pour sauvegarder la présentation complète
    const savePresentation = async () => {
        if (!presentationData || !presentationIdRef.current) {
            setError("Impossible de sauvegarder: données manquantes");
            return;
        }

        try {
            // Sauvegarder d'abord la page actuelle
            saveCurrentPageContent();

            // Préparer les données pour la mise à jour
            const updatedContent = pages.map(page => ({
                section: page.sectionName,
                content: page.content
            }));

            const updatedPresentation = {
                ...presentationData,
                content: updatedContent
            };

            setSaveStatus("Sauvegarde en cours...");

            // Appeler l'API pour mettre à jour la présentation
            await update(presentationIdRef.current, updatedPresentation);

            setSaveStatus("Sauvegardé!");

            // Effacer le message de statut après 3 secondes
            setTimeout(() => {
                setSaveStatus(null);
            }, 3000);

        } catch (err) {
            console.error("Erreur lors de la sauvegarde:", err);
            setSaveStatus("Erreur de sauvegarde");

            // Effacer le message d'erreur après 3 secondes
            setTimeout(() => {
                setSaveStatus(null);
            }, 3000);
        }
    };

    const goToNextPage = () => {
        if (currentPage < pages.length - 1) {
            // Sauvegarder le contenu actuel avant de changer de page
            saveCurrentPageContent();
            setCurrentPage(currentPage + 1);
        }
    };

    const goToPreviousPage = () => {
        if (currentPage > 0) {
            // Sauvegarder le contenu actuel avant de changer de page
            saveCurrentPageContent();
            setCurrentPage(currentPage - 1);
        }
    };

    const addNewPage = () => {
        if (pages.length < 10) {
            // Sauvegarder le contenu actuel avant d'ajouter une nouvelle page
            saveCurrentPageContent();
            setPages([...pages, { id: pages.length, sectionName: "", content: "" }]);
            setCurrentPage(pages.length);
        }
    };

    const deleteCurrentPage = () => {
        if (pages.length > 1) {
            const updatedPages = pages.filter((_, index) => index !== currentPage);
            setPages(updatedPages);
            if (currentPage === pages.length - 1) {
                setCurrentPage(currentPage - 1);
            }
        }
    };

    const copyRoomIdToClipboard = () => {
        navigator.clipboard.writeText(roomId);
        alert("Code de room copié dans le presse-papier!");
    };

    if (loading) {
        return <div className="loading">Chargement de la présentation...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="presentation">
            {presentationData && (
                <div className="presentation-info">
                    <img src={Flowther} alt="Flowther" />
                    <h1>{presentationData.title}</h1>
                    <p>par {presentationData.author}</p>
                </div>
            )}

            <div className="page-indicator">
                {currentPage + 1} / {pages.length}
            </div>

            <div className="toolbar">
                <div
                    onClick={goToPreviousPage}
                    className={`toolbar-button ${currentPage === 0 ? "disabled" : ""}`}
                >
                    <ArrowLeft />
                </div>
                <div
                    onClick={goToNextPage}
                    className={`toolbar-button ${currentPage === pages.length - 1 ? "disabled" : ""}`}
                >
                    <ArrowRight />
                </div>
                <div className="code">
                    <div className="code-item">{roomId}</div>
                    <div onClick={copyRoomIdToClipboard}><Copy /></div>
                </div>
                <div className="toolbar-button" onClick={savePresentation}>
                    <CheckCheck />
                    {saveStatus && <span className="save-status">{saveStatus}</span>}
                </div>
                <div
                    className={`toolbar-button ${pages.length >= 10 ? "disabled" : ""}`}
                    onClick={pages.length < 10 ? addNewPage : undefined}
                >
                    <SquarePlus />
                </div>
                <div className="toolbar-button" onClick={deleteCurrentPage}>
                    <Trash2 />
                </div>
            </div>

            {pages.map((page, index) => (
                <div className="text-container" key={page.id} style={{ display: currentPage === index ? 'block' : 'none' }}>
                    <input
                        type="text"
                        placeholder="Nom de la section"
                        className="section-name"
                        value={page.sectionName}
                        onChange={(e) => handleSectionNameChange(e, index)}
                    />
                    <div
                        className="section-perfect-presentation"
                        contentEditable
                        data-placeholder="넌 최고야, 항상처럼 확실해."
                        onInput={handleContentChange}
                        spellCheck={false}
                        dangerouslySetInnerHTML={{ __html: page.content }}
                        ref={el => contentEditableRefs.current[index] = el}
                    >
                    </div>
                </div>
            ))}
        </div>
    );
};