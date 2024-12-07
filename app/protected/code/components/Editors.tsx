import { cn } from "@/lib/utils";
import { Editor } from "@monaco-editor/react";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@radix-ui/react-tooltip";
import { Save } from "lucide-react";
import { editor } from "monaco-editor";
import { FileSystemNode } from "../types";

interface EditorsProps {
    openFiles: FileSystemNode[];
    selectedFileId: string | null;
    editorsRef: React.MutableRefObject<Record<string, editor.IStandaloneCodeEditor | null>>;
    handleEditorChange: (fileId: string, value?: string | undefined) => void;
    handleSaveFile: (fileId: string) => void;
  }
  
  
  export const Editors: React.FC<EditorsProps> = ({
    openFiles,
    selectedFileId,
    editorsRef,
    handleEditorChange,
    handleSaveFile,
  }) => {
      // Configure Monaco editor options
      const editorOptions: editor.IStandaloneEditorConstructionOptions = {
        minimap: { enabled: false },
        fontSize: 14,
        automaticLayout: true,
        wordWrap: "on",
        scrollbar: {
          vertical: "auto",
          horizontal: "auto",
        },
      };
  
    return (
      <div className="flex-grow relative">
        {openFiles.map((file) => (
          <div
            key={file.id}
            className={cn(
              "absolute inset-0",
              selectedFileId === file.id ? "z-10" : "z-0 invisible"
            )}
          >
            <div className="flex justify-between items-center p-2 border-b">
              <h2 className="font-semibold">{file.name}</h2>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Save
                      className="text-primary hover:text-primary/80 cursor-pointer"
                      onClick={() => handleSaveFile(file.id)}
                    />
                  </TooltipTrigger>
                  <TooltipContent>Save File</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
  
            <Editor
              height="calc(80% - 40px)"
              theme="vs-dark"
              path={file.name}
              defaultLanguage={file.language || "typescript"}
              defaultValue={file.content || ""}
              options={editorOptions}
              onChange={(value) => handleEditorChange(file.id, value)}
              onMount={(editor, monaco) => {
                editorsRef.current[file.id] = editor;
              }}
            />
          </div>
        ))}
      </div>
    );
  };
  