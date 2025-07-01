type StatusBarProps = { status: string };

export function StatusBar({ status }: StatusBarProps) {
    const isValid = status.toLowerCase().startsWith("valid");
    return (
        <div
            className={`text-center mt-2 px-4 py-3 rounded-lg text-base font-medium sticky top-14 z-20 max-w-md w-full border border-gray-200 bg-slate-100 ${isValid ? "text-slate-900" : "text-red-600"
                }`}
        >
            {status}
        </div>
    );
} 