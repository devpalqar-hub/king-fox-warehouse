"use client"
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon
} from "lucide-react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import { Table } from "@tiptap/extension-table"
import { TableRow } from "@tiptap/extension-table-row"
import { TableHeader } from "@tiptap/extension-table-header"
import { TableCell } from "@tiptap/extension-table-cell"
import { TextStyle } from "@tiptap/extension-text-style"
import Color from "@tiptap/extension-color"
import TextAlign from "@tiptap/extension-text-align"
import Underline from "@tiptap/extension-underline"

import { forwardRef, useImperativeHandle } from "react"
import styles from "@/app/(dashboard)/products/addproduct/addproduct.module.css"

interface Props {
  value: string
  onChange: (value: string) => void
}

const RichTextEditor = forwardRef<any, Props>(({ value, onChange }, ref) => {

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link,
      Image,
      TextStyle,
      Color,
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell
    ],
    content: value,
    immediatelyRender: false,
    onUpdate({ editor }) {
      onChange(editor.getHTML())
    }
  })

  useImperativeHandle(ref, () => ({
    editor
  }))

  if (!editor) return null

  return (
    <div className={styles.editorWrapper}>

      {/* TOOLBAR */}
      <div className={styles.toolbar}>

  {/* SIZE DROPDOWN */}
  <select
    className={styles.select}
    onChange={(e) => {
      const level = Number(e.target.value)
      if (level === 0) {
        editor.chain().focus().setParagraph().run()
      } else {
        editor.chain().focus().toggleHeading({
          level: level as 1 | 2 | 3 | 4 | 5 | 6
        }).run()
      }
    }}
  >
    <option value={0}>Size</option>
    <option value={1}>H1</option>
    <option value={2}>H2</option>
    <option value={3}>H3</option>
  </select>

  {/* BOLD */}
  <button
    className={editor.isActive("bold") ? styles.activeBtn : styles.toolBtn}
    onClick={() => editor.chain().focus().toggleBold().run()}
  >
    <Bold size={16}/>
  </button>

  {/* ITALIC */}
  <button
    className={editor.isActive("italic") ? styles.activeBtn : styles.toolBtn}
    onClick={() => editor.chain().focus().toggleItalic().run()}
  >
    <Italic size={16}/>
  </button>

  {/* UNDERLINE */}
  <button
    className={editor.isActive("underline") ? styles.activeBtn : styles.toolBtn}
    onClick={() => editor.chain().focus().toggleUnderline().run()}
  >
    <UnderlineIcon size={16}/>
  </button>

  {/* LIST */}
  <button
    className={editor.isActive("bulletList") ? styles.activeBtn : styles.toolBtn}
    onClick={() => editor.chain().focus().toggleBulletList().run()}
  >
    <List size={16}/>
  </button>

  {/* ALIGN */}
  <button onClick={() => editor.chain().focus().setTextAlign("left").run()} className={styles.toolBtn}>
    <AlignLeft size={16}/>
  </button>

  <button onClick={() => editor.chain().focus().setTextAlign("center").run()} className={styles.toolBtn}>
    <AlignCenter size={16}/>
  </button>

  <button onClick={() => editor.chain().focus().setTextAlign("right").run()} className={styles.toolBtn}>
    <AlignRight size={16}/>
  </button>

  {/* COLOR */}
  <input
    type="color"
    className={styles.colorPicker}
    onChange={(e) =>
      editor.chain().focus().setColor(e.target.value).run()
    }
  />

  {/* LINK */}
  <button
    className={styles.toolBtn}
    onClick={() => {
      const url = prompt("Enter URL")
      if (url) editor.chain().focus().setLink({ href: url }).run()
    }}
  >
    <LinkIcon size={16}/>
  </button>

  {/* IMAGE */}
  <button
    className={styles.toolBtn}
    onClick={() => {
      const url = prompt("Enter image URL")
      if (url) editor.chain().focus().setImage({ src: url }).run()
    }}
  >
    <ImageIcon size={16}/>
  </button>

  {/* TABLE */}
  <button
    className={styles.toolBtn}
    onClick={() =>
      editor.chain().focus().insertTable({
        rows: 3,
        cols: 3,
        withHeaderRow: true
      }).run()
    }
  >
    <TableIcon size={16}/>
  </button>

</div>

      {/* EDITOR CONTENT */}
      <div className={styles.editorArea}>
        <EditorContent editor={editor} />
      </div>

    </div>
  )
})

export default RichTextEditor