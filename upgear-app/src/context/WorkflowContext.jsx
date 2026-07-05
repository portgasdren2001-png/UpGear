import { createContext, useContext, useState, useCallback } from "react";

const WorkflowContext = createContext(null);

export const WORKFLOW_STEPS = [
  { id: "item",     label: "商品選択",     short: "商品",   page: "stock" },
  { id: "studio",   label: "制作スタジオ", short: "制作",   page: "script" },
  { id: "post",     label: "投稿保存",     short: "投稿",   page: "posts" },
  { id: "master",   label: "マスター更新", short: "更新",   page: "master" },
];

export function WorkflowProvider({ children, onNav }) {
  const [activeItemId, setActiveItemId] = useState(null);
  const [studioApply, setStudioApply] = useState(null);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  const completeStep = useCallback((stepId) => {
    setCompletedSteps((prev) => new Set([...prev, stepId]));
  }, []);

  const selectItem = useCallback((itemId) => {
    setActiveItemId(itemId);
    completeStep("item");
  }, [completeStep]);

  const goToStudio = useCallback((itemId, researchPayload) => {
    if (itemId) setActiveItemId(itemId);
    if (researchPayload) setStudioApply(researchPayload);
    onNav("script");
  }, [onNav]);

  const clearStudioApply = useCallback(() => setStudioApply(null), []);

  const resetWorkflow = useCallback(() => {
    setActiveItemId(null);
    setStudioApply(null);
    setCompletedSteps(new Set());
  }, []);

  return (
    <WorkflowContext.Provider value={{
      activeItemId, setActiveItemId,
      studioApply, clearStudioApply,
      completedSteps, completeStep,
      selectItem, goToStudio,
      resetWorkflow,
    }}>
      {children}
    </WorkflowContext.Provider>
  );
}

export function useWorkflow() {
  const ctx = useContext(WorkflowContext);
  if (!ctx) throw new Error("useWorkflow must be used within WorkflowProvider");
  return ctx;
}

export function WorkflowBar({ activePage, onNav }) {
  const { activeItemId, completedSteps } = useWorkflow();

  if (!activeItemId) return null;

  return (
    <div style={{
      position: "fixed", top: 0, right: 0, left: "var(--sidebar-w)",
      height: 36, background: "var(--bg2)", borderBottom: "1px solid var(--border)",
      display: "flex", alignItems: "center", padding: "0 16px", gap: 0,
      zIndex: 90, fontSize: 11, transition: "left 0.2s ease",
    }}>
      {WORKFLOW_STEPS.map((step, i) => {
        const done = completedSteps.has(step.id);
        const active = step.page === activePage;
        return (
          <div key={step.id} style={{ display: "flex", alignItems: "center" }}>
            <button
              onClick={() => onNav(step.page)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                padding: "4px 10px", fontSize: 11, fontFamily: "var(--font-mono)",
                color: active ? "var(--accent)" : done ? "var(--text)" : "var(--text-dim)",
                borderBottom: active ? "2px solid var(--accent)" : "2px solid transparent",
                transition: "color 0.15s",
              }}
            >
              {done && !active && <span style={{ marginRight: 4, color: "var(--accent)", fontSize: 9 }}>✓</span>}
              {step.short}
            </button>
            {i < WORKFLOW_STEPS.length - 1 && (
              <span style={{ color: "var(--border)", fontSize: 10 }}>›</span>
            )}
          </div>
        );
      })}
      <div style={{ flex: 1 }} />
      <span style={{ fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.08em" }}>
        ワークフロー進行中
      </span>
    </div>
  );
}
