import {Button, Container} from "react-bootstrap";
import {Link} from "react-router";

function NotFound() {
    return (
        <Container className="text-center mt-5">
            <h2>404 – Game Over</h2>
            <p>The page you are looking for does not exist.</p>
            <Button as={Link} to="/" variant="primary">Back to Home</Button>
        </Container>
    );
}

export default NotFound;