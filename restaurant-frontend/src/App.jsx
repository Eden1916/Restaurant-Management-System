import MainPage from "./MainPage.jsx"
import Login from "./Login.jsx"
import Signup from "./Signup.jsx"
import {Routes, Route} from "react-router-dom";

function App() {

  return (
    <Routes>
      <Route path="/" element={<MainPage/>}/>
      <Route path="/Login" element={<Login/>}/>
      <Route path="/Signup" element={<Signup/>}/>
    </Routes>
  )
}

export default App
