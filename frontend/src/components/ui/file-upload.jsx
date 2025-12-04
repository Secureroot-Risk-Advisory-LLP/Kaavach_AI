import { useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { UploadCloud, FileText, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const ACCEPTED_TYPES = {
  "application/pdf": [".pdf"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "text/plain": [".txt"],
}

export function FileUpload({
  onChange,
  value,
  maxSize = 10 * 1024 * 1024,
  multiple = false,
  accept = ACCEPTED_TYPES,
  label = "Drag & drop or click to upload",
  helperText = "Supported: PDF, DOCX, TXT up to 10 MB",
}) {
  const handleDrop = useCallback(
    (acceptedFiles) => {
      if (!acceptedFiles.length) return
      onChange?.(multiple ? acceptedFiles : acceptedFiles[0])
    },
    [multiple, onChange]
  )

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop: handleDrop,
    maxSize,
    multiple,
    accept,
  })

  const files = Array.isArray(value) ? value : value ? [value] : []

  return (
    <div className="space-y-2">
      <div
        {...getRootProps()}
        className={cn(
          "glass-panel flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-dashed border-cyan-400/40 px-6 py-8 text-center transition hover:border-cyan-300/70",
          isDragActive && "border-cyan-200 bg-cyan-400/5"
        )}
      >
        <input {...getInputProps()} />
        <UploadCloud className="h-10 w-10 text-cyan-300" />
        <div>
          <p className="text-sm font-semibold text-cyan-50">{label}</p>
          <p className="text-xs text-muted-foreground">{helperText}</p>
        </div>
      </div>

      {!!files.length && (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.name}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-cyan-300" />
                <div>
                  <p className="font-medium text-foreground">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onChange?.(multiple ? [] : null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {!!fileRejections.length && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-xs text-red-200">
          {fileRejections[0].errors[0]?.message ?? "File rejected"}
        </div>
      )}
    </div>
  )
}

