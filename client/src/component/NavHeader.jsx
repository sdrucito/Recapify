import {Button, Container, Navbar} from 'react-bootstrap'
import {useEffect, useState} from "react";
import {Link, useNavigate} from "react-router";
import {LogoutButton} from "./AuthComponents.jsx";
import {useUnsavedChanges} from "./UnsavedChangesContext.jsx";


function NavHeader(props){
    const [darkMode, setDarkMode] = useState(false);
    const navigate = useNavigate();
    const { hasUnsavedChanges, setHasUnsavedChanges } = useUnsavedChanges();

    useEffect(()=>{
        if(darkMode) {
            document.documentElement.setAttribute("data-bs-theme", "dark");
        }else{
            document.documentElement.removeAttribute("data-bs-theme");
        }
    },[darkMode]);

    const guardedNavigate = (path) => {
        if (hasUnsavedChanges) {
            const ok = window.confirm(
                "You have unsaved changes. Are you sure you want to leave?"
            );
            if (!ok) return;
            setHasUnsavedChanges(false);
        }
        navigate(path);
    };
    const guardedLogout = async () => {
        if (hasUnsavedChanges) {
            const ok = window.confirm(
                "You have unsaved changes. Are you sure you want to logout?"
            );
            if (!ok) return;
            setHasUnsavedChanges(false);
        }

        await props.handleLogout();
        navigate("/");
    };

    return (
        <>
            <Navbar bg='primary' data-bs-theme='dark' >
                <Container fluid>
                    <Button
                        variant="link"
                        className="navbar-brand fs-2 fw-bold text-decoration-none"
                        onClick={() => guardedNavigate("/")}
                    >Recapify</Button>
                    <Button className="ms-auto btn bg-gradient" onClick={()=>setDarkMode(oldMode=>!oldMode)}>
                        {darkMode ? <i className="bi bi-sun-fill"/>:<i className="bi bi-moon-stars-fill"/>}
                    </Button>
                    {props.loggedIn && <Button className="btn bg-gradient"
                                               onClick={() => guardedNavigate("/myrecaps")}
                                                >My Recaps</Button>}
                    {props.loggedIn ? (
                        <>
                            <LogoutButton onLogout={guardedLogout} />
                        </>
                    ) : (<Button as={Link} to="/login" className="btn bg-gradient">Login</Button>)
                    }
                </Container>
            </Navbar>
        </>
    );
}
export default NavHeader;