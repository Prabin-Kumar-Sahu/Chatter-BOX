import { useEffect, useState } from "react";
import { app } from "./Components/firebase";
import {
  Box,
  Button,
  Container,
  VStack,
  Input,
  HStack,
} from "@chakra-ui/react";
import Message from "./Components/Message";
import {
  onAuthStateChanged,
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,signOut
} from "firebase/auth";
import {getFirestore,addDoc, collection, serverTimestamp} from "firebase/firestore"


const auth = getAuth(app);
const db=getFirestore(app);


const loginHandler = () => {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider);
};


const logoutHandler=()=> signOut(auth)


function App() {
  const [user, setUser] = useState(false);
  const [message,setMessage]=useState("")


  const submitHandler=async(e)=>
{
  e.preventDefault()

  try {
    await addDoc(collection(db,"Messages"),{
      text:message,
      uid:user.uid,
      uri:user.photoURL,
      createdAt:serverTimestamp()
      
    })
    setMessage("")
  } catch (error) {
    alert(error)
    
  }
}

  useEffect(()=>
  {
   const unsubscribe= onAuthStateChanged(auth,(data)=>
    {
     setUser(data);
    })
    return ()=>{
      unsubscribe()
    }
  })

  return (
    <Box bg={"black"}>
      { user ? (
        <Container h={"100vh"} bg={"white"}>
          <VStack bg={"telegram.400"} padding={"4"} h="full">
            <Button onClick={logoutHandler} colorScheme={"red"} w={"full"}>
              LogOut
            </Button>
            <VStack h="full" w={"full"} overflowY={"auto"}>
              <Message text={"sample"} />
              <Message user="me" text={"sample"} />
              <Message text={"sample"} />
              <Message user="me" text={"sample"} />
            </VStack>
            <form   onSubmit={submitHandler} style={{ width: "100%", backgroundColor: "white" }}>
              <HStack>
                <Input  value ={message} onChange={(e)=>setMessage(e.target.value)} placeholder="enter your message" />
                <Button colorScheme={"green"} type="submit">
                  Send
                </Button>
              </HStack>
            </form>
          </VStack>
        </Container>
      ) : (
        <VStack
          h={"100vh"}
          justifyContent={"center"}
          alignItems={"center"}
          color={"white"}
        >
          <Button
            bgColor={"green.500"}
            color={"black"}
            fontWeight={"bolder"}
            onClick={loginHandler}
          >
            Sign in with Google{" "}
          </Button>
        </VStack>
      )}
    </Box>
  );
}

export default App;
