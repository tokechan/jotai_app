import { useSetAtom } from "jotai";
import Editor from "./components/Editor";
import SideMenu from "./components/SideMenu";
import { notesAtom } from "./store";
import { useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Note } from "./domain/note";
function App () {
  const setNotes = useSetAtom(notesAtom);
  const initializeNotes = useQuery(api.notes.get);


  useEffect(() => {
    const notes = initializeNotes?.map(
      (note) => new Note(note._id, note.title, note.content, note.lastEditTime)
    );
    setNotes(notes || []);
  }, [setNotes, initializeNotes]);

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
