import 'bootswatch/dist/cyborg/bootstrap.min.css'
//import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css';

import './App.css'
import {Navigate, Route, Routes} from "react-router";
import DefaultLayout from "./component/DefaultLayout.jsx";
import RecapHomePage from "./component/RecapHomePage.jsx";
import RecapViewer from "./component/RecapViewer.jsx";
import NotFound from "./component/NotFound.jsx";
import {useEffect, useState} from "react";
import API from "./API.mjs";
import {LoginForm} from "./component/AuthComponents.jsx";
import MyRecaps from "./component/MyRecaps.jsx";

function App() {
    const [loggedIn, setLoggedIn] = useState(false);
    const [message, setMessage] = useState('');
    const [user, setUser] = useState(null);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const user = await API.getUserInfo();
                setLoggedIn(true);
                setUser(user);
            } catch {
                setLoggedIn(false);
                setUser(null);
            }
        };
        checkAuth();
    }, []);

    const handleLogin = async (credentials) => {
        try {
            const user = await API.login(credentials);
            setLoggedIn(true);
            setMessage({msg: 'Welcome, ' + user.username + '!', type: 'success'});
            setUser(user);
        } catch (err) {
            setMessage({msg: err, type: 'danger'});
        }
    };

    const handleLogout = async () => {
        await API.logout();
        setLoggedIn(false);
        setUser("");
        setMessage('');
    };
  return (
      <Routes>
          <Route element={<DefaultLayout message={message} setMessage={setMessage} loggedIn={loggedIn}  handleLogout={handleLogout}/>}>
              <Route path="/" element={<RecapHomePage/>}/>
              <Route path="/recaps/:id" element={<RecapViewer/>}/>
              <Route path="/login" element={loggedIn ? <Navigate replace to='/'/> : <LoginForm handleLogin={handleLogin}/>}/>
              <Route path="/myrecaps" element={<MyRecaps/>}/>
              <Route path="*" element={<NotFound/>}/>
          </Route>
      </Routes>
  );
}

export default App
