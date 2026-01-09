import {Col, Row} from "react-bootstrap";
import {SERVER_URL} from "../constants.js";

function PreviewPicker(props) {
    return (
        <Row className="mt-3">
            {props.items.map(item => (
                <Col md={4} key={item.id} className="mb-3">
                    <div className="border rounded p-2 h-100 preview-item" onClick={() => props.onSelect(item)}>
                        <strong>{item.title}</strong>
                        <img src={`${SERVER_URL}/images/${item.previewImage}`} className="img-fluid mb-2" alt=""/>
                    </div>
                </Col>
            ))}
        </Row>
    );
}

export default PreviewPicker;