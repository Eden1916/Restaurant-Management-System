import sign from "./assets/sign.jpg"
import {Button} from "./components/ui/button"
import {useNavigate} from "react-router-dom"
import { useState } from "react"
import { authSignup } from "./api/auth"
export default function Signup(){
    const navigate = useNavigate()
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const intendedPage = () => localStorage.getItem("intendedPage")

    function backtoLogin(){
        navigate("/Login")
    }

    async function handleSignup(){
        try {
            const user = await authSignup({ username, email, password })

            const dest = intendedPage();
            if (dest) {
                localStorage.removeItem("intendedPage")
                navigate(dest)
                return
            }

            switch (user.role) {
                case "admin":
                    navigate("/admin/dashboard")
                    break
                case "waiter":
                    navigate("/waiter/dashboard")
                    break
                case "chef":
                    navigate("/chef/dashboard")
                    break
                default:
                    navigate("/customer/dashboard")
            }
        } catch(error) {
            alert(error.message)
        }
    }
    return(
        <>
        <img src={sign} className="w-full h-screen"/>
        <div className="w-80 h-90 mx-auto bg-white/70 absolute inset-0 flex flex-col mt-20 rounded-md p-5">
            <h2 className="text-2xl font-bold mb-5 text-center">Sign up</h2>
            <label>User Name</label>
            <input className="w-60 h-10 bg-white rounded-md p-2 required" value={username} onChange={e => setUsername(e.target.value)}/>
            <label>Email</label>
            <input className="w-60 h-10 bg-white rounded-md p-2 required" value={email} onChange={e => setEmail(e.target.value)}/>
            <label>Password</label>
            <input type="password" className="w-60 h-10 bg-white rounded-md p-2 required" value={password} onChange={e => setPassword(e.target.value)}/>
            <Button className="bg-red-950 text-white rounded-md p-2 mt-5 mb-5 cursor-pointer" onClick={handleSignup}>Signup</Button>
            <p className="text-center">Already have an account? <a className="text-blue-700 cursor-pointer" onClick={backtoLogin}>Login</a></p>
        </div>
        </>
    )
}