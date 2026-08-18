"use client";

import "ckeditor5/ckeditor5.css";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  BlockQuote,
  Bold,
  ClassicEditor,
  Essentials,
  Heading,
  Italic,
  Link,
  List,
  Paragraph,
  Table,
  TableToolbar,
  Underline,
} from "ckeditor5";

export function RichTextEditorInner({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  return (
    <CKEditor
      editor={ClassicEditor}
      data={value}
      config={{
        licenseKey: "GPL",
        plugins: [Essentials, Paragraph, Heading, Bold, Italic, Underline, Link, List, BlockQuote, Table, TableToolbar],
        toolbar: ["heading", "|", "bold", "italic", "underline", "link", "|", "bulletedList", "numberedList", "blockQuote", "insertTable", "|", "undo", "redo"],
        table: { contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"] },
      }}
      onChange={(_event, editor) => onChange(editor.getData())}
    />
  );
}
