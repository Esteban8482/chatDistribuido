import logo from './logo.svg';
import './App.css';

import firebase  from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

import { useState, useRef } from 'react';

const firebaseConfig = {
  authDomain: "chatdistribuido-2ccd0.firebaseapp.com",
  projectId: "chatdistribuido-2ccd0",
  storageBucket: "chatdistribuido-2ccd0.firebasestorage.app",
  messagingSenderId: "539824205167",
  appId: "1:539824205167:web:3c92d28ea98b3ae57a0c9a",
  measurementId: "G-3Z8TJM0GPR"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
} else {
  firebase.app();
}

const auth = firebase.auth();
const firestore = firebase.firestore();


function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header className="App-header">
        
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>

    </div>
  );
}

function SignIn() {
  const [errorMsg, setErrorMsg] = useState(null);

  const signInWithGoogle = async () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
      await auth.signInWithPopup(provider);
      setErrorMsg(null);
    } catch (error) {
      if (error?.code === 'auth/popup-closed-by-user') {
        setErrorMsg('Cerraste la ventana de inicio de sesión antes de completar el proceso.');
      } else if (error?.code === 'auth/cancelled-popup-request') {
        setErrorMsg('Se canceló una ventana de inicio de sesión anterior. Inténtalo de nuevo.');
      } else if (error?.code === 'auth/popup-blocked') {
        setErrorMsg('El navegador bloqueó la ventana emergente. Permite los pop-ups e inténtalo de nuevo.');
      } else {
        setErrorMsg(error?.message || 'Error al iniciar sesión. Inténtalo nuevamente.');
      }
    }
  }

  return (
    <>
      <button onClick={signInWithGoogle}>Sign in with Google</button>
      {errorMsg && (
        <p style={{ color: 'red', marginTop: 8 }}>{errorMsg}</p>
      )}
    </>
  )
}

function SignOut() {
  return auth.currentUser && (
    <button onClick={() => auth.signOut()}>Sign Out</button>
  )
}

function ChatRoom() {
  const dummy = useRef();

  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);

  const [messages] = useCollectionData(query, {idField: 'id'});

  const [formValue, setFormValue] = useState('');

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    setFormValue('');

    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <>
      <main>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
      
        <div ref = {dummy}></div>
      </main>

      <form onSubmit = {sendMessage}>
        <input value = {formValue} onChange = {(e) => setFormValue(e.target.value)}/>

        <button type="submit">📡</button>
      </form>
    </>
  )
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;
  const messageClass = auth.currentUser && uid === auth.currentUser.uid ? 'sent' : 'received';

  // Fallback avatar in case some older messages don't have photoURL
  const avatar = photoURL || '/logo192.png';

  return (
    <div className={`message ${messageClass}`}>
      <img src={avatar} alt="avatar" referrerPolicy="no-referrer" />
      <p>{text}</p>
    </div>
  )
}

export default App;
