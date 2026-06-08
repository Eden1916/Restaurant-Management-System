import login from "./assets/login.jpg"
import { Button } from "./components/ui/button"
export default function Login(){
    function backtoSignup(){
        window.location.href="/Signup"
    }
    return(
        <>
        <div>
        <img src={login} className="w-full h-screen"/>
        <div className="w-80 h-90 mx-auto bg-white/70 absolute inset-0 flex flex-col mt-20 rounded-md p-5">
            <h2 className="text-2xl font-bold mb-5 text-center">Login</h2>
            <label>User Name</label>
            <input className="w-60 h-10 bg-white rounded-md p-2 required"/>
            <label>Password</label>
            <input className="w-60 h-10 bg-white rounded-md p-2 required"/>
            <Button className="bg-red-950 text-white rounded-md p-2 mt-5 mb-5 cursor-pointer">Login</Button>
            <p className="text-center">Don't have an account? <a className="text-blue-700 cursor-pointer" onClick={backtoSignup}>Sign up</a></p>
    
        </div>
        </div>
        </>
    )
}