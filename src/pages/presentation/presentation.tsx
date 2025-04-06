import "./presentation.css";
import { ArrowRight } from "lucide-react";
import { ArrowLeft } from "lucide-react";
import { CheckCheck } from "lucide-react";
import { Import } from "lucide-react";
import { SquarePlus } from "lucide-react";
import { Trash2 } from "lucide-react";
import { Copy } from "lucide-react";
import { Check } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { SOCKET_URL } from "../../constants";
import { findById, update } from "../../services/presentation";
import { Presentation as PresentationType } from "../../types/presentation";
import Flowther from "../../assets/Flowther.svg";
import SwipeDetector from "../../components/SwipeDetector";

export const Presentation = () => {
    const [currentPage, setCurrentPage] = useState(0);
    const [pages, setPages] = useState([{ id: 0, sectionName: "", content: "" }]);
    const socketRef = useRef<Socket | null>(null);
    const [roomId, setRoomId] = useState(`room-${Date.now().toString().slice(-6)}`);
    const [presentationData, setPresentationData] = useState<PresentationType | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [saveStatus, setSaveStatus] = useState<string | null>(null);
    const contentEditableRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
    const presentationIdRef = useRef<string | null>(null);
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        const pathSegments = window.location.pathname.split('/');
        const presentationId = pathSegments[pathSegments.length - 1];

        if (presentationId) {
            presentationIdRef.current = presentationId;
            loadPresentation(presentationId);
        }
    }, []);

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

        // Sauvegarder d'abord le contenu actuel de la page en cours d'édition
        const currentContentEditable = contentEditableRefs.current[currentPage];
        let currentContent = pages[currentPage].content;

        if (currentContentEditable && currentPage === pageIndex) {
            currentContent = currentContentEditable.innerHTML;
        }

        const updatedPages = [...pages];
        // Mettre à jour le nom de la section
        updatedPages[pageIndex] = {
            ...updatedPages[pageIndex],
            sectionName: newSectionName
        };

        // Mettre à jour également le contenu de la page actuelle
        updatedPages[currentPage] = {
            ...updatedPages[currentPage],
            content: currentContent
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
            return updatedPages; // Retourner les pages mises à jour
        }
        return pages; // Retourner les pages actuelles si pas de mise à jour
    };

    const savePresentation = async () => {
        if (!presentationData || !presentationIdRef.current) {
            setError("Impossible de sauvegarder: données manquantes");
            return;
        }

        try {
            const updatedPages = saveCurrentPageContent();

            const updatedContent = updatedPages.map(page => ({
                order: null,
                section: page.sectionName,
                content: page.content
            }));

            const updatedPresentation = {
                ...presentationData,
                content: updatedContent
            };

            setSaveStatus("Sauvegarde en cours...");

            await update(presentationIdRef.current, updatedPresentation);

            setSaveStatus("Sauvegardé!");

            setTimeout(() => {
                setSaveStatus(null);
            }, 3000);

        } catch (err) {
            console.error("Erreur lors de la sauvegarde:", err);
            setSaveStatus("Erreur de sauvegarde");

            setTimeout(() => {
                setSaveStatus(null);
            }, 3000);
        }
    };

    const goToNextPage = () => {
        if (currentPage < pages.length - 1) {
            // Sauvegarder le contenu actuel avant de changer de page
            const updatedPages = saveCurrentPageContent();
            setPages(updatedPages); // Mettre à jour l'état avec les pages mises à jour
            setCurrentPage(currentPage + 1);
        }
    };

    const goToPreviousPage = () => {
        if (currentPage > 0) {
            // Sauvegarder le contenu actuel avant de changer de page
            const updatedPages = saveCurrentPageContent();
            setPages(updatedPages); // Mettre à jour l'état avec les pages mises à jour
            setCurrentPage(currentPage - 1);
        }
    };

    const addNewPage = () => {
        if (pages.length < 10) {
            // Sauvegarder le contenu actuel avant d'ajouter une nouvelle page
            const updatedPages = saveCurrentPageContent();
            setPages([...updatedPages, { id: pages.length, sectionName: "", content: "" }]);
            setCurrentPage(pages.length);
        }
    };

    const deleteCurrentPage = () => {
        if (pages.length > 1) {
            // Sauvegarder d'abord le contenu actuel
            const updatedPages = saveCurrentPageContent();
            const pagesAfterDeletion = updatedPages.filter((_, index) => index !== currentPage);
            setPages(pagesAfterDeletion);
            if (currentPage === updatedPages.length - 1) {
                setCurrentPage(currentPage - 1);
            }
        }
    };

    const copyRoomIdToClipboard = () => {
        navigator.clipboard.writeText(roomId);
        setCopied(true);
        setTimeout(() => {
            setCopied(false);
        }, 2000);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const isSaveShortcut = (isMac && e.metaKey && e.key === 's') || (!isMac && e.ctrlKey && e.key === 's');

            if (isSaveShortcut) {
                e.preventDefault(); // Empêche l'ouverture de la fenêtre de sauvegarde du navigateur
                savePresentation(); // Appelle ta fonction
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [savePresentation]);

    useEffect(() => {
        if (pages[currentPage]) {
            document.title = `${presentationData?.title} - ${pages[currentPage].sectionName}` || "Présentation";  // Si la section a un nom, l'afficher, sinon "Présentation"
        }
    }, [currentPage, pages]);

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
                    className={`toolbar-button reshide ${currentPage === 0 ? "disabled" : ""}`}
                >
                    <ArrowLeft />
                </div>
                <div
                    onClick={goToNextPage}
                    className={`toolbar-button reshide ${currentPage === pages.length - 1 ? "disabled" : ""}`}
                >
                    <ArrowRight />
                </div>
                <div className="code">
                    <div className="code-item">{roomId}</div>
                    <div className="code-copy" onClick={copyRoomIdToClipboard}>
                        {copied ? <Check /> : <Copy />}
                    </div>
                </div>
                <div className="toolbar-button" onClick={savePresentation}>
                    {saveStatus ? <CheckCheck color="#ae4bff" /> : <Import />}
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

                    <SwipeDetector
                        onSwipeLeft={goToNextPage}
                        onSwipeRight={goToPreviousPage}
                    >
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
                    </SwipeDetector>
                </div>
            ))}
        </div>
    );
};