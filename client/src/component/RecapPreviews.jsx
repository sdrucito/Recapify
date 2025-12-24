import { ListGroup} from "react-bootstrap";
import {Link} from "react-router";

function RecapPreviews(props) {
    return (
        <>
            <ListGroup>
                {props.recapPreviews.map((r, index) => (
                    <ListGroup.Item key={r.id} action as={Link} to={`/recaps/${r.id}`} variant={index % 2 === 0 ? "light" : "secondary"}>
                        <strong>{r.title}</strong><small> {r.themeName}</small><br/>
                        <small> di {r.authorUsername} · {r.createdAt.format("YYYY-MM-DD")}</small>
                    </ListGroup.Item>
                ))}
            </ListGroup>
        </>
    );
}

export default RecapPreviews;
