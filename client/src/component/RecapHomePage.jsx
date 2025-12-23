import {Container} from "react-bootstrap";
import RecapPreviews from "./RecapPreviews.jsx";

function RecapHomePage(){
    const fakeRecaps = [
        {id: 1, title: "Il mio anno in videogiochi", theme: "Videogiochi", createdAt: "2024-12-31"},
        {id: 2, title: "Tra dadi e draghi", theme: "Giochi di ruolo", createdAt: "2024-12-30"},
        {id: 3, title: "Boss fight memorabili", theme: "Videogiochi", createdAt: "2024-12-29"}
    ];

    return (
        <Container>
            <h4 className="mb-4">Riepiloghi pubblici</h4>
            <RecapPreviews recaps={fakeRecaps}/>
        </Container>
    );
}

export default RecapHomePage;