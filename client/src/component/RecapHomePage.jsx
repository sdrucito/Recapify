import {Button, Container} from "react-bootstrap";
import RecapPreviews from "./RecapPreviews.jsx";
import {useState} from "react";
import dayjs from "dayjs";

function RecapHomePage(){
    const [sortMode, setSortMode] = useState("none");
    const toggleSort = () =>{
        setSortMode(sortMode=== "desc" ? "asc": "desc");
    }
    const fakeRecaps = [
        {id: 1, title: "Il mio anno in videogiochi", theme: "Videogiochi", createdAt: "2024-12-31"},
        {id: 2, title: "Tra dadi e draghi", theme: "Giochi di ruolo", createdAt: "2024-12-28"},
        {id: 3, title: "Boss fight memorabili", theme: "Videogiochi", createdAt: "2024-12-29"}
    ];

    let sortedRecaps = [...fakeRecaps];


    switch(sortMode){
        case "asc":
            sortedRecaps.sort((a,b) => dayjs(a.createdAt).diff(dayjs(b.createdAt)));
            break;
        case "desc":
            sortedRecaps.sort((a,b) => dayjs(b.createdAt).diff(dayjs(a.createdAt)));
            break;
        default:
            break;
    }
    return (
        <Container>
            <div className="position-relative mb-3">
                <h4 className="text-center mb-0">Community Recaps</h4>
                <Button className="position-absolute top-50 end-0 translate-middle-y bg-gradient" onClick={toggleSort}>
                    <i className={sortMode ==="asc" ? "bi bi-sort-up" : "bi bi-sort-down"}></i>
                </Button>
            </div>
            <RecapPreviews recaps={sortedRecaps}/>
        </Container>
    );
}

export default RecapHomePage;