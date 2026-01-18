import { useState } from 'react'
import api from './utils/api'
function App() {
  const [buttonIsLoading, setButtonIsLoading] = useState(false)
  const handleClick = async () => {
    setButtonIsLoading(true)
    try{
      await api.get("/buttonClick")
    }
    catch(err){
      console.error(err)
    }
    finally{
      setButtonIsLoading(false)
    }
  }
  return (
    <main className='flex flex-col items-center justify-center w-screen h-screen'>
      <button onClick={handleClick} className={`size-[clamp(320px,calc(100vw-20px),400px)]  ${buttonIsLoading?"bg-slate-900":"bg-slate-500"}`}></button>
    </main>
  )
}

export default App
