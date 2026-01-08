import {useEffect, useState} from "react";
import {Container, Form, Spinner} from "react-bootstrap";
import {useNavigate} from "react-router";
import API from "../API.mjs";
import PreviewPicker from "./PreviewPicker.jsx";

function CreateRecap() {

    const [themes, setThemes] = useState([]);
    const [selectedTheme, setSelectedTheme] = useState('');
    const [sourceType, setSourceType] = useState('template');
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        API.getAllThemes().then(setThemes);
    }, []);

    useEffect(() => {
        if (!selectedTheme) return;

        const load = async () => {
            setLoading(true);
            try {
                if (sourceType === 'template') {
                    const data = await API.getTemplatesByTheme(selectedTheme);
                    setItems(data);
                } else {
                    const data = await API.getPublicRecapsByTheme(selectedTheme);
                    setItems(data);
                    //console.log("CreateRecap loaded data first:", data[0]); //TODO: da togliere
                }
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [selectedTheme, sourceType]);

    const navigate = useNavigate();
    const handleSelect = (item) => {
        navigate('/myrecaps/create/editor', {
            state: {
                sourceType,
                themeId: selectedTheme,
                source: item
            }
        });
    };

    return (
        <Container className="mt-4" style={{maxWidth: "700px"}}>
            <h2 className="mb-4 text-center">Create a new recap</h2>

            <Form.Group className="mb-3">
                <Form.Label column="">Choose a theme</Form.Label>
                <Form.Select
                    value={selectedTheme}
                    onChange={e => setSelectedTheme(e.target.value)}
                >
                    <option value="">Select a theme</option>
                    {themes.map(t => (
                        <option key={t.id} value={t.id}>{t.name} - {t.description}</option>
                    ))}
                </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Check type="radio" label="Start from a template" checked={sourceType === 'template'}
                    onChange={() => setSourceType('template')}/>
                <Form.Check type="radio" label="Start from a public recap" checked={sourceType === 'recap'}
                    onChange={() => setSourceType('recap')}/>
            </Form.Group>

            {loading && <Spinner/>}
            {!loading && selectedTheme && items.length === 0 && (
                <p className="text-muted text-center mt-3">
                    {sourceType === 'template'
                        ? "No templates available for this theme."
                        : "No public recaps available for this theme."}
                </p>
            )}
            {!loading && items.length > 0 && (
                <PreviewPicker items={items} onSelect={handleSelect}/>
            )}
        </Container>
    );
}

export default CreateRecap;
