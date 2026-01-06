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
                    <h2>{recap.title}</h2>
                    <p className="recap-subtle">di {recap.authorUsername} - {recap.createdAt.format("DD MMM YYYY")} - {recap.derived_from_recap_id}</p>
                    <RecapCarousel pagesWithLayout={pagesWithLayout}></RecapCarousel>
                </>
            )}
        </Container>
    );
}

function RecapCarousel (props){
    return (
        <Carousel interval={null}>
            {props.pagesWithLayout.map(page => (
                <Carousel.Item key={page.id}>
                    <PageSlide page={page}/>
                </Carousel.Item>
            ))}
        </Carousel>
    );
}

function PageSlide (props){
    return (
        <div
            style={{height: "70vh", display: "flex",
                justifyContent: "center", alignItems: "center"}}
        >
            <div style={{ position: "relative" }}>
                <img
                    src={`${SERVER_URL}/images/${props.page.background.imagePath}`}
                    style={{maxHeight: "70vh", maxWidth: "100%", display: "block"}}
                    alt=""
                />

                {props.page.textsWithPosition.map(t => (
                    t.position && (
                        <div
                            key={t.slotIndex}
                            style={{
                                position: "absolute", top: t.position.top, left: t.position.left,
                                transform: "translate(-50%, -50%)", color: "white",
                                fontSize: "1.3rem", maxWidth: "60%",
                                textAlign: "center", textShadow: "0 0 6px rgba(0,0,0,0.9)"}}
                        >{t.content}</div>
                    )
                ))}
            </div>
        </div>
    );
}

export default RecapViewer;