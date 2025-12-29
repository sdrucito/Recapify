import {Button, ListGroup} from "react-bootstrap";
import {Link} from "react-router";

function RecapPreviews(props) {
    const handleVisibilityClick = (e, recap) => {
        e.preventDefault();
        e.stopPropagation();
        props.onUpdateVisibility(recap);
    };
    return (
        <>
            <ListGroup>
                {props.recapPreviews.map((r, index) => {
                    const isUpdating = props.updatingRecapId === r.id;
                    return (
                    <ListGroup.Item key={r.id} action as={Link} to={`/recaps/${r.id}`}
                                    className="d-flex justify-content-between align-items-center"
                                    variant={index % 2 === 0 ? "light" : "secondary"}>
                        <div>
                            <strong>{r.title}</strong>
                            <small> {r.themeName}</small><br/>
                            <small>di {r.authorUsername} – {r.createdAt.format("YYYY-MM-DD")}</small>
                        </div>
                        {props.loggedIn && (
                            <Button
                                size="sm"
                                variant={r.visibility === "private" ? "warning" : "success"}
                                disabled={isUpdating}
                                onClick={(e) => handleVisibilityClick(e, r)}
                            >
                                {isUpdating
                                    ? "Updating..."
                                    : r.visibility === "private"
                                        ? <>Private <i className="bi bi-lock-fill" /></>
                                        : <>Public <i className="bi bi-unlock-fill" /></>}
                            </Button>
                        )}
                    </ListGroup.Item>
                    );})}
            </ListGroup>
        </>

    );
}

export default RecapPreviews;
