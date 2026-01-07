import {Button, ListGroup} from "react-bootstrap";
import {Link} from "react-router";

function RecapPreviews(props) {

    return (
        <>
            <ListGroup>
                {props.recapPreviews.map((r, index) =>
                    <RecapPreviewItem
                        key={r.id} r={r} index={index} loggedIn={props.loggedIn}
                        updatingRecapId={props.updatingRecapId} onUpdateVisibility={props.onUpdateVisibility}
                    />
                )}
            </ListGroup>
        </>

    );
}
function RecapPreviewItem(props){
    const { r, index } = props;
    const isUpdating = props.updatingRecapId === r.id;

    const handleVisibilityClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        props.onUpdateVisibility(r);
    };

    return (
        <ListGroup.Item action as={Link} to={`/recaps/${r.id}`}
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
                    onClick={handleVisibilityClick}
                >
                    {isUpdating
                        ? "Updating..."
                        : r.visibility === "private"
                            ? <>Private <i className="bi bi-lock-fill" /></>
                            : <>Public <i className="bi bi-unlock-fill" /></>}
                </Button>
            )}
        </ListGroup.Item>
    );
}
export default RecapPreviews;
