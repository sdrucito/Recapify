import NavHeader from "./NavHeader.jsx";
import {Alert, Container, Row} from "react-bootstrap";
import {Outlet} from "react-router";

function DefaultLayout(props){
    return (
        <>
            <NavHeader handleLogout={props.handleLogout} loggedIn={props.loggedIn}/>
            <Container fluid className="mt-3">
                {props.message && <Row>
                    <Alert variant={props.message.type} onClose={() => props.setMessage('')}
                           dismissible>{props.message.msg}</Alert>
                </Row>}
                <Outlet></Outlet>
            </Container>
        </>
    );
}
export default DefaultLayout;