import { useAtom } from "jotai";
import { notesAtom } from "../store";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

function SideMenu() {
  const [notes, setNotes] = useAtom(notesAtom);
  const createNote = useMutation(api.notes.create);

  const handleCreateNote = async () => {
    const noteId = await createNote({
      title: "Untitled",
      content: "",
  });

  const newNote = new Note(noteId, "Untitled", "", Date.now());
  setNotes((prev) => [...prev, newNote]);
  };

  return (
    <div className="w-64 h-screen bg-gray-100 p-4 flex flex-col">
      <div>
        <h2>Notes</h2>
        <button onClick={handleCreateNote}>+</button>
      </div>
      <div>
        {notes?.map((note) => (
          <div
            key={note.id}
            className="p-2 mb-2 rounded cursor-pointer flex justify-between items-center group"
          >
            <div className="flex-1 min-w-0">
              <input type="text" className="bg-gray-100" value={note.title} />
              <p>
                {note.lastEditTime
                  ? new Date(note.lastEditTime).toLocaleString()
                  : "Never edited"}
              </p>
            </div>
            <button>-</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SideMenu;


