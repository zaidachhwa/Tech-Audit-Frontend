import { useRegisterSW } from "virtual:pwa-register/react";

export default function PwaUpdatePrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  if (!offlineReady && !needRefresh) return null;

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-[9999] w-80 max-w-[calc(100vw-2rem)] rounded-lg border border-slate-200 bg-white p-4 shadow-lg">
      <p className="text-sm text-slate-700">
        {needRefresh
          ? "A new version is available."
          : "App ready to work offline."}
      </p>
      <div className="mt-3 flex justify-end gap-2">
        {needRefresh && (
          <button
            onClick={() => updateServiceWorker(true)}
            className="rounded-md bg-slate-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700"
          >
            Reload
          </button>
        )}
        <button
          onClick={close}
          className="rounded-md px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
