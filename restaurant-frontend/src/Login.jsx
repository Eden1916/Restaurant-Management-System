import { useState } from "react"
import loginImage from "./assets/login.jpg"
import {authLogin} from "./api/auth"
import { Button } from "./components/ui/button"
import {useNavigate} from "react-router-dom"
export default function Login(){

    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    async function handleLogin(){
        try{
            const user = await authLogin(email, password);

            switch(user.role){
                case "admin":
                    navigate("/admin/dashboard");
                    break;
                case "waiter":
                    navigate("/waiter/dashboard");
                    break;
                case "chef":
                    navigate("/chef/dashboard");
                    break;
                    default:
                        navigate("/customer/dashboard");
                }
            }
            catch(error){
                alert(error.message);
            }
        }
    function backtoSignup(){
        navigate("/Signup");
    }
    return(
        <>
        <div>
        <img src={loginImage} className="w-full h-screen"/>
        <div className="w-80 h-90 mx-auto bg-white/70 absolute inset-0 flex flex-col mt-20 rounded-md p-5">
            <h2 className="text-2xl font-bold mb-5 text-center">Login</h2>
            <label>Email</label>
            <input className="w-60 h-10 bg-white rounded-md p-2 required" value={email} onChange={e => setEmail(e.target.value)}/>
            <label>Password</label>
            <input type="password" className="w-60 h-10 bg-white rounded-md p-2 required" value={password} onChange={e => setPassword(e.target.value)}/>
            <Button className="bg-red-950 text-white rounded-md p-2 mt-5 mb-5 cursor-pointer" onClick={handleLogin}>Login</Button>
            <p className="text-center">Don't have an account? <a className="text-blue-700 cursor-pointer" onClick={backtoSignup}>Sign up</a></p>
    
        </div>
        </div>
        </>
    )
}