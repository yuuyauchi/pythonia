import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ConsoleOutput {
  type: 'stdout' | 'stderr' | 'info';
  text: string;
  timestamp: number;
}

interface EditorState {
  currentFile: string;
  files: Record<string, string>;
  consoleOutput: ConsoleOutput[];
  isExecuting: boolean;

  setCurrentFile: (fileName: string) => void;
  getFileContent: (fileName: string) => string;
  updateFileContent: (fileName: string, content: string) => void;
  addConsoleOutput: (output: ConsoleOutput) => void;
  clearConsole: () => void;
  setIsExecuting: (isExecuting: boolean) => void;
  resetEditor: () => void;
}

const DEFAULT_MAIN_PY = `# Python コードを書いてみましょう！
# 実行ボタンを押すと、下のコンソールに結果が表示されます

print("Hello, Python!")
`;

const SAMPLE_HELLO_PY = `# サンプル: Hello World
print("Hello, World!")
print("Pythonへようこそ！")
`;

const SAMPLE_VARIABLE_PY = `# サンプル: 変数
name = "太郎"
age = 20

print(f"私の名前は{name}です")
print(f"年齢は{age}歳です")
`;

const DEFAULT_FILES = {
  'main.py': DEFAULT_MAIN_PY,
  'sample_hello.py': SAMPLE_HELLO_PY,
  'sample_variable.py': SAMPLE_VARIABLE_PY,
};

export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => ({
      currentFile: 'main.py',
      files: DEFAULT_FILES,
      consoleOutput: [],
      isExecuting: false,

      setCurrentFile: (fileName: string) => {
        set({ currentFile: fileName });
      },

      getFileContent: (fileName: string) => {
        const { files } = get();
        return files[fileName] || '';
      },

      updateFileContent: (fileName: string, content: string) => {
        // Only allow editing main.py
        if (fileName !== 'main.py') {
          console.warn(`Cannot edit ${fileName}. Only main.py is editable.`);
          return;
        }

        set((state) => ({
          files: {
            ...state.files,
            [fileName]: content,
          },
        }));
      },

      addConsoleOutput: (output: ConsoleOutput) => {
        set((state) => ({
          consoleOutput: [...state.consoleOutput, output],
        }));
      },

      clearConsole: () => {
        set({ consoleOutput: [] });
      },

      setIsExecuting: (isExecuting: boolean) => {
        set({ isExecuting });
      },

      resetEditor: () => {
        set({
          currentFile: 'main.py',
          files: DEFAULT_FILES,
          consoleOutput: [],
          isExecuting: false,
        });
      },
    }),
    {
      name: 'editor-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist files and currentFile, not console output
      partialize: (state) => ({
        currentFile: state.currentFile,
        files: state.files,
      }),
    }
  )
);
