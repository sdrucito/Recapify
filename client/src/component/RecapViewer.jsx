import {useNavigate, useParams} from "react-router";
import {useEffect, useState} from "react";
import {Container, Carousel} from "react-bootstrap";
import API from "../API.mjs";
import {SERVER_URL, TEXT_BOX_MAX_WIDTH, TEXT_BOX_MIN_WIDTH} from "../constants.js";

function RecapViewer() {
    const {id} = useParams();
    const [recap, setRecap] = useState(null);
    const [derivedInfo, setDerivedInfo] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const loadRecap = async () => {
            setDerivedInfo(null); //Note: set at null for re-rendering the component
            const r = await API.getRecap(id);
            setRecap(r);
            if (r.derivedFromRecapId) {
                try {
                    const info = await API.getDerivedFromInfo(r.id);
                    setDerivedInfo(info);
                } catch {
                    setDerivedInfo(null);
                }
            }
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
                    <p className="recap-subtle">by {recap.authorUsername} - {recap.createdAt.format("DD MMM YYYY")}
                        {derivedInfo?.exists && (
                            <>
                                {" – "}
                                {derivedInfo.accessible ? (
                                    <>
                                        remixed from{" "}
                                        <span
                                            className="text-decoration-underline"
                                            style={{cursor: "pointer"}}
                                            onClick={() => navigate(`/recaps/${derivedInfo.id}`)}
                                        >{derivedInfo.title}</span>
                                        {" "}by {derivedInfo.authorUsername}
                                    </>
                                ) : (
                                    <>remixed from a private recap</>
                                )}
                            </>
                        )}</p>
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
                    style={{height: "70vh", maxWidth: "100%", display: "block", objectFit: "contain"}}
                    alt=""
                />

                {props.page.textsWithPosition.map(t => (
                    t.position && (
                        <div
                            key={t.slotIndex}
                            style={{
                                position: "absolute", top: t.position.top, left: t.position.left,
                                transform: "translate(-50%, -50%)", color: "white",
                                fontSize: "clamp(1.2rem, 1.3vw, 3rem)", maxWidth: TEXT_BOX_MAX_WIDTH, minWidth: TEXT_BOX_MIN_WIDTH,
                                textAlign: "center",
                                textShadow: "-1px -1px 2px #000, 1px -1px 2px #000,-1px  1px 2px #000,1px  1px 2px #000"
                            }}
                        >{t.content}</div>
                    )
                ))}
            </div>
        </div>
    );
}

export default RecapViewer;