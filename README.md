# Visual Pipeline Editor

A modern, interactive visual editor for building and validating Directed Acyclic Graphs (DAGs) using React, TypeScript, React Flow, and Tailwind CSS.

---

## 🚀 Setup Instructions

1. **Clone the repository:**

   ```bash
   git clone <your-repo-url>
   cd assignment
   ```
2. **Install dependencies:**

   ```bash
   npm install
   # or
   yarn install
   ```
3. **Start the development server:**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

   The app will be available at `http://localhost:5173` (or as indicated in your terminal).
4. **Build for production:**

   ```bash
   npm run build
   # or
   yarn build
   ```
5. **Lint the code:**

   ```bash
   npm run lint
   # or
   yarn lint
   ```

---

## 🛠️ Libraries & Key Decisions

- **React & TypeScript**: For robust, type-safe UI development.
- **Vite**: Fast build tool and dev server.
- **React Flow**: Provides the interactive graph editor, node/edge management, and extensibility for custom logic.
- **Tailwind CSS**: Utility-first CSS framework for rapid, consistent styling. All custom CSS was migrated to Tailwind classes for maintainability.
- **Dagre**: Used for automatic graph layout (auto-arrange nodes).
- **Lucide React**: For modern, consistent iconography.

**Decisions:**

- All component styling is handled via Tailwind CSS classes in JSX, eliminating the need for separate CSS files.
- DAG validation (cycle detection, connectivity) is implemented in a dedicated utility (`src/lib/dagUtils.ts`) for clarity and testability.
- The UI is modular, with reusable components for nodes, edges, and buttons.
- **Undo support** is implemented by maintaining a history stack of graph states, allowing users to revert changes.
- **Auto-fit after layout**: After running auto-layout, the view automatically zooms to fit all elements using React Flow's `useReactFlow().fitView()`.
- The context menu only supports node deletion (the Connect option was removed for clarity and simplicity).

---

## Demo Video
- [Screen recording link](https://drive.google.com/file/d/12Rhdy1gCN8D-v7QjTKvmRglRcTEcEP25/view?usp=sharing/)

## Hosted link
- [Vercel Hosted link](https://nextem-assignment.vercel.app/)
---

## 💡 Challenges Faced & Solutions

### 1. **DAG Validation Logic**

- **Challenge:** Ensuring the graph is always a valid DAG (no cycles, all nodes connected, no self-loops).
- **Solution:** Implemented a custom validation utility using depth-first search (DFS) for cycle detection and connectivity checks. This logic is in `src/lib/dagUtils.ts`.
- **References:**
  - [React Flow Documentation](https://reactflow.dev/docs/)
  - [DAG Concepts](https://en.wikipedia.org/wiki/Directed_acyclic_graph)
  - [GPT-4](https://chat.openai.com/) was used for brainstorming and refining the validation approach.

### 2. **Styling Migration to Tailwind CSS**

- **Challenge:** Migrating from traditional CSS files to Tailwind utility classes while preserving the design and responsiveness.
- **Solution:** Carefully mapped each CSS rule to its Tailwind equivalent, leveraging Tailwind's utility classes for layout, spacing, color, and typography. This improved maintainability and consistency.

### 3. **React Flow Customization & API Usage**

- **Challenge:** Integrating custom node and edge components, handling context menus, auto-layout, and zoom-to-fit.
- **Solution:**
  - Used React Flow's extensibility to define custom node/edge renderers and context menu logic.
  - Used Dagre for auto-layout.
  - Used the `useReactFlow` hook to access the imperative `fitView()` method for zoom-to-fit after layout, as direct refs do not provide this in React Flow v11+.
  - Removed the unused Connect context menu action for a cleaner UX.

### 4. **Undo/Redo State Management**

- **Challenge:** Allowing users to undo changes to the graph (nodes/edges/layout).
- **Solution:** Implemented a history stack that stores previous states. On undo, the last state is restored, providing a simple but effective undo feature.

### 5. **TypeScript Integration**

- **Challenge:** Ensuring type safety across all components, especially with third-party libraries.
- **Solution:** Leveraged types from React Flow and strict TypeScript settings in `tsconfig.json` and `tsconfig.app.json`.

---

## 📚 References

- [React Flow Documentation](https://reactflow.dev/docs/)
- [Dagre Layout Library](https://github.com/dagrejs/dagre)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs/)
- [Vite Documentation](https://vitejs.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [OpenAI GPT-4](https://chat.openai.com/) (for brainstorming and code review)

---

## 📄 License

[MIT](./LICENSE) (add a LICENSE file if needed)
