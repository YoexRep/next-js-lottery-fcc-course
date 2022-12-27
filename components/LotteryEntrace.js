
import { useWeb3Contract } from "react-moralis"
import { abi, contractAddresses } from "../constants"
import { useMoralis } from "react-moralis"
import { useEffect, useState } from "react"
import {ethers} from "ethers"
import { useNotification } from "web3uikit"

export default function LotterEntrace(){
    
 

    //Saco la variable chainId y la renombro como hex ya que viene en formato hexadecimal
    const {chainId: chainIdHex, isWeb3Enabled} = useMoralis()

    const chainId = parseInt(chainIdHex)
  
   
 
    const raffleAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null
    

     const [entranceFee, setEntranceFee] = useState("0")
     const [numPlayers, setNumPlayers] = useState("0")
     const [recentWinner, setRecentWinner] = useState("0")


     const dispatch = useNotification()




    //Pero para saber el valor debemos llamar otra funcion de nuestro backend, para eso haremos uso de nuestro getterEntrafee

    const {runContractFunction: getEntranceFee} = useWeb3Contract({
        abi: abi,
        contractAddress:raffleAddress , // Hay que especificar el networdid para eso la variable raffleaddress
        functionName: "getEntranceFee",
        params: {},
  

    })

    const {runContractFunction: enterRaffle, isLoading, isFetching} = useWeb3Contract({
        abi: abi,
        contractAddress:raffleAddress , // Hay que especificar el networdid para eso la variable raffleaddress
        functionName: "enterRaffle",
        params: {},
        msgValue: entranceFee,

    }) 


    const {runContractFunction: getNumberOfPlayers} = useWeb3Contract({
        abi: abi,
        contractAddress:raffleAddress ,
        functionName: "getNumberOfPlayers",
        params: {},
  

    })

    const {runContractFunction: getRecentWinner} = useWeb3Contract({
        abi: abi,
        contractAddress:raffleAddress ,
        functionName: "getRecentWinner",
        params: {},
  

    })

    async function UpdateUI (){
        const EntranceFeeFromCall = (await getEntranceFee()).toString()
        setEntranceFee(EntranceFeeFromCall)

        const NumPlayersFromCall = (await getNumberOfPlayers()).toString()
        setNumPlayers(NumPlayersFromCall)

       // const recentWinnerFromCall = (await getRecentWinner()).toString()
       // setRecentWinner(recentWinnerFromCall)
    
    }

    //Para el msgvalue usaremos un hoock para saber que valor enviamos, en nuestra entrada
    
    useEffect(() => {

        if(isWeb3Enabled){
            //Si esta enable, que intente leer el valor digitado

          
            
           
            UpdateUI()

            UpdateRecentWinner()
         
        }
       

    }, [isWeb3Enabled, recentWinner])


        

    async function UpdateRecentWinner (){
        

        const provider = new ethers.providers.Web3Provider(window.ethereum)
        await provider.send('eth_requestAccounts', [])
        const signer = provider.getSigner()
        const contractFromSuscription = new ethers.Contract(raffleAddress, abi, signer)

          contractFromSuscription.on("WinnerPicked", (WinnerPicked)=> {
          
            setRecentWinner(WinnerPicked);
          })
    
    }


    const handleSuccess = async  function(tx) {
        await tx.wait(1)
        handleNewNotification(tx)
        UpdateUI()
    }

    const handleNewNotification = function(){
        dispatch({
            type:"info",
            message:"Transaccion complete",
            title: "tx notifacion",
            position: "topR",
            icon: "bell",
        })
    }

    return(
        <div className="p-5">

            
       
            

            {raffleAddress ? 
            
            <div>
                
                <button onClick={async function(){await enterRaffle({

                        
                            //Oncomplete:
                            onSuccess: handleSuccess,
                            onError: (error) => console.log(error),

                })}} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto"  disabled={isLoading || isFetching}>


                {isLoading || isFetching ?  <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"> </div> : <div>Enter Raffle</div>}
                
                
                
                </button>


               <div>  EntranceFee: {ethers.utils.formatUnits(entranceFee, "ether")}</div> 

                <div>   Este es el numero de jugadores: {numPlayers} Este es el ganador reciente: {recentWinner}</div>
            
             
                
            </div> 
            
            : <div>No se detecto una raffle address usar la hardhat blockchain</div>}

        </div>

    )
}