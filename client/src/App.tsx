import { useEffect, useState, useCallback, useRef } from 'react';
import './App.css';
import Quill from 'quill';
import 'react-quill/dist/quill.snow.css';

const TOOLBAR_OPTIONS = [
  ['bold', 'italic', 'underline', 'strike'],
  ['blockquote', 'code-block'],
  ['link', 'image', 'video', 'formula'],
  [{ 'header': 1 }, { 'header': 2 }],
  [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'list': 'check' }],
  [{ 'script': 'sub' }, { 'script': 'super' }],
  [{ 'indent': '-1' }, { 'indent': '+1' }],
  [{ 'direction': 'rtl' }],
  [{ 'size': ['small', false, 'large', 'huge'] }],
  [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
  [{ 'color': [] }, { 'background': [] }],
  [{ 'font': [] }],
  [{ 'align': [] }],
  ['clean'],
];

function App() {
  const [doc, setDoc] = useState("");
  const socketRef = useRef<WebSocket | null>(null);
  const quillRef = useRef<Quill | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const skipUpdateRef = useRef(false);

  const initEditor = useCallback(() => {
    if (wrapperRef.current == null) return;
    wrapperRef.current.innerHTML = '';
    const editorElement = document.createElement('div');
    wrapperRef.current.append(editorElement);
    const quill = new Quill(editorElement, { theme: 'snow', modules: { toolbar: TOOLBAR_OPTIONS } });

    quill.on('text-change', () => {
      if (skipUpdateRef.current) {
        skipUpdateRef.current = false;
        return;
      }
      const text = quill.root.innerHTML;
      setDoc(text);
    });
    quillRef.current = quill;
  }, []);

  useEffect(() => {
    initEditor();
  }, [initEditor]);

  useEffect(() => {
    const newSocket = new WebSocket('ws://localhost:8080');
    newSocket.onopen = () => {
      console.log('WebSocket connection established');
    };
    newSocket.onmessage = (message) => {
      const receivedDoc = message.data;
      if (quillRef.current && receivedDoc !== quillRef.current.root.innerHTML) {
        skipUpdateRef.current = true;
        quillRef.current.root.innerHTML = receivedDoc;
      }
    };
    newSocket.onclose = () => {
      console.log('WebSocket connection closed');
    };
    newSocket.onerror = (error) => {
      console.error('WebSocket error', error);
    };

    socketRef.current = newSocket;
    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(doc);
    }
  }, [doc]);

  return (
    <div>
      <div className='container' ref={wrapperRef}></div>
    </div>
  );
}

export default App;
