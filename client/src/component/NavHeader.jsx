import {Button, Container, Navbar} from 'react-bootstrap'
import {useEffect, useState} from "react";
import {Link} from "react-router";
import {LogoutButton} from "./AuthComponents.jsx";


function NavHeader(props){
    const [darkMode, setDarkMode] = useState(false);

    useEffect(()=>{
        if(darkMode) {
            document.documentElement.setAttribute("data-bs-theme", "dark");
        }else{
            document.documentElement.removeAttribute("data-bs-theme");
        }
    },[darkMode]);

    return (
        <>
            <Navbar bg='primary' data-bs-theme='dark' >
                <Container fluid>
                    <Link to="/" className="navbar-brand fs-2 fw-bold">Recapify</Link>
                    <Button  className="ms-auto bg-gradient" onClick={()=>setDarkMode(oldMode=>!oldMode)}>
                        {darkMode ? <i className="bi bi-sun-fill"/>:<i className="bi bi-moon-stars-fill"/>}
                    </Button>
                    {props.loggedIn && <Link to="/myrecaps" className="btn bg-gradient">My Recaps</Link>}
                    {props.loggedIn ? (
                        <>
                            <LogoutButton handleLogout={props.handleLogout} />
                        </>
                    ) : (<Link to="/login" className="btn bg-gradient">Login</Link>)
                    }
                </Container>
            </Navbar>
        </>
    );
}
export default NavHeader;