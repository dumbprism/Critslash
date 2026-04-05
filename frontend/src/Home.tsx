import { Button } from './components/ui/button'
import Marqueelement from './elements/MarqueeElement'
import Navbar from './elements/Navbar'
import { ThemeProvider } from "@/components/theme-provider"
import { Link } from "react-router-dom"

function Home() {
    return (
        <>
            <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
                <Navbar />
            </ThemeProvider>

            <div className='font-[apple-garamond-light] flex flex-col justify-center items-center gap-y-2 mt-12 md:mt-20 px-4'>
                <h1 className='text-4xl sm:text-5xl md:text-7xl max-w-xs sm:max-w-lg md:max-w-[720px] text-center leading-tight'>
                    Your watch history now has a personality
                </h1>
                <h1 className='text-lg sm:text-xl md:text-2xl font-[apple-garamond] text-center'>
                    I don't judge films, I judge <em>you</em>
                </h1>
                <h1 className='text-sm sm:text-base md:text-lg max-w-xs sm:max-w-sm text-center'>
                    An AI powered application that judges your film taste based on your recent watches in letterboxd
                </h1>
                <Link to="/login">
                    <Button size="lg" variant="destructive" className='bg-[#424FFF] hover:bg-[#3640CC] text-lg md:text-xl mt-6 md:mt-8 hover:cursor-pointer'>
                        Analyze my taste
                    </Button>
                </Link>
            </div>

            <Marqueelement />
        </>
    )
}

export default Home
