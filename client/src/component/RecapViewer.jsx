import {useParams} from "react-router";
import {useEffect, useState} from "react";
import {Container, Carousel} from "react-bootstrap";
import API from "../API.mjs";
import {SERVER_URL} from "../config.js";

function RecapViewer() {
    const {id} = useParams();
    const [recap, setRecap] = useState(null);

    useEffect(() => {
        const loadRecap = async () => {
            const r = await API.getRecap(id);
            setRecap(r);
        };
        loadRecap();
    }, [id]);

    let pagesWithLayout = [];
    if (recap) {
        pagesWithLayout = recap.pages.map(page => {
            const slots = page.background.layout?.slots ?? [];
            // Note:
            // ?=optional chaining returns undefined, but should not happen
            // ??=nullish coalescing if left returns null or undefined, than return []

            const textsWithPosition = page.texts.map(t => {
                const slot = slots[t.slotIndex];
                return {...t, position: slot ? {top: `${slot.y}%`, left: `${slot.x}%`} : null};
            });
            return {...page, textsWithPosition};
        });
    }
    return (
        <Container>
            {!recap && <p>Loading recap...</p>}
            {recap && (
                <>
                    {/* Header */}
                    <h2>{recap.title}</h2>
                    <p className="recap-subtle">di {recap.authorUsername} - {recap.createdAt.format("DD MMM YYYY")}</p>

                    {/* Carousel */}
                    <Carousel interval={null}>
                        {pagesWithLayout.map(page => (
                            <Carousel.Item key={page.id}>
                                <div
                                    style={{
                                        height: "70vh",
                                        backgroundImage: `url(${SERVER_URL}/images/${page.background.imagePath})`,
                                        backgroundSize: "contain", backgroundRepeat: "no-repeat",
                                        backgroundPosition: "center", position: "relative"
                                    }}
                                >
                                    {page.textsWithPosition.map(t => (
                                        t.position && (
                                            <div key={t.slotIndex}
                                                style={{
                                                    position: "absolute", top: t.position.top, left: t.position.left,
                                                    transform: "translate(-50%, -50%)",
                                                    color: "white", fontSize: "1.3rem",
                                                    maxWidth: "60%", textAlign: "center",
                                                    textShadow: `0 0 6px rgba(0,0,0,0.9), 0 0 12px rgba(0,0,0,0.6)`
                                                }}
                                            >{t.content}</div>
                                        )
                                    ))}
                                </div>
                            </Carousel.Item>
                        ))}
                    </Carousel>
                </>
            )}
        </Container>
    );
}

export default RecapViewer;