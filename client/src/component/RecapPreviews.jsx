import {Button, ListGroup} from "react-bootstrap";
import {Link} from "react-router";

function RecapPreviews(props) {
    const handleVisibilityClick = (e, recap) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("Change visibility for recap:", recap.id, recap.visibility);
    };
    return (
        <>
            <ListGroup>
                {props.recapPreviews.map((r, index) => (
                    <ListGroup.Item key={r.id} action as={Link} to={`/recaps/${r.id}`}
                                    className="d-flex justify-content-between align-items-center"
                                    variant={index % 2 === 0 ? "light" : "secondary"}>
                        <div>
                            <strong>{r.title}</strong>
                            <small> {r.themeName}</small><br/>
                            <small>di {r.authorUsername} – {r.createdAt.format("YYYY-MM-DD")}</small>
                        </div>
                        {props.loggedIn && <div
                            onClick={(e) => handleVisibilityClick(e, r)}
                            style={{ cursor: "pointer" }}
                            className="d-flex align-items-center gap-2">
                            {r.visibility === "private" ? (
                                <>
                                    <Button variant="warning" size="sm">
                                        <i className="bi bi-lock-fill gap-1"></i>Private</Button>
                                </>
                            ) : (
                                <>
                                    <Button variant="success" size="sm">
                                        <i className="bi bi-unlock-fill gap-1"></i>Public</Button>
                                </>
                            )}
                        </div>}
                    </ListGroup.Item>
                ))}
            </ListGroup>
        </>
    );
}

export default RecapPreviews;
