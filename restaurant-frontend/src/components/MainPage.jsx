import landingImage from "../assets/landingImage.jpg";
export default function MainPage() {
    return(
        <div>
            <img className="w-full h-screen" src={landingImage} alt="Landing Image" />
            <div className="absolute inset-0 flex bg-white/40"></div>
            <nav className ="absolute inset-0 flex justify-center bg-white/70 w-full h-15">
        <ul className = "absolute inset-0 flex justify-center gap-16 pr-10 items-center text-lg">
            <li className="ml-auto"><a className="cursor-pointer hover:underline">home</a></li>
            <li><a className="cursor-pointer hover:underline">menu</a></li>
            <li><a className="cursor-pointer hover:underline">about</a></li>
            <li><a className="cursor-pointer hover:underline">contact</a></li>
        </ul>
        </nav>
        <h2 className = "text-4xl text-red-950 text-center absolute inset-0 flex justify-center mt-20 font-bold font-['Perpetua_Titling_MT'] max-w-md mx-auto">Welcome To Liyu Restaurant Website</h2>
        <div className="absolute inset-0 flex gap-10 px-10 mt-120">
        <button className=" bg-red-950 items-center ml-auto h-10 rounded-md p-2 text-white">Reserve Table</button>
        <button className="bg-red-950 items-center h-10 rounded-md p-2 text-white">Order Online</button>
        </div>
        </div>
    )
}