//presentation.tsx
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

export const Presentation = () => {
    const [currentPage, setCurrentPage] = useState(0);
    const [pages, setPages] = useState([{ id: 0, sectionName: "" }]);
    const socketRef = useRef<Socket | null>(null);
    const [roomId, setRoomId] = useState(`room-${Date.now().toString().slice(-6)}`);

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

    const handleContentChange = (e: React.FormEvent<HTMLDivElement>) => {
        const div = e.currentTarget;
        div.setAttribute('data-empty', div.textContent?.trim() === '' ? 'true' : 'false');
    };

    const goToNextPage = () => {
        if (currentPage < pages.length - 1) {
            setCurrentPage(currentPage + 1);
        }
    };

    const goToPreviousPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
        }
    };

    const addNewPage = () => {
        if (pages.length < 10) { 
            setPages([...pages, { id: pages.length, sectionName: "" }]);
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

    return (
        <div className="presentation">

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
                <div className="toolbar-button">
                    <CheckCheck />
                </div>
                <div 
                    className={`toolbar-button ${pages.length >= 5 ? "disabled" : ""}`}
                    onClick={pages.length < 5 ? addNewPage : undefined}
                >
                    <SquarePlus />
                </div>
                <div className="toolbar-button" onClick={deleteCurrentPage}>
                    <Trash2 />
                </div>
            </div>
            
            <div className="page-indicator">
                Page {currentPage + 1} / {pages.length}
            </div>
            
            {pages.map((page, index) => (
                <div key={page.id} style={{ display: currentPage === index ? 'block' : 'none' }}>
                    <input 
                        type="text" 
                        placeholder="Section Name" 
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
                    >
                    </div>
                </div>
            ))}
        </div>
    );
};