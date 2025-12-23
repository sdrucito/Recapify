import 'bootswatch/dist/cyborg/bootstrap.min.css'
//import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css';

import './App.css'
import {Route, Routes} from "react-router";
import DefaultLayout from "./component/DefaultLayout.jsx";
import RecapHomePage from "./component/RecapHomePage.jsx";

function App() {

  return (
      <Routes>
          <Route element={<DefaultLayout/>}>
              <Route path="/" element={<RecapHomePage/>}/>
          </Route>
      </Routes>
  );
}

export default App
