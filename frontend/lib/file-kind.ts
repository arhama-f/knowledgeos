const KIND_LABELS: Record<string, string> = {
  pdf: "PDF",
  docx: "Word",
  txt: "Text",
  markdown: "Markdown",
  csv: "CSV",
  excel: "Excel",
  powerpoint: "PowerPoint",
  email: "Email",
  image: "Image",
  zip: "Archive",
};

export function fileKindLabel(fileType: string): string {
  return KIND_LABELS[fileType] || fileType.toUpperCase();
}
