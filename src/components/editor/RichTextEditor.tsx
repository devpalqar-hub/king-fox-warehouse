"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import { forwardRef, useImperativeHandle } from "react"
import Image from "@tiptap/extension-image"
import { Table } from "@tiptap/extension-table"
import { TableRow } from "@tiptap/extension-table-row"
import { TableHeader } from "@tiptap/extension-table-header"
import { TableCell } from "@tiptap/extension-table-cell"
import styles from "@/app/(dashboard)/products/addproduct/addproduct.module.css"
interface Props {
  value: string
  onChange: (value: string) => void
}

const RichTextEditor = forwardRef<any, Props>(({ value, onChange }, ref) => {

  const editor = useEditor({
  extensions:[
    StarterKit,
    Link,
    Image,
    Table.configure({
      resizable:true
    }),
    TableRow,
    TableHeader,
    TableCell
  ],

  content:value,

  immediatelyRender:false,

  onUpdate({editor}){
    onChange(editor.getHTML())
  }
})

  useImperativeHandle(ref, () => ({
    editor
  }))

  if (!editor) return null

  return (
  <div className={styles.editorArea}>
  <EditorContent editor={editor}/>
</div>
)
})

export default RichTextEditor