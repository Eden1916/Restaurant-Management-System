import login from "./assets/login.jpg"
export default function Login(){
    return(
        <>
        <div>
        <img src={login} className="w-full h-screen"/>
        <div className="w-80 h-130 mx-auto bg-yellow">
            <h2>Login</h2>
            <input className="w-60 h-20 bg-white"/>
    
        </div>
        </div>
        </>
    )
}