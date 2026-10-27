import { createContext, useCallback, useContext, useRef, useState } from "react";
import { AlertTriangle } from "lucide-react";

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [options, setOptions] = useState(null);
  const resolver = useRef(null);

  // Returns a promise: true if the user confirms, false if they cancel
  const confirm = useCallback((opts = {}) => {
    return new Promise((resolve) => {
      resolver.current = resolve;
      setOptions(opts);
    });
  }, []);

  function close(result) {
    resolver.current?.(result);
    resolver.current = null;
    setOptions(null);
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {options && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          onClick={() => close(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-red-700" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center">
              {options.title || "Are you sure?"}
            </h3>
            {options.message && (
              <p className="text-sm text-gray-500 text-center mt-2">{options.message}</p>
            )}
            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                onClick={() => close(false)}
                className="border border-gray-200 rounded-xl py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => close(true)}
                className="bg-red-700 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-red-800"
              >
                {options.confirmText || "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  return useContext(ConfirmContext);
}