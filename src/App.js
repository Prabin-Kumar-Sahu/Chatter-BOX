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
  signInWithPopup,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  addDoc,
  collection,
  serverTimestamp,
  onSnapshot,
  query,orderBy
} from "firebase/firestore";


const auth = getAuth(app);
const db = getFirestore(app);

const loginHandler = () => {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider);
};

const logoutHandler = () => signOut(auth);

function App() {
  const q=query(collection(db,"Messages"),orderBy("createdAt","asc"))
  const [user, setUser] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      await addDoc(collection(db, "Messages"), {
        text: message,
        uid: user.uid,
        uri: user.photoURL,
        createdAt: serverTimestamp(),
      });
      setMessage("");
    } catch (error) {
      alert(error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (data) => {
      setUser(data);
    });

    const unsubscribeForMessage = onSnapshot(
      q,
      (snap) => {
        setMessages(
          snap.docs.map((item) => {
            const id = item.id;
            return { id, ...item.data() };
          })
        );
      }
    );
    return () => {
      unsubscribe();
      unsubscribeForMessage();
        };
  });

  return (
    <Box bg={"black"}>
      {user ? (
        <Container h={"100vh"} bg={"white"}>
          <VStack bg={"white"} padding={"4"} h="full">
            <Button onClick={logoutHandler} colorScheme={"red"} w={"full"}>
              LogOut
            </Button>
            {/* <VStack h="full" w={"full"} overflowY={"auto"}>
              {messages.map((item) => {
                <Message
                  key={item.id}
                  user={item.uri === user.uid ? "me" : "other"}
                  text={item.text}
                  uri={item.uri}
                />
              })}
              
            </VStack> */}
            <VStack h="full" w={"full"} overflowY={"auto"}>
              {messages.map((item) => (
                <Message
                  key={item.id}
                  user={item.uid === user.uid ? "me" : "other"}
                  text={item.text}
                  uri={item.uri}
                />
              ))}
            </VStack>

            <form
              onSubmit={submitHandler}
              style={{ width: "100%", backgroundColor: "white" }}
            >
              <HStack>
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="enter your message"
                />
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
