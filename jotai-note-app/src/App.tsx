import { useSetAtom } from "jotai";
import Editor from "./components/Editor";
import SideMenu from "./components/SideMenu";
import { notesAtom } from "./store";
import { useEffect } from "react";

function App() {
  const setNotes = useSetAtom(notesAtom);
  const noteData = [
    {
      id: "1",
      title: "Note 1",
      content: "Content 1",
      lastEditTime: new Date().getTime(),
    },
    {
      id: "2",
      title: "Note 2",
      content: "Content 2",
      lastEditTime: new Date().getTime(),
    },
    {
      id: "3",
      title: "Note 3",
      content: "Content 3",
      lastEditTime: new Date().getTime(),
    },
  ];

  useEffect(() => {
    setNotes(noteData);
  }, [noteData]);

  return (
    <>
      <div className="flex h-screen w-full bg-white">
        <SideMenu />
        <Editor />
      </div>
    </>
  );
}

export default App;
