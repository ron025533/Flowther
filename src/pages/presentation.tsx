import "./presentation.css";
import { ArrowRight } from "lucide-react";
import { ArrowLeft } from "lucide-react";
import { CheckCheck } from "lucide-react";
import { Copy } from "lucide-react";
import { SquarePlus } from "lucide-react";
import { Trash2 } from "lucide-react";
import { socketService } from "../services/socket";
import { useEffect } from "react";

export const Presentation = () => {

    const handleContentChange = (e: React.FormEvent<HTMLDivElement>) => {
        const div = e.currentTarget;
        div.setAttribute('data-empty', div.textContent?.trim() === '' ? 'true' : 'false');
    };

    useEffect(() => {
        socketService.handleSomething();
    }, [])

    return (
        <div className="presentation">
            <div className="toolbar">
                <ArrowLeft />
                <ArrowRight />
                <div className="code">
                    <div className="code-item">JI84Io#t</div>
                    <Copy />
                </div>
                <CheckCheck />
                <SquarePlus />
                <Trash2 />
            </div>
            <input type="text" placeholder="Section Name" className="section-name" />
            <div
                className="section-perfect-presentation"
                contentEditable
                data-placeholder="넌 최고야, 항상처럼 확실해."
                onInput={handleContentChange}
                spellCheck={false}
            >
            </div>
        </div>
    );
};