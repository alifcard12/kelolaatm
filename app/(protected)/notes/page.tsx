import { prisma } from "@/lib/prisma";
import { deleteNote } from "./actions";
import { PageHeader } from "@/components/ui/PageHeader";
import { LinkButton } from "@/components/ui/Button";
import { FiPlus } from "react-icons/fi";
import { NoteListClient } from "./NoteListClient";

export default async function NotesPage() {
  const notes = await prisma.note.findMany({
    include: { _count: { select: { attachments: true } } },
    orderBy: { updatedAt: "desc" },
  });

  const rows = notes.map((n) => ({
    id: n.id,
    title: n.title,
    content: n.content,
    link: n.link,
    category: n.category,
    updatedAt: n.updatedAt,
    attachmentCount: n._count.attachments,
  }));

  return (
    <div>
      <PageHeader
        title="Catatan"
        description="Catatan penting, link, dan file (foto/PDF/Excel) di satu tempat."
        action={
          <LinkButton href="/notes/new">
            <FiPlus /> Tambah Catatan
          </LinkButton>
        }
      />

      <NoteListClient notes={rows} onDelete={deleteNote} />
    </div>
  );
}
