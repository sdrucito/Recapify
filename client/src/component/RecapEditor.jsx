import {useEffect, useState} from "react";
import {Button, Container} from "react-bootstrap";
import API from "../API.mjs";
import {SERVER_URL} from "../config.js";
import {useLocation, useNavigate} from "react-router";

function RecapEditor() {
    const location = useLocation();
    const navigate = useNavigate();

    const { sourceType, source } = location.state || {}; //Note: source contains only recap preview, not full recap.
    const [title, setTitle] = useState("Untitled recap");
    const [pages, setPages] = useState([ //TODO: add slots
        { id: 1, backgroundId: null },
        { id: 2, backgroundId: null },
        { id: 3, backgroundId: null }
    ]);
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [backgrounds, setBackgrounds] = useState([]);

    // take information from CreateRecap
    useEffect(() => {
        if (!source)
            navigate('/myrecaps/create');
    }, [source, navigate]);
    useEffect(() => {
        const loadSourceRecap = async () => {
            try {
                const fullRecap = await API.getRecap(source.id);
                setTitle(fullRecap.title);
                setPages(
                    fullRecap.pages.map(p => ({
                        id: p.id,
                        pageIndex: p.page_index,
                        backgroundId: p.background.id,
                        backgroundImagePath: p.background.imagePath,
                        layout: p.background.layout.slots,
                        texts: p.texts.map(t => ({
                            slotIndex: t.slotIndex,
                            content: t.content
                        }))
                    }))
                );
            } catch (err) {
                console.error(err);
                navigate('/myrecaps/create');
            }
        };

        if (source)
            loadSourceRecap();
    }, [source, navigate]);

    useEffect(() => {
        const loadBackgrounds = async () => {
            try {
                const bgs = await API.getBackgroundsByTheme(1); // TODO: themeId dinamico
                setBackgrounds(
                    bgs.map(bg => ({
                        id: bg.id,
                        previewUrl: `${SERVER_URL}/images/${bg.image_path}`
                    }))
                );
            } catch (err) {
                console.error(err);
            }
        };
        loadBackgrounds();
    }, []);

    const assignBackground = (bgId) => {
        setPages(old =>
            old.map((p, i) =>
                i === currentPageIndex ? { ...p, backgroundId: bgId } : p
            )
        );
    };

    const addPage = () => {
        setPages(p => [...p, { id: Date.now(), backgroundId: null }]);
    };

    const removePage = () => {
        if (pages.length <= 3) return;
        setPages(p => p.filter((_, i) => i !== currentPageIndex));
        setCurrentPageIndex(0);
    };
    const movePageUp = () => {
        if (currentPageIndex === 0) return;

        setPages(old => {
            const copy = [...old];
            [copy[currentPageIndex - 1], copy[currentPageIndex]] =
                [copy[currentPageIndex], copy[currentPageIndex - 1]];
            return copy;
        });
        setCurrentPageIndex(i => i - 1);
    };

    const movePageDown = () => {
        if (currentPageIndex === pages.length - 1) return;

        setPages(old => {
            const copy = [...old];
            [copy[currentPageIndex + 1], copy[currentPageIndex]] =
                [copy[currentPageIndex], copy[currentPageIndex + 1]];
            return copy;
        });
        setCurrentPageIndex(i => i + 1);
    };
    const handleSave = async () => {
        const payload = {
            title,
            theme_id: source.theme_id,              // dal template/recap
            visibility: "private",                  // per ora fisso
            derived_from_recap_id:
                sourceType === "recap" ? source.id : null,
            pages: pages.map((p, index) => ({
                page_index: index,
                background_id: p.backgroundId,
                texts: p.texts.filter(t => t.content.trim() !== "")
            }))
        };

        try {
            const result = await API.createRecap(payload);
            navigate(`/recaps/${result.id}`);
        } catch (err) {
            console.error(err);
            alert("Error while saving recap");
        }
    };

    return (
        <Container fluid>
            <EditorHeader
                title={title}
                onTitleChange={setTitle}
                onSave={() => console.log("save", pages)}
                onBack={() => navigate('/myrecaps/create')}
            />
            {/*onSave={handleSave}*/}

            <div className="d-flex gap-3">
                <PagesSidebar
                    pages={pages}
                    currentIndex={currentPageIndex}
                    onSelect={setCurrentPageIndex}
                    onAdd={addPage}
                    onRemove={removePage}
                    onMoveUp={movePageUp}
                    onMoveDown={movePageDown}
                />

                <PagePreview
                    page={pages[currentPageIndex]}
                    onUpdateText={(slotIndex, value) => {
                        setPages(old =>
                            old.map((p, i) =>
                                i === currentPageIndex ? {
                                        ...p,
                                        texts: p.texts.map(t =>
                                            t.slotIndex === slotIndex
                                                ? { ...t, content: value }
                                                : t
                                        )
                                    } : p
                            )
                        );
                    }}
                />


                <BackgroundSidebar
                    backgrounds={backgrounds}
                    selectedBgId={pages[currentPageIndex]?.backgroundId}
                    onSelect={assignBackground}
                />
            </div>
        </Container>
    );
}

function EditorHeader(props) {
    return (
        <div className="d-flex align-items-center gap-3 mb-3">
            <input
                className="form-control"
                value={props.title}
                onChange={e => props.onTitleChange(e.target.value)}
            />
            <Button variant="secondary" onClick={props.onBack}>Back</Button>
            <Button variant="primary" onClick={props.onSave}>Save</Button>
        </div>
    );
}
function PagesSidebar(props) {
    return (
        <div style={{ width: "180px" }}>
            <h6>Pages</h6>

            {props.pages.map((p, index) => (
                <div key={p.id}
                    className={`border rounded p-2 mb-2 ${index === props.currentIndex ? "border-primary" : ""}`}
                    style={{ cursor: "pointer" }} onClick={() => props.onSelect(index)}
                >Page {index + 1}</div>
            ))}

            <div className="d-flex gap-2 mt-2">
                <Button size="sm" onClick={props.onAdd}>+</Button>
                <Button size="sm" variant="danger" disabled={props.pages.length <= 3}
                        onClick={props.onRemove}>−</Button>
            </div>
            <div className="d-flex gap-2 mt-2">
                <Button size="sm" disabled={props.currentIndex === 0}
                        onClick={props.onMoveUp}>↑</Button>
                <Button size="sm"
                        disabled={props.currentIndex === props.pages.length - 1}
                        onClick={props.onMoveDown}>↓</Button>
            </div>
        </div>
    );
}
function PagePreview({ page, onUpdateText }) {
    if (!page || !page.backgroundImagePath) {
        return (
            <div className="flex-fill border rounded me-3 d-flex align-items-center justify-content-center text-muted">
                Select a background
            </div>
        );
    }

    return (
        <div
            className="flex-fill border rounded me-3 position-relative"
            style={{
                height: "70vh",
                backgroundImage: `url(${SERVER_URL}/images/${page.backgroundImagePath})`,
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center"
            }}
        >
            {page.texts.map(t => (
                <textarea
                    key={t.slotIndex}
                    value={t.content}
                    onChange={e => onUpdateText(t.slotIndex, e.target.value)}
                    placeholder={`Text ${t.slotIndex + 1}`}
                    style={{
                        position: "absolute",
                        top: `${getSlotPosition(page, t.slotIndex).y}%`,
                        left: `${getSlotPosition(page, t.slotIndex).x}%`,
                        transform: "translate(-50%, -50%)",
                        width: "220px",
                        resize: "none",
                        color: "#000",
                        background: "rgba(255,255,255,0.85)",
                        borderRadius: "6px",
                        border: "1px solid #ccc",
                        padding: "6px"
                    }}
                />
            ))}
        </div>
    );
}
function getSlotPosition(page, slotIndex) {
    if (!page.layout || !page.layout[slotIndex]) {
        return { x: 50, y: 50 };
    }
    return page.layout[slotIndex];
}

function BackgroundSidebar(props) {
    return (
        <div style={{width: "220px"}}>
            <h6>Backgrounds</h6>
            {props.backgrounds.map(bg => (
                <div key={bg.id}
                     className={`border rounded p-1 mb-2 ${bg.id === props.selectedBgId ? "border-primary" : ""}`}
                     style={{cursor: "pointer"}} onClick={() => props.onSelect(bg.id)}>
                    <img src={bg.previewUrl} className="img-fluid" alt=""/>
                </div>
            ))}
        </div>
    );
}

export default RecapEditor