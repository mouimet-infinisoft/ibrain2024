"use client";
import React from "react";
import FileExplorer from "./components/FileExplorer";
import { initialFileSystem } from "./mock/initialFileSystem";
import { useFileOperations } from "./hooks/useFileOperations";
import FileTabs from "./components/FileTabs";
import { Editors } from "./components/Editors";
import { SpeechToText } from "@/components/ui/speech-to-text";
import { sendMsg } from "./actions/send.message";


// Monaco Code Editor Page
const MonacoCodeEditorPage: React.FC = () => {
    const {
      fileSystem,
      openFiles,
      selectedFileId,
      setSelectedFileId,
      editorsRef,
      handleFileSelect,
      handleSaveFile,
      handleCloseFile,
      handleEditorChange,
      handleCreateFile,
      handleCreateFolder,
      handleDeleteFile,
      handleDeleteFolder,
    } = useFileOperations(initialFileSystem);
  
    const handleTranscript = async (transcript: string) => {
        await sendMsg(transcript)
        
        if (selectedFileId && editorsRef.current[selectedFileId]) {
          const editor = editorsRef.current[selectedFileId];
      
          let position = editor.getPosition();
      
          if (position && editor) {

      
          editor.executeEdits("speech-to-text", [
            { 
              range: { 
                startLineNumber: position.lineNumber, 
                startColumn: position.column, 
                endLineNumber: position.lineNumber, 
                endColumn: position.column 
              }, 
              text: transcript 
            },
          ]);
      
          if (position) {
            editor.setPosition({
              lineNumber: position.lineNumber,
              column: position.column + transcript.length,
            });
          }
      
          handleEditorChange(selectedFileId); // Make sure handleEditorChange is updated to take two arguments
      
          editor.focus();
        }
        } else {
          // Handle the case where no file is selected or the editor instance isn't available.
          // You might want to log a warning, display a message to the user, or take other appropriate action.
          console.warn("No file selected or editor not available.");
        }
      };
      


    return (
      <div className="flex h-screen">
        <FileExplorer
          fileSystem={fileSystem}
          openFiles={openFiles}
          selectedFileId={selectedFileId}
          onFileSelect={handleFileSelect}
          onCreateFile={handleCreateFile}
          onCreateFolder={handleCreateFolder}
          onDeleteFile={handleDeleteFile}
          onDeleteFolder={handleDeleteFolder}
        />
  
        <div className="flex-grow flex flex-col">
             <SpeechToText onTranscript={handleTranscript} />
          {/* File Tabs */}
          <FileTabs
            openFiles={openFiles}
            selectedFileId={selectedFileId}
            onFileSelect={handleFileSelect}
            onFileClose={handleCloseFile}
          />
  
          <Editors
            openFiles={openFiles}
            selectedFileId={selectedFileId}
            editorsRef={editorsRef}
            handleEditorChange={handleEditorChange}
            handleSaveFile={handleSaveFile}
          />
        </div>
      </div>
    );
  };
  
  export default MonacoCodeEditorPage;

