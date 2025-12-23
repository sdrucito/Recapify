import { ListGroup} from "react-bootstrap";
import {Link} from "react-router";

function RecapPreviews({recaps}) {
    return (
        <>
            <ListGroup>
                {recaps.map((r, index) => (
                    <ListGroup.Item
                        key={r.id}
                        action
                        as={Link}
                        to={`/recaps/${r.id}`}
                        variant={index % 2 === 0 ? "light" : "secondary"}
                    >
                        <strong>{r.title}</strong><br/>
                        <small>{r.theme} · {r.createdAt}</small>
                    </ListGroup.Item>
                ))}
            </ListGroup>
        </>
    );
}

export default RecapPreviews;
