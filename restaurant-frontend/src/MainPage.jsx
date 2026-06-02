import landingImage from "./assets/landingImage.jpg";
import Burger from "./assets/burger.jpg"
import Burger1 from "./assets/burger2.jpg"
import Burger2 from "./assets/burger3.jpg"
import Burger3 from "./assets/burger4.jpg"
import pizza1 from "./assets/pizza1.jpg"
import pizza2 from "./assets/pizza2.jpg"
import pizza3 from "./assets/pizza3.jpg"
import pizza4 from "./assets/pizza4.jpg"
import pizza5 from "./assets/pizza5.jpg"
import {useNavigate} from "react-router-dom";
import {Button} from "./components/ui/button";
import {Card, CardTitle, CardContent} from "./components/ui/card";

export default function MainPage() {
    const navigate = useNavigate()

    function handleLogin(){
        navigate("/Login")
    }
    function handleSignup(){
        navigate("/Signup")
    }
    const menuItems = [
        {name: "Burger", price: 600, image: Burger},
        {name: "Burger1", price: 600, image: Burger1},
        {name: "Burger2", price: 600, image: Burger2},
        {name: "Burger3", price: 600, image: Burger3},
        {name: "Pizza1", price: 800, image: pizza1},
        {name: "Pizza2", price: 800, image: pizza2},
        {name: "Pizza3", price: 800, image: pizza3},
        {name: "Pizza4", price: 800, image: pizza4},    ]
    return(
        <div className="min-h-screen">
            <img className="w-full h-screen" src={landingImage} alt="Landing Image" />
            <div className="absolute inset-0 flex bg-white/40"></div>
            <nav className ="absolute top-0 left-0 right-0 flex justify-between items-center bg-white/70 w-full h-15 z-10">
            <div className="flex gap-2 sm-gap-4 md:gap-6 p-2 sm:p-4 md:p-6 items-center">
            <button className="bg-red-950 text-white rounded-md p-2 cursor-pointer" onClick={handleLogin}>Login</button>
            <button className="bg-red-950 text-white rounded-md p-2 cursor-pointer" onClick={handleSignup}>Signup</button>
        </div>
        <ul className = "flex justify-center gap-5 sm:gap-10 md:gap-12 lg:gap-16 pr-2 sm:pr-5 md:pr-10 items-center text-lg overflow-hidden">
            <li className="ml-auto"><a className="cursor-pointer hover:underline active:text-red-900">home</a></li>
            <li><a className="cursor-pointer hover:underline active:text-red-900">menu</a></li>
            <li><a className="cursor-pointer hover:underline active:text-red-900">about</a></li>
            <li><a className="cursor-pointer hover:underline active:text-red-900">contact</a></li>
        </ul>
        </nav>
        <h2 className = "text-4xl text-red-950 text-center absolute inset-0 flex justify-center mt-20 font-bold font-['Perpetua_Titling_MT'] max-w-md mx-auto">Welcome To Liyu Restaurant Website</h2>
        <div className="absolute inset-0 flex gap-10 px-10 mt-120">
        <Button className=" bg-red-950 items-center ml-auto h-10 rounded-md p-2 text-white">Reserve Table</Button>
        <Button className="bg-red-950 items-center h-10 rounded-md p-2 text-white">Order Online</Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-2 md:gap-3 lg:gap-5 mt-10">
            {menuItems.map((items, index) => (
                <Card key={`${items.name}-${index}`} className= "flex flex-col items-center bg-red-950 rounded-md w-50 h-90">
                    <img src={items.image} className="p-1 h-40 rounded-md mx-full min-h-40 min-w-full"/>
                    <CardTitle className="self-start mt-10 ml-2 text-white text-xl">{items.price} ETB</CardTitle>
                    <CardContent>
                        <p className="self-start mt-1 ml-2 text-white text-xl">{items.name}</p>
                        <Button className="bg-white text-red-950 rounded-md p-2 mt-5 mb-5">Order Now</Button>
                    </CardContent>
                </Card>
            ))}
        </div>     
        <div className="flex flex-col items-center">   
        <Button className="bg-gray-300 hover:bg-gray-400 active:bg-gray-500 mx-auto cursor-pointer text-black rounded-md p-2 mt-5 mb-5">View More</Button>
        </div>
        
        </div>
    )
}