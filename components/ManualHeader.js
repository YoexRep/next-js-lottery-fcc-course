// This file is to show what making a connect button looks like behind the scenes!

import { useEffect } from "react"
import { useMoralis } from "react-moralis"

// Top navbar
export default function ManualHeader() {
const {enableWeb3, account, isWeb3Enabled, Moralis, deactivateWeb3, isWeb3EnableLoading} = useMoralis()

useEffect(()=> {

    //Si no esta conectado llama a enableweb 3
        if(isWeb3Enabled){
            return
        } else{

            //Primero valido si ya se ha presionado el boton, buscando en el localstorage, mi objeto connected
            if(typeof window !== "undefined"){

                if(window.localStorage.getItem("connected")){
                    enableWeb3()
                }
            }


           
        }

}, [isWeb3Enabled])

//PAra verifica cuando me desconecte de mi wallet
useEffect(()=>{

    Moralis.onAccountChanged((account)=>{
        console.log(`account cambio a ${account}`)

        //Si la cuenta es nula, singnifica que se desconecto, por lo que remuevo mi objeto de localstorage. y desactivo web3
        if(account == null){
            window.localStorage.removeItem("connected")
            deactivateWeb3()
        }


    })


},[])

return(<div>

        {account? (<div>Connectado muajaja a la cuenta {account.slice(0,6)}...{account.slice(account.length-4)}</div>) : (
        
        <button 
        
            onClick={async() => {
            
            
            await enableWeb3()
            
            if(typeof   window !== "undefined"){
                window.localStorage.setItem("connected", "injected")
            }
            
            }}
            
            disabled={isWeb3EnableLoading}
            
            
            >Connect </button>)}
    

</div>)

}
