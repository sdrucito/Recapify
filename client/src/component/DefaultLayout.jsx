import NavHeader from "./NavHeader.jsx";
import {Container} from "react-bootstrap";
import {Outlet} from "react-router";

function DefaultLayout(){
    return (
        <>
            <NavHeader/>
            <Container fluid className="mt-3">
                <Outlet></Outlet>
            </Container>
        </>
    );
}
export default DefaultLayout;